import React from 'react';
import { Globe, Cpu, CheckSquare } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  return (
    <section id="como-funciona" className="py-16 md:py-24 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">
            Metodologia Simplificada
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight text-balance">
            Como funciona a análise em 3 etapas
          </h2>
          <p className="mt-4 text-base text-slate-600 text-balance">
            Auditoria automatizada rápida, segura e sem qualquer complicação técnica para a sua equipe.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="p-8 rounded-2xl bg-slate-50/70 border border-slate-200/90 text-left relative flex flex-col justify-between card-hover-effect">
            <div>
              <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-extrabold text-base mb-6 shadow-xs font-mono">
                01
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2.5 tracking-tight">
                Informe o seu site
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Digite a URL pública da página que deseja avaliar. O motor faz inspeção direta sem necessidade de instalar tags, plugins ou scripts no seu servidor.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-200/60 text-xs text-indigo-700 font-semibold flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-indigo-600" aria-hidden="true" />
              <span>Proteção SSRF e sem alterar seu código</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-8 rounded-2xl bg-slate-50/70 border border-slate-200/90 text-left relative flex flex-col justify-between card-hover-effect">
            <div>
              <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-extrabold text-base mb-6 shadow-xs font-mono">
                02
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2.5 tracking-tight">
                Auditoria automatizada
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Processamos o HTML e a árvore DOM contra os 10 critérios da WCAG 2.1 (contraste matemático, teclado, imagens, hierarquia H1-H6, formulários e zoom).
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-200/60 text-xs text-indigo-700 font-semibold flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-indigo-600" aria-hidden="true" />
              <span>Inspeção em menos de 2 segundos</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-8 rounded-2xl bg-slate-50/70 border border-slate-200/90 text-left relative flex flex-col justify-between card-hover-effect">
            <div>
              <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-extrabold text-base mb-6 shadow-xs font-mono">
                03
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2.5 tracking-tight">
                Receba o plano de ação
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Acesse o dashboard com nota de 0 a 100, matriz de impacto para priorizar correções, sugestões prontas de código e download imediato do relatório em PDF.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-200/60 text-xs text-indigo-700 font-semibold flex items-center gap-1.5">
              <CheckSquare className="w-4 h-4 text-indigo-600" aria-hidden="true" />
              <span>Exportação em PDF e Markdown</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
