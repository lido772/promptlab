/**
 * Main Application Logic
 * Static Prompt Analyzer
 */

import { analyzePromptHeuristics } from './promptAnalyzer.js';
import { initLLM, improvePromptLocal, isLLMLoaded, clearModelCache } from './llmEngine.js';
import { MODELS, checkWebGPUSupport, getSystemInfo } from './modelSelector.js';
import { i18n } from './i18n.js';

// DOM Selectors
const promptInput = document.getElementById('prompt-input');
const analyzeBtn = document.getElementById('analyze-btn');
const resultsArea = document.getElementById('results-area');
const loadingIndicator = document.getElementById('loading-indicator');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const copyBtn = document.getElementById('copy-btn');

// Language Selector UI
const languageSelectorEl = document.getElementById('language-selector');

// Model Selector UI
const modelSelectorEl = document.getElementById('model-selector');
const loadModelBtn = document.getElementById('load-model-btn');
const deleteCacheBtn = document.getElementById('delete-cache-btn');
const generateAIBtn = document.getElementById('generate-ai-btn');
const modelInfoEl = document.getElementById('model-info');

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

// State
let currentLang = localStorage.getItem('prompt_analyzer_lang') || 'en';
let currentModelPath = null;
let deviceSummary = 'System: Unknown';
let webgpuStatusText = 'WebGPU support unknown';

const renderModelInfo = (statusMessage = '') => {
    const selectedModel = MODELS[modelSelectorEl.value];
    const statusLine = statusMessage ? `<p class="text-xs text-foreground-muted mb-2">${statusMessage}</p>` : '';
    modelInfoEl.innerHTML = `
        <p class="text-xs text-foreground-muted mb-2">${deviceSummary} / ${webgpuStatusText}</p>
        ${statusLine}
        <p class="text-xs italic opacity-60" id="selected-model-desc">${selectedModel.description}</p>
    `;
};

const getModelStatusMessage = (ui) => {
    if (isLLMLoaded() && currentModelPath) {
        const loadedModel = Object.values(MODELS).find(m => m.path === currentModelPath);
        return `${ui.modelLoaded}: ${loadedModel?.name || ''}`;
    }
    return ui.modelNotLoaded;
};

/**
 * Update UI Text based on current language
 */
const updateLanguageUI = () => {
    const config = i18n[currentLang] || i18n.en;
    const ui = config.ui;

    // Static Elements
    document.getElementById('ui-title').textContent = ui.title;
    document.getElementById('ui-subtitle').innerHTML = ui.subtitle;
    document.getElementById('ui-yourPrompt').textContent = ui.yourPrompt;
    promptInput.placeholder = ui.placeholder;
    analyzeBtn.textContent = ui.analyzeBtn;
    generateAIBtn.textContent = ui.generateBtn;
    document.getElementById('ui-localEngine').textContent = ui.localEngine;
    loadModelBtn.textContent = isLLMLoaded() ? ui.modelLoaded : ui.loadModel;
    document.getElementById('ui-qualityScore').textContent = ui.qualityScore;
    document.getElementById('ui-metric-role').textContent = ui.metrics.role;
    document.getElementById('ui-metric-format').textContent = ui.metrics.format;
    document.getElementById('ui-metric-constraints').textContent = ui.metrics.constraints;
    document.getElementById('ui-metric-context').textContent = ui.metrics.context;
    document.getElementById('ui-issuesTitle').textContent = ui.issuesTitle;
    document.getElementById('ui-optimizedVersion').textContent = ui.optimizedVersion;
    deleteCacheBtn.title = ui.deleteCurrentModelBtn || ui.deleteCacheBtn;
    document.getElementById('ui-footer').innerHTML = ui.footer;

    const statusMessage = getModelStatusMessage(ui);
    renderModelInfo(statusMessage);

    if (!isLLMLoaded()) {
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

/**
 * Initialize UI with Model and Language Options
 */
const initApp = async () => {
    Object.keys(i18n).forEach(key => {
        const lang = i18n[key];
        const option = document.createElement('option');
        option.value = key;
        option.textContent = `${lang.flag} ${lang.name}`;
        if (key === currentLang) option.selected = true;
        languageSelectorEl.appendChild(option);
    });

    Object.keys(MODELS).forEach(key => {
        const model = MODELS[key];
        const option = document.createElement('option');
        option.value = key;
        option.textContent = `${model.name} (${model.size})`;
        if (model.recommended) option.selected = true;
        modelSelectorEl.appendChild(option);
    });

    languageSelectorEl.addEventListener('change', (e) => {
        currentLang = e.target.value;
        localStorage.setItem('prompt_analyzer_lang', currentLang);
        updateLanguageUI();
    });

    modelSelectorEl.addEventListener('change', () => {
        const ui = (i18n[currentLang] || i18n.en).ui;
        renderModelInfo(getModelStatusMessage(ui));
    });

    const hasWebGPU = await checkWebGPUSupport();
    const system = getSystemInfo();
    deviceSummary = `System: ${system.ram} RAM / ${system.cores} Cores`;
    webgpuStatusText = hasWebGPU ? '✓ WebGPU Ready' : '✘ WebGPU Unsupported (CPU Only)';

    renderModelInfo(getModelStatusMessage((i18n[currentLang] || i18n.en).ui));
    updateLanguageUI();
};

/**
 * Handle Prompt Analysis (Heuristics)
 */
const handleAnalysis = () => {
    const prompt = promptInput.value.trim();
    if (!prompt) return;

    resultsArea.classList.remove('hidden');
    const result = analyzePromptHeuristics(prompt, currentLang);
    const ui = (i18n[currentLang] || i18n.en).ui;

    totalScoreEl.textContent = `${result.totalScore}/100`;
    scoreProgressEl.style.width = `${result.totalScore}%`;

    // Color feedback
    if (result.totalScore > 80) scoreProgressEl.className = "h-4 rounded-full bg-emerald-500 shadow-glow transition-all duration-500";
    else if (result.totalScore > 60) scoreProgressEl.className = "h-4 rounded-full bg-blue-500 shadow-glow transition-all duration-500";
    else scoreProgressEl.className = "h-4 rounded-full bg-orange-500 shadow-glow transition-all duration-500";

    roleScoreEl.textContent = result.scores.role;
    outputScoreEl.textContent = result.scores.outputFormat;
    constraintsScoreEl.textContent = result.scores.constraints;
    contextScoreEl.textContent = result.scores.context;

    issuesListEl.innerHTML = '';
    if (result.issues.length === 0) {
        issuesListEl.innerHTML = `<li class="text-emerald-400">${ui.perfectPrompt}</li>`;
    } else {
        result.issues.forEach(issue => {
            issuesListEl.innerHTML += `<li class="flex items-start gap-2"><span class="text-orange-500">⚠</span> ${issue}</li>`;
        });
    }
};

/**
 * Handle Model Loading
 */
const handleLoadModel = async () => {
    const selectedKey = modelSelectorEl.value;
    const model = MODELS[selectedKey];
    const ui = (i18n[currentLang] || i18n.en).ui;
    
    loadModelBtn.disabled = true;
    loadingIndicator.classList.remove('hidden');

    try {
        await initLLM(model.path, (progress) => {
            const rawPercent = progress <= 1 ? progress * 100 : progress;
            const percent = Math.min(100, Math.max(0, Math.round(rawPercent)));
            progressBar.style.width = `${percent}%`;
            progressText.textContent = `${ui.downloading} ${model.name}: ${percent}% (${model.size})`;
        });

        loadingIndicator.classList.add('hidden');
        loadModelBtn.textContent = ui.modelLoaded;
        loadModelBtn.disabled = false;
        currentModelPath = model.path;
        renderModelInfo(getModelStatusMessage(ui));
        generateAIBtn.disabled = false;
        generateAIBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        
        if (improvedPromptEl.textContent === ui.waitingModel) {
            improvedPromptEl.textContent = '';
        }
    } catch (err) {
        progressText.textContent = 'Error downloading model. Try smaller model.';
        loadModelBtn.disabled = false;
    }
};

/**
 * Handle AI Rewriting
 */
const handleAIRewrite = async () => {
    const prompt = promptInput.value.trim();
    if (!prompt) return;

    const ui = (i18n[currentLang] || i18n.en).ui;
    generateAIBtn.disabled = true;
    generateAIBtn.textContent = ui.generating;
    improvedPromptEl.textContent = ui.analyzing;

    try {
        const improved = await improvePromptLocal(prompt, currentLang);
        improvedPromptEl.textContent = improved;
        generateAIBtn.textContent = ui.generateBtn;
        generateAIBtn.disabled = false;
    } catch (err) {
        improvedPromptEl.textContent = ui.rewriteFailed;
        generateAIBtn.textContent = ui.generateBtn;
        generateAIBtn.disabled = false;
    }
};

/**
 * Handle deleting a specific model from cache
 */
const handleDeleteCache = async () => {
    const selectedKey = modelSelectorEl.value;
    const model = MODELS[selectedKey];
    const ui = (i18n[currentLang] || i18n.en).ui;

    if (!model) return; // Should not happen with current UI

    const confirmMessage = ui.confirmDeleteCache
        ? ui.confirmDeleteCache(model.name)
        : `Delete cached model for ${model.name}? This cannot be undone.`;
    if (!confirm(confirmMessage)) return;

    const success = await clearModelCache();

    if (success) {
        currentModelPath = null;
        alert(ui.modelCacheDeleted ? ui.modelCacheDeleted(model.name) : 'Cached model deleted!');
        loadModelBtn.textContent = ui.loadModel;
        loadModelBtn.disabled = false;
        generateAIBtn.disabled = true;
        generateAIBtn.classList.add('opacity-50', 'cursor-not-allowed');
        improvedPromptEl.textContent = ui.waitingModel;
        renderModelInfo(getModelStatusMessage(ui));
    } else {
        alert(ui.errorDeletingCache || 'Error deleting cached model. Please try again.');
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
        alert(ui.copiedToClipboard || 'Copied to clipboard!');
    } else if (waitingText && textToCopy.includes(waitingText)) {
        alert(ui.noPromptToCopy || 'Nothing to copy yet.');
    }
};

/**
 * Event Listeners
 */
analyzeBtn.addEventListener('click', handleAnalysis);
loadModelBtn.addEventListener('click', handleLoadModel);
generateAIBtn.addEventListener('click', handleAIRewrite);
deleteCacheBtn.addEventListener('click', handleDeleteCache);
copyBtn.addEventListener('click', handleCopyPrompt);

// Run Init
initApp();
