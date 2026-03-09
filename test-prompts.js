/**
 * Regression Testing for Heuristic Analysis
 * Ensures that changes to the scoring engine don't break expected results.
 */

import { analyzePromptHeuristics } from './promptAnalyzer.js';

const testCases = [
    {
        name: "Minimal Prompt",
        prompt: "Write a story",
        minScore: 10,
        maxScore: 30,
        expectedIssues: ["role", "format", "context", "constraints"]
    },
    {
        name: "Golden Standard Prompt",
        prompt: "You are an expert marketing consultant. \n\nCreate a 3-month strategy for a new SaaS startup. \n\nFormat the output as a Markdown table with specific milestones. \n\nConstraints: Do not exceed 500 words and focus on organic growth.",
        minScore: 85,
        maxScore: 100,
        expectedIssues: []
    },
    {
        name: "Technical Prompt",
        prompt: "You are a senior developer. \n\nWrite a Python script to scrape news from a website using beautifulsoup. \n\nReturn the code in a markdown block. \n\nConstraints: Use only standard libraries.",
        minScore: 50,
        maxScore: 75,
        expectedIssues: ["context"]
    },
    {
        name: "Vague Business Prompt",
        prompt: "Help me with my startup marketing.",
        minScore: 10,
        maxScore: 35,
        expectedIssues: ["role", "format", "context", "constraints", "specificity"]
    },
    {
        name: "Structured Creative Writing",
        prompt: "Act as a professional novelist. Write the opening scene for a cyberpunk thriller set in Neo-Tokyo 2099. \n\nKey elements to include: holographic rain, a cybernetic geisha, and high-altitude chase. \n\nFormat: Prose with dialogue. \n\nConstraints: Avoid clichés, use atmospheric descriptions, under 300 words.",
        minScore: 90,
        maxScore: 100,
        expectedIssues: []
    },
    {
        name: "Missing Format Prompt",
        prompt: "You are a master chef. Explain how to make a perfect soufflé. Use fresh eggs and high-quality chocolate. Don't let it collapse.",
        minScore: 40,
        maxScore: 65,
        expectedIssues: ["format", "structure"]
    }
];

export const runHeuristicTests = () => {
    console.group("🚀 Running Heuristic Regression Tests...");
    let passed = 0;

    testCases.forEach(test => {
        const result = analyzePromptHeuristics(test.prompt, 'en');
        const scoreMatch = result.totalScore >= test.minScore && result.totalScore <= test.maxScore;
        
        // Detailed log
        if (scoreMatch) {
            console.log(`✅ [PASS] ${test.name}: Score ${result.totalScore}/100`);
            passed++;
        } else {
            console.error(`❌ [FAIL] ${test.name}: Score ${result.totalScore}/100 (Expected ${test.minScore}-${test.maxScore})`);
        }
    });

    console.log(`\nTests Completed: ${passed}/${testCases.length} Passed`);
    console.groupEnd();
    return passed === testCases.length;
};

// Auto-run if executed directly via Node
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith('test-prompts.js')) {
    runHeuristicTests();
}
