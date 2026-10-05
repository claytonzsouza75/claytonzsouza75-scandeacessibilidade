import React, { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { AuditReport } from '../types/accessibility.js';
import { ScoreGauge } from './ScoreGauge.js';
import { CategoryCard } from './CategoryCard.js';
import { PrioritiesSection } from './PrioritiesSection.js';
import { HeadingTreeViewer } from './HeadingTreeViewer.js';
import { ManualReviewGuide } from './ManualReviewGuide.js';
import { HistoryAndCompare } from './HistoryAndCompare.js';
import { ReportModal } from './ReportModal.js';
import {
  Globe,
  Clock,
  Calendar,
  RotateCw,
  FileText,
  AlertTriangle,
  Flame,
  LayoutList,
  Heading,
  UserCheck,
  History,
  Copy,
  Check,
  Download,
  Loader2,
  Filter,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { generateReportMarkdown } from '../services/exportReport.js';
import { exportAuditReportToPdf } from '../services/pdfExport.js';

interface AuditDashboardProps {
  report: AuditReport;
  onReanalyze: () => void;
  onNewAudit: () => void;
  onLoadHistoricalReport: (rep: AuditReport) => void;
}

export const AuditDashboard: React.FC<AuditDashboardProps> = ({
  report,
  onReanalyze,
  onNewAudit,
  onLoadHistoricalReport,
}) => {
  const [activeTab, setActiveTab] = useState<
    'criterios' | 'prioridades' | 'hierarquia' | 'revisao' | 'historico'
  >('criterios');
  const [severityFilter, setSeverityFilter] = useState<
    'todas' | 'critica' | 'alta' | 'media' | 'baixa'
  >('todas');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [copiedReport, setCopiedReport] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfStatusMsg, setPdfStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);

  const formattedDate = new Date(report.analyzedAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Calculate matching categories & issue counts for each severity
  const severityCounts = {
    todas: report.categories.length,
    critica: report.categories.filter(
      c => c.severity === 'critica' || c.issues.some(i => i.severity === 'critica')
    ).length,
    alta: report.categories.filter(
      c => c.severity === 'alta' || c.issues.some(i => i.severity === 'alta')
    ).length,
    media: report.categories.filter(
      c => c.severity === 'media' || c.issues.some(i => i.severity === 'media')
    ).length,
    baixa: report.categories.filter(
      c => c.severity === 'baixa' || c.issues.some(i => i.severity === 'baixa')
    ).length,
  };

  const filteredCategories = report.categories.filter(c => {
    if (severityFilter === 'todas') return true;
    return c.severity === severityFilter || c.issues.some(i => i.severity === severityFilter);
  });

  const totalFilteredIssues = report.categories.reduce((acc, cat) => {
    if (severityFilter === 'todas') return acc + cat.issues.length;
    return acc + cat.issues.filter(i => i.severity === severityFilter).length;
  }, 0);

  const categoriesWithIssues = report.categories.filter(c => c.issuesCount > 0).length;

  const handleCopyReportText = () => {
    const text = generateReportMarkdown(report);
    navigator.clipboard.writeText(text);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  const handleDownloadPdf = async () => {
    try {
      setIsExportingPdf(true);
      setPdfStatusMsg(null);

      // Use the structured A4 print template rendered via html2canvas + jsPDF for an organized, high-contrast accessible document
      await exportAuditReportToPdf(report);

      setPdfStatusMsg({
        type: 'success',
        text: 'Relatório em PDF exportado com sucesso!',
      });
      setTimeout(() => setPdfStatusMsg(null), 4000);
    } catch (err) {
      console.error('Falha ao exportar PDF estruturado, tentando captura direta:', err);
      try {
        let domain = 'site';
        try {
          domain = new URL(report.url).hostname.replace(/^www\./, '');
        } catch {
          domain = 'site';
        }

        if (dashboardRef.current) {
          const element = dashboardRef.current;
          const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#f8fafc',
            windowWidth: 1200,
            ignoreElements: (el) => {
              return el.getAttribute('data-html2canvas-ignore') === 'true';
            },
          });

          const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
          });

          pdf.setProperties({
            title: `Relatório de Acessibilidade — ${report.pageTitle}`,
            subject: `Auditoria WCAG 2.1 para ${report.url}`,
            author: 'ScandeAcessibilidade',
            creator: 'ScandeAcessibilidade',
          });

          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();
          const pageCanvasHeight = Math.floor((canvas.width * pdfHeight) / pdfWidth);
          const totalCanvasHeight = canvas.height;

          let yOffset = 0;
          let pageIndex = 0;

          while (yOffset < totalCanvasHeight) {
            if (pageIndex > 0) {
              pdf.addPage();
            }

            const sliceHeight = Math.min(pageCanvasHeight, totalCanvasHeight - yOffset);
            const pageCanvas = document.createElement('canvas');
            pageCanvas.width = canvas.width;
            pageCanvas.height = pageCanvasHeight;

            const pageCtx = pageCanvas.getContext('2d');
            if (pageCtx) {
              pageCtx.fillStyle = '#f8fafc';
              pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvasHeight);
              pageCtx.drawImage(
                canvas,
                0,
                yOffset,
                canvas.width,
                sliceHeight,
                0,
                0,
                canvas.width,
                sliceHeight
              );

              const pageImgData = pageCanvas.toDataURL('image/png');
              pdf.addImage(pageImgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            }

            yOffset += pageCanvasHeight;
            pageIndex++;
          }

          pdf.save(`relatorio-acessibilidade-${domain}-${Date.now()}.pdf`);
          setPdfStatusMsg({
            type: 'success',
            text: 'Relatório em PDF exportado com sucesso!',
          });
          setTimeout(() => setPdfStatusMsg(null), 4000);
        }
      } catch (fallbackErr) {
        console.error('Falha no fallback de PDF:', fallbackErr);
        setPdfStatusMsg({
          type: 'error',
          text: 'Não foi possível gerar o arquivo PDF. Tente novamente ou use a opção de visualização.',
        });
      }
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div ref={dashboardRef} className="space-y-8 pb-16">
      {/* Top Bar of the Analysis */}
      <section className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                {formattedDate}
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="flex items-center gap-1.5 font-mono tabular-nums">
                <Clock className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                Duração: {report.durationMs}ms
              </span>
              {report.isSimulated && (
                <>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="text-indigo-600 font-semibold">Cenário Demonstrativo</span>
                </>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5 truncate">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                <Globe className="w-4 h-4 text-indigo-600" aria-hidden="true" />
              </div>
              <span className="truncate">{report.pageTitle}</span>
            </h1>

            <div className="text-xs text-slate-500 font-mono truncate bg-slate-50 border border-slate-200/70 px-2.5 py-1 rounded-md inline-block max-w-full">
              {report.url}
            </div>
          </div>

          {/* Action buttons (ignored in capture so PDF looks like a clean document) */}
          <div data-html2canvas-ignore="true" className="flex flex-wrap items-center gap-2 shrink-0 w-full md:w-auto">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              aria-label="Exportar Relatório em PDF"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-700 hover:bg-indigo-800 active:bg-indigo-900 disabled:opacity-60 rounded-lg transition-all shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-700"
              title="Exportar Relatório em PDF organizado e acessível"
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
              onClick={handleCopyReportText}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 active:bg-slate-100 transition-colors shadow-2xs cursor-pointer"
            >
              {copiedReport ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                  <span className="text-emerald-700">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                  <span>Copiar relatório</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsReportModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 active:bg-slate-100 transition-colors shadow-2xs cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
              <span>Ver relatório</span>
            </button>

            <button
              type="button"
              onClick={onReanalyze}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
              title="Executar a auditoria novamente"
            >
              <RotateCw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Reanalisar</span>
            </button>
          </div>
        </div>

        {pdfStatusMsg && (
          <div
            role="status"
            aria-live="polite"
            data-html2canvas-ignore="true"
            className={`mt-4 p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
              pdfStatusMsg.type === 'success'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : 'bg-red-50 border-red-300 text-red-950'
            }`}
          >
            {pdfStatusMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" aria-hidden="true" />
            ) : (
              <XCircle className="w-4 h-4 text-red-700 shrink-0" aria-hidden="true" />
            )}
            <span>{pdfStatusMsg.text}</span>
          </div>
        )}
      </section>

      {/* Main Score Gauge & 4 Metrics Breakdown */}
      <ScoreGauge
        score={report.score}
        level={report.level}
        summary={report.summary}
        totalCategories={report.categories.length}
        categoriesWithIssues={categoriesWithIssues}
      />

      {/* Plugin Alert Banner (Prompt requirement:
          "Se encontrar um plugin e, ao mesmo tempo, muitos problemas estruturais, exibir alerta:
          'Este site utiliza recursos complementares de acessibilidade, mas foram encontradas barreiras estruturais que também precisam ser corrigidas.'") */}
      {report.pluginAlert && (
        <div
          role="alert"
          className="p-4 sm:p-5 rounded-2xl bg-amber-50 border-2 border-amber-200 text-amber-950 flex items-start gap-3.5 shadow-xs"
        >
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-1 text-xs sm:text-sm">
            <strong className="block font-bold">Alerta de Acessibilidade Estrutural</strong>
            <p className="leading-relaxed text-amber-900">
              {report.pluginAlert}
            </p>
            <p className="text-amber-800 text-xs">
              Recursos como plugins assistivos ou barras de ferramentas complementam a experiência, mas não substituem o código semântico correto, o contraste visual e a navegabilidade por teclado.
            </p>
          </div>
        </div>
      )}

      {/* Interactive Tabs / Filter Controls (Segmented Control Pattern) */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-200/70 border border-slate-300/60 rounded-xl overflow-x-auto shadow-2xs">
        <button
          type="button"
          onClick={() => setActiveTab('criterios')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'criterios'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <LayoutList className="w-4 h-4 text-indigo-600" aria-hidden="true" />
          <span>Os 10 Critérios</span>
          <span className="font-mono text-[11px] text-slate-500 tabular-nums">
            ({report.categories.length})
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('prioridades')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'prioridades'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <Flame className="w-4 h-4 text-red-500" aria-hidden="true" />
          <span>O que Corrigir Primeiro</span>
          {report.priorities.corrijaPrimeiro.length > 0 && (
            <span className="font-mono text-[11px] font-bold text-red-600 tabular-nums">
              ({report.priorities.corrijaPrimeiro.length})
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('hierarquia')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'hierarquia'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <Heading className="w-4 h-4 text-slate-600" aria-hidden="true" />
          <span>Estrutura de Cabeçalhos</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('revisao')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'revisao'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <UserCheck className="w-4 h-4 text-sky-600" aria-hidden="true" />
          <span>Revisão Humana</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('historico')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'historico'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <History className="w-4 h-4 text-slate-600" aria-hidden="true" />
          <span>Histórico & Comparação</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'criterios' && (
        <div className="space-y-5">
          {/* Header & Severity Filter Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-white border border-slate-300 shadow-2xs">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  Avaliação dos 10 Critérios
                </h2>
                {severityFilter !== 'todas' && (
                  <span className="text-xs font-bold text-indigo-900 bg-indigo-50 border border-indigo-300 px-2.5 py-0.5 rounded-full font-mono">
                    {filteredCategories.length} de 10
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-700 mt-1">
                {severityFilter === 'todas'
                  ? 'Exibindo todos os 10 critérios da auditoria. Filtre por severidade para focar nas barreiras mais críticas.'
                  : `Filtrando por severidade "${severityFilter.toUpperCase()}": ${totalFilteredIssues} ocorrência(s) em ${filteredCategories.length} critério(s).`}
              </p>
            </div>

            {/* Filter buttons (Segmented Filter Bar) */}
            <div
              role="toolbar"
              aria-label="Filtrar critérios por severidade"
              className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-300"
            >
              <span className="text-xs font-bold text-slate-700 px-2 py-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-slate-600" aria-hidden="true" />
                <span className="hidden sm:inline">Severidade:</span>
              </span>

              {/* Todas */}
              <button
                type="button"
                onClick={() => setSeverityFilter('todas')}
                aria-pressed={severityFilter === 'todas'}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-700 ${
                  severityFilter === 'todas'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-300'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                Todas ({severityCounts.todas})
              </button>

              {/* Crítica */}
              <button
                type="button"
                onClick={() => setSeverityFilter('critica')}
                aria-pressed={severityFilter === 'critica'}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 ${
                  severityFilter === 'critica'
                    ? 'bg-red-700 text-white shadow-xs'
                    : 'text-red-900 hover:bg-red-100/80'
                }`}
              >
                <span className={`w-2 h-2 rounded-full inline-block ${severityFilter === 'critica' ? 'bg-white' : 'bg-red-600'}`} />
                <span>Crítica</span>
                <span className="font-mono text-[11px] tabular-nums">({severityCounts.critica})</span>
              </button>

              {/* Alta */}
              <button
                type="button"
                onClick={() => setSeverityFilter('alta')}
                aria-pressed={severityFilter === 'alta'}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 ${
                  severityFilter === 'alta'
                    ? 'bg-amber-700 text-white shadow-xs'
                    : 'text-amber-900 hover:bg-amber-100/80'
                }`}
              >
                <span className={`w-2 h-2 rounded-full inline-block ${severityFilter === 'alta' ? 'bg-white' : 'bg-amber-500'}`} />
                <span>Alta</span>
                <span className="font-mono text-[11px] tabular-nums">({severityCounts.alta})</span>
              </button>

              {/* Média */}
              <button
                type="button"
                onClick={() => setSeverityFilter('media')}
                aria-pressed={severityFilter === 'media'}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700 ${
                  severityFilter === 'media'
                    ? 'bg-sky-700 text-white shadow-xs'
                    : 'text-sky-900 hover:bg-sky-100/80'
                }`}
              >
                <span className={`w-2 h-2 rounded-full inline-block ${severityFilter === 'media' ? 'bg-white' : 'bg-sky-500'}`} />
                <span>Média</span>
                <span className="font-mono text-[11px] tabular-nums">({severityCounts.media})</span>
              </button>

              {/* Baixa */}
              <button
                type="button"
                onClick={() => setSeverityFilter('baixa')}
                aria-pressed={severityFilter === 'baixa'}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-700 ${
                  severityFilter === 'baixa'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-800 hover:bg-slate-200/70'
                }`}
              >
                <span className={`w-2 h-2 rounded-full inline-block ${severityFilter === 'baixa' ? 'bg-white' : 'bg-slate-500'}`} />
                <span>Baixa</span>
                <span className="font-mono text-[11px] tabular-nums">({severityCounts.baixa})</span>
              </button>
            </div>
          </div>

          {/* Criteria Cards or Empty State */}
          {filteredCategories.length > 0 ? (
            <div className="space-y-4">
              {filteredCategories.map((cat, idx) => (
                <CategoryCard
                  key={cat.key}
                  category={cat}
                  index={idx}
                  filteredSeverity={severityFilter}
                />
              ))}
            </div>
          ) : (
            <div className="p-10 rounded-2xl bg-white border border-slate-300 text-center space-y-3 shadow-2xs">
              <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Nenhum critério com severidade "{severityFilter.toUpperCase()}"
              </h3>
              <p className="text-sm text-slate-700 max-w-md mx-auto leading-relaxed">
                Excelente notícia! A página auditada não apresentou ocorrências classificadas nessa faixa de severidade.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setSeverityFilter('todas')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-indigo-900 bg-indigo-50 border border-indigo-300 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-800 focus-visible:ring-offset-2"
                >
                  Ver todos os 10 critérios
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'prioridades' && (
        <PrioritiesSection priorities={report.priorities} />
      )}

      {activeTab === 'hierarquia' && (
        <HeadingTreeViewer
          headings={report.headingsTree}
          headingCategory={report.categories.find(c => c.key === 'heading_structure')}
        />
      )}

      {activeTab === 'revisao' && (
        <ManualReviewGuide />
      )}

      {activeTab === 'historico' && (
        <HistoryAndCompare
          onLoadReport={onLoadHistoricalReport}
          currentReportId={report.id}
        />
      )}

      {/* Footer Disclaimer Callout */}
      <div className="p-4 rounded-xl bg-slate-100/70 border border-slate-200 text-xs text-slate-500 text-center">
        Este relatório é uma análise automatizada de possíveis barreiras de acessibilidade e não constitui certificação de conformidade. Testes com usuários e avaliações especializadas continuam sendo recomendados.
      </div>

      {/* Executive Report Modal */}
      <ReportModal
        report={report}
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </div>
  );
};
