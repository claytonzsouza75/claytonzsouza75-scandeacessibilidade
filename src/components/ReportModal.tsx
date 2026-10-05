import React, { useState } from 'react';
import type { AuditReport } from '../types/accessibility.js';
import { generateReportMarkdown } from '../services/exportReport.js';
import { exportAuditReportToPdf } from '../services/pdfExport.js';
import { X, Copy, Check, Printer, ShieldCheck, Download, Loader2 } from 'lucide-react';

interface ReportModalProps {
  report: AuditReport;
  isOpen: boolean;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ report, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  if (!isOpen) return null;

  const markdownText = generateReportMarkdown(report);

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    try {
      setIsExportingPdf(true);
      setPdfError(null);
      await exportAuditReportToPdf(report);
    } catch (err) {
      console.error('Falha ao exportar PDF:', err);
      setPdfError('Não foi possível gerar o arquivo PDF. Tente novamente ou use a opção de impressão.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([markdownText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio-acessibilidade-${new URL(report.url).hostname}-${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
    >
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50">
          <div>
            <h2 id="report-modal-title" className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" aria-hidden="true" />
              Relatório Executivo de Acessibilidade
            </h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              {report.pageTitle} · {report.url}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-60 text-white transition-colors cursor-pointer"
            >
              {isExportingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                  <span>Gerando PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Exportar Relatório em PDF</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-600" aria-hidden="true" />
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                  <span>Copiar texto</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadMarkdown}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <span>.MD</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Imprimir relatório"
            >
              <Printer className="w-3.5 h-3.5" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              aria-label="Fechar janela do relatório"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-sm text-slate-700 leading-relaxed font-sans">
          {/* Executive Header Box */}
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <span className="text-xs text-slate-500 block mb-0.5">Pontuação Geral</span>
              <strong className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
                {report.score}/100
              </strong>
            </div>
            <div>
              <span className="text-xs text-slate-500 block mb-0.5">Classificação</span>
              <strong className="text-xl font-bold text-indigo-700 block mt-1">
                {report.level}
              </strong>
            </div>
            <div>
              <span className="text-xs text-slate-500 block mb-0.5">Critérios Aprovados</span>
              <strong className="text-xl font-bold text-green-700 font-mono block mt-1">
                {report.summary.totalPassed}/10
              </strong>
            </div>
            <div>
              <span className="text-xs text-slate-500 block mb-0.5">Barreiras Detectadas</span>
              <strong className="text-xl font-bold text-red-600 font-mono block mt-1">
                {report.summary.totalErrors + report.summary.totalWarnings}
              </strong>
            </div>
          </div>

          {/* Plugin Alert if present */}
          {report.pluginAlert && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
              <strong>Atenção Estrutural:</strong> {report.pluginAlert}
            </div>
          )}

          {/* Priorities Overview */}
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-3">
              Plano de Ação Recomendado (Impacto × Esforço)
            </h3>
            <div className="space-y-3">
              <div className="p-4 rounded-xl border border-red-200 bg-red-50/50 text-xs">
                <strong className="text-red-950 font-bold block mb-1">
                  1. Corrija Primeiro ({report.priorities.corrijaPrimeiro.length} ocorrências de alto impacto)
                </strong>
                <p className="text-red-800">
                  Priorize a correção de campos sem rótulo, foco oculto de teclado e imagens essenciais sem texto alternativo.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 text-xs">
                <strong className="text-amber-950 font-bold block mb-1">
                  2. Próximas Melhorias ({report.priorities.proximasMelhorias.length} itens importantes)
                </strong>
                <p className="text-amber-800">
                  Ajuste saltos na hierarquia de cabeçalhos e links genéricos ("Clique aqui").
                </p>
              </div>
            </div>
          </div>

          {/* 10 Criteria Summary Table */}
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-3">
              Resultado por Critério da WCAG
            </h3>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
                  <tr>
                    <th className="py-2.5 px-3">Critério</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-center">Nota</th>
                    <th className="py-2.5 px-3 text-center">Problemas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {report.categories.map((c, i) => (
                    <tr key={c.key} className="hover:bg-slate-50/80">
                      <td className="py-2 px-3 text-slate-800">
                        {i + 1}. {c.title}
                      </td>
                      <td className="py-2 px-3 text-center capitalize text-slate-600">
                        {c.status.replace('_', ' ')}
                      </td>
                      <td className="py-2 px-3 text-center font-mono tabular-nums">
                        {c.score}/100
                      </td>
                      <td className="py-2 px-3 text-center font-mono tabular-nums">
                        {c.issuesCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Human Review Reminder */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
            <strong>Requisitos com Validação Humana Obrigatória:</strong> Libras, audiodescrição precisa, qualidade editorial das legendas e testes com pessoas usuárias de tecnologias assistivas reais não são passíveis de certificação 100% automatizada.
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>ScandeAcessibilidade — Auditoria Técnica Web</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-900 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
