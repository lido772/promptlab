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


// =============================================================================
// APP AUDITOR — Objective quality & model comparison framework
// =============================================================================
//
// HOW TO USE:
//   1. Implement `callApp(prompt, modelId)` below to connect your application.
//   2. List the model IDs you want to compare in `MODELS_TO_TEST`.
//   3. Run: node test-prompts.js --audit
//
// =============================================================================

// ── 1. Connection to your app ─────────────────────────────────────────────────
/**
 * Sends a prompt to the application and returns the raw response string.
 * ADAPT THIS FUNCTION to match your actual API / function call.
 *
 * @param {string} prompt   - The prompt text to send.
 * @param {string} modelId  - The model identifier (e.g. "gpt-4o", "claude-3-5-sonnet").
 * @returns {Promise<string>} Raw response text from the application.
 */
async function callApp(prompt, modelId) {
    // ── REPLACE THIS STUB WITH YOUR REAL IMPLEMENTATION ──
    // Example with a local fetch:
    //   const res = await fetch('http://localhost:5173/api/analyze', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ prompt, model: modelId })
    //   });
    //   const data = await res.json();
    //   return data.response;
    throw new Error(
        `callApp() is not implemented. ` +
        `Edit test-prompts.js and connect it to your application. ` +
        `Model requested: ${modelId}`
    );
}

// ── 2. Models to compare ──────────────────────────────────────────────────────
const MODELS_TO_TEST = [
    // Add / remove model IDs that your application supports.
    'gpt-4o',
    'gpt-4o-mini',
    // 'claude-3-5-sonnet',
    // 'gemini-1.5-pro',
];

// ── 3. The 12 audit prompts ───────────────────────────────────────────────────
/**
 * Each entry:
 *  - id        : unique slug
 *  - category  : one of the 12 test domains
 *  - prompt    : the exact text sent to the app
 *  - notes     : what the evaluator should watch for
 */
export const AUDIT_PROMPTS = [
    {
        id: 'creativity-01',
        category: 'Créativité',
        prompt:
            'Write a short poem (8–12 lines) about digital solitude in the style of ' +
            'Edgar Allan Poe. Use dark, atmospheric imagery and include at least one ' +
            'internal rhyme.',
        notes:
            'Evaluate stylistic fidelity to Poe, originality of imagery, and adherence ' +
            'to the structural constraints (length, internal rhyme).',
    },
    {
        id: 'reasoning-01',
        category: 'Logique / Raisonnement',
        prompt:
            'A farmer has 17 sheep. All but 9 die. How many sheep are left? ' +
            'Explain your reasoning step by step before giving the final answer.',
        notes:
            'Classic trick question — correct answer is 9. Watch for hasty arithmetic ' +
            '(17 − 9 = 8) vs. correct linguistic parsing ("all but 9").',
    },
    {
        id: 'text-analysis-01',
        category: 'Analyse de texte',
        prompt:
            'Analyze the rhetorical devices used in the following excerpt and explain ' +
            'the effect of each on the audience:\n\n' +
            '"We shall fight on the beaches, we shall fight on the landing grounds, we ' +
            'shall fight in the fields and in the streets, we shall fight in the hills; ' +
            'we shall never surrender." — Winston Churchill, June 1940',
        notes:
            'Expect identification of anaphora, asyndeton, and climax. Assess depth of ' +
            'analysis and quality of argumentation.',
    },
    {
        id: 'code-01',
        category: 'Code',
        prompt:
            'Write a JavaScript function `deepFlatten(arr)` that flattens a nested ' +
            'array of any depth WITHOUT using Array.prototype.flat() or flatMap(). ' +
            'Include handling for: non-array inputs, empty arrays, and mixed types. ' +
            'Wrap the code in a markdown code block and add inline comments.',
        notes:
            'Verify correctness of the algorithm, edge-case handling, and code clarity. ' +
            'Check that the banned methods are not used.',
    },
    {
        id: 'text-transformation-01',
        category: 'Transformation de texte',
        prompt:
            'Rewrite the following formal email as a casual Slack message (max 3 lines, ' +
            'friendly tone, no bullet points):\n\n' +
            '"Dear Mr. Thompson, I wanted to bring to your attention that the Q3 ' +
            'deliverables have not been submitted as per the agreed timeline. ' +
            'Could you please provide an update at your earliest convenience? ' +
            'Best regards, Sarah."',
        notes:
            'Assess tonal shift accuracy, conciseness, and preservation of the core ' +
            'message (missing Q3 deliverables, need for update).',
    },
    {
        id: 'summarization-01',
        category: 'Résumé',
        prompt:
            'Summarize the following paragraph in EXACTLY one sentence of no more than ' +
            '25 words:\n\n' +
            '"Climate change refers to long-term shifts in global temperatures and ' +
            'weather patterns. While some of these shifts are natural, since the 1800s, ' +
            'human activities have been the main driver of climate change, primarily ' +
            'due to the burning of fossil fuels like coal, oil, and gas, which produces ' +
            'heat-trapping gases."',
        notes:
            'Check strict adherence to the 25-word limit, accuracy of the summary, and ' +
            'that both natural + human causes are reflected.',
    },
    {
        id: 'extraction-01',
        category: 'Extraction d\'informations',
        prompt:
            'Extract all dates, proper names, and monetary amounts from the text below. ' +
            'Return a structured JSON object with three keys: "dates", "names", "amounts".\n\n' +
            '"On January 14, 2024, John Smith signed a contract worth $250,000 with ' +
            'Maria Gonzalez. The second payment of $75,000 is due on March 31, 2024. ' +
            'The project was initially proposed by Dr. Alan Park on November 3, 2023."',
        notes:
            'Verify completeness (3 dates, 3 names, 2 amounts) and valid JSON format. ' +
            'Deduct points for any missed entity or malformed output.',
    },
    {
        id: 'professional-writing-01',
        category: 'Écriture professionnelle',
        prompt:
            'Write a LinkedIn post (150–200 words) announcing the launch of an ' +
            'AI-powered recruitment automation tool called "HireFlow" by a B2B SaaS ' +
            'company. The target audience is HR Directors and Talent Acquisition leads. ' +
            'Include: a compelling hook, one concrete benefit with a metric, a call to ' +
            'action, and 3 relevant hashtags.',
        notes:
            'Assess professional tone, adherence to all structural requirements (hook, ' +
            'metric, CTA, hashtags), and audience appropriateness.',
    },
    {
        id: 'multilingual-01',
        category: 'Génération multilingue',
        prompt:
            'Translate the phrase "Time flies when you\'re having fun" into French, ' +
            'Spanish, German, and Japanese. For each translation, provide: (1) the ' +
            'translation, (2) a literal back-translation, and (3) a note on any ' +
            'cultural or linguistic nuance that differs from the English original.',
        notes:
            'Evaluate translation accuracy, identification of idiomatic vs. literal ' +
            'differences, and cultural insight.',
    },
    {
        id: 'ambiguity-01',
        category: 'Ambiguïtés volontaires',
        prompt: 'Fix it.',
        notes:
            'Intentionally vague. A robust application should ask clarifying questions ' +
            'or list possible interpretations rather than assuming context. Penalize ' +
            'confident responses that invent a context.',
    },
    {
        id: 'factual-correction-01',
        category: 'Erreurs factuelles à corriger',
        prompt:
            'Review the following paragraph and correct ALL factual errors. For each ' +
            'correction, briefly explain why the original statement was wrong.\n\n' +
            '"Albert Einstein won the Nobel Prize in 1905 for his theory of relativity. ' +
            'He was born in France in 1879 and is best known for the equation E = mc³."',
        notes:
            'Three deliberate errors: (1) Nobel year should be 1921, (2) born in Germany ' +
            '(Ulm), (3) equation is E = mc². Deduct points for any uncorrected error.',
    },
    {
        id: 'poorly-worded-01',
        category: 'Prompts mal formulés',
        prompt:
            'make me a code something with database sql and return thing please dont ' +
            'use complex and also make it work good for big data thank',
        notes:
            'The prompt is deliberately vague, grammatically poor, and contradictory ' +
            '("don\'t use complex" vs "big data"). Evaluate whether the app seeks ' +
            'clarification, and if it proceeds, whether the output is reasonable.',
    },
];

// ── 4. Scoring criteria ───────────────────────────────────────────────────────
export const SCORING_CRITERIA = [
    { key: 'relevance',     label: 'Pertinence',                    description: 'Does the response actually address the prompt?' },
    { key: 'coherence',     label: 'Cohérence',                     description: 'Is the response internally consistent and logically structured?' },
    { key: 'detail',        label: 'Niveau de détail',              description: 'Is the depth of information appropriate for the request?' },
    { key: 'language',      label: 'Correction linguistique',       description: 'Is the language grammatically correct and well-written?' },
    { key: 'ambiguity',     label: 'Stabilité face à l\'ambiguïté', description: 'Does the response handle vagueness or ambiguity appropriately?' },
    { key: 'instructions',  label: 'Respect des instructions',      description: 'Are all explicit constraints and format requirements met?' },
];

// ── 5. Scoring helper ─────────────────────────────────────────────────────────
/**
 * Placeholder automatic scorer. Replace or extend with real NLP/LLM-based
 * evaluation logic. Each criterion returns a score 1–10.
 *
 * @param {string} prompt   - The original prompt.
 * @param {string} response - The raw response from the app.
 * @param {object} auditPrompt - The full AUDIT_PROMPTS entry.
 * @returns {{ relevance, coherence, detail, language, ambiguity, instructions, average }}
 */
function scoreResponse(prompt, response, auditPrompt) {
    if (!response || response.trim().length === 0) {
        return { relevance: 1, coherence: 1, detail: 1, language: 1, ambiguity: 1, instructions: 1, average: 1 };
    }

    const scores = {};
    const words = response.trim().split(/\s+/).length;

    // --- Relevance: does the response mention key tokens from the prompt?
    const promptKeywords = prompt.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/).filter(w => w.length > 4);
    const responseLower  = response.toLowerCase();
    const keywordHits    = promptKeywords.filter(kw => responseLower.includes(kw)).length;
    scores.relevance     = Math.min(10, Math.round(2 + (keywordHits / Math.max(promptKeywords.length, 1)) * 8));

    // --- Coherence: punish very short or extremely long unstructured blobs
    scores.coherence = words < 10 ? 2 : words < 30 ? 5 : 8;

    // --- Detail: length-based heuristic (bounded)
    scores.detail = Math.min(10, Math.max(1, Math.round(words / 50)));

    // --- Language: very rough — absence of repeated question marks or obvious gibberish
    const hasGibberish = /(.)\1{6,}/.test(response) || /\?{3,}/.test(response);
    scores.language = hasGibberish ? 3 : 8;

    // --- Ambiguity handling: for the ambiguity prompt, reward clarification questions
    if (auditPrompt.id === 'ambiguity-01') {
        const asksClarification = /clarif|unclear|what do you mean|could you|please specify|more context/i.test(response);
        scores.ambiguity = asksClarification ? 10 : 3;
    } else {
        scores.ambiguity = 8; // not applicable to non-ambiguous prompts
    }

    // --- Instruction following: check for structural markers required by the prompt
    let instructionScore = 7;
    if (prompt.includes('JSON'))            instructionScore += (/{/.test(response) ? 1.5 : -3);
    if (prompt.includes('markdown') || prompt.includes('```')) instructionScore += (/```/.test(response) ? 1.5 : -3);
    if (/EXACTLY one sentence|no more than 25 words/.test(prompt)) {
        const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const singleSentence = sentences.length <= 2;
        const underLimit = words <= 30;
        instructionScore += (singleSentence && underLimit) ? 2 : -3;
    }
    scores.instructions = Math.min(10, Math.max(1, Math.round(instructionScore)));

    scores.average = parseFloat(
        (Object.values(scores).reduce((a, b) => a + b, 0) / SCORING_CRITERIA.length).toFixed(2)
    );
    return scores;
}

// ── 6. Main audit runner ──────────────────────────────────────────────────────
/**
 * Runs all 12 prompts against all configured models, scores the responses,
 * and returns a structured result object.
 *
 * @returns {Promise<object>} Full audit result tree.
 */
export async function runAudit() {
    console.group('\n🔍 Starting PromptLab App Audit...\n');

    const results = {
        timestamp:   new Date().toISOString(),
        models:      MODELS_TO_TEST,
        promptCount: AUDIT_PROMPTS.length,
        byPrompt:    {},
        byModel:     {},
    };

    // Initialise per-model accumulators
    for (const modelId of MODELS_TO_TEST) {
        results.byModel[modelId] = { totalAverage: 0, scores: [] };
    }

    for (const auditPrompt of AUDIT_PROMPTS) {
        console.log(`\n📝 [${auditPrompt.category}] ${auditPrompt.id}`);
        results.byPrompt[auditPrompt.id] = {
            category:     auditPrompt.category,
            prompt:       auditPrompt.prompt,
            notes:        auditPrompt.notes,
            modelResults: {},
        };

        for (const modelId of MODELS_TO_TEST) {
            let rawResponse = '';
            let error       = null;

            try {
                rawResponse = await callApp(auditPrompt.prompt, modelId);
            } catch (err) {
                error       = err.message;
                rawResponse = '';
                console.warn(`  ⚠️  ${modelId}: callApp() error — ${err.message}`);
            }

            const scores = scoreResponse(auditPrompt.prompt, rawResponse, auditPrompt);

            results.byPrompt[auditPrompt.id].modelResults[modelId] = {
                rawResponse,
                error,
                scores,
            };

            results.byModel[modelId].scores.push(scores.average);
            console.log(`  ${error ? '❌' : '✅'} ${modelId}: avg score = ${scores.average}/10`);
        }

        // Determine winner for this prompt
        const modelResults = results.byPrompt[auditPrompt.id].modelResults;
        const winner = MODELS_TO_TEST.reduce((best, m) =>
            modelResults[m].scores.average > (modelResults[best]?.scores.average ?? 0) ? m : best,
            MODELS_TO_TEST[0]
        );
        results.byPrompt[auditPrompt.id].winner = winner;
    }

    // Compute final per-model averages
    for (const modelId of MODELS_TO_TEST) {
        const s = results.byModel[modelId].scores;
        results.byModel[modelId].totalAverage = parseFloat(
            (s.reduce((a, b) => a + b, 0) / Math.max(s.length, 1)).toFixed(2)
        );
    }

    // Global ranking
    results.ranking = [...MODELS_TO_TEST].sort(
        (a, b) => results.byModel[b].totalAverage - results.byModel[a].totalAverage
    );

    console.log('\n🏆 Ranking:', results.ranking.join(' > '));
    console.groupEnd();
    return results;
}

// ── 7. Markdown report generator ──────────────────────────────────────────────
/**
 * Converts the audit result object into a full Markdown report.
 *
 * @param {object} auditResults - Output of runAudit().
 * @returns {string} Markdown document.
 */
export function generateMarkdownReport(auditResults) {
    const { timestamp, models, byPrompt, byModel, ranking } = auditResults;
    const criteria = SCORING_CRITERIA.map(c => c.label);
    const lines    = [];

    lines.push(`# PromptLab App Audit Report`);
    lines.push(`\n> Generated: ${timestamp}  `);
    lines.push(`> Models tested: ${models.join(', ')}  `);
    lines.push(`> Prompts evaluated: ${Object.keys(byPrompt).length}\n`);

    // ── Section 1: Prompts
    lines.push(`## 1. Prompts testés\n`);
    Object.values(byPrompt).forEach((p, i) => {
        lines.push(`### ${i + 1}. [${p.category}]`);
        lines.push(`**Prompt :** \`${p.prompt.replace(/\n/g, ' ').substring(0, 120)}${p.prompt.length > 120 ? '…' : ''}\``);
        lines.push(`**Notes :** ${p.notes}\n`);
    });

    // ── Section 2: Raw scores table
    lines.push(`## 2. Résultats bruts\n`);

    const criteriaKeys = SCORING_CRITERIA.map(c => c.key);

    for (const modelId of models) {
        lines.push(`### Modèle : \`${modelId}\`\n`);
        const header = `| Prompt ID | Catégorie | ${criteria.join(' | ')} | Moyenne |`;
        const sep    = `|-----------|-----------|${criteria.map(() => '------').join('|')}|---------|`;
        lines.push(header);
        lines.push(sep);

        for (const [promptId, promptData] of Object.entries(byPrompt)) {
            const s    = promptData.modelResults[modelId]?.scores ?? {};
            const vals = criteriaKeys.map(k => s[k] ?? '—');
            const avg  = s.average ?? '—';
            lines.push(`| ${promptId} | ${promptData.category} | ${vals.join(' | ')} | **${avg}** |`);
        }
        lines.push('');
    }

    // ── Section 3: Qualitative analysis
    lines.push(`## 3. Analyse qualitative\n`);

    for (const [promptId, promptData] of Object.entries(byPrompt)) {
        lines.push(`### ${promptData.category} — \`${promptId}\``);
        lines.push(`**Winner :** \`${promptData.winner}\`\n`);

        lines.push(`| Modèle | Forces | Faiblesses |`);
        lines.push(`|--------|--------|------------|`);

        for (const modelId of models) {
            const s = promptData.modelResults[modelId]?.scores ?? {};
            const topCriteria   = criteriaKeys.filter(k => (s[k] ?? 0) >= 8).map(k => SCORING_CRITERIA.find(c => c.key === k)?.label ?? k);
            const weakCriteria  = criteriaKeys.filter(k => (s[k] ?? 10) < 5).map(k => SCORING_CRITERIA.find(c => c.key === k)?.label ?? k);
            const forces        = topCriteria.length  ? topCriteria.join(', ')  : 'Aucune notable';
            const faiblesses    = weakCriteria.length ? weakCriteria.join(', ') : 'Aucune notable';
            lines.push(`| \`${modelId}\` | ${forces} | ${faiblesses} |`);
        }
        lines.push('');
    }

    // ── Section 4: Final ranking
    lines.push(`## 4. Classement final des modèles\n`);
    lines.push(`| Rang | Modèle | Score moyen global |`);
    lines.push(`|------|--------|--------------------|`);
    ranking.forEach((modelId, i) => {
        const medal = ['🥇', '🥈', '🥉'][i] ?? `#${i + 1}`;
        lines.push(`| ${medal} | \`${modelId}\` | **${byModel[modelId].totalAverage}/10** |`);
    });
    lines.push('');

    // ── Section 5: Recommendations
    lines.push(`## 5. Recommandations\n`);

    // Per-criterion global weakness detection
    const globalWeakCriteria = criteriaKeys.filter(key => {
        const allScores = models.flatMap(m =>
            Object.values(byPrompt).map(p => p.modelResults[m]?.scores?.[key] ?? 0)
        );
        const avg = allScores.reduce((a, b) => a + b, 0) / Math.max(allScores.length, 1);
        return avg < 6;
    });

    if (globalWeakCriteria.length === 0) {
        lines.push(`- ✅ Aucun critère globalement défaillant détecté. L'application semble performante sur l'ensemble des axes évalués.`);
    } else {
        globalWeakCriteria.forEach(key => {
            const label = SCORING_CRITERIA.find(c => c.key === key)?.label ?? key;
            const recommendation = {
                relevance:    'Améliorer la compréhension sémantique des prompts, notamment pour les requêtes courtes ou ambiguës.',
                coherence:    'Renforcer la cohérence des réponses longues via des contraintes de structure (plan, sections).',
                detail:       'Calibrer le niveau de détail attendu selon le type de tâche (créativité vs. technique).',
                language:     'Intégrer un post-traitement de relecture ou un filtre grammatical.',
                ambiguity:    'Implémenter une étape de clarification automatique quand le prompt est sous un seuil de spécificité.',
                instructions: 'Renforcer le suivi des contraintes de format (JSON, longueur, nombre de mots) via un validateur post-génération.',
            }[key] ?? 'Analyser les cas de défaillance et ajuster le pipeline de génération.';
            lines.push(`- **[${label}]** ${recommendation}`);
        });
    }

    lines.push('');
    lines.push(`---`);
    lines.push(`*Rapport généré automatiquement par \`test-prompts.js\` — PromptLab App Auditor*`);

    return lines.join('\n');
}

// ── 8. CLI entry point ────────────────────────────────────────────────────────
const isAuditMode =
    (typeof process !== 'undefined') &&
    (process.argv.includes('--audit') || process.argv[1]?.endsWith('test-prompts.js'));

if (isAuditMode && !process.argv.includes('--no-audit')) {
    runAudit().then(async results => {
        const report = generateMarkdownReport(results);
        console.log('\n' + report);

        // Optionally save to file (Node.js only)
        try {
            const { writeFileSync } = await import('fs');
            const outPath = './audit-report.md';
            writeFileSync(outPath, report, 'utf8');
            console.log(`\n📄 Report saved to ${outPath}`);
        } catch (_) {
            // Not in a Node environment that supports FS — skip silently
        }
    }).catch(err => {
        console.error('Audit failed:', err.message);
        console.info('ℹ️  Make sure to implement callApp() in test-prompts.js before running the audit.');
    });
}
