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

      return summary.trim() || 'No summary available.';
    } catch (error) {
      console.error('Error generating summary:', error);
      return 'Summary generation failed.';
    }
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
          .font('Helvetica')
          .fillColor('#333333')
          .text(summary, {
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

          // Message content
          doc.fontSize(10)
            .font('Helvetica')
            .fillColor('#000000')
            .text(message.content, {
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
