export type Severity = 'critica' | 'alta' | 'media' | 'baixa';

export type IssueStatus = 'falha' | 'aviso' | 'passou' | 'revisao_manual';

export type CategoryStatus = 'excelente' | 'bom' | 'precisa_melhorar' | 'critico';

export type PriorityGroup = 'corrija_primeiro' | 'proximas_melhorias' | 'aperfeicoamentos';

export type EffortLevel = 'baixo' | 'medio' | 'alto' | 'continuo';

export type CategoryKey =
  | 'generic_links'
  | 'button_contrast'
  | 'alt_text'
  | 'keyboard_access'
  | 'heading_structure'
  | 'forms'
  | 'dynamic_content'
  | 'videos'
  | 'zoom_responsive'
  | 'accessibility_plugins';

export interface Issue {
  id: string;
  categoryKey: CategoryKey;
  title: string;
  severity: Severity;
  status: IssueStatus;
  selector: string;
  htmlSnippet: string;
  location: string;
  description: string;       // O que encontramos
  whyItMatters: string;      // Por que isso importa
  whoIsAffected: string;     // Quem pode ser afetado
  howToFix: string;          // Como corrigir
  suggestedCode: string;     // Exemplo de código / sugestão
  ruleViolated: string;      // Regra violada (ex: WCAG 2.4.4 - Nível A)
  requiresManualReview: boolean;
  effort: EffortLevel;
}

export interface HeadingItem {
  id: string;
  level: number;
  text: string;
  hasWarning?: boolean;
  warningMessage?: string;
  children?: HeadingItem[];
}

export interface CategoryResult {
  key: CategoryKey;
  title: string;
  status: CategoryStatus;
  score: number;             // 0 a 100
  issuesCount: number;
  severity: Severity;
  summary: string;
  issues: Issue[];
  requiresManualReview: boolean;
  manualReviewNotes?: string;
  meta?: {
    headingsTree?: HeadingItem[];
    detectedPlugins?: string[];
    hasSkipLink?: boolean;
    hasMain?: boolean;
    hasNav?: boolean;
    hasHeader?: boolean;
    hasFooter?: boolean;
    contrastIssuesCount?: number;
    totalImagesChecked?: number;
    totalFormsChecked?: number;
    totalLinksChecked?: number;
    totalButtonsChecked?: number;
    viewportContent?: string;
    [key: string]: any;
  };
}

export interface AuditSummary {
  totalPassed: number;
  totalWarnings: number;
  totalErrors: number;
  totalManualReview: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
}

export interface PriorityBuckets {
  corrijaPrimeiro: Issue[];
  proximasMelhorias: Issue[];
  aperfeicoamentos: Issue[];
}

export interface AuditReport {
  id: string;
  url: string;
  pageTitle: string;
  analyzedAt: string;
  durationMs: number;
  score: number;
  level: 'Excelente' | 'Bom' | 'Precisa melhorar' | 'Crítico';
  summary: AuditSummary;
  categories: CategoryResult[];
  priorities: PriorityBuckets;
  pluginAlert?: string;
  headingsTree: HeadingItem[];
  isSimulated?: boolean;
}

export interface HistoryItem {
  id: string;
  url: string;
  pageTitle: string;
  score: number;
  level: string;
  date: string;
  timestamp: number;
  durationMs: number;
  criticalIssues: number;
  totalIssues: number;
}

export interface AuditComparison {
  previous: AuditReport;
  current: AuditReport;
  scoreDiff: number;
  resolvedIssues: Issue[];
  newIssues: Issue[];
  persistentIssues: Issue[];
}
