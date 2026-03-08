/**
 * Heuristic Scoring Engine for AI Prompts
 * 100% Offline & Local
 */

import { i18n } from './i18n.js';

export const analyzePromptHeuristics = (prompt, lang = 'en') => {
    const p = prompt.toLowerCase();
    const words = prompt.trim().split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;
    const config = i18n[lang] || i18n.en;
    const patterns = config.heuristics.patterns;
    const langIssues = config.heuristics.issues;

    const scores = {
        role: 0,
        outputFormat: 0,
        constraints: 0,
        context: 0,
        specificity: 0,
        clarity: 0,
        structure: 0,
        length: 0
    };

    const issues = [];

    // 1. Role Definition (15 pts)
    if (patterns.role.some(pattern => p.includes(pattern))) {
        scores.role = 15;
    } else {
        issues.push(langIssues.role);
    }

    // 2. Output Format (15 pts)
    if (patterns.format.some(pattern => p.includes(pattern))) {
        scores.outputFormat = 15;
    } else {
        issues.push(langIssues.format);
    }

    // 3. Constraints (15 pts)
    if (patterns.constraints.some(pattern => p.includes(pattern))) {
        scores.constraints = 15;
    } else {
        issues.push(langIssues.constraints);
    }

    // 4. Context Presence (15 pts)
    if (patterns.context.some(pattern => p.includes(pattern))) {
        scores.context = 15;
    } else {
        issues.push(langIssues.context);
    }

    // 5. Specificity (10 pts)
    const hasNumbers = /\d+/.test(prompt);
    const hasQuotes = /["']/.test(prompt);
    if (hasNumbers || hasQuotes || patterns.specificity.some(k => p.includes(k))) {
        scores.specificity = 10;
    } else {
        issues.push(langIssues.specificity);
    }

    // 6. Clarity (10 pts)
    const avgWordLen = words.reduce((acc, w) => acc + w.length, 0) / (wordCount || 1);
    if (avgWordLen > 4 && avgWordLen < 8 && wordCount > 10) {
        scores.clarity = 10;
    } else if (wordCount <= 10) {
        scores.clarity = 5;
        issues.push(langIssues.short);
    } else {
        scores.clarity = 7;
    }

    // 7. Structure (10 pts)
    const hasNewlines = prompt.includes('\n');
    const hasLists = /^\s*[-*•\d.]/m.test(prompt);
    const hasHeaders = /[#]{1,3}\s/.test(prompt) || /^[A-Z\s]+:$/m.test(prompt);
    if (hasNewlines && (hasLists || hasHeaders)) {
        scores.structure = 10;
    } else if (hasNewlines) {
        scores.structure = 7;
    } else {
        issues.push(langIssues.structure);
    }

    // 8. Length Optimization (10 pts)
    if (wordCount >= 50 && wordCount <= 300) {
        scores.length = 10;
    } else if (wordCount > 300) {
        scores.length = 8; // Slightly long
    } else if (wordCount > 0) {
        scores.length = 5;
    }

    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);

    return {
        totalScore,
        scores,
        issues,
        metrics: {
            wordCount,
            avgWordLen: avgWordLen.toFixed(1)
        }
    };
};
