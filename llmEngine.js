/**
 * Local LLM Improvement Engine
 * Powered by Transformers.js with multi-source fallback support
 */

import { MODEL_CONFIGS, MODEL_TIERS, MODEL_VERSION, CACHE_KEYS } from './src/constants/models.js';
import { modelCacheService } from './src/services/modelCache.js';
import { networkDetector } from './src/services/networkDetector.js';

let llmWorker = null;
let currentModelPath = null;
let currentTier = null;
let isLoaded = false;
let onProgressCallback = null;
let onStreamCallback = null;
let onStatusCallback = null;

// Initialize the Web Worker
if (window.Worker) {
    llmWorker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });

    llmWorker.onmessage = (event) => {
        const { type, payload } = event.data;

        switch (type) {
            case 'DOWNLOAD_PROGRESS':
                if (onProgressCallback && payload) {
                    onProgressCallback({
                        percent: payload.progress || 0,
                        downloadedMB: payload.downloadedMB || 0,
                        totalMB: payload.totalMB || 0,
                        status: payload.status || 'downloading',
                        source: payload.source || 'unknown',
                        sourceIndex: payload.sourceIndex || 1
                    });
                }
                break;
                
            case 'MODEL_STATUS':
                if (onStatusCallback && payload) {
                    onStatusCallback(payload);
                }
                break;
                
            case 'MODEL_READY':
                isLoaded = true;
                if (payload?.fallbackUsed) {
                    localStorage.setItem(CACHE_KEYS.FALLBACK_USED, 'true');
                    if (onStatusCallback) {
                        onStatusCallback({
                            type: 'fallback-loaded',
                            message: `Mode dégradé activé — ${payload.modelId} chargé`
                        });
                    }
                }
                if (onProgressCallback) {
                    onProgressCallback({ percent: 100, status: 'ready' });
                }
                if (payload?.modelId) {
                    currentModelPath = payload.modelId;
                    localStorage.setItem(CACHE_KEYS.MODEL_CACHED, 'true');
                    localStorage.setItem(CACHE_KEYS.LAST_MODEL_LOAD, new Date().toISOString());
                }
                break;
                
            case 'MODEL_ERROR':
                console.error('Worker Model Error:', payload);
                isLoaded = false;
                if (onStatusCallback) {
                    onStatusCallback({
                        type: 'load-error',
                        message: payload,
                        error: true
                    });
                }
                break;
                
            case 'GENERATE_STREAM':
                if (onStreamCallback) {
                    onStreamCallback(payload);
                }
                break;
                
            case 'GENERATE_COMPLETE':
                // Handled by promise resolution
                break;
                
            case 'GENERATE_ERROR':
                console.error('Worker Generation Error:', payload);
                break;
                
            case 'CACHE_CLEARED':
                console.log('Cache cleared:', payload);
                currentModelPath = null;
                currentTier = null;
                isLoaded = false;
                break;
                
            case 'CACHE_ERROR':
                console.error('Worker Cache Error:', payload);
                break;
                
            case 'CACHE_STATS':
                console.log('Cache stats:', payload);
                break;
                
            case 'LOAD_ABORTED':
                console.log('Load aborted');
                isLoaded = false;
                break;
        }
    };

    llmWorker.onerror = (error) => {
        console.error('LLM Worker Error:', error);
        isLoaded = false;
    };
} else {
    console.error('Web Workers are not supported in this browser.');
}

/**
 * Initialize the pipeline with a specific model tier
 * @param {string} tier - Model tier (free, pro, mobile)
 * @param {Function} progressCallback - Called with loading progress
 * @param {Function} statusCallback - Called with status messages
 */
export const initLLMWithTier = async (tier, progressCallback, statusCallback) => {
    if (!llmWorker) {
        throw new Error('LLM Worker not available.');
    }

    const config = MODEL_CONFIGS[tier];
    if (!config) {
        throw new Error(`Unknown model tier: ${tier}`);
    }

    // Check if cache is outdated and clear if necessary
    if (modelCacheService.isCacheOutdated()) {
        if (statusCallback) {
            statusCallback({
                type: 'cache-outdated',
                message: 'Cache obsolète détecté, nettoyage en cours...'
            });
        }
        await clearAllModelCaches();
    }

    onProgressCallback = progressCallback;
    onStatusCallback = statusCallback;
    currentTier = tier;
    isLoaded = false;

    // Check network status
    const networkCheck = networkDetector.canDownload(config.sizeMB);
    
    if (!networkCheck.canDownload && !networkCheck.requireConfirmation) {
        // Try loading from cache only
        if (statusCallback) {
            statusCallback({
                type: 'offline-mode',
                message: networkCheck.message
            });
        }
    }

    return new Promise((resolve, reject) => {
        const messageHandler = (event) => {
            if (event.data.type === 'MODEL_READY') {
                llmWorker.removeEventListener('message', messageHandler);
                currentModelPath = event.data.payload?.modelId || config.id;
                resolve({
                    success: true,
                    modelId: currentModelPath,
                    fallbackUsed: event.data.payload?.fallbackUsed || false
                });
            } else if (event.data.type === 'MODEL_ERROR') {
                llmWorker.removeEventListener('message', messageHandler);
                reject(new Error(event.data.payload));
            }
        };
        
        llmWorker.addEventListener('message', messageHandler);
        
        // Send init message with full source configuration
        llmWorker.postMessage({ 
            type: 'INIT_MODEL', 
            payload: { 
                modelPath: config.id,
                task: config.task,
                sources: config.sources,
                fallback: config.fallback
            } 
        });
    });
};

/**
 * Initialize the pipeline with a specific model path (legacy support)
 * @param {string} modelPath - HuggingFace model path
 * @param {Function} progressCallback - Called with loading progress %
 */
export const initLLM = async (modelPath, progressCallback) => {
    if (!llmWorker) {
        throw new Error('LLM Worker not available.');
    }
    
    // Re-initialize if the model changed
    if (isLoaded && currentModelPath === modelPath) return true;

    onProgressCallback = progressCallback;
    currentModelPath = modelPath;
    isLoaded = false;

    return new Promise((resolve, reject) => {
        const messageHandler = (event) => {
            if (event.data.type === 'MODEL_READY') {
                llmWorker.removeEventListener('message', messageHandler);
                resolve(true);
            } else if (event.data.type === 'MODEL_ERROR') {
                llmWorker.removeEventListener('message', messageHandler);
                reject(new Error(event.data.payload));
            }
        };
        llmWorker.addEventListener('message', messageHandler);
        llmWorker.postMessage({ type: 'INIT_MODEL', payload: { modelPath } });
    });
};

/**
 * Improve a prompt using the loaded model with optional streaming support
 * @param {string} prompt - The user's original prompt
 * @param {string} lang - The current language code
 * @param {Object} heuristics - Optional result from heuristic analysis to guide the model
 * @param {Function} onStream - Optional callback for streaming updates
 */
export const improvePromptLocal = async (prompt, lang = 'en', heuristics = null, onStream = null) => {
    if (!llmWorker || !isLoaded) {
        throw new Error('LLM Worker not available or model not initialized.');
    }

    onStreamCallback = onStream; // Set the streaming callback for this generation request

    let inputPrompt = '';
    const langNames = { 
        en: 'English', 
        fr: 'French', 
        es: 'Spanish',
        de: 'German',
        ar: 'Arabic',
        hi: 'Hindi',
        zh: 'Chinese',
        ja: 'Japanese'
    };
    const currentLangName = langNames[lang] || 'English';
    
    // Create targeted instructions based on missing heuristics
    let targetedInstructions = '';
    if (heuristics && heuristics.issues && heuristics.issues.length > 0) {
        targetedInstructions = " Specifically address these issues: " + heuristics.issues.join(", ");
    }

    const systemPrompt = `You are a world-class Prompt Engineer. Your task is to rewrite the user's prompt to be highly effective, structured, and clear.\nFollow these rules:\n1. Preserve the original meaning and language (${currentLangName}).\n2. Add a clear Persona (e.g., "You are an expert...").\n3. Provide Context and background information.\n4. Specify a clear Output Format (e.g., "Return the result as a Markdown table").\n5. List specific Constraints to avoid generic or low-quality results.${targetedInstructions}`;

    // Different formatting based on model type
    if (currentModelPath.includes('TinyLlama') || currentModelPath.includes('SmolLM')) {
        inputPrompt = `<|system|>\n${systemPrompt}</s>\n<|user|>\nImprove this ${currentLangName} prompt: "${prompt}"</s>\n<|assistant|>\n`;
    } else if (currentModelPath.includes('Phi-3') || currentModelPath.includes('Qwen2')) {
        inputPrompt = `<|user|>\n${systemPrompt}\n\nOriginal prompt: "${prompt}"\n<|assistant|>\n`;
    } else {
        // Simple fallback (DistilGPT2)
        inputPrompt = `Instruction: ${systemPrompt}\nOriginal: "${prompt}"\nImproved: `;
    }

    return new Promise((resolve, reject) => {
        const messageHandler = (event) => {
            if (event.data.type === 'GENERATE_COMPLETE') {
                llmWorker.removeEventListener('message', messageHandler);
                resolve(event.data.payload.trim());
            } else if (event.data.type === 'GENERATE_ERROR') {
                llmWorker.removeEventListener('message', messageHandler);
                reject(new Error(event.data.payload));
            }
        };
        llmWorker.addEventListener('message', messageHandler);
        llmWorker.postMessage({ type: 'GENERATE', payload: { prompt: inputPrompt } });
    });
};

export const isLLMLoaded = () => isLoaded;

/**
 * Delete specific or all Transformer.js models from browser cache
 * Communicates with the worker to clear the IndexedDB cache
 * @param {string} [modelPath] - Optional path of the specific model to delete
 */
export const clearModelCache = async (modelPath = null) => {
    if (!llmWorker) {
        throw new Error('LLM Worker not available.');
    }

    return new Promise((resolve, reject) => {
        const messageHandler = (event) => {
            if (event.data.type === 'CACHE_CLEARED') {
                llmWorker.removeEventListener('message', messageHandler);
                currentModelPath = null;
                currentTier = null;
                isLoaded = false;
                console.log('Model cache cleared successfully.');
                resolve(event.data.payload);
            } else if (event.data.type === 'CACHE_ERROR') {
                llmWorker.removeEventListener('message', messageHandler);
                reject(new Error(event.data.payload?.errors?.join(', ') || event.data.payload));
            }
        };
        llmWorker.addEventListener('message', messageHandler);
        llmWorker.postMessage({ type: 'CLEAR_CACHE', payload: { modelPath, clearAll: !modelPath } });
    });
};

/**
 * Clear all model caches (Cache API + IndexedDB + localStorage)
 * @returns {Promise<Object>} Report of cleared caches
 */
export const clearAllModelCaches = async () => {
    // Clear worker caches
    const workerReport = await clearModelCache(null);
    
    // Clear main thread caches via modelCacheService
    const mainReport = await modelCacheService.clearAllModels();
    
    // Update version after clearing
    modelCacheService.updateCachedVersion();
    
    return {
        ...workerReport,
        ...mainReport,
        success: workerReport.success && mainReport.success
    };
};

/**
 * Get cache statistics
 */
export const getCacheStats = async () => {
    if (!llmWorker) {
        return modelCacheService.getCacheStats();
    }

    return new Promise((resolve) => {
        const messageHandler = (event) => {
            if (event.data.type === 'CACHE_STATS') {
                llmWorker.removeEventListener('message', messageHandler);
                resolve(event.data.payload);
            }
        };
        llmWorker.addEventListener('message', messageHandler);
        llmWorker.postMessage({ type: 'GET_CACHE_STATS' });
        
        // Fallback timeout
        setTimeout(() => {
            llmWorker.removeEventListener('message', messageHandler);
            resolve(modelCacheService.getCacheStats());
        }, 5000);
    });
};

/**
 * Abort current model load
 */
export const abortModelLoad = () => {
    if (llmWorker) {
        llmWorker.postMessage({ type: 'ABORT_LOAD' });
    }
};

/**
 * Get current model tier
 */
export const getCurrentTier = () => currentTier;

/**
 * Get current model path
 */
export const getCurrentModelPath = () => currentModelPath;

/**
 * Check if fallback is currently active
 */
export const isFallbackActive = () => localStorage.getItem(CACHE_KEYS.FALLBACK_USED) === 'true';

/**
 * Get fallback info
 */
export const getFallbackInfo = () => {
    const info = localStorage.getItem(CACHE_KEYS.FALLBACK_REASON);
    return info ? JSON.parse(info) : null;
};

// Re-export utilities for external use
export { MODEL_CONFIGS, MODEL_TIERS, MODEL_VERSION } from './src/constants/models.js';
export { modelCacheService } from './src/services/modelCache.js';
export { networkDetector } from './src/services/networkDetector.js';
