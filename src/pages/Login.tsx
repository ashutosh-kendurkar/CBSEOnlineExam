import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, signInWithGoogle, checkPreviewAccess, signOutUser } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async user => {
      if (user) {
        const ok = await checkPreviewAccess(user.email || '');
        if (ok) {
          navigate('/dashboard');
        } else {
          await signOutUser();
          alert('Preview access expired or not granted');
        }
      }
    });
    return unsub;
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <button
        onClick={signInWithGoogle}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Sign in with Google
      </button>
    </div>
  );
}
