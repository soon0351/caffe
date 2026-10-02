import { 
  auth, 
  loginWithEmail, 
  signupWithEmail, 
  loginWithGoogle, 
  logoutUser, 
  onAuthStateChanged,
  type User 
} from './firebase';

export function setupAuthUI() {
  const loginModal = document.getElementById('login-modal');
  const signupModal = document.getElementById('signup-modal');
  const headerActions = document.querySelector('.header-actions');

  function showToast(message: string) {
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      toastContainer.className = 'toast-container';
      document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = 'cart-toast show';
    toast.style.borderLeftColor = 'var(--terracotta)';
    toast.innerHTML = `<span class="toast-text">${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.remove('show');
      toast.classList.add('hide');
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

  function closeModal() {
    window.location.hash = '';
  }

  // Handle Auth state changes
  onAuthStateChanged(auth, (user: User | null) => {
    updateHeaderUserUI(user);
  });

  function updateHeaderUserUI(user: User | null) {
    let authContainer = document.getElementById('header-auth-box');
    if (!authContainer && headerActions) {
      authContainer = document.createElement('div');
      authContainer.id = 'header-auth-box';
      authContainer.style.display = 'inline-flex';
      authContainer.style.alignItems = 'center';
      headerActions.appendChild(authContainer);
    }

    // Hide old login-btn if present
    const defaultLoginBtn = document.querySelector('.header-actions > .login-btn:not(#header-user-btn)') as HTMLElement;
    if (defaultLoginBtn) {
      defaultLoginBtn.style.display = user ? 'none' : 'inline-flex';
    }

    if (!authContainer) return;

    if (user) {
      const displayName = user.displayName || user.email?.split('@')[0] || '회원';
      authContainer.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="display: flex; align-items: center; gap: 6px; font-size: 0.88rem; font-weight: 600; color: var(--charcoal); background-color: var(--white); border: 1px solid var(--border-color); padding: 8px 12px; border-radius: 4px;">
            <i class="fa-solid fa-circle-user" style="color: var(--terracotta);"></i>
            <span>${displayName}님</span>
          </div>
          <button id="header-logout-btn" type="button" class="login-btn" style="padding: 8px 12px; font-size: 0.82rem; cursor: pointer; border-color: var(--muted-gray); color: var(--muted-gray);">
            로그아웃
          </button>
        </div>
      `;

      const logoutBtn = document.getElementById('header-logout-btn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
          try {
            await logoutUser();
            showToast('로그아웃되었습니다.');
          } catch (err: any) {
            showToast('로그아웃 중 오류가 발생했습니다.');
          }
        });
      }
    } else {
      authContainer.innerHTML = '';
    }
  }

  // Email Login Form
  const loginForm = document.getElementById('login-form-element') as HTMLFormElement;
  const loginErrorMsg = document.getElementById('login-error-msg');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('login-email-input') as HTMLInputElement;
      const passInput = document.getElementById('login-password-input') as HTMLInputElement;
      const submitBtn = document.getElementById('login-submit-btn') as HTMLButtonElement;

      if (!emailInput || !passInput) return;
      const email = emailInput.value.trim();
      const pass = passInput.value;

      if (!email || !pass) {
        if (loginErrorMsg) loginErrorMsg.textContent = '이메일과 비밀번호를 모두 입력해주세요.';
        return;
      }

      try {
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = '로그인 중...';
        }
        if (loginErrorMsg) loginErrorMsg.textContent = '';
        
        const user = await loginWithEmail(email, pass);
        const name = user.displayName || user.email?.split('@')[0] || '고객';
        closeModal();
        showToast(`☕ ${name}님 환영합니다!`);
        loginForm.reset();
      } catch (err: any) {
        console.error('Login error:', err);
        let msg = '로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.';
        if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
          msg = '이메일 또는 비밀번호가 일치하지 않습니다.';
        } else if (err.code === 'auth/invalid-email') {
          msg = '올바른 이메일 형식이 아닙니다.';
        }
        if (loginErrorMsg) loginErrorMsg.textContent = msg;
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = '로그인';
        }
      }
    });
  }

  // Email Signup Form
  const signupForm = document.getElementById('signup-form-element') as HTMLFormElement;
  const signupErrorMsg = document.getElementById('signup-error-msg');
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('signup-name-input') as HTMLInputElement;
      const emailInput = document.getElementById('signup-email-input') as HTMLInputElement;
      const passInput = document.getElementById('signup-password-input') as HTMLInputElement;
      const passConfirmInput = document.getElementById('signup-password-confirm-input') as HTMLInputElement;
      const submitBtn = document.getElementById('signup-submit-btn') as HTMLButtonElement;

      if (!emailInput || !passInput || !passConfirmInput) return;
      const name = nameInput ? nameInput.value.trim() : '';
      const email = emailInput.value.trim();
      const pass = passInput.value;
      const passConfirm = passConfirmInput.value;

      if (!email || !pass) {
        if (signupErrorMsg) signupErrorMsg.textContent = '필수 항목을 모두 입력해주세요.';
        return;
      }

      if (pass.length < 6) {
        if (signupErrorMsg) signupErrorMsg.textContent = '비밀번호는 최소 6자 이상이어야 합니다.';
        return;
      }

      if (pass !== passConfirm) {
        if (signupErrorMsg) signupErrorMsg.textContent = '비밀번호가 일치하지 않습니다.';
        return;
      }

      try {
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = '가입 처리 중...';
        }
        if (signupErrorMsg) signupErrorMsg.textContent = '';

        await signupWithEmail(email, pass, name);
        closeModal();
        showToast('🎉 회원가입이 완료되었습니다! 환영합니다.');
        signupForm.reset();
      } catch (err: any) {
        console.error('Signup error:', err);
        let msg = '회원가입에 실패했습니다.';
        if (err.code === 'auth/email-already-in-use') {
          msg = '이미 가입된 이메일 계정입니다. 로그인해주세요.';
        } else if (err.code === 'auth/invalid-email') {
          msg = '올바른 이메일 형식이 아닙니다.';
        } else if (err.code === 'auth/weak-password') {
          msg = '비밀번호가 너무 취약합니다. 6자 이상 입력해주세요.';
        }
        if (signupErrorMsg) signupErrorMsg.textContent = msg;
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = '회원가입 완료';
        }
      }
    });
  }

  // Google Login Buttons
  const googleLoginBtns = document.querySelectorAll('.btn-google-auth');
  googleLoginBtns.forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        const user = await loginWithGoogle();
        closeModal();
        const name = user.displayName || '고객';
        showToast(`☕ Google 계정으로 로그인되었습니다 (${name}님)`);
      } catch (err: any) {
        console.error('Google auth error:', err);
        if (err.code !== 'auth/popup-closed-by-user') {
          showToast('Google 로그인 중 오류가 발생했습니다.');
        }
      }
    });
  });
}
