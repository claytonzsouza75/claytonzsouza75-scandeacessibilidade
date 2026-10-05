import type {
  AuditReport,
  AuditSummary,
  CategoryKey,
  CategoryResult,
  HeadingItem,
  Issue,
  PriorityBuckets,
} from '../../src/types/accessibility.js';

const CATEGORY_WEIGHTS: Record<CategoryKey, number> = {
  keyboard_access: 15,
  forms: 14,
  alt_text: 12,
  button_contrast: 12,
  generic_links: 10,
  heading_structure: 10,
  zoom_responsive: 10,
  dynamic_content: 7,
  videos: 6,
  accessibility_plugins: 4,
};

export function computeAuditReport(params: {
  url: string;
  pageTitle: string;
  durationMs: number;
  categories: CategoryResult[];
  headingsTree: HeadingItem[];
}): AuditReport {
  const { url, pageTitle, durationMs, categories, headingsTree } = params;

  let totalPassed = 0;
  let totalWarnings = 0;
  let totalErrors = 0;
  let totalManualReview = 0;
  let criticalCount = 0;
  let highCount = 0;
  let mediumCount = 0;
  let lowCount = 0;

  const allIssues: Issue[] = [];

  for (const cat of categories) {
    if (cat.issuesCount === 0) {
      totalPassed++;
    }

    if (cat.requiresManualReview) {
      totalManualReview++;
    }

    for (const issue of cat.issues) {
      allIssues.push(issue);

      if (issue.status === 'falha') {
        totalErrors++;
      } else if (issue.status === 'aviso') {
        totalWarnings++;
      }

      switch (issue.severity) {
        case 'critica':
          criticalCount++;
          break;
        case 'alta':
          highCount++;
          break;
        case 'media':
          mediumCount++;
          break;
        case 'baixa':
          lowCount++;
          break;
      }
    }
  }

  // Calculate weighted score
  let weightedScoreSum = 0;
  let totalWeight = 0;

  for (const cat of categories) {
    const weight = CATEGORY_WEIGHTS[cat.key] || 10;
    weightedScoreSum += cat.score * weight;
    totalWeight += weight;
  }

  let finalScore = Math.round(weightedScoreSum / totalWeight);

  // Critical penalty check: if there are critical blockers, final score cannot exceed 68
  if (criticalCount >= 2 && finalScore > 65) {
    finalScore = 65;
  } else if (criticalCount >= 1 && finalScore > 74) {
    finalScore = 74;
  }

  finalScore = Math.max(0, Math.min(100, finalScore));

  let level: AuditReport['level'] = 'Excelente';
  if (finalScore < 50) {
    level = 'Crítico';
  } else if (finalScore < 75) {
    level = 'Precisa melhorar';
  } else if (finalScore < 90) {
    level = 'Bom';
  }

  // Group by Impact x Effort
  const priorities: PriorityBuckets = {
    corrijaPrimeiro: [],
    proximasMelhorias: [],
    aperfeicoamentos: [],
  };

  for (const issue of allIssues) {
    // CORRIJA PRIMEIRO: Crítica or (Alta with low/medium effort)
    if (issue.severity === 'critica' || (issue.severity === 'alta' && issue.effort === 'baixo')) {
      priorities.corrijaPrimeiro.push(issue);
    } else if (issue.severity === 'alta' || (issue.severity === 'media' && issue.effort === 'baixo')) {
      priorities.proximasMelhorias.push(issue);
    } else {
      priorities.aperfeicoamentos.push(issue);
    }
  }

  // Check Plugin Alert Requirement:
  // "Se encontrar um plugin e, ao mesmo tempo, muitos problemas estruturais, exibir alerta:
  // 'Este site utiliza recursos complementares de acessibilidade, mas foram encontradas barreiras estruturais que também precisam ser corrigidas.'"
  const pluginCategory = categories.find(c => c.key === 'accessibility_plugins');
  const detectedPlugins = pluginCategory?.meta?.detectedPlugins || [];
  const structuralIssuesCount = criticalCount + highCount;

  let pluginAlert: string | undefined;
  if (detectedPlugins.length > 0 && structuralIssuesCount > 2) {
    pluginAlert =
      'Este site utiliza recursos complementares de acessibilidade, mas foram encontradas barreiras estruturais que também precisam ser corrigidas.';
  }

  const summary: AuditSummary = {
    totalPassed,
    totalWarnings,
    totalErrors,
    totalManualReview,
    criticalCount,
    highCount,
    mediumCount,
    lowCount,
  };

  return {
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    url,
    pageTitle: pageTitle || url,
    analyzedAt: new Date().toISOString(),
    durationMs,
    score: finalScore,
    level,
    summary,
    categories,
    priorities,
    pluginAlert,
    headingsTree,
  };
}
