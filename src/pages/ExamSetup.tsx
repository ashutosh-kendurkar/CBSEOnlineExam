import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';

export default function ExamSetup() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedLessons, setSelectedLessons] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadSubjects() {
      const snap = await getDocs(collection(db, 'classes', '6', 'subjects'));
      setSubjects(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
    }
    loadSubjects();
  }, []);

  useEffect(() => {
    async function loadLessons() {
      if (!selectedSubject) return;
      const snap = await getDocs(
        collection(db, 'classes', '6', 'subjects', selectedSubject, 'lessons')
      );
      setLessons(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
    }
    loadLessons();
  }, [selectedSubject]);

  const toggleLesson = (id: string) => {
    setSelectedLessons(ls =>
      ls.includes(id) ? ls.filter(l => l !== id) : [...ls, id]
    );
  };

  const start = () => {
    const params = new URLSearchParams();
    params.set('subject', selectedSubject);
    if (selectedLessons.length > 0 && selectedLessons.length !== lessons.length) {
      params.set('lessons', selectedLessons.join(','));
    }
    navigate(`/exam?${params.toString()}`);
  };

  return (
    <div className="p-4 space-y-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold">New Exam</h1>
      <div>
        <label className="block mb-1">Subject</label>
        <select
          className="border p-2 rounded w-full"
          value={selectedSubject}
          onChange={e => {
            setSelectedSubject(e.target.value);
            setSelectedLessons([]);
          }}
        >
          <option value="" disabled>
            Select subject
          </option>
          {subjects.map(s => (
            <option key={s.id} value={s.id}>
              {s.name || s.id}
            </option>
          ))}
        </select>
      </div>
      {selectedSubject && (
        <div>
          <p className="mb-1">Select Lessons (leave empty for all)</p>
          {lessons.map(l => (
            <label key={l.id} className="block">
              <input
                type="checkbox"
                className="mr-2"
                checked={selectedLessons.includes(l.id)}
                onChange={() => toggleLesson(l.id)}
              />
              {l.name || l.id}
            </label>
          ))}
        </div>
      )}
      <button
        disabled={!selectedSubject}
        onClick={start}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Start Exam
      </button>
      <button onClick={() => navigate('/dashboard')} className="underline block">
        Cancel
      </button>
    </div>
  );
}
