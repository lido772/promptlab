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
        id: 'meta-llama/llama-3.2-3b-instruct:free',
        name: 'Llama 3.2 3B Instruct (free)',
        provider: 'Meta',
        size: '3B',
        context: '128K',
        price: '$0/M tokens',
        description: 'Fast lightweight model for low-latency prompt execution and quick rewrites',
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
        id: 'google/gemma-3n-e4b-it:free',
        name: 'Gemma 3n E4B IT (free)',
        provider: 'Google',
        size: 'E4B',
        context: '32K',
        price: '$0/M tokens',
        description: 'Efficient instruction model with good quality/speed tradeoff for production prompts',
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
    'venice-uncensored': {
        id: 'venice/uncensored:free',
        name: 'Venice Uncensored (free)',
        provider: 'Venice',
        size: '24B',
        context: '33K',
        price: '$0/M tokens',
        description: 'High-steerability instruct model with minimal alignment constraints',
        engine: 'openrouter'
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

/**
 * Get available OpenRouter models
 * @returns {Promise<Array>} List of available models
 */
export const getAvailableModels = async () => {
    // In production with Worker, return predefined models
    if (USE_WORKER) {
        return Object.values(OPENROUTER_MODELS);
    }

    // In development, fetch from API
    if (!API_KEY) {
        return [];
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

        if (!response.ok) {
            throw new Error('Failed to fetch models');
        }

        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.error('Error fetching OpenRouter models:', error);
        return [];
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
