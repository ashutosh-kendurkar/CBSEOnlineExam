import { useState } from 'react';
import { loadReports } from '../utils/storage';
import { useNavigate } from 'react-router-dom';

export default function ReportView() {
  const navigate = useNavigate();
  const [reports] = useState(loadReports());

  return (
    <div className="p-4 max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Past Reports</h1>
      {reports.length === 0 && <p>No reports yet.</p>}
      {reports.map(r => (
        <div key={r.id} className="border p-2 rounded">
          <div className="flex justify-between">
            <span>{new Date(r.timestamp).toLocaleString()}</span>
            <span>{r.score} / {r.total}</span>
          </div>
          <details className="mt-2">
            <summary className="cursor-pointer">Details</summary>
            <ul className="list-disc ml-4">
              {r.details.map((d: any, idx: number) => (
                <li key={idx} className="mb-1">
                  <span className="font-semibold">Q:</span> {d.question}
                  <br />
                  <span className="font-semibold">Your Answer:</span> {d.selected || 'Skipped'}
                  <br />
                  <span className="font-semibold">Correct:</span> {d.correct}
                  <br />
                  <span className="italic text-sm">{d.explanation}</span>
                </li>
              ))}
            </ul>
          </details>
        </div>
      ))}
      <button
        className="bg-blue-500 text-white py-2 px-4 rounded"
        onClick={() => navigate('/dashboard')}
      >
        Back
      </button>
    </div>
  );
}
