/**
 * Model Loader Service
 * Handles multi-source fallback model loading with timeout and error handling
 */

import { MODEL_CONFIGS, SOURCE_TIMEOUT, CACHE_KEYS } from '../constants/models.js';
import { networkDetector } from './networkDetector.js';

export class ModelLoader {
    constructor() {
        this.currentLoadAttempt = null;
        this.abortController = null;
    }

    /**
     * Load a model with multi-source fallback
     * @param {string} tier - Model tier (free, pro, mobile)
     * @param {Function} progressCallback - Progress callback function
     * @param {Function} statusCallback - Status message callback
     * @returns {Promise<{success: boolean, modelId: string, source: string, fallbackUsed: boolean}>}
     */
    async loadModelWithFallback(tier, progressCallback = null, statusCallback = null) {
        const config = MODEL_CONFIGS[tier];
        
        if (!config) {
            throw new Error(`Unknown model tier: ${tier}`);
        }

        // Check network before attempting download
        const networkCheck = networkDetector.canDownload(config.sizeMB);
        
        if (!networkCheck.canDownload && !networkCheck.requireConfirmation) {
            // Offline or blocked connection
            if (statusCallback) {
                statusCallback({
                    type: 'network-blocked',
                    message: networkCheck.message,
                    reason: networkCheck.reason
                });
            }
            
            // Try to load from cache only
            const cachedResult = await this.tryLoadFromCache(tier, progressCallback, statusCallback);
            if (cachedResult.success) {
                return cachedResult;
            }
            
            throw new Error(networkCheck.message);
        }

        if (networkCheck.warn && statusCallback) {
            statusCallback({
                type: 'network-warning',
                message: networkCheck.message,
                warn: true
            });
        }

        // Try each source in order
        for (let i = 0; i < config.sources.length; i++) {
            const source = config.sources[i];
            
            if (statusCallback) {
                statusCallback({
                    type: 'source-attempt',
                    message: `Tentative de chargement depuis ${this.getSourceLabel(source.type)}...`,
                    sourceIndex: i + 1,
                    totalSources: config.sources.length
                });
            }

            try {
                const result = await this.tryLoadFromSource(
                    source, 
                    config, 
                    i, 
                    progressCallback, 
                    statusCallback
                );
                
                if (result.success) {
                    localStorage.setItem(CACHE_KEYS.CURRENT_TIER, tier);
                    return result;
                }
            } catch (error) {
                console.warn(`[ModelLoader] Source ${i + 1} failed:`, error.message);
                
                if (statusCallback) {
                    statusCallback({
                        type: 'source-failed',
                        message: `Source ${this.getSourceLabel(source.type)} indisponible, tentative suivante...`,
                        sourceIndex: i + 1,
                        error: error.message
                    });
                }
            }
        }

        // All primary sources failed, try fallback
        if (statusCallback) {
            statusCallback({
                type: 'fallback-attempt',
                message: `Mode dégradé activé — chargement de ${config.fallback.name}...`
            });
        }

        try {
            const fallbackResult = await this.loadFallbackModel(config, progressCallback, statusCallback);
            
            // Store fallback info
            localStorage.setItem(CACHE_KEYS.FALLBACK_USED, 'true');
            localStorage.setItem(CACHE_KEYS.FALLBACK_REASON, JSON.stringify({
                reason: 'All primary sources failed',
                date: new Date().toISOString(),
                originalModel: config.id,
                fallbackModel: config.fallback.id
            }));
            
            return fallbackResult;
        } catch (fallbackError) {
            console.error('[ModelLoader] Fallback also failed:', fallbackError);
            
            if (statusCallback) {
                statusCallback({
                    type: 'load-failed',
                    message: 'Impossible de charger le modèle. Vérifiez votre connexion ou réessayez plus tard.',
                    error: fallbackError.message
                });
            }
            
            throw new Error('Toutes les sources ont échoué. Impossible de charger le modèle.');
        }
    }

    /**
     * Try loading from a specific source with timeout
     */
    async tryLoadFromSource(source, config, sourceIndex, progressCallback, statusCallback) {
        return new Promise(async (resolve, reject) => {
            const timeoutId = setTimeout(() => {
                reject(new Error(`Timeout after ${SOURCE_TIMEOUT}ms`));
            }, SOURCE_TIMEOUT);

            try {
                if (progressCallback) {
                    progressCallback({
                        modelId: config.id,
                        source: source.url,
                        sourceIndex: sourceIndex + 1,
                        totalSources: config.sources.length,
                        percent: 0,
                        downloadedMB: 0,
                        totalMB: config.sizeMB,
                        status: 'downloading'
                    });
                }

                // The actual loading will be done by the worker
                // This service just orchestrates the source selection
                clearTimeout(timeoutId);
                
                resolve({
                    success: true,
                    modelId: config.id,
                    source: source.url,
                    sourceType: source.type,
                    sourceIndex: sourceIndex + 1,
                    fallbackUsed: false
                });
            } catch (error) {
                clearTimeout(timeoutId);
                reject(error);
            }
        });
    }

    /**
     * Load the fallback model
     */
    async loadFallbackModel(config, progressCallback, statusCallback) {
        const fallbackConfig = config.fallback;
        
        if (progressCallback) {
            progressCallback({
                modelId: fallbackConfig.id,
                source: 'fallback',
                sourceIndex: 0,
                totalSources: 1,
                percent: 0,
                downloadedMB: 0,
                totalMB: fallbackConfig.sizeMB,
                status: 'fallback'
            });
        }

        return {
            success: true,
            modelId: fallbackConfig.id,
            source: 'fallback',
            sourceType: 'fallback',
            sourceIndex: 0,
            fallbackUsed: true
        };
    }

    /**
     * Try loading from cache only
     */
    async tryLoadFromCache(tier, progressCallback, statusCallback) {
        if (statusCallback) {
            statusCallback({
                type: 'cache-attempt',
                message: 'Tentative de chargement depuis le cache local...'
            });
        }

        // Check if model is cached
        const cached = localStorage.getItem(CACHE_KEYS.MODEL_CACHED);
        
        if (cached) {
            const config = MODEL_CONFIGS[tier];
            
            if (progressCallback) {
                progressCallback({
                    modelId: config.id,
                    source: 'cache',
                    sourceIndex: 0,
                    totalSources: 1,
                    percent: 100,
                    downloadedMB: config.sizeMB,
                    totalMB: config.sizeMB,
                    status: 'cached'
                });
            }

            return {
                success: true,
                modelId: config.id,
                source: 'cache',
                sourceType: 'cache',
                sourceIndex: 0,
                fallbackUsed: false
            };
        }

        return { success: false };
    }

    /**
     * Get human-readable source label
     */
    getSourceLabel(sourceType) {
        const labels = {
            'huggingface': 'HuggingFace',
            'cdn-lfs': 'CDN LFS',
            'huggingface-resolve': 'HuggingFace Direct',
            'mirror': 'Miroir communautaire',
            'fallback': 'Modèle de secours',
            'cache': 'Cache local'
        };
        
        return labels[sourceType] || sourceType;
    }

    /**
     * Get ordered source list for a tier
     */
    getSourceList(tier) {
        const config = MODEL_CONFIGS[tier];
        if (!config) return [];
        
        return config.sources.map((source, index) => ({
            ...source,
            label: this.getSourceLabel(source.type),
            index: index + 1
        }));
    }

    /**
     * Cancel current load attempt
     */
    cancelLoad() {
        if (this.abortController) {
            this.abortController.abort();
            this.abortController = null;
        }
        
        this.currentLoadAttempt = null;
    }
}

export const modelLoader = new ModelLoader();
