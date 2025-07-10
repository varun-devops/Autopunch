const cron = require('node-cron');
const Logger = require('../utils/logger');

class Scheduler {
    constructor() {
        this.logger = new Logger();
        this.tasks = [];
    }

    schedule(cronExpression, task, options = {}) {
        try {
            this.logger.info(`Scheduling task with cron expression: ${cronExpression}`);
            
            // Validate cron expression
            if (!cron.validate(cronExpression)) {
                throw new Error(`Invalid cron expression: ${cronExpression}`);
            }

            // Default options
            const defaultOptions = {
                scheduled: true,
                timezone: process.env.TIMEZONE || 'UTC'
            };

            const finalOptions = { ...defaultOptions, ...options };

            // Schedule the task
            const scheduledTask = cron.schedule(cronExpression, async () => {
                try {
                    this.logger.info('Executing scheduled task...');
                    await task();
                    this.logger.info('Scheduled task completed successfully');
                } catch (error) {
                    this.logger.error('Scheduled task failed:', error);
                }
            }, finalOptions);

            // Store task reference
            this.tasks.push({
                cronExpression,
                task: scheduledTask,
                createdAt: new Date(),
                options: finalOptions
            });

            this.logger.info(`Task scheduled successfully. Timezone: ${finalOptions.timezone}`);
            
            return scheduledTask;
            
        } catch (error) {
            this.logger.error('Failed to schedule task:', error);
            throw error;
        }
    }

    scheduleDaily(hour, minute, task, options = {}) {
        const cronExpression = `${minute} ${hour} * * *`;
        return this.schedule(cronExpression, task, options);
    }

    scheduleWeekly(dayOfWeek, hour, minute, task, options = {}) {
        const cronExpression = `${minute} ${hour} * * ${dayOfWeek}`;
        return this.schedule(cronExpression, task, options);
    }

    scheduleMonthly(dayOfMonth, hour, minute, task, options = {}) {
        const cronExpression = `${minute} ${hour} ${dayOfMonth} * *`;
        return this.schedule(cronExpression, task, options);
    }

    getScheduledTasks() {
        return this.tasks.map(task => ({
            cronExpression: task.cronExpression,
            createdAt: task.createdAt,
            options: task.options,
            isRunning: task.task.running
        }));
    }

    stopAllTasks() {
        this.logger.info('Stopping all scheduled tasks...');
        this.tasks.forEach(task => {
            if (task.task.running) {
                task.task.stop();
            }
        });
        this.logger.info('All scheduled tasks stopped');
    }

    startAllTasks() {
        this.logger.info('Starting all scheduled tasks...');
        this.tasks.forEach(task => {
            if (!task.task.running) {
                task.task.start();
            }
        });
        this.logger.info('All scheduled tasks started');
    }

    getNextExecutionTime(cronExpression) {
        try {
            // This is a simplified approach - in production, you might want to use a more sophisticated library
            const now = new Date();
            const nextExecution = this.calculateNextExecution(cronExpression, now);
            return nextExecution;
        } catch (error) {
            this.logger.error('Failed to calculate next execution time:', error);
            return null;
        }
    }

    calculateNextExecution(cronExpression, from) {
        // Basic implementation - for more complex scenarios, consider using a library like 'cron-parser'
        const parts = cronExpression.split(' ');
        const minute = parseInt(parts[0]);
        const hour = parseInt(parts[1]);
        
        const next = new Date(from);
        next.setHours(hour, minute, 0, 0);
        
        // If the time has already passed today, schedule for tomorrow
        if (next <= from) {
            next.setDate(next.getDate() + 1);
        }
        
        return next;
    }

    // Method to handle graceful shutdown
    shutdown() {
        this.logger.info('Shutting down scheduler...');
        this.stopAllTasks();
        this.logger.info('Scheduler shutdown complete');
    }
}

module.exports = Scheduler;
