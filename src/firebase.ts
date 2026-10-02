import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  type User
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Connection test as required by Firebase guidelines
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

export async function loginWithEmail(email: string, pass: string): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email, pass);
  return cred.user;
}

export async function signupWithEmail(email: string, pass: string, name?: string): Promise<User> {
  const cred = await createUserWithEmailAndPassword(auth, email, pass);
  if (name && cred.user) {
    await updateProfile(cred.user, { displayName: name });
  }
  // Store user record in Firestore
  try {
    await setDoc(doc(db, 'users', cred.user.uid), {
      id: cred.user.uid,
      email: cred.user.email || email,
      displayName: name || cred.user.displayName || email.split('@')[0],
      createdAt: new Date().toISOString()
    }, { merge: true });
  } catch (e) {
    console.warn('Failed to save user doc to Firestore:', e);
  }
  return cred.user;
}

export async function loginWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  const cred = await signInWithPopup(auth, provider);
  // Store or update user record in Firestore
  try {
    await setDoc(doc(db, 'users', cred.user.uid), {
      id: cred.user.uid,
      email: cred.user.email,
      displayName: cred.user.displayName || 'Guest',
      createdAt: new Date().toISOString()
    }, { merge: true });
  } catch (e) {
    console.warn('Failed to save Google user doc to Firestore:', e);
  }
  return cred.user;
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

export { onAuthStateChanged };
export type { User };
