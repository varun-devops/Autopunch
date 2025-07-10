const jsPDF = require('jspdf');
const fs = require('fs-extra');
const path = require('path');
const moment = require('moment');
const Logger = require('./logger');

class PDFGenerator {
    constructor() {
        this.logger = new Logger();
        this.outputDir = process.env.PDF_OUTPUT_DIR || './reports';
        this.filenamePrefix = process.env.PDF_FILENAME_PREFIX || 'autopunch-report';
    }

    async generateReport(executionResult) {
        try {
            this.logger.info('Generating PDF report...');
            
            // Ensure output directory exists
            await fs.ensureDir(this.outputDir);

            // Create new PDF document
            const doc = new jsPDF();
            
            // Set up document
            this.setupDocument(doc);
            
            // Add content
            this.addHeader(doc, executionResult);
            this.addExecutionSummary(doc, executionResult);
            this.addExecutionSteps(doc, executionResult);
            
            if (executionResult.error) {
                this.addErrorSection(doc, executionResult);
            }
            
            this.addFooter(doc);

            // Generate filename
            const timestamp = moment().format('YYYY-MM-DD_HH-mm-ss');
            const filename = `${this.filenamePrefix}-${timestamp}.pdf`;
            const filepath = path.join(this.outputDir, filename);

            // Save PDF
            await fs.writeFile(filepath, doc.output('arraybuffer'));
            
            this.logger.info(`PDF report generated successfully: ${filepath}`);
            return filepath;
            
        } catch (error) {
            this.logger.error('Failed to generate PDF report:', error);
            throw error;
        }
    }

    setupDocument(doc) {
        // Set document properties
        doc.setProperties({
            title: 'AutoPunch Execution Report',
            subject: 'Automated Web Crawler Report',
            author: 'AutoPunch System',
            creator: 'AutoPunch Web Crawler'
        });
    }

    addHeader(doc, result) {
        // Title
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('AutoPunch Execution Report', 105, 20, { align: 'center' });
        
        // Subtitle
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text('Automated Web Crawler Report', 105, 30, { align: 'center' });
        
        // Date and time
        doc.setFontSize(10);
        doc.text(`Generated: ${moment(result.timestamp).format('MMMM Do YYYY, h:mm:ss a')}`, 105, 40, { align: 'center' });
        
        // Line separator
        doc.setDrawColor(0, 0, 0);
        doc.line(20, 45, 190, 45);
    }

    addExecutionSummary(doc, result) {
        let yPosition = 55;
        
        // Summary section title
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Execution Summary', 20, yPosition);
        yPosition += 10;
        
        // Status
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text('Status:', 20, yPosition);
        
        // Status value with color
        if (result.success) {
            doc.setTextColor(0, 128, 0); // Green
            doc.text('SUCCESS', 50, yPosition);
        } else {
            doc.setTextColor(255, 0, 0); // Red
            doc.text('FAILED', 50, yPosition);
        }
        doc.setTextColor(0, 0, 0); // Reset to black
        yPosition += 8;
        
        // Execution time
        doc.text('Execution Time:', 20, yPosition);
        doc.text(`${moment(result.timestamp).format('YYYY-MM-DD HH:mm:ss')}`, 70, yPosition);
        yPosition += 8;
        
        // Duration
        if (result.duration) {
            doc.text('Duration:', 20, yPosition);
            doc.text(`${(result.duration / 1000).toFixed(2)} seconds`, 50, yPosition);
            yPosition += 8;
        }
        
        // Total steps
        doc.text('Total Steps:', 20, yPosition);
        doc.text(`${result.steps.length}`, 60, yPosition);
        yPosition += 8;
        
        // Successful steps
        const successfulSteps = result.steps.filter(step => step.status === 'completed').length;
        doc.text('Successful Steps:', 20, yPosition);
        doc.text(`${successfulSteps}`, 80, yPosition);
        yPosition += 15;
        
        return yPosition;
    }

    addExecutionSteps(doc, result) {
        let yPosition = this.addExecutionSummary(doc, result);
        
        // Steps section title
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Execution Steps', 20, yPosition);
        yPosition += 10;
        
        // Steps table header
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Step', 20, yPosition);
        doc.text('Status', 80, yPosition);
        doc.text('Timestamp', 120, yPosition);
        yPosition += 5;
        
        // Line under header
        doc.line(20, yPosition, 190, yPosition);
        yPosition += 5;
        
        // Steps data
        doc.setFont('helvetica', 'normal');
        result.steps.forEach((step, index) => {
            // Check if we need a new page
            if (yPosition > 250) {
                doc.addPage();
                yPosition = 20;
            }
            
            // Step number and name
            doc.text(`${index + 1}. ${step.step}`, 20, yPosition);
            
            // Status with color
            if (step.status === 'completed') {
                doc.setTextColor(0, 128, 0); // Green
                doc.text('✓ Completed', 80, yPosition);
            } else if (step.status === 'failed') {
                doc.setTextColor(255, 0, 0); // Red
                doc.text('✗ Failed', 80, yPosition);
            } else {
                doc.setTextColor(255, 165, 0); // Orange
                doc.text('◯ Starting', 80, yPosition);
            }
            doc.setTextColor(0, 0, 0); // Reset to black
            
            // Timestamp
            doc.text(moment(step.timestamp).format('HH:mm:ss'), 120, yPosition);
            
            yPosition += 7;
        });
        
        return yPosition;
    }

    addErrorSection(doc, result) {
        // Check if we need a new page
        if (doc.internal.getCurrentPageInfo().pageNumber > 1 || doc.internal.pageSize.height - doc.internal.getCurrentPageInfo().pageNumber < 50) {
            doc.addPage();
        }
        
        let yPosition = 20;
        
        // Error section title
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 0, 0); // Red
        doc.text('Error Details', 20, yPosition);
        doc.setTextColor(0, 0, 0); // Reset to black
        yPosition += 10;
        
        // Error message
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        
        // Split long error messages
        const errorLines = this.splitTextIntoLines(result.error, 80);
        errorLines.forEach(line => {
            doc.text(line, 20, yPosition);
            yPosition += 5;
        });
    }

    addFooter(doc) {
        const pageCount = doc.internal.getNumberOfPages();
        
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            
            // Footer line
            doc.setDrawColor(0, 0, 0);
            doc.line(20, 280, 190, 280);
            
            // Footer text
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.text('AutoPunch Web Crawler - Automated Report', 20, 290);
            doc.text(`Page ${i} of ${pageCount}`, 190, 290, { align: 'right' });
        }
    }

    splitTextIntoLines(text, maxCharsPerLine) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';
        
        words.forEach(word => {
            if ((currentLine + word).length <= maxCharsPerLine) {
                currentLine += (currentLine ? ' ' : '') + word;
            } else {
                if (currentLine) {
                    lines.push(currentLine);
                }
                currentLine = word;
            }
        });
        
        if (currentLine) {
            lines.push(currentLine);
        }
        
        return lines;
    }
}

module.exports = PDFGenerator;
