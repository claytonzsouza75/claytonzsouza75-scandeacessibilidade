import type { CheerioAPI } from 'cheerio';
import type { CategoryResult, Issue } from '../../src/types/accessibility.js';

export function auditForms($: CheerioAPI): CategoryResult {
  const issues: Issue[] = [];
  let totalFormsChecked = 0;

  $('form, input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea').each((index, el) => {
    const $el = $(el);
    const tagName = el.tagName.toLowerCase();

    if (tagName === 'form') {
      totalFormsChecked++;
      return;
    }

    const type = $el.attr('type') || 'text';
    const id = $el.attr('id');
    const name = $el.attr('name');
    const placeholder = $el.attr('placeholder');
    const ariaLabel = $el.attr('aria-label');
    const ariaLabelledBy = $el.attr('aria-labelledby');
    const title = $el.attr('title');
    const snippet = $.html(el).slice(0, 180);

    // 1. Check if input has an associated label
    let hasLabel = false;
    if (id) {
      const explicitLabel = $(`label[for="${id}"]`);
      if (explicitLabel.length > 0 && explicitLabel.text().trim().length > 0) {
        hasLabel = true;
      }
    }

    // Check wrapping label: <label><input ... /> Label Text</label>
    const parentLabel = $el.closest('label');
    if (parentLabel.length > 0 && parentLabel.text().trim().length > 0) {
      hasLabel = true;
    }

    // Check ARIA accessible name
    if (ariaLabel || ariaLabelledBy || title) {
      hasLabel = true;
    }

    if (!hasLabel) {
      // 2. Check if placeholder is used as sole label
      if (placeholder) {
        issues.push({
          id: `form-placeholder-only-${index + 1}`,
          categoryKey: 'forms',
          title: `Campo <${tagName} type="${type}"> utiliza apenas "placeholder" como identificação`,
          severity: 'alta',
          status: 'falha',
          selector: `${tagName}[placeholder="${placeholder.slice(0, 30)}"]`,
          htmlSnippet: snippet,
          location: 'campo de formulário',
          description: `O campo possui placeholder="${placeholder}", mas não tem uma tag <label> associada nem atributo aria-label.`,
          whyItMatters: 'O placeholder desaparece quando o usuário começa a digitar, fazendo a pessoa esquecer qual dado aquele campo pedia. Além disso, muitos leitores de tela não anunciam placeholders de maneira confiável.',
          whoIsAffected: 'Pessoas com deficiência visual, idosos, pessoas com déficit de memória recente ou déficit de atenção.',
          howToFix: 'Crie uma tag <label> visível associada pelo atributo "for" correspondente ao "id" do campo.',
          suggestedCode: `<label for="${id || 'campo-email'}" class="block text-sm font-medium text-slate-700">\n  ${placeholder}\n</label>\n<${tagName} id="${id || 'campo-email'}" name="${name || 'email'}" type="${type}" placeholder="${placeholder}" />`,
          ruleViolated: 'WCAG 2.1 — Critério 3.3.2: Rótulos ou Instruções (Nível A) e Critério 1.3.1 (Nível A)',
          requiresManualReview: false,
          effort: 'baixo',
        });
      } else {
        issues.push({
          id: `form-no-label-${index + 1}`,
          categoryKey: 'forms',
          title: `Campo <${tagName} type="${type}"> completamente sem rótulo (label)`,
          severity: 'critica',
          status: 'falha',
          selector: `${tagName}${id ? `#${id}` : ''}`,
          htmlSnippet: snippet,
          location: 'campo de entrada de dados',
          description: `O elemento interativo <${tagName}> não possui nenhum rótulo <label>, aria-label ou aria-labelledby associado.`,
          whyItMatters: 'Um leitor de tela anunciará apenas "campo de edição de texto em branco", impossibilitando o usuário de saber o que deve digitar.',
          whoIsAffected: 'Pessoas com deficiência visual dependentes de leitores de tela.',
          howToFix: 'Vincule uma tag <label for="id-do-campo"> com o texto descritivo.',
          suggestedCode: `<label for="${id || 'meu-campo'}" class="font-medium">\n  Nome completo:\n</label>\n<${tagName} id="${id || 'meu-campo'}" type="${type}" />`,
          ruleViolated: 'WCAG 2.1 — Critério 1.3.1: Informações e Relações (Nível A) e Critério 4.1.2: Nome, Função e Valor (Nível A)',
          requiresManualReview: false,
          effort: 'baixo',
        });
      }
    }

    // 3. Required fields without programmatic indication
    const isHtmlRequired = $el.prop('required') || typeof $el.attr('required') !== 'undefined';
    const isAriaRequired = $el.attr('aria-required') === 'true';
    if (isHtmlRequired && !isAriaRequired) {
      // Good practice is ensuring screen readers announce it clearly
    }
  });

  const issuesCount = issues.length;
  let status: CategoryResult['status'] = 'excelente';
  let score = 100;

  if (issues.some(i => i.severity === 'critica') || issuesCount >= 4) {
    status = 'critico';
    score = Math.max(30, 100 - issuesCount * 14);
  } else if (issuesCount >= 2) {
    status = 'precisa_melhorar';
    score = Math.max(55, 100 - issuesCount * 11);
  } else if (issuesCount === 1) {
    status = 'bom';
    score = 80;
  }

  return {
    key: 'forms',
    title: 'Formulários sem Descrição Adequada',
    status,
    score,
    issuesCount,
    severity: issues.some(i => i.severity === 'critica') ? 'critica' : issues.some(i => i.severity === 'alta') ? 'alta' : 'media',
    summary:
      issuesCount === 0
        ? 'Todos os campos de formulário analisados possuem rótulos claros e acessíveis associados.'
        : `Encontramos ${issuesCount} problema(s) em formulários (campos sem label ou identificados apenas por placeholder).`,
    issues,
    requiresManualReview: true,
    manualReviewNotes: 'Verifique se mensagens dinâmicas de erro de validação (ex: "E-mail inválido") são anunciadas com aria-live="assertive" e associadas por aria-describedby.',
    meta: {
      totalFormsChecked,
    },
  };
}
