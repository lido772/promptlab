/**
 * Main Application Logic
 * Static Prompt Analyzer
 */

import { analyzePromptHeuristics } from './promptAnalyzer.js';
import { initLLM, improvePromptLocal, isLLMLoaded } from './llmEngine.js';
import { MODELS, checkWebGPUSupport, getSystemInfo } from './modelSelector.js';

// DOM Selectors
const promptInput = document.getElementById('prompt-input');
const analyzeBtn = document.getElementById('analyze-btn');
const resultsArea = document.getElementById('results-area');
const loadingIndicator = document.getElementById('loading-indicator');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');

// Model Selector UI
const modelSelectorEl = document.getElementById('model-selector');
const loadModelBtn = document.getElementById('load-model-btn');
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

/**
 * Initialize UI with Model Options
 */
const initApp = async () => {
    // Populate model selector
    Object.keys(MODELS).forEach(key => {
        const m = MODELS[key];
        const option = document.createElement('option');
        option.value = key;
        option.textContent = `${m.name} (${m.size})`;
        if (m.recommended) option.selected = true;
        modelSelectorEl.appendChild(option);
    });

    // Device Support Detection
    const hasWebGPU = await checkWebGPUSupport();
    const system = getSystemInfo();
    const webgpuText = hasWebGPU ? '✅ WebGPU Ready' : '❌ WebGPU Unsupported (CPU Only)';
    modelInfoEl.innerHTML = `
        <p class="text-xs text-foreground-muted mb-2">System: ${system.ram} RAM / ${system.cores} Cores / ${webgpuText}</p>
        <p class="text-xs italic opacity-60" id="selected-model-desc">${MODELS[modelSelectorEl.value].description}</p>
    `;

    // Handle model change info
    modelSelectorEl.addEventListener('change', () => {
        document.getElementById('selected-model-desc').textContent = MODELS[modelSelectorEl.value].description;
    });
};

/**
 * Handle Prompt Analysis (Heuristics)
 */
const handleAnalysis = () => {
    const prompt = promptInput.value.trim();
    if (!prompt) return;

    resultsArea.classList.remove('hidden');
    const result = analyzePromptHeuristics(prompt);

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
        issuesListEl.innerHTML = '<li class="text-emerald-400">✨ Perfect prompt! No issues detected.</li>';
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
    
    loadModelBtn.disabled = true;
    loadingIndicator.classList.remove('hidden');

    try {
        await initLLM(model.path, (progress) => {
            const percent = Math.round(progress * 100);
            progressBar.style.width = `${percent}%`;
            progressText.textContent = `Downloading ${model.name}: ${percent}% (${model.size})`;
        });

        loadingIndicator.classList.add('hidden');
        loadModelBtn.textContent = '✅ Model Loaded';
        generateAIBtn.disabled = false;
        generateAIBtn.classList.remove('opacity-50', 'cursor-not-allowed');
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

    generateAIBtn.disabled = true;
    generateAIBtn.textContent = 'Generating...';
    improvedPromptEl.textContent = '🧠 Analyzing and rewriting...';

    try {
        const improved = await improvePromptLocal(prompt);
        improvedPromptEl.textContent = improved;
        generateAIBtn.textContent = 'Generate Improved Prompt';
        generateAIBtn.disabled = false;
    } catch (err) {
        improvedPromptEl.textContent = 'Rewrite failed. Try refreshing.';
        generateAIBtn.disabled = false;
    }
};

// Listeners
analyzeBtn.addEventListener('click', handleAnalysis);
loadModelBtn.addEventListener('click', handleLoadModel);
generateAIBtn.addEventListener('click', handleAIRewrite);

document.getElementById('copy-btn').addEventListener('click', () => {
    const text = improvedPromptEl.textContent;
    if (text && !text.includes('Analyzing')) {
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
    }
});

// Run Init
initApp();
