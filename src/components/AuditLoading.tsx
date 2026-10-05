import React, { useEffect, useState } from 'react';
import { Check, Circle, Loader2 } from 'lucide-react';

interface AuditLoadingProps {
  targetUrl: string;
}

const STEPS = [
  { id: 'fetch', label: 'Carregando página com proteção de segurança' },
  { id: 'structure', label: 'Analisando estrutura de cabeçalhos e marcos semânticos' },
  { id: 'images', label: 'Verificando imagens, atributos alt e mídias visuais' },
  { id: 'forms', label: 'Avaliando formulários, labels e campos de entrada' },
  { id: 'interactive', label: 'Testando elementos interativos, contraste e foco de teclado' },
  { id: 'score', label: 'Calculando pontuação e ponderando prioridades' },
];

export const AuditLoading: React.FC<AuditLoadingProps> = ({ targetUrl }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStepIndex(prev => {
        if (prev < STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 600);

    return () => clearInterval(timer);
  }, []);

  const progressPercent = Math.min(92, Math.round(((currentStepIndex + 1) / STEPS.length) * 100));

  return (
    <div
      className="max-w-xl mx-auto my-12 p-8 bg-white rounded-2xl border border-slate-200 shadow-sm text-left"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-1">
          Analisando acessibilidade...
        </h2>
        <p className="text-sm text-slate-600 truncate font-mono">
          {targetUrl}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 rounded-full h-2 mb-8 overflow-hidden">
        <div
          className="bg-indigo-600 h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Stepped Checklist */}
      <ul className="space-y-3.5 text-sm" aria-label="Progresso da análise">
        {STEPS.map((step, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;
          const isPending = idx > currentStepIndex;

          return (
            <li key={step.id} className="flex items-center gap-3">
              {isDone && (
                <div className="w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" aria-hidden="true" />
                </div>
              )}
              {isCurrent && (
                <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                </div>
              )}
              {isPending && (
                <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center shrink-0">
                  <Circle className="w-2.5 h-2.5 fill-current" aria-hidden="true" />
                </div>
              )}

              <span
                className={`transition-colors ${
                  isDone
                    ? 'text-slate-800 font-medium'
                    : isCurrent
                    ? 'text-indigo-900 font-semibold'
                    : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ul>

      <p className="mt-8 text-xs text-slate-500 text-center">
        Examinando o código HTML, contraste, atributos ARIA e navegação por teclado.
      </p>
    </div>
  );
};
