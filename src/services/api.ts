import type { AuditReport } from '../types/accessibility.js';

export async function requestAccessibilityAudit(params: {
  url?: string;
  sampleId?: string;
}): Promise<AuditReport> {
  const res = await fetch('/api/audit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Erro ao realizar a auditoria da página.');
  }

  return data as AuditReport;
}

export async function fetchSampleList(): Promise<{ id: string; title: string; url: string }[]> {
  try {
    const res = await fetch('/api/samples');
    if (!res.ok) return [];
    const data = await res.json();
    return data.samples || [];
  } catch {
    return [];
  }
}
