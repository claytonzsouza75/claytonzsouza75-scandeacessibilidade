import React, { useState, useEffect } from 'react';
import {
  Accessibility,
  Contrast,
  Sun,
  Moon,
} from 'lucide-react';

interface AccessibilityToolbarProps {
  onOpenStatement: () => void;
}

export const AccessibilityToolbar: React.FC<AccessibilityToolbarProps> = ({
  onOpenStatement,
}) => {
  const [fontSizeLevel, setFontSizeLevel] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('scande_font_size');
      return saved ? Number(saved) : 0;
    } catch {
      return 0;
    }
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('scande_theme');
      if (saved === 'dark' || saved === 'light') return saved;
    } catch {
      // ignore storage errors
    }
    return 'light';
  });

  const [isHighContrast, setIsHighContrast] = useState<boolean>(() => {
    try {
      return localStorage.getItem('scande_high_contrast') === 'true';
    } catch {
      return false;
    }
  });

  // Apply font size adjustment to html root and persist
  useEffect(() => {
    const root = document.documentElement;
    if (fontSizeLevel === -1) {
      root.style.fontSize = '90%';
    } else if (fontSizeLevel === 0) {
      root.style.fontSize = '100%';
    } else if (fontSizeLevel === 1) {
      root.style.fontSize = '112.5%';
    } else if (fontSizeLevel === 2) {
      root.style.fontSize = '125%';
    }
    try {
      localStorage.setItem('scande_font_size', String(fontSizeLevel));
    } catch {
      // ignore storage errors
    }
  }, [fontSizeLevel]);

  // Apply light/dark theme to html root and persist in localStorage
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark-mode');
    } else {
      root.classList.remove('dark-mode');
    }
    try {
      localStorage.setItem('scande_theme', theme);
    } catch {
      // ignore storage errors
    }
  }, [theme]);

  // Apply high-contrast-mode class to <html> root and persist in localStorage
  useEffect(() => {
    const root = document.documentElement;
    if (isHighContrast) {
      root.classList.add('high-contrast-mode');
    } else {
      root.classList.remove('high-contrast-mode');
    }
    try {
      localStorage.setItem('scande_high_contrast', String(isHighContrast));
    } catch {
      // ignore storage errors
    }
  }, [isHighContrast]);

  // Register accesskey shortcuts (eMAG standard)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && !e.ctrlKey && !e.shiftKey) {
        if (e.key === '1') {
          e.preventDefault();
          const main = document.getElementById('main-content');
          main?.focus();
          main?.scrollIntoView({ behavior: 'smooth' });
        } else if (e.key === '2') {
          e.preventDefault();
          const nav = document.getElementById('main-nav');
          nav?.scrollIntoView({ behavior: 'smooth' });
        } else if (e.key === '3') {
          e.preventDefault();
          const input = document.getElementById('url-input') as HTMLInputElement | null;
          input?.focus();
          input?.scrollIntoView({ behavior: 'smooth' });
        } else if (e.key === '4') {
          e.preventDefault();
          onOpenStatement();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenStatement]);

  return (
    <aside
      aria-label="Barra de Acessibilidade Governamental e Recursos de Conforto Visual (eMAG / LBI)"
      className="bg-slate-900 text-slate-100 text-[11px] py-1.5 px-4 border-b border-slate-800 transition-colors"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* eMAG standard shortcuts */}
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap text-slate-300 font-medium">
          <span className="hidden md:inline font-bold text-slate-400 uppercase tracking-wider text-[10px]">
            Atalhos eMAG:
          </span>
          <a
            href="#main-content"
            accessKey="1"
            className="hover:text-white transition-colors focus-visible:underline"
            title="Ir para o conteúdo principal [Alt + 1]"
          >
            Ir para conteúdo <span className="text-slate-400 font-mono">[1]</span>
          </a>
          <span aria-hidden="true" className="text-slate-700">·</span>
          <a
            href="#main-nav"
            accessKey="2"
            className="hover:text-white transition-colors focus-visible:underline"
            title="Ir para o menu de navegação [Alt + 2]"
          >
            Menu <span className="text-slate-400 font-mono">[2]</span>
          </a>
          <span aria-hidden="true" className="text-slate-700">·</span>
          <a
            href="#url-input"
            accessKey="3"
            className="hover:text-white transition-colors focus-visible:underline"
            title="Ir diretamente para o campo de análise de URL [Alt + 3]"
          >
            Buscar <span className="text-slate-400 font-mono">[3]</span>
          </a>
        </div>

        {/* Visual Controls: Font Size, Theme (Claro/Escuro), High Contrast & Statement */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          {/* Font Controls */}
          <div
            role="group"
            aria-label="Ajuste de tamanho de fonte"
            className="flex items-center gap-1 bg-slate-800/90 rounded-md p-0.5 border border-slate-700"
          >
            <button
              type="button"
              onClick={() => setFontSizeLevel(prev => Math.max(-1, prev - 1))}
              disabled={fontSizeLevel <= -1}
              className="px-2 py-0.5 rounded text-xs font-bold text-slate-200 hover:text-white disabled:opacity-30 cursor-pointer focus-visible:ring-1 focus-visible:ring-indigo-400"
              title="Diminuir tamanho do texto"
              aria-label="Diminuir tamanho da fonte"
            >
              A-
            </button>
            <button
              type="button"
              onClick={() => setFontSizeLevel(0)}
              className="px-2 py-0.5 rounded text-xs font-bold text-slate-200 hover:text-white cursor-pointer focus-visible:ring-1 focus-visible:ring-indigo-400"
              title="Restaurar tamanho padrão da fonte"
              aria-label="Restaurar tamanho padrão da fonte"
            >
              A
            </button>
            <button
              type="button"
              onClick={() => setFontSizeLevel(prev => Math.min(2, prev + 1))}
              disabled={fontSizeLevel >= 2}
              className="px-2 py-0.5 rounded text-xs font-bold text-slate-200 hover:text-white disabled:opacity-30 cursor-pointer focus-visible:ring-1 focus-visible:ring-indigo-400"
              title="Aumentar tamanho do texto"
              aria-label="Aumentar tamanho da fonte"
            >
              A+
            </button>
          </div>

          {/* Theme Toggle (Claro / Escuro) with localStorage persistence & WCAG AAA contrast */}
          <button
            type="button"
            onClick={() => setTheme(prev => (prev === 'light' ? 'dark' : 'light'))}
            aria-pressed={theme === 'dark'}
            aria-label={theme === 'dark' ? 'Alternar para tema claro' : 'Alternar para tema escuro'}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-400 ${
              theme === 'dark'
                ? 'bg-indigo-950 text-indigo-100 border-indigo-500'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
            title="Alternar entre tema claro e tema escuro (WCAG AAA)"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-300" aria-hidden="true" />
                <span>Tema Claro</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-300" aria-hidden="true" />
                <span>Tema Escuro</span>
              </>
            )}
          </button>

          {/* High Contrast Toggle ('high-contrast-mode' on <html>) */}
          <button
            type="button"
            onClick={() => setIsHighContrast(prev => !prev)}
            aria-pressed={isHighContrast}
            aria-label={
              isHighContrast
                ? 'Desativar modo de alto contraste (high-contrast-mode)'
                : 'Ativar modo de alto contraste (high-contrast-mode)'
            }
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-400 ${
              isHighContrast
                ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
            title="Alternar classe high-contrast-mode no elemento <html> para baixa visão"
          >
            <Contrast className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{isHighContrast ? 'Alto Contraste Ativo' : 'Alto Contraste'}</span>
          </button>

          {/* Accessibility Statement Link */}
          <button
            type="button"
            onClick={onOpenStatement}
            accessKey="4"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-700 hover:bg-indigo-600 text-white transition-colors cursor-pointer border border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-400"
            title="Declaração de Acessibilidade Legal (LBI Art. 63) [Alt + 4]"
          >
            <Accessibility className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Acessibilidade Legal</span>
            <span className="sm:hidden">Acessibilidade</span>
            <span className="text-indigo-200 font-mono text-[10px]">[4]</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
