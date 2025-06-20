import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db, getAdminConfig } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function AdminPanel() {
  const [user] = useAuthState(auth);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [className, setClassName] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    getAdminConfig().then((cfg) => setAdminEmail(cfg?.email ?? null));
  }, []);

  if (!user) return null;
  if (adminEmail && user.email !== adminEmail) {
    return <div className="p-4">Unauthorized</div>;
  }

  const handleAddClass = async () => {
    if (!className) return;
    await setDoc(doc(db, 'classes', className), { name: className });
    setSelectedClass(className);
    setClassName('');
  };

  const handleAddSubject = async () => {
    if (!selectedClass || !subjectName) return;
    await setDoc(doc(db, 'classes', selectedClass, 'subjects', subjectName), {
      name: subjectName,
    });
    setSubjectName('');
  };

  const handleUpload = async () => {
    if (!file || !selectedClass || !subjectName) return;
    const text = await file.text();
    const questions = JSON.parse(text);
    await setDoc(doc(db, 'classes', selectedClass, 'subjects', subjectName), {
      name: subjectName,
      questions,
    });
    setFile(null);
    alert('Question bank uploaded');
  };

  return (
    <div className="p-4 space-y-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold">Admin Panel</h1>

      <div>
        <input
          className="border p-2 mr-2"
          type="text"
          placeholder="Class (e.g. 5)"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
        />
        <button
          onClick={handleAddClass}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Class
        </button>
      </div>

      <div>
        <input
          className="border p-2 mr-2"
          type="text"
          placeholder="Class"
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
        />
        <input
          className="border p-2 mr-2"
          type="text"
          placeholder="Subject"
          value={subjectName}
          onChange={(e) => setSubjectName(e.target.value)}
        />
        <button
          onClick={handleAddSubject}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Subject
        </button>
      </div>

      <div>
        <input
          type="file"
          accept="application/json"
          onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
          className="mb-2"
        />
        <button
          onClick={handleUpload}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Upload Question Bank
        </button>
      </div>

      <button onClick={() => navigate('/dashboard')} className="underline">
        Back to Dashboard
      </button>
    </div>
  );
}
