/**
 * Local LLM Improvement Engine
 * Powered by Transformers.js
 */

import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.1';

// Allow external models from Hugging Face
env.allowLocalModels = false;

let generator = null;
let currentModelPath = null;
let isLoaded = false;
let onProgressCallback = null;

/**
 * Initialize the pipeline with a specific model
 * @param {string} modelPath - HuggingFace model path
 * @param {Function} progressCallback - Called with loading progress %
 */
export const initLLM = async (modelPath, progressCallback) => {
    // Re-initialize if the model changed
    if (generator && currentModelPath === modelPath) return generator;

    onProgressCallback = progressCallback;
    currentModelPath = modelPath;

    try {
        generator = await pipeline('text-generation', modelPath, {
            progress_callback: (info) => {
                if (info.status === 'progress' && onProgressCallback) {
                    onProgressCallback(info.progress);
                }
            }
        });

        isLoaded = true;
        return generator;
    } catch (err) {
        console.error('LLM Initialization Error:', err);
        throw err;
    }
};

/**
 * Improve a prompt using the loaded model
 * @param {string} prompt - The user's original prompt
 */
export const improvePromptLocal = async (prompt) => {
    if (!generator) {
        throw new Error('LLM not initialized.');
    }

    let inputPrompt = '';
    
    // Different formatting based on model type
    if (currentModelPath.includes('TinyLlama')) {
        inputPrompt = `<|system|>\nYou are an expert prompt engineer. Your task is to rewrite the given prompt to be more clear, specific, and structured for an AI. Always use "You are" to define a role, and "Context:" to provide background.</s>\n<|user|>\nImprove this prompt: "${prompt}"</s>\n<|assistant|>\n`;
    } else if (currentModelPath.includes('Phi-3')) {
        inputPrompt = `<|user|>\nYou are an expert prompt engineer. Rewrite this prompt to be more clear, specific, and structured: "${prompt}"\n<|assistant|>\n`;
    } else {
        // Simple fallback (DistilGPT2)
        inputPrompt = `Role: Expert Prompt Engineer. Instructions: Improve the following prompt for better AI results. Original: "${prompt}" Improved: `;
    }

    try {
        const result = await generator(inputPrompt, {
            max_new_tokens: 256,
            temperature: 0.7,
            top_k: 50,
            do_sample: true,
            repetition_penalty: 1.2
        });

        const output = result[0].generated_text;
        
        // Basic cleanup based on model output format
        let improved = output;
        if (output.includes('<|assistant|>\n')) {
            improved = output.split('<|assistant|>\n')[1];
        } else if (output.includes('Improved: ')) {
            improved = output.split('Improved: ')[1];
        }

        return improved.trim();
    } catch (err) {
        console.error('LLM Generation Error:', err);
        throw err;
    }
};

export const isLLMLoaded = () => isLoaded;
