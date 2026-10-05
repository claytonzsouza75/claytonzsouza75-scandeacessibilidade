import type { CheerioAPI } from 'cheerio';
import type { CategoryResult, Issue } from '../../src/types/accessibility.js';
import { extractInlineColors, getContrastRatio, parseColor } from '../utils/contrast.js';

export function auditButtonContrast($: CheerioAPI): CategoryResult {
  const issues: Issue[] = [];
  let totalButtonsChecked = 0;

  $('button, input[type="button"], input[type="submit"], [role="button"], a.btn, a.button').each((index, el) => {
    const $el = $(el);
    totalButtonsChecked++;

    const text = $el.text().trim();
    const styleAttr = $el.attr('style');
    const classAttr = ($el.attr('class') || '').toLowerCase();
    const tagName = el.tagName.toLowerCase();
    const snippet = $.html(el).slice(0, 180);

    // 1. Check for empty interactive buttons (no visible text, no aria-label)
    const ariaLabel = $el.attr('aria-label')?.trim();
    const ariaLabelledBy = $el.attr('aria-labelledby')?.trim();
    const title = $el.attr('title')?.trim();
    const hasImage = $el.find('img[alt], svg[aria-label], svg title').length > 0;

    if (!text && !ariaLabel && !ariaLabelledBy && !title && !hasImage) {
      issues.push({
        id: `btn-empty-${index + 1}`,
        categoryKey: 'button_contrast',
        title: 'Botão interativo sem texto ou nome acessível visível',
        severity: 'critica',
        status: 'falha',
        selector: `${tagName}${classAttr ? `.${classAttr.split(' ')[0]}` : ''}`,
        htmlSnippet: snippet,
        location: $el.closest('header, nav, form, main, footer').prop('tagName')?.toLowerCase() || 'botão',
        description: 'O botão não possui nenhum texto visível, nem atributo aria-label ou ícone com descrição textual.',
        whyItMatters: 'Um leitor de tela anunciará apenas "botão" sem informar qual ação será disparada ao clicar.',
        whoIsAffected: 'Pessoas com deficiência visual que usam leitores de tela ou comandos de voz.',
        howToFix: 'Adicione um texto descritivo no conteúdo do botão ou um atributo aria-label caso seja um botão de ícone.',
        suggestedCode: `<button type="button" aria-label="Fechar janela de diálogo">\n  <svg aria-hidden="true">...</svg>\n</button>`,
        ruleViolated: 'WCAG 2.1 — Critério 4.1.2: Nome, Função e Valor (Nível A)',
        requiresManualReview: false,
        effort: 'baixo',
      });
      return;
    }

    // 2. Check for inline style contrast if both color and backgroundColor are present
    const inlineColors = extractInlineColors(styleAttr);
    if (inlineColors.color && inlineColors.backgroundColor) {
      const fg = parseColor(inlineColors.color);
      const bg = parseColor(inlineColors.backgroundColor);

      if (fg && bg) {
        const ratio = getContrastRatio(fg, bg);
        if (ratio < 4.5) {
          const isCritical = ratio < 2.5;
          const isHigh = ratio < 3.0;

          issues.push({
            id: `btn-contrast-${index + 1}`,
            categoryKey: 'button_contrast',
            title: `Contraste insuficiente no botão: taxa de ${ratio.toFixed(2)}:1 (mínimo exigido 4.5:1)`,
            severity: isCritical ? 'critica' : isHigh ? 'alta' : 'media',
            status: 'falha',
            selector: `${tagName}[style*="color"]`,
            htmlSnippet: snippet,
            location: 'estilo inline do botão',
            description: `A relação de contraste calculada entre a cor do texto (${inlineColors.color}) e a cor de fundo (${inlineColors.backgroundColor}) é de apenas ${ratio.toFixed(2)}:1, violando o mínimo de 4.5:1 para texto normal da WCAG AA.`,
            whyItMatters: 'Textos com baixo contraste tornam-se ilegíveis para pessoas com baixa visão, idosos e pessoas usando dispositivos sob luz solar intensa.',
            whoIsAffected: 'Pessoas com baixa visão, daltonismo, sensibilidade à luz ou em telas de baixa qualidade.',
            howToFix: 'Ajuste a cor do texto para ser mais escura (ou o fundo mais claro) para atingir no mínimo 4.5:1 de contraste.',
            suggestedCode: `/* Ajuste de contraste para atingir 4.5:1 */\nbutton {\n  background-color: #1e293b; /* Fundo escuro */\n  color: #ffffff; /* Texto branco (contraste 15.6:1 - WCAG AAA) */\n}`,
            ruleViolated: 'WCAG 2.1 — Critério 1.4.3: Contraste Mínimo (Nível AA)',
            requiresManualReview: false,
            effort: 'baixo',
          });
        }
      }
    }

    // 3. Check for removed outline (focus suppression anti-pattern)
    if (styleAttr && (styleAttr.includes('outline:none') || styleAttr.includes('outline: 0') || styleAttr.includes('outline:0'))) {
      issues.push({
        id: `btn-outline-${index + 1}`,
        categoryKey: 'button_contrast',
        title: 'Remoção explícita do anel de foco (outline: none) no botão',
        severity: 'alta',
        status: 'falha',
        selector: `${tagName}[style*="outline"]`,
        htmlSnippet: snippet,
        location: 'estilo inline',
        description: 'O botão possui a propriedade "outline: none" ou "outline: 0", o que remove o indicador padrão de foco pelo teclado.',
        whyItMatters: 'Sem indicador visível de foco, usuários que navegam pela tecla Tab não conseguem saber qual botão está selecionado no momento.',
        whoIsAffected: 'Pessoas com deficiência motora que usam apenas teclado, tecnologias assistivas de chave (switch) ou navegação sequencial.',
        howToFix: 'Nunca remova o outline sem fornecer um indicador de foco visível alternativo (ex: :focus-visible { outline: 2px solid #4f46e5; }).',
        suggestedCode: `button:focus-visible {\n  outline: 2px solid #4f46e5;\n  outline-offset: 2px;\n}`,
        ruleViolated: 'WCAG 2.1 — Critério 2.4.7: Foco Visível (Nível AA)',
        requiresManualReview: false,
        effort: 'baixo',
      });
    }

    // 4. Clues for low contrast CSS classes (common anti-patterns: text-gray-400 on white, text-white on light yellow, etc.)
    if (classAttr.includes('text-gray-300') || classAttr.includes('text-slate-300') || classAttr.includes('text-zinc-300')) {
      if (!classAttr.includes('bg-') || classAttr.includes('bg-white') || classAttr.includes('bg-slate-100')) {
        issues.push({
          id: `btn-class-contrast-${index + 1}`,
          categoryKey: 'button_contrast',
          title: 'Indício de texto com cinza muito claro em fundo claro',
          severity: 'media',
          status: 'aviso',
          selector: `${tagName}.${classAttr.split(' ')[0]}`,
          htmlSnippet: snippet,
          location: 'classes de utilitários CSS',
          description: `O elemento interativo utiliza classes de texto cinza claro (${classAttr.split(' ').find(c => c.includes('text-gray') || c.includes('text-slate'))}) que frequentemente não atingem o contraste de 4.5:1 em fundos brancos.`,
          whyItMatters: 'Cores de texto desbotadas dificultam a legibilidade rápida de botões de ação e cancelamento.',
          whoIsAffected: 'Pessoas com acuidade visual reduzida ou telas com brilho reduzido.',
          howToFix: 'Utilize pelo menos cinza slate-700 (#334155) ou slate-900 (#0f172a) em fundos claros.',
          suggestedCode: `<button class="text-slate-800 bg-slate-100 px-4 py-2 rounded-lg font-medium">\n  ${text || 'Ação'}\n</button>`,
          ruleViolated: 'WCAG 2.1 — Critério 1.4.3: Contraste Mínimo (Nível AA)',
          requiresManualReview: true,
          effort: 'baixo',
        });
      }
    }
  });

  const issuesCount = issues.length;
  let status: CategoryResult['status'] = 'excelente';
  let score = 100;

  if (issuesCount >= 5) {
    status = 'critico';
    score = Math.max(35, 100 - issuesCount * 11);
  } else if (issuesCount >= 2) {
    status = 'precisa_melhorar';
    score = Math.max(60, 100 - issuesCount * 9);
  } else if (issuesCount === 1) {
    status = 'bom';
    score = 85;
  }

  return {
    key: 'button_contrast',
    title: 'Botões com Baixa Legibilidade e Contraste',
    status,
    score,
    issuesCount,
    severity: issues.some(i => i.severity === 'critica') ? 'critica' : issues.some(i => i.severity === 'alta') ? 'alta' : 'media',
    summary:
      issuesCount === 0
        ? `Todos os ${totalButtonsChecked} botões verificados possuem identificação acessível e indicadores visíveis de foco.`
        : `Identificamos ${issuesCount} problema(s) relacionado(s) a legibilidade, indicador de foco ou contraste de botões.`,
    issues,
    requiresManualReview: true,
    manualReviewNotes: 'Recomenda-se testar visualmente botões em estados :hover e :active para confirmar se a mudança de cor não é a única indicação de estado.',
    meta: {
      totalButtonsChecked,
    },
  };
}
