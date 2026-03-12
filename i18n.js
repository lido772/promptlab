/**
 * Internationalization (i18n) Configuration
 * English only for UI and heuristic patterns
 */

export const i18n = {
    en: {
        name: 'English',
        flag: '🇺🇸',
        ui: {
            title: 'Prompt Analyzer',
            subtitle: 'Optimize your AI prompts with instant heuristic scoring and <span class="text-blue-400 font-semibold">Local Browser AI</span>. Private, offline, and free.',
            yourPrompt: 'Your Prompt',
            placeholder: 'Example: Act as an expert marketing consultant. Create a 3-month strategy for a new SaaS...',
            analyzeBtn: 'Analyze Instantly',
            rewriteBtn: 'Rewrite with AI',
            localEngine: 'Local AI Engine',
            loadModel: 'Load Model',
            modelLoaded: '✅ Model Loaded',
            modelNotLoaded: 'No model loaded. Select a model and click Load Model.',
            downloadingModel: 'Downloading model',
            initializingModel: 'Initializing model',
            errorLoadingModel: 'Error loading model',
            errorGeneratingPrompt: 'Error generating prompt',
            ecoModeWarning: 'Low battery detected. Consider a smaller model or plug in for optimal performance.',
            prefetchingProModel: 'Silently preloading Pro model for offline access...',
            proModelPrefetched: 'Pro model ready for offline use!',
            prefetchingFailed: 'Pro model prefetching failed',
            qualityScore: 'Quality Score',
            metrics: {
                role: 'Role',
                format: 'Format',
                constraints: 'Constraints',
                context: 'Context',
                completeness: 'Completeness',
                consistency: 'Consistency'
            },
            issuesTitle: 'Suggested Improvements',
            optimizedVersion: 'Optimized Version',
            copyBtn: 'Copy',
            waitingModel: 'Load a model above to enable AI-powered rewriting.',
            perfectPrompt: '✨ Perfect prompt! No issues detected.',
            analyzing: '🧠 Analyzing and rewriting...',
            generateBtn: 'Generate Improved Prompt',
            generating: 'Generating...',
            deleteCacheBtn: 'Delete Current Model from Cache',
            confirmDeleteCache: (modelName) => `Are you sure you want to delete the cached model for ${modelName}? This cannot be undone.`,
            modelCacheDeleted: (modelName) => `🗑️ Cached model for ${modelName} deleted!`,
            errorDeletingCache: 'Error deleting cached model. Please try again.',
            deleteCurrentModelBtn: 'Delete Current Model from Cache',
            copiedToClipboard: 'Copied to clipboard!',
            noPromptToCopy: 'Nothing to copy yet.',
            rewriteFailed: 'Rewrite failed. Try refreshing.',
            retryBtn: 'Retry',
            fallbackMode: 'Fallback mode activated',
            cacheCleared: 'Cache cleared successfully!',
            footer: 'Built with <span class="text-blue-400">Transformers.js</span> • Offline First • Privacy Optimized'
        },
        heuristics: {
            patterns: {
                role: ['you are', 'act as', 'as a', 'expert', 'specialist', 'persona', 'professional', 'consultant'],
                format: ['format', 'json', 'table', 'list', 'markdown', 'return', 'output as', 'bullet point', 'structured', 'csv', 'html', 'xml'],
                constraints: ['must', 'do not', 'only', 'avoid', 'limit', 'never', 'strictly', 'without', 'requirements', 'negative prompt'],
                context: ['context', 'background', 'given', 'scenario', 'situation', 'example', 'here is', 'audience', 'purpose'],
                specificity: ['specifically', 'exactly', 'detailed', 'precise', 'minute', 'particular', 'instance']
            },
            issues: {
                role: "Missing a clear role definition (e.g., 'You are an expert...')",
                format: "No specific output format requested (e.g., 'Return as a JSON')",
                constraints: "No constraints defined (e.g., 'Do not use technical jargon')",
                context: "Lack of background context for the AI",
                specificity: "Prompt seems vague; add more specific details, numbers, or data",
                short: "Prompt is too short to be clear",
                structure: "Improve structure using line breaks, bullet points, or headers"
            }
        },
        heuristics_enhanced: {
            issues: {
                vague_words: "Prompt contains vague words or ambiguous pronouns",
                incomplete_success: "Missing success criteria or output specifications",
                inconsistency: "Internal inconsistencies detected between prompt elements"
            }
        }
    }
};