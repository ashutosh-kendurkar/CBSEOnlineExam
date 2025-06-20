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

  const cancel = () => {
    if (confirm('Cancel the exam? Your progress will be lost.')) {
      navigate('/dashboard');
    }
  };

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
      <div className="p-4 space-y-4 max-w-3xl mx-auto">
        <h2 className="text-xl font-bold">Your Score: {score} / {total}</h2>
        <div className="overflow-x-auto">
          <table className="table-auto w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-1">#</th>
                <th className="border px-2 py-1">Question</th>
                <th className="border px-2 py-1">Options</th>
                <th className="border px-2 py-1">Your Answer</th>
                <th className="border px-2 py-1">Correct</th>
                <th className="border px-2 py-1">Explanation</th>
              </tr>
            </thead>
            <tbody>
              {examQs.map((q, idx) => (
                <tr key={q.id} className="align-top">
                  <td className="border px-2 py-1 text-center">{idx + 1}</td>
                  <td className="border px-2 py-1">{q.question}</td>
                  <td className="border px-2 py-1">
                    <ul className="list-disc ml-4">
                      {q.options.map(opt => (
                        <li key={opt} className={opt === q.answer ? 'font-semibold' : ''}>{opt}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="border px-2 py-1">{answers[idx] || 'Skipped'}</td>
                  <td className="border px-2 py-1">{q.answer}</td>
                  <td className="border px-2 py-1">{q.explanation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
      <div className="flex justify-between mb-4">
        <span>Question {current + 1} / {total}</span>
        <button onClick={cancel} className="text-sm underline">Cancel</button>
      </div>
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
