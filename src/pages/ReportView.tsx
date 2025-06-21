import { useState } from 'react';
import { loadReports } from '../utils/storage';
import { useNavigate } from 'react-router-dom';

export default function ReportView() {
  const navigate = useNavigate();
  const [reports] = useState(loadReports());
  const [subjectFilter, setSubjectFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(0);

  const subjects = Array.from(new Set(reports.map(r => r.subject)));
  const PAGE_SIZE = 5;

  let filtered = reports;
  if (subjectFilter) {
    filtered = filtered.filter(r => r.subject === subjectFilter);
  }
  if (startDate) {
    const ts = new Date(startDate).getTime();
    filtered = filtered.filter(r => r.timestamp >= ts);
  }
  if (endDate) {
    const ts = new Date(endDate).getTime() + 86400000 - 1;
    filtered = filtered.filter(r => r.timestamp <= ts);
  }

  const pages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <div className="p-4 max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Past Reports</h1>

      <div className="space-y-2 border p-2 rounded bg-gray-50">
        <div>
          <label className="block mb-1">Subject</label>
          <select
            className="border p-1 rounded w-full"
            value={subjectFilter}
            onChange={e => {
              setSubjectFilter(e.target.value);
              setPage(0);
            }}
          >
            <option value="">All</option>
            {subjects.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1">Attempted After</label>
          <input
            type="date"
            className="border p-1 rounded w-full"
            value={startDate}
            onChange={e => {
              setStartDate(e.target.value);
              setPage(0);
            }}
          />
        </div>
        <div>
          <label className="block mb-1">Attempted Before</label>
          <input
            type="date"
            className="border p-1 rounded w-full"
            value={endDate}
            onChange={e => {
              setEndDate(e.target.value);
              setPage(0);
            }}
          />
        </div>
      </div>

      {paginated.length === 0 && <p>No reports found.</p>}
      {paginated.map(r => (
        <div key={r.id} className="border p-2 rounded">
          <div className="flex justify-between">
            <span>{new Date(r.timestamp).toLocaleString()}</span>
            <span>{r.score} / {r.total}</span>
          </div>
          <div className="text-sm mb-1">Subject: {r.subject}</div>
          <details className="mt-2">
            <summary className="cursor-pointer">Details</summary>
            <ul className="list-disc ml-4">
              {r.details.map((d: any, idx: number) => (
                <li key={idx} className="mb-1">
                  <span className="font-semibold">Q:</span> {d.question}
                  <br />
                  <span className="font-semibold">Your Answer:</span>{' '}
                  <span
                    className={
                      d.selected === d.correct ? 'bg-green-100 px-1' : 'bg-red-100 px-1'
                    }
                  >
                    {d.selected || 'Skipped'}
                  </span>
                  <br />
                  <span className="font-semibold">Correct:</span>{' '}
                  <span className="bg-green-100 px-1">{d.correct}</span>
                  <br />
                  <span className="italic text-sm">{d.explanation}</span>
                </li>
              ))}
            </ul>
          </details>
        </div>
      ))}

      {pages > 1 && (
        <div className="flex justify-between">
          <button
            className="px-2 py-1 rounded bg-gray-300"
            disabled={page === 0}
            onClick={() => setPage(p => Math.max(p - 1, 0))}
          >
            Previous
          </button>
          <span className="self-center">
            Page {page + 1} / {pages}
          </span>
          <button
            className="px-2 py-1 rounded bg-gray-300"
            disabled={page >= pages - 1}
            onClick={() => setPage(p => Math.min(p + 1, pages - 1))}
          >
            Next
          </button>
        </div>
      )}

      <button
        className="bg-blue-500 text-white py-2 px-4 rounded"
        onClick={() => navigate('/dashboard')}
      >
        Back
      </button>
    </div>
  );
}
