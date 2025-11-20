/**
 * LogService - Centralized secure logging with encryption and anonymization
 * Main service for all application logging needs
 */

import { LogLevel, StructuredLog } from '../types';
import { CryptoService } from './CryptoService';
import { LogStorage } from './LogStorage';

export class LogService {
    private static instance: LogService;
    private encryptionKey: CryptoKey | null = null;
    private isInitialized = false;

    private constructor() { }

    static getInstance(): LogService {
        if (!LogService.instance) {
            LogService.instance = new LogService();
        }
        return LogService.instance;
    }

    /**
     * Initialize the logging service with encryption key
     */
    async initialize(): Promise<void> {
        if (this.isInitialized) return;

        try {
            // Try to load existing key from sessionStorage
            const storedKey = sessionStorage.getItem('log_encryption_key');
            if (storedKey) {
                this.encryptionKey = await CryptoService.importKey(JSON.parse(storedKey));
            } else {
                // Generate new key for this session
                this.encryptionKey = await CryptoService.generateKey();
                const jwk = await CryptoService.exportKey(this.encryptionKey);
                sessionStorage.setItem('log_encryption_key', JSON.stringify(jwk));
            }

            this.isInitialized = true;
            console.log('LogService initialized with encryption');
        } catch (error) {
            console.error('Failed to initialize LogService:', error);
            this.isInitialized = false;
        }
    }

    /**
     * Log an action with specified level and details
     */
    async log(
        level: LogLevel,
        action: string,
        userId?: string,
        userEmail?: string,
        details?: Record<string, any>
    ): Promise<void> {
        if (!this.isInitialized || !this.encryptionKey) {
            console.warn('LogService not initialized, skipping log');
            return;
        }

        try {
            // Create structured log
            const log: StructuredLog = {
                id: this.generateId(),
                timestamp: new Date().toISOString(),
                level,
                action,
                userId: userId ? await CryptoService.anonymize(userId) : undefined,
                userEmail: userEmail ? await this.anonymizeEmail(userEmail) : undefined,
                details: this.sanitizeDetails(details),
                encrypted: true
            };

            // Generate hash for integrity
            const logString = JSON.stringify(log);
            log.hash = await CryptoService.hash(logString);

            // Encrypt log
            const { encrypted, iv } = await CryptoService.encrypt(
                JSON.stringify(log),
                this.encryptionKey
            );

            // Store encrypted log
            LogStorage.storeLog({
                encrypted,
                iv,
                timestamp: log.timestamp,
                level: log.level
            });
        } catch (error) {
            console.error('Failed to log action:', error);
        }
    }

    /**
     * Convenience methods for different log levels
     */
    async info(action: string, userId?: string, userEmail?: string, details?: Record<string, any>) {
        return this.log(LogLevel.INFO, action, userId, userEmail, details);
    }

    async warning(action: string, userId?: string, userEmail?: string, details?: Record<string, any>) {
        return this.log(LogLevel.WARNING, action, userId, userEmail, details);
    }

    async error(action: string, userId?: string, userEmail?: string, details?: Record<string, any>) {
        return this.log(LogLevel.ERROR, action, userId, userEmail, details);
    }

    async critical(action: string, userId?: string, userEmail?: string, details?: Record<string, any>) {
        return this.log(LogLevel.CRITICAL, action, userId, userEmail, details);
    }

    /**
     * Retrieve and decrypt all logs
     */
    async getLogs(): Promise<StructuredLog[]> {
        if (!this.encryptionKey) {
            throw new Error('LogService not initialized');
        }

        const storedLogs = LogStorage.getLogs();
        const decryptedLogs: StructuredLog[] = [];

        for (const stored of storedLogs) {
            try {
                const decrypted = await CryptoService.decrypt(
                    stored.encrypted,
                    stored.iv,
                    this.encryptionKey
                );
                const log: StructuredLog = JSON.parse(decrypted);

                // Verify hash if present
                if (log.hash) {
                    const logWithoutHash = { ...log };
                    delete logWithoutHash.hash;
                    const computedHash = await CryptoService.hash(JSON.stringify(logWithoutHash));

                    if (computedHash !== log.hash) {
                        console.warn(`Log integrity check failed for ${log.id}`);
                    }
                }

                decryptedLogs.push(log);
            } catch (error) {
                console.error('Failed to decrypt log:', error);
            }
        }

        return decryptedLogs;
    }

    /**
     * Export all logs (encrypted) as JSON file
     */
    exportLogs(): void {
        const data = LogStorage.exportLogs();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `tecagenda-logs-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Get log statistics
     */
    async getStatistics(): Promise<{
        total: number;
        byLevel: Record<LogLevel, number>;
        byAction: Record<string, number>;
    }> {
        const logs = await this.getLogs();

        const byLevel: Record<LogLevel, number> = {
            [LogLevel.INFO]: 0,
            [LogLevel.WARNING]: 0,
            [LogLevel.ERROR]: 0,
            [LogLevel.CRITICAL]: 0
        };

        const byAction: Record<string, number> = {};

        logs.forEach(log => {
            byLevel[log.level]++;
            byAction[log.action] = (byAction[log.action] || 0) + 1;
        });

        return {
            total: logs.length,
            byLevel,
            byAction
        };
    }

    /**
     * Clear all logs (use with caution)
     */
    clearLogs(): void {
        if (confirm('Tem certeza que deseja limpar TODOS os logs? Esta ação não pode ser desfeita.')) {
            LogStorage.clearAll();
        }
    }

    // Private helper methods

    private generateId(): string {
        return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private async anonymizeEmail(email: string): Promise<string> {
        const [local, domain] = email.split('@');
        if (!domain) return await CryptoService.anonymize(email);

        // Show first 2 chars + last 2 chars of local part, hash the rest
        const visibleLocal = local.length > 4
            ? `${local.substring(0, 2)}***${local.substring(local.length - 2)}`
            : '***';

        return `${visibleLocal}@${domain}`;
    }

    private sanitizeDetails(details?: Record<string, any>): Record<string, any> | undefined {
        if (!details) return undefined;

        const sanitized: Record<string, any> = {};
        const sensitiveKeys = ['password', 'token', 'secret', 'key', 'ssn', 'cpf', 'creditCard'];

        Object.keys(details).forEach(key => {
            const lowerKey = key.toLowerCase();
            const isSensitive = sensitiveKeys.some(sk => lowerKey.includes(sk));

            if (isSensitive) {
                sanitized[key] = '[REDACTED]';
            } else {
                sanitized[key] = details[key];
            }
        });

        return sanitized;
    }
}

// Export singleton instance
export const logService = LogService.getInstance();
