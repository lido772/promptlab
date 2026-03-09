/**
 * Model Selector & Device Detection
 * Supports both Transformers.js and WebLLM models
 */

// Transformers.js Models (CPU-based)
export const TRANSFORMERS_MODELS = {
    'smollm2-360m-instruct': {
        name: 'SmolLM2 360M Instruct',
        path: 'Xenova/SmolLM2-360M-Instruct',
        size: '~360MB',
        performance: 'Fast',
        description: 'A good balance of speed and capability for multilingual tasks.',
        recommended: false,
        engine: 'transformers'
    },
    'tiny-llama': {
        name: 'TinyLlama 1.1B',
        path: 'Xenova/TinyLlama-1.1B-Chat-v1.0',
        size: '~650MB',
        performance: 'Balanced',
        description: 'Great balance between speed and quality. Good for structured prompts.',
        recommended: true,
        engine: 'transformers'
    },
    'qwen2-0.5b': {
        name: 'Qwen2 0.5B',
        path: 'Xenova/Qwen2-0.5B-Instruct',
        size: '~900MB',
        performance: 'Balanced+',
        description: 'Strong multilingual performance, especially in coding and logic.',
        recommended: false,
        engine: 'transformers'
    },
    'phi-3-mini': {
        name: 'Phi-3 Mini',
        path: 'Xenova/Phi-3-mini-4k-instruct',
        size: '~2.2GB',
        performance: 'High Quality',
        description: 'Best reasoning and structure. Requires 8GB+ RAM and better GPU/CPU.',
        recommended: false,
        engine: 'transformers'
    }
};

// WebLLM Models (WebGPU-based)
export const WEBLLM_MODELS = {
    'qwen2.5-1.5b-webgpu': {
        name: 'Qwen 2.5 1.5B (WebGPU)',
        id: 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC',
        size: '~1.1GB',
        performance: 'Fastest',
        description: 'Best for quick responses with WebGPU acceleration.',
        recommended: false,
        engine: 'webllm',
        ram: '4GB+',
        vram: '2GB+'
    },
    'qwen2.5-3b-webgpu': {
        name: 'Qwen 2.5 3B (WebGPU)',
        id: 'Qwen2.5-3B-Instruct-q4f16_1-MLC',
        size: '~2.1GB',
        performance: 'Balanced',
        description: 'Great balance of speed and quality with WebGPU.',
        recommended: true,
        engine: 'webllm',
        ram: '6GB+',
        vram: '3GB+'
    },
    'phi-3.5-mini-webgpu': {
        name: 'Phi 3.5 Mini (WebGPU)',
        id: 'Phi-3.5-mini-instruct-q4f16_1-MLC',
        size: '~2.6GB',
        performance: 'High Quality',
        description: 'Best reasoning with WebGPU acceleration.',
        recommended: false,
        engine: 'webllm',
        ram: '8GB+',
        vram: '4GB+'
    }
};

// Combined model list
export const MODELS = {
    ...TRANSFORMERS_MODELS,
    ...WEBLLM_MODELS
};

/**
 * Detect if WebGPU is supported by the browser
 * @returns {Promise<{supported: boolean, reason?: string, adapter?: object}>}
 */
export const checkWebGPUSupport = async () => {
    // Check if navigator.gpu exists
    if (typeof navigator.gpu === 'undefined') {
        return {
            supported: false,
            reason: 'WebGPU is not supported in this browser. Try Chrome 113+, Edge 113+, or enable WebGPU flags in chrome://flags'
        };
    }

    try {
        // Request adapter with better error handling
        const adapter = await navigator.gpu.requestAdapter({
            powerPreference: 'high-performance'
        });

        if (!adapter) {
            return {
                supported: false,
                reason: 'No WebGPU adapter found. Your GPU driver may need updating, or WebGPU may be disabled in browser flags.'
            };
        }

        // Get adapter info with fallback for older browsers
        let adapterInfo = {};
        try {
            if (adapter.requestAdapterInfo) {
                adapterInfo = await adapter.requestAdapterInfo();
            } else {
                adapterInfo = {
                    vendor: 'Unknown',
                    architecture: 'Unknown',
                    description: 'WebGPU Supported',
                    device: 'Unknown'
                };
            }
        } catch (e) {
            console.warn('Could not get adapter info:', e);
            adapterInfo = {
                vendor: 'WebGPU Compatible',
                architecture: 'Unknown',
                description: 'WebGPU Supported',
                device: 'Unknown'
            };
        }

        const features = adapter.features;

        return {
            supported: true,
            adapter: {
                vendor: adapterInfo.vendor || 'Unknown',
                architecture: adapterInfo.architecture || 'Unknown',
                description: adapterInfo.description || 'WebGPU Supported',
                device: adapterInfo.device || 'Unknown',
                features: Array.from(features).slice(0, 8).join(', ')
            }
        };
    } catch (e) {
        return {
            supported: false,
            reason: `WebGPU initialization error: ${e.message}. Try updating your GPU drivers or browser.`
        };
    }
};

/**
 * Get system specs (basic)
 */
export const getSystemInfo = async () => {
    let ram = 'Unknown';
    if (navigator.deviceMemory) {
        ram = `${navigator.deviceMemory} GB`;
    }

    let cores = navigator.hardwareConcurrency || 'Unknown';

    let batteryStatus = { level: 100, charging: true }; // Default to optimal state
    if ('getBattery' in navigator) {
        try {
            const battery = await navigator.getBattery();
            batteryStatus = {
                level: Math.round(battery.level * 100),
                charging: battery.charging
            };
        } catch (e) {
            console.warn('Battery API not available or blocked:', e);
        }
    }

    return { ram, cores, battery: batteryStatus };
};
