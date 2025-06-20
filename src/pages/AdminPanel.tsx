import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  addDoc,
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
  const [classes, setClasses] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [newClass, setNewClass] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [toast, setToast] = useState('');
  const [newQ, setNewQ] = useState({
    question: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    answer: '',
    explanation: '',
    difficulty: 'easy',
  });
  const navigate = useNavigate();

  function showToast(msg: string) {
    setToast(msg);
  }

  useEffect(() => {
    getAdminConfig().then((cfg) => setAdminEmail(cfg?.email ?? null));
  }, []);

  useEffect(() => {
    if (user) loadClasses();
  }, [user]);

  async function loadClasses() {
    const snap = await getDocs(collection(db, 'classes'));
    setClasses(snap.docs.map((d) => d.id));
  }

  async function loadSubjects(cls: string) {
    const snap = await getDocs(collection(db, 'classes', cls, 'subjects'));
    setSubjects(snap.docs.map((d) => d.id));
  }

  async function loadQuestions(cls: string, sub: string) {
    const snap = await getDocs(
      collection(db, 'classes', cls, 'subjects', sub, 'questions')
    );
    setQuestions(snap.docs.map((d) => d.data() as Question));
  }

  useEffect(() => {
    if (selectedClass) {
      loadSubjects(selectedClass);
      setSelectedSubject('');
      setQuestions([]);
    }
  }, [selectedClass]);

  useEffect(() => {
    if (selectedClass && selectedSubject) {
      loadQuestions(selectedClass, selectedSubject);
    }
  }, [selectedSubject]);

  const handleAddClass = async () => {
    const name = newClass.trim();
    if (!name) return showToast('Class name required');
    if (classes.includes(name)) return showToast('Class already exists');
    await setDoc(doc(db, 'classes', name), { name });
    setNewClass('');
    loadClasses();
    showToast('Class added');
  };

  const handleAddSubject = async () => {
    const name = newSubject.trim();
    if (!selectedClass) return showToast('Select a class first');
    if (!name) return showToast('Subject name required');
    if (subjects.includes(name)) return showToast('Subject already exists');
    await setDoc(doc(db, 'classes', selectedClass, 'subjects', name), { name });
    setNewSubject('');
    loadSubjects(selectedClass);
    showToast('Subject added');
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

  const handleUpload = async () => {
    if (!file) return showToast('No file selected');
    if (!selectedClass || !selectedSubject)
      return showToast('Select class and subject');
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
    qs.forEach((q) => {
      const ref = doc(
        collection(db, 'classes', selectedClass, 'subjects', selectedSubject, 'questions')
      );
      batch.set(ref, q);
    });
    await batch.commit();
    setFile(null);
    loadQuestions(selectedClass, selectedSubject);
    showToast('Questions uploaded');
  };

  const handleAddQuestion = async () => {
    if (!selectedClass || !selectedSubject)
      return showToast('Select class and subject');
    const opts = [newQ.optionA, newQ.optionB, newQ.optionC, newQ.optionD].map((o) => o.trim()).filter(Boolean);
    if (!newQ.question.trim() || opts.length < 2 || !newQ.answer.trim())
      return showToast('Please fill all fields');
    if (!opts.includes(newQ.answer))
      return showToast('Answer must match one option');
    const q: Question = {
      id: Date.now(),
      question: newQ.question,
      options: opts,
      answer: newQ.answer,
      explanation: newQ.explanation,
      difficulty: newQ.difficulty as 'easy' | 'medium' | 'hard',
    };
    await addDoc(
      collection(db, 'classes', selectedClass, 'subjects', selectedSubject, 'questions'),
      q
    );
    setNewQ({
      question: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      answer: '',
      explanation: '',
      difficulty: 'easy',
    });
    loadQuestions(selectedClass, selectedSubject);
    showToast('Question added');
  };

  if (!user) return null;
  if (adminEmail && user.email !== adminEmail) {
    return <div className="p-4">Unauthorized</div>;
  }

  return (
    <div className="p-4 space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">Admin Panel</h1>

      <div className="space-x-2">
        <input
          className="border p-2 rounded"
          type="text"
          placeholder="New class name"
          value={newClass}
          onChange={(e) => setNewClass(e.target.value)}
        />
        <button
          onClick={handleAddClass}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Class
        </button>
      </div>

      <div className="space-x-2">
        <select
          className="border p-2 rounded"
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
        >
          <option value="">Select Class</option>
          {classes.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          className="border p-2 rounded"
          type="text"
          placeholder="New subject"
          value={newSubject}
          onChange={(e) => setNewSubject(e.target.value)}
        />
        <button
          onClick={handleAddSubject}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Subject
        </button>
      </div>

      {selectedClass && (
        <div className="space-x-2">
          <select
            className="border p-2 rounded"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            <option value="">Select Subject</option>
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedSubject && (
        <div className="space-y-4">
          <div className="border p-4 rounded space-y-2">
            <h2 className="font-semibold">Upload Questions</h2>
            <input
              type="file"
              accept="application/json"
              onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
              className="block"
            />
            <button
              onClick={handleUpload}
              className="bg-green-500 text-white px-4 py-2 rounded mt-2"
            >
              Upload
            </button>
          </div>

          <div className="border p-4 rounded space-y-2">
            <h2 className="font-semibold">Add Question</h2>
            <input
              className="border p-2 rounded w-full"
              placeholder="Question"
              value={newQ.question}
              onChange={(e) => setNewQ({ ...newQ, question: e.target.value })}
            />
            <input
              className="border p-2 rounded w-full"
              placeholder="Option A"
              value={newQ.optionA}
              onChange={(e) => setNewQ({ ...newQ, optionA: e.target.value })}
            />
            <input
              className="border p-2 rounded w-full"
              placeholder="Option B"
              value={newQ.optionB}
              onChange={(e) => setNewQ({ ...newQ, optionB: e.target.value })}
            />
            <input
              className="border p-2 rounded w-full"
              placeholder="Option C"
              value={newQ.optionC}
              onChange={(e) => setNewQ({ ...newQ, optionC: e.target.value })}
            />
            <input
              className="border p-2 rounded w-full"
              placeholder="Option D"
              value={newQ.optionD}
              onChange={(e) => setNewQ({ ...newQ, optionD: e.target.value })}
            />
            <input
              className="border p-2 rounded w-full"
              placeholder="Correct Answer"
              value={newQ.answer}
              onChange={(e) => setNewQ({ ...newQ, answer: e.target.value })}
            />
            <input
              className="border p-2 rounded w-full"
              placeholder="Explanation"
              value={newQ.explanation}
              onChange={(e) => setNewQ({ ...newQ, explanation: e.target.value })}
            />
            <select
              className="border p-2 rounded w-full"
              value={newQ.difficulty}
              onChange={(e) =>
                setNewQ({ ...newQ, difficulty: e.target.value })
              }
            >
              <option value="easy">easy</option>
              <option value="medium">medium</option>
              <option value="hard">hard</option>
            </select>
            <button
              onClick={handleAddQuestion}
              className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
            >
              Add Question
            </button>
          </div>
        </div>
      )}

      {questions.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Questions</h2>
          {questions.map((q, idx) => (
            <details key={idx} className="border rounded">
              <summary className="cursor-pointer p-2">
                {q.question}
              </summary>
              <div className="p-2 space-y-1">
                {q.options.map((o) => (
                  <div key={o}>• {o}</div>
                ))}
                <div className="text-green-700 font-semibold">Answer: {q.answer}</div>
                <div className="text-sm italic">{q.explanation}</div>
              </div>
            </details>
          ))}
        </div>
      )}

      <button onClick={() => navigate('/dashboard')} className="underline">
        Back to Dashboard
      </button>

      <Toast message={toast} show={!!toast} onClose={() => setToast('')} />
    </div>
  );
}
