import React, { useState } from 'react';
import { Search, Globe, Shield, ArrowRight, AlertCircle, Layers, Flame, Code2 } from 'lucide-react';

interface HeroProps {
  onAnalyze: (url: string, sampleId?: string) => void;
  isLoading: boolean;
  initialUrl?: string;
}

export const Hero: React.FC<HeroProps> = ({ onAnalyze, isLoading, initialUrl = '' }) => {
  const [url, setUrl] = useState(initialUrl);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const trimmed = url.trim();
    if (!trimmed) {
      setValidationError('Por favor, informe a URL do site a ser analisado.');
      return;
    }

    if (!trimmed.includes('.') || trimmed.length < 4) {
      setValidationError('Por favor, insira um endereço de site válido (ex: meusite.com.br ou https://...).');
      return;
    }

    let normalized = trimmed;
    if (!/^https?:\/\//i.test(normalized)) {
      normalized = `https://${normalized}`;
    }

    onAnalyze(normalized);
  };

  const handleSelectSample = (sampleId: string) => {
    setValidationError(null);
    if (sampleId === 'barreiras') {
      setUrl('https://exemplo-com-barreiras.com.br');
    } else {
      setUrl('https://exemplo-acessivel.com.br');
    }
    onAnalyze('', sampleId);
  };

  const handleDirectUrl = (directUrl: string) => {
    setValidationError(null);
    setUrl(directUrl);
    onAnalyze(directUrl);
  };

  return (
    <section className="relative pt-14 pb-16 md:pt-20 md:pb-24 bg-gradient-to-b from-white via-slate-50/70 to-slate-100/50 border-b border-slate-200/80 overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 bg-dot-pattern opacity-40 pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
        {/* Brand Emblem & Editorial Subtitle Kicker */}
        <div className="flex flex-col items-center justify-center gap-4 mb-6">
          <div className="p-2.5 rounded-3xl bg-white/95 border-2 border-indigo-200/90 shadow-lg shadow-indigo-500/10 inline-flex items-center justify-center">
            <img
              src="/src/assets/images/scande_logo_mark_1790633121566.jpg"
              alt="Logotipo ScandeAcessibilidade: olho digital estilizado com ondas de varredura em azul índigo e verde esmeralda"
              referrerPolicy="no-referrer"
              className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-2xl object-cover shadow-xs"
            />
          </div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-700 uppercase tracking-wider">
            <span>Auditoria Técnica de Acessibilidade Digital</span>
            <span aria-hidden="true" className="text-slate-400">·</span>
            <span>WCAG 2.1 AA/AAA</span>
          </div>
        </div>

        {/* Hero Title with balance */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12] mb-5 text-balance">
          Descubra barreiras de acessibilidade do seu site{' '}
          <span className="text-indigo-700 underline decoration-indigo-200 decoration-wavy decoration-from-font underline-offset-4">
            em poucos segundos.
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-base sm:text-lg text-slate-700 max-w-2xl mx-auto leading-relaxed mb-8 text-balance font-normal">
          Avaliação automatizada dos 10 critérios essenciais com priorização por impacto, visualizador de cabeçalhos e sugestões práticas de código.
        </p>

        {/* Big Search / URL Input Box */}
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-4 text-left" noValidate>
          <div className="relative flex flex-col sm:flex-row items-stretch gap-2 p-2 bg-white rounded-2xl border-2 border-slate-300 hover:border-slate-400 focus-within:border-indigo-700 focus-within:ring-4 focus-within:ring-indigo-100/90 shadow-md transition-all">
            <div className="flex items-center pl-3 flex-1 min-w-0">
              <Globe className="w-5 h-5 text-indigo-700 shrink-0 mr-3" aria-hidden="true" />
              <label htmlFor="url-input" className="sr-only">
                Endereço URL do site
              </label>
              <input
                id="url-input"
                type="text"
                inputMode="url"
                value={url}
                onChange={e => {
                  setUrl(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                disabled={isLoading}
                placeholder="seusite.com.br ou https://..."
                className="w-full bg-transparent text-slate-900 text-base sm:text-lg focus:outline-none placeholder:text-slate-600 py-2 font-medium"
                aria-invalid={validationError ? 'true' : 'false'}
                aria-describedby={validationError ? 'url-error-msg' : 'url-helper-msg'}
                autoComplete="url"
                autoCapitalize="none"
                spellCheck="false"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-700 hover:bg-indigo-800 active:bg-indigo-900 text-white font-semibold text-sm sm:text-base rounded-xl transition-all shadow-xs hover:shadow-sm disabled:opacity-60 whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-indigo-900 focus-visible:ring-offset-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Analisando...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" aria-hidden="true" />
                  <span>Analisar acessibilidade</span>
                </>
              )}
            </button>
          </div>

          {/* Validation error message with aria-live */}
          {validationError && (
            <div
              id="url-error-msg"
              role="alert"
              className="mt-3 flex items-center gap-2 text-sm text-red-900 bg-red-50 p-3 rounded-xl border border-red-300 font-medium"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-red-700" aria-hidden="true" />
              <span>{validationError}</span>
            </div>
          )}
        </form>

        {/* Quick Suggestion Chips with High Contrast and Focus States */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-700 mb-10">
          <span className="font-bold text-slate-800">Testar agora:</span>
          <button
            type="button"
            onClick={() => handleDirectUrl('https://wikipedia.org')}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-indigo-600 hover:text-indigo-800 active:bg-slate-50 transition-colors cursor-pointer text-slate-800 font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-700 focus-visible:ring-offset-2"
          >
            Wikipedia
          </button>
          <button
            type="button"
            onClick={() => handleDirectUrl('https://github.com')}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-indigo-600 hover:text-indigo-800 active:bg-slate-50 transition-colors cursor-pointer text-slate-800 font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-700 focus-visible:ring-offset-2"
          >
            GitHub
          </button>
          <span aria-hidden="true" className="text-slate-400">·</span>
          <button
            type="button"
            onClick={() => handleSelectSample('barreiras')}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 hover:border-amber-500 hover:text-amber-950 active:bg-amber-50 transition-colors cursor-pointer text-amber-900 font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-800 focus-visible:ring-offset-2"
          >
            Cenário com Barreiras (Demo)
          </button>
          <button
            type="button"
            onClick={() => handleSelectSample('otimizado')}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-lg bg-white border border-emerald-300 hover:border-emerald-600 hover:text-emerald-950 active:bg-emerald-50 transition-colors cursor-pointer text-emerald-900 font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-800 focus-visible:ring-offset-2"
          >
            Portal Modelo WCAG (Demo)
          </button>
        </div>

        {/* 3 Pillars / Value Proposition Grid with High Contrast */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-slate-200/90 text-left">
          <div className="p-4 rounded-xl bg-white border border-slate-300 shadow-2xs flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center shrink-0 text-indigo-700">
              <Layers className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                10 Critérios WCAG 2.1
              </h2>
              <p className="text-xs text-slate-700 leading-relaxed font-normal">
                Contraste, alt-text, links genéricos, foco por teclado, hierarquia de cabeçalhos e zoom.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-300 shadow-2xs flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0 text-amber-800">
              <Flame className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                Priorização por Impacto
              </h2>
              <p className="text-xs text-slate-700 leading-relaxed font-normal">
                Matriz de Impacto × Esforço para saber exatamente o que corrigir primeiro no seu backlog.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-300 shadow-2xs flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 text-emerald-800">
              <Code2 className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                Soluções Prontas em Código
              </h2>
              <p className="text-xs text-slate-700 leading-relaxed font-normal">
                Trechos de HTML semântico e ARIA recomendados com botão de cópia rápida para desenvolvedores.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
