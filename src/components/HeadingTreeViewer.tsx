import React from 'react';
import type { CategoryResult, HeadingItem } from '../types/accessibility.js';
import { Heading, AlertTriangle, CheckCircle2, Layers } from 'lucide-react';

interface HeadingTreeViewerProps {
  headings: HeadingItem[];
  headingCategory?: CategoryResult;
}

export const HeadingTreeViewer: React.FC<HeadingTreeViewerProps> = ({ headings, headingCategory }) => {
  const landmarks = headingCategory?.meta || {};

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Heading className="w-5 h-5 text-indigo-600" aria-hidden="true" />
            Estrutura Hierárquica de Cabeçalhos
          </h2>
          <p className="text-sm text-slate-600">
            Representação visual da árvore de títulos (H1 → H6) encontrados no código da página.
          </p>
        </div>
      </div>

      {/* Semantic Landmarks Overview */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
          Marcos Semânticos (HTML5 Landmarks)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="flex items-center gap-2 p-2 rounded bg-white border border-slate-200">
            {landmarks.hasHeader ? (
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" aria-hidden="true" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" aria-hidden="true" />
            )}
            <span className="font-mono text-slate-800">&lt;header&gt;</span>
          </div>

          <div className="flex items-center gap-2 p-2 rounded bg-white border border-slate-200">
            {landmarks.hasNav ? (
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" aria-hidden="true" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" aria-hidden="true" />
            )}
            <span className="font-mono text-slate-800">&lt;nav&gt;</span>
          </div>

          <div className="flex items-center gap-2 p-2 rounded bg-white border border-slate-200">
            {landmarks.hasMain ? (
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" aria-hidden="true" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" aria-hidden="true" />
            )}
            <span className="font-mono text-slate-800">&lt;main&gt;</span>
          </div>

          <div className="flex items-center gap-2 p-2 rounded bg-white border border-slate-200">
            {landmarks.hasFooter ? (
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" aria-hidden="true" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" aria-hidden="true" />
            )}
            <span className="font-mono text-slate-800">&lt;footer&gt;</span>
          </div>
        </div>
      </div>

      {/* Visual Tree */}
      {headings.length === 0 ? (
        <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          Nenhum elemento de cabeçalho (&lt;h1&gt; até &lt;h6&gt;) foi detectado na página.
        </div>
      ) : (
        <div className="space-y-2 p-4 bg-slate-900 rounded-xl text-slate-200 font-mono text-xs overflow-x-auto">
          {headings.map((item, idx) => {
            const indentLevel = item.level - 1;
            const paddingLeft = `${indentLevel * 1.5}rem`;

            return (
              <div
                key={item.id || idx}
                style={{ paddingLeft }}
                className={`py-1.5 px-2 rounded flex items-start gap-2.5 transition-colors ${
                  item.hasWarning
                    ? 'bg-red-950/80 border border-red-500/50 text-red-200'
                    : item.level === 1
                    ? 'bg-slate-800 text-indigo-300 font-bold'
                    : 'text-slate-300 hover:bg-slate-800/50'
                }`}
              >
                <span className="shrink-0 px-1.5 py-0.5 rounded bg-black/40 text-[10px] uppercase font-bold text-slate-400">
                  H{item.level}
                </span>

                <div className="flex-1 min-w-0">
                  <span className="truncate block font-sans text-xs">
                    {item.text}
                  </span>

                  {item.hasWarning && (
                    <div className="mt-1 flex items-center gap-1.5 text-[11px] text-red-400 font-mono">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      <span>{item.warningMessage}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
        <strong>Dica de Acessibilidade:</strong> Não pule níveis de títulos (como de H1 diretamente para H4). Se você precisa que um título seja menor visualmente, altere o tamanho no CSS com classes como <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">text-base</code> ou <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">font-medium</code>, mantendo a tag semântica linear no HTML.
      </div>
    </div>
  );
};
