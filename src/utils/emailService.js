const fs = require('fs');
const path = require('path');
const moment = require('moment-timezone');
const PDFGenerator = require('./pdfGenerator');
const Logger = require('./logger');

class ReportService {
    constructor() {
        this.logger = new Logger();
        this.pdfGenerator = new PDFGenerator();
    }

    async savePunchReport(punchInTime, punchOutTime, punchLog) {
        try {
            this.logger.info('Generating PDF punch report...');
            
            // Calculate working hours
            const punchInMoment = moment.tz(punchInTime, 'YYYY-MM-DD HH:mm:ss', 'Asia/Kolkata');
            const punchOutMoment = moment.tz(punchOutTime, 'YYYY-MM-DD HH:mm:ss', 'Asia/Kolkata');
            const duration = moment.duration(punchOutMoment.diff(punchInMoment));
            const hours = Math.floor(duration.asHours());
            const minutes = duration.minutes();
            
            // Create report data
            const reportData = {
                success: true,
                timestamp: moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss'),
                employee: 'varun.singh@telesys.com',
                punchInTime: punchInTime,
                punchOutTime: punchOutTime,
                totalHours: `${hours} hours ${minutes} minutes`,
                steps: [
                    {
                        step: 'Punch In',
                        status: 'completed',
                        timestamp: punchInTime,
                        data: 'Successfully punched in'
                    },
                    {
                        step: 'Punch Out', 
                        status: 'completed',
                        timestamp: punchOutTime,
                        data: 'Successfully punched out'
                    }
                ],
                punchLog: punchLog
            };
            
            // Generate PDF
            const pdfPath = await this.pdfGenerator.generateReport(reportData);
            
            this.logger.success(`✓ PDF report generated: ${pdfPath}`);
            
            return {
                success: true,
                pdfPath: pdfPath,
                totalHours: `${hours} hours ${minutes} minutes`
            };
            
        } catch (error) {
            this.logger.error('Failed to generate PDF report:', error);
            throw error;
        }
    }

    async saveErrorReport(errorMessage) {
        try {
            this.logger.info('Generating error PDF report...');
            
            const reportData = {
                success: false,
                timestamp: moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss'),
                error: errorMessage,
                steps: [
                    {
                        step: 'AutoPunch Execution',
                        status: 'failed',
                        timestamp: moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss'),
                        data: errorMessage
                    }
                ]
            };
            
            const pdfPath = await this.pdfGenerator.generateReport(reportData);
            
            this.logger.success(`✓ Error PDF report generated: ${pdfPath}`);
            
            return {
                success: true,
                pdfPath: pdfPath
            };
            
        } catch (error) {
            this.logger.error('Failed to generate error PDF report:', error);
            throw error;
        }
    }
}

module.exports = ReportService;
