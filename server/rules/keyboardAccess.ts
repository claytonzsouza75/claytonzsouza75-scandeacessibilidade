import type { CheerioAPI } from 'cheerio';
import type { CategoryResult, Issue } from '../../src/types/accessibility.js';

export function auditKeyboardAccess($: CheerioAPI): CategoryResult {
  const issues: Issue[] = [];

  // Interactive ARIA roles that require keyboard focusability
  const interactiveRoles = new Set([
    'button',
    'link',
    'tab',
    'menuitem',
    'menuitemcheckbox',
    'menuitemradio',
    'checkbox',
    'switch',
    'radio',
    'option',
    'treeitem',
    'slider',
    'spinbutton',
    'combobox',
    'searchbox',
  ]);

  // Native tags that are inherently interactive and keyboard focusable
  const nativeFocusableTags = new Set([
    'button',
    'input',
    'select',
    'textarea',
    'summary',
  ]);

  let missingTabindexCount = 0;
  let missingRoleCount = 0;
  let positiveTabindexCount = 0;
  let hiddenFocusableCount = 0;

  // Track overall focusable elements on the page for reporting
  let totalFocusableElements = 0;

  // Count native focusable controls
  $('button:not([disabled]), input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], summary, [tabindex="0"]').each(() => {
    totalFocusableElements++;
  });

  // =========================================================================
  // 1. DETECÇÃO DE TABINDEX AUSENTE EM ELEMENTOS INTERATIVOS
  // =========================================================================

  // 1A. Elementos com role interativo em tags não-nativas mas sem tabindex="0"
  $('[role]').each((index, el) => {
    const $el = $(el);
    const tagName = el.tagName.toLowerCase();
    const role = ($el.attr('role') || '').trim().toLowerCase();

    // Skip if it's already a native tag or a link with href
    if (nativeFocusableTags.has(tagName) || (tagName === 'a' && $el.attr('href') !== undefined)) {
      return;
    }

    if (interactiveRoles.has(role)) {
      const tabindex = $el.attr('tabindex');
      // If tabindex is missing or invalid for keyboard tab sequence
      if (tabindex === undefined || tabindex === null || tabindex === '') {
        missingTabindexCount++;
        const snippet = $.html(el).slice(0, 180);
        const textContent = $el.text().trim() || 'Ação';

        issues.push({
          id: `keyboard-missing-tabindex-role-${index + 1}`,
          categoryKey: 'keyboard_access',
          title: `Elemento com role="${role}" sem 'tabindex="0"' para receber foco por teclado`,
          severity: 'alta',
          status: 'falha',
          selector: `${tagName}[role="${role}"]`,
          htmlSnippet: snippet,
          location: $el.closest('header, nav, main, footer, div, section').prop('tagName')?.toLowerCase() || 'corpo do documento',
          description: `O elemento <${tagName}> declara o papel semântico role="${role}", mas não possui o atributo tabindex="0". Sem ele, o navegador não inclui o elemento na sequência de tabulação da tecla Tab.`,
          whyItMatters: 'Usuários que navegam com a tecla Tab simplesmente passam direto por esse controle, sem conseguir alcançá-lo ou interagir com ele.',
          whoIsAffected: 'Pessoas com deficiência motora, usuárias de tecnologias assistivas de chave (switch devices) e qualquer pessoa navegando exclusivamente via teclado.',
          howToFix: `Prefira usar uma tag nativa (como <button type="button"> para botões ou <a href="..."> para links). Se for estritamente necessário usar <${tagName}>, adicione tabindex="0" e registre ouvintes para as teclas Enter e Barra de Espaço.`,
          suggestedCode: `<!-- Recomendado: use a tag nativa equivalente -->\n<button type="button">\n  ${textContent}\n</button>\n\n<!-- Ou adicione tabindex="0" ao controle customizado: -->\n<${tagName} role="${role}" tabindex="0" onkeydown="handleKey(event)">\n  ${textContent}\n</${tagName}>`,
          ruleViolated: 'WCAG 2.1 — Critério 2.1.1: Teclado (Nível A)',
          requiresManualReview: false,
          effort: 'baixo',
        });
      }
    }
  });

  // 1B. Elementos não-nativos com ouvintes interativos (onclick, data-action, etc.) sem tabindex
  $('div[onclick], span[onclick], p[onclick], i[onclick], a:not([href])').each((index, el) => {
    const $el = $(el);
    const tagName = el.tagName.toLowerCase();
    const role = $el.attr('role');
    const tabindex = $el.attr('tabindex');

    // If it has no tabindex and is not a link with href
    if (tabindex === undefined || tabindex === null) {
      missingTabindexCount++;
      const snippet = $.html(el).slice(0, 180);
      const textContent = $el.text().trim() || 'Ação interativa';

      issues.push({
        id: `keyboard-missing-tabindex-click-${index + 1}`,
        categoryKey: 'keyboard_access',
        title: `Elemento <${tagName}> com ação de clique sem 'tabindex' para foco por teclado`,
        severity: 'alta',
        status: 'falha',
        selector: `${tagName}[onclick]`,
        htmlSnippet: snippet,
        location: $el.closest('header, nav, main, footer, div, section').prop('tagName')?.toLowerCase() || 'corpo do documento',
        description: `O elemento <${tagName}> possui um manipulador de clique (onclick), mas não é focável por teclado porque não possui tabindex="0" nem é uma tag nativamente focável.`,
        whyItMatters: 'Apenas usuários que utilizam mouse ou toque conseguem acionar esta função. Usuários de teclado não têm como colocar o cursor de foco sobre ele.',
        whoIsAffected: 'Pessoas com deficiência física/motora que não utilizam mouse, usuários de navegadores por comando de voz e usuários de leitores de tela.',
        howToFix: `Substitua a tag <${tagName}> por <button type="button"> nativo. Os botões nativos recebem foco automaticamente e respondem às teclas Enter e Espaço sem necessidade de código extra.`,
        suggestedCode: `<!-- Antes: <${tagName} onclick="..."> -->\n<button type="button" onclick="executarAcao()">\n  ${textContent}\n</button>`,
        ruleViolated: 'WCAG 2.1 — Critério 2.1.1: Teclado (Nível A)',
        requiresManualReview: false,
        effort: 'medio',
      });
    }
  });

  // =========================================================================
  // 2. DETECÇÃO DE ELEMENTOS INTERATIVOS SEM ROLE ADEQUADO
  // =========================================================================

  // 2A. Elementos com tabindex="0" em tags não-semânticas sem role
  $('[tabindex="0"], [tabindex=""]').each((index, el) => {
    const $el = $(el);
    const tagName = el.tagName.toLowerCase();
    const role = ($el.attr('role') || '').trim().toLowerCase();

    // Native focusable tags already have implicit ARIA roles (button, link, textbox, etc.)
    if (nativeFocusableTags.has(tagName) || (tagName === 'a' && $el.attr('href') !== undefined)) {
      return;
    }

    // Skip if element is a scrollable container with an accessible name
    const isScrollableRegion = role === 'region' && ($el.attr('aria-label') || $el.attr('aria-labelledby'));
    if (isScrollableRegion) return;

    // Check if role is missing, empty, or generic/presentation
    if (!role || role === 'presentation' || role === 'none' || role === 'generic') {
      missingRoleCount++;
      const snippet = $.html(el).slice(0, 180);
      const textContent = $el.text().trim() || 'Controle sem papel';

      issues.push({
        id: `keyboard-missing-role-${index + 1}`,
        categoryKey: 'keyboard_access',
        title: `Elemento <${tagName}> focável por teclado sem atributo 'role' adequado`,
        severity: 'alta',
        status: 'falha',
        selector: `${tagName}[tabindex="0"]`,
        htmlSnippet: snippet,
        location: $el.closest('header, nav, main, footer, div, section').prop('tagName')?.toLowerCase() || 'corpo do documento',
        description: `O elemento <${tagName}> recebe foco por teclado através de tabindex="0", mas não possui um papel semântico (como role="button", role="link" ou role="tab") para identificar sua finalidade.`,
        whyItMatters: 'Leitores de tela anunciarão apenas texto estático ou "agrupamento", deixando o usuário sem saber se aquele elemento é clicável ou o que acontece ao ativá-lo.',
        whoIsAffected: 'Pessoas cegas ou com baixa visão que utilizam leitores de tela (NVDA, JAWS, VoiceOver, TalkBack).',
        howToFix: `Substitua a tag por uma tag semântica nativa (ex: <button> ou <a href="...">). Caso mantenha o elemento customizado, defina um role explícito (ex: role="button") e forneça aria-label se necessário.`,
        suggestedCode: `<!-- Opção 1: Tag semântica nativa (Recomendada) -->\n<button type="button">\n  ${textContent}\n</button>\n\n<!-- Opção 2: Atribuir role explícito -->\n<${tagName} role="button" tabindex="0">\n  ${textContent}\n</${tagName}>`,
        ruleViolated: 'WCAG 2.1 — Critério 4.1.2: Nome, Função, Valor (Nível A)',
        requiresManualReview: false,
        effort: 'baixo',
      });
    }
  });

  // 2B. Tags <a> sem href utilizadas como pseudo-links ou pseudo-botões
  $('a:not([href])').each((index, el) => {
    const $el = $(el);
    const role = $el.attr('role');
    const snippet = $.html(el).slice(0, 180);

    // If an <a> has no href and no role="button", it's missing role and semantics
    if (!role || role !== 'button') {
      missingRoleCount++;
      issues.push({
        id: `keyboard-anchor-no-href-${index + 1}`,
        categoryKey: 'keyboard_access',
        title: 'Tag <a> sem atributo "href" (perda de semântica e foco nativo)',
        severity: 'alta',
        status: 'falha',
        selector: 'a:not([href])',
        htmlSnippet: snippet,
        location: $el.closest('header, nav, main, footer, div, section').prop('tagName')?.toLowerCase() || 'navegação',
        description: 'Foi encontrada uma tag <a> sem o atributo "href". Pelo padrão do HTML5, links sem href não representam hiperlinks válidos, não recebem foco por teclado e não têm papel anunciado por leitores de tela.',
        whyItMatters: 'Usuários de teclado não conseguem navegar para o link via tecla Tab e leitores de tela tratam o texto como simples parágrafo.',
        whoIsAffected: 'Usuários de navegação por teclado e usuários de leitores de tela.',
        howToFix: 'Se o objetivo for navegar para uma página ou âncora, adicione o atributo href="...". Se for disparar uma ação JavaScript na página, substitua por <button type="button">.',
        suggestedCode: `<!-- Se for navegação: -->\n<a href="/destino">${$el.text().trim() || 'Link'}</a>\n\n<!-- Se for ação em página: -->\n<button type="button">${$el.text().trim() || 'Botão'}</button>`,
        ruleViolated: 'WCAG 2.1 — Critério 4.1.2: Nome, Função, Valor (Nível A)',
        requiresManualReview: false,
        effort: 'baixo',
      });
    }
  });

  // =========================================================================
  // 3. ORDEM DE FOCO LÓGICA (WCAG 2.4.3 - ORDEM DO FOCO)
  // =========================================================================

  // 3A. Detecção de tabindex positivo (subverte a ordem sequencial natural)
  const positiveTabindexElements: { val: number; snippet: string }[] = [];
  $('[tabindex]').each((_, el) => {
    const $el = $(el);
    const tabindexVal = Number.parseInt($el.attr('tabindex') || '0', 10);
    if (tabindexVal > 0) {
      positiveTabindexCount++;
      positiveTabindexElements.push({
        val: tabindexVal,
        snippet: $.html(el).slice(0, 180),
      });
    }
  });

  if (positiveTabindexElements.length > 0) {
    const firstItem = positiveTabindexElements[0];
    const vals = positiveTabindexElements.map(p => p.val).join(', ');

    issues.push({
      id: 'keyboard-positive-tabindex',
      categoryKey: 'keyboard_access',
      title: `Uso prejudicial de tabindex positivo (tabindex="${vals}") que quebra a ordem lógica de foco`,
      severity: 'alta',
      status: 'falha',
      selector: `[tabindex="${firstItem.val}"]`,
      htmlSnippet: firstItem.snippet,
      location: 'ordem de foco sequencial do DOM',
      description: `Foram encontrados elementos com tabindex maior que zero (valores: ${vals}). O navegador força a tecla Tab a visitar primeiramente todos os tabindexes positivos antes dos elementos naturais, quebrando a sequência lógica de leitura da página.`,
      whyItMatters: 'O cursor de foco do teclado salta aleatoriamente de um ponto para outro da tela, desorientando completamente quem não utiliza mouse.',
      whoIsAffected: 'Pessoas com deficiência motora, usuários de leitores de tela e pessoas com deficiências cognitivas que dependem da ordem linear e previsível de navegação.',
      howToFix: 'Remova os valores positivos de tabindex. Permita que os elementos sigam a ordem natural da árvore DOM ou utilize tabindex="0" estritamente onde for necessário.',
      suggestedCode: `<!-- Remova o tabindex positivo: -->\n<!-- Antes: <div tabindex="${firstItem.val}"> -->\n<!-- Depois: posicione o elemento na ordem correta do DOM ou use tabindex="0" -->\n<button type="button">Ação</button>`,
      ruleViolated: 'WCAG 2.1 — Critério 2.4.3: Ordem do Foco (Nível A)',
      requiresManualReview: false,
      effort: 'baixo',
    });
  }

  // 3B. Foco Fantasma: Elementos focáveis contidos em contêineres com aria-hidden="true"
  $('[aria-hidden="true"]').each((index, el) => {
    const $container = $(el);
    // Find focusable descendants
    const focusableInside = $container.find(
      'button:not([disabled]):not([tabindex="-1"]), a[href]:not([tabindex="-1"]), input:not([type="hidden"]):not([disabled]):not([tabindex="-1"]), select:not([disabled]):not([tabindex="-1"]), textarea:not([disabled]):not([tabindex="-1"]), [tabindex="0"]'
    );

    if (focusableInside.length > 0) {
      hiddenFocusableCount += focusableInside.length;
      const firstFocusable = focusableInside.first();
      const snippet = $.html(firstFocusable).slice(0, 180);

      issues.push({
        id: `keyboard-hidden-focusable-${index + 1}`,
        categoryKey: 'keyboard_access',
        title: `Elemento interativo focável dentro de contêiner com aria-hidden="true" (foco fantasma)`,
        severity: 'alta',
        status: 'falha',
        selector: `[aria-hidden="true"] ${firstFocusable.prop('tagName')?.toLowerCase()}`,
        htmlSnippet: snippet,
        location: 'contêiner oculto ou modal inativo',
        description: `O contêiner possui aria-hidden="true", mas contém ${focusableInside.length} elemento(s) focáveis sem tabindex="-1" ou disabled. Isso cria uma grave incoerência na ordem de foco: o teclado atinge o elemento visualmente, mas o leitor de tela o ignora completamente.`,
        whyItMatters: 'O usuário de tecnologia assistiva cai em uma armadilha de foco silenciosa, sem saber em qual elemento está focado.',
        whoIsAffected: 'Usuários de leitores de tela e tecnologias assistivas que utilizam navegação mista de teclado e voz.',
        howToFix: 'Adicione tabindex="-1" ou o atributo hidden/inert aos elementos do contêiner enquanto ele estiver inativo ou oculto.',
        suggestedCode: `<!-- Se o contêiner estiver oculto, adicione inert ou tabindex="-1" nos filhos: -->\n<div aria-hidden="true" inert>\n  <button tabindex="-1">Ação</button>\n</div>`,
        ruleViolated: 'WCAG 2.1 — Critério 2.4.3: Ordem do Foco (Nível A) e Critério 4.1.2',
        requiresManualReview: false,
        effort: 'medio',
      });
    }
  });

  // =========================================================================
  // 4. SUPRESSÃO GLOBAL DE OUTLINE (FOCO VISÍVEL - WCAG 2.4.7)
  // =========================================================================
  let hasGlobalOutlineNone = false;
  $('style').each((_, el) => {
    const cssText = $(el).text();
    if (
      /(\*|button|a)\s*\{[^}]*outline\s*:\s*(none|0)[^}]*\}/i.test(cssText) &&
      !cssText.includes(':focus-visible')
    ) {
      hasGlobalOutlineNone = true;
    }
  });

  if (hasGlobalOutlineNone) {
    issues.push({
      id: 'keyboard-global-outline-none',
      categoryKey: 'keyboard_access',
      title: 'CSS global suprime o contorno de foco (outline: none) sem alternativa acessível',
      severity: 'critica',
      status: 'falha',
      selector: 'style',
      htmlSnippet: '<style> * { outline: none; } </style>',
      location: 'folhas de estilo da página',
      description: 'Existe uma regra CSS que remove o contorno do foco (outline: none ou outline: 0) sem definir uma estilização substituta para :focus-visible.',
      whyItMatters: 'Torna o cursor de foco invisível para qualquer usuário navegando com a tecla Tab.',
      whoIsAffected: 'Qualquer pessoa que use teclado para navegar na web.',
      howToFix: 'Remova a supressão global de outline e forneça um estilo de alto contraste para :focus-visible.',
      suggestedCode: `:focus-visible {\n  outline: 2px solid #4f46e5;\n  outline-offset: 2px;\n}`,
      ruleViolated: 'WCAG 2.1 — Critério 2.4.7: Foco Visível (Nível AA)',
      requiresManualReview: false,
      effort: 'baixo',
    });
  }

  // =========================================================================
  // 5. ATALHO PARA O CONTEÚDO PRINCIPAL (SKIP LINK - WCAG 2.4.1)
  // =========================================================================
  const skipLink = $('a[href^="#"]').filter((_, el) => {
    const text = $(el).text().toLowerCase();
    return (
      text.includes('pular') ||
      text.includes('conteúdo') ||
      text.includes('conteudo') ||
      text.includes('skip') ||
      text.includes('ir para')
    );
  });

  const hasSkipLink = skipLink.length > 0;
  if (!hasSkipLink) {
    issues.push({
      id: 'keyboard-no-skip-link',
      categoryKey: 'keyboard_access',
      title: 'Ausência de link de atalho para o conteúdo principal (Skip Link)',
      severity: 'media',
      status: 'aviso',
      selector: 'body',
      htmlSnippet: '<body> ... <header> ... </header>',
      location: 'início do documento HTML',
      description: 'Não foi encontrado um link de atalho (ex: "Pular para o conteúdo principal") no topo da página. Esse link permite que usuários de teclado saltem cabeçalhos e menus extensos.',
      whyItMatters: 'Usuários de teclado precisam pressionar a tecla Tab dezenas de vezes a cada carregamento de página apenas para passar pelo menu e alcançar o conteúdo.',
      whoIsAffected: 'Pessoas com deficiência motora, usuários de leitores de tela e pessoas com tendinite ou LER.',
      howToFix: 'Insira um link visível ao foco no início do <body> apontando para o id do elemento <main>.',
      suggestedCode: `<a href="#conteudo-principal" class="sr-only focus:not-sr-only focus:p-3 focus:bg-indigo-600 focus:text-white focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded">\n  Pular para o conteúdo principal\n</a>\n\n<main id="conteudo-principal">\n  <!-- Conteúdo aqui -->\n</main>`,
      ruleViolated: 'WCAG 2.1 — Critério 2.4.1: Evitar Blocos (Nível A)',
      requiresManualReview: false,
      effort: 'baixo',
    });
  }

  const issuesCount = issues.length;
  let status: CategoryResult['status'] = 'excelente';
  let score = 100;

  if (issues.some(i => i.severity === 'critica') || issuesCount >= 4) {
    status = 'critico';
    score = Math.max(30, 100 - issuesCount * 14);
  } else if (issuesCount >= 2) {
    status = 'precisa_melhorar';
    score = Math.max(60, 100 - issuesCount * 11);
  } else if (issuesCount === 1) {
    status = 'bom';
    score = 80;
  }

  // Summary generation based on findings
  let summaryText = '';
  if (issuesCount === 0) {
    summaryText = `Conformidade confirmada: todos os ${totalFocusableElements} controles interativos possuem semântica e papéis adequados, a ordem do DOM é lógica sem tabindexes artificiais e o foco visual está preservado.`;
  } else {
    const detailsList: string[] = [];
    if (missingTabindexCount > 0) {
      detailsList.push(`${missingTabindexCount} elemento(s) com 'tabindex' ausente`);
    }
    if (missingRoleCount > 0) {
      detailsList.push(`${missingRoleCount} controle(s) sem 'role' adequado`);
    }
    if (positiveTabindexCount > 0) {
      detailsList.push(`${positiveTabindexCount} tabindex(es) positivo(s) que quebram a ordem lógica`);
    }
    if (hiddenFocusableCount > 0) {
      detailsList.push(`${hiddenFocusableCount} elemento(s) com foco fantasma em contêiner oculto`);
    }
    if (hasGlobalOutlineNone) {
      detailsList.push('supressão global de contorno de foco');
    }
    if (!hasSkipLink) {
      detailsList.push('ausência de skip link');
    }

    summaryText = `Identificamos ${issuesCount} barreira(s) de teclado: ${detailsList.join(', ')}.`;
  }

  return {
    key: 'keyboard_access',
    title: 'Navegação por Teclado, Tabindex e Papéis Interativos',
    status,
    score,
    issuesCount,
    severity: issues.some(i => i.severity === 'critica')
      ? 'critica'
      : issues.some(i => i.severity === 'alta')
      ? 'alta'
      : 'media',
    summary: summaryText,
    issues,
    requiresManualReview: true,
    manualReviewNotes:
      'A ordem real de tabulação e o comportamento das teclas de navegação (Tab, Shift+Tab, Enter, Espaço, Esc e setas direcionais em menus e modais) devem ser testados manualmente com navegação por teclado e leitor de tela.',
    meta: {
      totalFocusableElements,
      missingTabindexCount,
      missingRoleCount,
      positiveTabindexCount,
      hiddenFocusableCount,
      hasSkipLink,
      hasLogicalFocusOrder: positiveTabindexCount === 0 && hiddenFocusableCount === 0,
      hasVisibleFocusStyle: !hasGlobalOutlineNone,
    },
  };
}
