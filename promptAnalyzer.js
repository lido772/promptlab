/**
 * Heuristic Scoring Engine for AI Prompts
 * Heuristic prompt analysis engine
 */

import { i18n } from './i18n.js';

export const analyzePromptHeuristics = (prompt, lang = 'en') => {
    const p = prompt.toLowerCase();
    const words = prompt.trim().split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;
    const config = i18n[lang] || i18n.en;
    const patterns = config.heuristics.patterns;
    const langIssues = config.heuristics.issues;

    const scoreCaps = {
        role: 15,
        outputFormat: 15,
        constraints: 15,
        context: 15,
        specificity: 10,
        clarity: 10,
        structure: 10,
        completeness: 10,
        consistency: 10,
        length: 10
    };

    const scores = {
        role: 0,
        outputFormat: 0,
        constraints: 0,
        context: 0,
        specificity: 0,
        clarity: 0,
        structure: 0,
        completeness: 0,
        consistency: 0
    };

    const issues = [];

    // ========== 1. Role Definition (15 pts) - Nuanced scoring ==========
    if (patterns.role.some(pattern => p.includes(pattern))) {
        // Check for expert level
        const hasExpert = /expert|specialist|professional|senior|master/.test(p);
        const hasBasic = /you are|act as|as a/.test(p);
        scores.role = hasExpert ? 15 : (hasBasic ? 12 : 8);
    } else {
        issues.push(langIssues.role);
    }

    // ========== 2. Output Format (15 pts) - Nuanced scoring ==========
    if (patterns.format.some(pattern => p.includes(pattern))) {
        const hasSpecificFormat = /return as|output as|format:\s*|show as/.test(p);
        const hasBasicFormat = /json|markdown|list|table/.test(p);
        scores.outputFormat = hasSpecificFormat ? 15 : (hasBasicFormat ? 10 : 7);
    } else {
        issues.push(langIssues.format);
    }

    // ========== 3. Constraints (15 pts) - Enhanced detection ==========
    const constraintKeywords = patterns.constraints.filter(k => p.includes(k));
    if (constraintKeywords.length > 0) {
        // More points for multiple constraints
        scores.constraints = Math.min(15, 10 + constraintKeywords.length * 1);
    } else {
        issues.push(langIssues.constraints);
    }

    // ========== 4. Context Presence (15 pts) - Advanced detection ==========
    const contextKeywords = patterns.context.filter(k => p.includes(k));
    const hasBackground = /background|given that|based on|scenario|situation/.test(p);
    const hasObjective = /goal|objective|purpose|aim|task is to/.test(p);
    const hasAudience = /audience|for|user|client|customer/.test(p);

    if (contextKeywords.length > 0 && (hasBackground || hasObjective || hasAudience)) {
        scores.context = 15;
    } else if (contextKeywords.length > 0) {
        scores.context = 8; // Partial context
    } else {
        issues.push(langIssues.context);
    }

    // ========== 5. Specificity (10 pts) - Improved detection ==========
    const hasNumbers = /\d+/.test(prompt);
    const hasQuotes = /["']/.test(prompt);
    const specificKeywords = patterns.specificity.filter(k => p.includes(k));

    // Penalize vague words
    const vagueWords = /\b(something|anything|some stuff|thing|it)\b/.test(p);
    const vaguePronouns = /\b(it|they|this|these)\b(?!\s+(?:prompt|text|request))/g.test(p);

    if (hasNumbers || hasQuotes || specificKeywords.length > 0) {
        const specificityScore = 5 + (hasNumbers ? 2 : 0) + (hasQuotes ? 1 : 0) + Math.min(2, specificKeywords.length);
        scores.specificity = Math.min(10, specificityScore);
    }

    if (vagueWords || vaguePronouns) {
        issues.push("Prompt contains vague words or ambiguous pronouns");
    } else if (!hasNumbers && !hasQuotes && specificKeywords.length === 0) {
        issues.push(langIssues.specificity);
    }

    // ========== 6. Clarity (10 pts) - Enhanced detection ==========
    const avgWordLen = words.reduce((acc, w) => acc + w.length, 0) / (wordCount || 1);
    const hasComplexSentence = /[,.;:]{2,}/.test(p); // Multiple punctuation

    if (avgWordLen > 4 && avgWordLen < 8 && wordCount > 10 && !hasComplexSentence) {
        scores.clarity = 10;
    } else if (wordCount <= 10) {
        scores.clarity = 5;
        issues.push(langIssues.short);
    } else if (hasComplexSentence) {
        scores.clarity = 6; // Penalize overly complex sentences
    } else {
        scores.clarity = 8;
    }

    // ========== 7. Structure (10 pts) - Advanced detection ==========
    const hasNewlines = prompt.includes('\n');
    const hasLists = /^\s*[-*•\d.]/m.test(prompt);
    const hasHeaders = /[#]{1,3}\s/.test(prompt) || /^[A-Z\s]+:$/m.test(prompt);

    // Check for sections
    const hasSections = /\b(?:background|context|task|goal|objective|output|format|requirements):\s*/i.test(p);
    const hasSteps = /\b(?:step\s*\d+|\d+\.|-\s+\d+)\b/i.test(p);
    const hasSeparators = /\-{3,}|={3,}|~{3,}/.test(prompt);

    if (hasNewlines && (hasLists || hasHeaders || hasSections || hasSteps || hasSeparators)) {
        scores.structure = 10;
    } else if (hasNewlines) {
        scores.structure = 7;
    } else {
        issues.push(langIssues.structure);
    }

    // ========== 8. Completeness (10 pts) - NEW ==========
    const hasInstructions = /instructions?|please|make sure|ensure that|remember to/i.test(prompt);
    const hasExamples = /example|for instance|such as|like|similar to/i.test(prompt);
    const hasSuccessCriteria = /should|must|need to|require that|criteria/i.test(prompt);
    const hasOutputSpec = /output|return|result|response should/i.test(p);

    if ((hasInstructions || hasExamples) && (hasSuccessCriteria || hasOutputSpec)) {
        scores.completeness = 10;
    } else if (hasSuccessCriteria || hasOutputSpec) {
        scores.completeness = 7; // Partial completeness
    } else {
        issues.push("Missing success criteria or output specifications");
    }

    // ========== 9. Internal Consistency (10 pts) - NEW ==========
    const consistencyIssues = [];

    // Check if format matches the task type
    if (p.includes('json') && !/table|list|data|object/i.test(p)) {
        consistencyIssues.push("JSON format requested but prompt suggests table/list output");
    }
    if (p.includes('creative') && /\d+/.test(prompt)) {
        consistencyIssues.push("Creative task with numeric constraints may be too restrictive");
    }
    if (patterns.role.some(k => p.includes(k)) && !patterns.context.some(k => p.includes(k))) {
        consistencyIssues.push("Role defined but lacks context about who/what/where");
    }

    if (consistencyIssues.length > 0) {
        scores.consistency = Math.max(0, 10 - consistencyIssues.length * 3);
        issues.push(...consistencyIssues);
    } else {
        scores.consistency = 10;
    }

    // ========== 10. Length Optimization (10 pts) - Adjusted ==========
    if (wordCount >= 50 && wordCount <= 300) {
        scores.length = 10;
    } else if (wordCount > 300 && wordCount <= 500) {
        scores.length = 8; // Acceptably long
    } else if (wordCount > 500) {
        scores.length = 5; // Too long
    } else if (wordCount > 20) {
        scores.length = 7; // Short but acceptable
    } else if (wordCount > 0) {
        scores.length = 5;
    }

    const rawTotalScore = Object.values(scores).reduce((a, b) => a + b, 0);
    const maxScore = Object.values(scoreCaps).reduce((a, b) => a + b, 0);
    const normalizedTotalScore = Math.round((rawTotalScore / maxScore) * 100);

    const scoreBreakdown = [
        { key: 'role', label: 'Role', score: scores.role, max: scoreCaps.role },
        { key: 'outputFormat', label: 'Format', score: scores.outputFormat, max: scoreCaps.outputFormat },
        { key: 'constraints', label: 'Constraints', score: scores.constraints, max: scoreCaps.constraints },
        { key: 'context', label: 'Context', score: scores.context, max: scoreCaps.context },
        { key: 'specificity', label: 'Specificity', score: scores.specificity, max: scoreCaps.specificity },
        { key: 'clarity', label: 'Clarity', score: scores.clarity, max: scoreCaps.clarity },
        { key: 'structure', label: 'Structure', score: scores.structure, max: scoreCaps.structure },
        { key: 'completeness', label: 'Completeness', score: scores.completeness, max: scoreCaps.completeness },
        { key: 'consistency', label: 'Consistency', score: scores.consistency, max: scoreCaps.consistency },
        { key: 'length', label: 'Length', score: scores.length, max: scoreCaps.length }
    ];

    return {
        totalScore: normalizedTotalScore,
        rawTotalScore,
        maxScore,
        scores,
        scoreBreakdown,
        issues,
        metrics: {
            wordCount,
            avgWordLen: avgWordLen.toFixed(1)
        }
    };
};
