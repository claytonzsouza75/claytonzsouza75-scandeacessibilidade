import React from 'react';
import type { PriorityBuckets } from '../types/accessibility.js';
import { IssueItem } from './IssueItem.js';
import { Flame, Target, Sparkles, CheckCircle2 } from 'lucide-react';

interface PrioritiesSectionProps {
  priorities: PriorityBuckets;
}

export const PrioritiesSection: React.FC<PrioritiesSectionProps> = ({ priorities }) => {
  const totalPriorities =
    priorities.corrijaPrimeiro.length +
    priorities.proximasMelhorias.length +
    priorities.aperfeicoamentos.length;

  if (totalPriorities === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
        <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" aria-hidden="true" />
        <h3 className="text-lg font-bold text-slate-900 mb-1">
          Nenhuma barreira grave pendente!
        </h3>
        <p className="text-sm text-slate-600">
          A página analisada atende a todos os critérios automáticos prioritários.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-1">
          O que corrigir primeiro
        </h2>
        <p className="text-sm text-slate-600">
          Problemas priorizados pela matriz de <strong>Impacto para o usuário × Esforço técnico de implementação</strong>.
        </p>
      </div>

      {/* Group 1: CORRIJA PRIMEIRO */}
      <section className="bg-white rounded-2xl border-2 border-red-200 p-6 shadow-xs">
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-red-100">
          <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center font-bold">
            <Flame className="w-4 h-4 text-red-600" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base font-bold text-red-950 uppercase tracking-wide">
              1. Corrija Primeiro
            </h3>
            <p className="text-xs text-red-700">
              Barreiras críticas de alto impacto que impedem a navegação ou o uso de funcionalidades essenciais.
            </p>
          </div>
          <span className="ml-auto font-mono text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full tabular-nums">
            {priorities.corrijaPrimeiro.length} {priorities.corrijaPrimeiro.length === 1 ? 'item' : 'itens'}
          </span>
        </div>

        {priorities.corrijaPrimeiro.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-2">
            Nenhum problema classificado como crítico ou bloqueador no momento.
          </p>
        ) : (
          <div className="space-y-4">
            {priorities.corrijaPrimeiro.map((issue, idx) => (
              <IssueItem key={issue.id} issue={issue} index={idx} />
            ))}
          </div>
        )}
      </section>

      {/* Group 2: PRÓXIMAS MELHORIAS */}
      <section className="bg-white rounded-2xl border border-amber-200 p-6 shadow-xs">
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-amber-100">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
            <Target className="w-4 h-4 text-amber-600" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base font-bold text-amber-950 uppercase tracking-wide">
              2. Próximas Melhorias
            </h3>
            <p className="text-xs text-amber-700">
              Problemas importantes que geram ruído ou desorientação, mas não necessariamente impedem o fluxo por completo.
            </p>
          </div>
          <span className="ml-auto font-mono text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full tabular-nums">
            {priorities.proximasMelhorias.length} {priorities.proximasMelhorias.length === 1 ? 'item' : 'itens'}
          </span>
        </div>

        {priorities.proximasMelhorias.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-2">
            Nenhum problema nesta categoria intermediária.
          </p>
        ) : (
          <div className="space-y-4">
            {priorities.proximasMelhorias.map((issue, idx) => (
              <IssueItem key={issue.id} issue={issue} index={idx} />
            ))}
          </div>
        )}
      </section>

      {/* Group 3: APERFEIÇOAMENTOS */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4 text-slate-600" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 uppercase tracking-wide">
              3. Aperfeiçoamentos
            </h3>
            <p className="text-xs text-slate-500">
              Ajustes de boas práticas semânticas e melhorias contínuas recomendadas.
            </p>
          </div>
          <span className="ml-auto font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full tabular-nums">
            {priorities.aperfeicoamentos.length} {priorities.aperfeicoamentos.length === 1 ? 'item' : 'itens'}
          </span>
        </div>

        {priorities.aperfeicoamentos.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-2">
            Nenhum aperfeiçoamento adicional identificado.
          </p>
        ) : (
          <div className="space-y-4">
            {priorities.aperfeicoamentos.map((issue, idx) => (
              <IssueItem key={issue.id} issue={issue} index={idx} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
