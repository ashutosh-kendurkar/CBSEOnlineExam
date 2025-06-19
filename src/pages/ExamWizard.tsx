import { useState } from 'react';
import questions from '../data/magnets.json';
import QuestionCard from '../components/QuestionCard';
import { saveReport } from '../utils/storage';
import { v4 as uuid } from 'uuid';
import { useNavigate } from 'react-router-dom';

export default function ExamWizard() {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const total = 10;
  const examQs = questions.slice(0, total);
  const currentQ = examQs[current];

  const handleSelect = (option: string) => {
    setAnswers({ ...answers, [current]: option });
  };

  const next = () => setCurrent(c => Math.min(c + 1, total - 1));
  const prev = () => setCurrent(c => Math.max(c - 1, 0));

  const submit = () => {
    const score = examQs.reduce((acc, q, idx) =>
      answers[idx] === q.answer ? acc + 1 : acc, 0);
    const report = {
      id: uuid(),
      timestamp: Date.now(),
      score,
      total,
      details: examQs.map((q, idx) => ({
        question: q.question,
        selected: answers[idx],
        correct: q.answer,
        explanation: q.explanation
      }))
    };
    saveReport(report);
    setSubmitted(true);
  };

  if (submitted) {
    const score = examQs.reduce((acc, q, idx) =>
      answers[idx] === q.answer ? acc + 1 : acc, 0);
    return (
      <div className="p-4 space-y-4 max-w-xl mx-auto">
        <h2 className="text-xl font-bold">Your Score: {score} / {total}</h2>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => navigate('/dashboard')}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-xl mx-auto">
      <div className="mb-4">Question {current + 1} / {total}</div>
      <QuestionCard question={currentQ} selected={answers[current]} onSelect={handleSelect} />
      <div className="flex justify-between mt-4">
        <button onClick={prev} disabled={current === 0} className="px-4 py-2 bg-gray-300 rounded">Previous</button>
        {current < total - 1 ? (
          <button onClick={next} className="px-4 py-2 bg-blue-500 text-white rounded">Next</button>
        ) : (
          <button onClick={submit} className="px-4 py-2 bg-green-500 text-white rounded">Submit</button>
        )}
      </div>
    </div>
  );
}
