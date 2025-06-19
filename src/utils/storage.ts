// Utilities for saving and loading exam reports using localStorage
export interface ExamReport {
  id: string;
  timestamp: number;
  score: number;
  total: number;
  details: any;
}

const STORAGE_KEY = 'exam_reports';

export function saveReport(report: ExamReport) {
  const existing = loadReports();
  existing.push(report);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

export function loadReports(): ExamReport[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as ExamReport[]) : [];
}
