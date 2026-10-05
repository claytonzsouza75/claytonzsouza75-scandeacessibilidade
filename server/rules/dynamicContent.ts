import type { CheerioAPI } from 'cheerio';
import type { CategoryResult, Issue } from '../../src/types/accessibility.js';

export function auditDynamicContent($: CheerioAPI): CategoryResult {
  const issues: Issue[] = [];

  // 1. Check for obsolete moving elements: <marquee>, <blink>
  $('marquee, blink').each((index, el) => {
    const tagName = el.tagName.toLowerCase();
    issues.push({
      id: `dynamic-obsolete-${index + 1}`,
      categoryKey: 'dynamic_content',
      title: `Uso da tag obsoleta <${tagName}> com rolagem involuntária`,
      severity: 'critica',
      status: 'falha',
      selector: tagName,
      htmlSnippet: $.html(el).slice(0, 160),
      location: 'conteúdo em movimento',
      description: `O elemento <${tagName}> cria movimentação contínua de texto que não pode ser facilmente interrompida pelo usuário e é considerado obsoleto pelos padrões web modernos.`,
      whyItMatters: 'Movimentos contínuos causam tontura, náusea e desconforto grave em pessoas com distúrbios vestibulares, além de impedir a leitura por pessoas com baixa visão.',
      whoIsAffected: 'Pessoas com distúrbios vestibulares, epilepsia fotossensível, TDAH ou dificuldades de foco visual.',
      howToFix: `Remova a tag <${tagName}> e apresente as informações de forma estática e bem diagramada.`,
      suggestedCode: `<div class="bg-indigo-50 p-4 rounded-lg text-indigo-900">\n  ${$(el).text().trim() || 'Aviso importante'}\n</div>`,
      ruleViolated: 'WCAG 2.1 — Critério 2.2.2: Pausar, Parar, Ocultar (Nível A)',
      requiresManualReview: false,
      effort: 'baixo',
    });
  });

  // 2. Detect Carousels and Sliders (Slick, Swiper, Owl, Splide, etc.)
  const carouselElements = $('[class*="carousel"], [class*="slider"], [class*="swiper"], [class*="slick"], [class*="owl-"], [data-ride="carousel"]');
  if (carouselElements.length > 0) {
    // Check if there is an explicit pause button
    const hasPauseBtn = $('button, [role="button"]').filter((_, el) => {
      const text = $(el).text().toLowerCase();
      const aria = ($(el).attr('aria-label') || '').toLowerCase();
      return text.includes('pausar') || text.includes('pause') || text.includes('parar') || text.includes('stop') ||
             aria.includes('pause') || aria.includes('pausar');
    }).length > 0;

    if (!hasPauseBtn) {
      issues.push({
        id: 'dynamic-carousel-no-pause',
        categoryKey: 'dynamic_content',
        title: 'Carrossel ou banner rotativo detectado sem botão explícito de pausa',
        severity: 'media',
        status: 'aviso',
        selector: carouselElements.first().prop('tagName')?.toLowerCase() || 'div',
        htmlSnippet: $.html(carouselElements.first()[0]).slice(0, 180),
        location: 'banner rotativo / carrossel',
        description: 'Foi identificado um componente de carrossel ou slider dinâmico, porém não foi detectado um botão acessível para pausar a rotação automática.',
        whyItMatters: 'Se o carrossel avança sozinho a cada poucos segundos, pessoas que leem mais devagar perdem o conteúdo antes de terminar a leitura.',
        whoIsAffected: 'Pessoas com dislexia, baixa visão, idosos e usuários com mobilidade reduzida.',
        howToFix: 'Adicione um controle visível e acessível por teclado com ação de "Pausar rotação automática" ou desative a rotação automática por padrão.',
        suggestedCode: `<button type="button" aria-label="Pausar rotação de banners" class="btn-pause">\n  ⏸ Pausar\n</button>`,
        ruleViolated: 'WCAG 2.1 — Critério 2.2.2: Pausar, Parar, Ocultar (Nível A)',
        requiresManualReview: true,
        effort: 'baixo',
      });
    }
  }

  // 3. Autoplay video without muted or controls
  $('video[autoplay]').each((index, el) => {
    const $el = $(el);
    const hasControls = typeof $el.attr('controls') !== 'undefined';
    const isMuted = typeof $el.attr('muted') !== 'undefined' || $el.prop('muted');

    if (!hasControls) {
      issues.push({
        id: `dynamic-video-autoplay-${index + 1}`,
        categoryKey: 'dynamic_content',
        title: 'Vídeo em reprodução automática (autoplay) sem controles de reprodução',
        severity: 'alta',
        status: 'falha',
        selector: 'video[autoplay]',
        htmlSnippet: $.html(el).slice(0, 160),
        location: 'reprodutor de mídia',
        description: 'O vídeo inicia automaticamente e não fornece os controles nativos (atributo "controls") para permitir que o usuário pause ou pare a execução.',
        whyItMatters: 'O movimento e possíveis áudios automáticos podem interferir na voz do leitor de tela ou assustar a pessoa usuária.',
        whoIsAffected: 'Usuários de leitores de tela e pessoas com sensibilidade sensorial.',
        howToFix: 'Adicione o atributo controls e garanta que vídeos de fundo com autoplay estejam sempre silenciados (muted) e tenham botão de pausa.',
        suggestedCode: `<video autoplay loop muted playsinline controls>\n  <source src="video.mp4" type="video/mp4">\n</video>`,
        ruleViolated: 'WCAG 2.1 — Critério 1.4.2: Controle de Áudio (Nível A) e Critério 2.2.2 (Nível A)',
        requiresManualReview: false,
        effort: 'baixo',
      });
    }
  });

  // 4. CSS animations without prefers-reduced-motion check
  let hasKeyframes = false;
  let hasReducedMotionQuery = false;

  $('style').each((_, el) => {
    const css = $(el).text();
    if (/@keyframes/i.test(css) || /animation\s*:/i.test(css)) {
      hasKeyframes = true;
    }
    if (/prefers-reduced-motion/i.test(css)) {
      hasReducedMotionQuery = true;
    }
  });

  if (hasKeyframes && !hasReducedMotionQuery) {
    issues.push({
      id: 'dynamic-no-reduced-motion',
      categoryKey: 'dynamic_content',
      title: 'Animações CSS detectadas sem suporte à diretiva prefers-reduced-motion',
      severity: 'baixa',
      status: 'aviso',
      selector: 'style',
      htmlSnippet: '@keyframes ...',
      location: 'estilos de animação CSS',
      description: 'O site define animações ou transições CSS, mas não inclui a media query @media (prefers-reduced-motion: reduce) para respeitar a preferência do sistema operacional do usuário.',
      whyItMatters: 'Muitos usuários configuram seus sistemas para reduzir movimentos devido a náuseas e enxaquecas causadas por efeitos de parallax e zoom.',
      whoIsAffected: 'Pessoas com labirintite e sensibilidade ao movimento.',
      howToFix: 'Adicione uma regra CSS desativando animações quando prefers-reduced-motion estiver ativo.',
      suggestedCode: `@media (prefers-reduced-motion: reduce) {\n  *,\n  *::before,\n  *::after {\n    animation-duration: 0.01ms !important;\n    animation-iteration-count: 1 !important;\n    transition-duration: 0.01ms !important;\n    scroll-behavior: auto !important;\n  }\n}`,
      ruleViolated: 'WCAG 2.1 — Critério 2.3.3: Animação a Partir de Interações (Nível AAA)',
      requiresManualReview: false,
      effort: 'baixo',
    });
  }

  const issuesCount = issues.length;
  let status: CategoryResult['status'] = 'excelente';
  let score = 100;

  if (issues.some(i => i.severity === 'critica')) {
    status = 'critico';
    score = 40;
  } else if (issuesCount >= 2) {
    status = 'precisa_melhorar';
    score = 70;
  } else if (issuesCount === 1) {
    status = 'bom';
    score = 85;
  }

  return {
    key: 'dynamic_content',
    title: 'Elementos Dinâmicos e Movimento',
    status,
    score,
    issuesCount,
    severity: issues.some(i => i.severity === 'critica') ? 'critica' : issues.some(i => i.severity === 'alta') ? 'alta' : 'media',
    summary:
      issuesCount === 0
        ? 'Nenhum elemento em movimento descontrolado foi detectado. Animações parecem controladas ou estáticas.'
        : `Identificamos ${issuesCount} item(ns) dinâmico(s) que podem exigir controles de pausa ou respeito a prefers-reduced-motion.`,
    issues,
    requiresManualReview: true,
    manualReviewNotes: 'Verifique se banners rotativos pausam automaticamente ao receber foco do mouse (:hover) ou do teclado (:focus).',
  };
}
