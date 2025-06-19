import { useNavigate } from 'react-router-dom';
import { signOutUser } from '../firebase';
import { auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user] = useAuthState(auth);

  if (!user) return null;

  return (
    <div className="p-4 space-y-4 max-w-xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Welcome, {user.displayName}</h1>
        <button onClick={() => signOutUser()} className="text-sm underline">Logout</button>
      </div>
      <div className="bg-green-100 p-4 rounded">
        "Success is not final; failure is not fatal: It is the courage to continue that counts." – Winston Churchill
      </div>
      <button
        className="block w-full bg-blue-500 text-white py-2 rounded"
        onClick={() => navigate('/exam')}
      >
        Start New Exam
      </button>
      <button
        className="block w-full bg-gray-500 text-white py-2 rounded"
        onClick={() => navigate('/reports')}
      >
        View Past Reports
      </button>
    </div>
  );
}
