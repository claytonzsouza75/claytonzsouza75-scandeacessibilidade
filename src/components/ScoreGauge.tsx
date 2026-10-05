import React from 'react';
import type { AuditSummary } from '../types/accessibility.js';
import { CheckCircle2, AlertTriangle, XCircle, Search, ShieldCheck } from 'lucide-react';

interface ScoreGaugeProps {
  score: number;
  level: 'Excelente' | 'Bom' | 'Precisa melhorar' | 'Crítico';
  summary: AuditSummary;
  totalCategories: number;
  categoriesWithIssues: number;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  level,
  summary,
  totalCategories,
  categoriesWithIssues,
}) => {
  // SVG circular calculations
  const size = 160;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let scoreColorHex = '#16a34a'; // green
  let scoreColorClass = 'text-green-600 stroke-green-600';
  let levelBgClass = 'text-emerald-700 bg-emerald-50 border-emerald-200';

  if (score < 50) {
    scoreColorHex = '#dc2626';
    scoreColorClass = 'text-red-600 stroke-red-600';
    levelBgClass = 'text-red-700 bg-red-50 border-red-200';
  } else if (score < 75) {
    scoreColorHex = '#d97706';
    scoreColorClass = 'text-amber-500 stroke-amber-500';
    levelBgClass = 'text-amber-700 bg-amber-50 border-amber-200';
  } else if (score < 90) {
    scoreColorHex = '#4f46e5';
    scoreColorClass = 'text-indigo-600 stroke-indigo-600';
    levelBgClass = 'text-indigo-700 bg-indigo-50 border-indigo-200';
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Circular Indicator */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center text-center p-2">
          <div className="relative w-44 h-44 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
              {/* Background Circle */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                className="stroke-slate-100"
                strokeWidth={strokeWidth}
                fill="transparent"
              />
              {/* Foreground Animated Circle */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                className={`${scoreColorClass} transition-all duration-1000 ease-out`}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            {/* Score Text in Center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl sm:text-5xl font-extrabold text-slate-900 font-mono tracking-tight tabular-nums">
                {score}
              </span>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                de 100 pontos
              </span>
            </div>
          </div>

          {/* Level Label */}
          <div className="mt-3 flex flex-col items-center">
            <span className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold border ${levelBgClass}`}>
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Nível: {level}</span>
            </span>
            <p className="mt-2 text-xs text-slate-500 max-w-xs text-center leading-relaxed">
              Avaliação técnica dos 10 critérios estruturais. Requisitos subjetivos exigem validação humana.
            </p>
          </div>
        </div>

        {/* 4 Metrics Distribution */}
        <div className="lg:col-span-8">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center justify-between">
              <span>Visão Geral dos 10 Critérios Avaliados</span>
            </h2>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
              <span>{summary.totalPassed} critérios aprovados</span>
              <span aria-hidden="true">·</span>
              <span>{categoriesWithIssues} com barreiras detectadas</span>
              <span aria-hidden="true">·</span>
              <span>{summary.totalManualReview} itens para revisão humana</span>
            </div>
          </div>

          {/* 4 Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {/* Aprovados */}
            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/90 card-hover-effect">
              <div className="flex items-center gap-1.5 mb-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                <span className="text-xs font-semibold text-slate-600">Aprovados</span>
              </div>
              <div className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
                {summary.totalPassed}
                <span className="text-xs font-normal text-slate-400 ml-1">/ 10</span>
              </div>
            </div>

            {/* Problemas */}
            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/90 card-hover-effect">
              <div className="flex items-center gap-1.5 mb-1.5">
                <XCircle className="w-4 h-4 text-red-600" aria-hidden="true" />
                <span className="text-xs font-semibold text-slate-600">Falhas</span>
              </div>
              <div className="text-2xl font-extrabold text-red-600 font-mono tabular-nums">
                {summary.totalErrors}
              </div>
            </div>

            {/* Atenção */}
            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/90 card-hover-effect">
              <div className="flex items-center gap-1.5 mb-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" aria-hidden="true" />
                <span className="text-xs font-semibold text-slate-600">Avisos</span>
              </div>
              <div className="text-2xl font-extrabold text-amber-600 font-mono tabular-nums">
                {summary.totalWarnings}
              </div>
            </div>

            {/* Revisão Manual */}
            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/90 card-hover-effect">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Search className="w-4 h-4 text-sky-600" aria-hidden="true" />
                <span className="text-xs font-semibold text-slate-600">Revisão Manual</span>
              </div>
              <div className="text-2xl font-extrabold text-sky-700 font-mono tabular-nums">
                {summary.totalManualReview}
              </div>
            </div>
          </div>

          {/* Severity distribution bar */}
          <div className="space-y-2 p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-slate-600 font-medium">
              <span>Distribuição de Severidade das Barreiras:</span>
              <span className="font-mono tabular-nums text-slate-700">
                {summary.criticalCount} críticas · {summary.highCount} altas · {summary.mediumCount} médias
              </span>
            </div>
            <div className="h-2.5 w-full bg-slate-200 rounded-full flex overflow-hidden">
              {summary.criticalCount > 0 && (
                <div
                  className="bg-red-600 h-full transition-all"
                  style={{ width: `${(summary.criticalCount / (summary.totalErrors + summary.totalWarnings || 1)) * 100}%` }}
                  title={`${summary.criticalCount} Críticos`}
                />
              )}
              {summary.highCount > 0 && (
                <div
                  className="bg-amber-500 h-full transition-all"
                  style={{ width: `${(summary.highCount / (summary.totalErrors + summary.totalWarnings || 1)) * 100}%` }}
                  title={`${summary.highCount} Altos`}
                />
              )}
              {summary.mediumCount > 0 && (
                <div
                  className="bg-sky-500 h-full transition-all"
                  style={{ width: `${(summary.mediumCount / (summary.totalErrors + summary.totalWarnings || 1)) * 100}%` }}
                  title={`${summary.mediumCount} Médios`}
                />
              )}
              {summary.lowCount > 0 && (
                <div
                  className="bg-slate-300 h-full transition-all"
                  style={{ width: `${(summary.lowCount / (summary.totalErrors + summary.totalWarnings || 1)) * 100}%` }}
                  title={`${summary.lowCount} Baixos`}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
