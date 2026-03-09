/**
 * Model Selector & Device Detection
 */

export const MODELS = {
    'distilgpt2': {
        name: 'DistilGPT2',
        path: 'Xenova/distilgpt2',
        size: '~80MB',
        performance: 'Ultra Fast',
        description: 'Best for simple rewrites and quick testing. Runs on almost any device.',
        recommended: false
    },
    'smollm-135m': {
        name: 'SmolLM 135M',
        path: 'onnx-community/SmolLM-135M-Instruct-ONNX',
        size: '~250MB',
        performance: 'Ultra Fast',
        description: 'Amazingly capable for its tiny size. Excellent for quick mobile use.',
        recommended: false
    },
    'tiny-llama': {
        name: 'TinyLlama 1.1B',
        path: 'Xenova/TinyLlama-1.1B-Chat-v1.0',
        size: '~650MB',
        performance: 'Balanced',
        description: 'Great balance between speed and quality. Good for structured prompts.',
        recommended: true
    },
    'qwen2-0.5b': {
        name: 'Qwen2 0.5B',
        path: 'Xenova/Qwen2-0.5B-Instruct',
        size: '~900MB',
        performance: 'Balanced+',
        description: 'Strong multilingual performance, especially in coding and logic.',
        recommended: false
    },
    'phi-3-mini': {
        name: 'Phi-3 Mini',
        path: 'Xenova/Phi-3-mini-4k-instruct',
        size: '~2.2GB',
        performance: 'High Quality',
        description: 'Best reasoning and structure. Requires 8GB+ RAM and better GPU/CPU.',
        recommended: false
    }
};

/**
 * Detect if WebGPU is supported by the browser
 */
export const checkWebGPUSupport = async () => {
    if (!navigator.gpu) return false;
    try {
        const adapter = await navigator.gpu.requestAdapter();
        return !!adapter;
    } catch (e) {
        return false;
    }
};

/**
 * Get system specs (basic)
 */
export const getSystemInfo = () => {
    const mem = navigator.deviceMemory || 'Unknown';
    const threads = navigator.hardwareConcurrency || 'Unknown';
    return {
        ram: mem !== 'Unknown' ? `${mem}GB` : 'Unknown',
        cores: threads
    };
};
