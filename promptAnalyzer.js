/**
 * Heuristic Scoring Engine for AI Prompts
 * 100% Offline & Local
 */

export const analyzePromptHeuristics = (prompt) => {
    const p = prompt.toLowerCase();
    const words = prompt.trim().split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;

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
    const rolePatterns = ['you are', 'act as', 'as a', 'expert', 'specialist', 'persona', 'professional', 'consultant'];
    if (rolePatterns.some(pattern => p.includes(pattern))) {
        scores.role = 15;
    } else {
        issues.push("Missing a clear role definition (e.g., 'You are an expert...')");
    }

    // 2. Output Format (15 pts)
    const formatPatterns = ['format', 'json', 'table', 'list', 'markdown', 'return', 'output as', 'bullet point', 'structured', 'csv', 'html', 'xml'];
    if (formatPatterns.some(pattern => p.includes(pattern))) {
        scores.outputFormat = 15;
    } else {
        issues.push("No specific output format requested (e.g., 'Return as a JSON')");
    }

    // 3. Constraints (15 pts)
    const constraintPatterns = ['must', 'do not', 'only', 'avoid', 'limit', 'never', 'strictly', 'without', 'requirements', 'negative prompt'];
    if (constraintPatterns.some(pattern => p.includes(pattern))) {
        scores.constraints = 15;
    } else {
        issues.push("No constraints defined (e.g., 'Do not use technical jargon')");
    }

    // 4. Context Presence (15 pts)
    const contextPatterns = ['context', 'background', 'given', 'scenario', 'situation', 'example', 'here is', 'audience', 'purpose'];
    if (contextPatterns.some(pattern => p.includes(pattern))) {
        scores.context = 15;
    } else {
        issues.push("Lack of background context for the AI");
    }

    // 5. Specificity (10 pts)
    const hasNumbers = /\d+/.test(prompt);
    const hasQuotes = /["']/.test(prompt);
    const specificKeywords = ['specifically', 'exactly', 'detailed', 'precise', 'minute', 'particular', 'instance'];
    if (hasNumbers || hasQuotes || specificKeywords.some(k => p.includes(k))) {
        scores.specificity = 10;
    } else {
        issues.push("Prompt seems vague; add more specific details, numbers, or data");
    }

    // 6. Clarity (10 pts)
    const avgWordLen = words.reduce((acc, w) => acc + w.length, 0) / (wordCount || 1);
    if (avgWordLen > 4 && avgWordLen < 8 && wordCount > 10) {
        scores.clarity = 10;
    } else if (wordCount <= 10) {
        scores.clarity = 5;
        issues.push("Prompt is too short to be clear");
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
        issues.push("Improve structure using line breaks, bullet points, or headers");
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
