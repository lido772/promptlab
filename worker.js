import { pipeline, env } from '@xenova/transformers';

// Configuration for local environments
env.allowLocalModels = false;
env.useBrowserCache = true; // Use IndexedDB

let generator = null;
let currentModelPath = null;
let currentModelTask = 'text-generation';
let loadAborted = false;

/**
 * Send progress update to main thread
 */
function sendProgress(payload) {
    self.postMessage({ type: 'DOWNLOAD_PROGRESS', payload });
}

/**
 * Send status message to main thread
 */
function sendStatus(payload) {
    self.postMessage({ type: 'MODEL_STATUS', payload });
}

/**
 * Attempt to load model from a specific source with timeout
 */
async function tryLoadFromSource(sourceUrl, task, timeoutMs = 8000) {
    return new Promise(async (resolve, reject) => {
        const timeoutId = setTimeout(() => {
            reject(new Error(`Timeout after ${timeoutMs}ms`));
        }, timeoutMs);

        try {
            const pipelineInstance = await pipeline(task, sourceUrl, {
                progress_callback: (info) => {
                    if (!loadAborted) {
                        sendProgress({
                            ...info,
                            source: sourceUrl,
                            status: info.status || 'downloading'
                        });
                    }
                }
            });
            
            clearTimeout(timeoutId);
            resolve(pipelineInstance);
        } catch (error) {
            clearTimeout(timeoutId);
            reject(error);
        }
    });
}

// Listen for messages from the main thread
self.addEventListener('message', async (event) => {
    const { type, payload } = event.data;

    if (type === 'INIT_MODEL') {
        const { modelPath, task = 'text-generation', sources = [], fallback = null } = payload;
        
        // Reset abort flag
        loadAborted = false;
        
        // Don't reinitialize if it's the same model
        if (generator && currentModelPath === modelPath) {
            self.postMessage({ type: 'MODEL_READY', payload: { cached: true } });
            return;
        }

        currentModelPath = modelPath;
        currentModelTask = task;

        // Try primary model path first
        try {
            sendStatus({ 
                type: 'source-attempt', 
                message: `Loading from primary source...`,
                sourceIndex: 1,
                totalSources: sources.length + 1
            });
            
            generator = await tryLoadFromSource(modelPath, task);
            self.postMessage({ 
                type: 'MODEL_READY', 
                payload: { 
                    modelId: modelPath, 
                    source: 'primary',
                    fallbackUsed: false 
                } 
            });
            return;
        } catch (primaryError) {
            console.warn('[Worker] Primary source failed:', primaryError.message);
            sendStatus({ 
                type: 'source-failed', 
                message: `Primary source unavailable: ${primaryError.message}`,
                error: primaryError.message
            });
        }

        // Try alternative sources
        for (let i = 0; i < sources.length; i++) {
            if (loadAborted) {
                self.postMessage({ type: 'MODEL_ERROR', payload: 'Load aborted' });
                return;
            }

            const source = sources[i];
            sendStatus({ 
                type: 'source-attempt', 
                message: `Trying ${source.type}...`,
                sourceIndex: i + 2,
                totalSources: sources.length + 1
            });

            try {
                generator = await tryLoadFromSource(source.url, task);
                self.postMessage({ 
                    type: 'MODEL_READY', 
                    payload: { 
                        modelId: modelPath, 
                        source: source.type,
                        sourceIndex: i + 2,
                        fallbackUsed: false 
                    } 
                });
                return;
            } catch (sourceError) {
                console.warn(`[Worker] Source ${i + 2} failed:`, sourceError.message);
                sendStatus({ 
                    type: 'source-failed', 
                    message: `${source.type} unavailable, trying next...`,
                    error: sourceError.message
                });
            }
        }

        // All sources failed, try fallback if available
        if (fallback) {
            sendStatus({ 
                type: 'fallback-attempt', 
                message: `Loading fallback model: ${fallback.id}...`
            });

            try {
                generator = await tryLoadFromSource(fallback.id, fallback.task || task);
                currentModelPath = fallback.id;
                self.postMessage({ 
                    type: 'MODEL_READY', 
                    payload: { 
                        modelId: fallback.id, 
                        source: 'fallback',
                        fallbackUsed: true,
                        originalModel: modelPath
                    } 
                });
                return;
            } catch (fallbackError) {
                console.error('[Worker] Fallback also failed:', fallbackError.message);
            }
        }

        // Everything failed
        self.postMessage({ 
            type: 'MODEL_ERROR', 
            payload: 'All sources failed. Unable to load model.' 
        });
    } 
    
    else if (type === 'GENERATE') {
        const { prompt, max_new_tokens, temperature } = payload;
        
        if (!generator) {
            self.postMessage({ type: 'GENERATE_ERROR', payload: 'Model not initialized' });
            return;
        }

        try {
            const result = await generator(prompt, {
                max_new_tokens: max_new_tokens || 350,
                temperature: temperature || 0.4,
                top_k: 40,
                do_sample: true,
                repetition_penalty: 1.1,
                callback_function: (beams) => {
                    // Send stream updates
                    const fullText = generator.tokenizer.decode(beams[0].output_token_ids, { skip_special_tokens: true });
                    self.postMessage({ type: 'GENERATE_STREAM', payload: fullText });
                }
            });

            self.postMessage({ type: 'GENERATE_COMPLETE', payload: result[0].generated_text });
        } catch (error) {
            self.postMessage({ type: 'GENERATE_ERROR', payload: error.message });
        }
    }
    
    else if (type === 'CLEAR_CACHE') {
        const { clearAll = false, modelPath } = payload || {};
        
        const report = {
            cachesDeleted: [],
            dbsDeleted: [],
            localStorageKeysCleared: [],
            totalSizeClearedMB: 0,
            success: true,
            errors: []
        };

        try {
            // Clear Cache API entries
            const cacheNames = await caches.keys();
            const patterns = ['huggingface', 'xenova', 'onnx', 'transformers', 'hf-'];
            
            for (const cacheName of cacheNames) {
                const shouldDelete = clearAll || patterns.some(pattern => 
                    cacheName.toLowerCase().includes(pattern.toLowerCase())
                ) || (modelPath && cacheName.toLowerCase().includes(modelPath.toLowerCase()));
                
                if (shouldDelete) {
                    try {
                        const cache = await caches.open(cacheName);
                        const keys = await cache.keys();
                        
                        let sizeEstimate = 0;
                        for (const request of keys) {
                            if (!modelPath || request.url.toLowerCase().includes(modelPath.toLowerCase())) {
                                const response = await cache.match(request);
                                if (response) {
                                    const blob = await response.clone().blob();
                                    sizeEstimate += blob.size;
                                }
                                await cache.delete(request);
                            }
                        }
                        
                        if (clearAll || !modelPath) {
                            await caches.delete(cacheName);
                        }
                        
                        report.cachesDeleted.push(cacheName);
                        report.totalSizeClearedMB += sizeEstimate / (1024 * 1024);
                        console.log(`[Worker] Cleared cache: ${cacheName}`);
                    } catch (cacheError) {
                        report.errors.push(`Failed to clear cache ${cacheName}: ${cacheError.message}`);
                    }
                }
            }

            // Clear IndexedDB databases
            const dbNames = ['transformers-cache', 'hf-cache', 'model-cache', 'huggingface-cache'];
            
            for (const dbName of dbNames) {
                try {
                    await new Promise((resolve) => {
                        const request = indexedDB.deleteDatabase(dbName);
                        request.onsuccess = () => {
                            report.dbsDeleted.push(dbName);
                            resolve(true);
                        };
                        request.onerror = () => resolve(false);
                        request.onblocked = () => resolve(false);
                    });
                } catch (dbError) {
                    report.errors.push(`Failed to delete ${dbName}: ${dbError.message}`);
                }
            }
            
            // Reset internal state
            generator = null;
            currentModelPath = null;
            
            self.postMessage({ type: 'CACHE_CLEARED', payload: report });
        } catch (error) {
            report.success = false;
            report.errors.push(error.message);
            self.postMessage({ type: 'CACHE_ERROR', payload: report });
        }
    }
    
    else if (type === 'ABORT_LOAD') {
        loadAborted = true;
        self.postMessage({ type: 'LOAD_ABORTED' });
    }
    
    else if (type === 'GET_CACHE_STATS') {
        try {
            let totalSize = 0;
            let cacheCount = 0;
            let entryCount = 0;
            
            const cacheNames = await caches.keys();
            cacheCount = cacheNames.length;
            
            for (const cacheName of cacheNames) {
                const cache = await caches.open(cacheName);
                const keys = await cache.keys();
                entryCount += keys.length;
                
                for (const request of keys) {
                    const response = await cache.match(request);
                    if (response) {
                        const blob = await response.clone().blob();
                        totalSize += blob.size;
                    }
                }
            }
            
            self.postMessage({ 
                type: 'CACHE_STATS', 
                payload: {
                    totalSizeMB: totalSize / (1024 * 1024),
                    cacheCount,
                    entryCount
                }
            });
        } catch (error) {
            self.postMessage({ type: 'CACHE_ERROR', payload: error.message });
        }
    }
});