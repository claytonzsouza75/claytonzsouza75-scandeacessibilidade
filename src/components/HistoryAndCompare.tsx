import React, { useState } from 'react';
import type { AuditComparison, AuditReport, HistoryItem } from '../types/accessibility.js';
import {
  getAuditHistory,
  getReportById,
  compareAuditReports,
  clearAuditHistory,
} from '../services/storage.js';
import {
  History,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  GitCompare,
} from 'lucide-react';

interface HistoryAndCompareProps {
  onLoadReport: (report: AuditReport) => void;
  currentReportId?: string;
}

export const HistoryAndCompare: React.FC<HistoryAndCompareProps> = ({
  onLoadReport,
  currentReportId,
}) => {
  const [history, setHistory] = useState<HistoryItem[]>(() => getAuditHistory());
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [comparisonResult, setComparisonResult] = useState<AuditComparison | null>(null);

  const handleClear = () => {
    if (confirm('Tem certeza de que deseja limpar todo o histórico de análises gravado neste navegador?')) {
      clearAuditHistory();
      setHistory([]);
      setSelectedForCompare([]);
      setComparisonResult(null);
    }
  };

  const handleSelectReport = (item: HistoryItem) => {
    const report = getReportById(item.id);
    if (report) {
      onLoadReport(report);
    }
  };

  const toggleSelectCompare = (id: string) => {
    if (selectedForCompare.includes(id)) {
      setSelectedForCompare(prev => prev.filter(x => x !== id));
      setComparisonResult(null);
    } else {
      if (selectedForCompare.length >= 2) {
        setSelectedForCompare([selectedForCompare[1], id]);
      } else {
        setSelectedForCompare(prev => [...prev, id]);
      }
    }
  };

  const handleRunComparison = () => {
    if (selectedForCompare.length !== 2) return;
    const r1 = getReportById(selectedForCompare[0]);
    const r2 = getReportById(selectedForCompare[1]);
    if (r1 && r2) {
      // Sort chronologically: r1 earlier, r2 later
      const [earlier, later] =
        new Date(r1.analyzedAt).getTime() <= new Date(r2.analyzedAt).getTime()
          ? [r1, r2]
          : [r2, r1];
      const comparison = compareAuditReports(earlier, later);
      setComparisonResult(comparison);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <History className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Histórico & Evolução de Acessibilidade
            </h2>
            <p className="text-xs text-slate-500">
              Acompanhe o histórico de auditorias e compare duas medições para avaliar correções e regressões.
            </p>
          </div>
        </div>

        {history.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-medium px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Limpar histórico</span>
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" aria-hidden="true" />
          <p className="text-sm font-medium text-slate-700">Nenhuma análise salva no histórico</p>
          <p className="text-xs text-slate-500 mt-1">
            Faça uma análise de qualquer site público para começar a registrar sua linha do tempo.
          </p>
        </div>
      ) : (
        <>
          {/* Comparison Action Trigger */}
          {selectedForCompare.length === 2 && !comparisonResult && (
            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between">
              <span className="text-xs font-semibold text-indigo-900">
                2 análises selecionadas para comparação.
              </span>
              <button
                type="button"
                onClick={handleRunComparison}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                <GitCompare className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Comparar análises agora</span>
              </button>
            </div>
          )}

          {/* Comparison Result Panel */}
          {comparisonResult && (
            <div className="p-6 bg-slate-900 rounded-2xl text-slate-100 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <GitCompare className="w-5 h-5 text-indigo-400" aria-hidden="true" />
                  <h3 className="text-base font-bold text-white">
                    Comparação de Evolução
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setComparisonResult(null)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Fechar comparação
                </button>
              </div>

              {/* Score Delta */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="p-3 rounded-xl bg-slate-800/80">
                  <span className="text-xs text-slate-400 block mb-1">Anterior</span>
                  <span className="text-2xl font-bold font-mono text-slate-200 tabular-nums">
                    {comparisonResult.previous.score}/100
                  </span>
                  <span className="block text-[11px] text-slate-400 mt-1">
                    {new Date(comparisonResult.previous.analyzedAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/80">
                  <span className="text-xs text-slate-400 block mb-1">Mais Recente</span>
                  <span className="text-2xl font-bold font-mono text-white tabular-nums">
                    {comparisonResult.current.score}/100
                  </span>
                  <span className="block text-[11px] text-slate-400 mt-1">
                    {new Date(comparisonResult.current.analyzedAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/80 flex flex-col justify-center">
                  <span className="text-xs text-slate-400 block mb-1">Variação de Pontos</span>
                  <div className="flex items-center justify-center gap-1.5 text-2xl font-extrabold font-mono tabular-nums">
                    {comparisonResult.scoreDiff >= 0 ? (
                      <>
                        <TrendingUp className="w-6 h-6 text-green-400" aria-hidden="true" />
                        <span className="text-green-400">+{comparisonResult.scoreDiff}</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="w-6 h-6 text-red-400" aria-hidden="true" />
                        <span className="text-red-400">{comparisonResult.scoreDiff}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats badges */}
              <div className="grid grid-cols-3 gap-2 text-xs pt-2">
                <div className="p-2.5 rounded-lg bg-green-950/60 border border-green-800/60 text-green-300">
                  <strong className="block text-sm font-mono">{comparisonResult.resolvedIssues.length}</strong>
                  <span>Problemas corrigidos</span>
                </div>
                <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-800/60 text-red-300">
                  <strong className="block text-sm font-mono">{comparisonResult.newIssues.length}</strong>
                  <span>Novos problemas</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
                  <strong className="block text-sm font-mono">{comparisonResult.persistentIssues.length}</strong>
                  <span>Ainda pendentes</span>
                </div>
              </div>
            </div>
          )}

          {/* History Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-3 w-10">Comparar</th>
                  <th className="py-3 px-3">Site / URL</th>
                  <th className="py-3 px-3 text-center">Nota</th>
                  <th className="py-3 px-3">Nível</th>
                  <th className="py-3 px-3">Data</th>
                  <th className="py-3 px-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((item, idx) => {
                  const isCurrent = item.id === currentReportId;
                  const isChecked = selectedForCompare.includes(item.id);

                  let badgeColor = 'text-green-700 bg-green-50';
                  if (item.score < 50) badgeColor = 'text-red-700 bg-red-50';
                  else if (item.score < 75) badgeColor = 'text-amber-700 bg-amber-50';
                  else if (item.score < 90) badgeColor = 'text-indigo-700 bg-indigo-50';

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        isCurrent ? 'bg-indigo-50/40 font-medium' : ''
                      }`}
                    >
                      <td className="py-3 px-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectCompare(item.id)}
                          aria-label={`Selecionar ${item.pageTitle} para comparar`}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>

                      <td className="py-3 px-3 max-w-xs">
                        <div className="font-semibold text-slate-900 truncate">
                          {item.pageTitle}
                        </div>
                        <div className="text-slate-500 font-mono text-[11px] truncate">
                          {item.url}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className={`inline-block font-mono font-bold text-sm px-2 py-0.5 rounded ${badgeColor} tabular-nums`}>
                          {item.score}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="text-slate-700">{item.level}</span>
                      </td>

                      <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                        {item.date}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleSelectReport(item)}
                          className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
                        >
                          <span>Abrir</span>
                          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};
