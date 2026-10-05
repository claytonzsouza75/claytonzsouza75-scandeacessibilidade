import type { CheerioAPI } from 'cheerio';
import type { CategoryResult, Issue } from '../../src/types/accessibility.js';

export function auditVideos($: CheerioAPI): CategoryResult {
  const issues: Issue[] = [];
  let mediaCount = 0;

  // 1. Analyze <video> tags
  $('video').each((index, el) => {
    mediaCount++;
    const $el = $(el);
    const hasCaptions = $el.find('track[kind="captions"], track[kind="subtitles"]').length > 0;
    const snippet = $.html(el).slice(0, 180);

    if (!hasCaptions) {
      issues.push({
        id: `video-no-captions-${index + 1}`,
        categoryKey: 'videos',
        title: 'Elemento <video> sem faixa de legendas/captions sincronizadas (<track>)',
        severity: 'alta',
        status: 'falha',
        selector: 'video',
        htmlSnippet: snippet,
        location: 'reprodutor de vídeo nativo',
        description: 'A tag de vídeo HTML5 não possui nenhum elemento <track kind="captions"> ou <track kind="subtitles"> configurado.',
        whyItMatters: 'Pessoas com deficiência auditiva, surdas ou em ambientes ruidosos dependem de legendas fechadas para compreender a mensagem verbal do vídeo.',
        whoIsAffected: 'Pessoas surdas ou ensurdecidas, com perda auditiva parcial, e pessoas assistindo sem fone de ouvido.',
        howToFix: 'Insira um arquivo de legendas .vtt sincronizado com o vídeo utilizando a tag <track>.',
        suggestedCode: `<video controls>\n  <source src="video.mp4" type="video/mp4">\n  <track kind="captions" src="legendas-pt.vtt" srclang="pt" label="Português" default>\n</video>`,
        ruleViolated: 'WCAG 2.1 — Critério 1.2.2: Legendas (Pré-gravadas) (Nível A)',
        requiresManualReview: true,
        effort: 'medio',
      });
    }
  });

  // 2. Analyze video iframes (YouTube, Vimeo, etc.)
  $('iframe[src*="youtube"], iframe[src*="vimeo"], iframe[src*="player"], iframe[src*="dailymotion"]').each((index, el) => {
    mediaCount++;
    const $el = $(el);
    const title = $el.attr('title')?.trim();
    const ariaLabel = $el.attr('aria-label')?.trim();
    const src = $el.attr('src') || '';
    const snippet = $.html(el).slice(0, 180);

    if (!title && !ariaLabel) {
      issues.push({
        id: `video-iframe-no-title-${index + 1}`,
        categoryKey: 'videos',
        title: 'Iframe de vídeo incorporado sem atributo "title" acessível',
        severity: 'alta',
        status: 'falha',
        selector: `iframe[src*="${src.slice(0, 30)}"]`,
        htmlSnippet: snippet,
        location: 'incorporação de vídeo externo (iframe)',
        description: 'O iframe que carrega o vídeo externo não possui um atributo "title" descritivo para identificação no leitor de tela.',
        whyItMatters: 'Leitores de tela navegam por iframes anunciando seu título. Sem o atributo "title", anunciam a URL do player ou apenas "quadro".',
        whoIsAffected: 'Usuários de leitores de tela.',
        howToFix: 'Adicione um atributo title explicando o assunto do vídeo.',
        suggestedCode: `<iframe\n  src="${src}"\n  title="Vídeo demonstrativo: como funciona o sistema de acessibilidade"\n  allowfullscreen\n></iframe>`,
        ruleViolated: 'WCAG 2.1 — Critério 4.1.2: Nome, Função e Valor (Nível A)',
        requiresManualReview: false,
        effort: 'baixo',
      });
    }
  });

  const issuesCount = issues.length;
  let status: CategoryResult['status'] = 'excelente';
  let score = 100;

  if (issuesCount >= 3) {
    status = 'precisa_melhorar';
    score = 65;
  } else if (issuesCount >= 1) {
    status = 'bom';
    score = 80;
  }

  return {
    key: 'videos',
    title: 'Vídeos e Mídias Excludentes',
    status,
    score,
    issuesCount,
    severity: issuesCount > 0 ? 'alta' : 'baixa',
    summary:
      mediaCount === 0
        ? 'Nenhum reprodutor de vídeo ou áudio nativo foi detectado na página analisada.'
        : issuesCount === 0
        ? `Todos os ${mediaCount} elementos de mídia verificados possuem títulos ou faixas descritivas.`
        : `Identificamos ${issuesCount} problema(s) em mídias de vídeo (ausência de legendas embutidas ou título em iframes).`,
    issues,
    requiresManualReview: true,
    manualReviewNotes:
      'IMPORTANTE: Ter legendas não torna o vídeo 100% acessível. Aspectos essenciais como audiodescrição de cenas visuais, tradução para Libras (Língua Brasileira de Sinais) e qualidade da legenda exigem validação humana.',
  };
}
