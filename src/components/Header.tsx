import React from 'react';
import { Eye, History, ArrowRight, Accessibility } from 'lucide-react';

interface HeaderProps {
  onNewAuditClick: () => void;
  onNavigateSection: (sectionId: string) => void;
  hasActiveReport: boolean;
  onOpenHistory: () => void;
  historyCount: number;
  onOpenStatement: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onNewAuditClick,
  onNavigateSection,
  hasActiveReport,
  onOpenHistory,
  historyCount,
  onOpenStatement,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      {/* Skip link for screen reader & keyboard navigation accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-indigo-700 focus:text-white focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-white"
      >
        Pular para o conteúdo principal [Alt + 1]
      </a>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Brand Logo & Wordmark */}
        <button
          type="button"
          onClick={onNewAuditClick}
          className="flex items-center gap-2.5 text-left group focus-visible:ring-2 focus-visible:ring-indigo-700 rounded-lg p-1 cursor-pointer"
          aria-label="ScandeAcessibilidade — Página inicial"
        >
          <img
            src="/src/assets/images/scande_logo_mark_1790633121566.jpg"
            alt=""
            aria-hidden="true"
            referrerPolicy="no-referrer"
            className="w-9 h-9 rounded-xl object-cover shadow-xs ring-1 ring-indigo-500/20 group-hover:scale-105 transition-transform"
          />
          <span className="text-lg font-extrabold tracking-tight text-slate-900">
            Scande<span className="text-indigo-700">Acessibilidade</span>
          </span>
        </button>

        {/* Zone 2: Navigation links with id for keyboard jump */}
        <nav
          id="main-nav"
          aria-label="Navegação Principal"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-700"
        >
          <button
            type="button"
            onClick={() => onNavigateSection('como-funciona')}
            className="hover:text-slate-950 transition-colors cursor-pointer"
          >
            Como funciona
          </button>
          <button
            type="button"
            onClick={() => onNavigateSection('criterios')}
            className="hover:text-slate-950 transition-colors cursor-pointer"
          >
            10 Critérios
          </button>
          <button
            type="button"
            onClick={() => onNavigateSection('sobre')}
            className="hover:text-slate-950 transition-colors cursor-pointer"
          >
            Sobre a WCAG
          </button>
          <button
            type="button"
            onClick={onOpenStatement}
            className="text-indigo-800 hover:text-indigo-950 font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Declaração de Acessibilidade Legal (LBI Art. 63)"
          >
            <Accessibility className="w-4 h-4 text-indigo-700" aria-hidden="true" />
            <span>Acessibilidade Legal</span>
          </button>
          <button
            type="button"
            onClick={onOpenHistory}
            className="hover:text-slate-950 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <History className="w-4 h-4 text-slate-500" aria-hidden="true" />
            <span>Histórico</span>
            {historyCount > 0 && (
              <span className="text-xs text-slate-600 font-mono tabular-nums">({historyCount})</span>
            )}
          </button>
        </nav>

        {/* Zone 3: Actions including Accessibility Symbol in highlight (LBI Art. 63 § 1º) */}
        <div className="flex items-center gap-2.5">
          {/* Prominent Accessibility Symbol (Legal Requirement - LBI Art. 63 § 1º) */}
          <button
            type="button"
            onClick={onOpenStatement}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-700"
            aria-label="Símbolo de Acessibilidade: abrir Declaração de Acessibilidade e Conformidade Legal da LBI"
            title="Símbolo Internacional de Acessibilidade — Declaração e canal de suporte"
          >
            <Accessibility className="w-4 h-4 text-indigo-700" aria-hidden="true" />
            <span className="hidden xl:inline">Acessibilidade</span>
          </button>

          <button
            type="button"
            onClick={onOpenHistory}
            className="md:hidden p-2 text-slate-700 hover:text-slate-950 rounded-lg hover:bg-slate-100 cursor-pointer"
            aria-label="Abrir histórico de análises"
          >
            <History className="w-5 h-5" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={onNewAuditClick}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-700 rounded-lg hover:bg-indigo-800 active:bg-indigo-900 transition-all shadow-xs hover:shadow-sm whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-700"
          >
            <span>{hasActiveReport ? 'Nova análise' : 'Analisar site'}</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
};
