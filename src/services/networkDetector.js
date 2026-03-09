/**
 * Network Detection Service
 * Detects connection type, speed, and online status
 */

export class NetworkDetector {
    constructor() {
        this.connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        this.onStatusChange = null;
        
        this.setupListeners();
    }

    setupListeners() {
        window.addEventListener('online', () => {
            if (this.onStatusChange) {
                this.onStatusChange({ online: true, type: this.getConnectionType() });
            }
        });

        window.addEventListener('offline', () => {
            if (this.onStatusChange) {
                this.onStatusChange({ online: false, type: 'offline' });
            }
        });

        if (this.connection) {
            this.connection.addEventListener('change', () => {
                if (this.onStatusChange) {
                    this.onStatusChange({ 
                        online: navigator.onLine, 
                        type: this.getConnectionType() 
                    });
                }
            });
        }
    }

    isOnline() {
        return navigator.onLine;
    }

    getConnectionType() {
        if (!this.connection) {
            return 'unknown';
        }
        return this.connection.effectiveType || 'unknown';
    }

    getConnectionInfo() {
        return {
            online: this.isOnline(),
            type: this.getConnectionType(),
            downlink: this.connection?.downlink || null, // Mbps
            rtt: this.connection?.rtt || null, // ms
            saveData: this.connection?.saveData || false
        };
    }

    canDownload(modelSizeMB) {
        const info = this.getConnectionInfo();
        
        if (!info.online) {
            return { 
                canDownload: false, 
                reason: 'offline',
                message: 'Mode hors-ligne — modèle chargé depuis le cache local'
            };
        }

        if (info.type === 'slow-2g' || info.type === '2g') {
            return {
                canDownload: false,
                reason: 'slow-connection',
                message: `Connexion trop lente pour télécharger le modèle (${modelSizeMB} Mo). Continuer quand même ?`,
                requireConfirmation: true
            };
        }

        if (info.type === '3g') {
            return {
                canDownload: true,
                reason: 'medium-connection',
                message: `Connexion 3G détectée. Le téléchargement peut prendre du temps.`,
                warn: true
            };
        }

        return { canDownload: true, reason: 'ok' };
    }

    estimateDownloadTime(modelSizeMB) {
        const info = this.getConnectionInfo();
        
        if (!info.online || !info.downlink) {
            return null;
        }

        // downlink is in Mbps, convert to MB/s
        const speedMBps = info.downlink / 8;
        const estimatedSeconds = modelSizeMB / speedMBps;

        return {
            seconds: Math.round(estimatedSeconds),
            minutes: Math.round(estimatedSeconds / 60),
            human: this.formatTime(estimatedSeconds)
        };
    }

    formatTime(seconds) {
        if (seconds < 60) {
            return `${Math.round(seconds)} secondes`;
        } else if (seconds < 3600) {
            return `${Math.round(seconds / 60)} minutes`;
        } else {
            return `${Math.round(seconds / 3600)} heures`;
        }
    }
}

export const networkDetector = new NetworkDetector();
