/**
 * Model Status UI Component
 * Displays model loading progress, status messages, and cache management
 */

import { i18n } from '../../i18n.js';
import { clearAllModelCaches, getCacheStats, getCurrentTier, isFallbackActive, getFallbackInfo } from '../../llmEngine.js';

export class ModelStatusUI {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            showCacheButton: true,
            showRetryButton: true,
            lang: 'en',
            onRetry: null,
            ...options
        };
        this.currentStatus = null;
        this.progress = 0;
    }

    /**
     * Get translated text
     */
    t(key) {
        const lang = this.options.lang;
        return i18n[lang]?.ui[key] || i18n.en.ui[key] || key;
    }

    /**
     * Update progress bar
     */
    updateProgress(progressData) {
        this.progress = progressData.percent || 0;
        const progressBar = this.container.querySelector('.model-progress-bar');
        const progressText = this.container.querySelector('.model-progress-text');
        const sourceInfo = this.container.querySelector('.model-source-info');

        if (progressBar) {
            progressBar.style.width = `${this.progress}%`;
        }

        if (progressText) {
            if (progressData.status === 'cached') {
                progressText.textContent = `✅ ${this.t('modelLoaded')}`;
            } else if (progressData.status === 'fallback') {
                progressText.textContent = `⚠️ ${this.t('fallbackMode') || 'Mode dégradé activé'}`;
            } else if (progressData.status === 'ready') {
                progressText.textContent = `✅ ${this.t('modelLoaded')}`;
            } else {
                const downloadedMB = progressData.downloadedMB?.toFixed(1) || '?';
                const totalMB = progressData.totalMB?.toFixed(1) || '?';
                progressText.textContent = `${this.t('downloadingModel')}... ${downloadedMB} / ${totalMB} MB`;
            }
        }

        if (sourceInfo && progressData.source) {
            sourceInfo.textContent = `Source: ${progressData.source}`;
        }
    }

    /**
     * Update status message (toast-like notifications)
     */
    updateStatus(statusData) {
        this.currentStatus = statusData;
        const statusEl = this.container.querySelector('.model-status-message');
        
        if (!statusEl) return;

        const messageClass = statusData.error ? 'status-error' : 
                            statusData.warn ? 'status-warning' : 
                            statusData.type === 'fallback-loaded' ? 'status-warning' : 'status-info';

        statusEl.className = `model-status-message ${messageClass}`;
        statusEl.textContent = statusData.message || '';
        statusEl.style.display = statusData.message ? 'block' : 'none';

        // Auto-hide non-error messages after 5 seconds
        if (!statusData.error && statusData.type !== 'fallback-loaded') {
            setTimeout(() => {
                statusEl.style.display = 'none';
            }, 5000);
        }
    }

    /**
     * Show error state with retry button
     */
    showError(errorMessage) {
        const errorEl = this.container.querySelector('.model-error-container');
        const errorMsg = this.container.querySelector('.model-error-message');
        const retryBtn = this.container.querySelector('.model-retry-btn');

        if (errorEl) {
            errorEl.style.display = 'block';
        }

        if (errorMsg) {
            errorMsg.textContent = errorMessage;
        }

        if (retryBtn && this.options.onRetry) {
            retryBtn.style.display = 'block';
            retryBtn.onclick = () => {
                this.hideError();
                this.options.onRetry();
            };
        }
    }

    /**
     * Hide error state
     */
    hideError() {
        const errorEl = this.container.querySelector('.model-error-container');
        if (errorEl) {
            errorEl.style.display = 'none';
        }
    }

    /**
     * Update cache info display
     */
    async updateCacheInfo() {
        const cacheInfoEl = this.container.querySelector('.model-cache-info');
        
        if (!cacheInfoEl) return;

        try {
            const stats = await getCacheStats();
            cacheInfoEl.textContent = `Cache: ${stats.totalSizeMB.toFixed(1)} MB (${stats.entryCount} fichiers)`;
        } catch (error) {
            cacheInfoEl.textContent = 'Cache: Information non disponible';
        }
    }

    /**
     * Show fallback mode indicator
     */
    showFallbackIndicator() {
        const indicator = this.container.querySelector('.fallback-indicator');
        if (indicator) {
            indicator.style.display = 'flex';
            
            const info = getFallbackInfo();
            if (info) {
                indicator.title = `Original: ${info.originalModel}\nFallback: ${info.fallbackModel}\nDate: ${info.date}`;
            }
        }
    }

    /**
     * Hide fallback mode indicator
     */
    hideFallbackIndicator() {
        const indicator = this.container.querySelector('.fallback-indicator');
        if (indicator) {
            indicator.style.display = 'none';
        }
    }

    /**
     * Handle clear cache button click
     */
    async handleClearCache() {
        const confirmMsg = this.t('confirmDeleteCache')?.('all models') || 
            'Are you sure you want to delete all cached models?';
        
        if (!confirm(confirmMsg)) return;

        try {
            const clearBtn = this.container.querySelector('.model-clear-cache-btn');
            if (clearBtn) {
                clearBtn.disabled = true;
                clearBtn.textContent = 'Clearing...';
            }

            const report = await clearAllModelCaches();
            
            console.log('Cache cleared:', report);
            
            if (report.success) {
                const successMsg = `🗑️ Cache cleared! ${report.totalSizeClearedMB.toFixed(1)} MB freed.`;
                this.updateStatus({ message: successMsg, type: 'cache-cleared' });
            } else {
                this.updateStatus({ 
                    message: `Partial clear: ${report.errors.length} errors`, 
                    error: true 
                });
            }

            await this.updateCacheInfo();
        } catch (error) {
            this.updateStatus({ message: error.message, error: true });
        } finally {
            const clearBtn = this.container.querySelector('.model-clear-cache-btn');
            if (clearBtn) {
                clearBtn.disabled = false;
                clearBtn.textContent = this.t('deleteCacheBtn');
            }
        }
    }

    /**
     * Render the component
     */
    render() {
        this.container.innerHTML = `
            <div class="model-status-container">
                <!-- Progress Section -->
                <div class="model-progress-section">
                    <div class="model-progress-bar-container">
                        <div class="model-progress-bar" style="width: 0%"></div>
                    </div>
                    <div class="model-progress-text">${this.t('downloadingModel')}...</div>
                    <div class="model-source-info text-xs text-gray-500"></div>
                </div>

                <!-- Status Messages -->
                <div class="model-status-message" style="display: none;"></div>

                <!-- Fallback Indicator -->
                <div class="fallback-indicator bg-yellow-100 text-yellow-800 px-3 py-2 rounded text-sm" style="display: none;">
                    ⚠️ Mode dégradé actif — modèle de secours en cours d'utilisation
                </div>

                <!-- Error Section -->
                <div class="model-error-container bg-red-50 border border-red-200 rounded p-4" style="display: none;">
                    <div class="model-error-message text-red-700"></div>
                    ${this.options.showRetryButton ? `
                        <button class="model-retry-btn btn-primary mt-3">
                            🔄 ${this.t('retryBtn') || 'Réessayer'}
                        </button>
                    ` : ''}
                </div>

                <!-- Cache Management -->
                ${this.options.showCacheButton ? `
                    <div class="model-cache-section mt-4 pt-4 border-t border-gray-200">
                        <div class="model-cache-info text-sm text-gray-600 mb-2"></div>
                        <button class="model-clear-cache-btn btn-secondary text-sm">
                            🗑️ ${this.t('deleteCacheBtn')}
                        </button>
                    </div>
                ` : ''}
            </div>

            <style>
                .model-progress-bar-container {
                    width: 100%;
                    height: 8px;
                    background: #e5e7eb;
                    border-radius: 4px;
                    overflow: hidden;
                }
                
                .model-progress-bar {
                    height: 100%;
                    background: linear-gradient(90deg, #3b82f6, #8b5cf6);
                    transition: width 0.3s ease;
                }
                
                .model-progress-text {
                    font-size: 0.875rem;
                    color: #6b7280;
                    margin-top: 0.5rem;
                }
                
                .model-status-message {
                    padding: 0.75rem 1rem;
                    border-radius: 0.5rem;
                    margin-top: 0.75rem;
                    font-size: 0.875rem;
                }
                
                .model-status-message.status-info {
                    background: #eff6ff;
                    color: #1e40af;
                    border: 1px solid #bfdbfe;
                }
                
                .model-status-message.status-warning {
                    background: #fffbeb;
                    color: #92400e;
                    border: 1px solid #fcd34d;
                }
                
                .model-status-message.status-error {
                    background: #fef2f2;
                    color: #991b1b;
                    border: 1px solid #fecaca;
                }
                
                .model-status-message.status-success {
                    background: #f0fdf4;
                    color: #166534;
                    border: 1px solid #bbf7d0;
                }
                
                .fallback-indicator {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-top: 0.75rem;
                }
                
                .btn-primary {
                    background: #3b82f6;
                    color: white;
                    padding: 0.5rem 1rem;
                    border-radius: 0.5rem;
                    border: none;
                    cursor: pointer;
                    font-weight: 500;
                }
                
                .btn-primary:hover {
                    background: #2563eb;
                }
                
                .btn-primary:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                
                .btn-secondary {
                    background: #f3f4f6;
                    color: #374151;
                    padding: 0.5rem 1rem;
                    border-radius: 0.5rem;
                    border: 1px solid #d1d5db;
                    cursor: pointer;
                }
                
                .btn-secondary:hover {
                    background: #e5e7eb;
                }
                
                .btn-secondary:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
            </style>
        `;

        // Bind events
        const clearBtn = this.container.querySelector('.model-clear-cache-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.handleClearCache());
        }

        // Initial cache info
        this.updateCacheInfo();

        // Check for fallback mode
        if (isFallbackActive()) {
            this.showFallbackIndicator();
        }

        return this.container;
    }

    /**
     * Destroy the component
     */
    destroy() {
        this.container.innerHTML = '';
    }
}

export default ModelStatusUI;
