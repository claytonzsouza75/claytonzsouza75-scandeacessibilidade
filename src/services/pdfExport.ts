import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { AuditReport } from '../types/accessibility.js';

export async function exportAuditReportToPdf(report: AuditReport): Promise<void> {
  const formattedDate = new Date(report.analyzedAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  let domain = 'site';
  try {
    domain = new URL(report.url).hostname.replace(/^www\./, '');
  } catch {
    domain = 'site';
  }

  // Determine score color hex
  let scoreColorHex = '#16a34a'; // green
  let scoreBgHex = '#f0fdf4';
  if (report.score < 50) {
    scoreColorHex = '#dc2626'; // red
    scoreBgHex = '#fef2f2';
  } else if (report.score < 75) {
    scoreColorHex = '#d97706'; // amber
    scoreBgHex = '#fffbeb';
  } else if (report.score < 90) {
    scoreColorHex = '#4f46e5'; // indigo
    scoreBgHex = '#eef2ff';
  }

  // Create an offscreen render container optimized for A4 proportions (width: 794px ~ A4 at 96 DPI)
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '794px';
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#0f172a';
  container.style.fontFamily = "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  container.style.padding = '40px 48px';
  container.style.boxSizing = 'border-box';
  container.style.zIndex = '-1000';

  // Build the rich HTML representation for print
  container.innerHTML = `
    <div style="font-family: 'Plus Jakarta Sans', system-ui, sans-serif; color: #0f172a; line-height: 1.5;">
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 20px; border-bottom: 2px solid #e2e8f0; margin-bottom: 24px;">
        <div>
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
            <img
              src="/src/assets/images/scande_logo_mark_1790633121566.jpg"
              alt="Logo ScandeAcessibilidade"
              referrerPolicy="no-referrer"
              style="width: 32px; height: 32px; border-radius: 8px; object-fit: cover; display: block;"
            />
            <span style="font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">
              Scande<span style="color: #4f46e5;">Acessibilidade</span>
            </span>
          </div>
          <p style="font-size: 11px; color: #64748b; margin: 0;">Relatório Oficial de Auditoria Técnica Automatizada</p>
        </div>
        <div style="text-align: right; font-size: 11px; color: #64748b;">
          <p style="margin: 0 0 2px 0;"><strong>Data da Análise:</strong> ${formattedDate}</p>
          <p style="margin: 0; font-family: monospace;">Tempo de execução: ${report.durationMs}ms</p>
        </div>
      </div>

      <!-- Target Site Info Banner -->
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px;">
        <span style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">Página Auditada</span>
        <h1 style="font-size: 18px; font-weight: 800; color: #0f172a; margin: 0 0 4px 0; word-break: break-word;">${report.pageTitle}</h1>
        <p style="font-size: 12px; color: #4f46e5; font-family: monospace; margin: 0; word-break: break-all;">${report.url}</p>
      </div>

      <!-- Executive Score & Metrics Grid -->
      <div style="display: grid; grid-template-columns: 240px 1fr; gap: 20px; margin-bottom: 28px;">
        <!-- Score Box -->
        <div style="background-color: ${scoreBgHex}; border: 2px solid ${scoreColorHex}; border-radius: 16px; padding: 24px; text-align: center; display: flex; flex-col; justify-content: center; align-items: center; flex-direction: column;">
          <span style="font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Pontuação de Acessibilidade</span>
          <div style="font-size: 54px; font-weight: 900; color: ${scoreColorHex}; font-family: monospace; line-height: 1; margin: 8px 0;">
            ${report.score}<span style="font-size: 20px; color: #64748b; font-weight: 600;">/100</span>
          </div>
          <div style="display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 800; background-color: #ffffff; color: ${scoreColorHex}; border: 1px solid ${scoreColorHex}; margin-top: 4px;">
            Nível: ${report.level}
          </div>
        </div>

        <!-- 4 Metric Cards -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 16px;">
            <span style="font-size: 11px; color: #16a34a; font-weight: 700; display: block; margin-bottom: 4px;">✓ Critérios Aprovados</span>
            <span style="font-size: 22px; font-weight: 800; font-family: monospace; color: #0f172a;">${report.summary.totalPassed} <span style="font-size: 12px; color: #94a3b8; font-weight: normal;">/ 10</span></span>
          </div>

          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 16px;">
            <span style="font-size: 11px; color: #dc2626; font-weight: 700; display: block; margin-bottom: 4px;">✕ Falhas Detectadas</span>
            <span style="font-size: 22px; font-weight: 800; font-family: monospace; color: #dc2626;">${report.summary.totalErrors}</span>
          </div>

          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 16px;">
            <span style="font-size: 11px; color: #d97706; font-weight: 700; display: block; margin-bottom: 4px;">⚠ Avisos de Atenção</span>
            <span style="font-size: 22px; font-weight: 800; font-family: monospace; color: #d97706;">${report.summary.totalWarnings}</span>
          </div>

          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 16px;">
            <span style="font-size: 11px; color: #0284c7; font-weight: 700; display: block; margin-bottom: 4px;">🔍 Itens para Revisão Manual</span>
            <span style="font-size: 22px; font-weight: 800; font-family: monospace; color: #0284c7;">${report.summary.totalManualReview}</span>
          </div>

          <div style="grid-column: span 2; background-color: #f1f5f9; border-radius: 8px; padding: 8px 12px; font-size: 11px; color: #475569; display: flex; justify-content: space-between;">
            <span>Severidades: <strong>${report.summary.criticalCount} críticas</strong>, <strong>${report.summary.highCount} altas</strong>, <strong>${report.summary.mediumCount} médias</strong></span>
            <span>Total avaliado: 10 critérios</span>
          </div>
        </div>
      </div>

      ${
        report.pluginAlert
          ? `
        <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 12px 16px; margin-bottom: 24px; font-size: 11px; color: #78350f;">
          <strong>⚠ Alerta sobre Plugins de Acessibilidade:</strong> ${report.pluginAlert}
        </div>
      `
          : ''
      }

      <!-- Priorities: Corrija Primeiro -->
      <div style="margin-bottom: 28px;">
        <h2 style="font-size: 15px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px;">
          1. O que Corrigir Primeiro (Priorização por Impacto)
        </h2>

        ${
          report.priorities.corrijaPrimeiro.length === 0
            ? '<p style="font-size: 12px; color: #16a34a; margin: 0 0 16px 0;">✓ Nenhuma barreira crítica imediata encontrada nesta categoria.</p>'
            : `
            <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px;">
              ${report.priorities.corrijaPrimeiro
                .slice(0, 5)
                .map(
                  issue => `
                <div style="background-color: #ffffff; border: 1px solid #fecaca; border-left: 4px solid #dc2626; border-radius: 8px; padding: 10px 14px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <strong style="font-size: 12px; color: #991b1b;">[${issue.severity.toUpperCase()}] ${issue.title}</strong>
                    <span style="font-size: 10px; color: #64748b; font-family: monospace;">Esforço: ${issue.effort}</span>
                  </div>
                  <p style="font-size: 11px; color: #475569; margin: 0 0 4px 0;">${issue.description}</p>
                  <div style="font-size: 11px; color: #0f172a; background-color: #f8fafc; padding: 6px 8px; border-radius: 4px; border: 1px solid #e2e8f0;">
                    <strong>Como corrigir:</strong> ${issue.howToFix}
                  </div>
                </div>
              `
                )
                .join('')}
            </div>
          `
        }
      </div>

      <!-- 10 Criteria Summary Table -->
      <div style="margin-bottom: 28px;">
        <h2 style="font-size: 15px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px;">
          2. Resultados dos 10 Critérios Avaliados
        </h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px; text-align: left;">
          <thead>
            <tr style="background-color: #f1f5f9; border-bottom: 2px solid #cbd5e1; color: #475569; font-weight: 700;">
              <th style="padding: 8px 10px;">Critério</th>
              <th style="padding: 8px 10px; text-align: center;">Status</th>
              <th style="padding: 8px 10px; text-align: center;">Problemas</th>
              <th style="padding: 8px 10px; text-align: center;">Nota</th>
            </tr>
          </thead>
          <tbody>
            ${report.categories
              .map((c, i) => {
                let badgeBg = '#dcfce7';
                let badgeColor = '#15803d';
                if (c.status === 'critico') {
                  badgeBg = '#fee2e2';
                  badgeColor = '#b91c1c';
                } else if (c.status === 'precisa_melhorar') {
                  badgeBg = '#fef3c7';
                  badgeColor = '#b45309';
                } else if (c.status === 'bom') {
                  badgeBg = '#e0e7ff';
                  badgeColor = '#4338ca';
                }

                return `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 8px 10px; font-weight: 600; color: #1e293b;">${i + 1}. ${c.title}</td>
                  <td style="padding: 8px 10px; text-align: center;">
                    <span style="background-color: ${badgeBg}; color: ${badgeColor}; padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: 700; text-transform: capitalize;">
                      ${c.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td style="padding: 8px 10px; text-align: center; font-family: monospace; font-weight: bold; color: ${c.issuesCount > 0 ? '#b91c1c' : '#15803d'};">
                    ${c.issuesCount}
                  </td>
                  <td style="padding: 8px 10px; text-align: center; font-family: monospace; font-weight: bold; color: #0f172a;">
                    ${c.score}/100
                  </td>
                </tr>
              `;
              })
              .join('')}
          </tbody>
        </table>
      </div>

      <!-- Human Review Mandatory Section -->
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
        <h3 style="font-size: 12px; font-weight: 800; color: #0284c7; text-transform: uppercase; margin: 0 0 6px 0;">
          3. Requisitos Essenciais que Exigem Revisão Humana
        </h3>
        <p style="font-size: 11px; color: #475569; margin: 0 0 8px 0;">
          Nenhuma ferramenta automatizada substitui a avaliação humana. Os seguintes tópicos devem ser validados manualmente por especialistas e usuários com deficiência:
        </p>
        <ul style="font-size: 10.5px; color: #334155; margin: 0; padding-left: 18px; line-height: 1.6;">
          <li><strong>Libras (Língua Brasileira de Sinais):</strong> Avaliar a coerência e precisão da sinalização em conteúdos audiovisuais.</li>
          <li><strong>Audiodescrição:</strong> Verificar se vídeos possuem descrição vocalizada das ações visuais relevantes.</li>
          <li><strong>Qualidade Semântica de Alt-Text:</strong> Certificar que a descrição alternativa transmite o mesmo significado pretendido pelo autor editorial.</li>
          <li><strong>Navegação Real com Teclado:</strong> Testar o fluxo completo de compra e formulários com leitores de tela reais (NVDA, JAWS, VoiceOver).</li>
        </ul>
      </div>

      <!-- Legal Disclaimer Footer -->
      <div style="border-top: 1px solid #cbd5e1; padding-top: 14px; font-size: 10px; color: #64748b; line-height: 1.4; text-align: center;">
        <p style="margin: 0 0 4px 0;">
          <strong>Aviso Legal & Técnico:</strong> Este relatório é uma análise técnica automatizada de possíveis barreiras de acessibilidade e não constitui certificação de conformidade com a WCAG ou com a Lei Brasileira de Inclusão (Lei nº 13.146/2015). Testes com pessoas com deficiência continuam sendo recomendados.
        </p>
        <p style="margin: 0; font-family: monospace;">
          Gerado em ${formattedDate} por ScandeAcessibilidade • https://scandeacessibilidade.local
        </p>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  try {
    // Render the container to a high-resolution canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    // Multi-page A4 PDF logic
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Add accessible document metadata to the PDF
    pdf.setProperties({
      title: `Relatório de Acessibilidade — ${report.pageTitle}`,
      subject: `Auditoria WCAG 2.1 e LBI (Lei 13.146/2015) para ${report.url} — Nota ${report.score}/100`,
      author: 'ScandeAcessibilidade',
      keywords: 'acessibilidade, wcag, lbi, auditoria web, relatorio',
      creator: 'ScandeAcessibilidade — Motor de Auditoria Técnica',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth(); // 210 mm
    const pdfHeight = pdf.internal.pageSize.getHeight(); // 297 mm

    // Compute pixel height corresponding to one A4 page in canvas dimensions
    const pageCanvasHeight = Math.floor((canvas.width * pdfHeight) / pdfWidth);
    const totalCanvasHeight = canvas.height;

    let yOffset = 0;
    let pageIndex = 0;

    while (yOffset < totalCanvasHeight) {
      if (pageIndex > 0) {
        pdf.addPage();
      }

      // Height to slice for this page
      const sliceHeight = Math.min(pageCanvasHeight, totalCanvasHeight - yOffset);

      // Create a temporary canvas for this specific page slice
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = pageCanvasHeight;

      const pageCtx = pageCanvas.getContext('2d');
      if (pageCtx) {
        // Fill white background
        pageCtx.fillStyle = '#ffffff';
        pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvasHeight);

        // Draw the sliced section
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

    // Save PDF
    const filename = `relatorio-acessibilidade-${domain}-${Date.now()}.pdf`;
    pdf.save(filename);
  } finally {
    // Always clean up the temporary container
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}
