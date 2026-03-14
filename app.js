/**
 * Main Application Logic
 * Static Prompt Analyzer
 */

import { analyzePromptHeuristics } from './promptAnalyzer.js';
import { OPENROUTER } from './modelSelector.js';
import { improvePromptWithOpenRouter } from './openRouter.js';
import { generatePromptExamplesWithOpenRouter } from './openRouter.js';
import { i18n } from './i18n.js';
import { runHeuristicTests } from './test-prompts.js';

// DOM Selectors
const promptInput = document.getElementById('prompt-input');
const analyzeBtn = document.getElementById('analyze-btn');
const resultsArea = document.getElementById('results-area');
const topFixesSummaryEl = document.getElementById('top-fixes-summary');
const topFixesListEl = document.getElementById('top-fixes-list');
const workflowStepInput = document.getElementById('wf-step-input');
const workflowStepAnalyze = document.getElementById('wf-step-analyze');
const workflowStepImprove = document.getElementById('wf-step-improve');
const workflowStepExport = document.getElementById('wf-step-export');
const themeToggleBtn = document.getElementById('theme-toggle');
const themeToggleIcon = document.getElementById('theme-toggle-icon');
const themeToggleLabel = document.getElementById('theme-toggle-label');
const heroTryExampleBtn = document.getElementById('hero-try-example-btn');
const sampleMarketingBtn = document.getElementById('sample-marketing-btn');
const sampleCodingBtn = document.getElementById('sample-coding-btn');
const generateExamplesBtn = document.getElementById('generate-examples-btn');
const copyBtn = document.getElementById('copy-btn');
const exportTxtBtn = document.getElementById('export-txt-btn');
const exportMdBtn = document.getElementById('export-md-btn');

// Language Selector UI - Removed (English only)

// Model Selector UI
const generateAIBtn = document.getElementById('generate-ai-btn');
const openRouterModelSelectorEl = document.getElementById('openrouter-model-selector');
const modelInfoTriggerEl = document.getElementById('model-info-trigger');
const modelInfoTextEl = document.getElementById('model-info-text');
const aiExamplesStatusEl = document.getElementById('ai-examples-status');
const aiExamplesListEl = document.getElementById('ai-examples-list');
const donationAmountEl = document.getElementById('donation-amount');
const donationCurrencyEl = document.getElementById('donation-currency');
const donationPayCurrencyEl = document.getElementById('donation-pay-currency');
const donationEmailEl = document.getElementById('donation-email');
const donationBtn = document.getElementById('donate-btn');
const donationStatusEl = document.getElementById('donation-status');

// Results Display
const totalScoreEl = document.getElementById('total-score');
const scoreProgressEl = document.getElementById('score-progress');
const issuesListEl = document.getElementById('issues-list');
const improvedPromptEl = document.getElementById('improved-prompt');

// Scores
const roleScoreEl = document.getElementById('role-score');
const outputScoreEl = document.getElementById('output-score');
const constraintsScoreEl = document.getElementById('constraints-score');
const contextScoreEl = document.getElementById('context-score');
const completenessScoreEl = document.getElementById('completeness-score');
const consistencyScoreEl = document.getElementById('consistency-score');
const scoreBreakdownListEl = document.getElementById('score-breakdown-list');

// State
let currentLang = 'en'; // English only
let currentModelPath = null;
let isUsingOpenRouter = false;

const API_MODELS = {
    ...OPENROUTER
};

const THEME_STORAGE_KEY = 'promptup-theme';

const SCORE_BREAKDOWN_DESCRIPTIONS = {
    role: 'Checks whether the prompt clearly assigns a role, persona, or expertise level to the AI. Example: "You are a senior SEO strategist."',
    outputFormat: 'Measures how clearly the expected response format is defined, such as markdown, JSON, list, or table. Example: "Return the result as a markdown table."',
    constraints: 'Evaluates whether the prompt includes limits, rules, requirements, or boundaries that guide the response. Example: "Keep it under 200 words and avoid jargon."',
    context: 'Scores how much background, objective, audience, or situation is provided to frame the task. Example: "This is for a SaaS startup targeting HR teams."',
    specificity: 'Looks for concrete details like numbers, examples, named entities, or precise wording instead of vague language. Example: "Create a 30-day plan with 3 channels and 5 KPIs."',
    clarity: 'Measures how readable and understandable the wording is, without being too short or overly convoluted. Example: a direct request with one clear objective scores better than a vague sentence.',
    structure: 'Checks whether the prompt is organized with sections, lists, line breaks, or other formatting cues. Example: separate blocks for Context, Task, Output, and Constraints.',
    completeness: 'Evaluates whether the request defines enough instructions and success criteria to produce a useful answer. Example: "Include recommendations, risks, and next steps."',
    consistency: 'Checks whether the different parts of the prompt agree with each other without conflicting instructions. Example: asking for JSON output and later asking for a narrative essay lowers consistency.',
    length: 'Measures whether the prompt is long enough to be useful without becoming unnecessarily verbose. Example: one short sentence may be too thin; several focused lines usually score better.'
};

const getInitialTheme = () => {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (storedTheme === 'light' || storedTheme === 'dark') {
        return storedTheme;
    }
    const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    return prefersLight ? 'light' : 'dark';
};

const applyTheme = (theme) => {
    const resolvedTheme = theme === 'light' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', resolvedTheme);
    localStorage.setItem(THEME_STORAGE_KEY, resolvedTheme);

    if (!themeToggleBtn) {
        return;
    }

    const isLight = resolvedTheme === 'light';
    themeToggleBtn.setAttribute('aria-pressed', String(isLight));
    themeToggleBtn.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');

    if (themeToggleIcon) {
        themeToggleIcon.textContent = isLight ? '🌙' : '☀';
    }
    if (themeToggleLabel) {
        themeToggleLabel.textContent = isLight ? 'Dark mode' : 'Light mode';
    }
};

const initTheme = () => {
    applyTheme(getInitialTheme());

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
            applyTheme(currentTheme === 'light' ? 'dark' : 'light');
        });
    }
};

const setWorkflowStep = (step) => {
    const steps = [
        { el: workflowStepInput, key: 'input' },
        { el: workflowStepAnalyze, key: 'analyze' },
        { el: workflowStepImprove, key: 'improve' },
        { el: workflowStepExport, key: 'export' }
    ];

    const order = ['input', 'analyze', 'improve', 'export'];
    const activeIndex = order.indexOf(step);

    steps.forEach(({ el, key }) => {
        if (!el) return;
        el.classList.remove('workflow-step-active', 'workflow-step-complete');
        const idx = order.indexOf(key);
        if (idx < activeIndex) {
            el.classList.add('workflow-step-complete');
        } else if (idx === activeIndex) {
            el.classList.add('workflow-step-active');
        }
    });
};

const revealAIOptions = () => {
    setWorkflowStep('improve');
};

const getModelStatusMessage = (ui) => {
    if (isUsingOpenRouter && currentModelPath) {
        const loadedModel = Object.values(API_MODELS).find((model) => model.id === currentModelPath);
        return `${ui.modelLoaded}: ${loadedModel?.name || ''}`;
    }
    return ui.modelNotLoaded;
};

/**
 * Update UI Text based on current language
 */
const updateLanguageUI = () => {
    const config = i18n.en;
    const ui = config.ui;

    // Static Elements
    document.getElementById('ui-title').textContent = ui.title;
    document.getElementById('ui-subtitle').innerHTML = ui.subtitle;
    document.getElementById('ui-yourPrompt').textContent = ui.yourPrompt;
    promptInput.placeholder = ui.placeholder;
    if (analyzeBtn) {
        analyzeBtn.textContent = ui.analyzeBtn;
    }
    generateAIBtn.textContent = ui.generateBtn;
    document.getElementById('ui-qualityScore').textContent = ui.qualityScore;
    const metricRoleEl = document.getElementById('ui-metric-role');
    const metricFormatEl = document.getElementById('ui-metric-format');
    const metricConstraintsEl = document.getElementById('ui-metric-constraints');
    const metricContextEl = document.getElementById('ui-metric-context');
    const metricCompletenessEl = document.getElementById('ui-metric-completeness');
    const metricConsistencyEl = document.getElementById('ui-metric-consistency');
    if (metricRoleEl) metricRoleEl.textContent = ui.metrics.role;
    if (metricFormatEl) metricFormatEl.textContent = ui.metrics.format;
    if (metricConstraintsEl) metricConstraintsEl.textContent = ui.metrics.constraints;
    if (metricContextEl) metricContextEl.textContent = ui.metrics.context;
    if (metricCompletenessEl) metricCompletenessEl.textContent = ui.metrics.completeness;
    if (metricConsistencyEl) metricConsistencyEl.textContent = ui.metrics.consistency;
    document.getElementById('ui-issuesTitle').textContent = ui.issuesTitle;
    document.getElementById('ui-optimizedVersion').textContent = ui.optimizedVersion;
    document.getElementById('ui-footer').innerHTML = ui.footer;

    if (!isUsingOpenRouter || !currentModelPath) {
        improvedPromptEl.textContent = ui.waitingModel;
        generateAIBtn.disabled = true;
        generateAIBtn.classList.add('opacity-50', 'cursor-not-allowed');
    } else {
        generateAIBtn.disabled = false;
        generateAIBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }

    // Update Analysis if results are visible
    if (!resultsArea.classList.contains('hidden')) {
        handleAnalysis();
    }

};

const populateModelSelector = () => {
    if (openRouterModelSelectorEl) {
        openRouterModelSelectorEl.innerHTML = '';
        Object.entries(API_MODELS).forEach(([key, model]) => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = model.name;
            option.title = model.description || model.name;
            option.dataset.description = model.description || model.name;
            option.dataset.provider = model.provider || 'OpenRouter';
            option.dataset.context = model.context || 'N/A';
            openRouterModelSelectorEl.appendChild(option);
        });
    }
};

const updateSelectedModelTooltip = () => {
    if (!openRouterModelSelectorEl || !modelInfoTextEl) return;

    const selectedKey = openRouterModelSelectorEl.value;
    const selectedModel = API_MODELS[selectedKey];
    if (!selectedModel) {
        modelInfoTextEl.textContent = 'Select a model to see a short description.';
        return;
    }

    const provider = selectedModel.provider || 'OpenRouter';
    const context = selectedModel.context || 'N/A';
    const desc = selectedModel.description || selectedModel.name;
    modelInfoTextEl.textContent = `${provider} • ${context} • ${desc}`;
};

const renderAIPromptExamples = (examples) => {
    if (!aiExamplesListEl) return;

    while (aiExamplesListEl.firstChild) {
        aiExamplesListEl.removeChild(aiExamplesListEl.firstChild);
    }

    if (!Array.isArray(examples) || examples.length === 0) {
        aiExamplesListEl.classList.add('hidden');
        return;
    }

    examples.forEach((exampleText, index) => {
        const li = document.createElement('li');
        li.className = 'prompt-examples-item';

        const text = document.createElement('span');
        text.className = 'prompt-examples-text';
        text.textContent = `${index + 1}. ${exampleText}`;

        const useBtn = document.createElement('button');
        useBtn.type = 'button';
        useBtn.className = 'prompt-examples-use';
        useBtn.textContent = 'Use';
        useBtn.dataset.example = exampleText;

        li.appendChild(text);
        li.appendChild(useBtn);
        aiExamplesListEl.appendChild(li);
    });

    aiExamplesListEl.classList.remove('hidden');
};

const handleGenerateExamples = async () => {
    if (!generateExamplesBtn || !aiExamplesStatusEl) return;

    if (!currentModelPath) {
        aiExamplesStatusEl.classList.remove('hidden');
        aiExamplesStatusEl.textContent = 'Select an API model first to generate examples.';
        return;
    }

    const seed = promptInput.value.trim();
    generateExamplesBtn.disabled = true;
    aiExamplesStatusEl.classList.remove('hidden');
    aiExamplesStatusEl.textContent = 'Generating prompt examples with selected model...';

    try {
        const examples = await generatePromptExamplesWithOpenRouter(seed, currentModelPath);
        renderAIPromptExamples(examples);
        aiExamplesStatusEl.textContent = 'Examples ready. Click Use to insert one in the editor.';
    } catch (error) {
        aiExamplesStatusEl.textContent = `Failed to generate examples: ${error.message}`;
        renderAIPromptExamples([]);
    } finally {
        generateExamplesBtn.disabled = false;
    }
};

const getRecommendedApiModelKey = () => {
    const recommended = Object.entries(API_MODELS).find(([_, model]) => model.recommended);
    return recommended ? recommended[0] : Object.keys(API_MODELS)[0];
};

const getFallbackModelIds = (primaryModelId) => {
    const allEntries = Object.entries(API_MODELS);
    const recommendedIds = allEntries
        .filter(([_, model]) => model.recommended)
        .map(([_, model]) => model.id);
    const remainingIds = allEntries
        .map(([_, model]) => model.id)
        .filter((id) => id !== primaryModelId);

    return Array.from(new Set([primaryModelId, ...recommendedIds, ...remainingIds]));
};

const getModelNameById = (modelId) => {
    const entry = Object.values(API_MODELS).find((model) => model.id === modelId);
    return entry?.name || modelId;
};

const syncSelectorFromModelId = (modelId) => {
    if (!openRouterModelSelectorEl) return;

    const matched = Object.entries(API_MODELS).find(([_, model]) => model.id === modelId);
    if (!matched) return;

    const [key] = matched;
    openRouterModelSelectorEl.value = key;
    localStorage.setItem('lastSelectedApiModel', key);
    updateSelectedModelTooltip();
};

const createNowPaymentDonation = async () => {
    if (!donationAmountEl || !donationCurrencyEl || !donationPayCurrencyEl || !donationBtn || !donationStatusEl) {
        return;
    }

    const amount = Number(donationAmountEl.value);
    const priceCurrency = donationCurrencyEl.value;
    const payCurrency = donationPayCurrencyEl.value;
    const email = donationEmailEl?.value?.trim() || '';

    if (!Number.isFinite(amount) || amount <= 0) {
        donationStatusEl.textContent = 'Please enter a valid donation amount.';
        return;
    }

    donationBtn.disabled = true;
    donationStatusEl.textContent = 'Creating secure donation payment...';

    try {
        const response = await fetch('/api/nowpayments/create-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                price_amount: amount,
                price_currency: priceCurrency,
                pay_currency: payCurrency,
                order_description: 'Promptup donation',
                donor_email: email
            })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Unable to create donation payment');
        }

        const paymentUrl = data.invoice_url || data.payment_url;
        if (paymentUrl) {
            donationStatusEl.textContent = 'Payment created. Opening NOWPayments checkout...';
            window.open(paymentUrl, '_blank', 'noopener,noreferrer');
        } else {
            donationStatusEl.textContent = `Payment created: ${data.payment_id || 'ID unavailable'}`;
        }
    } catch (error) {
        donationStatusEl.textContent = `Donation setup failed: ${error.message}`;
    } finally {
        donationBtn.disabled = false;
    }
};

/**
 * Initialize UI with Model Options
 */
const initApp = async () => {

    initTheme();
    setWorkflowStep('input');

    populateModelSelector();

    const recommendedApiModelKey = getRecommendedApiModelKey();

    const lastSelectedApiModel = localStorage.getItem('lastSelectedApiModel');
    const selectedApiModelKey = (lastSelectedApiModel && API_MODELS[lastSelectedApiModel])
        ? lastSelectedApiModel
        : (recommendedApiModelKey || Object.keys(API_MODELS)[0]);

    if (openRouterModelSelectorEl) {
        openRouterModelSelectorEl.value = selectedApiModelKey;
    }

    if (selectedApiModelKey && API_MODELS[selectedApiModelKey]) {
        currentModelPath = API_MODELS[selectedApiModelKey].id;
        isUsingOpenRouter = true;
        localStorage.setItem('lastSelectedApiModel', selectedApiModelKey);
    }
    updateSelectedModelTooltip();

    if (modelInfoTriggerEl) {
        modelInfoTriggerEl.addEventListener('focus', () => {
            modelInfoTriggerEl.setAttribute('aria-expanded', 'true');
        });
        modelInfoTriggerEl.addEventListener('blur', () => {
            modelInfoTriggerEl.setAttribute('aria-expanded', 'false');
        });
    }

    updateLanguageUI();

    if (openRouterModelSelectorEl) {
        openRouterModelSelectorEl.addEventListener('change', () => {
            const key = openRouterModelSelectorEl.value;
            const model = API_MODELS[key];
            if (!model) return;
            currentModelPath = model.id;
            isUsingOpenRouter = true;
            localStorage.setItem('lastSelectedApiModel', key);
            updateSelectedModelTooltip();
            updateLanguageUI();
        });
    }

    if (donationBtn) {
        donationBtn.addEventListener('click', createNowPaymentDonation);
    }
};

/**
 * Handle Prompt Analysis (Heuristics)
 */
const handleAnalysis = () => {
    const prompt = promptInput.value.trim();
    if (!prompt) return;

    resultsArea.classList.remove('hidden');
    revealAIOptions();
    setWorkflowStep('analyze');
    
    // Trigger animation for Linear design system
    setTimeout(() => {
        resultsArea.classList.remove('stagger-reveal-initial');
        resultsArea.classList.add('animate-in');
        
        // Trigger for children cards inside results area
        resultsArea.querySelectorAll('.stagger-reveal-initial').forEach((el, i) => {
            setTimeout(() => {
                el.classList.remove('stagger-reveal-initial');
                el.classList.add('animate-in');
            }, i * 100);
        });
    }, 10);

    const result = analyzePromptHeuristics(prompt, currentLang);
    const ui = (i18n[currentLang] || i18n.en).ui;

    totalScoreEl.textContent = `${result.totalScore}/100`;
    scoreProgressEl.style.width = `${result.totalScore}%`;

    // Color feedback
    if (result.totalScore > 80) scoreProgressEl.className = "h-4 rounded-full bg-emerald-500 shadow-glow transition-all duration-500";
    else if (result.totalScore > 60) scoreProgressEl.className = "h-4 rounded-full bg-blue-500 shadow-glow transition-all duration-500";
    else scoreProgressEl.className = "h-4 rounded-full bg-orange-500 shadow-glow transition-all duration-500";

    if (roleScoreEl) roleScoreEl.textContent = result.scores.role;
    if (outputScoreEl) outputScoreEl.textContent = result.scores.outputFormat;
    if (constraintsScoreEl) constraintsScoreEl.textContent = result.scores.constraints;
    if (contextScoreEl) contextScoreEl.textContent = result.scores.context;
    if (completenessScoreEl) completenessScoreEl.textContent = result.scores.completeness || 0;
    if (consistencyScoreEl) consistencyScoreEl.textContent = result.scores.consistency || 0;

    if (scoreBreakdownListEl && Array.isArray(result.scoreBreakdown)) {
        while (scoreBreakdownListEl.firstChild) {
            scoreBreakdownListEl.removeChild(scoreBreakdownListEl.firstChild);
        }

        result.scoreBreakdown.forEach((item) => {
            const li = document.createElement('li');
            li.className = 'quality-breakdown-item';

            const left = document.createElement('div');
            left.className = 'quality-breakdown-main';

            const text = document.createElement('span');
            text.textContent = `${item.label}: ${item.score}/${item.max}`;

            const infoButton = document.createElement('button');
            infoButton.type = 'button';
            infoButton.className = 'quality-breakdown-info';
            infoButton.setAttribute('aria-label', `About ${item.label} scoring`);
            infoButton.textContent = '?';

            const tooltip = document.createElement('span');
            tooltip.className = 'quality-breakdown-tooltip';
            tooltip.textContent = SCORE_BREAKDOWN_DESCRIPTIONS[item.key] || 'Scoring detail unavailable.';

            infoButton.appendChild(tooltip);
            left.appendChild(text);
            left.appendChild(infoButton);

            const pct = item.max > 0 ? Math.round((item.score / item.max) * 100) : 0;
            const right = document.createElement('div');
            right.className = 'quality-breakdown-bar';

            const fill = document.createElement('span');
            fill.className = 'quality-breakdown-bar-fill';
            fill.style.width = `${pct}%`;
            if (pct >= 80) {
                fill.classList.add('quality-breakdown-bar-good');
            } else if (pct >= 55) {
                fill.classList.add('quality-breakdown-bar-medium');
            } else {
                fill.classList.add('quality-breakdown-bar-low');
            }
            fill.setAttribute('aria-hidden', 'true');

            right.setAttribute('role', 'progressbar');
            right.setAttribute('aria-valuemin', '0');
            right.setAttribute('aria-valuemax', '100');
            right.setAttribute('aria-valuenow', String(pct));
            right.setAttribute('aria-label', `${item.label} score ${pct}%`);
            right.appendChild(fill);

            li.appendChild(left);
            li.appendChild(right);
            scoreBreakdownListEl.appendChild(li);
        });
    }

    while (issuesListEl.firstChild) {
        issuesListEl.removeChild(issuesListEl.firstChild);
    }

    while (topFixesListEl && topFixesListEl.firstChild) {
        topFixesListEl.removeChild(topFixesListEl.firstChild);
    }

    if (result.issues.length === 0) {
        const li = document.createElement('li');
        li.className = 'text-emerald-400';
        li.textContent = ui.perfectPrompt;
        issuesListEl.appendChild(li);

        if (topFixesSummaryEl) {
            topFixesSummaryEl.textContent = `Great structure already (${result.totalScore}/100). You can move directly to optional rewrite or export.`;
        }

        if (topFixesListEl) {
            const tile = document.createElement('li');
            tile.className = 'top-fix-item top-fix-item-success';
            tile.textContent = 'No critical fixes. Prompt is already well-structured.';
            topFixesListEl.appendChild(tile);
        }
    } else {
        const fragment = document.createDocumentFragment();
        result.issues.forEach((issue) => {
            const li = document.createElement('li');
            li.className = 'flex items-start gap-2';

            const icon = document.createElement('span');
            icon.className = 'text-orange-500';
            icon.textContent = '⚠';

            const text = document.createTextNode(` ${issue}`);

            li.appendChild(icon);
            li.appendChild(text);
            fragment.appendChild(li);
        });
        issuesListEl.appendChild(fragment);

        if (topFixesSummaryEl) {
            topFixesSummaryEl.textContent = `Address these first to raise your score faster from ${result.totalScore}/100.`;
        }

        if (topFixesListEl) {
            const topIssues = result.issues.slice(0, 3);
            topIssues.forEach((issue, index) => {
                const tile = document.createElement('li');
                tile.className = 'top-fix-item';
                tile.textContent = `${index + 1}. ${issue}`;
                topFixesListEl.appendChild(tile);
            });
        }
    }
};

/**
 * Fill textarea with a curated sample and run instant analysis.
 */
const applySamplePrompt = (samplePrompt) => {
    promptInput.value = samplePrompt;
    promptInput.dispatchEvent(new Event('input', { bubbles: true }));
    promptInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    handleAnalysis();
};

/**
 * Handle AI Rewriting
 */
const handleAIRewrite = async () => {
    const prompt = promptInput.value.trim();
    if (!prompt) return;

    // Bring the optimized output area into view with a fixed offset so we don't overshoot.
    if (resultsArea) {
        resultsArea.classList.remove('hidden');
    }
    const optimizedTitleEl = document.getElementById('ui-optimizedVersion');
    const optimizedCardEl = optimizedTitleEl ? optimizedTitleEl.closest('.card') : null;
    const scrollTargetEl = optimizedCardEl || improvedPromptEl;

    if (scrollTargetEl) {
        const headerOffset = 96;
        const y = scrollTargetEl.getBoundingClientRect().top + window.scrollY - headerOffset;
        window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
    }

    const ui = (i18n[currentLang] || i18n.en).ui;
    setWorkflowStep('improve');
    generateAIBtn.disabled = true;
    generateAIBtn.textContent = ui.generating;
    improvedPromptEl.textContent = ui.analyzing;

    try {
        const heuristics = analyzePromptHeuristics(prompt, currentLang);

        if (!currentModelPath) {
            throw new Error('No API model selected for OpenRouter');
        }

        const candidateModelIds = getFallbackModelIds(currentModelPath);
        let improved = '';
        let lastError = null;

        for (let i = 0; i < candidateModelIds.length; i += 1) {
            const modelId = candidateModelIds[i];

            if (i > 0) {
                improvedPromptEl.textContent = `Selected model unavailable. Retrying with ${getModelNameById(modelId)}...`;
            }

            try {
                improved = await improvePromptWithOpenRouter(
                    prompt,
                    modelId,
                    (chunk) => {
                        if (chunk) improvedPromptEl.textContent = chunk;
                    },
                    heuristics
                );

                currentModelPath = modelId;
                isUsingOpenRouter = true;
                syncSelectorFromModelId(modelId);
                break;
            } catch (error) {
                lastError = error;
            }
        }

        if (!improved) {
            throw lastError || new Error('All configured OpenRouter models failed');
        }

        improvedPromptEl.textContent = improved;
        setWorkflowStep('export');
        generateAIBtn.textContent = ui.generateBtn;
        generateAIBtn.disabled = false;
    } catch (err) {
        improvedPromptEl.textContent = ui.rewriteFailed;
        generateAIBtn.textContent = ui.generateBtn;
        generateAIBtn.disabled = false;
    }
};

/**
 * Handle copying the improved prompt to clipboard
 */
const handleCopyPrompt = () => {
    const textToCopy = improvedPromptEl.textContent;
    const ui = (i18n[currentLang] || i18n.en).ui;
    const waitingText = ui.waitingModel || '';
    const analyzingText = ui.analyzing || '';
    const rewriteFailedText = ui.rewriteFailed || '';

    if (textToCopy &&
        textToCopy !== waitingText &&
        !textToCopy.includes(analyzingText) &&
        !textToCopy.includes(rewriteFailedText)) {
        navigator.clipboard.writeText(textToCopy);
        setWorkflowStep('export');
        alert(ui.copiedToClipboard || 'Copied to clipboard!');
    } else if (waitingText && textToCopy.includes(waitingText)) {
        alert(ui.noPromptToCopy || 'Nothing to copy yet.');
    }
};

/**
 * Handle exporting the prompt
 */
const handleExport = (format) => {
    const text = improvedPromptEl.textContent;
    if (!text || text.includes((i18n[currentLang] || i18n.en).ui.waitingModel)) return;
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `optimized-prompt.${format}`;
    a.click();
    URL.revokeObjectURL(url);
};

/**
 * Event Listeners
 */
let debounceTimer;
promptInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        handleAnalysis();
    }, 400); // 400ms debounce
});

if (analyzeBtn) {
    analyzeBtn.addEventListener('click', handleAnalysis);
}
generateAIBtn.addEventListener('click', handleAIRewrite);
copyBtn.addEventListener('click', handleCopyPrompt);
exportTxtBtn.addEventListener('click', () => handleExport('txt'));
exportMdBtn.addEventListener('click', () => handleExport('md'));

const marketingSamplePrompt = 'You are a B2B growth strategist. Create a 90-day go-to-market plan for a SaaS startup targeting HR teams. Return a week-by-week plan in a markdown table with goals, channels, KPIs, and risks. Constraints: budget under $15,000, focus on organic + outbound, maximum 350 words.';
const codingSamplePrompt = 'You are a senior JavaScript engineer. Refactor the function below for readability and performance, then provide unit tests. Return 1) improved code, 2) test cases, 3) explanation. Constraints: keep same behavior, avoid external libraries, include edge cases.';

if (heroTryExampleBtn) {
    heroTryExampleBtn.addEventListener('click', () => {
        document.getElementById('analyzer')?.scrollIntoView({ behavior: 'smooth' });
        applySamplePrompt(marketingSamplePrompt);
    });
}

if (sampleMarketingBtn) {
    sampleMarketingBtn.addEventListener('click', () => applySamplePrompt(marketingSamplePrompt));
}

if (sampleCodingBtn) {
    sampleCodingBtn.addEventListener('click', () => applySamplePrompt(codingSamplePrompt));
}

if (generateExamplesBtn) {
    generateExamplesBtn.addEventListener('click', handleGenerateExamples);
}

if (aiExamplesListEl) {
    aiExamplesListEl.addEventListener('click', (event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) return;
        const useBtn = target.closest('.prompt-examples-use');
        if (!useBtn) return;
        const example = useBtn.dataset.example;
        if (!example) return;
        applySamplePrompt(example);
    });
}

// Wait for DOM to be ready before initializing
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initApp();
        // Run heuristic regression tests in background for developers
        try {
            runHeuristicTests();
        } catch (e) {
            console.warn("Tests failed to run", e);
        }
    });
} else {
    // DOM already loaded
    initApp();
    // Run heuristic regression tests in background for developers
    try {
        runHeuristicTests();
    } catch (e) {
        console.warn("Tests failed to run", e);
    }
}

