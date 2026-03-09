/**
 * Model Configuration Constants
 * Defines all model tiers, sources, and fallback chains
 */

export const MODEL_VERSION = '2.0.0';

export const MODEL_TIERS = {
    FREE: 'free',
    PRO: 'pro',
    MOBILE: 'mobile'
};

export const MODEL_CONFIGS = {
    [MODEL_TIERS.FREE]: {
        id: 'Xenova/flan-t5-small',
        name: 'Flan-T5 Small (Free)',
        description: 'Fast model for quick prompt optimization',
        sizeMB: 80,
        maxRAM: 200,
        sources: [
            {
                url: 'Xenova/flan-t5-small',
                type: 'huggingface',
                priority: 1
            },
            {
                url: 'https://cdn-lfs.huggingface.co/Xenova/flan-t5-small',
                type: 'cdn-lfs',
                priority: 2
            },
            {
                url: 'https://huggingface.co/Xenova/flan-t5-small/resolve/main',
                type: 'huggingface-resolve',
                priority: 3
            },
            {
                url: 'https://hf-mirror.com/Xenova/flan-t5-small',
                type: 'mirror',
                priority: 4
            }
        ],
        fallback: {
            id: 'Xenova/distilgpt2',
            name: 'DistilGPT2 (Fallback)',
            sizeMB: 85
        },
        task: 'text2text-generation',
        coldStartTarget: 5000 // 5 seconds
    },

    [MODEL_TIERS.PRO]: {
        id: 'Xenova/flan-t5-base',
        name: 'Flan-T5 Base (Pro)',
        description: 'Powerful model for advanced prompt optimization',
        sizeMB: 280,
        maxRAM: 500,
        sources: [
            {
                url: 'Xenova/flan-t5-base',
                type: 'huggingface',
                priority: 1
            },
            {
                url: 'https://cdn-lfs.huggingface.co/Xenova/flan-t5-base',
                type: 'cdn-lfs',
                priority: 2
            },
            {
                url: 'https://huggingface.co/Xenova/flan-t5-base/resolve/main',
                type: 'huggingface-resolve',
                priority: 3
            },
            {
                url: 'https://hf-mirror.com/Xenova/flan-t5-base',
                type: 'mirror',
                priority: 4
            }
        ],
        fallback: {
            id: 'Xenova/LaMini-Flan-T5-783M',
            name: 'LaMini Flan-T5 (Fallback)',
            sizeMB: 300
        },
        task: 'text2text-generation',
        coldStartTarget: 15000
    },

    [MODEL_TIERS.MOBILE]: {
        id: 'Xenova/distilgpt2',
        name: 'DistilGPT2 (Mobile)',
        description: 'Ultra-lightweight model for mobile devices',
        sizeMB: 85,
        maxRAM: 150,
        sources: [
            {
                url: 'Xenova/distilgpt2',
                type: 'huggingface',
                priority: 1
            },
            {
                url: 'https://cdn-lfs.huggingface.co/Xenova/distilgpt2',
                type: 'cdn-lfs',
                priority: 2
            },
            {
                url: 'https://huggingface.co/Xenova/distilgpt2/resolve/main',
                type: 'huggingface-resolve',
                priority: 3
            },
            {
                url: 'https://hf-mirror.com/Xenova/distilgpt2',
                type: 'mirror',
                priority: 4
            }
        ],
        fallback: {
            id: 'Xenova/distilbert-base-uncased',
            name: 'DistilBERT (Fallback)',
            sizeMB: 65
        },
        task: 'text-generation',
        coldStartTarget: 3000
    }
};

export const SOURCE_TIMEOUT = 8000; // 8 seconds per source

export const CACHE_KEYS = {
    MODEL_VERSION: 'model_version',
    MODEL_CACHED: 'model_cached',
    FALLBACK_USED: 'fallbackUsed',
    CURRENT_TIER: 'currentTier',
    LAST_MODEL_LOAD: 'lastModelLoad',
    FALLBACK_REASON: 'fallbackReason'
};

export const CACHE_PATTERNS = {
    huggingface: ['huggingface', 'hf-mirror', 'cdn-lfs'],
    xenova: ['xenova', 'onnx'],
    cache: ['transformers-cache', 'hf-cache', 'model-cache']
};
