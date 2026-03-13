/**
 * OpenRouter API Integration
 * Provides access to multiple AI models via OpenRouter service
 * Production: Uses Cloudflare Worker proxy for security
 * Development: Can use direct API calls with VITE_OPENROUTER_API_KEY
 */

// Pages Functions endpoint (production)
const WORKER_URL = 'https://promptup.cloud/api';

// Direct API endpoint (development fallback)
const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';
const API_BASE = 'https://openrouter.ai/api/v1';

// Use Worker in production, direct API in development
const USE_WORKER = !API_KEY || import.meta.env.PROD;

// OpenRouter free models configuration
export const OPENROUTER_MODELS = {
    'step-3-5-flash': {
        id: 'stepfun/step-3.5-flash',
        name: 'Step 3.5 Flash',
        provider: 'StepFun',
        size: '23.6B',
        context: '256K',
        price: '$0.00002/M tokens',
        description: 'Ultra-fast generation with large context window',
        engine: 'openrouter',
        recommended: true
    },
    'step-3': {
        id: 'stepfun/step-3',
        name: 'Step 3',
        provider: 'StepFun',
        size: '321B',
        context: '66K',
        price: '$0.00010/M tokens',
        description: 'High-quality generation with larger model',
        engine: 'openrouter'
    },
    'meta-llama-3.1-8b': {
        id: 'meta-llama/llama-3.1-8b-instruct:free',
        name: 'Llama 3.1 8B',
        provider: 'Meta',
        size: '8B',
        context: '128K',
        price: 'Free tier',
        description: 'Efficient open-source model from Meta',
        engine: 'openrouter'
    },
    'mistral-7b': {
        id: 'mistralai/mistral-7b-instruct:free',
        name: 'Mistral 7B',
        provider: 'Mistral AI',
        size: '7B',
        context: '32K',
        price: 'Free tier',
        description: 'Balanced performance for general tasks',
        engine: 'openrouter'
    }
};

/**
 * Call OpenRouter API to improve a prompt
 * Routes through Worker in production, direct API in development
 * @param {string} prompt - The original prompt to improve
 * @param {string} modelId - The OpenRouter model ID to use
 * @param {Function} onStream - Optional streaming callback
 * @returns {Promise<string>} Improved prompt
 */
export const improvePromptWithOpenRouter = async (prompt, modelId, onStream = null) => {
    const systemPrompt = `You are a world-class Prompt Engineer. Your task is to rewrite the user's prompt to be highly effective, structured, and clear.

Follow these rules:
1. Preserve the original meaning
2. Add a clear Persona (e.g., "You are an expert...")
3. Provide Context and background information
4. Specify a clear Output Format (e.g., "Return result as a Markdown table")
5. List specific Constraints to avoid generic or low-quality results
6. Keep your response concise and focused on the improved prompt only`;

    const requestBody = {
        model: modelId,
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Improve this prompt: "${prompt}"` }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        stream: !!onStream
    };

    // Choose endpoint: Worker (production) or direct API (development)
    const endpoint = USE_WORKER ? WORKER_URL : API_BASE;
    const headers = {
        'Content-Type': 'application/json'
    };

    // Only add Authorization header for direct API calls (not Worker)
    if (!USE_WORKER) {
        if (!API_KEY) {
            throw new Error('OpenRouter API key not configured. Please add VITE_OPENROUTER_API_KEY to .env.local');
        }
        headers['Authorization'] = `Bearer ${API_KEY}`;
        headers['HTTP-Referer'] = window.location.href;
        headers['X-Title'] = 'Prompt Analyzer';
    }

    const apiUrl = USE_WORKER ? endpoint : `${endpoint}/chat/completions`;

    if (onStream) {
        // Streaming implementation
        let fullResponse = '';

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers,
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || `API error: ${response.status}`);
            }

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

            return fullResponse.trim();
        } catch (error) {
            throw new Error(`OpenRouter API error: ${error.message}`);
        }
    } else {
        // Non-streaming implementation
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers,
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || `API error: ${response.status}`);
            }

            const data = await response.json();
            return data.choices?.[0]?.message?.content?.trim() || 'No response received';
        } catch (error) {
            throw new Error(`OpenRouter API error: ${error.message}`);
        }
    }
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
