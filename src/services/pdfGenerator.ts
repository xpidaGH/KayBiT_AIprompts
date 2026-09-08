import { jsPDF } from 'jspdf';
import { CurriculumDocument, BreadcrumbItem } from '../types';
import { SUPPORTED_LANGUAGES } from './aiGateway';

export interface PdfExportOptions {
  languageCode?: string;
  breadcrumbs?: BreadcrumbItem[];
  includeCritiques?: boolean;
}

/**
 * Exports a CurriculumDocument to a formatted PDF using jsPDF.
 */
export function exportCurriculumToPdf(
  doc: CurriculumDocument,
  options: PdfExportOptions = {}
): void {
  const langCode = options.languageCode || 'en';
  const langInfo = SUPPORTED_LANGUAGES.find((l) => l.code === langCode);
  const langName = langInfo ? `${langInfo.name} (${langInfo.code.toUpperCase()})` : langCode.toUpperCase();

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const marginX = 14;
  const contentWidth = pageWidth - marginX * 2;
  const topMargin = 16;
  const bottomMargin = 16;

  let currentY = topMargin;

  // Helper: Check if adding element height requires a new page
  const checkPageBreak = (neededHeight: number) => {
    if (currentY + neededHeight > pageHeight - bottomMargin) {
      pdf.addPage();
      currentY = topMargin + 6;
      drawPageHeader();
    }
  };

  // Helper: Subtle top running header on pages > 1
  const drawPageHeader = () => {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(140, 140, 150);
    pdf.text(`${doc.title} • ${doc.subject} • ${langName}`, marginX, topMargin);
    pdf.setDrawColor(225, 230, 235);
    pdf.setLineWidth(0.2);
    pdf.line(marginX, topMargin + 2, pageWidth - marginX, topMargin + 2);
  };

  // === COVER / HEADER BANNER ===
  // Primary Title Box
  pdf.setFillColor(30, 27, 75); // Deep Indigo
  pdf.roundedRect(marginX, currentY, contentWidth, 32, 3, 3, 'F');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(196, 181, 253); // Light violet
  pdf.text('KAYBIT AI PROMPT STUDIO • MULTILINGUAL CURRICULUM', marginX + 6, currentY + 7);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(15);
  pdf.setTextColor(255, 255, 255);
  const titleLines = pdf.splitTextToSize(doc.title, contentWidth - 12);
  pdf.text(titleLines[0] || doc.title, marginX + 6, currentY + 16);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(226, 232, 240);
  pdf.text(`${doc.subtitle || 'Production-Grade Software Engineering Curricula'} | Subject: ${doc.subject}`, marginX + 6, currentY + 23);

  pdf.setFontSize(8);
  pdf.setTextColor(180, 190, 210);
  pdf.text(`Exported Language: ${langName} | Total Chapters: ${doc.chapters.length} | Date: ${new Date().toLocaleDateString()}`, marginX + 6, currentY + 28);

  currentY += 38;

  // Document Metadata Summary Bar
  pdf.setFillColor(248, 250, 252);
  pdf.setDrawColor(226, 232, 240);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(marginX, currentY, contentWidth, 11, 2, 2, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(100, 116, 139);
  pdf.text('CURRICULUM SPECIFICATION:', marginX + 4, currentY + 7);

  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(71, 85, 105);
  pdf.text(
    `Provider Target: Multi-Agent (Cursor, Claude, Copilot, Gemini)  |  Source: ${doc.sourceType.toUpperCase()}  |  ID: ${doc.id}`,
    marginX + 56,
    currentY + 7
  );

  currentY += 16;

  // === CHAPTERS RENDERING ===
  doc.chapters.forEach((chapter, index) => {
    // Resolve translations if requested language is not English
    const translation = langCode !== 'en' ? chapter.translations?.[langCode] : null;
    const chapterTitle = translation?.title || chapter.title;
    const chapterTopic = translation?.topic || chapter.topic;
    const chapterObjective = translation?.objective || chapter.objective;

    // Calculate prompt wrapping height
    pdf.setFont('courier', 'normal');
    pdf.setFontSize(8);
    const promptLines = pdf.splitTextToSize(chapter.prompt, contentWidth - 10);
    const promptBoxHeight = Math.min(promptLines.length * 3.6 + 8, 90); // Cap huge prompts to prevent runaway heights

    // Check estimated height for chapter header + metadata + prompt box
    const estimatedHeight = 35 + promptBoxHeight;
    checkPageBreak(estimatedHeight);

    // Chapter Header Card
    pdf.setFillColor(248, 250, 252);
    pdf.setDrawColor(215, 220, 230);
    pdf.setLineWidth(0.3);
    pdf.roundedRect(marginX, currentY, contentWidth, 10, 2, 2, 'FD');

    // Chapter Number Pill
    pdf.setFillColor(124, 58, 237); // Purple 600
    pdf.roundedRect(marginX + 2.5, currentY + 2, 8, 6, 1, 1, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.5);
    pdf.setTextColor(255, 255, 255);
    pdf.text(chapter.numStr || String(index + 1).padStart(2, '0'), marginX + 3.8, currentY + 6.2);

    // Chapter Title
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9.5);
    pdf.setTextColor(30, 41, 59);
    const safeTitle = pdf.splitTextToSize(chapterTitle, contentWidth - 25);
    pdf.text(safeTitle[0] || chapterTitle, marginX + 13, currentY + 6.5);

    currentY += 13;

    // Topic & Objective
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(109, 40, 217); // Violet
    pdf.text('Topic: ', marginX + 2, currentY);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(51, 65, 85);
    const topicLines = pdf.splitTextToSize(chapterTopic, contentWidth - 16);
    pdf.text(topicLines, marginX + 14, currentY);
    currentY += Math.max(topicLines.length * 4, 4.5);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(79, 70, 229); // Indigo
    pdf.text('Objective: ', marginX + 2, currentY);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(51, 65, 85);
    const objectiveLines = pdf.splitTextToSize(chapterObjective, contentWidth - 20);
    pdf.text(objectiveLines, marginX + 18, currentY);
    currentY += Math.max(objectiveLines.length * 4, 5);

    // AI Prompt Block
    checkPageBreak(promptBoxHeight + 8);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.5);
    pdf.setTextColor(100, 116, 139);
    pdf.text('STANDALONE AI PROMPT (English Specification):', marginX + 2, currentY + 3);
    currentY += 4.5;

    // Background for prompt code
    pdf.setFillColor(243, 244, 246);
    pdf.setDrawColor(220, 225, 232);
    pdf.setLineWidth(0.2);
    pdf.roundedRect(marginX, currentY, contentWidth, promptBoxHeight, 2, 2, 'FD');

    // Code text
    pdf.setFont('courier', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(31, 41, 55);

    // Render up to capped lines
    const maxLinesToRender = Math.floor((promptBoxHeight - 4) / 3.6);
    const linesToDraw = promptLines.slice(0, maxLinesToRender);
    linesToDraw.forEach((line: string, lIdx: number) => {
      pdf.text(line, marginX + 3.5, currentY + 4 + lIdx * 3.6);
    });

    currentY += promptBoxHeight + 4;

    // Optional Critique & Improved Prompt
    if (chapter.critique && options.includeCritiques !== false) {
      checkPageBreak(18);
      pdf.setFillColor(254, 243, 199); // Amber 100
      pdf.setDrawColor(251, 191, 36); // Amber 400
      pdf.setLineWidth(0.2);
      pdf.roundedRect(marginX, currentY, contentWidth, 12, 1.5, 1.5, 'FD');

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7.5);
      pdf.setTextColor(146, 64, 14);
      pdf.text('Critique & Pedagogical Audit: ', marginX + 3, currentY + 4.5);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      pdf.setTextColor(180, 83, 9);
      const critiqueLines = pdf.splitTextToSize(chapter.critique, contentWidth - 45);
      pdf.text(critiqueLines.slice(0, 2), marginX + 44, currentY + 4.5);

      currentY += 15;
    }

    // Divider between chapters
    currentY += 4;
    pdf.setDrawColor(235, 240, 245);
    pdf.setLineWidth(0.2);
    pdf.line(marginX, currentY, pageWidth - marginX, currentY);
    currentY += 5;
  });

  // === RUNNING FOOTER ON ALL PAGES ===
  const totalPages = pdf.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    pdf.setPage(p);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(148, 163, 184);

    // Bottom line
    pdf.setDrawColor(226, 232, 240);
    pdf.setLineWidth(0.2);
    pdf.line(marginX, pageHeight - bottomMargin + 4, pageWidth - marginX, pageHeight - bottomMargin + 4);

    // Left footer
    pdf.text(
      `KayBiT AI Curriculum Studio • ${doc.subject} • ${langName}`,
      marginX,
      pageHeight - bottomMargin + 8.5
    );

    // Right footer
    pdf.text(
      `Page ${p} of ${totalPages}`,
      pageWidth - marginX - 18,
      pageHeight - bottomMargin + 8.5
    );
  }

  // Trigger download
  const cleanSubject = doc.subject.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${cleanSubject}_${langCode}_curriculum.pdf`;
  pdf.save(filename);
}
