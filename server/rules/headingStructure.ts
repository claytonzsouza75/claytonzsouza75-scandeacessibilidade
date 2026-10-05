import type { CheerioAPI } from 'cheerio';
import type { CategoryResult, HeadingItem, Issue } from '../../src/types/accessibility.js';

export function auditHeadingStructure($: CheerioAPI): CategoryResult {
  const issues: Issue[] = [];
  const headingList: { level: number; text: string; snippet: string; index: number }[] = [];

  // Extract all headings in document order
  $('h1, h2, h3, h4, h5, h6').each((index, el) => {
    const $el = $(el);
    const tagName = el.tagName.toLowerCase();
    const level = Number.parseInt(tagName.replace('h', ''), 10);
    const text = $el.text().trim().replace(/\s+/g, ' ');
    const snippet = $.html(el).slice(0, 160);

    headingList.push({ level, text, snippet, index });

    // Check for empty headings
    if (!text && $el.find('img[alt], svg[aria-label]').length === 0) {
      issues.push({
        id: `heading-empty-${index + 1}`,
        categoryKey: 'heading_structure',
        title: `Cabeçalho <${tagName}> vazio ou sem texto descritivo`,
        severity: 'media',
        status: 'falha',
        selector: tagName,
        htmlSnippet: snippet,
        location: 'estrutura de títulos',
        description: `Foi encontrada uma tag de cabeçalho <${tagName}> que não contém nenhum texto nem imagem descritiva em seu interior.`,
        whyItMatters: 'Leitores de tela navegam por atalhos de títulos (tecla H). Títulos vazios causam anúncios em branco que desorientam a pessoa usuária.',
        whoIsAffected: 'Usuários de leitores de tela em modo de navegação estrutural.',
        howToFix: `Remova a tag <${tagName}> vazia ou insira um título descritivo para a seção correspondente.`,
        suggestedCode: `<${tagName}>Título descritivo da seção</${tagName}>`,
        ruleViolated: 'WCAG 2.1 — Critério 1.3.1: Informações e Relações (Nível A) e Critério 2.4.6: Cabeçalhos e Rótulos (Nível AA)',
        requiresManualReview: false,
        effort: 'baixo',
      });
    }
  });

  const h1Elements = headingList.filter(h => h.level === 1);

  // 1. Missing H1
  if (h1Elements.length === 0) {
    issues.push({
      id: 'heading-missing-h1',
      categoryKey: 'heading_structure',
      title: 'A página não possui um cabeçalho principal <h1>',
      severity: 'alta',
      status: 'falha',
      selector: 'h1',
      htmlSnippet: '<!-- Nenhum <h1> encontrado -->',
      location: 'topo do conteúdo principal',
      description: 'Não foi encontrado nenhum elemento <h1> na página. O <h1> define o tema ou propósito primordial do documento.',
      whyItMatters: 'O <h1> é a primeira referência que leitores de tela buscam para entender em qual página o usuário se encontra.',
      whoIsAffected: 'Pessoas com deficiência visual e qualquer pessoa que utilize navegação semântica.',
      howToFix: 'Insira um único título <h1> claro no início da área principal do documento.',
      suggestedCode: `<h1>Título Principal da Página</h1>`,
      ruleViolated: 'WCAG 2.1 — Critério 1.3.1: Informações e Relações (Nível A) e Critério 2.4.6 (Nível AA)',
      requiresManualReview: false,
      effort: 'baixo',
    });
  } else if (h1Elements.length > 2) {
    // Multiple H1s warning
    issues.push({
      id: 'heading-multiple-h1',
      categoryKey: 'heading_structure',
      title: `Foram encontrados ${h1Elements.length} títulos <h1> na mesma página`,
      severity: 'baixa',
      status: 'aviso',
      selector: 'h1',
      htmlSnippet: h1Elements.map(h => h.snippet).slice(0, 2).join('\n'),
      location: 'estrutura de cabeçalhos',
      description: `A página possui ${h1Elements.length} elementos <h1>. Embora o HTML5 permita múltiplos <h1> com seções independentes, as boas práticas de acessibilidade recomendam um único <h1> principal por página.`,
      whyItMatters: 'Ter múltiplos <h1> pode confundir a hierarquia sobre qual é a ideia central da página.',
      whoIsAffected: 'Usuários de tecnologias assistivas que utilizam títulos para compreender a arquitetura da informação.',
      howToFix: 'Mantenha apenas um <h1> para o tema principal e rebaixe os demais para <h2>.',
      suggestedCode: `<h1>Título Principal Único</h1>\n  <h2>Subtítulo ou Seção 1</h2>\n  <h2>Subtítulo ou Seção 2</h2>`,
      ruleViolated: 'Boas Práticas de Acessibilidade — Arquitetura de Informação Semântica',
      requiresManualReview: false,
      effort: 'baixo',
    });
  }

  // 2. Hierarchy skips (e.g. H1 -> H4 or H2 -> H5)
  const headingsTree: HeadingItem[] = [];
  let previousLevel = 0;

  for (let i = 0; i < headingList.length; i++) {
    const curr = headingList[i];
    let hasWarning = false;
    let warningMessage: string | undefined;

    if (previousLevel > 0 && curr.level > previousLevel + 1) {
      hasWarning = true;
      warningMessage = `Salto incorreto na hierarquia: de <h${previousLevel}> para <h${curr.level}> sem passar por <h${previousLevel + 1}>.`;

      issues.push({
        id: `heading-skip-${curr.index + 1}`,
        categoryKey: 'heading_structure',
        title: `Salto de hierarquia: <h${previousLevel}> para <h${curr.level}> ("${curr.text.slice(0, 30)}...")`,
        severity: 'alta',
        status: 'falha',
        selector: `h${curr.level}`,
        htmlSnippet: curr.snippet,
        location: `após elemento <h${previousLevel}>`,
        description: `A estrutura de títulos pulou níveis hierárquicos (de <h${previousLevel}> direto para <h${curr.level}>), sem os níveis intermediários esperados.`,
        whyItMatters: 'A navegação em árvore por leitores de tela depende de uma sequência lógica linear. Um salto faz o usuário acreditar que perdeu conteúdo importante.',
        whoIsAffected: 'Pessoas com deficiência visual e usuários com dificuldades cognitivas.',
        howToFix: `Ajuste a tag para <h${previousLevel + 1}> ou reestruture a árvore semântica da página. Use CSS se o objetivo for apenas mudar o tamanho visual.`,
        suggestedCode: `<!-- Ajuste de nível: substitua <h${curr.level}> por <h${previousLevel + 1}> -->\n<h${previousLevel + 1} class="text-sm font-semibold">\n  ${curr.text || 'Título da Seção'}\n</h${previousLevel + 1}>`,
        ruleViolated: 'WCAG 2.1 — Critério 1.3.1: Informações e Relações (Nível A)',
        requiresManualReview: false,
        effort: 'medio',
      });
    }

    headingsTree.push({
      id: `node-${curr.index + 1}`,
      level: curr.level,
      text: curr.text || `[Sem texto visível: <h${curr.level}>]`,
      hasWarning,
      warningMessage,
    });

    previousLevel = curr.level;
  }

  // 3. Check for Semantic Landmarks: <header>, <nav>, <main>, <footer>
  const hasMain = $('main, [role="main"]').length > 0;
  const hasNav = $('nav, [role="navigation"]').length > 0;
  const hasHeader = $('header, [role="banner"]').length > 0;
  const hasFooter = $('footer, [role="contentinfo"]').length > 0;

  if (!hasMain) {
    issues.push({
      id: 'heading-no-main-landmark',
      categoryKey: 'heading_structure',
      title: 'Ausência da marca semântica principal <main>',
      severity: 'alta',
      status: 'falha',
      selector: 'main',
      htmlSnippet: '<body> <div> ... </div> </body>',
      location: 'estrutura global do HTML',
      description: 'A página não utiliza a tag <main> (ou role="main") para delimitar o bloco de conteúdo primário.',
      whyItMatters: 'Landmarks permitem que usuários de tecnologias assistivas saltem diretamente para a área central da página sem ouvir o menu repetidamente.',
      whoIsAffected: 'Pessoas cegas ou com baixa visão que navegam por marcos estruturais (landmarks).',
      howToFix: 'Envolva o conteúdo principal da página dentro de uma tag <main>.',
      suggestedCode: `<header>...</header>\n<nav>...</nav>\n<main id="conteudo-principal">\n  <!-- Conteúdo central aqui -->\n</main>\n<footer>...</footer>`,
      ruleViolated: 'WCAG 2.1 — Critério 1.3.1: Informações e Relações (Nível A)',
      requiresManualReview: false,
      effort: 'baixo',
    });
  }

  const issuesCount = issues.length;
  let status: CategoryResult['status'] = 'excelente';
  let score = 100;

  if (issues.some(i => i.severity === 'alta') || issuesCount >= 4) {
    status = 'precisa_melhorar';
    score = Math.max(45, 100 - issuesCount * 12);
  } else if (issuesCount >= 1) {
    status = 'bom';
    score = Math.max(70, 100 - issuesCount * 10);
  }

  return {
    key: 'heading_structure',
    title: 'Estrutura e Hierarquia Desorganizadas',
    status,
    score,
    issuesCount,
    severity: issues.some(i => i.severity === 'alta') ? 'alta' : 'media',
    summary:
      issuesCount === 0
        ? `A hierarquia de títulos e marcos semânticos (H1 → H2, <main>, <nav>) está bem estruturada e sem saltos.`
        : `Identificamos ${issuesCount} problema(s) na hierarquia (saltos de nível, ausência de H1 ou landmarks semânticos ausentes).`,
    issues,
    requiresManualReview: false,
    meta: {
      headingsTree,
      hasMain,
      hasNav,
      hasHeader,
      hasFooter,
    },
  };
}
