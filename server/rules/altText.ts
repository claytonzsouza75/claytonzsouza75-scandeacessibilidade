import type { CheerioAPI } from 'cheerio';
import type { CategoryResult, Issue } from '../../src/types/accessibility.js';

const GENERIC_ALT_STRINGS = [
  'imagem',
  'foto',
  'banner',
  'image',
  'img',
  'picture',
  'photo',
  'screenshot',
  'captura de tela',
  'grafico',
  'logo',
  'logotipo',
  'icone',
  'figura',
  'ilustracao',
];

const FILENAME_REGEX = /\.(jpe?g|png|gif|webp|svg|bmp|avif)$/i;
const CAMERA_FILENAME_REGEX = /^(img|dsc|photo|foto|captura|screenshot|whatsapp)[-_0-9]+/i;

export function auditAltText($: CheerioAPI): CategoryResult {
  const issues: Issue[] = [];
  let totalImagesChecked = 0;
  let decorativeCount = 0;

  $('img, input[type="image"]').each((index, el) => {
    const $el = $(el);
    totalImagesChecked++;

    const altAttr = $el.attr('alt');
    const src = $el.attr('src') || '';
    const role = $el.attr('role');
    const ariaHidden = $el.attr('aria-hidden');
    const ariaLabel = $el.attr('aria-label');
    const parentA = $el.closest('a');
    const snippet = $.html(el).slice(0, 180);

    // 1. Missing alt attribute altogether
    if (typeof altAttr === 'undefined') {
      issues.push({
        id: `alt-missing-${index + 1}`,
        categoryKey: 'alt_text',
        title: 'Imagem sem o atributo "alt" obrigatório',
        severity: 'critica',
        status: 'falha',
        selector: `img[src="${src.slice(0, 50)}"]`,
        htmlSnippet: snippet,
        location: $el.closest('header, main, section, footer, div').prop('tagName')?.toLowerCase() || 'corpo do documento',
        description: 'A tag <img> não possui o atributo alt declarado. Quando isso ocorre, o leitor de tela lê o caminho do arquivo ou a URL da imagem por extenso.',
        whyItMatters: 'Usuários cegos não conseguem saber o que a imagem representa nem se ela transmite alguma informação essencial.',
        whoIsAffected: 'Pessoas com deficiência visual usuárias de leitores de tela e pessoas com conexão lenta onde as imagens falham ao carregar.',
        howToFix: 'Se a imagem for informativa, adicione alt="Descrição clara do conteúdo". Se for meramente decorativa, adicione alt="" para que o leitor a ignore de forma silenciosa.',
        suggestedCode: `<img\n  src="${src || 'exemplo.jpg'}"\n  alt="Descrição precisa do conteúdo da imagem"\n>`,
        ruleViolated: 'WCAG 2.1 — Critério 1.1.1: Conteúdo Não Textual (Nível A)',
        requiresManualReview: false,
        effort: 'baixo',
      });
      return;
    }

    const trimmedAlt = altAttr.trim();

    // 2. Empty alt in a link with no other text (Image link is completely unlabelled!)
    if (trimmedAlt === '') {
      if (parentA.length > 0) {
        const linkText = parentA.text().trim();
        const linkAria = parentA.attr('aria-label')?.trim();
        if (!linkText && !linkAria) {
          issues.push({
            id: `alt-empty-link-${index + 1}`,
            categoryKey: 'alt_text',
            title: 'Imagem em link com alt vazio sem texto de suporte',
            severity: 'critica',
            status: 'falha',
            selector: `a > img[alt=""]`,
            htmlSnippet: $.html(parentA[0]).slice(0, 180),
            location: 'link com imagem',
            description: 'A imagem está contida dentro de um link navegável, mas possui alt="" e nenhum texto adjacente no link. Isso cria um "link vazio" inacessível.',
            whyItMatters: 'Leitores de tela anunciam apenas "link" sem destino ou leem a URL crua do link.',
            whoIsAffected: 'Pessoas cegas navegando por links e usuários de leitores de tela.',
            howToFix: 'Insira no alt da imagem o destino ou objetivo do link, ou forneça um aria-label no link pai.',
            suggestedCode: `<a href="${parentA.attr('href') || '/'}">\n  <img src="${src}" alt="Ir para a página inicial da empresa">\n</a>`,
            ruleViolated: 'WCAG 2.1 — Critério 1.1.1 (Nível A) e Critério 2.4.4 (Nível A)',
            requiresManualReview: false,
            effort: 'baixo',
          });
          return;
        }
      }

      decorativeCount++;
      return; // Truly decorative image with alt="" is standard WCAG compliant
    }

    // 3. Generic alt descriptions (e.g. "imagem", "foto", "banner")
    const lowerAlt = trimmedAlt.toLowerCase();
    if (GENERIC_ALT_STRINGS.includes(lowerAlt) || lowerAlt === 'logo' || lowerAlt === 'icon') {
      issues.push({
        id: `alt-generic-${index + 1}`,
        categoryKey: 'alt_text',
        title: `Descrição alternativa vaga ou genérica: "${trimmedAlt}"`,
        severity: 'alta',
        status: 'falha',
        selector: `img[alt="${trimmedAlt}"]`,
        htmlSnippet: snippet,
        location: 'imagem do conteúdo',
        description: `O atributo alt utiliza a palavra genérica "${trimmedAlt}". Dizer que uma imagem é uma "foto" ou "imagem" não adiciona nenhuma informação ao usuário cego.`,
        whyItMatters: 'O leitor de tela já anuncia que o elemento é uma imagem ("Gráfico, foto"). Repetir a palavra gera redundância e frustração.',
        whoIsAffected: 'Pessoas com deficiência visual dependentes de tecnologias assistivas.',
        howToFix: 'Descreva de forma concisa o que está retratado na imagem (sujeito, ação e contexto).',
        suggestedCode: `<!-- Antes: <img src="${src}" alt="${trimmedAlt}"> -->\n<img\n  src="${src}"\n  alt="Colaboradores em reunião de trabalho em volta de uma mesa com notebooks"\n>`,
        ruleViolated: 'WCAG 2.1 — Critério 1.1.1: Conteúdo Não Textual (Nível A)',
        requiresManualReview: true,
        effort: 'baixo',
      });
      return;
    }

    // 4. Filename used as alt text
    if (FILENAME_REGEX.test(trimmedAlt) || CAMERA_FILENAME_REGEX.test(trimmedAlt) || trimmedAlt.includes('.com') || trimmedAlt.includes('http')) {
      issues.push({
        id: `alt-filename-${index + 1}`,
        categoryKey: 'alt_text',
        title: `Nome de arquivo de imagem utilizado como texto alternativo: "${trimmedAlt}"`,
        severity: 'alta',
        status: 'falha',
        selector: `img[alt*="."]`,
        htmlSnippet: snippet,
        location: 'imagem do conteúdo',
        description: `O texto alternativo contém o nome do arquivo técnico ("${trimmedAlt}") em vez de uma descrição compreensível em linguagem humana.`,
        whyItMatters: 'Códigos de arquivo como "IMG_8921.jpg" ou "banner_final_v2.png" são completamente ininteligíveis para quem depende de descrição sonora.',
        whoIsAffected: 'Pessoas com deficiência visual e qualquer usuário com leitor de tela.',
        howToFix: 'Substitua o nome de arquivo por uma descrição que transmita a mensagem ou intenção da imagem.',
        suggestedCode: `<img\n  src="${src}"\n  alt="Fachada moderna do edifício corporativo com jardins na entrada"\n>`,
        ruleViolated: 'WCAG 2.1 — Critério 1.1.1: Conteúdo Não Textual (Nível A)',
        requiresManualReview: false,
        effort: 'baixo',
      });
      return;
    }

    // 5. Redundant words like "Imagem de..." or "Foto de..."
    if (/^(imagem de|foto de|imagem do|foto do|picture of|image of)\s+/i.test(trimmedAlt)) {
      issues.push({
        id: `alt-redundant-${index + 1}`,
        categoryKey: 'alt_text',
        title: `Prefixo redundante na descrição: "${trimmedAlt}"`,
        severity: 'baixa',
        status: 'aviso',
        selector: `img[alt^="imagem de"]`,
        htmlSnippet: snippet,
        location: 'imagem do conteúdo',
        description: 'A descrição alternativa começa com expressões como "Imagem de" ou "Foto de". Os leitores de tela já anunciam naturalmente que o elemento é uma imagem antes de ler o texto.',
        whyItMatters: 'Adiciona repetição desnecessária na leitura de dezenas de itens de uma página.',
        whoIsAffected: 'Usuários de leitores de tela em leitura contínua.',
        howToFix: 'Remova o prefixo "Imagem de" e mantenha diretamente a descrição do sujeito.',
        suggestedCode: `<!-- Antes: alt="${trimmedAlt}" -->\nalt="${trimmedAlt.replace(/^(imagem de|foto de|imagem do|foto do)\s+/i, '')}"`,
        ruleViolated: 'Boas Práticas WCAG — Redundância de Mídia',
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
    score = Math.max(30, 100 - issuesCount * 12);
  } else if (issuesCount >= 3) {
    status = 'precisa_melhorar';
    score = Math.max(60, 100 - issuesCount * 10);
  } else if (issuesCount >= 1) {
    status = 'bom';
    score = Math.max(75, 100 - issuesCount * 8);
  }

  return {
    key: 'alt_text',
    title: 'Alt-Text de Imagens',
    status,
    score,
    issuesCount,
    severity: issues.some(i => i.severity === 'critica') ? 'critica' : issues.some(i => i.severity === 'alta') ? 'alta' : 'media',
    summary:
      issuesCount === 0
        ? `Todas as ${totalImagesChecked} imagens verificadas possuem atributos alt adequados ou foram corretamente marcadas como decorativas.`
        : `Encontramos ${issuesCount} problema(s) em textos alternativos de imagens (ausência de alt, descrições genéricas ou nomes de arquivo).`,
    issues,
    requiresManualReview: true,
    manualReviewNotes: 'A qualidade poética ou fidelidade semântica da descrição alternativa em imagens artísticas ou gráficos complexos exige validação humana.',
    meta: {
      totalImagesChecked,
    },
  };
}
