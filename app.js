/**
 * Main Application Logic
 * Static Prompt Analyzer
 */

import { analyzePromptHeuristics } from './promptAnalyzer.js';
import { OPENROUTER } from './modelSelector.js';
import { clearOpenRouterModelsCache } from './openRouter.js';
import { classifyOpenRouterError } from './openRouter.js';
import { getOpenRouterModelsCacheInfo } from './openRouter.js';
import { improvePromptWithOpenRouter } from './openRouter.js';
import { executePromptWithOpenRouter } from './openRouter.js';
import { getAvailableModels } from './openRouter.js';
import { generatePromptExamplesWithOpenRouter } from './openRouter.js';
import { getOpenRouterKeyStatus } from './openRouter.js';
import { probeOpenRouterModel } from './openRouter.js';
import { i18n } from './i18n.js';

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
const languageToggleBtn = document.getElementById('language-toggle');
const languageCurrentFlagEl = document.getElementById('language-current-flag');
const languageCurrentCodeEl = document.getElementById('language-current-code');
const languageMenuEl = document.getElementById('language-menu');
const languageOptionEls = document.querySelectorAll('.language-option');
const heroTryExampleBtn = document.getElementById('hero-try-example-btn');
const sampleMarketingBtn = document.getElementById('sample-marketing-btn');
const sampleCodingBtn = document.getElementById('sample-coding-btn');
const sampleSeoBtn = document.getElementById('sample-seo-btn');
const sampleSalesBtn = document.getElementById('sample-sales-btn');
const sampleSupportBtn = document.getElementById('sample-support-btn');
const sampleProductBtn = document.getElementById('sample-product-btn');
const generateExamplesBtn = document.getElementById('generate-examples-btn');
const executePromptBtn = document.getElementById('execute-prompt-btn');
const copyBtn = document.getElementById('copy-btn');
const exportTxtBtn = document.getElementById('export-txt-btn');
const exportMdBtn = document.getElementById('export-md-btn');

// Model Selector UI
const generateAIBtn = document.getElementById('generate-ai-btn');
const openRouterModelSelectorEl = document.getElementById('openrouter-model-selector');
const refreshModelCatalogBtn = document.getElementById('refresh-model-catalog-btn');
const modelCatalogMetaEl = document.getElementById('model-catalog-meta');
const modelInfoTriggerEl = document.getElementById('model-info-trigger');
const modelInfoTextEl = document.getElementById('model-info-text');
const modelFallbackNoteEl = document.getElementById('model-fallback-note');
const openRouterKeyStatusEl = document.getElementById('openrouter-key-status');
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
let currentLang = 'fr';
let currentModelPath = null;
let isUsingOpenRouter = false;
let isRewriteGenerating = false;
let rewriteAbortController = null;
let isExecuteGenerating = false;
let executeAbortController = null;
const modelAvailability = new Map();
let isRefreshingModelAvailability = false;
let openRouterKeyStatus = null;
let isRefreshingOpenRouterKeyStatus = false;
let isRefreshingModelCatalog = false;
let activeModelFallbackNotice = null;

const API_MODELS = {
    ...OPENROUTER
};

const THEME_STORAGE_KEY = 'promptup-theme';
const LANGUAGE_STORAGE_KEY = 'promptup-lang';
const MODEL_AVAILABILITY_STORAGE_KEY = 'promptup-model-availability-v1';
const SUPPORTED_LANGS = ['fr', 'en', 'de', 'zh'];
const MODEL_PROBE_CONCURRENCY = 3;
const MAX_BACKGROUND_MODEL_PROBES = 12;
const KEY_STATUS_REFRESH_MS = 60 * 1000;
const MODEL_STATUS_TTLS = {
    available: 15 * 60 * 1000,
    rate_limited: 4 * 60 * 1000,
    unavailable: 10 * 60 * 1000
};

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

const getInitialLanguage = () => {
    const storedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (storedLanguage && SUPPORTED_LANGS.includes(storedLanguage)) {
        return storedLanguage;
    }

    const browser = (navigator.language || 'fr').toLowerCase();
    if (browser.startsWith('de')) return 'de';
    if (browser.startsWith('zh')) return 'zh';
    if (browser.startsWith('en')) return 'en';
    return 'fr';
};

const updateLanguageToggleUI = () => {
    if (!languageCurrentFlagEl || !languageCurrentCodeEl) return;
    const cfg = i18n[currentLang] || i18n.en;
    languageCurrentFlagEl.textContent = cfg.flag || '🌐';
    languageCurrentCodeEl.textContent = currentLang.toUpperCase();
};

const setLanguage = (lang) => {
    const nextLang = SUPPORTED_LANGS.includes(lang) ? lang : 'en';
    currentLang = nextLang;
    localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLang);
    document.documentElement.lang = nextLang;
    updateLanguageToggleUI();
    updateLanguageUI();
};

const initLanguageSelector = () => {
    setLanguage(getInitialLanguage());

    if (!languageToggleBtn || !languageMenuEl) return;

    languageToggleBtn.addEventListener('click', () => {
        const isOpen = !languageMenuEl.classList.contains('hidden');
        languageMenuEl.classList.toggle('hidden', isOpen);
        languageToggleBtn.setAttribute('aria-expanded', String(!isOpen));
    });

    languageOptionEls.forEach((el) => {
        el.addEventListener('click', () => {
            const lang = el.getAttribute('data-lang') || 'en';
            setLanguage(lang);
            languageMenuEl.classList.add('hidden');
            languageToggleBtn.setAttribute('aria-expanded', 'false');
        });
    });

    document.addEventListener('click', (event) => {
        const target = event.target;
        if (!(target instanceof Node)) return;
        const clickedInside = languageMenuEl.contains(target) || languageToggleBtn.contains(target);
        if (!clickedInside) {
            languageMenuEl.classList.add('hidden');
            languageToggleBtn.setAttribute('aria-expanded', 'false');
        }
    });
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

const formatModelOutput = (rawText) => {
    if (!rawText) return '';

    return String(rawText)
        .replace(/\r\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .replace(/[ \t]+\n/g, '\n')
        .trim();
};

const formatCreditAmount = (value) => {
    if (typeof value !== 'number' || Number.isNaN(value)) {
        return null;
    }

    if (Math.abs(value) >= 100) {
        return Math.round(value).toString();
    }

    if (Math.abs(value) >= 10) {
        return value.toFixed(1);
    }

    return value.toFixed(2);
};

const formatOpenRouterResetTime = (value) => {
    if (!value) {
        return null;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    try {
        return new Intl.DateTimeFormat(currentLang === 'zh' ? 'zh-CN' : currentLang, {
            dateStyle: 'short',
            timeStyle: 'short'
        }).format(date);
    } catch {
        return date.toLocaleString();
    }
};

const isOpenRouterKeyLimited = () => openRouterKeyStatus?.status === 'limited';

const getLocalizedOpenRouterKeyStatusText = () => {
    const remaining = formatCreditAmount(openRouterKeyStatus?.limitRemaining);
    const dailyUsage = formatCreditAmount(openRouterKeyStatus?.usageDaily);
    const limitReset = formatOpenRouterResetTime(openRouterKeyStatus?.limitReset);

    if (currentLang === 'fr') {
        if (!openRouterKeyStatus || openRouterKeyStatus.status === 'checking') return 'Vérification des limites OpenRouter...';
        if (openRouterKeyStatus.status === 'limited') {
            return [
                'Cle OpenRouter limitee. Reessayez plus tard.',
                dailyUsage !== null ? `Usage jour: ${dailyUsage}` : null,
                limitReset ? `Reset: ${limitReset}` : null
            ].filter(Boolean).join(' • ');
        }
        if (openRouterKeyStatus.status === 'error') return 'Impossible de vérifier la limite OpenRouter pour le moment.';
        return [
            remaining !== null ? `Credits restants: ${remaining}` : 'Cle OpenRouter active. Quota disponible.',
            dailyUsage !== null ? `Usage jour: ${dailyUsage}` : null,
            limitReset ? `Reset: ${limitReset}` : null
        ].filter(Boolean).join(' • ');
    }

    if (currentLang === 'de') {
        if (!openRouterKeyStatus || openRouterKeyStatus.status === 'checking') return 'OpenRouter-Limits werden geprüft...';
        if (openRouterKeyStatus.status === 'limited') {
            return [
                'OpenRouter-Schluessel ist limitiert. Bitte spaeter erneut versuchen.',
                dailyUsage !== null ? `Tagesnutzung: ${dailyUsage}` : null,
                limitReset ? `Reset: ${limitReset}` : null
            ].filter(Boolean).join(' • ');
        }
        if (openRouterKeyStatus.status === 'error') return 'OpenRouter-Limit konnte gerade nicht geprüft werden.';
        return [
            remaining !== null ? `Verbleibende Credits: ${remaining}` : 'OpenRouter-Schluessel aktiv. Kontingent verfuegbar.',
            dailyUsage !== null ? `Tagesnutzung: ${dailyUsage}` : null,
            limitReset ? `Reset: ${limitReset}` : null
        ].filter(Boolean).join(' • ');
    }

    if (currentLang === 'zh') {
        if (!openRouterKeyStatus || openRouterKeyStatus.status === 'checking') return '正在检查 OpenRouter 限额...';
        if (openRouterKeyStatus.status === 'limited') {
            return [
                'OpenRouter 密钥当前已达到限额，请稍后重试。',
                dailyUsage !== null ? `今日用量：${dailyUsage}` : null,
                limitReset ? `重置时间：${limitReset}` : null
            ].filter(Boolean).join(' • ');
        }
        if (openRouterKeyStatus.status === 'error') return '暂时无法检查 OpenRouter 限额。';
        return [
            remaining !== null ? `OpenRouter 剩余额度：${remaining}` : 'OpenRouter 密钥可用，额度正常。',
            dailyUsage !== null ? `今日用量：${dailyUsage}` : null,
            limitReset ? `重置时间：${limitReset}` : null
        ].filter(Boolean).join(' • ');
    }

    if (!openRouterKeyStatus || openRouterKeyStatus.status === 'checking') return 'Checking OpenRouter limits...';
    if (openRouterKeyStatus.status === 'limited') {
        return [
            'OpenRouter key is rate limited. Try again later.',
            dailyUsage !== null ? `Daily usage: ${dailyUsage}` : null,
            limitReset ? `Reset: ${limitReset}` : null
        ].filter(Boolean).join(' • ');
    }
    if (openRouterKeyStatus.status === 'error') return 'Unable to check OpenRouter limits right now.';
    return [
        remaining !== null ? `OpenRouter credits remaining: ${remaining}` : 'OpenRouter key is active. Quota available.',
        dailyUsage !== null ? `Daily usage: ${dailyUsage}` : null,
        limitReset ? `Reset: ${limitReset}` : null
    ].filter(Boolean).join(' • ');
};

const getLocalizedOpenRouterLimitExceededMessage = () => {
    if (currentLang === 'fr') return 'La clé OpenRouter a atteint sa limite actuelle. Réessayez plus tard.';
    if (currentLang === 'de') return 'Der OpenRouter-Schlüssel hat sein aktuelles Limit erreicht. Bitte später erneut versuchen.';
    if (currentLang === 'zh') return 'OpenRouter 密钥已达到当前限额，请稍后再试。';
    return 'The OpenRouter key has reached its current limit. Try again later.';
};

const getLocalizedFreeModelRetryMessage = (limitedModelName, nextModelName) => {
    if (currentLang === 'fr') {
        return `${limitedModelName} est temporairement limite. Nouvelle tentative automatique avec ${nextModelName}...`;
    }
    if (currentLang === 'de') {
        return `${limitedModelName} ist voruebergehend limitiert. Automatischer neuer Versuch mit ${nextModelName}...`;
    }
    if (currentLang === 'zh') {
        return `${limitedModelName} 当前临时限流，正在自动切换到 ${nextModelName} 重试...`;
    }
    return `${limitedModelName} is temporarily rate limited. Retrying automatically with ${nextModelName}...`;
};

const getLocalizedFreeModelFailureMessage = (limitedModelName) => {
    if (currentLang === 'fr') {
        return `${limitedModelName} est temporairement limite et aucun autre modele sain n'est disponible pour reprendre la requete.`;
    }
    if (currentLang === 'de') {
        return `${limitedModelName} ist voruebergehend limitiert und es ist kein weiterer gesunder Ersatz verfuegbar.`;
    }
    if (currentLang === 'zh') {
        return `${limitedModelName} 当前临时限流，且没有可立即接管的健康模型。`;
    }
    return `${limitedModelName} is temporarily rate limited and no other healthy model is available to take over.`;
};

const getLocalizedRecoveredAfterRetryMessage = (limitedModelName, resolvedModelName) => {
    if (currentLang === 'fr') {
        return `${limitedModelName} a ete ignore automatiquement. Requete finalisee avec ${resolvedModelName}.`;
    }
    if (currentLang === 'de') {
        return `${limitedModelName} wurde automatisch uebersprungen. Anfrage mit ${resolvedModelName} abgeschlossen.`;
    }
    if (currentLang === 'zh') {
        return `已自动跳过 ${limitedModelName}，请求已通过 ${resolvedModelName} 完成。`;
    }
    return `${limitedModelName} was skipped automatically. The request completed with ${resolvedModelName}.`;
};

const getLocalizedGlobalLimitNote = () => {
    if (currentLang === 'fr') return 'Limite globale OpenRouter atteinte. Le reroutage automatique est suspendu jusqu au reset du quota.';
    if (currentLang === 'de') return 'Globales OpenRouter-Limit erreicht. Automatisches Rerouting ist bis zum Reset pausiert.';
    if (currentLang === 'zh') return 'OpenRouter 全局额度已触发限制，自动切换已暂停，需等待额度重置。';
    return 'The global OpenRouter quota is exhausted. Automatic rerouting is paused until the quota resets.';
};

const renderModelFallbackNote = () => {
    if (!modelFallbackNoteEl) {
        return;
    }

    const ui = (i18n[currentLang] || i18n.en).ui;
    const tone = activeModelFallbackNotice?.tone || 'default';

    modelFallbackNoteEl.textContent = activeModelFallbackNotice?.message || ui.modelFallbackNote;
    modelFallbackNoteEl.classList.toggle('text-amber-300', tone === 'warning');
    modelFallbackNoteEl.classList.toggle('text-red-300', tone === 'error');
    modelFallbackNoteEl.classList.toggle('text-emerald-300', tone === 'success');
    modelFallbackNoteEl.classList.toggle('text-foreground-muted', tone === 'default');
};

const setModelFallbackNotice = (message = null, tone = 'default') => {
    activeModelFallbackNotice = message ? { message, tone } : null;
    renderModelFallbackNote();
};

const renderOpenRouterKeyStatus = () => {
    if (!openRouterKeyStatusEl) {
        return;
    }

    openRouterKeyStatusEl.textContent = getLocalizedOpenRouterKeyStatusText();
    openRouterKeyStatusEl.classList.toggle('text-red-300', isOpenRouterKeyLimited());
    openRouterKeyStatusEl.classList.toggle('text-foreground-muted', !isOpenRouterKeyLimited());
};

const setRefreshModelCatalogButtonState = (isRefreshing) => {
    if (!refreshModelCatalogBtn) {
        return;
    }

    const ui = (i18n[currentLang] || i18n.en).ui;
    refreshModelCatalogBtn.disabled = isRefreshing;
    refreshModelCatalogBtn.textContent = isRefreshing ? ui.refreshingModels : ui.refreshModelsBtn;
};

const refreshOpenRouterKeyStatus = async (force = false) => {
    const isFresh = !force
        && openRouterKeyStatus?.checkedAt
        && (Date.now() - openRouterKeyStatus.checkedAt) < KEY_STATUS_REFRESH_MS;

    if (isFresh) {
        renderOpenRouterKeyStatus();
        return openRouterKeyStatus;
    }

    if (isRefreshingOpenRouterKeyStatus) {
        return openRouterKeyStatus;
    }

    isRefreshingOpenRouterKeyStatus = true;

    if (!openRouterKeyStatus || force) {
        openRouterKeyStatus = {
            status: 'checking',
            checkedAt: Date.now()
        };
        renderOpenRouterKeyStatus();
    }

    try {
        const keyStatus = await getOpenRouterKeyStatus();
        openRouterKeyStatus = {
            ...keyStatus,
            status: typeof keyStatus.limitRemaining === 'number' && keyStatus.limitRemaining <= 0
                ? 'limited'
                : 'available',
            checkedAt: Date.now()
        };
    } catch (error) {
        openRouterKeyStatus = {
            status: error?.status === 429 ? 'limited' : 'error',
            reason: error?.message || 'Unable to check OpenRouter limits',
            checkedAt: Date.now()
        };
    } finally {
        isRefreshingOpenRouterKeyStatus = false;
        renderOpenRouterKeyStatus();
    }

    return openRouterKeyStatus;
};

const ensureOpenRouterKeyAvailable = async () => {
    const keyStatus = await refreshOpenRouterKeyStatus();
    return keyStatus?.status !== 'limited';
};

const refreshDynamicModelCatalog = async (forceRefresh = false) => {
    const nextModels = await getAvailableModels(forceRefresh);
    if (nextModels && Object.keys(nextModels).length > 0) {
        replaceApiModels(nextModels);
        loadModelAvailability();
        renderModelCatalogMeta();
    }
    return nextModels;
};

const setGenerateButtonState = (isGenerating, ui) => {
    if (!generateAIBtn) return;

    if (isGenerating) {
        generateAIBtn.disabled = false;
        generateAIBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        generateAIBtn.textContent = 'Stop generating';
        return;
    }

    if (!isUsingOpenRouter || !currentModelPath || isOpenRouterKeyLimited()) {
        generateAIBtn.disabled = true;
        generateAIBtn.classList.add('opacity-50', 'cursor-not-allowed');
        generateAIBtn.textContent = ui.generateBtn;
        return;
    }

    generateAIBtn.disabled = false;
    generateAIBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    generateAIBtn.textContent = ui.generateBtn;
};

const setExecuteButtonState = (isGenerating) => {
    if (!executePromptBtn) return;

    if (isGenerating) {
        executePromptBtn.disabled = false;
        executePromptBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        executePromptBtn.textContent = 'Stop generating';
        return;
    }

    if (!isUsingOpenRouter || !currentModelPath || isOpenRouterKeyLimited()) {
        executePromptBtn.disabled = true;
        executePromptBtn.classList.add('opacity-50', 'cursor-not-allowed');
        executePromptBtn.textContent = 'Execute Prompt';
        return;
    }

    executePromptBtn.disabled = false;
    executePromptBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    executePromptBtn.textContent = 'Execute Prompt';
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
    renderModelFallbackNote();
    setRefreshModelCatalogButtonState(isRefreshingModelCatalog);
    renderModelCatalogMeta();
    renderOpenRouterKeyStatus();

    refreshModelSelectorUI(getModelKeyById(currentModelPath));

    if (!isUsingOpenRouter || !currentModelPath) {
        improvedPromptEl.textContent = ui.waitingModel;
        if (!isRewriteGenerating) {
            setGenerateButtonState(false, ui);
        }
        if (executePromptBtn) {
            if (!isExecuteGenerating) {
                setExecuteButtonState(false);
            }
        }
    } else {
        if (!isRewriteGenerating) {
            setGenerateButtonState(false, ui);
        }
        if (executePromptBtn) {
            if (!isExecuteGenerating) {
                setExecuteButtonState(false);
            }
        }
    }

    // Update Analysis if results are visible
    if (!resultsArea.classList.contains('hidden')) {
        handleAnalysis();
    }

};

const getLocalizedModelStatusLabel = (status) => {
    if (currentLang === 'fr') {
        if (status === 'available') return 'Disponible';
        if (status === 'rate_limited') return 'Temporairement limite';
        if (status === 'unavailable') return 'Indisponible';
        if (status === 'checking') return 'Verification';
        return 'Statut inconnu';
    }

    if (currentLang === 'de') {
        if (status === 'available') return 'Verfuegbar';
        if (status === 'rate_limited') return 'Voruebergehend limitiert';
        if (status === 'unavailable') return 'Nicht verfuegbar';
        if (status === 'checking') return 'Pruefung';
        return 'Unbekannt';
    }

    if (currentLang === 'zh') {
        if (status === 'available') return '可用';
        if (status === 'rate_limited') return '暂时限流';
        if (status === 'unavailable') return '不可用';
        if (status === 'checking') return '检测中';
        return '未知';
    }

    if (status === 'available') return 'Available';
    if (status === 'rate_limited') return 'Temporarily rate limited';
    if (status === 'unavailable') return 'Unavailable';
    if (status === 'checking') return 'Checking';
    return 'Unknown status';
};

const getLocalizedModelStatusDetail = (status) => {
    if (currentLang === 'fr') {
        if (status === 'rate_limited') return 'Ce modele a retourne 429 recemment et est masque temporairement.';
        if (status === 'unavailable') return 'Ce modele a echoue lors du dernier test automatique.';
        if (status === 'checking') return 'Test automatique en cours au chargement de la page.';
        if (status === 'available') return 'Ce modele a repondu correctement lors du dernier test.';
        return 'Le statut sera actualise automatiquement.';
    }

    if (currentLang === 'de') {
        if (status === 'rate_limited') return 'Dieses Modell hat kuerzlich 429 geliefert und wird temporaer ausgeblendet.';
        if (status === 'unavailable') return 'Dieses Modell ist beim letzten automatischen Test fehlgeschlagen.';
        if (status === 'checking') return 'Automatischer Test laeuft beim Laden der Seite.';
        if (status === 'available') return 'Dieses Modell hat beim letzten Test korrekt geantwortet.';
        return 'Der Status wird automatisch aktualisiert.';
    }

    if (currentLang === 'zh') {
        if (status === 'rate_limited') return '该模型最近返回过 429，已被临时隐藏。';
        if (status === 'unavailable') return '该模型在最近一次自动检测中失败。';
        if (status === 'checking') return '页面加载时正在自动检测该模型。';
        if (status === 'available') return '该模型在最近一次检测中响应正常。';
        return '状态会自动刷新。';
    }

    if (status === 'rate_limited') return 'This model recently returned 429 and is temporarily hidden.';
    if (status === 'unavailable') return 'This model failed the latest automatic probe.';
    if (status === 'checking') return 'Automatic availability check is in progress.';
    if (status === 'available') return 'This model answered correctly during the latest probe.';
    return 'Status will refresh automatically.';
};

const getLocalizedModelFieldLabels = () => {
    if (currentLang === 'fr') {
        return {
            slug: 'slug',
            modalities: 'modalites',
            params: 'params'
        };
    }

    if (currentLang === 'de') {
        return {
            slug: 'slug',
            modalities: 'modalitaeten',
            params: 'parameter'
        };
    }

    if (currentLang === 'zh') {
        return {
            slug: 'slug',
            modalities: '模态',
            params: '参数'
        };
    }

    return {
        slug: 'slug',
        modalities: 'modalities',
        params: 'params'
    };
};

const getModelModalitySummary = (model) => {
    const modality = model?.architecture?.modality;
    if (typeof modality === 'string' && modality.trim()) {
        return modality.trim();
    }

    const inputs = Array.isArray(model?.architecture?.input_modalities)
        ? model.architecture.input_modalities.join(', ')
        : '';
    const outputs = Array.isArray(model?.architecture?.output_modalities)
        ? model.architecture.output_modalities.join(', ')
        : '';

    if (inputs || outputs) {
        return `${inputs || '?'} -> ${outputs || '?'}`;
    }

    return '';
};

const getSupportedParametersSummary = (model) => {
    const params = Array.isArray(model?.supportedParameters) ? model.supportedParameters : [];
    if (params.length === 0) {
        return '';
    }

    const preview = params.slice(0, 5).join(', ');
    return params.length > 5 ? `${preview} +${params.length - 5}` : preview;
};

const getModelSelectorBadge = (model) => {
    const modality = String(model?.architecture?.modality || '').toLowerCase();
    const inputs = Array.isArray(model?.architecture?.input_modalities)
        ? model.architecture.input_modalities.map((value) => String(value).toLowerCase())
        : [];
    const outputs = Array.isArray(model?.architecture?.output_modalities)
        ? model.architecture.output_modalities.map((value) => String(value).toLowerCase())
        : [];
    const modalities = new Set([modality, ...inputs, ...outputs]);

    const hasVision = Array.from(modalities).some((value) => value.includes('image') || value.includes('vision'));
    const hasAudio = Array.from(modalities).some((value) => value.includes('audio') || value.includes('speech') || value.includes('hearing'));

    if (hasVision && hasAudio) return '[MULTI]';
    if (hasVision) return '[VISION]';
    if (hasAudio) return '[AUDIO]';
    return '[TEXT]';
};

const getModelGroupKey = (model) => {
    const badge = getModelSelectorBadge(model);
    if (badge === '[VISION]') return 'vision';
    if (badge === '[AUDIO]') return 'audio';
    if (badge === '[MULTI]') return 'multi';
    return 'text';
};

const formatModelCatalogRefreshTime = (value) => {
    if (!value) {
        return null;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return null;
    }

    try {
        return new Intl.DateTimeFormat(currentLang === 'zh' ? 'zh-CN' : currentLang, {
            dateStyle: 'short',
            timeStyle: 'short'
        }).format(date);
    } catch {
        return date.toLocaleString();
    }
};

const renderModelCatalogMeta = () => {
    if (!modelCatalogMetaEl) {
        return;
    }

    const ui = (i18n[currentLang] || i18n.en).ui;
    const cacheInfo = getOpenRouterModelsCacheInfo();
    const formatted = formatModelCatalogRefreshTime(cacheInfo.cachedAt);
    modelCatalogMetaEl.textContent = `${ui.modelCatalogLastRefresh}: ${formatted || ui.modelCatalogNeverRefreshed}`;
};

const getModelAvailabilityRecord = (modelId) => modelAvailability.get(modelId) || null;

const isAvailabilityRecordFresh = (record) => {
    if (!record || !record.status || !record.checkedAt) {
        return false;
    }

    const ttl = MODEL_STATUS_TTLS[record.status] || 0;
    return ttl > 0 && (Date.now() - record.checkedAt) < ttl;
};

const persistModelAvailability = () => {
    try {
        const serializable = Object.fromEntries(
            Array.from(modelAvailability.entries())
                .filter(([_, record]) => record?.status && record.status !== 'checking')
        );
        localStorage.setItem(MODEL_AVAILABILITY_STORAGE_KEY, JSON.stringify(serializable));
    } catch {
        // Ignore storage failures.
    }
};

const loadModelAvailability = () => {
    modelAvailability.clear();

    try {
        const raw = localStorage.getItem(MODEL_AVAILABILITY_STORAGE_KEY);
        if (!raw) return;

        const parsed = JSON.parse(raw);
        Object.values(API_MODELS).forEach((model) => {
            const record = parsed?.[model.id];
            if (isAvailabilityRecordFresh(record)) {
                modelAvailability.set(model.id, record);
            }
        });
    } catch {
        localStorage.removeItem(MODEL_AVAILABILITY_STORAGE_KEY);
    }
};

const isModelBlocked = (modelId) => {
    const status = getModelAvailabilityRecord(modelId)?.status;
    return status === 'rate_limited' || status === 'unavailable';
};

const replaceApiModels = (models) => {
    Object.keys(API_MODELS).forEach((key) => {
        delete API_MODELS[key];
    });

    Object.entries(models || {}).forEach(([key, model]) => {
        API_MODELS[key] = model;
    });
};

const getModelKeyById = (modelId) => {
    const found = Object.entries(API_MODELS).find(([_, model]) => model.id === modelId);
    return found?.[0] || null;
};

const getBestSelectableModelKey = (preferredKey = null) => {
    const keys = Object.keys(API_MODELS);

    if (preferredKey && API_MODELS[preferredKey] && !isModelBlocked(API_MODELS[preferredKey].id)) {
        return preferredKey;
    }

    const recommendedKey = getRecommendedApiModelKey();
    if (recommendedKey && API_MODELS[recommendedKey] && !isModelBlocked(API_MODELS[recommendedKey].id)) {
        return recommendedKey;
    }

    return keys.find((key) => !isModelBlocked(API_MODELS[key].id)) || preferredKey || keys[0] || null;
};

const applySelectedModelKey = (key, persistSelection = true) => {
    const model = API_MODELS[key];
    if (!model) return;

    currentModelPath = model.id;
    isUsingOpenRouter = true;

    if (openRouterModelSelectorEl) {
        openRouterModelSelectorEl.value = key;
    }

    if (persistSelection) {
        localStorage.setItem('lastSelectedApiModel', key);
    }

    updateSelectedModelTooltip();

    const ui = (i18n[currentLang] || i18n.en).ui;
    if (!isRewriteGenerating) {
        setGenerateButtonState(false, ui);
    }
    if (!isExecuteGenerating) {
        setExecuteButtonState(false);
    }
};

const refreshModelSelectorUI = (preferredKey = null) => {
    const fallbackKey = preferredKey
        || getModelKeyById(currentModelPath)
        || openRouterModelSelectorEl?.value
        || localStorage.getItem('lastSelectedApiModel')
        || getRecommendedApiModelKey();

    populateModelSelector(fallbackKey);

    const nextKey = getBestSelectableModelKey(fallbackKey);
    if (nextKey && API_MODELS[nextKey]) {
        applySelectedModelKey(nextKey);
    }
};

const setModelAvailability = (modelId, status, reason = '') => {
    modelAvailability.set(modelId, {
        status,
        reason,
        checkedAt: Date.now()
    });
    persistModelAvailability();
    refreshModelSelectorUI(getModelKeyById(currentModelPath));
};

const handleModelRuntimeOutcome = (modelId, error = null) => {
    if (!error) {
        setModelAvailability(modelId, 'available');
        return;
    }

    if (error?.status === 429 || /\b429\b/.test(error?.message || '')) {
        setModelAvailability(modelId, 'rate_limited', error.message || '429');
        return;
    }

    if (error?.name !== 'AbortError') {
        setModelAvailability(modelId, 'unavailable', error?.message || 'Request failed');
    }
};

const getBackgroundProbeCandidates = () => {
    const preferredIds = new Set([
        currentModelPath,
        ...FALLBACK_PRIORITY_IDS
    ].filter(Boolean));

    const allModels = Object.values(API_MODELS);
    const prioritized = allModels.filter((model) => preferredIds.has(model.id));
    const secondary = allModels.filter((model) => !preferredIds.has(model.id));
    return [...prioritized, ...secondary].slice(0, MAX_BACKGROUND_MODEL_PROBES);
};

const refreshModelAvailabilityInBackground = async () => {
    if (isRefreshingModelAvailability) {
        return;
    }

    isRefreshingModelAvailability = true;

    try {
        const staleModels = getBackgroundProbeCandidates().filter((model) => {
            const existing = getModelAvailabilityRecord(model.id);
            return !isAvailabilityRecordFresh(existing);
        });

        if (staleModels.length === 0) {
            return;
        }

        staleModels.forEach((model) => {
            modelAvailability.set(model.id, {
                status: 'checking',
                reason: '',
                checkedAt: Date.now()
            });
        });
        refreshModelSelectorUI(getModelKeyById(currentModelPath));

        let nextIndex = 0;
        const workerCount = Math.max(1, Math.min(MODEL_PROBE_CONCURRENCY, staleModels.length));

        await Promise.allSettled(Array.from({ length: workerCount }, async () => {
            while (nextIndex < staleModels.length) {
                const model = staleModels[nextIndex];
                nextIndex += 1;

                const controller = new AbortController();
                const timeoutId = window.setTimeout(() => controller.abort(), 8000);

                try {
                    const result = await probeOpenRouterModel(model.id, controller.signal);
                    setModelAvailability(model.id, result.status, result.reason || '');
                } catch (error) {
                    if (error?.name === 'AbortError') {
                        setModelAvailability(model.id, 'unavailable', 'Probe timed out');
                    } else {
                        setModelAvailability(model.id, 'unavailable', error?.message || 'Probe failed');
                    }
                } finally {
                    window.clearTimeout(timeoutId);
                }
            }
        }));
    } finally {
        isRefreshingModelAvailability = false;
    }
};

const populateModelSelector = (selectedKey = null) => {
    if (openRouterModelSelectorEl) {
        openRouterModelSelectorEl.innerHTML = '';
        const ui = (i18n[currentLang] || i18n.en).ui;
        const groupedEntries = new Map([
            ['text', []],
            ['vision', []],
            ['audio', []],
            ['multi', []]
        ]);

        Object.entries(API_MODELS).forEach(([key, model]) => {
            groupedEntries.get(getModelGroupKey(model))?.push([key, model]);
        });

        ['text', 'vision', 'audio', 'multi'].forEach((groupKey) => {
            const entries = groupedEntries.get(groupKey) || [];
            if (entries.length === 0) {
                return;
            }

            const optgroup = document.createElement('optgroup');
            optgroup.label = ui.modelGroups?.[groupKey] || groupKey;

            entries.forEach(([key, model]) => {
                const status = getModelAvailabilityRecord(model.id)?.status || 'unknown';
                const modalityBadge = getModelSelectorBadge(model);
                const option = document.createElement('option');
                option.value = key;
                option.textContent = status === 'unknown'
                    ? `${model.name} ${modalityBadge}`
                    : `${model.name} ${modalityBadge} • ${getLocalizedModelStatusLabel(status)}`;
                option.title = model.description || model.name;
                option.dataset.description = model.description || model.name;
                option.dataset.provider = model.provider || 'OpenRouter';
                option.dataset.context = model.context || 'N/A';
                option.dataset.modality = modalityBadge;
                option.dataset.status = status;
                option.disabled = isModelBlocked(model.id);
                optgroup.appendChild(option);
            });

            openRouterModelSelectorEl.appendChild(optgroup);
        });

        if (selectedKey && API_MODELS[selectedKey]) {
            openRouterModelSelectorEl.value = selectedKey;
        }
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
    const status = getModelAvailabilityRecord(selectedModel.id)?.status || 'unknown';
    const labels = getLocalizedModelFieldLabels();
    const modalitySummary = getModelModalitySummary(selectedModel);
    const supportedParameters = getSupportedParametersSummary(selectedModel);
    const canonicalSlug = selectedModel.canonicalSlug || selectedModel.id;

    modelInfoTextEl.textContent = [
        provider,
        context,
        getLocalizedModelStatusLabel(status),
        canonicalSlug ? `${labels.slug}: ${canonicalSlug}` : null,
        modalitySummary ? `${labels.modalities}: ${modalitySummary}` : null,
        supportedParameters ? `${labels.params}: ${supportedParameters}` : null,
        desc,
        getLocalizedModelStatusDetail(status)
    ].filter(Boolean).join(' • ');
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

const FALLBACK_PRIORITY_IDS = [
    'qwen/qwen3-next-80b-a3b-instruct:free',
    'openrouter/hunter-alpha',
    'nvidia/nemotron-3-super-120b-a12b:free',
    'openai/gpt-oss-120b:free',
    'meta-llama/llama-3.3-70b-instruct:free',
    'qwen/qwen3-coder:free',
    'stepfun/step-3.5-flash:free',
    'arcee-ai/trinity-large-preview:free',
    'z-ai/glm-4.5-air:free',
    'mistralai/mistral-small-3.1-24b-instruct:free',
    'google/gemma-3-27b-it:free',
    'openai/gpt-oss-20b:free',
    'nvidia/nemotron-3-nano-30b-a3b:free',
    'google/gemma-3n-e4b-it:free',
    'nousresearch/hermes-3-llama-3.1-405b:free',
    'meta-llama/llama-3.2-3b-instruct:free',
    'qwen/qwen3-4b:free',
    'cognitivecomputations/dolphin-mistral-24b-venice-edition:free',
    'liquid/lfm-2.5-1.2b-instruct:free'
];
const MAX_FALLBACK_MODEL_IDS = 3;

const isLowPriorityFallback = (modelId) => /thinking/i.test(modelId || '');

const getFallbackModelIds = (primaryModelId) => {
    const allEntries = Object.entries(API_MODELS);
    const allIds = allEntries
        .map(([_, model]) => model.id);
    const recommendedIds = allEntries
        .filter(([_, model]) => model.recommended && model.id !== primaryModelId)
        .map(([_, model]) => model.id);

    const orderedPriorityIds = FALLBACK_PRIORITY_IDS
        .filter((id) => allIds.includes(id) && id !== primaryModelId);

    const remainingIds = allIds.filter((id) => id !== primaryModelId);
    const lowPriorityIds = remainingIds.filter((id) => isLowPriorityFallback(id));
    const standardIds = remainingIds.filter((id) => !isLowPriorityFallback(id));

    const orderedIds = Array.from(new Set([
        primaryModelId,
        ...recommendedIds,
        ...orderedPriorityIds,
        ...standardIds,
        ...lowPriorityIds
    ]));

    const preferredIds = orderedIds.filter((id) => !isModelBlocked(id));
    const limitedPreferredIds = preferredIds.slice(0, MAX_FALLBACK_MODEL_IDS);
    const limitedOrderedIds = orderedIds.slice(0, MAX_FALLBACK_MODEL_IDS);
    return limitedPreferredIds.length > 0 ? limitedPreferredIds : limitedOrderedIds;
};

const getRetryStatusMessage = (nextModelName) => {
    if (currentLang === 'fr') {
        return `Modele temporairement indisponible. Bascule automatique vers ${nextModelName}...`;
    }
    if (currentLang === 'de') {
        return `Modell voruebergehend nicht verfuegbar. Automatischer Wechsel zu ${nextModelName}...`;
    }
    if (currentLang === 'zh') {
        return `当前模型暂时不可用，正在自动切换到 ${nextModelName}...`;
    }
    return `Model temporarily unavailable. Switching automatically to ${nextModelName}...`;
};

const getModelNameById = (modelId) => {
    const entry = Object.values(API_MODELS).find((model) => model.id === modelId);
    return entry?.name || modelId;
};
const createRuntimeRetryError = (message, originalError = null) => {
    const nextError = new Error(message);
    nextError.status = originalError?.status;
    nextError.responseText = originalError?.responseText || '';
    nextError.originalError = originalError || null;
    return nextError;
};

const syncSelectorFromModelId = (modelId) => {
    const key = getModelKeyById(modelId);
    if (!key) return;
    applySelectedModelKey(key);
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
    initLanguageSelector();
    setWorkflowStep('input');

    await refreshDynamicModelCatalog();

    loadModelAvailability();
    populateModelSelector();

    const recommendedApiModelKey = getRecommendedApiModelKey();

    const lastSelectedApiModel = localStorage.getItem('lastSelectedApiModel');
    const selectedApiModelKey = (lastSelectedApiModel && API_MODELS[lastSelectedApiModel])
        ? lastSelectedApiModel
        : (recommendedApiModelKey || Object.keys(API_MODELS)[0]);

    const initialModelKey = getBestSelectableModelKey(selectedApiModelKey);
    if (initialModelKey && API_MODELS[initialModelKey]) {
        applySelectedModelKey(initialModelKey);
    }

    if (modelInfoTriggerEl) {
        modelInfoTriggerEl.addEventListener('focus', () => {
            modelInfoTriggerEl.setAttribute('aria-expanded', 'true');
        });
        modelInfoTriggerEl.addEventListener('blur', () => {
            modelInfoTriggerEl.setAttribute('aria-expanded', 'false');
        });
    }

    updateLanguageUI();
    refreshOpenRouterKeyStatus();

    if (openRouterModelSelectorEl) {
        openRouterModelSelectorEl.addEventListener('change', () => {
            const key = openRouterModelSelectorEl.value;
            const model = API_MODELS[key];
            if (!model) return;
            if (isModelBlocked(model.id)) {
                refreshModelSelectorUI(getModelKeyById(currentModelPath));
                return;
            }
            applySelectedModelKey(key);
            updateLanguageUI();
        });
    }

    if (refreshModelCatalogBtn) {
        refreshModelCatalogBtn.addEventListener('click', async () => {
            if (isRefreshingModelCatalog) {
                return;
            }

            isRefreshingModelCatalog = true;
            setRefreshModelCatalogButtonState(true);

            try {
                clearOpenRouterModelsCache();
                const selectedModelId = currentModelPath;
                await refreshDynamicModelCatalog(true);
                refreshModelSelectorUI(getModelKeyById(selectedModelId));
                renderModelCatalogMeta();
                if (openRouterKeyStatusEl) {
                    openRouterKeyStatusEl.textContent = (i18n[currentLang] || i18n.en).ui.modelsRefreshed;
                }
                window.setTimeout(() => renderOpenRouterKeyStatus(), 2000);
            } catch {
                if (openRouterKeyStatusEl) {
                    openRouterKeyStatusEl.textContent = (i18n[currentLang] || i18n.en).ui.modelsRefreshFailed;
                }
                window.setTimeout(() => renderOpenRouterKeyStatus(), 2500);
            } finally {
                isRefreshingModelCatalog = false;
                setRefreshModelCatalogButtonState(false);
                window.setTimeout(() => {
                    refreshModelAvailabilityInBackground();
                }, 100);
            }
        });
    }

    if (donationBtn) {
        donationBtn.addEventListener('click', createNowPaymentDonation);
    }

    window.setTimeout(() => {
        refreshModelAvailabilityInBackground();
    }, 250);

    window.setTimeout(() => {
        refreshOpenRouterKeyStatus();
    }, 400);
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
    const ui = (i18n[currentLang] || i18n.en).ui;

    if (isRewriteGenerating) {
        if (rewriteAbortController) {
            rewriteAbortController.abort();
        }
        isRewriteGenerating = false;
        rewriteAbortController = null;
        improvedPromptEl.textContent = 'Generation stopped.';
        setGenerateButtonState(false, ui);
        return;
    }

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

    if (!await ensureOpenRouterKeyAvailable()) {
        improvedPromptEl.textContent = getLocalizedOpenRouterLimitExceededMessage();
        setGenerateButtonState(false, ui);
        if (!isExecuteGenerating) {
            setExecuteButtonState(false);
        }
        return;
    }

    setWorkflowStep('improve');
    isRewriteGenerating = true;
    rewriteAbortController = new AbortController();
    setGenerateButtonState(true, ui);
    improvedPromptEl.textContent = ui.analyzing;

    try {
        const heuristics = analyzePromptHeuristics(prompt, currentLang);

        if (!currentModelPath) {
            throw new Error('No API model selected for OpenRouter');
        }

        setModelFallbackNotice(null);
        const { response: improved, reroutedFromModelId } = await executeWithModelRecovery({
            primaryModelId: currentModelPath,
            executeRequest: (candidateModelIds) => improvePromptWithOpenRouter(
                prompt,
                candidateModelIds,
                (chunk) => {
                    if (chunk) improvedPromptEl.textContent = chunk;
                },
                heuristics,
                rewriteAbortController?.signal
            ),
            onRetrying: (message) => {
                improvedPromptEl.textContent = message;
            }
        });

        const resolvedModelId = improved?.modelId || getFallbackModelIds(currentModelPath)[0] || currentModelPath;
        handleModelRuntimeOutcome(resolvedModelId, null);
        currentModelPath = resolvedModelId;
        isUsingOpenRouter = true;
        syncSelectorFromModelId(resolvedModelId);
        if (reroutedFromModelId && reroutedFromModelId !== resolvedModelId) {
            setModelFallbackNotice(
                getLocalizedRecoveredAfterRetryMessage(getModelNameById(reroutedFromModelId), getModelNameById(resolvedModelId)),
                'success'
            );
        } else {
            setModelFallbackNotice(null);
        }
        improvedPromptEl.textContent = formatModelOutput(improved?.content || '');
        setWorkflowStep('export');
    } catch (err) {
        if (err?.name === 'AbortError') {
            improvedPromptEl.textContent = 'Generation stopped.';
        } else {
            const classification = classifyOpenRouterError(err);
            if (!classification.isRateLimit) {
                handleModelRuntimeOutcome(currentModelPath, err);
            }
            improvedPromptEl.textContent = err?.message || ui.rewriteFailed;
        }
    } finally {
        isRewriteGenerating = false;
        rewriteAbortController = null;
        setGenerateButtonState(false, ui);
    }
};

/**
 * Execute the prompt directly against the selected model (no system prompt).
 */
const handleExecutePrompt = async () => {
    if (isExecuteGenerating) {
        if (executeAbortController) {
            executeAbortController.abort();
        }
        isExecuteGenerating = false;
        executeAbortController = null;
        improvedPromptEl.textContent = 'Generation stopped.';
        setExecuteButtonState(false);
        return;
    }

    const prompt = promptInput.value.trim();
    if (!prompt) return;

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

    if (!await ensureOpenRouterKeyAvailable()) {
        improvedPromptEl.textContent = getLocalizedOpenRouterLimitExceededMessage();
        if (!isRewriteGenerating) {
            setGenerateButtonState(false, ui);
        }
        setExecuteButtonState(false);
        return;
    }

    setWorkflowStep('improve');
    isExecuteGenerating = true;
    executeAbortController = new AbortController();

    setExecuteButtonState(true);

    if (generateAIBtn) {
        generateAIBtn.disabled = true;
    }

    improvedPromptEl.textContent = 'Executing prompt without system template...';

    try {
        if (!currentModelPath) {
            throw new Error('No API model selected for OpenRouter');
        }

        setModelFallbackNotice(null);
        const { response: modelOutput, reroutedFromModelId } = await executeWithModelRecovery({
            primaryModelId: currentModelPath,
            executeRequest: (candidateModelIds) => executePromptWithOpenRouter(
                prompt,
                candidateModelIds,
                (chunk) => {
                    if (chunk) improvedPromptEl.textContent = formatModelOutput(chunk);
                },
                executeAbortController?.signal
            ),
            onRetrying: (message) => {
                improvedPromptEl.textContent = message;
            }
        });

        const resolvedModelId = modelOutput?.modelId || getFallbackModelIds(currentModelPath)[0] || currentModelPath;
        handleModelRuntimeOutcome(resolvedModelId, null);
        currentModelPath = resolvedModelId;
        isUsingOpenRouter = true;
        syncSelectorFromModelId(resolvedModelId);
        if (reroutedFromModelId && reroutedFromModelId !== resolvedModelId) {
            setModelFallbackNotice(
                getLocalizedRecoveredAfterRetryMessage(getModelNameById(reroutedFromModelId), getModelNameById(resolvedModelId)),
                'success'
            );
        } else {
            setModelFallbackNotice(null);
        }
        improvedPromptEl.textContent = formatModelOutput(modelOutput?.content || '');
        setWorkflowStep('export');
    } catch (err) {
        if (err?.name === 'AbortError') {
            improvedPromptEl.textContent = 'Generation stopped.';
        } else {
            const classification = classifyOpenRouterError(err);
            if (!classification.isRateLimit) {
                handleModelRuntimeOutcome(currentModelPath, err);
            }
            improvedPromptEl.textContent = `Execution failed: ${err?.message || 'Unknown error'}`;
        }
    } finally {
        isExecuteGenerating = false;
        executeAbortController = null;
        setExecuteButtonState(false);
        if (generateAIBtn) {
            generateAIBtn.disabled = false;
            generateAIBtn.textContent = ui.generateBtn;
        }
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
    const buildOrderedCandidateModelIds = (primaryModelId) => {
        const allEntries = Object.entries(API_MODELS);
        const allIds = allEntries.map(([_, model]) => model.id);
        const recommendedIds = allEntries
            .filter(([_, model]) => model.recommended && model.id !== primaryModelId)
            .map(([_, model]) => model.id);

        const orderedPriorityIds = FALLBACK_PRIORITY_IDS
            .filter((id) => allIds.includes(id) && id !== primaryModelId);

        const remainingIds = allIds.filter((id) => id !== primaryModelId);
        const lowPriorityIds = remainingIds.filter((id) => isLowPriorityFallback(id));
        const standardIds = remainingIds.filter((id) => !isLowPriorityFallback(id));

        return Array.from(new Set([
            primaryModelId,
            ...recommendedIds,
            ...orderedPriorityIds,
            ...standardIds,
            ...lowPriorityIds
        ]));
    };
};

        const orderedIds = buildOrderedCandidateModelIds(primaryModelId);

const marketingSamplePrompt = 'You are a B2B growth strategist. Create a 90-day go-to-market plan for a SaaS startup targeting HR teams. Return a week-by-week plan in a markdown table with goals, channels, KPIs, and risks. Constraints: budget under $15,000, focus on organic + outbound, maximum 350 words.';
const codingSamplePrompt = 'You are a senior JavaScript engineer. Refactor the function below for readability and performance, then provide unit tests. Return 1) improved code, 2) test cases, 3) explanation. Constraints: keep same behavior, avoid external libraries, include edge cases.';
const seoSamplePrompt = 'You are a senior SEO consultant. Build a 3-month SEO action plan for a B2B SaaS website in France. Return: 1) 10 target keywords (intent + difficulty + page type), 2) on-page fixes (title, H1/H2, meta), 3) technical priorities, 4) weekly KPI dashboard. Constraints: practical, business-focused, no fluff.';
const salesSamplePrompt = 'You are an enterprise sales strategist. Write a cold outreach sequence for selling an AI productivity SaaS to Head of Product personas. Return 1) 3 email drafts, 2) 2 LinkedIn messages, 3) objection handling script, 4) CTA variations. Constraints: concise, human tone, max 120 words per email.';
const supportSamplePrompt = 'You are a customer support operations lead. Create a response playbook for handling AI tool onboarding tickets. Return: triage categories, SLA targets, 8 response templates, escalation rules, and quality checklist. Constraints: clear markdown table, professional tone, globally applicable.';
    const executeWithModelRecovery = async ({
        primaryModelId,
        executeRequest,
        onRetrying = null
    }) => {
        const orderedIds = buildOrderedCandidateModelIds(primaryModelId);
        const runtimeBlockedIds = new Set();
        let reroutedFromModelId = null;
        let lastError = null;

        while (true) {
            const candidateModelIds = orderedIds
                .filter((id) => !runtimeBlockedIds.has(id) && !isModelBlocked(id))
                .slice(0, MAX_FALLBACK_MODEL_IDS);

            if (candidateModelIds.length === 0) {
                throw lastError || new Error(getLocalizedFreeModelFailureMessage(getModelNameById(primaryModelId)));
            }

            try {
                const response = await executeRequest(candidateModelIds);
                return {
                    response,
                    reroutedFromModelId
                };
            } catch (error) {
                if (error?.name === 'AbortError') {
                    throw error;
                }

                lastError = error;
                const classification = classifyOpenRouterError(error);

                if (!classification.isRateLimit) {
                    throw error;
                }

                const keyStatus = await refreshOpenRouterKeyStatus(true);
                if (keyStatus?.status === 'limited') {
                    setModelFallbackNotice(getLocalizedGlobalLimitNote(), 'error');
                    throw createRuntimeRetryError(getLocalizedOpenRouterLimitExceededMessage(), error);
                }

                const blockedModelId = classification.rateLimitedModelId || candidateModelIds[0];
                reroutedFromModelId = reroutedFromModelId || blockedModelId;
                handleModelRuntimeOutcome(blockedModelId, error);
                runtimeBlockedIds.add(blockedModelId);

                const nextCandidateIds = orderedIds
                    .filter((id) => !runtimeBlockedIds.has(id) && !isModelBlocked(id))
                    .slice(0, MAX_FALLBACK_MODEL_IDS);

                if (nextCandidateIds.length === 0) {
                    const limitedModelName = getModelNameById(blockedModelId);
                    const failureMessage = getLocalizedFreeModelFailureMessage(limitedModelName);
                    setModelFallbackNotice(failureMessage, 'error');
                    throw createRuntimeRetryError(failureMessage, error);
                }

                const limitedModelName = getModelNameById(blockedModelId);
                const nextModelName = getModelNameById(nextCandidateIds[0]);
                const retryMessage = getLocalizedFreeModelRetryMessage(limitedModelName, nextModelName);
                setModelFallbackNotice(retryMessage, 'warning');
                if (typeof onRetrying === 'function') {
                    onRetrying(retryMessage);
                }
            }
        }
    };
const productSamplePrompt = 'You are a senior product manager. Draft a PRD outline for a Prompt Quality Scoring feature in a SaaS app. Include problem statement, target users, jobs-to-be-done, scope, non-goals, UX flows, success metrics, and rollout plan. Constraints: crisp bullets, no generic statements.';

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

if (sampleSeoBtn) {
    sampleSeoBtn.addEventListener('click', () => applySamplePrompt(seoSamplePrompt));
}

if (sampleSalesBtn) {
    sampleSalesBtn.addEventListener('click', () => applySamplePrompt(salesSamplePrompt));
}

if (sampleSupportBtn) {
    sampleSupportBtn.addEventListener('click', () => applySamplePrompt(supportSamplePrompt));
}

if (sampleProductBtn) {
    sampleProductBtn.addEventListener('click', () => applySamplePrompt(productSamplePrompt));
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

const maybeRunHeuristicTests = async () => {
    if (!import.meta.env.DEV) {
        return;
    }

    try {
        const { runHeuristicTests } = await import('./test-prompts.js');
        runHeuristicTests();
    } catch (error) {
        console.warn('Tests failed to run', error);
    }
};

// Wait for DOM to be ready before initializing
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initApp();
        maybeRunHeuristicTests();
    });
} else {
    // DOM already loaded
    initApp();
    maybeRunHeuristicTests();
}

