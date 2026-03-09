/**
 * WebLLM Engine - Local LLM with WebGPU acceleration
 * Powered by @mlc-ai/web-llm
 *
 * This engine provides faster inference using WebGPU compared to Transformers.js
 */

import * as webllm from "https://esm.sh/@mlc-ai/web-llm@0.2.46";

// Singleton pattern - keep model loaded in memory
let engine = null;
let currentModelId = null;
let isLoaded = false;
let onProgressCallback = null;

/**
 * Available WebLLM models optimized for different use cases
 */
export const WEBLLM_MODELS = {
    'Qwen2.5-1.5B-Instruct-q4f16_1-MLC': {
        id: 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC',
        name: 'Qwen 2.5 1.5B',
        size: '~1.1GB',
        performance: 'Fastest',
        description: 'Best for quick responses and lower-end devices',
        ram: '4GB+',
        vram: '2GB+',
        recommended: false
    },
    'Qwen2.5-3B-Instruct-q4f16_1-MLC': {
        id: 'Qwen2.5-3B-Instruct-q4f16_1-MLC',
        name: 'Qwen 2.5 3B',
        size: '~2.1GB',
        performance: 'Balanced',
        description: 'Great balance of speed and quality',
        ram: '6GB+',
        vram: '3GB+',
        recommended: true
    },
    'Phi-3.5-mini-instruct-q4f16_1-MLC': {
        id: 'Phi-3.5-mini-instruct-q4f16_1-MLC',
        name: 'Phi 3.5 Mini',
        size: '~2.6GB',
        performance: 'High Quality',
        description: 'Best reasoning and structure understanding',
        ram: '8GB+',
        vram: '4GB+',
        recommended: false
    }
};

/**
 * Check if WebGPU is available in the browser
 */
export const checkWebGPUSupport = async () => {
    // Check if navigator.gpu exists
    if (typeof navigator.gpu === 'undefined') {
        return {
            supported: false,
            reason: 'WebGPU is not supported in this browser. Try Chrome 113+, Edge 113+, or enable WebGPU in chrome://flags'
        };
    }

    try {
        // Request adapter with high performance preference
        const adapter = await navigator.gpu.requestAdapter({
            powerPreference: 'high-performance'
        });

        if (!adapter) {
            return {
                supported: false,
                reason: 'No WebGPU adapter found. Update your GPU drivers or enable WebGPU in browser settings.'
            };
        }

        // Get adapter info with better error handling
        let adapterInfo = {};
        try {
            if (adapter.requestAdapterInfo) {
                adapterInfo = await adapter.requestAdapterInfo();
            } else {
                adapterInfo = { description: 'WebGPU Compatible' };
            }
        } catch (e) {
            adapterInfo = { description: 'WebGPU Supported' };
        }

        const features = adapter.features;
        const hasRequiredFeatures = features.has('timestamp-query') && features.has('texture-compression-bc');

        console.log('✅ WebGPU supported:', adapterInfo);

        return {
            supported: true,
            adapter: {
                vendor: adapterInfo.vendor || 'Unknown',
                architecture: adapterInfo.architecture || 'Unknown',
                description: adapterInfo.description || 'WebGPU Supported',
                device: adapterInfo.device || 'Unknown',
                features: Array.from(features).slice(0, 5).join(', ')
            },
            hasAdvancedFeatures: hasRequiredFeatures
        };
    } catch (e) {
        console.error('WebGPU error:', e);
        return {
            supported: false,
            reason: `WebGPU initialization failed: ${e.message}. Try updating your browser or GPU drivers.`
        };
    }
};

/**
 * Initialize WebLLM engine with progress callback
 * @param {string} modelId - Model ID from WEBLLM_MODELS
 * @param {Function} progressCallback - Callback with {progress: number, text: string}
 */
export const initWebLLM = async (modelId, progressCallback) => {
    // Return existing engine if same model
    if (engine && currentModelId === modelId && isLoaded) {
        console.log('WebLLM already initialized with model:', modelId);
        return engine;
    }

    onProgressCallback = progressCallback;
    currentModelId = modelId;

    try {
        console.log('Initializing WebLLM with model:', modelId);

        // Initialize chat module with progress tracking
        engine = new webllm.CreateMLCEngine(
            modelId,
            {
                initProgressCallback: (report) => {
                    console.log(`WebLLM loading: ${Math.round(report.progress * 100)}% - ${report.text}`);
                    if (onProgressCallback) {
                        onProgressCallback({
                            progress: report.progress,
                            text: report.text,
                            timeElapsed: report.timeElapsed,
                            timeRemaining: report.timeRemaining
                        });
                    }
                },
                logLevel: 'INFO'
            }
        );

        // This will trigger the download and initialization
        console.log('Starting model download and initialization...');
        await engine.chat.completions.create({
            messages: [{ role: 'user', content: '' }],
            max_tokens: 0 // Just initialize, don't generate
        });

        isLoaded = true;
        console.log('✅ WebLLM initialized successfully!');
        return engine;
    } catch (err) {
        console.error('WebLLM Initialization Error:', err);
        isLoaded = false;
        engine = null;

        // Provide more helpful error messages
        let errorMessage = `Failed to initialize WebLLM: ${err.message}`;

        if (err.message.includes('WebGPU')) {
            errorMessage = 'WebGPU is not available or not supported. Please try Chrome 113+ or Edge 113+.';
        } else if (err.message.includes('memory') || err.message.includes('OOM')) {
            errorMessage = 'Not enough GPU memory. Try a smaller model or close other browser tabs.';
        } else if (err.message.includes('network') || err.message.includes('fetch')) {
            errorMessage = 'Network error downloading model. Please check your internet connection.';
        }

        throw new Error(errorMessage);
    }
};

/**
 * Generate a completion using WebLLM
 * @param {string} systemPrompt - System instructions
 * @param {string} userPrompt - User input
 * @param {Object} options - Generation options
 */
export const generateCompletion = async (systemPrompt, userPrompt, options = {}) => {
    if (!engine || !isLoaded) {
        throw new Error('WebLLM not initialized. Call initWebLLM() first.');
    }

    const {
        temperature = 0.7,
        topP = 0.9,
        maxTokens = 512,
        frequencyPenalty = 0.0,
        presencePenalty = 0.0
    } = options;

    try {
        const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ];

        const response = await engine.chat.completions.create({
            messages,
            temperature,
            top_p: topP,
            max_tokens: maxTokens,
            frequency_penalty: frequencyPenalty,
            presence_penalty: presencePenalty
        });

        return response.choices[0].message.content;
    } catch (err) {
        console.error('WebLLM Generation Error:', err);
        throw err;
    }
};

/**
 * Improve a prompt using WebLLM (compatible with existing interface)
 * @param {string} prompt - Original prompt
 * @param {string} lang - Language code
 * @param {Object} heuristics - Heuristic analysis results
 * @param {Function} onStream - Optional streaming callback
 */
export const improvePromptWebLLM = async (prompt, lang = 'en', heuristics = null, onStream = null) => {
    if (!engine || !isLoaded) {
        throw new Error('WebLLM not initialized. Call initWebLLM() first.');
    }

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
        targetedInstructions = "\n\nSpecifically address these issues:\n" + heuristics.issues.map((issue, i) => `${i + 1}. ${issue}`).join('\n');
    }

    const systemPrompt = `You are a world-class Prompt Engineer. Your task is to rewrite the user's prompt to be highly effective, structured, and clear.

Follow these rules:
1. Preserve the original meaning and language (${currentLangName})
2. Add a clear Persona/Role (e.g., "You are an expert...")
3. Provide Context and background information
4. Specify a clear Output Format (e.g., "Return the result as a Markdown table")
5. List specific Constraints to avoid generic or low-quality results
6. Use proper structure with paragraphs and bullet points where appropriate${targetedInstructions}

Return ONLY the improved prompt, no explanations or meta-commentary.`;

    const userPrompt = `Improve this ${currentLangName} prompt:\n\n${prompt}`;

    try {
        const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ];

        // WebLLM doesn't support streaming in the same way, so we'll do single generation
        const response = await engine.chat.completions.create({
            messages,
            temperature: 0.6,
            top_p: 0.9,
            max_tokens: 512
        });

        const improved = response.choices[0].message.content.trim();

        // Call the stream callback once with the final result
        if (onStream) {
            onStream(improved);
        }

        return improved;
    } catch (err) {
        console.error('WebLLM Prompt Improvement Error:', err);
        throw err;
    }
};

/**
 * Check if engine is loaded
 */
export const isWebLLMLoaded = () => isLoaded;

/**
 * Get current model ID
 */
export const getCurrentModel = () => currentModelId;

/**
 * Unload the current model and free memory
 */
export const unloadWebLLM = () => {
    engine = null;
    currentModelId = null;
    isLoaded = false;
    onProgressCallback = null;
};

/**
 * Delete WebLLM model cache
 */
export const clearWebLLMCache = async () => {
    try {
        // Clear all caches related to WebLLM
        const cacheNames = await caches.keys();
        for (const name of cacheNames) {
            if (name.includes('wllm') || name.includes('mlc') || name.includes('webllm')) {
                await caches.delete(name);
                console.log(`Deleted cache: ${name}`);
            }
        }

        // Reset engine state
        unloadWebLLM();
        return true;
    } catch (err) {
        console.error('Error clearing WebLLM cache:', err);
        return false;
    }
};

/**
 * Get system information for model recommendation
 */
export const getSystemInfo = () => {
    const mem = navigator.deviceMemory || 'Unknown';
    const threads = navigator.hardwareConcurrency || 'Unknown';
    const conn = navigator.connection?.effectiveType || 'Unknown';

    return {
        ram: mem !== 'Unknown' ? `${mem}GB` : 'Unknown',
        cores: threads,
        connection: conn,
        userAgent: navigator.userAgent
    };
};

/**
 * Recommend best model based on system capabilities
 */
export const recommendModel = () => {
    const mem = navigator.deviceMemory || 4;
    const conn = navigator.connection?.effectiveType || '4g';

    // Low-end devices
    if (mem < 4 || conn === 'slow-2g' || conn === '2g') {
        return 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC';
    }

    // Mid-range devices (recommended)
    if (mem < 8) {
        return 'Qwen2.5-3B-Instruct-q4f16_1-MLC';
    }

    // High-end devices
    return 'Phi-3.5-mini-instruct-q4f16_1-MLC';
};