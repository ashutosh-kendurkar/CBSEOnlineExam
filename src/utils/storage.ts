// Utilities for saving and loading exam reports using localStorage
export interface ExamDetail {
  id: string | number;
  question: string;
  selected: string | undefined;
  correct: string;
  explanation: string;
}

export interface ExamReport {
  id: string;
  timestamp: number;
  /** Subject for which the exam was attempted */
  subject: string;
  score: number;
  total: number;
  details: ExamDetail[];
}

const STORAGE_KEY = 'exam_reports';

export function saveReport(report: ExamReport) {
  const existing = loadReports();
  existing.push(report);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

export function loadReports(): ExamReport[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  const parsed: any[] = JSON.parse(raw);
  return parsed.map(r => ({
    subject: r.subject || 'unknown',
    ...r
  })) as ExamReport[];
}
