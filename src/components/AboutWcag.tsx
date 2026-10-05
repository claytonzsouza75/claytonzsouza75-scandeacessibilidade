import React from 'react';
import { BookOpen, Scale, Sparkles, HeartHandshake } from 'lucide-react';

export const AboutWcag: React.FC = () => {
  return (
    <section id="sobre" className="py-16 md:py-24 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
              Consciência & Conformidade
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight text-balance">
              Acessibilidade digital não é opcional: é um direito humano e legal
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm">
              Mais de 1 bilhão de pessoas no mundo vivem com algum tipo de deficiência. No Brasil, o Censo do IBGE aponta dezenas de milhões de cidadãos que enfrentam barreiras cotidianas de navegação em lojas virtuais, portais governamentais e serviços digitais.
            </p>
            <p className="text-slate-600 leading-relaxed text-sm">
              No Brasil, o <strong>Artigo 63 da Lei Brasileira de Inclusão (Lei nº 13.146/2015)</strong> torna obrigatória a acessibilidade nos sítios da internet mantidos por empresas com sede ou representação comercial no país ou pelos órgãos de governo.
            </p>

            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 flex items-start gap-3">
              <Scale className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" aria-hidden="true" />
              <div className="text-xs text-indigo-950">
                <strong>Padrão WCAG (Web Content Accessibility Guidelines):</strong>
                <p className="mt-0.5 text-indigo-800">
                  Desenvolvido pela W3C (World Wide Web Consortium), o padrão internacional WCAG é baseado em 4 princípios fundamentais conhecidos pelo acrônimo <strong>POUR</strong>: Perceptível, Operável, Compreensível e Robusto.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/90 card-hover-effect">
              <span className="text-[11px] font-bold text-indigo-600 block mb-1 font-mono uppercase tracking-wider">Princípio 01</span>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">Perceptível</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                As informações e os componentes da interface devem ser apresentados aos usuários de forma que eles possam percebê-los (texto alternativo, contraste de cor e legendas).
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/90 card-hover-effect">
              <span className="text-[11px] font-bold text-indigo-600 block mb-1 font-mono uppercase tracking-wider">Princípio 02</span>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">Operável</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Os componentes de interface e navegação devem ser operáveis via teclado, sem armadilhas de foco e permitindo tempo suficiente de leitura sem movimento forçado.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/90 card-hover-effect">
              <span className="text-[11px] font-bold text-indigo-600 block mb-1 font-mono uppercase tracking-wider">Princípio 03</span>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">Compreensível</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                As informações e o funcionamento da interface devem ser compreensíveis. Textos claros, formulários com instruções claras e mensagens de erro didáticas.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/90 card-hover-effect">
              <span className="text-[11px] font-bold text-indigo-600 block mb-1 font-mono uppercase tracking-wider">Princípio 04</span>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">Robusto</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                O conteúdo deve ser robusto o bastante para ser interpretado de forma confiável por uma ampla variedade de agentes de usuário, incluindo tecnologias assistivas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
