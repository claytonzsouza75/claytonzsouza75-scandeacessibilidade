import type { CheerioAPI } from 'cheerio';
import type { CategoryResult, Issue } from '../../src/types/accessibility.js';

interface PluginSignature {
  name: string;
  type: 'libras' | 'overlay' | 'leitor' | 'widget';
  pattern: RegExp;
  description: string;
}

const KNOWN_PLUGINS: PluginSignature[] = [
  {
    name: 'VLibras',
    type: 'libras',
    pattern: /vlibras|vlibras\.gov\.br/i,
    description: 'Ferramenta governamental de tradução automática de texto para a Língua Brasileira de Sinais (Libras).',
  },
  {
    name: 'Hand Talk',
    type: 'libras',
    pattern: /handtalk|plugin\.handtalk\.me/i,
    description: 'Avatar virtual 3D (Hugo/Maya) para tradução de texto em Libras.',
  },
  {
    name: 'UserWay',
    type: 'overlay',
    pattern: /userway|cdn\.userway\.org/i,
    description: 'Widget de sobreposição com controles de contraste, fonte e leitura.',
  },
  {
    name: 'AccessiBe',
    type: 'overlay',
    pattern: /acsb|accessibe/i,
    description: 'Widget de sobreposição e alterações automáticas por JavaScript.',
  },
  {
    name: 'Rybenke',
    type: 'libras',
    pattern: /rybenke/i,
    description: 'Ferramenta de tecnologia assistiva e Libras.',
  },
  {
    name: 'EqualWeb',
    type: 'overlay',
    pattern: /equalweb/i,
    description: 'Overlay de modificação de acessibilidade visual.',
  },
  {
    name: 'AudioEye',
    type: 'overlay',
    pattern: /audioeye/i,
    description: 'Plataforma assistiva baseada em script externo.',
  },
  {
    name: 'Recite Me',
    type: 'overlay',
    pattern: /reciteme/i,
    description: 'Barra de ferramentas de leitura e tradução.',
  },
];

export function auditAccessibilityPlugins($: CheerioAPI, totalStructuralIssuesCount = 0): CategoryResult {
  const detectedPlugins: string[] = [];
  const issues: Issue[] = [];

  const htmlContent = $.html();

  // Search in scripts and attributes
  $('script').each((_, el) => {
    const src = $(el).attr('src') || '';
    const content = $(el).html() || '';
    const combined = `${src} ${content}`;

    for (const plugin of KNOWN_PLUGINS) {
      if (plugin.pattern.test(combined) && !detectedPlugins.includes(plugin.name)) {
        detectedPlugins.push(plugin.name);
      }
    }
  });

  // Search in div IDs and classes (e.g. vw-plugin-wrapper for VLibras)
  $('[id*="vlibras"], [class*="vlibras"], [id*="handtalk"], [class*="handtalk"], [id*="userway"]').each((_, el) => {
    const id = $(el).attr('id') || '';
    const cls = $(el).attr('class') || '';
    for (const plugin of KNOWN_PLUGINS) {
      if ((plugin.pattern.test(id) || plugin.pattern.test(cls)) && !detectedPlugins.includes(plugin.name)) {
        detectedPlugins.push(plugin.name);
      }
    }
  });

  const hasPlugin = detectedPlugins.length > 0;

  if (hasPlugin) {
    issues.push({
      id: 'plugin-structural-alert',
      categoryKey: 'accessibility_plugins',
      title: `Detectado(s) recurso(s) assistivo(s) externo(s): ${detectedPlugins.join(', ')}`,
      severity: totalStructuralIssuesCount > 3 ? 'alta' : 'baixa',
      status: totalStructuralIssuesCount > 3 ? 'aviso' : 'passou',
      selector: 'script, widget',
      htmlSnippet: `<!-- Plugin(s) identificado(s): ${detectedPlugins.join(', ')} -->`,
      location: 'scripts de terceiros',
      description: `O site possui plugins ou widgets de terceiros instalados (${detectedPlugins.join(', ')}). Embora possam auxiliar em certos casos (como tradução em Libras), widgets de sobreposição NÃO corrigem código semântico incorreto, formulários sem labels, nem garantem conformidade com a WCAG.`,
      whyItMatters: 'A dependência exclusiva de plugins pode criar uma falsa sensação de segurança jurídica e técnica. Usuários cegos experientes frequentemente desativam overlays de terceiros porque eles entram em conflito com seus leitores de tela nativos.',
      whoIsAffected: 'Usuários de leitores de tela nativos (NVDA, JAWS, VoiceOver) e pessoas dependentes de navegação pura por teclado.',
      howToFix: 'Construa a acessibilidade diretamente na fundação do site (HTML semântico, atributos ARIA nativos, bom contraste e navegação fluida por teclado). Trate plugins como um complemento, nunca como substituto.',
      suggestedCode: `/* Priorize acessibilidade na fonte do seu código: */\n/* 1. HTML semântico (<main>, <nav>, <button>) */\n/* 2. Formulários com <label for="..."> */\n/* 3. Imagens com alt descritivo */\n/* 4. Contraste mínimo de 4.5:1 nas folhas de estilo */`,
      ruleViolated: 'Diretrizes Oficiais W3C/WAI sobre Overlays de Acessibilidade',
      requiresManualReview: true,
      effort: 'continuo',
    });
  }

  // Score calculation: Plugin presence NEVER inflates the score
  // If no plugins, score is 100 (clean structural code approach)
  // If plugin is present with many structural issues, status indicates attention needed
  let status: CategoryResult['status'] = 'excelente';
  let score = 100;

  if (hasPlugin && totalStructuralIssuesCount > 3) {
    status = 'precisa_melhorar';
    score = 70; // Penalized slightly for relying on plugin while structural code is broken
  } else if (hasPlugin) {
    status = 'bom';
    score = 90;
  }

  let summaryText = 'Nenhum plugin ou widget de sobreposição foi detectado. O site baseia sua acessibilidade em recursos nativos.';
  if (hasPlugin) {
    summaryText = `Identificamos a presença de: ${detectedPlugins.join(', ')}. Lembre-se de que ferramentas complementares não substituem o HTML semântico e a boa arquitetura.`;
  }

  return {
    key: 'accessibility_plugins',
    title: 'Dependência Excessiva de Plugin de Acessibilidade',
    status,
    score,
    issuesCount: issues.length,
    severity: totalStructuralIssuesCount > 3 ? 'alta' : 'baixa',
    summary: summaryText,
    issues,
    requiresManualReview: true,
    manualReviewNotes:
      'Avalie se o widget de acessibilidade entra em conflito com atalhos de teclado nativos do navegador ou se sobrepõe outros botões essenciais da interface.',
    meta: {
      detectedPlugins,
    },
  };
}
