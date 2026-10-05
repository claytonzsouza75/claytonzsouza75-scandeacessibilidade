/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import type { AuditReport } from './types/accessibility.js';
import { requestAccessibilityAudit } from './services/api.js';
import { getAuditHistory, saveAuditToHistory } from './services/storage.js';
import { Header } from './components/Header.js';
import { Hero } from './components/Hero.js';
import { AuditLoading } from './components/AuditLoading.js';
import { AuditDashboard } from './components/AuditDashboard.js';
import { HowItWorks } from './components/HowItWorks.js';
import { CriteriaOverview } from './components/CriteriaOverview.js';
import { AboutWcag } from './components/AboutWcag.js';
import { DailyTip } from './components/DailyTip.js';
import { Footer } from './components/Footer.js';
import { HistoryAndCompare } from './components/HistoryAndCompare.js';
import { AccessibilityToolbar } from './components/AccessibilityToolbar.js';
import { AccessibilityStatementModal } from './components/AccessibilityStatementModal.js';
import { AlertCircle, RotateCcw, ArrowRight, ShieldAlert } from 'lucide-react';

export default function App() {
  const [currentReport, setCurrentReport] = useState<AuditReport | null>(null);
  const [targetUrl, setTargetUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [historyCount, setHistoryCount] = useState(0);
  const [showHistoryOnly, setShowHistoryOnly] = useState(false);
  const [isStatementOpen, setIsStatementOpen] = useState(false);

  useEffect(() => {
    const list = getAuditHistory();
    setHistoryCount(list.length);
  }, [currentReport]);

  const handleStartAudit = async (url: string, sampleId?: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    setShowHistoryOnly(false);
    setTargetUrl(url || (sampleId ? `Cenário: ${sampleId}` : ''));

    try {
      const report = await requestAccessibilityAudit({ url, sampleId });
      setCurrentReport(report);
      saveAuditToHistory(report);
      setHistoryCount(getAuditHistory().length);

      // Smooth scroll to results
      setTimeout(() => {
        const resultsEl = document.getElementById('audit-results');
        if (resultsEl) {
          resultsEl.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Não conseguimos analisar esta página. Verifique se o endereço está correto e se o site pode ser acessado publicamente.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewAuditClick = () => {
    setCurrentReport(null);
    setErrorMessage(null);
    setShowHistoryOnly(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateSection = (sectionId: string) => {
    setShowHistoryOnly(false);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenHistory = () => {
    setShowHistoryOnly(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoadHistoricalReport = (rep: AuditReport) => {
    setCurrentReport(rep);
    setShowHistoryOnly(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Government & Legal Accessibility Utility Bar (eMAG / LBI Art. 63) */}
      <AccessibilityToolbar onOpenStatement={() => setIsStatementOpen(true)} />

      {/* Top Bar Header */}
      <Header
        onNewAuditClick={handleNewAuditClick}
        onNavigateSection={handleNavigateSection}
        hasActiveReport={!!currentReport || showHistoryOnly}
        onOpenHistory={handleOpenHistory}
        historyCount={historyCount}
        onOpenStatement={() => setIsStatementOpen(true)}
      />

      <main id="main-content" className="flex-1">
        {/* If showing history view */}
        {showHistoryOnly ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <HistoryAndCompare
              onLoadReport={handleLoadHistoricalReport}
              currentReportId={currentReport?.id}
            />
          </div>
        ) : (
          <>
            {/* Hero input section */}
            <Hero
              onAnalyze={handleStartAudit}
              isLoading={isLoading}
              initialUrl={targetUrl}
            />

            {/* In-Flight Loading State */}
            {isLoading && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <AuditLoading targetUrl={targetUrl} />
              </div>
            )}

            {/* Error State */}
            {errorMessage && !isLoading && (
              <div className="max-w-2xl mx-auto my-12 px-4 sm:px-6">
                <div
                  role="alert"
                  className="bg-white rounded-2xl border-2 border-red-200 p-8 shadow-sm text-left space-y-4"
                >
                  <div className="flex items-center gap-3 text-red-600">
                    <AlertCircle className="w-6 h-6 shrink-0" aria-hidden="true" />
                    <h2 className="text-lg font-bold text-slate-900">
                      Não conseguimos analisar esta página
                    </h2>
                  </div>

                  <p className="text-sm text-slate-700 leading-relaxed">
                    {errorMessage}
                  </p>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
                    <strong className="block text-slate-900 font-semibold">
                      Dicas para resolver:
                    </strong>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Verifique se o endereço inclui <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">https://</code> e se o domínio está digitado corretamente.</li>
                      <li>Certifique-se de que a página pode ser acessada publicamente sem login ou VPN interna.</li>
                      <li>Endereços restritos a redes internas (localhost, 127.0.0.1, 10.x.x.x, 192.168.x.x) são bloqueados por segurança.</li>
                      <li>Sites com proteção de firewall Cloudflare com CAPTCHA podem recusar agentes de auditoria.</li>
                    </ul>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setErrorMessage(null)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Tentar outro endereço</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStartAudit('', 'barreiras')}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <span>Testar cenário demonstrativo com barreiras</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Active Audit Results Dashboard */}
            {currentReport && !isLoading && (
              <div id="audit-results" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <AuditDashboard
                  report={currentReport}
                  onReanalyze={() => handleStartAudit(currentReport.url)}
                  onNewAudit={handleNewAuditClick}
                  onLoadHistoricalReport={handleLoadHistoricalReport}
                />
              </div>
            )}

            {/* Informational & Marketing Sections */}
            {!currentReport && !isLoading && (
              <>
                <DailyTip />
                <HowItWorks />
                <CriteriaOverview />
                <AboutWcag />
              </>
            )}
          </>
        )}
      </main>

      {/* Accessible Footer */}
      <Footer onOpenStatement={() => setIsStatementOpen(true)} />

      {/* Legal Accessibility Statement Modal (LBI Art. 63) */}
      <AccessibilityStatementModal
        isOpen={isStatementOpen}
        onClose={() => setIsStatementOpen(false)}
      />
    </div>
  );
}
