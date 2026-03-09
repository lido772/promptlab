/**
 * Local LLM Improvement Engine
 * Powered by Transformers.js
 */

let llmWorker = null;
let currentModelPath = null;
let isLoaded = false;
let onProgressCallback = null;
let onStreamCallback = null;

// Initialize the Web Worker
if (window.Worker) {
    llmWorker = new Worker('./worker.js', { type: 'module' });

    llmWorker.onmessage = (event) => {
        const { type, payload } = event.data;

        switch (type) {
            case 'DOWNLOAD_PROGRESS':
                if (onProgressCallback) {
                    onProgressCallback(payload.progress);
                }
                break;
            case 'MODEL_READY':
                isLoaded = true;
                if (onProgressCallback) {
                    onProgressCallback(100); // Indicate full load
                }
                break;
            case 'MODEL_ERROR':
                console.error('Worker Model Error:', payload);
                isLoaded = false;
                // Optionally, reset progress or show error UI
                break;
            case 'GENERATE_STREAM':
                if (onStreamCallback) {
                    onStreamCallback(payload);
                }
                break;
            case 'GENERATE_COMPLETE':
                // This is handled by the promise resolution in improvePromptLocal
                break;
            case 'GENERATE_ERROR':
                console.error('Worker Generation Error:', payload);
                // This is handled by the promise rejection in improvePromptLocal
                break;
            case 'CACHE_CLEARED':
                console.log('Cache cleared event received from worker');
                break;
            case 'CACHE_ERROR':
                console.error('Worker Cache Error:', payload);
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
 * Initialize the pipeline with a specific model
 * @param {string} modelPath - HuggingFace model path
 * @param {Function} progressCallback - Called with loading progress %
 */
export const initLLM = async (modelPath, progressCallback) => {
    if (!llmWorker) {
        throw new Error('LLM Worker not available.');
    }
    // Re-initialize if the model changed
    if (isLoaded && currentModelPath === modelPath) return true; // Already loaded

    onProgressCallback = progressCallback;
    currentModelPath = modelPath;
    isLoaded = false; // Reset status while loading

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
                isLoaded = false;
                console.log('Model cache cleared successfully.');
                resolve(true);
            } else if (event.data.type === 'CACHE_ERROR') {
                llmWorker.removeEventListener('message', messageHandler);
                reject(new Error(event.data.payload));
            }
        };
        llmWorker.addEventListener('message', messageHandler);
        llmWorker.postMessage({ type: 'CLEAR_CACHE', payload: { modelPath } });
    });
};
