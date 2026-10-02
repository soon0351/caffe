// Cart interaction functionality for Stephan Caffe
const CART_STORAGE_KEY = 'stephan_caffe_cart_count';

function getStoredCartCount() {
  const count = parseInt(localStorage.getItem(CART_STORAGE_KEY), 10);
  return isNaN(count) || count < 0 ? 0 : count;
}

function updateCartCount(count) {
  localStorage.setItem(CART_STORAGE_KEY, count.toString());
  renderCartBadges(count);
}

function renderCartBadges(count) {
  const countTextEls = document.querySelectorAll('.cart-count-val');
  countTextEls.forEach(el => {
    el.textContent = count;
  });

  const badgeEls = document.querySelectorAll('.cart-badge');
  badgeEls.forEach(badge => {
    badge.textContent = count;
    badge.classList.remove('badge-pop');
    void badge.offsetWidth; // trigger reflow
    badge.classList.add('badge-pop');
    setTimeout(() => badge.classList.remove('badge-pop'), 250);
  });
}

function showCartToast(message = '☕ 장바구니에 상품이 담겼습니다!') {
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = 'cart-toast';
  toast.setAttribute('role', 'alert');
  toast.innerHTML = `<span class="toast-text">${message}</span>`;
  toastContainer.appendChild(toast);

  // Trigger enter animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  // Automatically hide after 2 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    toast.classList.add('hide');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 2000);
}

function initCart() {
  // Initial load from localStorage
  const currentCount = getStoredCartCount();
  renderCartBadges(currentCount);

  // Delegate click for all "Add to Cart" buttons
  document.addEventListener('click', function(e) {
    const target = e.target.closest('.add-to-cart-btn, [data-action="add-to-cart"], button, a');
    if (!target) return;

    const text = (target.textContent || '').trim().toLowerCase();
    const isAddToCart = target.classList.contains('add-to-cart-btn') ||
                        target.getAttribute('data-action') === 'add-to-cart' ||
                        text.includes('add to cart');

    if (isAddToCart) {
      e.preventDefault();
      const newCount = getStoredCartCount() + 1;
      updateCartCount(newCount);
      showCartToast('☕ 장바구니에 상품이 담겼습니다!');
    }
  });

  // Listen for reset cart if requested
  const resetBtn = document.getElementById('reset-cart-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      updateCartCount(0);
      showCartToast('장바구니가 비워졌습니다.');
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCart);
} else {
  initCart();
}
