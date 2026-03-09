import { pipeline, env } from '@xenova/transformers';

// Configuration for local environments
env.allowLocalModels = false;
env.useBrowserCache = true; // Use IndexedDB

let generator = null;
let currentModelPath = null;

// Listen for messages from the main thread
self.addEventListener('message', async (event) => {
    const { type, payload } = event.data;

    if (type === 'INIT_MODEL') {
        const { modelPath } = payload;
        
        // Don't reinitialize if it's the same model
        if (generator && currentModelPath === modelPath) {
            self.postMessage({ type: 'MODEL_READY' });
            return;
        }

        currentModelPath = modelPath;
        try {
            generator = await pipeline('text-generation', modelPath, {
                progress_callback: (info) => {
                    self.postMessage({ type: 'DOWNLOAD_PROGRESS', payload: info });
                }
            });
            self.postMessage({ type: 'MODEL_READY' });
        } catch (error) {
            self.postMessage({ type: 'MODEL_ERROR', payload: error.message });
        }
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
        const { modelPath } = payload || {};
        
        try {
            // Clear the Transformers.js cache
            const cache = await caches.open('transformers-cache');
            
            if (modelPath) {
                // Delete specific model files from cache
                const keys = await cache.keys();
                for (const key of keys) {
                    if (key.url.includes(modelPath)) {
                        await cache.delete(key);
                    }
                }
            } else {
                // Clear all cached models
                const keys = await cache.keys();
                for (const key of keys) {
                    await cache.delete(key);
                }
            }
            
            // Reset internal state
            generator = null;
            currentModelPath = null;
            
            self.postMessage({ type: 'CACHE_CLEARED', payload: { success: true } });
        } catch (error) {
            self.postMessage({ type: 'CACHE_ERROR', payload: error.message });
        }
    }
});