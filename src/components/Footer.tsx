import React from 'react';
import { Eye, ShieldAlert, Accessibility, Scale, ShieldCheck } from 'lucide-react';

interface FooterProps {
  onOpenStatement?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenStatement }) => {
  return (
    <footer className="bg-white border-t border-slate-300 py-12 text-xs text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Legal Conformity Badge & Statement Card */}
        <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200 text-slate-800 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-bold text-indigo-950 text-sm">
              <Scale className="w-4 h-4 text-indigo-700 shrink-0" aria-hidden="true" />
              <span>Conformidade Legal com a Lei Brasileira de Inclusão (Lei nº 13.146/2015, Art. 63)</span>
            </div>
            {onOpenStatement && (
              <button
                type="button"
                onClick={onOpenStatement}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white font-semibold text-xs transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-700"
              >
                <Accessibility className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Ver Declaração de Acessibilidade</span>
              </button>
            )}
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            Este portal adota os padrões internacionais <strong>WCAG 2.1 (Nível AA e AAA)</strong> e o <strong>eMAG (Modelo de Acessibilidade em Governo Eletrônico)</strong>, cumprindo a determinação legal do Artigo 63 da LBI para garantir o direito irrestrito de acesso à informação digital a todas as pessoas com deficiência.
          </p>
        </div>

        {/* Technical Disclaimer */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 space-y-1.5 text-center sm:text-left">
          <div className="flex items-center gap-2 font-semibold text-slate-900 text-xs">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" aria-hidden="true" />
            <span>Nota Técnica sobre Auditorias Automatizadas</span>
          </div>
          <p className="leading-relaxed text-xs">
            A análise automatizada de código identifica barreiras algorítmicas fundamentais (contraste, foco de teclado, labels, hierarquia). A certificação jurídica definitiva de qualquer website exige testes com usuários reais e validação contínua.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
          <div className="flex items-center gap-2.5">
            <img
              src="/src/assets/images/scande_logo_mark_1790633121566.jpg"
              alt="Logo ScandeAcessibilidade"
              referrerPolicy="no-referrer"
              className="w-7 h-7 rounded-lg object-cover shadow-2xs ring-1 ring-slate-200"
            />
            <span className="font-bold text-slate-900 tracking-tight text-sm">
              ScandeAcessibilidade
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-700">Tecnologia para uma web 100% inclusiva</span>
          </div>

          <div className="flex items-center gap-6 flex-wrap">
            {onOpenStatement && (
              <button
                type="button"
                onClick={onOpenStatement}
                className="hover:text-indigo-800 text-slate-700 font-semibold transition-colors cursor-pointer flex items-center gap-1"
              >
                <Accessibility className="w-3.5 h-3.5 text-indigo-700" aria-hidden="true" />
                <span>Declaração de Acessibilidade</span>
              </button>
            )}
            <a
              href="https://www.w3.org/WAI/standards-guidelines/wcag/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-950 transition-colors text-slate-700"
            >
              Diretrizes W3C / WCAG 2.1
            </a>
            <a
              href="http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13146.htm"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-950 transition-colors text-slate-700"
            >
              Lei Brasileira de Inclusão (LBI)
            </a>
            <a
              href="https://www.gov.br/governodigital/pt-br/acessibilidade-e-usuario/emag"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-950 transition-colors text-slate-700"
            >
              Padrão eMAG
            </a>
          </div>
        </div>

        <div className="text-center text-slate-500 text-[11px]">
          © {new Date().getFullYear()} ScandeAcessibilidade. Em total conformidade com a Lei Federal nº 13.146/2015 e WCAG 2.1.
        </div>
      </div>
    </footer>
  );
};
