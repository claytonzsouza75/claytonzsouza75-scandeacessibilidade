import React, { useState } from 'react';
import type { Issue } from '../types/accessibility.js';
import {
  Code,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  HelpCircle,
  Users,
  Wrench,
  Terminal,
} from 'lucide-react';

interface IssueItemProps {
  issue: Issue;
  index: number;
}

export const IssueItem: React.FC<IssueItemProps> = ({ issue, index }) => {
  const [showCodeSuggestion, setShowCodeSuggestion] = useState(false);
  const [showDevDetails, setShowDevDetails] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedDev, setCopiedDev] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(issue.suggestedCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyDevInfo = () => {
    const devText = `[${issue.severity.toUpperCase()}] ${issue.title}
Seletor: ${issue.selector}
Regra violada: ${issue.ruleViolated}
HTML:
${issue.htmlSnippet}
Sugestão:
${issue.suggestedCode}`;
    navigator.clipboard.writeText(devText);
    setCopiedDev(true);
    setTimeout(() => setCopiedDev(false), 2000);
  };

  let severityBadge = 'text-red-700 bg-red-50 border-red-200';
  let severityBorder = 'border-l-4 border-l-red-600';

  if (issue.severity === 'alta') {
    severityBadge = 'text-amber-700 bg-amber-50 border-amber-200';
    severityBorder = 'border-l-4 border-l-amber-500';
  } else if (issue.severity === 'media') {
    severityBadge = 'text-sky-700 bg-sky-50 border-sky-200';
    severityBorder = 'border-l-4 border-l-sky-500';
  } else if (issue.severity === 'baixa') {
    severityBadge = 'text-slate-700 bg-slate-100 border-slate-200';
    severityBorder = 'border-l-4 border-l-slate-300';
  }

  return (
    <article className={`border border-slate-200 rounded-xl bg-white p-5 hover:border-slate-300 transition-all shadow-2xs ${severityBorder}`}>
      {/* Title & Metadata Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap text-xs">
            <span className={`px-2.5 py-0.5 rounded-full font-bold border uppercase tracking-wider text-[11px] ${severityBadge}`}>
              {issue.severity}
            </span>
            <span className="text-slate-500 font-medium">
              Localização: <span className="text-slate-700">{issue.location}</span>
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="text-slate-500 font-mono">
              Esforço: <strong className="text-slate-700 capitalize">{issue.effort}</strong>
            </span>
          </div>
          <h4 className="text-base font-bold text-slate-900 leading-snug">
            {issue.title}
          </h4>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowCodeSuggestion(!showCodeSuggestion)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 active:bg-indigo-200 transition-colors cursor-pointer border border-indigo-100"
          >
            <Code className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{showCodeSuggestion ? 'Ocultar código' : 'Ver sugestão de código'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowDevDetails(!showDevDetails)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300 transition-colors cursor-pointer border border-slate-200/80"
          >
            <Terminal className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{showDevDetails ? 'Ocultar técnico' : 'Detalhes técnicos'}</span>
          </button>
        </div>
      </div>

      {/* 4 Didactic Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs leading-relaxed mt-2 pt-3 border-t border-slate-100">
        {/* Block 1: O que encontramos */}
        <div className="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200/70">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-indigo-600 shrink-0" aria-hidden="true" />
            <span>O que encontramos</span>
          </div>
          <p className="text-slate-600">{issue.description}</p>
        </div>

        {/* Block 2: Por que isso importa */}
        <div className="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200/70">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" aria-hidden="true" />
            <span>Por que isso importa</span>
          </div>
          <p className="text-slate-600">{issue.whyItMatters}</p>
        </div>

        {/* Block 3: Quem pode ser afetado */}
        <div className="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200/70">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-1.5">
            <Users className="w-3.5 h-3.5 text-sky-600 shrink-0" aria-hidden="true" />
            <span>Quem pode ser afetado</span>
          </div>
          <p className="text-slate-600">{issue.whoIsAffected}</p>
        </div>

        {/* Block 4: Como corrigir */}
        <div className="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200/70">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-1.5">
            <Wrench className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
            <span>Como corrigir</span>
          </div>
          <p className="text-slate-600">{issue.howToFix}</p>
        </div>
      </div>

      {/* Expandable Code Suggestion */}
      {showCodeSuggestion && (
        <div className="mt-4 p-4 rounded-xl bg-slate-950 text-slate-100 border border-slate-800 text-xs shadow-md">
          <div className="flex items-center justify-between mb-2.5 pb-2.5 border-b border-slate-800/80">
            <span className="font-mono text-slate-300 font-semibold flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5 text-indigo-400" aria-hidden="true" />
              Sugestão de Código Acessível
            </span>
            <button
              type="button"
              onClick={handleCopyCode}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors cursor-pointer"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                  <span className="text-emerald-300">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                  <span>Copiar código</span>
                </>
              )}
            </button>
          </div>
          <pre className="font-mono text-emerald-300 overflow-x-auto p-3 rounded-lg bg-black/60 text-[11px] leading-relaxed whitespace-pre-wrap border border-slate-800/50">
            {issue.suggestedCode}
          </pre>
          <p className="mt-2.5 text-[11px] text-slate-400">
            * O ScandeAcessibilidade não altera seu site diretamente. Copie o trecho sugerido e aplique no seu repositório ou CMS.
          </p>
        </div>
      )}

      {/* Expandable Developer Mode Details */}
      {showDevDetails && (
        <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 shadow-2xs">
          <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-200">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-slate-600" aria-hidden="true" />
              Modo Desenvolvedor — Detalhes Técnicos
            </span>
            <button
              type="button"
              onClick={handleCopyDevInfo}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium transition-colors cursor-pointer"
            >
              {copiedDev ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" aria-hidden="true" />
                  <span className="text-emerald-700">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-slate-500" aria-hidden="true" />
                  <span>Copiar dados técnicos</span>
                </>
              )}
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <span className="font-semibold text-slate-600 uppercase text-[10px] tracking-wider block mb-1">Regra Violada:</span>
              <p className="font-mono text-slate-900 bg-white p-2 rounded-md border border-slate-200 font-medium">{issue.ruleViolated}</p>
            </div>

            <div>
              <span className="font-semibold text-slate-600 uppercase text-[10px] tracking-wider block mb-1">Seletor CSS Alvo:</span>
              <p className="font-mono text-indigo-700 bg-indigo-50/80 p-2 rounded-md border border-indigo-100 font-medium">
                {issue.selector}
              </p>
            </div>

            {issue.htmlSnippet && (
              <div>
                <span className="font-semibold text-slate-600 uppercase text-[10px] tracking-wider block mb-1">Trecho HTML Encontrado no DOM:</span>
                <pre className="font-mono text-slate-800 bg-white p-2.5 rounded-md border border-slate-200 overflow-x-auto text-[11px] leading-relaxed">
                  {issue.htmlSnippet}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </article>
  );
};
