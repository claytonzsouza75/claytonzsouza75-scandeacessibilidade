import type { CheerioAPI } from 'cheerio';
import type { CategoryResult, Issue } from '../../src/types/accessibility.js';

export function auditZoomAndResponsive($: CheerioAPI): CategoryResult {
  const issues: Issue[] = [];

  const viewportMeta = $('meta[name="viewport"]');
  const viewportContent = viewportMeta.attr('content') || '';

  // 1. Check if viewport meta is missing
  if (viewportMeta.length === 0) {
    issues.push({
      id: 'zoom-no-viewport',
      categoryKey: 'zoom_responsive',
      title: 'Ausência da tag <meta name="viewport"> essencial para dispositivos móveis',
      severity: 'critica',
      status: 'falha',
      selector: 'head',
      htmlSnippet: '<head> ... </head>',
      location: 'cabeçalho HTML <head>',
      description: 'A página não define a meta tag viewport, fazendo com que dispositivos móveis renderizem a tela como desktop minúsculo com necessidade de zoom manual constante.',
      whyItMatters: 'Sem viewport responsivo, pessoas em smartphones e tablets enfrentam textos microscópicos e quebra de layout.',
      whoIsAffected: 'Todos os usuários de dispositivos móveis e pessoas com visão subnormal.',
      howToFix: 'Insira a tag viewport padrão no <head>.',
      suggestedCode: `<meta name="viewport" content="width=device-width, initial-scale=1.0">`,
      ruleViolated: 'WCAG 2.1 — Critério 1.4.10: Redimensionamento do Texto / Refluxo (Nível AA)',
      requiresManualReview: false,
      effort: 'baixo',
    });
  } else {
    // 2. Check for user-scalable=no (disables pinch-to-zoom!)
    if (/user-scalable\s*=\s*(no|0)/i.test(viewportContent)) {
      issues.push({
        id: 'zoom-user-scalable-no',
        categoryKey: 'zoom_responsive',
        title: 'Bloqueio arbitrário de zoom do usuário (user-scalable=no)',
        severity: 'critica',
        status: 'falha',
        selector: 'meta[name="viewport"]',
        htmlSnippet: $.html(viewportMeta[0]),
        location: 'cabeçalho <head>',
        description: 'A tag viewport possui "user-scalable=no", impedindo que pessoas com baixa visão ampliem a página através do gesto de pinça no celular.',
        whyItMatters: 'Esse é um dos bloqueios de acessibilidade mais graves na web móvel, tornando o texto permanentemente inacessível para quem precisa de fontes maiores.',
        whoIsAffected: 'Pessoas com baixa visão, presbiopia (vista cansada) e idosos.',
        howToFix: 'Remova "user-scalable=no" da tag viewport.',
        suggestedCode: `<!-- Antes: <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no"> -->\n<meta name="viewport" content="width=device-width, initial-scale=1.0">`,
        ruleViolated: 'WCAG 2.1 — Critério 1.4.4: Redimensionamento do Texto (Nível AA)',
        requiresManualReview: false,
        effort: 'baixo',
      });
    }

    // 3. Check for maximum-scale=1.0 (blocks zoom)
    if (/maximum-scale\s*=\s*1(\.0)?/i.test(viewportContent)) {
      issues.push({
        id: 'zoom-maximum-scale-one',
        categoryKey: 'zoom_responsive',
        title: 'Limite restritivo de ampliação (maximum-scale=1.0)',
        severity: 'alta',
        status: 'falha',
        selector: 'meta[name="viewport"]',
        htmlSnippet: $.html(viewportMeta[0]),
        location: 'cabeçalho <head>',
        description: 'A meta tag viewport define maximum-scale=1.0, impedindo o zoom acima do tamanho original de 100%. A WCAG exige que o conteúdo possa ser ampliado até 200% sem perda de conteúdo.',
        whyItMatters: 'Impede o redimensionamento necessário para pessoas com dificuldades visuais.',
        whoIsAffected: 'Pessoas com visão reduzida.',
        howToFix: 'Permita que o usuário amplie livremente removendo a restrição maximum-scale=1.0.',
        suggestedCode: `<meta name="viewport" content="width=device-width, initial-scale=1.0">`,
        ruleViolated: 'WCAG 2.1 — Critério 1.4.4: Redimensionamento do Texto (Nível AA)',
        requiresManualReview: false,
        effort: 'baixo',
      });
    }
  }

  // 4. Check for fixed oversized pixel widths on containers
  $('[style*="width:"]').each((index, el) => {
    const style = $(el).attr('style') || '';
    const match = style.match(/width\s*:\s*(\d+)px/i);
    if (match) {
      const widthPx = Number.parseInt(match[1], 10);
      if (widthPx > 800) {
        issues.push({
          id: `zoom-fixed-width-${index + 1}`,
          categoryKey: 'zoom_responsive',
          title: `Largura fixa em pixels rígidos (${widthPx}px) pode causar rolagem horizontal no zoom`,
          severity: 'media',
          status: 'aviso',
          selector: `${el.tagName.toLowerCase()}[style*="width: ${widthPx}px"]`,
          htmlSnippet: $.html(el).slice(0, 160),
          location: 'estilo inline de container',
          description: `O elemento possui largura fixa de ${widthPx}px sem indicação de max-width: 100%. Quando o usuário aplica zoom de 200% ou abre em telas menores, pode ocorrer barra de rolagem horizontal.`,
          whyItMatters: 'A rolagem bidirecional (vertical e horizontal simultâneas) exige esforço excessivo de navegação e pode cortar textos.',
          whoIsAffected: 'Pessoas navegando com zoom de 200% ou em telas de baixa resolução.',
          howToFix: 'Utilize larguras percentuais, max-width responsivo ou unidades relativas (ch, rem, %).',
          suggestedCode: `/* Em vez de width: ${widthPx}px; */\nmax-width: ${widthPx}px;\nwidth: 100%;`,
          ruleViolated: 'WCAG 2.1 — Critério 1.4.10: Refluxo (Nível AA)',
          requiresManualReview: false,
          effort: 'medio',
        });
      }
    }
  });

  const issuesCount = issues.length;
  let status: CategoryResult['status'] = 'excelente';
  let score = 100;

  if (issues.some(i => i.severity === 'critica')) {
    status = 'critico';
    score = 40;
  } else if (issuesCount >= 2) {
    status = 'precisa_melhorar';
    score = 65;
  } else if (issuesCount === 1) {
    status = 'bom';
    score = 85;
  }

  return {
    key: 'zoom_responsive',
    title: 'Problemas com Zoom e Responsividade',
    status,
    score,
    issuesCount,
    severity: issues.some(i => i.severity === 'critica') ? 'critica' : issues.some(i => i.severity === 'alta') ? 'alta' : 'media',
    summary:
      issuesCount === 0
        ? 'A configuração de viewport permite ampliação de zoom de até 200% e o layout aparenta flexibilidade responsiva.'
        : `Identificamos ${issuesCount} problema(s) com zoom ou responsividade (como bloqueio de gesto de pinça ou largura rígida).`,
    issues,
    requiresManualReview: true,
    manualReviewNotes: 'Recomenda-se testar a página no navegador com zoom de 200% (Ctrl + tecla mais) e em viewports de 320px para certificar que nenhum texto ou menu seja sobreposto.',
    meta: {
      viewportContent,
    },
  };
}
