import type { AuditReport } from '../types/accessibility.js';

export function generateReportMarkdown(report: AuditReport): string {
  const dateFormatted = new Date(report.analyzedAt).toLocaleString('pt-BR');

  let text = `# Relatório de Auditoria de Acessibilidade Web\n\n`;
  text += `**Site:** ${report.pageTitle}\n`;
  text += `**URL:** ${report.url}\n`;
  text += `**Data da Análise:** ${dateFormatted}\n`;
  text += `**Tempo de Análise:** ${report.durationMs}ms\n`;
  text += `**Pontuação de Acessibilidade:** ${report.score}/100 — Nível: ${report.level}\n\n`;

  text += `> *Aviso: Este relatório é uma análise automatizada de possíveis barreiras técnicas de acessibilidade e não constitui certificação oficial de conformidade com a WCAG ou com a Lei Brasileira de Inclusão (LBI). Testes com usuários reais e especialistas humanos continuam sendo indispensáveis.*\n\n`;

  text += `## Resumo Executivo\n`;
  text += `- Critérios Aprovados: ${report.summary.totalPassed}/10\n`;
  text += `- Problemas Críticos: ${report.summary.criticalCount}\n`;
  text += `- Problemas de Severidade Alta: ${report.summary.highCount}\n`;
  text += `- Problemas de Severidade Média: ${report.summary.mediumCount}\n`;
  text += `- Avisos / Aperfeiçoamentos: ${report.summary.lowCount}\n`;
  text += `- Critérios que Exigem Revisão Manual: ${report.summary.totalManualReview}\n\n`;

  if (report.pluginAlert) {
    text += `### ⚠️ Alerta de Acessibilidade Estrutural vs. Plugins\n`;
    text += `${report.pluginAlert}\n\n`;
  }

  text += `## Prioridades de Ação (Impacto × Esforço)\n\n`;

  text += `### 1. Corrija Primeiro (Alto Impacto)\n`;
  if (report.priorities.corrijaPrimeiro.length === 0) {
    text += `*Nenhum item crítico ou bloqueador foi identificado nesta categoria.*\n\n`;
  } else {
    for (const issue of report.priorities.corrijaPrimeiro) {
      text += `- **[${issue.severity.toUpperCase()}]** ${issue.title}\n`;
      text += `  - *O que encontramos:* ${issue.description}\n`;
      text += `  - *Como corrigir:* ${issue.howToFix}\n`;
      text += `  - *Regra violada:* ${issue.ruleViolated}\n`;
    }
    text += `\n`;
  }

  text += `### 2. Próximas Melhorias (Importante)\n`;
  if (report.priorities.proximasMelhorias.length === 0) {
    text += `*Nenhum item pendente nesta categoria.*\n\n`;
  } else {
    for (const issue of report.priorities.proximasMelhorias) {
      text += `- **[${issue.severity.toUpperCase()}]** ${issue.title}\n`;
      text += `  - *Como corrigir:* ${issue.howToFix}\n`;
    }
    text += `\n`;
  }

  text += `### 3. Aperfeiçoamentos Recomendados\n`;
  if (report.priorities.aperfeicoamentos.length === 0) {
    text += `*Nenhum item pendente nesta categoria.*\n\n`;
  } else {
    for (const issue of report.priorities.aperfeicoamentos) {
      text += `- ${issue.title} (${issue.ruleViolated})\n`;
    }
    text += `\n`;
  }

  text += `## Avaliação Detalhada dos 10 Critérios\n\n`;
  for (const cat of report.categories) {
    text += `### ${cat.title} — Nota: ${cat.score}/100 (${cat.status.toUpperCase()})\n`;
    text += `${cat.summary}\n\n`;
    if (cat.issues.length > 0) {
      for (const issue of cat.issues) {
        text += `#### ${issue.title}\n`;
        text += `- **Localização:** ${issue.location}\n`;
        text += `- **Por que importa:** ${issue.whyItMatters}\n`;
        text += `- **Quem é afetado:** ${issue.whoIsAffected}\n`;
        text += `- **Como corrigir:** ${issue.howToFix}\n`;
        if (issue.suggestedCode) {
          text += `\`\`\`html\n${issue.suggestedCode}\n\`\`\`\n`;
        }
      }
    }
    text += `\n`;
  }

  text += `## Requisitos que Demandam Revisão Manual Humana\n`;
  text += `- **Libras:** Verificar a coerência da interpretação ou presença de conteúdo audiovisual sinalizado.\n`;
  text += `- **Audiodescrição:** Avaliar se elementos visuais em vídeos possuem faixa de audiodescrição expressiva.\n`;
  text += `- **Qualidade do Alt-Text:** Validar se a descrição textual transmite fielmente a intenção editorial.\n`;
  text += `- **Navegação com Usuários Reais:** Conduzir testes de usabilidade com pessoas com deficiência física, visual, auditiva e neurodivergentes.\n\n`;

  text += `---\n*Gerado automaticamente por ScandeAcessibilidade — Tecnologia de Auditoria Digital.*`;
  return text;
}
