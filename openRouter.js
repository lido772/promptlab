/**
 * OpenRouter API Integration
 * Provides access to multiple AI models via OpenRouter service
 * Production: Uses Cloudflare Worker proxy for security
 * Development: Can use direct API calls with VITE_OPENROUTER_API_KEY
 */

// Same-origin API endpoint (works across preview, production, and custom domains)
const WORKER_URL = '/api';

// Direct API endpoint (development fallback)
const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';
const API_BASE = 'https://openrouter.ai/api/v1';
const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);
const MODELS_CACHE_STORAGE_KEY = 'promptup-openrouter-models-cache-v1';
const MODELS_CACHE_TTL_MS = 6 * 60 * 60 * 1000;

// Use Worker in production, direct API in development
const USE_WORKER = !API_KEY || import.meta.env.PROD;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const normalizeModelSelection = (modelSelection) => {
    if (Array.isArray(modelSelection)) {
        return modelSelection.filter(Boolean);
    }

    return modelSelection ? [modelSelection] : [];
};

const buildModelPayload = (modelSelection) => {
    const modelIds = normalizeModelSelection(modelSelection);

    if (modelIds.length === 0) {
        throw new Error('No OpenRouter model provided');
    }

    return modelIds.length === 1
        ? { model: modelIds[0] }
        : { models: modelIds };
};

const wrapOpenRouterError = (error) => {
    const wrapped = new Error(`OpenRouter API error: ${error.message}`);
    if (typeof error?.status !== 'undefined') {
        wrapped.status = error.status;
    }
    if (typeof error?.responseText !== 'undefined') {
        wrapped.responseText = error.responseText;
    }
    if (error?.name) {
        wrapped.name = error.name;
    }
    return wrapped;
};

const createOpenRouterRequestContext = () => {
    const endpoint = USE_WORKER ? WORKER_URL : API_BASE;
    const headers = {
        'Content-Type': 'application/json'
    };

    if (!USE_WORKER) {
        if (!API_KEY) {
            throw new Error('OpenRouter API key not configured. Please add VITE_OPENROUTER_API_KEY to .env.local');
        }

        headers.Authorization = `Bearer ${API_KEY}`;
        headers['HTTP-Referer'] = window.location.href;
        headers['X-Title'] = 'Prompt Analyzer';
    }

    return {
        apiUrl: USE_WORKER ? endpoint : `${endpoint}/chat/completions`,
        headers
    };
};

const createOpenRouterAuthHeaders = () => {
    if (USE_WORKER) {
        return {};
    }

    if (!API_KEY) {
        throw new Error('OpenRouter API key not configured. Please add VITE_OPENROUTER_API_KEY to .env.local');
    }

    return {
        Authorization: `Bearer ${API_KEY}`,
        'HTTP-Referer': window.location.href,
        'X-Title': 'Prompt Analyzer'
    };
};

const callOpenRouterWithRetry = async (apiUrl, headers, requestBody, maxRetries = 2, signal = null) => {
    let lastError = null;

    for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify(requestBody),
            signal
        });

        if (response.ok) {
            return response;
        }

        const errorText = await response.text();
    lastError = new Error(`API error ${response.status}: ${errorText}`);
    lastError.status = response.status;
    lastError.responseText = errorText;

        const canRetry = RETRYABLE_STATUS.has(response.status) && attempt < maxRetries;
        if (!canRetry) {
            throw lastError;
        }

        // Exponential-ish backoff to reduce pressure on rate-limited endpoints.
        await sleep(900 * (attempt + 1));
    }

    throw lastError || new Error('OpenRouter request failed after retries');
};

// OpenRouter free models configuration
export const OPENROUTER_MODELS = {
    'step-3-5-flash': {
        id: 'stepfun/step-3.5-flash:free',
        name: 'Step 3.5 Flash (free)',
        provider: 'StepFun',
        size: '196B (11B active)',
        context: '256K',
        price: '$0/M tokens',
        description: 'Large MoE model optimized for fast reasoning on long-context prompts',
        engine: 'openrouter'
    },
    'trinity-large-preview': {
        id: 'arcee-ai/trinity-large-preview:free',
        name: 'Trinity Large Preview (free)',
        provider: 'Arcee AI',
        size: '400B (13B active)',
        context: '131K',
        price: '$0/M tokens',
        description: 'Frontier sparse MoE model tuned for long prompts, creativity, and agent workflows',
        engine: 'openrouter'
    },
    'hunter-alpha': {
        id: 'openrouter/hunter-alpha',
        name: 'Hunter Alpha',
        provider: 'OpenRouter',
        size: '1T+',
        context: '1M',
        price: '$0/M tokens',
        description: 'Ultra-long-context frontier model for planning, reasoning, and multi-step execution',
        engine: 'openrouter'
    },
    'nemotron-3-super': {
        id: 'nvidia/nemotron-3-super-120b-a12b:free',
        name: 'Nemotron 3 Super (free)',
        provider: 'NVIDIA',
        size: '120B (12B active)',
        context: '262K',
        price: '$0/M tokens',
        description: 'Open hybrid MoE model built for high-accuracy agentic and reasoning workflows',
        engine: 'openrouter'
    },
    'healer-alpha': {
        id: 'openrouter/healer-alpha',
        name: 'Healer Alpha',
        provider: 'OpenRouter',
        size: 'Frontier',
        context: '262K',
        price: '$0/M tokens',
        description: 'Omni-modal model for reasoning and real-world multi-step task execution',
        engine: 'openrouter'
    },
    'glm-4-5-air': {
        id: 'z-ai/glm-4.5-air:free',
        name: 'GLM 4.5 Air (free)',
        provider: 'Z.ai',
        size: 'Air',
        context: '131K',
        price: '$0/M tokens',
        description: 'Compact MoE agent model with controllable reasoning and fast interactive mode',
        engine: 'openrouter'
    },
    'nemotron-3-nano-30b': {
        id: 'nvidia/nemotron-3-nano-30b-a3b:free',
        name: 'Nemotron 3 Nano 30B A3B (free)',
        provider: 'NVIDIA',
        size: '30B (A3B)',
        context: '256K',
        price: '$0/M tokens',
        description: 'Efficient MoE model for specialized agentic use cases with long context',
        engine: 'openrouter'
    },
    'trinity-mini': {
        id: 'arcee-ai/trinity-mini:free',
        name: 'Trinity Mini (free)',
        provider: 'Arcee AI',
        size: '26B (3B active)',
        context: '131K',
        price: '$0/M tokens',
        description: 'Compact sparse MoE model designed for efficient reasoning and agent tasks',
        engine: 'openrouter'
    },
    'nemotron-nano-12b-2-vl': {
        id: 'nvidia/nemotron-nano-12b-v2-vl:free',
        name: 'Nemotron Nano 12B 2 VL (free)',
        provider: 'NVIDIA',
        size: '12B',
        context: '128K',
        price: '$0/M tokens',
        description: 'Multimodal reasoning model for document, OCR, and video understanding tasks',
        engine: 'openrouter'
    },
    'nemotron-nano-9b-v2': {
        id: 'nvidia/nemotron-nano-9b-v2:free',
        name: 'Nemotron Nano 9B V2 (free)',
        provider: 'NVIDIA',
        size: '9B',
        context: '128K',
        price: '$0/M tokens',
        description: 'Unified model for reasoning and standard chat with controllable reasoning traces',
        engine: 'openrouter'
    },
    'qwen3-coder-480b-a35b': {
        id: 'qwen/qwen3-coder:free',
        name: 'Qwen3 Coder 480B A35B (free)',
        provider: 'Qwen',
        size: '480B (A35B)',
        context: '262K',
        price: '$0/M tokens',
        description: 'Large code-focused MoE model for repositories, tools, and long-context coding tasks',
        engine: 'openrouter'
    },
    'qwen3-next-80b-a3b': {
        id: 'qwen/qwen3-next-80b-a3b-instruct:free',
        name: 'Qwen3 Next 80B A3B Instruct (free)',
        provider: 'Qwen',
        size: '80B (A3B)',
        context: '262K',
        price: '$0/M tokens',
        description: 'Fast and stable long-context model without visible thinking traces',
        engine: 'openrouter',
        recommended: true
    },
    'meta-llama-3.3-70b': {
        id: 'meta-llama/llama-3.3-70b-instruct:free',
        name: 'Llama 3.3 70B Instruct (free)',
        provider: 'Meta',
        size: '70B',
        context: '128K',
        price: '$0/M tokens',
        description: 'Strong multilingual instruction model for production chat and QA',
        engine: 'openrouter'
    },
    'gpt-oss-120b': {
        id: 'openai/gpt-oss-120b:free',
        name: 'gpt-oss-120b (free)',
        provider: 'OpenAI',
        size: '120B',
        context: '131K',
        price: '$0/M tokens',
        description: 'Open-weight MoE model for strong reasoning, tools, and agentic production tasks',
        engine: 'openrouter'
    },
    'lfm-2-5-1-2b-thinking': {
        id: 'liquid/lfm-2.5-1.2b-thinking:free',
        name: 'LFM2.5 1.2B Thinking (free)',
        provider: 'LiquidAI',
        size: '1.2B',
        context: '33K',
        price: '$0/M tokens',
        description: 'Lightweight reasoning model for extraction, RAG and agentic tasks',
        engine: 'openrouter'
    },
    'lfm-2-5-1-2b-instruct': {
        id: 'liquid/lfm-2.5-1.2b-instruct:free',
        name: 'LFM2.5 1.2B Instruct (free)',
        provider: 'LiquidAI',
        size: '1.2B',
        context: '33K',
        price: '$0/M tokens',
        description: 'Compact instruction model tuned for fast and efficient responses',
        engine: 'openrouter'
    },
    'mistral-small-3-1-24b': {
        id: 'mistralai/mistral-small-3.1-24b-instruct:free',
        name: 'Mistral Small 3.1 24B (free)',
        provider: 'Mistral AI',
        size: '24B',
        context: '128K',
        price: '$0/M tokens',
        description: 'Strong multilingual model with robust coding and reasoning quality',
        engine: 'openrouter'
    },
    'gemma-3-27b': {
        id: 'google/gemma-3-27b-it:free',
        name: 'Gemma 3 27B (free)',
        provider: 'Google',
        size: '27B',
        context: '131K',
        price: '$0/M tokens',
        description: 'Large open model with strong multilingual and structured output support',
        engine: 'openrouter'
    },
    'gpt-oss-20b': {
        id: 'openai/gpt-oss-20b:free',
        name: 'gpt-oss-20b (free)',
        provider: 'OpenAI',
        size: '20B',
        context: '131K',
        price: '$0/M tokens',
        description: 'Lower-latency open MoE model with tool use and structured output support',
        engine: 'openrouter'
    },
    'qwen3-4b': {
        id: 'qwen/qwen3-4b:free',
        name: 'Qwen3 4B (free)',
        provider: 'Qwen',
        size: '4B',
        context: '41K',
        price: '$0/M tokens',
        description: 'Compact model with balanced chat efficiency and reasoning quality',
        engine: 'openrouter'
    },
    'hermes-3-405b': {
        id: 'nousresearch/hermes-3-llama-3.1-405b:free',
        name: 'Hermes 3 405B Instruct (free)',
        provider: 'Nous',
        size: '405B',
        context: '131K',
        price: '$0/M tokens',
        description: 'Very large generalist model with strong tool use, steering, and long-context coherence',
        engine: 'openrouter'
    },
    'meta-llama-3-2-3b': {
        id: 'meta-llama/llama-3.2-3b-instruct:free',
        name: 'Llama 3.2 3B Instruct (free)',
        provider: 'Meta',
        size: '3B',
        context: '131K',
        price: '$0/M tokens',
        description: 'Lightweight multilingual model for low-latency chat, reasoning, and summaries',
        engine: 'openrouter'
    },
    'gemma-3-4b': {
        id: 'google/gemma-3-4b-it:free',
        name: 'Gemma 3 4B (free)',
        provider: 'Google',
        size: '4B',
        context: '33K',
        price: '$0/M tokens',
        description: 'Compact multimodal-capable instruction model with strong multilingual support',
        engine: 'openrouter'
    },
    'gemma-3n-4b': {
        id: 'google/gemma-3n-e4b-it:free',
        name: 'Gemma 3n 4B (free)',
        provider: 'Google',
        size: '4B',
        context: '8K',
        price: '$0/M tokens',
        description: 'Efficient multimodal model optimized for mobile and low-resource execution',
        engine: 'openrouter'
    },
    'gemma-3-12b': {
        id: 'google/gemma-3-12b-it:free',
        name: 'Gemma 3 12B (free)',
        provider: 'Google',
        size: '12B',
        context: '33K',
        price: '$0/M tokens',
        description: 'Mid-sized Gemma model with strong reasoning, multilingual support, and structure',
        engine: 'openrouter'
    },
    'gemma-3n-2b': {
        id: 'google/gemma-3n-e2b-it:free',
        name: 'Gemma 3n 2B (free)',
        provider: 'Google',
        size: '2B',
        context: '8K',
        price: '$0/M tokens',
        description: 'Small multimodal model tuned for low-resource deployment and quick interactions',
        engine: 'openrouter'
    },
    'venice-uncensored': {
        id: 'cognitivecomputations/dolphin-mistral-24b-venice-edition:free',
        name: 'Venice Uncensored (free)',
        provider: 'Venice',
        size: '24B',
        context: '33K',
        price: '$0/M tokens',
        description: 'High-steerability instruct model with minimal alignment constraints',
        engine: 'openrouter'
    }
};
const STATIC_MODEL_OVERRIDES_BY_ID = new Map(
    Object.values(OPENROUTER_MODELS).map((model) => [model.id, model])
);
const RECOMMENDED_DYNAMIC_MODEL_IDS = new Set([
    'qwen/qwen3-next-80b-a3b-instruct:free',
    'openrouter/hunter-alpha',
    'nvidia/nemotron-3-super-120b-a12b:free',
    'openai/gpt-oss-120b:free'
]);
const isZeroPriced = (value) => {
    const parsed = Number(value || 0);
    return Number.isFinite(parsed) && parsed === 0;
};
const isFreeOpenRouterModel = (model) => {
    const pricing = model?.pricing || {};
    return isZeroPriced(pricing.prompt)
        && isZeroPriced(pricing.completion)
        && isZeroPriced(pricing.request)
        && isZeroPriced(pricing.image);
};
const toModelKey = (value) => String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
const formatContextLength = (value) => {
    const numeric = Number(value || 0);
    if (!Number.isFinite(numeric) || numeric <= 0) {
        return 'N/A';
    }
    if (numeric >= 1000000) {
        return `${Math.round(numeric / 100000) / 10}M`;
    }
    return `${Math.round(numeric / 1000)}K`;
};
const inferProviderName = (model) => {
    const override = STATIC_MODEL_OVERRIDES_BY_ID.get(model.id);
    if (override?.provider) {
        return override.provider;
    }
    const name = String(model?.name || '');
    if (name.includes(':')) {
        return name.split(':')[0].trim();
    }
    const vendor = String(model?.id || '').split('/')[0] || 'OpenRouter';
    return vendor
        .split('-')
        .map((part) => part ? part[0].toUpperCase() + part.slice(1) : '')
        .join(' ');
};
const inferModelSize = (model) => {
    const override = STATIC_MODEL_OVERRIDES_BY_ID.get(model.id);
    if (override?.size) {
        return override.size;
    }
    const match = String(model?.name || '').match(/(\d+(?:\.\d+)?\s*(?:[BMK]|T))(?:\s*\(([^)]+)\))?/i);
    if (!match) {
        return 'N/A';
    }
    const main = match[1].replace(/\s+/g, '');
    const extra = match[2] ? ` (${match[2].trim()})` : '';
    return `${main}${extra}`;
};
const normalizeOpenRouterModel = (model) => {
    const override = STATIC_MODEL_OVERRIDES_BY_ID.get(model.id) || {};
    const key = toModelKey(model.canonical_slug || model.id);
    return [key, {
        id: model.id,
        canonicalSlug: model.canonical_slug || model.id,
        name: model.name || override.name || model.id,
        provider: inferProviderName(model),
        size: inferModelSize(model),
        context: override.context || formatContextLength(model.top_provider?.context_length || model.context_length),
        price: '$0/M tokens',
        description: override.description || String(model.description || model.name || model.id).replace(/\s+/g, ' ').trim(),
        engine: 'openrouter',
        recommended: Boolean(override.recommended || RECOMMENDED_DYNAMIC_MODEL_IDS.has(model.id)),
        architecture: model.architecture || null,
        supportedParameters: Array.isArray(model.supported_parameters) ? model.supported_parameters : [],
        raw: model
    }];
};
const sortNormalizedModels = (models) => {
    const priorityIndex = new Map(
        [
            'qwen/qwen3-next-80b-a3b-instruct:free',
            'openrouter/hunter-alpha',
            'nvidia/nemotron-3-super-120b-a12b:free',
            'openai/gpt-oss-120b:free',
            'meta-llama/llama-3.3-70b-instruct:free',
            'qwen/qwen3-coder:free',
            'stepfun/step-3.5-flash:free',
            'arcee-ai/trinity-large-preview:free',
            'z-ai/glm-4.5-air:free',
            'mistralai/mistral-small-3.1-24b-instruct:free'
        ].map((id, index) => [id, index])
    );
    return [...models].sort((left, right) => {
        const leftRank = priorityIndex.has(left.id) ? priorityIndex.get(left.id) : Number.MAX_SAFE_INTEGER;
        const rightRank = priorityIndex.has(right.id) ? priorityIndex.get(right.id) : Number.MAX_SAFE_INTEGER;
        if (leftRank !== rightRank) {
            return leftRank - rightRank;
        }
        return left.name.localeCompare(right.name);
    });
};

const readCachedModelCatalog = (allowStale = false) => {
    if (typeof window === 'undefined' || !window.localStorage) {
        return null;
    }

    try {
        const raw = window.localStorage.getItem(MODELS_CACHE_STORAGE_KEY);
        if (!raw) {
            return null;
        }

        const parsed = JSON.parse(raw);
        const models = parsed?.models;
        const cachedAt = Number(parsed?.cachedAt || 0);

        if (!models || typeof models !== 'object') {
            return null;
        }

        const isFresh = cachedAt > 0 && (Date.now() - cachedAt) < MODELS_CACHE_TTL_MS;
        if (!allowStale && !isFresh) {
            return null;
        }

        return models;
    } catch {
        window.localStorage.removeItem(MODELS_CACHE_STORAGE_KEY);
        return null;
    }
};

const writeCachedModelCatalog = (models) => {
    if (typeof window === 'undefined' || !window.localStorage || !models || typeof models !== 'object') {
        return;
    }

    try {
        window.localStorage.setItem(MODELS_CACHE_STORAGE_KEY, JSON.stringify({
            cachedAt: Date.now(),
            models
        }));
    } catch {
        // Ignore storage failures.
    }
};

export const clearOpenRouterModelsCache = () => {
    if (typeof window === 'undefined' || !window.localStorage) {
        return;
    }

    try {
        window.localStorage.removeItem(MODELS_CACHE_STORAGE_KEY);
    } catch {
        // Ignore storage failures.
    }
};

export const getOpenRouterModelsCacheInfo = () => {
    if (typeof window === 'undefined' || !window.localStorage) {
        return { cachedAt: null };
    }

    try {
        const raw = window.localStorage.getItem(MODELS_CACHE_STORAGE_KEY);
        if (!raw) {
            return { cachedAt: null };
        }

        const parsed = JSON.parse(raw);
        const cachedAt = Number(parsed?.cachedAt || 0);
        return {
            cachedAt: cachedAt > 0 ? cachedAt : null
        };
    } catch {
        return { cachedAt: null };
    }
};

/**
 * Call OpenRouter API to improve a prompt
 * Routes through Worker in production, direct API in development
 * @param {string} prompt - The original prompt to improve
 * @param {string|string[]} modelSelection - OpenRouter model ID or fallback list
 * @param {Function} onStream - Optional streaming callback
 * @returns {Promise<{content: string, modelId: string|null}>} Improved prompt and resolved model
 */
export const improvePromptWithOpenRouter = async (prompt, modelSelection, onStream = null, heuristics = null, signal = null) => {
    let targetingHint = '';
    if (heuristics && Array.isArray(heuristics.issues) && heuristics.issues.length > 0) {
        targetingHint = `\n7. Specifically address these weaknesses: ${heuristics.issues.join('; ')}`;
    }

    const systemPrompt = `You are a world-class Prompt Engineer. Your task is to rewrite the user's prompt to be highly effective, structured, and clear.

Follow these rules:
1. Preserve the original meaning
2. Add a clear Persona (e.g., "You are an expert...")
3. Provide Context and background information
4. Specify a clear Output Format (e.g., "Return result as a Markdown table")
5. List specific Constraints to avoid generic or low-quality results
6. Keep your response concise and focused on the improved prompt only${targetingHint}`;

    const requestBody = {
        ...buildModelPayload(modelSelection),
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Improve this prompt: "${prompt}"` }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        stream: !!onStream
    };

    // Choose endpoint: Worker (production) or direct API (development)
    const { apiUrl, headers } = createOpenRouterRequestContext();

    if (onStream) {
        // Streaming implementation
        let fullResponse = '';
        let resolvedModelId = null;

        try {
            const response = await callOpenRouterWithRetry(apiUrl, headers, requestBody, 2, signal);

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') continue;

                        try {
                            const json = JSON.parse(data);
                            if (!resolvedModelId && typeof json.model === 'string') {
                                resolvedModelId = json.model;
                            }
                            const content = json.choices?.[0]?.delta?.content;
                            if (content) {
                                fullResponse += content;
                                onStream(fullResponse);
                            }
                        } catch (e) {
                            // Skip invalid JSON
                        }
                    }
                }
            }

            return {
                content: fullResponse.trim(),
                modelId: resolvedModelId || normalizeModelSelection(modelSelection)[0] || null
            };
        } catch (error) {
            throw wrapOpenRouterError(error);
        }
    } else {
        // Non-streaming implementation
        try {
            const response = await callOpenRouterWithRetry(apiUrl, headers, requestBody, 2, signal);

            const data = await response.json();
            if (data?.error) {
                throw new Error(data.error?.message || 'Provider returned an error response');
            }
            return {
                content: data.choices?.[0]?.message?.content?.trim() || 'No response received',
                modelId: typeof data?.model === 'string' ? data.model : (normalizeModelSelection(modelSelection)[0] || null)
            };
        } catch (error) {
            throw wrapOpenRouterError(error);
        }
    }
};

/**
 * Execute the user prompt directly (without any injected system prompt).
 * @param {string} prompt - User prompt to execute as-is
 * @param {string|string[]} modelSelection - OpenRouter model ID or fallback list
 * @param {Function|null} onStream - Optional streaming callback
 * @returns {Promise<{content: string, modelId: string|null}>} Model output and resolved model
 */
export const executePromptWithOpenRouter = async (prompt, modelSelection, onStream = null, signal = null) => {
    const requestBody = {
        ...buildModelPayload(modelSelection),
        messages: [
            { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1200,
        stream: !!onStream
    };

    const { apiUrl, headers } = createOpenRouterRequestContext();

    if (onStream) {
        let fullResponse = '';
        let resolvedModelId = null;

        const response = await callOpenRouterWithRetry(apiUrl, headers, requestBody, 2, signal);

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    if (data === '[DONE]') continue;

                    try {
                        const json = JSON.parse(data);
                        if (!resolvedModelId && typeof json.model === 'string') {
                            resolvedModelId = json.model;
                        }
                        const content = json.choices?.[0]?.delta?.content;
                        if (content) {
                            fullResponse += content;
                            onStream(fullResponse);
                        }
                    } catch {
                        // Ignore malformed chunks
                    }
                }
            }
        }

        return {
            content: fullResponse.trim(),
            modelId: resolvedModelId || normalizeModelSelection(modelSelection)[0] || null
        };
    }

    const response = await callOpenRouterWithRetry(apiUrl, headers, requestBody, 2, signal);

    const data = await response.json();
    if (data?.error) {
        throw new Error(data.error?.message || 'Provider returned an error response');
    }
    return {
        content: data.choices?.[0]?.message?.content?.trim() || 'No response received',
        modelId: typeof data?.model === 'string' ? data.model : (normalizeModelSelection(modelSelection)[0] || null)
    };
};

/**
 * Test OpenRouter API connection
 * @returns {Promise<boolean>} True if connection is successful
 */
export const testOpenRouterConnection = async () => {
    // In production with Worker, always return true if Worker URL is set
    if (USE_WORKER) {
        return true;
    }

    // In development, check if API key is configured
    if (!API_KEY) {
        return false;
    }

    try {
        const response = await fetch(`${API_BASE}/models`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'HTTP-Referer': window.location.href,
                'X-Title': 'Prompt Analyzer'
            }
        });
        return response.ok;
    } catch {
        return false;
    }
};

export const probeOpenRouterModel = async (modelId, signal = null) => {
    const requestBody = {
        model: modelId,
        messages: [
            { role: 'user', content: 'Reply with exactly: OK' }
        ],
        temperature: 0,
        max_tokens: 1,
        stream: false
    };

    try {
        const { apiUrl, headers } = createOpenRouterRequestContext();
        const response = await callOpenRouterWithRetry(apiUrl, headers, requestBody, 0, signal);
        const data = await response.json();

        if (data?.error) {
            return {
                status: 'unavailable',
                httpStatus: response.status || 0,
                reason: data.error?.message || 'Provider returned an error response'
            };
        }

        return {
            status: 'available',
            httpStatus: response.status || 200
        };
    } catch (error) {
        if (error?.name === 'AbortError') {
            throw error;
        }

        if (error?.status === 429) {
            return {
                status: 'rate_limited',
                httpStatus: 429,
                reason: error.message
            };
        }

        return {
            status: 'unavailable',
            httpStatus: error?.status || 0,
            reason: error?.message || 'Probe failed'
        };
    }
};

export const getOpenRouterKeyStatus = async (signal = null) => {
    const apiUrl = USE_WORKER ? `${WORKER_URL}/key` : `${API_BASE}/key`;
    const response = await fetch(apiUrl, {
        method: 'GET',
        headers: createOpenRouterAuthHeaders(),
        signal
    });

    const rawText = await response.text();
    let parsed;

    try {
        parsed = rawText ? JSON.parse(rawText) : {};
    } catch {
        parsed = {};
    }

    if (!response.ok) {
        const error = new Error(parsed?.error || `API error ${response.status}`);
        error.status = response.status;
        error.responseText = rawText;
        throw error;
    }

    const keyData = parsed?.data || {};

    return {
        label: keyData.label || '',
        limit: typeof keyData.limit === 'number' ? keyData.limit : null,
        limitRemaining: typeof keyData.limit_remaining === 'number' ? keyData.limit_remaining : null,
        limitReset: keyData.limit_reset || null,
        usage: typeof keyData.usage === 'number' ? keyData.usage : null,
        usageDaily: typeof keyData.usage_daily === 'number' ? keyData.usage_daily : null,
        usageWeekly: typeof keyData.usage_weekly === 'number' ? keyData.usage_weekly : null,
        usageMonthly: typeof keyData.usage_monthly === 'number' ? keyData.usage_monthly : null,
        isFreeTier: Boolean(keyData.is_free_tier),
        checkedAt: Date.now()
    };
};

/**
 * Get available OpenRouter models dynamically and keep only free ones.
 * @returns {Promise<Record<string, object>>} Free model catalog keyed for UI selection
 */
export const getAvailableModels = async (forceRefresh = false) => {
    const freshCache = forceRefresh ? null : readCachedModelCatalog();
    if (freshCache) {
        return freshCache;
    }

    try {
        const apiUrl = USE_WORKER ? `${WORKER_URL}/models` : `${API_BASE}/models`;
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: createOpenRouterAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Failed to fetch models');
        }

        const data = await response.json();
        const freeModels = sortNormalizedModels((data.data || []).filter(isFreeOpenRouterModel));

        if (freeModels.length === 0) {
            return { ...OPENROUTER_MODELS };
        }

        const normalizedModels = Object.fromEntries(freeModels.map(normalizeOpenRouterModel));
        writeCachedModelCatalog(normalizedModels);
        return normalizedModels;
    } catch (error) {
        console.error('Error fetching OpenRouter models:', error);
        const staleCache = readCachedModelCatalog(true);
        if (staleCache) {
            return staleCache;
        }
        return { ...OPENROUTER_MODELS };
    }
};

/**
 * Generate practical prompt examples using a configured OpenRouter model.
 * @param {string} seedPrompt - Optional user seed prompt/context
 * @param {string} modelId - The OpenRouter model ID
 * @returns {Promise<string[]>} List of generated prompt examples
 */
export const generatePromptExamplesWithOpenRouter = async (seedPrompt, modelId) => {
    const systemPrompt = `You generate practical, high-quality prompt examples for AI users.

Rules:
1. Return exactly 4 examples.
2. Each example must be concise, specific, and production-ready.
3. Cover varied use cases (strategy, content, technical, operations).
4. Return strict JSON only in this shape: {"examples":["...","...","...","..."]}`;

    const userPrompt = seedPrompt && seedPrompt.trim().length > 0
        ? `Create 4 prompt examples related to this context: ${seedPrompt}`
        : 'Create 4 high-impact prompt examples for B2B SaaS teams using AI assistants.';

    const requestBody = {
        model: modelId,
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 800,
        stream: false
    };

    const { apiUrl, headers } = createOpenRouterRequestContext();

    const response = await callOpenRouterWithRetry(apiUrl, headers, requestBody);

    const data = await response.json();
    if (data?.error) {
        throw new Error(data.error?.message || 'Provider returned an error response');
    }
    const raw = data.choices?.[0]?.message?.content?.trim() || '';
    if (!raw) {
        throw new Error('No response received from model');
    }

    let parsedExamples = [];

    try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed?.examples)) {
            parsedExamples = parsed.examples;
        }
    } catch {
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try {
                const parsed = JSON.parse(jsonMatch[0]);
                if (Array.isArray(parsed?.examples)) {
                    parsedExamples = parsed.examples;
                }
            } catch {
                // Fall back below
            }
        }
    }

    if (!parsedExamples.length) {
        parsedExamples = raw
            .split('\n')
            .map((line) => line.replace(/^[-*\d.)\s]+/, '').trim())
            .filter((line) => line.length > 0)
            .slice(0, 4);
    }

    return parsedExamples.slice(0, 4);
};
