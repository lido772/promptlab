/**
 * Main Application Logic
 * Static Prompt Analyzer
 */

import { analyzePromptHeuristics } from './promptAnalyzer.js';
import { initLLM, improvePromptLocal, isLLMLoaded, clearModelCache } from './llmEngine.js';
import { MODELS, checkWebGPUSupport, getSystemInfo } from './modelSelector.js';
import { improvePromptWithOpenRouter, testOpenRouterConnection } from './openRouter.js';
import { i18n } from './i18n.js';
import { runHeuristicTests } from './test-prompts.js';

// DOM Selectors
const promptInput = document.getElementById('prompt-input');
const analyzeBtn = document.getElementById('analyze-btn');
const resultsArea = document.getElementById('results-area');
const loadingIndicator = document.getElementById('loading-indicator');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const copyBtn = document.getElementById('copy-btn');
const exportTxtBtn = document.getElementById('export-txt-btn');
const exportMdBtn = document.getElementById('export-md-btn');

// Language Selector UI - Removed (English only)

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
const completenessScoreEl = document.getElementById('completeness-score');
const consistencyScoreEl = document.getElementById('consistency-score');

// State
let currentLang = 'en'; // English only
let currentModelPath = null;
let deviceSummary = 'System: Unknown';
let webgpuStatusText = 'WebGPU support unknown';
let isUsingOpenRouter = false;

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
    if (isUsingOpenRouter && currentModelPath) {
        const loadedModel = Object.values(MODELS).find(m => m.id === currentModelPath || m.path === currentModelPath);
        return `${ui.modelLoaded}: ${loadedModel?.name || ''} (OpenRouter)`;
    }
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
    const config = i18n.en;
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
    document.getElementById('ui-metric-completeness').textContent = ui.metrics.completeness;
    document.getElementById('ui-metric-consistency').textContent = ui.metrics.consistency;
    document.getElementById('ui-issuesTitle').textContent = ui.issuesTitle;
    document.getElementById('ui-optimizedVersion').textContent = ui.optimizedVersion;
    deleteCacheBtn.title = ui.deleteCurrentModelBtn || ui.deleteCacheBtn;
    document.getElementById('ui-footer').innerHTML = ui.footer;

    const statusMessage = getModelStatusMessage(ui);
    renderModelInfo(statusMessage);

    if (!isLLMLoaded() && !isUsingOpenRouter) {
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
 * Initialize UI with Model Options
 */
const initApp = async () => {

    Object.keys(MODELS).forEach(key => {
        const model = MODELS[key];
        const option = document.createElement('option');
        option.value = key;
        // Add indicator for OpenRouter models
        const label = model.engine === 'openrouter'
            ? `[API] ${model.name} (${model.size})`
            : `${model.name} (${model.size})`;
        option.textContent = label;
        if (model.recommended) option.selected = true;
        modelSelectorEl.appendChild(option);
    });

    // Language selector removed - English only

    modelSelectorEl.addEventListener('change', () => {
        const ui = (i18n[currentLang] || i18n.en).ui;
        renderModelInfo(getModelStatusMessage(ui));
    });

    loadModelBtn.addEventListener('click', async () => {
        const selectedModelKey = modelSelectorEl.value;
        const selectedModel = MODELS[selectedModelKey];
        if (!selectedModel) return;

        const ui = (i18n[currentLang] || i18n.en).ui;

        // Check if this is an OpenRouter model
        if (selectedModel.engine === 'openrouter') {
            // OpenRouter models don't need loading - just enable the generate button
            const isConnected = await testOpenRouterConnection();
            if (!isConnected) {
                alert('OpenRouter API key not configured. Please add VITE_OPENROUTER_API_KEY to .env.local');
                return;
            }

            isUsingOpenRouter = true;
            currentModelPath = selectedModel.id;
            renderModelInfo(getModelStatusMessage(ui));
            improvedPromptEl.textContent = ''; // Clear waiting message
            generateAIBtn.disabled = false;
            generateAIBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            loadModelBtn.textContent = ui.modelLoaded;
            loadingIndicator.classList.add('hidden');
            updateLanguageUI();
            return;
        }

        // Local model loading (Transformers.js / WebLLM)
        loadingIndicator.classList.remove('hidden');
        progressText.textContent = ui.downloadingModel;
        progressBar.style.width = '0%';
        loadModelBtn.disabled = true;
        loadModelBtn.textContent = ui.loading;
        generateAIBtn.disabled = true; // Disable until model is fully ready

        try {
            await initLLM(selectedModel.path || selectedModel.id, (progress) => { // Use path or id depending on engine
                const percent = Math.round(progress);
                progressBar.style.width = `${percent}%`;
                if (progress < 100) {
                    progressText.textContent = `${ui.downloadingModel} (${percent}%)`;
                } else {
                    progressText.textContent = ui.initializingModel;
                }
            });
            currentModelPath = selectedModel.path || selectedModel.id; // Update currentModelPath after successful load
            isUsingOpenRouter = false;
            renderModelInfo(getModelStatusMessage(ui));
            improvedPromptEl.textContent = ''; // Clear waiting message
            generateAIBtn.disabled = false;
            generateAIBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            loadModelBtn.textContent = ui.modelLoaded; // Update button text
            loadingIndicator.classList.add('hidden'); // Hide after successful load

        } catch (error) {
            console.error('Failed to load LLM model:', error);
            progressText.textContent = `${ui.errorLoadingModel}: ${error.message}`;
            progressBar.style.width = '0%';
            improvedPromptEl.textContent = ui.errorLoadingModel; // Show error message
            generateAIBtn.disabled = true;
            generateAIBtn.classList.add('opacity-50', 'cursor-not-allowed');
            loadModelBtn.textContent = ui.loadModel; // Reset button text
        } finally {
            loadModelBtn.disabled = false; // Re-enable button after attempt
            updateLanguageUI(); // Update UI state
        }
    });

    const hasWebGPU = await checkWebGPUSupport();
    const systemInfo = await getSystemInfo(); // Await system info now
    deviceSummary = `System: ${systemInfo.ram} RAM / ${systemInfo.cores} Cores`;
    webgpuStatusText = hasWebGPU ? '✓ WebGPU Ready' : '✘ WebGPU Unsupported (CPU Only)';

    let recommendedModelKey = 'tiny-llama'; // Default to a small, fast model

    // Logic for adaptive model selection
    // If WebGPU is available and RAM is sufficient, recommend a more powerful WebGPU model
    if (hasWebGPU && systemInfo.ram && parseFloat(systemInfo.ram) >= 8) { // Example: 8GB RAM threshold
        const powerfulWebGPUModel = Object.keys(MODELS).find(key =>
            MODELS[key].engine === 'webllm' && (MODELS[key].performance === 'High Quality' || MODELS[key].performance === 'Balanced') && parseFloat(MODELS[key].vram) <= parseFloat(systemInfo.ram)
        );
        if (powerfulWebGPUModel) {
            recommendedModelKey = powerfulWebGPUModel;
        }
    } else if (systemInfo.ram && parseFloat(systemInfo.ram) >= 4) { // For machines with decent RAM but no WebGPU, suggest a CPU mid-range model
        const midRangeCPUModel = Object.keys(MODELS).find(key => MODELS[key].performance === 'Balanced' && MODELS[key].engine === 'transformers');
        if (midRangeCPUModel) {
            recommendedModelKey = midRangeCPUModel;
        }
    }

    // Set the selected model based on detection, or keep user's last choice if available
    const lastSelectedModel = localStorage.getItem('lastSelectedModel');
    if (lastSelectedModel && MODELS[lastSelectedModel]) {
        modelSelectorEl.value = lastSelectedModel;
        currentModelPath = MODELS[lastSelectedModel].path || MODELS[lastSelectedModel].id; // For WebLLM, it's 'id'
    } else {
        modelSelectorEl.value = recommendedModelKey;
        currentModelPath = MODELS[recommendedModelKey].path || MODELS[recommendedModelKey].id;
    }

    // Display "Eco Mode" warning if on low battery and a large model is selected
    if (systemInfo.battery && systemInfo.battery.level < 30 && !systemInfo.battery.charging &&
        currentModelPath && (MODELS[modelSelectorEl.value].size.includes('GB') || parseFloat(MODELS[modelSelectorEl.value].size) > 200)) {
        // Assuming Toast.warning is available globally or imported
        if (window.Toast) window.Toast.warning((i18n[currentLang] || i18n.en).ui.ecoModeWarning);
    }

    renderModelInfo(getModelStatusMessage((i18n[currentLang] || i18n.en).ui));
    updateLanguageUI();

    // Call prefetching intelligent after a short delay
    setTimeout(initiatePrefetch, 5000);
};

/**
 * Handle Prompt Analysis (Heuristics)
 */
const handleAnalysis = () => {
    const prompt = promptInput.value.trim();
    if (!prompt) return;

    resultsArea.classList.remove('hidden');
    
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

    roleScoreEl.textContent = result.scores.role;
    outputScoreEl.textContent = result.scores.outputFormat;
    constraintsScoreEl.textContent = result.scores.constraints;
    contextScoreEl.textContent = result.scores.context;
    completenessScoreEl.textContent = result.scores.completeness || 0;
    consistencyScoreEl.textContent = result.scores.consistency || 0;

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
        // Pass heuristic analysis results to guide improvements
        const heuristics = analyzePromptHeuristics(prompt, currentLang);

        // Use OpenRouter if enabled, otherwise use local model
        let improved;
        if (isUsingOpenRouter) {
            // Use streaming callback to update UI as it generates
            improved = await improvePromptWithOpenRouter(prompt, currentModelPath, (chunk) => {
                if (chunk) improvedPromptEl.textContent = chunk;
            });
        } else {
            // Use streaming callback to update UI as it generates
            improved = await improvePromptLocal(prompt, currentLang, heuristics, (chunk) => {
                if (chunk) improvedPromptEl.textContent = chunk;
            });
        }

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
 * Handle exporting the prompt
 */
const handleExport = (format) => {
    const text = improvedPromptEl.textContent;
    if (!text || text.includes('Load a model')) return;
    
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

analyzeBtn.addEventListener('click', handleAnalysis);
loadModelBtn.addEventListener('click', handleLoadModel);
generateAIBtn.addEventListener('click', handleAIRewrite);
deleteCacheBtn.addEventListener('click', handleDeleteCache);
copyBtn.addEventListener('click', handleCopyPrompt);
exportTxtBtn.addEventListener('click', () => handleExport('txt'));
exportMdBtn.addEventListener('click', () => handleExport('md'));

// Run Init
initApp();

// Run heuristic regression tests in background for developers
try {
    runHeuristicTests();
} catch (e) {
    console.warn("Tests failed to run", e);
}

/**
 * Initiate intelligent prefetching for Pro models
 */
const initiatePrefetch = async () => {
    const ui = (i18n[currentLang] || i18n.en).ui;

    const proModelKey = Object.keys(MODELS).find(key => MODELS[key].isPro); // Find a model with isPro: true
    const proModel = MODELS[proModelKey];

    // Don't prefetch if no Pro model is defined, or if it's already loaded/in cache
    // isLLMLoaded() only checks current loaded model. For prefetching, we need to check if it's in cache.
    // For simplicity, let's assume if it's not the currentModelPath, and not explicitly loaded, it can be prefetched.
    if (!proModel || (currentModelPath === (proModel.path || proModel.id) && isLLMLoaded())) {
        return;
    }

    const systemInfo = await getSystemInfo();
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

    // Conditions for prefetching: WiFi, good battery, not currently charging
    if (connection && connection.type === 'wifi' && systemInfo.battery && systemInfo.battery.level > 50 && !systemInfo.battery.charging) {
        console.log('Initiating intelligent prefetching for Pro model...');
        if (window.Toast) window.Toast.info(ui.prefetchingProModel);

        try {
            await initLLM(proModel.path || proModel.id, (progress) => { // Use path or id depending on engine
                // Silent progress - no UI update for this, or a very subtle one
                console.log(`Prefetching progress (${proModel.name}): ${progress}%`);
            });
            if (window.Toast) window.Toast.success(ui.proModelPrefetched);
        } catch (error) {
            console.error('Prefetching failed:', error);
            if (window.Toast) window.Toast.error(`${ui.prefetchingFailed}: ${error.message}`);
        }
    }
};
