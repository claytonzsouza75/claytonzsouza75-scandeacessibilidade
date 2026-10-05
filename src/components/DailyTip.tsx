import React, { useState } from 'react';
import {
  Lightbulb,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  ExternalLink,
  BookOpen,
} from 'lucide-react';

interface WcagTip {
  id: string;
  criterion: string;
  level: 'A' | 'AA' | 'AAA';
  title: string;
  guidance: string;
  whyItMatters: string;
  badCode: string;
  goodCode: string;
  wcagUrl: string;
}

const WCAG_DAILY_TIPS: WcagTip[] = [
  {
    id: 'tip-link-purpose',
    criterion: 'WCAG 2.4.4 — Finalidade do Link (Em Contexto)',
    level: 'A',
    title: 'Evite links genéricos como "Clique aqui" ou "Saiba mais"',
    guidance:
      'Usuários de leitores de tela frequentemente navegam listando todos os links da página fora de contexto (atalho Insert + F7 no NVDA). Textos descritivos informam exatamente o destino antes do clique.',
    whyItMatters:
      'Melhora a autonomia de pessoas cegas, com baixa visão e também otimiza a indexação semântica em mecanismos de busca.',
    badCode: `<a href="/relatorio-2026.pdf">Clique aqui</a>`,
    goodCode: `<a href="/relatorio-2026.pdf">Baixar Relatório de Impacto 2026 (PDF, 2.4 MB)</a>`,
    wcagUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/link-purpose-in-context.html',
  },
  {
    id: 'tip-focus-visible',
    criterion: 'WCAG 2.4.7 — Foco Visível',
    level: 'AA',
    title: 'Nunca remova o outline de foco sem fornecer um indicador substituto',
    guidance:
      'A declaração CSS outline: none sem uma alternativa visual torna impossível para quem navega por teclado saber qual botão ou link está selecionado no momento.',
    whyItMatters:
      'Essencial para pessoas com deficiência motora, usuários de acionadores e desenvolvedores que utilizam a tecla Tab.',
    badCode: `button:focus {\n  outline: none;\n}`,
    goodCode: `button:focus-visible {\n  outline: 3px solid #3730a3;\n  outline-offset: 2px;\n}`,
    wcagUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/focus-visible.html',
  },
  {
    id: 'tip-form-labels',
    criterion: 'WCAG 1.3.1 & 3.3.2 — Rótulos ou Instruções',
    level: 'A',
    title: 'O atributo placeholder não substitui a tag <label>',
    guidance:
      'O texto de placeholder desaparece assim que o usuário começa a digitar e geralmente possui baixo contraste. Todo campo de formulário precisa de um elemento <label> explicitamente vinculado pelo atributo for.',
    whyItMatters:
      'Aumenta a área de clique do campo e garante que tecnologias assistivas anunciem o propósito exato do input.',
    badCode: `<input type="email" placeholder="Digite seu e-mail" />`,
    goodCode: `<label for="user-email">Seu e-mail profissional</label>\n<input id="user-email" type="email" autocomplete="email" />`,
    wcagUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/labels-or-instructions.html',
  },
  {
    id: 'tip-alt-text',
    criterion: 'WCAG 1.1.1 — Conteúdo Não Textual',
    level: 'A',
    title: 'Diferencie imagens informativas de imagens puramente decorativas',
    guidance:
      'Imagens que transmitem conteúdo precisam de um atributo alt conciso e descritivo. Já ícones ornamentais ou grafismos visuais devem ter alt="" vazio para não gerar ruído sonoro no leitor de tela.',
    whyItMatters:
      'Evita que leitores de tela leiam o nome do arquivo (ex: "IMG_9482.png") e torna a leitura fluida.',
    badCode: `<img src="grafico-vendas.png" />\n<img src="divisor-decorativo.svg" alt="linha azul decorativa" />`,
    goodCode: `<img src="grafico-vendas.png" alt="Crescimento de 32% nas vendas no 1º trimestre" />\n<img src="divisor-decorativo.svg" alt="" role="presentation" />`,
    wcagUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html',
  },
  {
    id: 'tip-contrast-aaa',
    criterion: 'WCAG 1.4.6 — Contraste (Aprimorado)',
    level: 'AAA',
    title: 'Priorize relações de contraste de 7:1 para textos corridos',
    guidance:
      'Enquanto o nível AA exige contraste mínimo de 4.5:1 para textos normais, alcançar 7:1 (nível AAA) garante legibilidade superior mesmo sob luz solar intensa ou para pessoas com perda moderada de acuidade visual.',
    whyItMatters:
      'Reduz a fadiga visual de todos os leitores e atende pessoas com baixa visão ou daltonismo.',
    badCode: `<p style="color: #94a3b8; background: #ffffff;">Texto cinza claro difícil de ler (2.5:1)</p>`,
    goodCode: `<p style="color: #1e293b; background: #ffffff;">Texto com alto contraste e leitura nítida (12.6:1)</p>`,
    wcagUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/contrast-enhanced.html',
  },
  {
    id: 'tip-native-button',
    criterion: 'WCAG 4.1.2 — Nome, Função, Valor',
    level: 'A',
    title: 'Prefira elementos <button> nativos em vez de <div> com evento de clique',
    guidance:
      'Um elemento <button> nativo já oferece foco automático via Tab, acionamento com as teclas Enter e Espaço e semântica reconhecida por qualquer leitor de tela sem código extra.',
    whyItMatters:
      'Evita que controles interativos fiquem invisíveis ou inacessíveis para quem não utiliza mouse.',
    badCode: `<div class="btn" onclick="salvarDados()">Salvar alterações</div>`,
    goodCode: `<button type="button" class="btn" onclick="salvarDados()">Salvar alterações</button>`,
    wcagUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/name-role-value.html',
  },
  {
    id: 'tip-heading-hierarchy',
    criterion: 'WCAG 1.3.1 & 2.4.6 — Cabeçalhos e Rótulos',
    level: 'AA',
    title: 'Mantenha a árvore de cabeçalhos (<h1> a <h6>) sem pular níveis',
    guidance:
      'Não escolha o nível de um cabeçalho pelo tamanho visual da fonte. Utilize apenas um <h1> principal por página e estruture subseções em ordem lógica (<h2> seguido de <h3>), estilizando o tamanho via CSS.',
    whyItMatters:
      '67% dos usuários de leitores de tela utilizam cabeçalhos como principal forma de explorar a estrutura de uma página.',
    badCode: `<h1>Portal de Serviços</h1>\n<h4>Perguntas Frequentes</h4> <!-- Pulou h2 e h3 -->`,
    goodCode: `<h1>Portal de Serviços</h1>\n<h2 class="text-base">Perguntas Frequentes</h2>`,
    wcagUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/headings-and-labels.html',
  },
];

export const DailyTip: React.FC = () => {
  // Pick initial tip deterministically based on current day of the year
  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - startOfYear.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    return dayOfYear % WCAG_DAILY_TIPS.length;
  });

  const [copiedCode, setCopiedCode] = useState(false);

  const currentTip = WCAG_DAILY_TIPS[currentIndex];

  const handlePrevTip = () => {
    setCurrentIndex(prev => (prev - 1 + WCAG_DAILY_TIPS.length) % WCAG_DAILY_TIPS.length);
    setCopiedCode(false);
  };

  const handleNextTip = () => {
    setCurrentIndex(prev => (prev + 1) % WCAG_DAILY_TIPS.length);
    setCopiedCode(false);
  };

  const handleCopyGoodCode = () => {
    navigator.clipboard.writeText(currentTip.goodCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <section
      aria-labelledby="daily-tip-heading"
      className="max-w-5xl mx-auto px-4 sm:px-6 -mt-8 relative z-10 mb-8"
    >
      <div className="bg-white rounded-2xl border-2 border-indigo-200/90 shadow-md p-5 sm:p-6 transition-all">
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-300 text-amber-800 flex items-center justify-center shrink-0">
              <Lightbulb className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2
                  id="daily-tip-heading"
                  className="text-xs font-extrabold uppercase tracking-wider text-indigo-800"
                >
                  Dica do Dia · Educação em Acessibilidade
                </h2>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-900 border border-indigo-200">
                  Nível {currentTip.level}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                {currentTip.criterion}
              </p>
            </div>
          </div>

          {/* Navigation controls between tips */}
          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <span
              className="text-xs font-mono text-slate-600 mr-1.5 tabular-nums"
              aria-label={`Dica ${currentIndex + 1} de ${WCAG_DAILY_TIPS.length}`}
            >
              {currentIndex + 1}/{WCAG_DAILY_TIPS.length}
            </span>
            <button
              type="button"
              onClick={handlePrevTip}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-700"
              aria-label="Ver dica de acessibilidade anterior"
              title="Dica anterior"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={handleNextTip}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-700"
              aria-label="Ver próxima dica de acessibilidade"
              title="Próxima dica"
            >
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Live Region Content */}
        <div aria-live="polite" className="pt-4 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Explanation Column */}
          <div className="lg:col-span-6 space-y-3 text-left">
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug">
              {currentTip.title}
            </h3>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {currentTip.guidance}
            </p>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
              <strong className="font-bold text-slate-900 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-700 shrink-0" aria-hidden="true" />
                <span>Impacto real para o usuário:</span>
              </strong>
              <p className="leading-relaxed">{currentTip.whyItMatters}</p>
            </div>

            <div className="pt-1">
              <a
                href={currentTip.wcagUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 hover:text-indigo-900 underline underline-offset-4"
              >
                <span>Consultar documentação oficial W3C ({currentTip.criterion.split('—')[0].trim()})</span>
                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Code Comparison Column */}
          <div className="lg:col-span-6 space-y-2.5 text-left">
            {/* Inaccessible Example */}
            <div className="p-3 rounded-xl bg-red-50/70 border border-red-200 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-red-900">
                <XCircle className="w-3.5 h-3.5 text-red-700 shrink-0" aria-hidden="true" />
                <span>Evite (Barreira de Acessibilidade):</span>
              </div>
              <pre className="text-[11px] font-mono bg-white p-2.5 rounded-lg border border-red-200 text-slate-800 overflow-x-auto whitespace-pre-wrap">
                <code>{currentTip.badCode}</code>
              </pre>
            </div>

            {/* Accessible Recommended Example */}
            <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" aria-hidden="true" />
                  <span>Prática Recomendada (Conforme WCAG):</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyGoodCode}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white border border-emerald-300 text-[11px] font-semibold text-emerald-900 hover:bg-emerald-100 transition-colors cursor-pointer"
                  aria-label="Copiar código recomendado da dica do dia"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-700" aria-hidden="true" />
                      <span>Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-emerald-700" aria-hidden="true" />
                      <span>Copiar exemplo</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="text-[11px] font-mono bg-white p-2.5 rounded-lg border border-emerald-200 text-slate-800 overflow-x-auto whitespace-pre-wrap">
                <code>{currentTip.goodCode}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
