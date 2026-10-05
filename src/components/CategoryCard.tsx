import React, { useState } from 'react';
import type { CategoryResult } from '../types/accessibility.js';
import { IssueItem } from './IssueItem.js';
import {
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Link,
  Contrast,
  Image,
  Keyboard,
  Heading,
  FileText,
  Activity,
  Video,
  ZoomIn,
  Boxes,
} from 'lucide-react';

interface CategoryCardProps {
  category: CategoryResult;
  index: number;
  filteredSeverity?: 'todas' | 'critica' | 'alta' | 'media' | 'baixa';
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  index,
  filteredSeverity = 'todas',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const displayedIssues =
    filteredSeverity !== 'todas'
      ? category.issues.filter(i => i.severity === filteredSeverity)
      : category.issues;

  // Map category key to meaningful icon
  const getIcon = () => {
    switch (category.key) {
      case 'generic_links':
        return <Link className="w-5 h-5 text-indigo-600" aria-hidden="true" />;
      case 'button_contrast':
        return <Contrast className="w-5 h-5 text-indigo-600" aria-hidden="true" />;
      case 'alt_text':
        return <Image className="w-5 h-5 text-indigo-600" aria-hidden="true" />;
      case 'keyboard_access':
        return <Keyboard className="w-5 h-5 text-indigo-600" aria-hidden="true" />;
      case 'heading_structure':
        return <Heading className="w-5 h-5 text-indigo-600" aria-hidden="true" />;
      case 'forms':
        return <FileText className="w-5 h-5 text-indigo-600" aria-hidden="true" />;
      case 'dynamic_content':
        return <Activity className="w-5 h-5 text-indigo-600" aria-hidden="true" />;
      case 'videos':
        return <Video className="w-5 h-5 text-indigo-600" aria-hidden="true" />;
      case 'zoom_responsive':
        return <ZoomIn className="w-5 h-5 text-indigo-600" aria-hidden="true" />;
      case 'accessibility_plugins':
        return <Boxes className="w-5 h-5 text-indigo-600" aria-hidden="true" />;
      default:
        return <CheckCircle2 className="w-5 h-5 text-indigo-600" aria-hidden="true" />;
    }
  };

  let statusBadge = 'text-emerald-950 bg-emerald-50 border-emerald-300';
  let statusText = 'Excelente';
  let StatusIcon = CheckCircle2;

  if (category.status === 'critico') {
    statusBadge = 'text-red-950 bg-red-50 border-red-300';
    statusText = 'Crítico';
    StatusIcon = XCircle;
  } else if (category.status === 'precisa_melhorar') {
    statusBadge = 'text-amber-950 bg-amber-50 border-amber-300';
    statusText = 'Precisa melhorar';
    StatusIcon = AlertTriangle;
  } else if (category.status === 'bom') {
    statusBadge = 'text-indigo-950 bg-indigo-50 border-indigo-300';
    statusText = 'Bom';
    StatusIcon = CheckCircle2;
  }

  return (
    <section className="bg-white rounded-2xl border border-slate-300 overflow-hidden shadow-2xs hover:border-slate-400 hover:shadow-xs transition-all">
      <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 flex items-center justify-center shrink-0 mt-0.5">
              {getIcon()}
            </div>
            <div>
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-0.5">
                Critério {index + 1} de 10
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                {category.title}
              </h3>
            </div>
          </div>

          {/* Status Badge with AAA Contrast */}
          <div className="flex items-center gap-2 shrink-0">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border ${statusBadge}`}>
              <StatusIcon className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{statusText}</span>
            </span>
          </div>
        </div>

        {/* Category Summary with AAA Contrast */}
        <p className="text-sm text-slate-700 mb-4 leading-relaxed pl-0 sm:pl-[50px] font-normal">
          {category.summary}
        </p>

        {/* Metadata stats row with High Contrast */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3.5 border-t border-slate-200 text-xs text-slate-700">
          <div className="flex items-center gap-2 flex-wrap">
            <span>Problemas: <strong className={`font-mono tabular-nums ${category.issuesCount > 0 ? 'text-red-700 font-bold' : 'text-emerald-800 font-bold'}`}>{category.issuesCount}</strong></span>
            <span aria-hidden="true" className="text-slate-400">·</span>
            <span>Severidade: <strong className="text-slate-900 capitalize font-semibold">{category.severity}</strong></span>
            <span aria-hidden="true" className="text-slate-400">·</span>
            <span>Nota: <strong className="text-slate-900 font-mono tabular-nums font-bold">{category.score}/100</strong></span>
          </div>

          {category.issues.length > 0 && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-1.5 font-bold text-xs text-indigo-800 hover:text-indigo-950 transition-colors cursor-pointer py-1.5 px-2.5 rounded-lg hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-800 focus-visible:ring-offset-2"
            >
              <span>
                {isExpanded
                  ? 'Recolher detalhes'
                  : `Ver detalhes (${displayedIssues.length}${
                      filteredSeverity !== 'todas' && displayedIssues.length !== category.issues.length
                        ? ` de ${category.issues.length}`
                        : ''
                    })`}
              </span>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" aria-hidden="true" />
              ) : (
                <ChevronDown className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Accordion Content with Issues */}
      {isExpanded && category.issues.length > 0 && (
        <div className="px-6 pb-6 pt-3 bg-slate-50/70 border-t border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              {filteredSeverity !== 'todas'
                ? `Ocorrências com severidade "${filteredSeverity}" (${displayedIssues.length})`
                : `Ocorrências Identificadas (${category.issues.length})`}
            </h4>
            <span className="text-xs text-slate-500">
              Revise e aplique as recomendações de código
            </span>
          </div>

          {displayedIssues.length > 0 ? (
            <div className="space-y-3.5">
              {displayedIssues.map((issue, idx) => (
                <IssueItem key={issue.id || idx} issue={issue} index={idx} />
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs text-slate-600">
              Este critério possui {category.issues.length} ocorrência(s) em outras faixas de severidade, embora o critério geral esteja classificado como <strong className="capitalize text-slate-800">{category.severity}</strong>.
            </div>
          )}
        </div>
      )}
    </section>
  );
};
