import React from 'react';
import {
  Link,
  Contrast,
  Image,
  Keyboard,
  Heading,
  FileText,
  Activity,
  Video,
  ZoomIn,
  Boxes,
} from 'lucide-react';

export const CriteriaOverview: React.FC = () => {
  const criteriaList = [
    {
      title: 'Links claros',
      desc: 'Detecta textos genéricos ("Clique aqui", "Saiba mais") que perdem sentido fora do contexto visual.',
      icon: Link,
    },
    {
      title: 'Legibilidade & Contraste',
      desc: 'Calcula o contraste de cor entre texto e fundo (mínimo de 4.5:1) e avalia anéis visíveis de foco.',
      icon: Contrast,
    },
    {
      title: 'Alt-Text de Imagens',
      desc: 'Verifica ausência de alt, descrições genéricas ("foto") e nomes de arquivo em tags <img>.',
      icon: Image,
    },
    {
      title: 'Navegação por Teclado',
      desc: 'Identifica divs ou spans clicáveis não focáveis, falta de tabindex e bloqueio de atalhos.',
      icon: Keyboard,
    },
    {
      title: 'Estrutura & Hierarquia',
      desc: 'Mapeia a sequência H1 → H2 → H3, identificando saltos que desorientam leitores de tela.',
      icon: Heading,
    },
    {
      title: 'Formulários Descritivos',
      desc: 'Analisa se todos os campos possuem <label> explícito e não dependem apenas de placeholder.',
      icon: FileText,
    },
    {
      title: 'Movimento & Animações',
      desc: 'Detecta carrosséis sem botão de pausa e confere conformidade com prefers-reduced-motion.',
      icon: Activity,
    },
    {
      title: 'Vídeos Inclusivos',
      desc: 'Verifica faixas de legendas (<track>) e se mídias incorporadas possuem títulos acessíveis.',
      icon: Video,
    },
    {
      title: 'Zoom & Responsividade',
      desc: 'Verifica se a página permite ampliação de até 200% sem perda de conteúdo ou quebra de layout.',
      icon: ZoomIn,
    },
    {
      title: 'Acessibilidade Estrutural',
      desc: 'Alerta sobre dependência de widgets de acessibilidade que não resolvem o HTML subjacente.',
      icon: Boxes,
    },
  ];

  return (
    <section id="criterios" className="py-16 md:py-24 bg-slate-50 border-b border-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-2">
            Base Técnica
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight text-balance">
            Os 10 Critérios Essenciais de Análise
          </h2>
          <p className="mt-4 text-base text-slate-700 text-balance leading-relaxed">
            Auditoria construída com base nos critérios mais impactantes das Diretrizes de Acessibilidade para Conteúdo Web (WCAG 2.1).
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {criteriaList.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                tabIndex={0}
                className="p-5 rounded-2xl bg-white border border-slate-300 hover:border-indigo-600 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-indigo-800 focus-visible:ring-offset-2 card-hover-effect flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 flex items-center justify-center mb-3.5">
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div className="text-[11px] font-bold text-slate-700 font-mono mb-1 tracking-wider uppercase">
                    CRITÉRIO {String(idx + 1).padStart(2, '0')}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1.5 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-700 leading-relaxed font-normal">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
