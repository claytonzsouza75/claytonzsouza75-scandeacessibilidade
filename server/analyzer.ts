import * as cheerio from 'cheerio';
import type { AuditReport, HeadingItem } from '../src/types/accessibility.js';
import { auditAccessibilityPlugins } from './rules/accessibilityPlugins.js';
import { auditAltText } from './rules/altText.js';
import { auditButtonContrast } from './rules/buttonContrast.js';
import { auditDynamicContent } from './rules/dynamicContent.js';
import { auditForms } from './rules/forms.js';
import { auditGenericLinks } from './rules/genericLinks.js';
import { auditHeadingStructure } from './rules/headingStructure.js';
import { auditKeyboardAccess } from './rules/keyboardAccess.js';
import { computeAuditReport } from './rules/scorer.js';
import { auditVideos } from './rules/videos.js';
import { auditZoomAndResponsive } from './rules/zoom.js';

export function runAccessibilityAudit(params: {
  url: string;
  html: string;
  durationMs: number;
}): AuditReport {
  const { url, html, durationMs } = params;

  // Load DOM with cheerio
  const $ = cheerio.load(html);

  const pageTitle = $('title').text().trim() || $('h1').first().text().trim() || url;

  // Run the 9 structural and visual rules
  const genericLinksResult = auditGenericLinks($);
  const buttonContrastResult = auditButtonContrast($);
  const altTextResult = auditAltText($);
  const keyboardAccessResult = auditKeyboardAccess($);
  const headingStructureResult = auditHeadingStructure($);
  const formsResult = auditForms($);
  const dynamicContentResult = auditDynamicContent($);
  const videosResult = auditVideos($);
  const zoomResult = auditZoomAndResponsive($);

  // Count structural issues before evaluating plugins
  const totalStructuralIssues =
    genericLinksResult.issuesCount +
    buttonContrastResult.issuesCount +
    altTextResult.issuesCount +
    keyboardAccessResult.issuesCount +
    headingStructureResult.issuesCount +
    formsResult.issuesCount;

  // Run Criterion 10 (Accessibility Plugins) with knowledge of structural issues
  const pluginsResult = auditAccessibilityPlugins($, totalStructuralIssues);

  const headingsTree: HeadingItem[] = headingStructureResult.meta?.headingsTree || [];

  const categories = [
    genericLinksResult,
    buttonContrastResult,
    altTextResult,
    keyboardAccessResult,
    headingStructureResult,
    formsResult,
    dynamicContentResult,
    videosResult,
    zoomResult,
    pluginsResult,
  ];

  return computeAuditReport({
    url,
    pageTitle,
    durationMs,
    categories,
    headingsTree,
  });
}
