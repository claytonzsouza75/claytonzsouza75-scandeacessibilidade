import type { CheerioAPI } from 'cheerio';
import type { CategoryResult, Issue } from '../../src/types/accessibility.js';

const GENERIC_LINK_PATTERNS = [
  /^clique aqui$/i,
  /^clique neste link$/i,
  /^saiba mais$/i,
  /^ver mais$/i,
  /^acesse$/i,
  /^acesse aqui$/i,
  /^ler mais$/i,
  /^continuar$/i,
  /^continuar lendo$/i,
  /^aqui$/i,
  /^mais$/i,
  /^detalhes$/i,
  /^veja$/i,
  /^veja mais$/i,
  /^conheça$/i,
  /^confira$/i,
  /^link$/i,
  /^click here$/i,
  /^learn more$/i,
  /^read more$/i,
  /^view more$/i,
  /^more$/i,
  /^see more$/i,
  /^details$/i,
  /^continue$/i,
  /^go$/i,
];

export function auditGenericLinks($: CheerioAPI): CategoryResult {
  const issues: Issue[] = [];
  let totalLinksChecked = 0;

  $('a, button, [role="link"]').each((index, el) => {
    const $el = $(el);
    totalLinksChecked++;

    const rawText = $el.text().trim().replace(/\s+/g, ' ');
    const ariaLabel = $el.attr('aria-label')?.trim();
    const ariaLabelledBy = $el.attr('aria-labelledby')?.trim();
    const title = $el.attr('title')?.trim();

    // If accessible name is already provided by aria-label or title, consider it contextualized
    const accessibleName = ariaLabel || title || '';
    if (accessibleName && accessibleName.length > 10 && !GENERIC_LINK_PATTERNS.some(p => p.test(accessibleName))) {
      return;
    }

    if (ariaLabelledBy) {
      return; // Element has reference to another label in DOM
    }

    // Check if the visible text matches generic link patterns
    const isGeneric = GENERIC_LINK_PATTERNS.some(pattern => pattern.test(rawText));

    if (isGeneric) {
      const href = $el.attr('href') || '#';
      const tagName = el.tagName.toLowerCase();
      const snippet = $.html(el).slice(0, 180);

      // Heuristic recommendation based on href or text
      let suggestedContext = 'Conheça nossos serviços completos';
      if (href.includes('blog') || href.includes('artigo') || href.includes('noticia')) {
        suggestedContext = 'Leia o artigo completo sobre o tema';
      } else if (href.includes('produto') || href.includes('loja')) {
        suggestedContext = 'Ver especificações completas do produto';
      } else if (href.includes('contato')) {
        suggestedContext = 'Entre em contato com nossa equipe';
      } else if (href.includes('sobre')) {
        suggestedContext = 'Conheça a história e a equipe da empresa';
      }

      issues.push({
        id: `generic-link-${index + 1}`,
        categoryKey: 'generic_links',
        title: `Link ou botão com texto genérico: "${rawText}"`,
        severity: 'media',
        status: 'falha',
        selector: `${tagName}${href !== '#' ? `[href="${href.slice(0, 40)}"]` : ''}`,
        htmlSnippet: snippet,
        location: $el.closest('header, nav, main, footer, article, section').prop('tagName')?.toLowerCase() || 'corpo da página',
        description: `O link ou botão utiliza o texto vago "${rawText}" sem informações contextuais sobre para onde o usuário será direcionado.`,
        whyItMatters: 'Usuários de leitores de tela costumam navegar extraindo uma lista de links da página. Links com textos como "Clique aqui" ou "Saiba mais" perdem todo o sentido fora de contexto visual.',
        whoIsAffected: 'Pessoas cegas ou com baixa visão que utilizam leitores de tela (NVDA, JAWS, VoiceOver), bem como usuários com deficiências cognitivas que precisam de clareza imediata.',
        howToFix: `Substitua o texto genérico por uma frase que explique o destino da ação ou adicione um atributo aria-label com descrição contextualizada.`,
        suggestedCode: `<${tagName} href="${href}" aria-label="${suggestedContext}">\n  ${rawText}\n</${tagName}>\n\n<!-- Ou preferencialmente no próprio texto visível: -->\n<${tagName} href="${href}">\n  ${suggestedContext}\n</${tagName}>`,
        ruleViolated: 'WCAG 2.1 — Critério de Sucesso 2.4.4: Propósito do Link (No Contexto) (Nível A)',
        requiresManualReview: false,
        effort: 'baixo',
      });
    }
  });

  const issuesCount = issues.length;
  let status: CategoryResult['status'] = 'excelente';
  let score = 100;

  if (issuesCount >= 6) {
    status = 'critico';
    score = Math.max(30, 100 - issuesCount * 10);
  } else if (issuesCount >= 3) {
    status = 'precisa_melhorar';
    score = Math.max(55, 100 - issuesCount * 9);
  } else if (issuesCount >= 1) {
    status = 'bom';
    score = Math.max(75, 100 - issuesCount * 8);
  }

  return {
    key: 'generic_links',
    title: 'Links e CTAs Genéricos',
    status,
    score,
    issuesCount,
    severity: issuesCount > 4 ? 'alta' : issuesCount > 0 ? 'media' : 'baixa',
    summary:
      issuesCount === 0
        ? `Todos os ${totalLinksChecked} links e botões identificados possuem textos específicos ou nomes acessíveis contextuais.`
        : `Identificamos ${issuesCount} link(s) ou botão(ões) com textos excessivamente genéricos (ex: "Clique aqui", "Saiba mais").`,
    issues,
    requiresManualReview: issuesCount > 0,
    manualReviewNotes: 'Verifique se links visivelmente contextualizados por parágrafos adjacentes mantêm clareza na lista isolada de links do leitor de tela.',
    meta: {
      totalLinksChecked,
    },
  };
}
