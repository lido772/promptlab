/**
 * PromptUp Main Application
 * Secure implementation with XSS prevention and modern JavaScript
 */

import { DOM } from './dom-builder.js';
import Toast from './toast.js';
import Ads from './ads.js';

// Configuration
const CONFIG = {
    WORKER_URL: window.env?.WORKER_URL || "https://promptlab.lido772.workers.dev",
    onError: (error) => {
        console.error('PromptUp Error:', error);
    }
};

// AI Models Database
const modelsDatabase = {
    text: {
        'OpenAI': [
            { value: 'gpt4-turbo', label: 'GPT-4 Turbo' },
            { value: 'gpt4o', label: 'GPT-4o' },
            { value: 'gpt4o-mini', label: 'GPT-4o Mini' },
            { value: 'gpt35-turbo', label: 'GPT-3.5 Turbo' },
            { value: 'o1', label: 'o1 (Reasoning)' }
        ],
        'Anthropic': [
            { value: 'claude-35-sonnet', label: 'Claude 3.5 Sonnet' },
            { value: 'claude-3-opus', label: 'Claude 3 Opus' },
            { value: 'claude-3-haiku', label: 'Claude 3 Haiku' }
        ],
        'Google': [
            { value: 'gemini-20-flash', label: 'Gemini 2.0 Flash' },
            { value: 'gemini-pro', label: 'Gemini Pro' },
            { value: 'palm-2', label: 'PaLM 2' }
        ],
        'Meta': [
            { value: 'llama-31-405b', label: 'Llama 3.1 405B' },
            { value: 'llama-31-70b', label: 'Llama 3.1 70B' },
            { value: 'llama-3-70b', label: 'Llama 3 70B' }
        ],
        'Mistral': [
            { value: 'mistral-large', label: 'Mistral Large' },
            { value: 'mistral-medium', label: 'Mistral Medium' },
            { value: 'mistral-small', label: 'Mistral Small (7B)' }
        ],
        'xAI': [
            { value: 'grok-3', label: 'Grok 3' },
            { value: 'grok-2', label: 'Grok 2' }
        ],
        'Cohere': [
            { value: 'command-r-plus', label: 'Command R+' },
            { value: 'command-r', label: 'Command R' }
        ],
        'AWS': [
            { value: 'titan-text-premier', label: 'Titan Text Premier' },
            { value: 'titan-text-express', label: 'Titan Text Express' }
        ],
        'Alibaba': [
            { value: 'qwen-max', label: 'Qwen Max' },
            { value: 'qwen-plus', label: 'Qwen Plus' }
        ]
    },
    image: {
        'OpenAI': [
            { value: 'dalle3', label: 'DALL-E 3' },
            { value: 'dalle2', label: 'DALL-E 2' }
        ],
        'Stability AI': [
            { value: 'sdxl', label: 'Stable Diffusion XL 1.0' },
            { value: 'sd3', label: 'Stable Diffusion 3' },
            { value: 'sd3-turbo', label: 'Stable Diffusion 3 Turbo' }
        ],
        'Midjourney': [
            { value: 'mj-v6', label: 'Midjourney v6' },
            { value: 'mj-v5.2', label: 'Midjourney v5.2' }
        ],
        'Google': [
            { value: 'imagen-3', label: 'Imagen 3' },
            { value: 'imagen-2', label: 'Imagen 2' }
        ],
        'Adobe': [
            { value: 'firefly-v3', label: 'Firefly v3' }
        ],
        'Leonardo.AI': [
            { value: 'leonardo-diffusion', label: 'Leonardo Diffusion' },
            { value: 'leonardo-vision', label: 'Leonardo Vision' }
        ]
    },
    video: {
        'OpenAI': [
            { value: 'sora', label: 'Sora' }
        ],
        'Google': [
            { value: 'gemini-video', label: 'Gemini Video' },
            { value: 'veo', label: 'Veo' }
        ],
        'Runway': [
            { value: 'gen3-alpha', label: 'Gen-3 Alpha' },
            { value: 'gen2', label: 'Gen-2' }
        ],
        'Pika': [
            { value: 'pika-20', label: 'Pika 2.0' }
        ],
        'HeyGen': [
            { value: 'heygen-avatar', label: 'HeyGen Avatar' }
        ],
        'Synthesia': [
            { value: 'synthesia-v1', label: 'Synthesia v1' }
        ]
    },
    audio: {
        'OpenAI': [
            { value: 'whisper', label: 'Whisper (Speech-to-Text)' },
            { value: 'tts-1', label: 'TTS-1 (Text-to-Speech)' },
            { value: 'tts-1-hd', label: 'TTS-1 HD' }
        ],
        'Google': [
            { value: 'google-stt', label: 'Speech-to-Text' },
            { value: 'google-tts', label: 'Text-to-Speech' }
        ],
        'ElevenLabs': [
            { value: 'eleven-v3', label: 'ElevenLabs v3' },
            { value: 'eleven-v2', label: 'ElevenLabs v2' }
        ],
        'Anthropic': [
            { value: 'claude-audio', label: 'Claude Audio (Native)' }
        ],
        'Deepgram': [
            { value: 'deepgram-nova-2', label: 'Nova-2' },
            { value: 'deepgram-nova', label: 'Nova' }
        ]
    },
    code: {
        'OpenAI': [
            { value: 'gpt4-code', label: 'GPT-4 Turbo' },
            { value: 'gpt4o-code', label: 'GPT-4o' },
            { value: 'codex', label: 'Codex (Legacy)' }
        ],
        'GitHub': [
            { value: 'copilot', label: 'GitHub Copilot X' }
        ],
        'Anthropic': [
            { value: 'claude-code', label: 'Claude 3.5 Sonnet' },
            { value: 'claude-opus-code', label: 'Claude 3 Opus' }
        ],
        'Meta': [
            { value: 'codellama-34b', label: 'Code Llama 34B' },
            { value: 'codellama-13b', label: 'Code Llama 13B' },
            { value: 'codellama-7b', label: 'Code Llama 7B' }
        ],
        'Google': [
            { value: 'codey', label: 'Codey (PaLM)' }
        ]
    }
};

// Update providers dropdown (SECURE: no innerHTML)
function updateProviders() {
    const modality = document.getElementById('modalitySelect').value;
    const providers = Object.keys(modelsDatabase[modality]);
    const providerSelect = document.getElementById('providerSelect');

    // Clear existing options
    DOM.clear(providerSelect);

    // Add default option
    const defaultOption = DOM.createElement('option', {
        value: '',
        text: 'Select Provider...'
    });
    providerSelect.appendChild(defaultOption);

    // Add provider options
    providers.forEach(provider => {
        const option = DOM.createElement('option', {
            value: provider,
            text: provider
        });
        providerSelect.appendChild(option);
    });

    updateModels();
}

// Update models dropdown (SECURE: no innerHTML)
function updateModels() {
    const modality = document.getElementById('modalitySelect').value;
    const provider = document.getElementById('providerSelect').value;
    const modelSelect = document.getElementById('modelSelect');

    // Clear existing options
    DOM.clear(modelSelect);

    // Add default option
    const defaultOption = DOM.createElement('option', {
        value: '',
        text: 'Select Model...'
    });
    modelSelect.appendChild(defaultOption);

    if (!provider) return;

    const models = modelsDatabase[modality][provider];
    if (models) {
        models.forEach(model => {
            const option = DOM.createElement('option', {
                value: model.value,
                text: model.label
            });
            modelSelect.appendChild(option);
        });
    }
}

// AI Prompt Analyzer
function analyzePrompt(prompt, model, modality) {
    const metrics = {
        clarity: calculateClarity(prompt),
        specificity: calculateSpecificity(prompt, modality),
        structure: calculateStructure(prompt, modality),
        actionability: calculateActionability(prompt, modality)
    };

    const overallScore = Math.round(
        (metrics.clarity + metrics.specificity + metrics.structure + metrics.actionability) / 4
    );

    return {
        score: overallScore,
        metrics,
        feedback: generateFeedback(prompt, metrics, modality),
        suggestions: generateSuggestions(prompt, metrics, modality)
    };
}

function calculateClarity(prompt) {
    const words = prompt.split(/\s+/).length;
    const clarity = Math.min(100, (words / 50) * 100);
    return Math.round(clarity);
}

function calculateSpecificity(prompt, modality) {
    let score = 50;
    if (prompt.match(/\d+/)) score += 15;
    if (prompt.includes('specific') || prompt.includes('exactly') || prompt.includes('detailed')) score += 10;

    if (modality === 'image') {
        if (prompt.includes('style') || prompt.includes('color') || prompt.includes('size')) score += 10;
    } else if (modality === 'video') {
        if (prompt.includes('duration') || prompt.includes('speed') || prompt.includes('scene')) score += 10;
    } else if (modality === 'audio') {
        if (prompt.includes('voice') || prompt.includes('tone') || prompt.includes('accent')) score += 10;
    } else if (modality === 'code') {
        if (prompt.includes('language') || prompt.includes('function') || prompt.includes('format')) score += 10;
    }

    return Math.min(100, score);
}

function calculateStructure(prompt, modality) {
    let score = 50;
    const hasContext = prompt.match(/[A-Z]{2,}/) || prompt.includes('You are') || prompt.includes('As a');
    const hasTask = prompt.includes('create') || prompt.includes('write') || prompt.includes('generate') || prompt.includes('show') || prompt.includes('make');
    const hasConstraints = prompt.includes('don\'t') || prompt.includes('avoid') || prompt.includes('must') || prompt.includes('should');

    if (hasContext) score += 20;
    if (hasTask) score += 20;
    if (hasConstraints) score += 10;
    return Math.min(100, score);
}

function calculateActionability(prompt, modality) {
    let score = 50;
    const actionVerbs = {
        text: ['write', 'create', 'generate', 'analyze', 'explain', 'summarize', 'list', 'compare', 'design', 'build'],
        image: ['create', 'generate', 'design', 'draw', 'paint', 'render', 'illustrate', 'visualize'],
        video: ['create', 'generate', 'produce', 'show', 'make', 'film', 'animate'],
        audio: ['create', 'generate', 'speak', 'voice', 'narrate', 'produce', 'synthesize'],
        code: ['write', 'create', 'generate', 'build', 'develop', 'implement', 'code']
    };

    const verbs = actionVerbs[modality] || actionVerbs.text;
    const hasActionVerb = verbs.some(verb => prompt.toLowerCase().includes(verb));

    if (hasActionVerb) score += 25;
    if (prompt.split('.').length > 2) score += 15;
    return Math.min(100, score);
}

function generateFeedback(prompt, metrics, modality) {
    const lowest = Math.min(...Object.values(metrics));
    const modalityName = { text: 'text', image: 'image', video: 'video', audio: 'audio', code: 'code' }[modality];

    if (lowest >= 80) return `Excellent ${modalityName} prompt! You've included clear context, specific requirements, and actionable instructions.`;
    if (lowest >= 60) return `Good work. Your ${modalityName} prompt is clear but could benefit from more specific details.`;
    return `Your ${modalityName} prompt has potential. Add more specific details about what you want.`;
}

function generateSuggestions(prompt, metrics, modality) {
    const suggestions = [];

    if (metrics.clarity < 70) suggestions.push("Add more context at the beginning");
    if (metrics.specificity < 70) {
        if (modality === 'image') suggestions.push("Describe style, colors, and composition details");
        else if (modality === 'video') suggestions.push("Specify duration, scene details, and transitions");
        else if (modality === 'audio') suggestions.push("Describe voice type, tone, and accent preferences");
        else if (modality === 'code') suggestions.push("Specify programming language, output format, and requirements");
        else suggestions.push("Include specific numbers, formats, or example outputs");
    }
    if (metrics.structure < 70) suggestions.push("Organize: Context → Task → Constraints → Details");
    if (metrics.actionability < 70) suggestions.push("Start with a clear action verb (Create, Generate, Build, etc.)");

    if (suggestions.length === 0) suggestions.push("This is a solid prompt! Consider adding more edge cases or specific examples.");

    return suggestions;
}

// Display analysis results (SECURE: uses DOM builder)
function displayResults(result, model, modality) {
    const resultsPanel = document.getElementById('resultsPanel');
    const scoreClass = result.score >= 80 ? 'excellent' : result.score >= 60 ? 'good' : 'fair';

    // Get selected model label safely
    const modelSelect = document.getElementById('modelSelect');
    const selectedOption = modelSelect.options[modelSelect.selectedIndex];
    const modelLabel = DOM.sanitize(selectedOption.text || 'Unknown Model');

    // Create result card
    const resultCard = DOM.createElement('div', {
        className: 'result-card',
        children: [
            DOM.createElement('div', {
                className: 'result-header',
                children: [
                    DOM.createElement('div', {
                        className: 'model-name',
                        text: `${modelLabel} Analysis`
                    }),
                    DOM.createElement('div', {
                        className: `score ${scoreClass}`,
                        text: `${result.score}/100`
                    })
                ]
            }),
            DOM.createElement('div', {
                className: 'feedback',
                text: result.feedback // Safe: textContent
            }),
            DOM.createElement('div', {
                className: 'metrics',
                children: [
                    createMetric('Clarity', result.metrics.clarity),
                    createMetric('Specificity', result.metrics.specificity),
                    createMetric('Structure', result.metrics.structure),
                    createMetric('Actionability', result.metrics.actionability)
                ]
            })
        ]
    });

    DOM.clear(resultsPanel);
    resultsPanel.appendChild(resultCard);

    // Add optimization tips if any
    if (result.suggestions.length > 0) {
        const tipsCard = DOM.createElement('div', {
            className: 'result-card',
            children: [
                DOM.createElement('h3', {
                    text: '💡 Optimization Tips',
                    style: { marginBottom: '15px', color: '#fff' }
                })
            ]
        });

        result.suggestions.forEach((suggestion, i) => {
            const tipElement = DOM.createElement('div', {
                style: {
                    marginBottom: '12px',
                    padding: '12px',
                    background: 'rgba(0,212,255,0.1)',
                    borderLeft: '2px solid #00d4ff',
                    borderRadius: '4px',
                    color: '#aaa',
                    fontSize: '14px'
                },
                text: `${i + 1}. ${DOM.sanitize(suggestion)}` // Safe: textContent
            });
            tipsCard.appendChild(tipElement);
        });

        resultsPanel.appendChild(tipsCard);
    }

    // Add post-results ad placeholder
    const adContainer = DOM.createElement('div', {
        id: 'issPostResults',
        className: 'ad-banner-iss',
        attributes: {
            'data-iss-slot': 'post-728x90',
            'id-ad': 'ad-post-results-iss'
        },
        style: {
            marginTop: '20px',
            minHeight: '250px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255,255,255,0.02)',
            border: '1px dashed rgba(255,255,255,0.05)',
            borderRadius: '8px'
        },
        children: [
            DOM.createElement('div', {
                className: 'iss-placeholder',
                text: 'Loading Ad...',
                style: { color: '#666', fontSize: '14px' }
            })
        ]
    });

    resultsPanel.appendChild(adContainer);
}

function createMetric(label, value) {
    return DOM.createElement('div', {
        className: 'metric',
        children: [
            DOM.createElement('div', {
                className: 'metric-label',
                text: label
            }),
            DOM.createElement('div', {
                className: 'metric-value',
                text: `${value}%`
            })
        ]
    });
}

// Test prompt function
function testPrompt() {
    const prompt = document.getElementById('promptInput').value.trim();
    const model = document.getElementById('modelSelect').value;
    const modality = document.getElementById('modalitySelect').value;
    const resultsPanel = document.getElementById('resultsPanel');

    if (!prompt) {
        Toast.warning('Please enter a prompt to analyze');
        return;
    }

    if (!model) {
        Toast.warning('Please select a model');
        return;
    }

    // Show loading state (SECURE: no innerHTML)
    const loadingElement = DOM.createElement('div', {
        className: 'loading',
        children: [
            DOM.createElement('div', { className: 'spinner' }),
            DOM.createElement('div', { text: 'Analyzing your prompt...' })
        ]
    });

    DOM.clear(resultsPanel);
    resultsPanel.appendChild(loadingElement);

    // Simulate processing delay
    setTimeout(() => {
        const result = analyzePrompt(prompt, model, modality);
        displayResults(result, model, modality);
    }, 800);
}

// Improve prompt (free)
async function improvePromptFree() {
    const prompt = document.getElementById('promptInput').value.trim();

    if (!prompt) {
        Toast.warning('Please enter a prompt first');
        return;
    }

    const resultsPanel = document.getElementById('resultsPanel');

    // Show loading (SECURE: no innerHTML)
    const loadingElement = DOM.createElement('div', {
        className: 'loading',
        children: [
            DOM.createElement('div', { className: 'spinner' }),
            DOM.createElement('div', { text: 'Improving prompt...' })
        ]
    });

    DOM.clear(resultsPanel);
    resultsPanel.appendChild(loadingElement);

    try {
        const response = await fetch(CONFIG.WORKER_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Request failed");
        }

        const improved = data.result;
        const remainingFree = data.remainingFree ?? 0;
        const dailyLimit = data.dailyLimit ?? 3;
        const safeImproved = DOM.sanitize(improved);

        // Create result display (SECURE: uses DOM builder)
        const resultCard = DOM.createElement('div', {
            className: 'result-card',
            children: [
                DOM.createElement('h3', {
                    text: '🔧 Improved Prompt',
                    style: { color: '#fff', marginBottom: '12px' }
                }),
                DOM.createElement('textarea', {
                    id: 'improvedOutput',
                    style: { height: '160px' },
                    text: safeImproved
                }),
                DOM.createElement('div', {
                    style: { display: 'flex', gap: '10px', marginTop: '10px' },
                    children: [
                        DOM.createElement('button', {
                            text: 'Use This Prompt',
                            dataset: { action: 'apply-improved' }
                        }),
                        DOM.createElement('button', {
                            text: 'Copy',
                            className: 'btn-secondary',
                            dataset: { action: 'copy-improved' }
                        })
                    ]
                }),
                DOM.createElement('div', {
                    style: {
                        marginTop: '15px',
                        padding: '10px',
                        background: 'rgba(16,185,129,0.1)',
                        borderRadius: '6px',
                        textAlign: 'center'
                    },
                    children: [
                        DOM.createElement('span', {
                            style: { color: '#10b981', fontSize: '14px' },
                            text: `🎉 Free improvements remaining today: ${remainingFree}/${dailyLimit}`
                        })
                    ]
                })
            ]
        });

        DOM.clear(resultsPanel);
        resultsPanel.appendChild(resultCard);

        // Update daily counter
        updateDailyCounter(remainingFree, dailyLimit);
        cacheDailyLimit(remainingFree, dailyLimit);

    } catch (err) {
        let errorMessage = err.message;

        // Check if it's a daily limit error
        if (errorMessage.includes('Daily free limit reached')) {
            const resetTime = data?.resetAt ? new Date(data.resetAt).toLocaleTimeString() : 'midnight';

            // Create limit reached message (SECURE: no innerHTML)
            const limitCard = DOM.createElement('div', {
                className: 'result-card',
                style: { textAlign: 'center' },
                children: [
                    DOM.createElement('div', {
                        style: { fontSize: '48px', marginBottom: '15px' },
                        text: '🔒'
                    }),
                    DOM.createElement('h3', {
                        text: 'Daily Limit Reached',
                        style: { color: '#fbbf24', marginBottom: '12px' }
                    }),
                    DOM.createElement('p', {
                        text: "You've used all 3 free prompt improvements for today.",
                        style: { color: '#aaa', marginBottom: '15px' }
                    }),
                    DOM.createElement('p', {
                        text: `Resets at ${resetTime}`,
                        style: { color: '#666', fontSize: '14px', marginBottom: '20px' }
                    }),
                    DOM.createElement('button', {
                        text: '💜 Continue with Ad Support',
                        dataset: { action: 'improve-prompt-rewarded' },
                        style: { background: 'linear-gradient(135deg,#f59e0b,#f97316)' }
                    })
                ]
            });

            DOM.clear(resultsPanel);
            resultsPanel.appendChild(limitCard);

            updateDailyCounter(0, 3);
            cacheDailyLimit(0, 3);
            return;
        }

        const safeErrorMessage = DOM.sanitize(errorMessage);
        const errorElement = DOM.createElement('div', {
            className: 'result-card',
            style: { color: '#f87171' },
            text: `Error improving prompt: ${safeErrorMessage}`
        });

        DOM.clear(resultsPanel);
        resultsPanel.appendChild(errorElement);
    }
}

// Apply improved prompt
function applyImproved() {
    const v = document.getElementById('improvedOutput')?.value;
    if (v) document.getElementById('promptInput').value = v;
}

// Copy improved prompt
function copyImproved() {
    const v = document.getElementById('improvedOutput')?.value;
    if (!v) return Toast.warning('Nothing to copy');
    navigator.clipboard?.writeText(v).then(() => Toast.success('Copied to clipboard'));
}

// Rewarded prompt improvement
let rewardedResolve = null;
let rewardedReject = null;

async function improvePromptRewarded() {
    const prompt = document.getElementById('promptInput').value.trim();
    if (!prompt) {
        Toast.warning('Please enter a prompt first');
        return;
    }

    try {
        await showRewardedAd();
    } catch (e) {
        return;
    }

    const resultsPanel = document.getElementById('resultsPanel');
    const loadingElement = DOM.createElement('div', {
        className: 'loading',
        children: [
            DOM.createElement('div', { className: 'spinner' }),
            DOM.createElement('div', { text: 'Improving prompt after reward...' })
        ]
    });

    DOM.clear(resultsPanel);
    resultsPanel.appendChild(loadingElement);

    try {
        const resp = await fetch(CONFIG.WORKER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, rewarded: true })
        });
        const json = await resp.json();
        if (!resp.ok) throw new Error(json.error || 'Failed');

        const improved = json.result || '';
        const safeImproved = DOM.sanitize(improved);

        // Create rewarded result display
        const resultCard = DOM.createElement('div', {
            className: 'result-card',
            children: [
                DOM.createElement('h3', {
                    text: '🏆 Rewarded Improvement',
                    style: { color: '#fff', marginBottom: '12px' }
                }),
                DOM.createElement('textarea', {
                    id: 'improvedOutput',
                    style: { height: '160px' },
                    text: safeImproved
                }),
                DOM.createElement('div', {
                    style: { display: 'flex', gap: '10px', marginTop: '10px' },
                    children: [
                        DOM.createElement('button', {
                            text: 'Use This Prompt',
                            dataset: { action: 'apply-improved' }
                        }),
                        DOM.createElement('button', {
                            text: 'Copy',
                            className: 'btn-secondary',
                            dataset: { action: 'copy-improved' }
                        })
                    ]
                }),
                DOM.createElement('div', {
                    style: {
                        marginTop: '15px',
                        padding: '10px',
                        background: 'rgba(249,115,22,0.1)',
                        borderRadius: '6px',
                        textAlign: 'center'
                    },
                    children: [
                        DOM.createElement('span', {
                            style: { color: '#f97316', fontSize: '14px' },
                            text: '🎁 Rewarded improvement — no daily limit deducted!'
                        })
                    ]
                })
            ]
        });

        DOM.clear(resultsPanel);
        resultsPanel.appendChild(resultCard);

    } catch (err) {
        const safeError = DOM.sanitize(err.message || 'Unknown error');
        const errorElement = DOM.createElement('div', {
            className: 'result-card',
            style: { color: '#f87171' },
            text: `Error improving prompt: ${safeError}`
        });

        DOM.clear(resultsPanel);
        resultsPanel.appendChild(errorElement);
    }
}

// Show rewarded ad modal
function showRewardedAd() {
    return new Promise((resolve, reject) => {
        rewardedResolve = resolve;
        rewardedReject = reject;

        const overlay = document.getElementById('rewardedOverlay');
        const adContentISS = document.getElementById('adContentISS');
        const adContent = document.getElementById('adContent');
        const adContentFallback = document.getElementById('adContentFallback');
        const placeholder = document.getElementById('rewardedPlaceholder');

        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';

        if (adContentISS) {
            adContentISS.style.display = 'block';
            if (adContent) adContent.style.display = 'none';
            if (adContentFallback) adContentFallback.style.display = 'none';
            if (placeholder) placeholder.style.display = 'none';

            window.setupRewardedAdFallback();
        }
    });
}

function claimReward() {
    closeRewardedModal();
    if (rewardedResolve) {
        rewardedResolve();
        rewardedResolve = null;
        rewardedReject = null;
    }
}

function cancelReward() {
    closeRewardedModal();
    if (rewardedReject) {
        rewardedReject(new Error('User cancelled'));
        rewardedResolve = null;
        rewardedReject = null;
    }
}

function closeRewardedModal() {
    const overlay = document.getElementById('rewardedOverlay');
    if (overlay) {
        overlay.classList.remove('active');
    }
    document.body.style.overflow = '';
}

// Daily limit management
function checkDailyLimit() {
    const dailyCounter = document.getElementById('dailyCounter');
    if (!dailyCounter) return;

    try {
        const today = new Date().toISOString().split('T')[0];
        const cached = JSON.parse(localStorage.getItem('promptup_daily') || '{}');

        if (cached.date === today && typeof cached.remaining === 'number') {
            updateDailyCounter(cached.remaining, cached.total || 3);
        } else {
            updateDailyCounter(3, 3);
        }
    } catch (err) {
        dailyCounter.textContent = '3/3 free today';
    }
}

function cacheDailyLimit(remaining, total) {
    try {
        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem('promptup_daily', JSON.stringify({
            date: today,
            remaining,
            total
        }));
    } catch (e) { }
}

function updateDailyCounter(remaining, total) {
    const dailyCounter = document.getElementById('dailyCounter');
    if (!dailyCounter) return;

    if (remaining <= 0) {
        dailyCounter.innerHTML = `<span style="color:#fbbf24">⚠️ Daily limit reached (${total}/${total} used)</span>`;
    } else {
        dailyCounter.innerHTML = `✨ ${remaining}/${total} free improvements remaining today`;
    }
}

// Social sharing
function shareOnTwitter() {
    const prompt = document.getElementById('promptInput').value.trim();
    const score = document.querySelector('.score')?.textContent || '?';
    const text = prompt
        ? `I just tested my prompt on PromptUp - Score: ${score}/100. The AI-powered analysis helped me optimize it! Try it free: promptup.cloud`
        : 'Just discovered PromptUp - a free tool to test and optimize AI prompts. Works with ChatGPT, Claude, and more. promptup.cloud';
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
}

function goToPremium() {
    Toast.info('Premium features coming soon! Join the waitlist: promptup.cloud/premium');
}

// Event delegation for action buttons
function handleActionButtons(e) {
    const button = e.target.closest('[data-action]');
    if (!button) return;

    const action = button.dataset.action;

    switch (action) {
        case 'test-prompt':
            testPrompt();
            break;
        case 'improve-free':
            improvePromptFree();
            break;
        case 'improve-rewarded':
        case 'improve-prompt-rewarded':
            improvePromptRewarded();
            break;
        case 'apply-improved':
            applyImproved();
            break;
        case 'copy-improved':
            copyImproved();
            break;
        case 'claim-reward':
            claimReward();
            break;
        case 'cancel-reward':
            cancelReward();
            break;
        case 'close-modal':
            closeRewardedModal();
            if (rewardedReject) {
                rewardedReject(new Error('User cancelled'));
                rewardedResolve = null;
                rewardedReject = null;
            }
            break;
        case 'share-twitter':
            shareOnTwitter();
            break;
        case 'go-premium':
            goToPremium();
            break;
    }
}

// Initialize application
function init() {
    // Setup event delegation
    document.body.addEventListener('click', handleActionButtons);

    // Add change event listeners for selects
    const modalitySelect = document.getElementById('modalitySelect');
    const providerSelect = document.getElementById('providerSelect');

    if (modalitySelect) {
        modalitySelect.addEventListener('change', updateProviders);
    }
    if (providerSelect) {
        providerSelect.addEventListener('change', updateModels);
    }

    // Add keyboard shortcut (Ctrl+Enter to test)
    const promptInput = document.getElementById('promptInput');
    if (promptInput) {
        promptInput.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                testPrompt();
            }
        });
    }

    // Initialize providers and check daily limit
    updateProviders();
    checkDailyLimit();

    // Initialize ads
    Ads.init();
    Ads.loadDynamicAds();
    Ads.monitorAdFallback();
}

// Export for use in HTML
window.PromptUpApp = {
    init,
    updateProviders,
    updateModels,
    testPrompt,
    improvePromptFree,
    improvePromptRewarded,
    applyImproved,
    copyImproved,
    showRewardedAd,
    claimReward,
    cancelReward,
    closeRewardedModal,
    shareOnTwitter,
    goToPremium
};

// Auto-initialize on DOMContentLoaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

export default {
    init,
    updateProviders,
    updateModels,
    testPrompt,
    improvePromptFree,
    improvePromptRewarded
};
