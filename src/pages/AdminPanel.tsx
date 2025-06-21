import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import { auth, db, getAdminConfig } from '../firebase';
import Toast from '../components/Toast';

interface Question {
  id: number;
  question: string;
  options: string[];
  answer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export default function AdminPanel() {
  const [user] = useAuthState(auth);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);

  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);

  const [view, setView] = useState<'classes' | 'subjects' | 'lessons'>('classes');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');

  const [newItem, setNewItem] = useState('');
  const [toast, setToast] = useState('');

  const navigate = useNavigate();

  const showToast = (msg: string) => setToast(msg);

  useEffect(() => {
    getAdminConfig().then(cfg => setAdminEmail(cfg?.email ?? null));
  }, []);

  useEffect(() => {
    if (user) loadClasses();
  }, [user]);

  async function loadClasses() {
    const snap = await getDocs(collection(db, 'classes'));
    setClasses(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
  }

  async function loadSubjects(cls: string) {
    const snap = await getDocs(collection(db, 'classes', cls, 'subjects'));
    setSubjects(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
  }

  async function loadLessons(cls: string, sub: string) {
    const snap = await getDocs(collection(db, 'classes', cls, 'subjects', sub, 'lessons'));
    setLessons(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
  }

  const addItem = async () => {
    const name = newItem.trim();
    if (!name) return;
    if (view === 'classes') {
      await setDoc(doc(db, 'classes', name), { name });
      loadClasses();
    } else if (view === 'subjects') {
      await setDoc(doc(db, 'classes', selectedClass, 'subjects', name), { name });
      loadSubjects(selectedClass);
    } else {
      await setDoc(
        doc(db, 'classes', selectedClass, 'subjects', selectedSubject, 'lessons', name),
        { name }
      );
      loadLessons(selectedClass, selectedSubject);
    }
    setNewItem('');
  };

  const modifyItem = async (id: string) => {
    const name = prompt('New name?');
    if (!name) return;
    if (view === 'classes') {
      await updateDoc(doc(db, 'classes', id), { name });
      loadClasses();
    } else if (view === 'subjects') {
      await updateDoc(doc(db, 'classes', selectedClass, 'subjects', id), { name });
      loadSubjects(selectedClass);
    } else {
      await updateDoc(
        doc(db, 'classes', selectedClass, 'subjects', selectedSubject, 'lessons', id),
        { name }
      );
      loadLessons(selectedClass, selectedSubject);
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Delete?')) return;
    if (view === 'classes') {
      await deleteDoc(doc(db, 'classes', id));
      loadClasses();
    } else if (view === 'subjects') {
      await deleteDoc(doc(db, 'classes', selectedClass, 'subjects', id));
      loadSubjects(selectedClass);
    } else {
      await deleteDoc(
        doc(db, 'classes', selectedClass, 'subjects', selectedSubject, 'lessons', id)
      );
      loadLessons(selectedClass, selectedSubject);
    }
  };

  const goToSubjects = (id: string) => {
    setSelectedClass(id);
    loadSubjects(id);
    setView('subjects');
  };

  const goToLessons = (id: string) => {
    setSelectedSubject(id);
    loadLessons(selectedClass, id);
    setView('lessons');
  };

  const validateQuestion = (q: Question) => {
    return (
      typeof q.id === 'number' &&
      typeof q.question === 'string' &&
      Array.isArray(q.options) &&
      q.options.length > 0 &&
      typeof q.answer === 'string' &&
      typeof q.explanation === 'string' &&
      ['easy', 'medium', 'hard'].includes(q.difficulty)
    );
  };

  const handleUpload = async (lessonId: string, file: File | null) => {
    if (!file) return showToast('No file selected');
    let parsed: unknown;
    try {
      parsed = JSON.parse(await file.text());
    } catch (e) {
      return showToast('Invalid JSON');
    }
    if (!Array.isArray(parsed)) return showToast('File should be an array');
    const qs = parsed as Question[];
    for (const q of qs) {
      if (!validateQuestion(q)) return showToast('Invalid question schema');
    }
    const batch = writeBatch(db);
    qs.forEach(q => {
      const ref = doc(
        collection(
          db,
          'classes',
          selectedClass,
          'subjects',
          selectedSubject,
          'lessons',
          lessonId,
          'questions'
        )
      );
      batch.set(ref, q);
    });
    await batch.commit();
    showToast('Questions uploaded');
  };

  if (!user) return null;
  if (adminEmail && user.email !== adminEmail) {
    return <div className="p-4">Unauthorized</div>;
  }

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">Admin Panel</h1>
      {view !== 'classes' && (
        <button className="underline" onClick={() => {
          if (view === 'lessons') {
            setView('subjects');
          } else {
            setView('classes');
          }
        }}>Back</button>
      )}
      <div className="space-x-2">
        <input
          className="border p-2 rounded"
          type="text"
          placeholder={`New ${view.slice(0, -1)}`}
          value={newItem}
          onChange={e => setNewItem(e.target.value)}
        />
        <button onClick={addItem} className="bg-blue-500 text-white px-4 py-2 rounded">
          Add
        </button>
      </div>
      {view === 'classes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {classes.map(c => (
            <div key={c.id} className="border p-2 flex justify-between items-center">
              <Link to="#" onClick={() => goToSubjects(c.id)} className="text-blue-600 underline">
                {c.name || c.id}
              </Link>
              <div className="space-x-2 text-sm">
                <button onClick={() => modifyItem(c.id)} className="text-green-700">Modify</button>
                <button onClick={() => deleteItem(c.id)} className="text-red-600">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {view === 'subjects' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {subjects.map(s => (
            <div key={s.id} className="border p-2 flex justify-between items-center">
              <Link to="#" onClick={() => goToLessons(s.id)} className="text-blue-600 underline">
                {s.name || s.id}
              </Link>
              <div className="space-x-2 text-sm">
                <button onClick={() => modifyItem(s.id)} className="text-green-700">Modify</button>
                <button onClick={() => deleteItem(s.id)} className="text-red-600">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {view === 'lessons' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {lessons.map(l => (
            <div key={l.id} className="border p-2 space-y-2">
              <div className="flex justify-between items-center">
                <span>{l.name || l.id}</span>
                <div className="space-x-2 text-sm">
                  <button onClick={() => modifyItem(l.id)} className="text-green-700">Modify</button>
                  <button onClick={() => deleteItem(l.id)} className="text-red-600">Delete</button>
                </div>
              </div>
              <div>
                <input
                  type="file"
                  accept="application/json"
                  onChange={e => handleUpload(l.id, e.target.files ? e.target.files[0] : null)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
      <button onClick={() => navigate("/dashboard")} className="underline">
        Back to Dashboard
      </button>
      <Toast message={toast} show={!!toast} onClose={() => setToast('')} />
    </div>
  );
}
