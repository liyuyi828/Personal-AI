import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import { dialog } from 'electron';
import { ChatSessionWithMessages } from './lib/model-types';
import { ollamaClient } from './ollama-client';

export class ExportService {
  async exportChatToPDF(session: ChatSessionWithMessages): Promise<{ success: boolean; filePath?: string; error?: string }> {
    try {
      // Ask user where to save the PDF
      const result = await dialog.showSaveDialog({
        title: 'Export Chat to PDF',
        defaultPath: `${session.name.replace(/[^a-z0-9]/gi, '_')}.pdf`,
        filters: [
          { name: 'PDF Files', extensions: ['pdf'] }
        ]
      });

      if (result.canceled || !result.filePath) {
        return { success: false, error: 'Export cancelled' };
      }

      const filePath = result.filePath;

      // Generate summary using LLM
      console.log('Generating chat summary using LLM...');
      const summary = await this.generateSummary(session);

      // Create PDF
      await this.createPDF(session, summary, filePath);

      console.log(`Chat exported successfully to: ${filePath}`);
      return { success: true, filePath };
    } catch (error) {
      console.error('Error exporting chat to PDF:', error);
      return { success: false, error: String(error) };
    }
  }

  private async generateSummary(session: ChatSessionWithMessages): Promise<string> {
    try {
      // Build conversation context for summary
      const conversationText = session.messages
        .map(msg => msg.content)
        .join('\n\n');

      // Create summary prompt
      const summaryPrompt = `Please provide a concise summary (2-3 paragraphs) of the following conversation. Focus on the main topics discussed, key questions asked, and important conclusions or insights reached:

${conversationText}

Summary:`;

      // Generate summary using Ollama
      let summary = '';
      await ollamaClient.chat(
        [{ role: 'user', content: summaryPrompt }],
        (chunk) => {
          summary += chunk;
        }
      );

      // Clean up the summary
      summary = this.cleanSummaryText(summary);

      return summary.trim() || 'No summary available.';
    } catch (error) {
      console.error('Error generating summary:', error);
      return 'Summary generation failed.';
    }
  }

  private cleanSummaryText(text: string): string {
    // Remove <think> tags and their content
    text = text.replace(/<think>[\s\S]*?<\/think>/gi, '');

    // Remove any remaining XML-like tags
    text = text.replace(/<[^>]+>/g, '');

    // Remove excessive whitespace and newlines
    text = text.replace(/\n{3,}/g, '\n\n');

    // Trim whitespace from each line
    text = text.split('\n').map(line => line.trim()).join('\n');

    // Remove leading/trailing whitespace
    text = text.trim();

    return text;
  }

  private cleanMessageContent(text: string): string {
    // Remove <think> tags and their content from messages
    text = text.replace(/<think>[\s\S]*?<\/think>/gi, '');

    // Remove any remaining XML-like tags
    text = text.replace(/<[^>]+>/g, '');

    // Remove excessive whitespace
    text = text.replace(/\n{3,}/g, '\n\n');
    text = text.trim();

    return text;
  }

  private renderFormattedText(doc: PDFKit.PDFDocument, text: string, options: any = {}) {
    const lines = text.split('\n');
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];
    let codeLanguage = '';
    let inTable = false;
    let tableRows: string[] = [];
    let inList = false;
    const leftMargin = doc.page.margins.left;

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];

      // Check for code block delimiters
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          // End of code block - render it
          this.renderCodeBlock(doc, codeBlockContent.join('\n'), codeLanguage);
          codeBlockContent = [];
          codeLanguage = '';
          inCodeBlock = false;
        } else {
          // Start of code block
          inCodeBlock = true;
          codeLanguage = line.trim().substring(3).trim();
        }
        continue;
      }

      // If inside code block, collect lines
      if (inCodeBlock) {
        codeBlockContent.push(line);
        continue;
      }

      // Check for table rows
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        if (!inTable) {
          inTable = true;
          tableRows = [];
          inList = false; // End any list
          doc.x = leftMargin; // Reset indentation
        }
        tableRows.push(line);
        continue;
      } else if (inTable) {
        // End of table - render it
        this.renderTable(doc, tableRows);
        tableRows = [];
        inTable = false;
        doc.x = leftMargin; // Reset indentation after table
      }

      // Check for horizontal rule
      if (line.trim() === '---' || line.trim() === '___') {
        doc.x = leftMargin;
        inList = false;
        doc.moveDown(0.5);
        doc.strokeColor('#cccccc')
          .lineWidth(0.5)
          .moveTo(doc.x, doc.y)
          .lineTo(doc.page.width - 100, doc.y)
          .stroke();
        doc.moveDown(0.5);
        continue;
      }

      // Check for headings
      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        let headingText = headingMatch[2];
        // Remove emojis (basic emoji removal)
        headingText = headingText.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
        this.renderHeading(doc, headingText, level);
        continue;
      }

      // Check for numbered lists
      const numberedMatch = line.match(/^\d+\.\s+(.+)$/);
      if (numberedMatch) {
        if (!inList) {
          inList = true;
          doc.x = leftMargin; // Ensure we start at left margin
        }
        const xPos = leftMargin;
        const number = line.match(/^(\d+)\./)?.[1] || '1';
        doc.font('Helvetica').fontSize(10).text(`${number}.`, xPos, doc.y, { continued: false });
        doc.x = xPos + 20;
        this.renderLineWithFormatting(doc, numberedMatch[1], options);
        doc.x = leftMargin; // Reset to left margin
        doc.moveDown(0.3);
        continue;
      }

      // Check for bullet points
      const bulletMatch = line.match(/^[-*•]\s+(.+)$/);
      if (bulletMatch) {
        if (!inList) {
          inList = true;
          doc.x = leftMargin; // Ensure we start at left margin
        }
        const bulletText = bulletMatch[1];
        const xPos = leftMargin;
        doc.font('Helvetica').fontSize(10).text('•', xPos, doc.y, { continued: false });
        doc.x = xPos + 15;
        this.renderLineWithFormatting(doc, bulletText, options);
        doc.x = leftMargin; // Reset to left margin
        doc.moveDown(0.3);
        continue;
      }

      // Empty line
      if (line.trim() === '') {
        if (inList) {
          inList = false; // End the list
          doc.x = leftMargin; // Reset indentation
        }
        doc.moveDown(0.5);
        continue;
      }

      // Regular line with formatting (not in a list)
      if (inList) {
        inList = false; // Transitioning from list to regular text
        doc.x = leftMargin; // Reset indentation
      }
      this.renderLineWithFormatting(doc, line, options);
      doc.moveDown(0.3);
    }

    // Render any remaining table
    if (inTable && tableRows.length > 0) {
      this.renderTable(doc, tableRows);
    }

    // Render any remaining code block
    if (inCodeBlock && codeBlockContent.length > 0) {
      this.renderCodeBlock(doc, codeBlockContent.join('\n'), codeLanguage);
    }
  }

  private renderHeading(doc: PDFKit.PDFDocument, text: string, level: number) {
    // Check if we need a new page
    if (doc.y > doc.page.height - 100) {
      doc.addPage();
    }

    doc.moveDown(0.5);

    const fontSize = level === 1 ? 14 : level === 2 ? 12 : level === 3 ? 11 : 10;
    const color = level <= 2 ? '#1a1a1a' : '#333333';

    doc.fontSize(fontSize)
      .font('Helvetica-Bold')
      .fillColor(color)
      .text(text, { underline: level <= 2 });

    doc.font('Helvetica').fillColor('#000000').fontSize(10);
    doc.moveDown(0.3);
  }

  private renderCodeBlock(doc: PDFKit.PDFDocument, code: string, language: string) {
    // Check if we need a new page
    if (doc.y > doc.page.height - 200) {
      doc.addPage();
    }

    doc.moveDown(0.5);

    // Draw background rectangle
    const codeLines = code.split('\n');
    const lineHeight = 12;
    const padding = 10;
    const blockHeight = (codeLines.length * lineHeight) + (padding * 2) + (language ? 20 : 0);
    const blockWidth = doc.page.width - 120;

    const startY = doc.y;

    // Background
    doc.rect(doc.x, startY, blockWidth, blockHeight)
      .fill('#f5f5f5');

    // Language label if provided
    let contentStartY = startY + padding;
    if (language) {
      doc.fontSize(8)
        .font('Helvetica-Bold')
        .fillColor('#666666')
        .text(language, doc.x + padding, startY + 5);
      contentStartY += 15;
    }

    // Render code text
    doc.fontSize(9)
      .font('Courier')
      .fillColor('#333333')
      .text(code, doc.x + padding, contentStartY, {
        width: blockWidth - (padding * 2),
        lineGap: 2
      });

    doc.font('Helvetica').fillColor('#000000').fontSize(10);
    doc.y = startY + blockHeight + 5;
    doc.moveDown(0.5);
  }

  private renderTable(doc: PDFKit.PDFDocument, rows: string[]) {
    if (rows.length < 2) return; // Need at least header + separator

    // Check if we need a new page
    if (doc.y > doc.page.height - 250) {
      doc.addPage();
    }

    doc.moveDown(0.5);

    // Parse table
    const header = rows[0].split('|').map(cell => cell.trim()).filter(cell => cell);
    const dataRows = rows.slice(2).map(row =>
      row.split('|').map(cell => cell.trim()).filter(cell => cell)
    );

    const availableWidth = doc.page.width - 120;
    const colWidth = availableWidth / header.length;
    const startX = doc.x;
    let currentY = doc.y;

    // Draw table header background
    doc.rect(startX, currentY, availableWidth, 20)
      .fill('#e8e8e8');

    // Draw table header text
    doc.fontSize(9)
      .font('Helvetica-Bold')
      .fillColor('#000000');

    header.forEach((cell, colIndex) => {
      const cellX = startX + (colIndex * colWidth);
      doc.text(cell, cellX + 5, currentY + 5, {
        width: colWidth - 10,
        align: 'left'
      });
    });

    currentY += 20;

    // Draw header border
    doc.strokeColor('#cccccc')
      .lineWidth(1)
      .moveTo(startX, currentY)
      .lineTo(startX + availableWidth, currentY)
      .stroke();

    currentY += 5;

    // Draw data rows
    doc.font('Helvetica').fontSize(9);

    dataRows.forEach((row) => {
      const rowY = currentY;

      // Check if we need a new page
      if (rowY > doc.page.height - 100) {
        doc.addPage();
        currentY = 50;
      }

      row.forEach((cell, colIndex) => {
        const cellX = startX + (colIndex * colWidth);
        // Remove bold markdown from cells
        const cleanCell = cell.replace(/\*\*/g, '');
        doc.text(cleanCell, cellX + 5, currentY, {
          width: colWidth - 10,
          align: 'left'
        });
      });

      currentY += 18;

      // Draw row border
      doc.strokeColor('#eeeeee')
        .lineWidth(0.5)
        .moveTo(startX, currentY)
        .lineTo(startX + availableWidth, currentY)
        .stroke();

      currentY += 5;
    });

    doc.y = currentY;
    doc.fillColor('#000000').fontSize(10);
    doc.moveDown(0.5);
  }

  private renderLineWithFormatting(doc: PDFKit.PDFDocument, line: string, options: any = {}) {
    // Remove inline code backticks (just strip them, don't highlight)
    line = line.replace(/`([^`]+)`/g, '$1');

    // Parse bold text (**text**)
    const parts: Array<{ text: string; bold: boolean }> = [];
    let currentText = '';
    let inBold = false;
    let i = 0;

    while (i < line.length) {
      // Check for bold
      if (line[i] === '*' && line[i + 1] === '*') {
        if (currentText) {
          parts.push({ text: currentText, bold: inBold });
          currentText = '';
        }
        inBold = !inBold;
        i += 2;
      } else {
        currentText += line[i];
        i++;
      }
    }

    // Add remaining text
    if (currentText) {
      parts.push({ text: currentText, bold: inBold });
    }

    // Render parts
    parts.forEach((part, index) => {
      const isLast = index === parts.length - 1;

      doc.font(part.bold ? 'Helvetica-Bold' : 'Helvetica')
        .fillColor('#000000')
        .text(part.text, {
          ...options,
          continued: !isLast
        });
    });

    // Reset font to normal
    doc.font('Helvetica').fillColor('#000000');
  }

  private async createPDF(session: ChatSessionWithMessages, summary: string, filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margins: { top: 50, bottom: 50, left: 50, right: 50 }
        });

        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Title
        doc.fontSize(24)
          .font('Helvetica-Bold')
          .text(session.name, { align: 'center' });

        doc.moveDown(0.5);

        // Metadata
        doc.fontSize(10)
          .font('Helvetica')
          .fillColor('#666666')
          .text(`Created: ${new Date(session.createdAt).toLocaleString()}`, { align: 'center' })
          .text(`Last Updated: ${new Date(session.updatedAt).toLocaleString()}`, { align: 'center' })
          .text(`Total Messages: ${session.messages.length}`, { align: 'center' });

        doc.moveDown(1);

        // Divider
        doc.strokeColor('#cccccc')
          .lineWidth(1)
          .moveTo(50, doc.y)
          .lineTo(doc.page.width - 50, doc.y)
          .stroke();

        doc.moveDown(1);

        // Summary Section
        doc.fontSize(16)
          .font('Helvetica-Bold')
          .fillColor('#000000')
          .text('Summary', { underline: true });

        doc.moveDown(0.5);

        doc.fontSize(11)
          .fillColor('#333333');

        // Render summary with formatting
        this.renderFormattedText(doc, summary, {
          align: 'justify',
          lineGap: 2
        });

        doc.moveDown(1.5);

        // Divider
        doc.strokeColor('#cccccc')
          .lineWidth(1)
          .moveTo(50, doc.y)
          .lineTo(doc.page.width - 50, doc.y)
          .stroke();

        doc.moveDown(1);

        // Messages Section
        doc.fontSize(16)
          .font('Helvetica-Bold')
          .fillColor('#000000')
          .text('Conversation', { underline: true });

        doc.moveDown(1);

        // Add messages
        session.messages.forEach((message, index) => {
          // Check if we need a new page
          if (doc.y > doc.page.height - 150) {
            doc.addPage();
          }

          // Message header
          const timestamp = new Date(message.timestamp).toLocaleString();
          const role = message.role === 'user' ? 'You' : 'AI Assistant';
          const roleColor = message.role === 'user' ? '#2563eb' : '#16a34a';

          doc.fontSize(10)
            .font('Helvetica-Bold')
            .fillColor(roleColor)
            .text(`${role}`, { continued: true })
            .font('Helvetica')
            .fillColor('#999999')
            .text(` • ${timestamp}`);

          doc.moveDown(0.3);

          // Clean and render message content with formatting
          const cleanedContent = this.cleanMessageContent(message.content);

          doc.fontSize(10)
            .fillColor('#000000');

          this.renderFormattedText(doc, cleanedContent, {
            align: 'left',
            lineGap: 2
          });

          // Add spacing between messages
          if (index < session.messages.length - 1) {
            doc.moveDown(1);

            // Light separator line
            doc.strokeColor('#eeeeee')
              .lineWidth(0.5)
              .moveTo(70, doc.y)
              .lineTo(doc.page.width - 70, doc.y)
              .stroke();

            doc.moveDown(1);
          }
        });

        // Footer on last page
        doc.fontSize(8)
          .fillColor('#999999')
          .text(
            `Generated by Personal AI on ${new Date().toLocaleString()}`,
            50,
            doc.page.height - 50,
            { align: 'center' }
          );

        doc.end();

        stream.on('finish', () => {
          resolve();
        });

        stream.on('error', (error) => {
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}

export const exportService = new ExportService();
