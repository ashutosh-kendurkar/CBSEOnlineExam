import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  Timestamp,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);

export async function signInWithGoogle() {
  await signInWithPopup(auth, provider);
}

export async function signOutUser() {
  await signOut(auth);
}

export async function getAdminConfig() {
  const snap = await getDoc(doc(db, 'roles', 'admin'));
  return snap.exists() ? (snap.data() as { email: string; route: string }) : null;
}

export async function checkPreviewAccess(email: string) {
  const snap = await getDoc(doc(db, 'preview_users', email));
  if (!snap.exists()) return false;
  const data = snap.data() as { allowed: boolean; expiresAt: Timestamp };
  return (
    data.allowed &&
    data.expiresAt.toMillis() > Date.now()
  );
}

export async function addPreviewUser(email: string, expiresAt: Date) {
  await setDoc(doc(db, 'preview_users', email), {
    userEmail: email,
    allowed: true,
    expiresAt: Timestamp.fromDate(expiresAt),
  });
}
