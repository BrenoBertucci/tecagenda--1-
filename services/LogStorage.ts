/**
 * LogStorage - Persistent encrypted log storage using LocalStorage
 * Handles log rotation, archiving, and export functionality
 */

interface StoredLog {
    encrypted: string;
    iv: string;
    timestamp: string;
    level: string;
}

interface LogArchive {
    logs: StoredLog[];
    archivedAt: string;
    count: number;
}

export class LogStorage {
    private static MAIN_LOGS_KEY = 'tecagenda_logs';
    private static ARCHIVE_PREFIX = 'tecagenda_logs_archive_';
    private static MAX_LOGS_PER_SESSION = 1000;
    private static MAX_ARCHIVES = 5;

    /**
     * Store encrypted log entry
     */
    static storeLog(encryptedLog: StoredLog): void {
        const logs = this.getLogs();
        logs.push(encryptedLog);

        // Check if rotation is needed
        if (logs.length >= this.MAX_LOGS_PER_SESSION) {
            this.rotateLogs(logs);
        } else {
            this.saveLogs(logs);
        }
    }

    /**
     * Get all stored logs
     */
    static getLogs(): StoredLog[] {
        try {
            const stored = localStorage.getItem(this.MAIN_LOGS_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Failed to load logs:', error);
            return [];
        }
    }

    /**
     * Save logs to storage
     */
    private static saveLogs(logs: StoredLog[]): void {
        try {
            localStorage.setItem(this.MAIN_LOGS_KEY, JSON.stringify(logs));
        } catch (error) {
            console.error('Failed to save logs:', error);
            // If quota exceeded, force rotation
            if (error instanceof Error && error.name === 'QuotaExceededError') {
                this.rotateLogs(logs);
            }
        }
    }

    /**
     * Rotate logs: archive old logs and keep recent ones
     */
    private static rotateLogs(logs: StoredLog[]): void {
        const archive: LogArchive = {
            logs: logs.slice(0, -500), // Archive older half
            archivedAt: new Date().toISOString(),
            count: logs.length - 500
        };

        // Save archive
        const archiveKey = `${this.ARCHIVE_PREFIX}${Date.now()}`;
        try {
            localStorage.setItem(archiveKey, JSON.stringify(archive));

            // Clean old archives if limit exceeded
            this.cleanOldArchives();

            // Keep only recent 500 logs
            this.saveLogs(logs.slice(-500));
        } catch (error) {
            console.error('Failed to rotate logs:', error);
            // Last resort: clear oldest logs
            this.saveLogs(logs.slice(-500));
        }
    }

    /**
     * Clean old archives, keeping only MAX_ARCHIVES
     */
    private static cleanOldArchives(): void {
        const archives = this.getArchiveKeys();
        if (archives.length > this.MAX_ARCHIVES) {
            // Remove oldest archives
            const toRemove = archives.slice(0, archives.length - this.MAX_ARCHIVES);
            toRemove.forEach(key => localStorage.removeItem(key));
        }
    }

    /**
     * Get all archive keys sorted by timestamp
     */
    private static getArchiveKeys(): string[] {
        const keys: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.ARCHIVE_PREFIX)) {
                keys.push(key);
            }
        }
        return keys.sort();
    }

    /**
     * Get all archived logs
     */
    static getArchives(): LogArchive[] {
        const archiveKeys = this.getArchiveKeys();
        const archives: LogArchive[] = [];

        archiveKeys.forEach(key => {
            try {
                const stored = localStorage.getItem(key);
                if (stored) {
                    archives.push(JSON.parse(stored));
                }
            } catch (error) {
                console.error(`Failed to load archive ${key}:`, error);
            }
        });

        return archives;
    }

    /**
     * Export all logs (current + archives) as JSON
     */
    static exportLogs(): { current: StoredLog[]; archives: LogArchive[] } {
        return {
            current: this.getLogs(),
            archives: this.getArchives()
        };
    }

    /**
     * Clear all logs (use with caution)
     */
    static clearAll(): void {
        localStorage.removeItem(this.MAIN_LOGS_KEY);

        const archiveKeys = this.getArchiveKeys();
        archiveKeys.forEach(key => localStorage.removeItem(key));
    }

    /**
     * Get total log count (current + archived)
     */
    static getTotalCount(): number {
        const current = this.getLogs().length;
        const archived = this.getArchives().reduce((sum, archive) => sum + archive.count, 0);
        return current + archived;
    }
}
