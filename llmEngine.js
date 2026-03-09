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
 * Improve a prompt using the loaded model with optional streaming support
 * @param {string} prompt - The user's original prompt
 * @param {string} lang - The current language code
 * @param {Object} heuristics - Optional result from heuristic analysis to guide the model
 * @param {Function} onStream - Optional callback for streaming updates
 */
export const improvePromptLocal = async (prompt, lang = 'en', heuristics = null, onStream = null) => {
    if (!generator) {
        throw new Error('LLM not initialized.');
    }

    let inputPrompt = '';
    const langNames = { 
        en: 'English', 
        fr: 'French', 
        es: 'Spanish',
        de: 'German',
        ar: 'Arabic',
        hi: 'Hindi',
        zh: 'Chinese',
        ja: 'Japanese'
    };
    const currentLangName = langNames[lang] || 'English';
    
    // Create targeted instructions based on missing heuristics
    let targetedInstructions = '';
    if (heuristics && heuristics.issues && heuristics.issues.length > 0) {
        targetedInstructions = " Specifically address these issues: " + heuristics.issues.join(", ");
    }

    const systemPrompt = `You are a world-class Prompt Engineer. Your task is to rewrite the user's prompt to be highly effective, structured, and clear.
Follow these rules:
1. Preserve the original meaning and language (${currentLangName}).
2. Add a clear Persona (e.g., "You are an expert...").
3. Provide Context and background information.
4. Specify a clear Output Format (e.g., "Return the result as a Markdown table").
5. List specific Constraints to avoid generic or low-quality results.${targetedInstructions}`;

    // Different formatting based on model type
    if (currentModelPath.includes('TinyLlama') || currentModelPath.includes('SmolLM')) {
        inputPrompt = `<|system|>\n${systemPrompt}</s>\n<|user|>\nImprove this ${currentLangName} prompt: "${prompt}"</s>\n<|assistant|>\nHere is the improved version:\n`;
    } else if (currentModelPath.includes('Phi-3') || currentModelPath.includes('Qwen2')) {
        inputPrompt = `<|user|>\n${systemPrompt}\n\nOriginal prompt: "${prompt}"\n<|assistant|>\n`;
    } else {
        // Simple fallback (DistilGPT2)
        inputPrompt = `Instruction: ${systemPrompt}\nOriginal: "${prompt}"\nImproved: `;
    }

    try {
        const result = await generator(inputPrompt, {
            max_new_tokens: 350, // Increased for more detailed responses
            temperature: 0.4,    // Lowered for more precise, less "creative" rewriting
            top_k: 40,
            do_sample: true,
            repetition_penalty: 1.1,
            // Stream the tokens to a custom callback
            callback_function: (beams) => {
                if (onStream) {
                    const fullText = generator.tokenizer.decode(beams[0].output_token_ids, { skip_special_tokens: true });
                    // Cleanup current stream output
                    let current = fullText;
                    if (fullText.includes("version:\n")) current = fullText.split("version:\n")[1];
                    else if (fullText.includes("<|assistant|>\n")) current = fullText.split("<|assistant|>\n")[1];
                    else if (fullText.includes("Improved: ")) current = fullText.split("Improved: ")[1];
                    
                    onStream(current.trim());
                }
            }
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

/**
 * Delete specific or all Transformer.js models from browser cache
 * @param {string} [modelPath] - Optional path of the specific model to delete
 */
export const clearModelCache = async (modelPath = null) => {
    try {
        const cacheNames = await caches.keys();
        for (const name of cacheNames) {
            if (name.includes('transformers-cache') || name.includes('xenova')) {
                if (modelPath) {
                    // Only delete if the cache name is related to the specific model path
                    // Transformers.js often includes the model name in the cache key
                    if (name.includes(modelPath)) {
                        await caches.delete(name);
                        console.log(`Deleted cache: ${name}`);
                    }
                } else {
                    // If no modelPath specified, delete all related caches
                    await caches.delete(name);
                    console.log(`Deleted cache: ${name}`);
                }
            }
        }

        // Reset LLM state if the current model was deleted or all caches were cleared
        if (!modelPath || (modelPath === currentModelPath)) {
            generator = null;
            isLoaded = false;
            currentModelPath = null;
        }
        return true;
    } catch (err) {
        console.error('Error clearing cache:', err);
        return false;
    }
};
