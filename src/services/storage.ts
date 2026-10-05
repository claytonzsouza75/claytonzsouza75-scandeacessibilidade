import type { AuditComparison, AuditReport, HistoryItem, Issue } from '../types/accessibility.js';

const STORAGE_KEY = 'scandeacessibilidade_history_v1';
const REPORTS_CACHE_KEY = 'scandeacessibilidade_reports_v1';

export function getAuditHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Falha ao ler histórico local:', err);
    return [];
  }
}

export function saveAuditToHistory(report: AuditReport): void {
  try {
    const history = getAuditHistory();
    const existingIndex = history.findIndex(h => h.id === report.id);

    const item: HistoryItem = {
      id: report.id,
      url: report.url,
      pageTitle: report.pageTitle,
      score: report.score,
      level: report.level,
      date: new Date().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      timestamp: Date.now(),
      durationMs: report.durationMs,
      criticalIssues: report.summary.criticalCount,
      totalIssues: report.summary.totalErrors + report.summary.totalWarnings,
    };

    if (existingIndex >= 0) {
      history[existingIndex] = item;
    } else {
      history.unshift(item);
    }

    // Keep last 30 audits
    const trimmed = history.slice(0, 30);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));

    // Also cache full report
    const reportsMap = getCachedReports();
    reportsMap[report.id] = report;
    localStorage.setItem(REPORTS_CACHE_KEY, JSON.stringify(reportsMap));
  } catch (err) {
    console.error('Falha ao salvar auditoria no histórico local:', err);
  }
}

export function getCachedReports(): Record<string, AuditReport> {
  try {
    const raw = localStorage.getItem(REPORTS_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getReportById(id: string): AuditReport | null {
  const map = getCachedReports();
  return map[id] || null;
}

export function clearAuditHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(REPORTS_CACHE_KEY);
  } catch (err) {
    console.error('Falha ao limpar histórico:', err);
  }
}

/**
 * Compares two audit reports (e.g. Before vs After)
 */
export function compareAuditReports(previous: AuditReport, current: AuditReport): AuditComparison {
  const prevIssuesMap = new Map<string, Issue>();
  for (const cat of previous.categories) {
    for (const issue of cat.issues) {
      prevIssuesMap.set(`${issue.categoryKey}:${issue.title}`, issue);
    }
  }

  const currentIssuesMap = new Map<string, Issue>();
  for (const cat of current.categories) {
    for (const issue of cat.issues) {
      currentIssuesMap.set(`${issue.categoryKey}:${issue.title}`, issue);
    }
  }

  const resolvedIssues: Issue[] = [];
  const persistentIssues: Issue[] = [];
  const newIssues: Issue[] = [];

  for (const [key, issue] of prevIssuesMap.entries()) {
    if (currentIssuesMap.has(key)) {
      persistentIssues.push(currentIssuesMap.get(key)!);
    } else {
      resolvedIssues.push(issue);
    }
  }

  for (const [key, issue] of currentIssuesMap.entries()) {
    if (!prevIssuesMap.has(key)) {
      newIssues.push(issue);
    }
  }

  return {
    previous,
    current,
    scoreDiff: current.score - previous.score,
    resolvedIssues,
    newIssues,
    persistentIssues,
  };
}
