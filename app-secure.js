// ============================================
// SECURE APPLICATION - PromptUp Security Refactored
// ============================================
// This file contains production-grade security improvements:
// - No inline event handlers (uses addEventListener)
// - No alert() calls (uses toast notifications)
// - Safe DOM manipulation (no innerHTML with user input)
// - Proper input sanitization
// - Content Security Policy compatible
// ============================================

(function() {
    'use strict';

    // ============================================
    // CONFIGURATION
    // ============================================
    const CONFIG = {
        WORKER_URL: "https://promptlab.lido772.workers.dev",
        TOAST_DURATION: 4000,
        MAX_TOASTS: 3
    };

    // ============================================
    // XSS PREVENTION - Input Sanitization
    // ============================================
    const Sanitizer = {
        escapeHtml(text) {
            if (text === null || text === undefined) return '';
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        },

        escapeAttr(text) {
            if (text === null || text === undefined) return '';
            return String(text)
                .replace(/&/g, '&amp;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#x27;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
        },

        sanitizeUrl(url) {
            try {
                const parsed = new URL(url);
                // Only allow https, http protocols
                if (!['https:', 'http:'].includes(parsed.protocol)) {
                    return '#';
                }
                return parsed.href;
            } catch (e) {
                return '#';
            }
        }
    };

    // ============================================
    // TOAST NOTIFICATION SYSTEM
    // Secure replacement for alert()
    // ============================================
    const Toast = {
        container: null,

        init() {
            this.container = document.getElementById('toastContainer');
            if (!this.container) {
                this.container = document.createElement('div');
                this.container.className = 'toast-container';
                this.container.id = 'toastContainer';
                document.body.appendChild(this.container);
            }
        },

        show(message, type = 'info') {
            this.init();

            // Limit number of toasts
            while (this.container.children.length >= CONFIG.MAX_TOASTS) {
                this.container.removeChild(this.container.firstChild);
            }

            const toast = document.createElement('div');
            toast.className = `toast ${type}`;

            const icon = this.getIcon(type);
            const iconElement = document.createElement('span');
            iconElement.className = 'toast-icon';
            iconElement.textContent = icon;

            const messageElement = document.createElement('span');
            messageElement.className = 'toast-message';
            messageElement.textContent = message; // Secure: textContent prevents XSS

            toast.appendChild(iconElement);
            toast.appendChild(messageElement);
            this.container.appendChild(toast);

            // Auto-remove after duration
            setTimeout(() => {
                this.remove(toast);
            }, CONFIG.TOAST_DURATION);
        },

        remove(toast) {
            if (toast && toast.parentNode) {
                toast.style.animation = 'fadeOut 0.3s ease forwards';
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.parentNode.removeChild(toast);
                    }
                }, 300);
            }
        },

        getIcon(type) {
            const icons = {
                success: '✓',
                error: '✕',
                warning: '⚠',
                info: 'ℹ'
            };
            return icons[type] || icons.info;
        },

        success(message) { this.show(message, 'success'); },
        error(message) { this.show(message, 'error'); },
        warning(message) { this.show(message, 'warning'); },
        info(message) { this.show(message, 'info'); }
    };

    // ============================================
    // COMPLETE AI MODELS DATABASE
    // ============================================
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
            ]
        },
        image: {
            'OpenAI': [
                { value: 'dalle3', label: 'DALL-E 3' },
                { value: 'dalle2', label: 'DALL-E 2' }
            ],
            'Stability AI': [
                { value: 'sdxl', label: 'Stable Diffusion XL 1.0' },
                { value: 'sd3', label: 'Stable Diffusion 3' }
            ]
        },
        video: {
            'OpenAI': [
                { value: 'sora', label: 'Sora' }
            ]
        },
        audio: {
            'OpenAI': [
                { value: 'whisper', label: 'Whisper (Speech-to-Text)' },
                { value: 'tts-1', label: 'TTS-1 (Text-to-Speech)' }
            ]
        },
        code: {
            'OpenAI': [
                { value: 'gpt4-code', label: 'GPT-4 Turbo' },
                { value: 'gpt4o-code', label: 'GPT-4o' }
            ]
        }
    };

    // ============================================
    // SECURE DOM MANIPULATION
    // ============================================
    const DOM = {
        createElement(tag, className = '', textContent = '') {
            const element = document.createElement(tag);
            if (className) element.className = className;
            if (textContent) element.textContent = textContent;
            return element;
        },

        setAttributes(element, attributes) {
            Object.entries(attributes).forEach(([key, value]) => {
                if (key === 'textContent') {
                    element.textContent = value;
                } else if (key === 'innerHTML') {
                    element.innerHTML = value; // Only use with trusted content
                } else {
                    element.setAttribute(key, value);
                }
            });
            return element;
        },

        append(parent, children) {
            if (!Array.isArray(children)) {
                children = [children];
            }
            children.forEach(child => {
                if (child) parent.appendChild(child);
            });
            return parent;
        },

        clear(element) {
            while (element.firstChild) {
                element.removeChild(element.firstChild);
            }
            return element;
        }
    };

    // ============================================
    // AI PROMPT ANALYZER
    // ============================================
    const Analyzer = {
        analyze(prompt, model, modality) {
            const metrics = {
                clarity: this.calculateClarity(prompt),
                specificity: this.calculateSpecificity(prompt, modality),
                structure: this.calculateStructure(prompt, modality),
                actionability: this.calculateActionability(prompt, modality)
            };

            const overallScore = Math.round(
                (metrics.clarity + metrics.specificity + metrics.structure + metrics.actionability) / 4
            );

            return {
                score: overallScore,
                metrics: metrics,
                feedback: this.generateFeedback(prompt, metrics, modality),
                suggestions: this.generateSuggestions(prompt, metrics, modality)
            };
        },

        calculateClarity(prompt) {
            const words = prompt.split(/\s+/).length;
            return Math.min(100, Math.round((words / 50) * 100));
        },

        calculateSpecificity(prompt, modality) {
            let score = 50;
            if (prompt.match(/\d+/)) score += 15;
            if (prompt.includes('specific') || prompt.includes('exactly') || prompt.includes('detailed')) score += 10;
            return Math.min(100, score);
        },

        calculateStructure(prompt, modality) {
            let score = 50;
            const hasContext = prompt.match(/[A-Z]{2,}/) || prompt.includes('You are') || prompt.includes('As a');
            const hasTask = prompt.includes('create') || prompt.includes('write') || prompt.includes('generate');
            const hasConstraints = prompt.includes('don\'t') || prompt.includes('avoid') || prompt.includes('must');

            if (hasContext) score += 20;
            if (hasTask) score += 20;
            if (hasConstraints) score += 10;
            return Math.min(100, score);
        },

        calculateActionability(prompt, modality) {
            let score = 50;
            const actionVerbs = {
                text: ['write', 'create', 'generate', 'analyze', 'explain', 'summarize'],
                image: ['create', 'generate', 'design', 'draw', 'paint'],
                video: ['create', 'generate', 'produce', 'show', 'make'],
                audio: ['create', 'generate', 'speak', 'voice', 'narrate'],
                code: ['write', 'create', 'generate', 'build', 'develop']
            };

            const verbs = actionVerbs[modality] || actionVerbs.text;
            const hasActionVerb = verbs.some(verb => prompt.toLowerCase().includes(verb));

            if (hasActionVerb) score += 25;
            if (prompt.split('.').length > 2) score += 15;
            return Math.min(100, score);
        },

        generateFeedback(prompt, metrics, modality) {
            const lowest = Math.min(...Object.values(metrics));
            const modalityName = { text: 'text', image: 'image', video: 'video', audio: 'audio', code: 'code' }[modality];

            if (lowest >= 80) return `Excellent ${modalityName} prompt! You've included clear context, specific requirements, and actionable instructions.`;
            if (lowest >= 60) return `Good work. Your ${modalityName} prompt is clear but could benefit from more specific details.`;
            return `Your ${modalityName} prompt has potential. Add more specific details about what you want.`;
        },

        generateSuggestions(prompt, metrics, modality) {
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
    };

    // ============================================
    // UI RENDERER - Safe DOM manipulation
    // ============================================
    const Renderer = {
        showLoading(panel) {
            DOM.clear(panel);
            const loadingDiv = DOM.createElement('div', 'loading');
            const spinner = DOM.createElement('div', 'spinner');
            const text = DOM.createElement('span', '');
            text.textContent = 'Analyzing your prompt...';

            loadingDiv.appendChild(spinner);
            loadingDiv.appendChild(text);
            panel.appendChild(loadingDiv);
        },

        renderResults(panel, result, modelLabel) {
            DOM.clear(panel);

            const scoreClass = result.score >= 80 ? 'excellent' : result.score >= 60 ? 'good' : 'fair';

            // Main result card
            const resultCard = this.createResultCard(result, modelLabel, scoreClass);
            panel.appendChild(resultCard);

            // Suggestions card
            if (result.suggestions.length > 0) {
                const suggestionsCard = this.createSuggestionsCard(result.suggestions);
                panel.appendChild(suggestionsCard);
            }

            // Ad placeholder
            const adPlaceholder = this.createAdPlaceholder();
            panel.appendChild(adPlaceholder);
        },

        createResultCard(result, modelLabel, scoreClass) {
            const card = DOM.createElement('div', 'result-card');

            // Header
            const header = DOM.createElement('div', 'result-header');
            const modelName = DOM.createElement('div', 'model-name');
            modelName.textContent = Sanitizer.escapeHtml(modelLabel) + ' Analysis';

            const score = DOM.createElement('div', `score ${scoreClass}`);
            score.textContent = `${result.score}/100`;

            header.appendChild(modelName);
            header.appendChild(score);
            card.appendChild(header);

            // Feedback
            const feedback = DOM.createElement('div', 'feedback');
            feedback.textContent = result.feedback;
            card.appendChild(feedback);

            // Metrics
            const metrics = DOM.createElement('div', 'metrics');
            const metricsData = [
                { label: 'Clarity', value: result.metrics.clarity },
                { label: 'Specificity', value: result.metrics.specificity },
                { label: 'Structure', value: result.metrics.structure },
                { label: 'Actionability', value: result.metrics.actionability }
            ];

            metricsData.forEach(metric => {
                const metricDiv = DOM.createElement('div', 'metric');
                const label = DOM.createElement('div', 'metric-label');
                label.textContent = metric.label;
                const value = DOM.createElement('div', 'metric-value');
                value.textContent = `${metric.value}%`;
                metricDiv.appendChild(label);
                metricDiv.appendChild(value);
                metrics.appendChild(metricDiv);
            });

            card.appendChild(metrics);
            return card;
        },

        createSuggestionsCard(suggestions) {
            const card = DOM.createElement('div', 'result-card');
            const title = DOM.createElement('h3', '');
            title.style.cssText = 'margin-bottom: 15px; color: #fff;';
            title.textContent = '💡 Optimization Tips';
            card.appendChild(title);

            suggestions.forEach((suggestion, index) => {
                const suggestionDiv = DOM.createElement('div', '');
                suggestionDiv.style.cssText = 'margin-bottom: 12px; padding: 12px; background: rgba(0,212,255,0.1); border-left: 2px solid #00d4ff; border-radius: 4px; color: #aaa; font-size: 14px;';
                suggestionDiv.textContent = `${index + 1}. ${Sanitizer.escapeHtml(suggestion)}`;
                card.appendChild(suggestionDiv);
            });

            return card;
        },

        createAdPlaceholder() {
            const adDiv = DOM.createElement('div', 'ad-banner-iss');
            adDiv.id = 'issPostResults';
            adDiv.setAttribute('data-iss-slot', 'post-728x90');
            adDiv.style.cssText = 'margin-top: 20px; min-height: 250px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.02); border: 1px dashed rgba(255,255,255,0.05); border-radius: 8px;';

            const placeholder = DOM.createElement('div', 'iss-placeholder');
            placeholder.style.cssText = 'color: #666; font-size: 14px;';
            placeholder.textContent = 'Loading Ad...';

            adDiv.appendChild(placeholder);
            return adDiv;
        },

        renderImprovedPrompt(panel, improved, remainingFree, dailyLimit) {
            DOM.clear(panel);

            const card = DOM.createElement('div', 'result-card');

            const title = DOM.createElement('h3', '');
            title.style.cssText = 'color:#fff;margin-bottom:12px';
            title.textContent = '🔧 Improved Prompt';
            card.appendChild(title);

            const textarea = document.createElement('textarea');
            textarea.id = 'improvedOutput';
            textarea.style.height = '160px';
            textarea.textContent = improved; // Secure: textContent prevents XSS
            card.appendChild(textarea);

            const buttonGroup = DOM.createElement('div', 'btn-group');
            buttonGroup.style.cssText = 'display:flex;gap:10px;margin-top:10px';

            const useButton = DOM.createElement('button', '');
            useButton.textContent = 'Use This Prompt';
            useButton.addEventListener('click', App.useImproved);

            const copyButton = DOM.createElement('button', 'btn-secondary');
            copyButton.textContent = 'Copy';
            copyButton.addEventListener('click', App.copyImproved);

            buttonGroup.appendChild(useButton);
            buttonGroup.appendChild(copyButton);
            card.appendChild(buttonGroup);

            const statusDiv = DOM.createElement('div', '');
            statusDiv.style.cssText = 'margin-top:15px;padding:10px;background:rgba(16,185,129,0.1);border-radius:6px;text-align:center';
            statusDiv.innerHTML = `<span style="color:#10b981;font-size:14px">🎉 Free improvements remaining today: <strong>${remainingFree}/${dailyLimit}</strong></span>`;

            card.appendChild(statusDiv);
            panel.appendChild(card);
        }
    };

    // ============================================
    // MAIN APPLICATION
    // ============================================
    const App = {
        init() {
            this.cacheDOM();
            this.bindEvents();
            this.checkDailyLimit();
        },

        cacheDOM() {
            this.dom = {
                modalitySelect: document.getElementById('modalitySelect'),
                providerSelect: document.getElementById('providerSelect'),
                modelSelect: document.getElementById('modelSelect'),
                promptInput: document.getElementById('promptInput'),
                resultsPanel: document.getElementById('resultsPanel'),
                testPromptBtn: document.getElementById('testPromptBtn'),
                improveFreeBtn: document.getElementById('improveFreeBtn'),
                improveRewardedBtn: document.getElementById('improveRewardedBtn'),
                shareTwitterBtn: document.getElementById('shareTwitterBtn'),
                premiumBtn: document.getElementById('premiumBtn'),
                closeModalBtn: document.getElementById('closeModalBtn'),
                skipRewardBtn: document.getElementById('skipRewardBtn'),
                claimRewardBtn: document.getElementById('claimRewardBtn'),
                rewardedOverlay: document.getElementById('rewardedOverlay'),
                dailyCounter: document.getElementById('dailyCounter')
            };
        },

        bindEvents() {
            // Modality change
            this.dom.modalitySelect.addEventListener('change', () => this.updateProviders());

            // Provider change
            this.dom.providerSelect.addEventListener('change', () => this.updateModels());

            // Test prompt button
            this.dom.testPromptBtn.addEventListener('click', () => this.testPrompt());

            // Improve prompt buttons
            this.dom.improveFreeBtn.addEventListener('click', () => this.improvePromptFree());
            this.dom.improveRewardedBtn.addEventListener('click', () => this.improvePromptRewarded());

            // Share and premium buttons
            this.dom.shareTwitterBtn.addEventListener('click', () => this.shareOnTwitter());
            this.dom.premiumBtn.addEventListener('click', () => this.goToPremium());

            // Modal buttons
            this.dom.closeModalBtn.addEventListener('click', () => this.cancelReward());
            this.dom.skipRewardBtn.addEventListener('click', () => this.cancelReward());
            this.dom.claimRewardBtn.addEventListener('click', () => this.claimReward());

            // Keyboard shortcuts
            this.dom.promptInput.addEventListener('keydown', (e) => {
                if (e.ctrlKey && e.key === 'Enter') {
                    this.testPrompt();
                }
            });

            // ESC to close modal
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.dom.rewardedOverlay.classList.contains('active')) {
                    this.cancelReward();
                }
            });
        },

        updateProviders() {
            const modality = this.dom.modalitySelect.value;
            const providers = Object.keys(modelsDatabase[modality] || {});

            this.dom.providerSelect.innerHTML = '<option value="">Select Provider...</option>';
            providers.forEach(provider => {
                const option = document.createElement('option');
                option.value = provider;
                option.textContent = provider;
                this.dom.providerSelect.appendChild(option);
            });

            this.updateModels();
        },

        updateModels() {
            const modality = this.dom.modalitySelect.value;
            const provider = this.dom.providerSelect.value;

            this.dom.modelSelect.innerHTML = '<option value="">Select Model...</option>';

            if (!provider || !modelsDatabase[modality]) return;

            const models = modelsDatabase[modality][provider] || [];
            models.forEach(model => {
                const option = document.createElement('option');
                option.value = model.value;
                option.textContent = model.label;
                this.dom.modelSelect.appendChild(option);
            });
        },

        async testPrompt() {
            const prompt = this.dom.promptInput.value.trim();
            const model = this.dom.modelSelect.value;
            const modality = this.dom.modalitySelect.value;

            if (!prompt) {
                Toast.warning('Please enter a prompt to analyze');
                return;
            }

            if (!model) {
                Toast.warning('Please select a model');
                return;
            }

            Renderer.showLoading(this.dom.resultsPanel);

            // Simulate processing delay
            await new Promise(resolve => setTimeout(resolve, 800));

            const result = Analyzer.analyze(prompt, model, modality);
            const selectedOption = this.dom.modelSelect.options[this.dom.modelSelect.selectedIndex];
            Renderer.renderResults(this.dom.resultsPanel, result, selectedOption.text);
        },

        async improvePromptFree() {
            const prompt = this.dom.promptInput.value.trim();

            if (!prompt) {
                Toast.warning('Please enter a prompt first');
                return;
            }

            Renderer.showLoading(this.dom.resultsPanel);

            try {
                const response = await fetch(CONFIG.WORKER_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ prompt: prompt })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || "Request failed");
                }

                const improved = data.result;
                const remainingFree = data.remainingFree ?? 0;
                const dailyLimit = data.dailyLimit ?? 3;

                Renderer.renderImprovedPrompt(this.dom.resultsPanel, improved, remainingFree, dailyLimit);
                this.updateDailyCounter(remainingFree, dailyLimit);
                this.cacheDailyLimit(remainingFree, dailyLimit);

            } catch (err) {
                const errorMessage = err.message;

                if (errorMessage.includes('Daily free limit reached')) {
                    this.showDailyLimitReached();
                } else {
                    Toast.error(`Error improving prompt: ${Sanitizer.escapeHtml(errorMessage)}`);
                }
            }
        },

        async improvePromptRewarded() {
            const prompt = this.dom.promptInput.value.trim();
            if (!prompt) {
                Toast.warning('Please enter a prompt first');
                return;
            }

            try {
                await this.showRewardedAd();
            } catch (e) {
                return; // User cancelled
            }

            Renderer.showLoading(this.dom.resultsPanel);

            try {
                const resp = await fetch(CONFIG.WORKER_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt, rewarded: true })
                });
                const json = await resp.json();

                if (!resp.ok) throw new Error(json.error || 'Failed');

                const improved = json.result || '';
                Renderer.renderImprovedPrompt(this.dom.resultsPanel, improved, null, null);
                Toast.success('🎁 Rewarded improvement — no daily limit deducted!');

            } catch (err) {
                Toast.error(`Error improving prompt: ${Sanitizer.escapeHtml(err.message || 'Unknown error')}`);
            }
        },

        showRewardedAd() {
            return new Promise((resolve, reject) => {
                this.rewardedResolve = resolve;
                this.rewardedReject = reject;

                const overlay = this.dom.rewardedOverlay;
                const adContentISS = document.getElementById('adContentISS');
                const adContent = document.getElementById('adContent');
                const placeholder = document.getElementById('rewardedPlaceholder');

                overlay.classList.add('active');
                document.body.style.overflow = 'hidden';

                if (adContentISS) {
                    adContentISS.style.display = 'block';
                    if (adContent) adContent.style.display = 'none';
                    if (placeholder) placeholder.style.display = 'none';
                }
            });
        },

        claimReward() {
            this.closeRewardedModal();
            if (this.rewardedResolve) {
                this.rewardedResolve();
                this.rewardedResolve = null;
                this.rewardedReject = null;
            }
        },

        cancelReward() {
            this.closeRewardedModal();
            if (this.rewardedReject) {
                this.rewardedReject(new Error('User cancelled'));
                this.rewardedResolve = null;
                this.rewardedReject = null;
            }
        },

        closeRewardedModal() {
            this.dom.rewardedOverlay.classList.remove('active');
            document.body.style.overflow = '';
        },

        shareOnTwitter() {
            const prompt = this.dom.promptInput.value.trim();
            const score = document.querySelector('.score')?.textContent || '?';
            const text = prompt
                ? `I just tested my prompt on PromptUp - Score: ${score}/100. The AI-powered analysis helped me optimize it! Try it free: promptup.cloud`
                : 'Just discovered PromptUp - a free tool to test and optimize AI prompts. Works with ChatGPT, Claude, and more. promptup.cloud';

            const url = Sanitizer.sanitizeUrl(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`);
            window.open(url, '_blank', 'noopener,noreferrer');
        },

        goToPremium() {
            Toast.info('Premium features coming soon! Join the waitlist: promptup.cloud/premium');
        },

        useImproved() {
            const output = document.getElementById('improvedOutput');
            if (output && output.value) {
                this.dom.promptInput.value = output.value;
                Toast.success('Improved prompt applied!');
            }
        },

        copyImproved() {
            const output = document.getElementById('improvedOutput');
            if (!output || !output.value) {
                Toast.warning('Nothing to copy');
                return;
            }

            navigator.clipboard?.writeText(output.value)
                .then(() => Toast.success('Copied to clipboard'))
                .catch(() => Toast.error('Failed to copy to clipboard'));
        },

        showDailyLimitReached() {
            const panel = this.dom.resultsPanel;
            DOM.clear(panel);

            const card = DOM.createElement('div', 'result-card');
            card.style.cssText = 'text-align:center';

            const icon = DOM.createElement('div', '');
            icon.style.cssText = 'font-size:48px;margin-bottom:15px';
            icon.textContent = '🔒';

            const title = DOM.createElement('h3', '');
            title.style.cssText = 'color:#fbbf24;margin-bottom:12px';
            title.textContent = 'Daily Limit Reached';

            const text1 = DOM.createElement('p', '');
            text1.style.cssText = 'color:#aaa;margin-bottom:15px';
            text1.textContent = "You've used all 3 free prompt improvements for today.";

            const text2 = DOM.createElement('p', '');
            text2.style.cssText = 'color:#666;font-size:14px;margin-bottom:20px';
            text2.textContent = 'Resets at midnight';

            const button = DOM.createElement('button', '');
            button.style.cssText = 'background:linear-gradient(135deg,#f59e0b,#f97316)';
            button.textContent = '💜 Continue with Ad Support';
            button.addEventListener('click', () => this.improvePromptRewarded());

            card.appendChild(icon);
            card.appendChild(title);
            card.appendChild(text1);
            card.appendChild(text2);
            card.appendChild(button);
            panel.appendChild(card);

            this.updateDailyCounter(0, 3);
            this.cacheDailyLimit(0, 3);
        },

        checkDailyLimit() {
            try {
                const today = new Date().toISOString().split('T')[0];
                const cached = JSON.parse(localStorage.getItem('promptup_daily') || '{}');

                if (cached.date === today && typeof cached.remaining === 'number') {
                    this.updateDailyCounter(cached.remaining, cached.total || 3);
                } else {
                    this.updateDailyCounter(3, 3);
                }
            } catch (err) {
                this.dom.dailyCounter.textContent = '3/3 free today';
            }
        },

        cacheDailyLimit(remaining, total) {
            try {
                const today = new Date().toISOString().split('T')[0];
                localStorage.setItem('promptup_daily', JSON.stringify({
                    date: today,
                    remaining: remaining,
                    total: total
                }));
            } catch (e) {
                // localStorage unavailable
            }
        },

        updateDailyCounter(remaining, total) {
            if (remaining <= 0) {
                this.dom.dailyCounter.innerHTML = `<span style="color:#fbbf24">⚠️ Daily limit reached (${total}/${total} used)</span>`;
            } else {
                this.dom.dailyCounter.textContent = `✨ ${remaining}/${total} free improvements remaining today`;
            }
        }
    };

    // ============================================
    // INITIALIZE APPLICATION
    // ============================================
    document.addEventListener('DOMContentLoaded', () => {
        App.init();
    });

})();
