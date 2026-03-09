/**
 * Simple LLM API Wrapper
 * Provides a simple interface to call LLM functions from anywhere in the page
 *
 * Usage:
 *   const improved = await runLLM(systemPrompt, userPrompt);
 */

let currentEngine = null; // 'transformers' or 'webllm'
let currentModel = null;
let isInitialized = false;

/**
 * Initialize LLM engine with the best available model
 * @param {string} preferredEngine - 'transformers', 'webllm', or 'auto'
 */
async function initializeLLM(preferredEngine = 'auto') {
    if (isInitialized) {
        return { engine: currentEngine, model: currentModel };
    }

    // Check WebGPU support
    const webgpuSupported = await checkWebGPUSupport();

    // Select engine
    if (preferredEngine === 'webllm' || (preferredEngine === 'auto' && webgpuSupported)) {
        try {
            const { recommendModel, initWebLLM, WEBLLM_MODELS } = await import('./webLLMEngine.js');
            const modelId = recommendModel();
            const model = WEBLLM_MODELS[Object.keys(WEBLLM_MODELS).find(k => WEBLLM_MODELS[k].id === modelId)];

            await initWebLLM(modelId, (progress) => {
                console.log(`Loading WebLLM: ${Math.round(progress.progress * 100)}%`);
            });

            currentEngine = 'webllm';
            currentModel = modelId;
            isInitialized = true;

            console.log(`✅ WebLLM initialized with ${model.name}`);
            return { engine: 'webllm', model: modelId };
        } catch (error) {
            console.warn('WebLLM initialization failed, falling back to Transformers.js:', error);
        }
    }

    // Fallback to Transformers.js
    try {
        const { initLLM } = await import('./llmEngine.js');
        const { MODELS } = await import('./modelSelector.js');

        // Find recommended model
        const modelKey = Object.keys(MODELS).find(key => MODELS[key].recommended);
        const model = MODELS[modelKey];

        await initLLM(model.path, (progress) => {
            console.log(`Loading Transformers.js: ${Math.round(progress * 100)}%`);
        });

        currentEngine = 'transformers';
        currentModel = model.path;
        isInitialized = true;

        console.log(`✅ Transformers.js initialized with ${model.name}`);
        return { engine: 'transformers', model: model.path };
    } catch (error) {
        console.error('Failed to initialize any LLM engine:', error);
        throw new Error('Could not initialize LLM. Please check browser compatibility.');
    }
}

/**
 * Run LLM completion (main API function)
 * @param {string} systemPrompt - System instructions
 * @param {string} userPrompt - User input
 * @param {Object} options - Generation options
 * @returns {Promise<string>} Generated response
 */
async function runLLM(systemPrompt, userPrompt, options = {}) {
    // Auto-initialize if not already done
    if (!isInitialized) {
        await initializeLLM('auto');
    }

    try {
        if (currentEngine === 'webllm') {
            const { generateCompletion } = await import('./webLLMEngine.js');
            return await generateCompletion(systemPrompt, userPrompt, options);
        } else {
            // Transformers.js - we need to format it differently
            const { improvePromptLocal } = await import('./llmEngine.js');

            // Transformers.js is optimized for prompt improvement,
            // so we'll format it as a prompt improvement task
            const combinedPrompt = `${systemPrompt}\n\nUser: ${userPrompt}`;
            return await improvePromptLocal(combinedPrompt, 'en', null, null);
        }
    } catch (error) {
        console.error('LLM generation error:', error);
        throw error;
    }
}

/**
 * Check if WebGPU is available
 */
async function checkWebGPUSupport() {
    if (!navigator.gpu) return false;
    try {
        const adapter = await navigator.gpu.requestAdapter();
        return !!adapter;
    } catch (e) {
        return false;
    }
}

/**
 * Get current engine status
 */
function getStatus() {
    return {
        engine: currentEngine,
        model: currentModel,
        initialized: isInitialized,
        webgpu: navigator.gpu ? 'supported' : 'not supported'
    };
}

/**
 * Reset the engine (unload model)
 */
async function reset() {
    if (currentEngine === 'webllm') {
        const { unloadWebLLM } = await import('./webLLMEngine.js');
        unloadWebLLM();
    }
    currentEngine = null;
    currentModel = null;
    isInitialized = false;
}

// Export to global scope
window.runLLM = runLLM;
window.initializeLLM = initializeLLM;
window.getLLMStatus = getStatus;
window.resetLLM = reset;

export { runLLM, initializeLLM, getStatus as getLLMStatus, reset as resetLLM };