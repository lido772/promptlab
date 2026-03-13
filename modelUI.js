/**
 * Model Loading UI Handler
 * Integrates both Transformers.js and WebLLM engines
 */

import * as webllm from "https://esm.sh/@mlc-ai/web-llm@0.2.46";
import { MODELS, WEBLLM_MODELS, checkWebGPUSupport, getSystemInfo } from './modelSelector.js';

// Simple Toast notification system (fallback if main Toast not available)
const Toast = {
    success: (message) => {
        console.log('✅', message);
        // Try to use main Toast if available
        if (window.Toast) {
            window.Toast.success(message);
        } else {
            alert(message);
        }
    },
    error: (message) => {
        console.error('❌', message);
        if (window.Toast) {
            window.Toast.error(message);
        } else {
            alert('Error: ' + message);
        }
    },
    warning: (message) => {
        console.warn('⚠️', message);
        if (window.Toast) {
            window.Toast.warning(message);
        } else {
            alert('Warning: ' + message);
        }
    },
    info: (message) => {
        console.info('ℹ️', message);
        if (window.Toast) {
            window.Toast.info(message);
        }
    }
};

// State management
let currentEngine = null; // 'transformers' or 'webllm'
let currentModel = null;
let isModelLoaded = false;
let selectedModelId = null;

// DOM elements
const modelSelector = document.getElementById('model-selector');
const loadModelBtn = document.getElementById('load-model-btn');
const deleteCacheBtn = document.getElementById('delete-cache-btn');
const loadingIndicator = document.getElementById('loading-indicator');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const modelInfo = document.getElementById('model-info');
const generateAiBtn = document.getElementById('generate-ai-btn');

/**
 * Initialize model selector with available models
 */
async function initModelSelector() {
    // Check WebGPU support first
    const webgpuSupport = await checkWebGPUSupport();

    // Clear existing options
    modelSelector.innerHTML = '';

    // Add model options
    Object.entries(MODELS).forEach(([key, model]) => {
        const option = document.createElement('option');
        option.value = key;
        option.dataset.engine = model.engine || 'transformers';

        // Build display name with appropriate prefixes
        let displayName = model.name;

        // Add [API] prefix for OpenRouter models
        if (model.engine === 'openrouter') {
            displayName = `[API] ${model.name}`;
        }

        // Add size info
        displayName += ` (${model.size})`;

        option.textContent = displayName;

        // Add recommended badge
        if (model.recommended) {
            option.textContent += ' ⭐';
        }

        // Add WebGPU badge
        if (model.engine === 'webllm') {
            option.textContent += ' 🚀';
        }

        modelSelector.appendChild(option);
    });

    // Set recommended model as default
    const recommendedModel = Object.entries(MODELS).find(([_, model]) => model.recommended);
    if (recommendedModel) {
        modelSelector.value = recommendedModel[0];
    }

    // Update model info
    updateModelInfo();

    // Show WebGPU status
    updateWebGPUStatus(webgpuSupport);
}

/**
 * Update model information display
 */
function updateModelInfo() {
    const selectedKey = modelSelector.value;
    const model = MODELS[selectedKey];

    if (!model) return;

    let infoHTML = `
        <div class="grid grid-cols-2 gap-2 text-xs">
            <div><span class="text-[#5E6AD2]">Size:</span> ${model.size}</div>
            <div><span class="text-[#5E6AD2]">Performance:</span> ${model.performance}</div>
        </div>
        <p class="mt-2 text-xs">${model.description}</p>
    `;

    if (model.engine === 'webllm') {
        infoHTML += `
            <div class="mt-2 flex items-center gap-2">
                <span class="px-2 py-1 bg-[#5E6AD2]/20 text-[#5E6AD2] text-xs rounded">WebGPU Accelerated</span>
                <span class="text-xs text-[#8A8F98]">Requires ${model.vram} VRAM</span>
            </div>
        `;
    }

    modelInfo.innerHTML = infoHTML;
}

/**
 * Update WebGPU status display
 */
function updateWebGPUStatus(webgpuSupport) {
    if (webgpuSupport.supported) {
        const adapterInfo = webgpuSupport.adapter;
        console.log('✅ WebGPU supported:', adapterInfo);
    } else {
        console.warn('⚠️ WebGPU not supported:', webgpuSupport.reason);
        // Disable WebGPU models if not supported
        document.querySelectorAll('[data-engine="webllm"]').forEach(option => {
            option.disabled = true;
            option.textContent += ' (Not Supported)';
        });
    }
}

/**
 * Load the selected model
 */
async function loadSelectedModel() {
    const selectedKey = modelSelector.value;
    const model = MODELS[selectedKey];

    if (!model) {
        Toast.error('Please select a model first');
        return;
    }

    // Disable load button
    loadModelBtn.disabled = true;
    loadModelBtn.textContent = 'Loading...';

    // Show progress indicator
    loadingIndicator.classList.remove('hidden');

    try {
        if (model.engine === 'webllm') {
            // Load WebLLM model
            const module = await import('./webLLMEngine.js');
            const { initWebLLM } = module;

            await initWebLLM(model.id, (progress) => {
                updateProgress(progress);
            });

            currentEngine = 'webllm';
            currentModel = model.id;
            isModelLoaded = true;
            selectedModelId = selectedKey;

            Toast.success(`WebGPU model loaded: ${model.name}`);
        } else {
            // Load Transformers.js model
            const { initLLM } = await import('./llmEngine.js');

            await initLLM(model.path, (progress) => {
                updateProgress(progress);
            });

            currentEngine = 'transformers';
            currentModel = model.path;
            isModelLoaded = true;
            selectedModelId = selectedKey;

            Toast.success(`Model loaded: ${model.name}`);
        }

        // Update UI state
        loadModelBtn.textContent = 'Model Loaded';
        generateAiBtn.disabled = false;
        generateAiBtn.classList.remove('opacity-50', 'cursor-not-allowed');

    } catch (error) {
        console.error('Model loading error:', error);
        Toast.error(`Failed to load model: ${error.message}`);

        // Reset UI
        loadModelBtn.disabled = false;
        loadModelBtn.textContent = 'Load Model';
        loadingIndicator.classList.add('hidden');
    }
}

/**
 * Update progress bar
 */
function updateProgress(progress) {
    if (typeof progress === 'object') {
        // WebLLM progress format
        const percent = progress.progress * 100;
        progressBar.style.width = `${percent}%`;
        progressText.textContent = progress.text || `Loading... ${Math.round(percent)}%`;
    } else if (typeof progress === 'number') {
        // Transformers.js progress format (0-1)
        const percent = progress * 100;
        progressBar.style.width = `${percent}%`;
        progressText.textContent = `Loading... ${Math.round(percent)}%`;
    }
}

/**
 * Clear model cache
 */
async function clearCache() {
    if (!confirm('Are you sure you want to delete the model cache? You will need to download the model again.')) {
        return;
    }

    try {
        if (currentEngine === 'webllm') {
            const { clearWebLLMCache } = await import('./webLLMEngine.js');
            await clearWebLLMCache();
        } else {
            const { clearModelCache } = await import('./llmEngine.js');
            await clearModelCache();
        }

        // Reset state
        currentEngine = null;
        currentModel = null;
        isModelLoaded = false;
        selectedModelId = null;

        // Reset UI
        loadModelBtn.disabled = false;
        loadModelBtn.textContent = 'Load Model';
        generateAiBtn.disabled = true;
        generateAiBtn.classList.add('opacity-50', 'cursor-not-allowed');

        Toast.success('Model cache cleared');

    } catch (error) {
        console.error('Cache clearing error:', error);
        Toast.error(`Failed to clear cache: ${error.message}`);
    }
}

/**
 * Get current engine and model
 */
function getCurrentEngine() {
    return { engine: currentEngine, model: currentModel, isLoaded: isModelLoaded };
}

/**
 * Event listeners
 */
modelSelector.addEventListener('change', updateModelInfo);
loadModelBtn.addEventListener('click', loadSelectedModel);
deleteCacheBtn.addEventListener('click', clearCache);

// Initialize on load
initModelSelector();

// Export for use in other modules
window.ModelUI = {
    getCurrentEngine,
    loadSelectedModel,
    clearCache,
    initModelSelector
};