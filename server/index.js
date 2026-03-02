const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Simple local improver fallback (used when no Gemini key/URL configured)
function localImprove(prompt, modality) {
  // Lightweight heuristics: add structure and action verb suggestions
  const prefix = `Context: Be concise and explicit.\nTask: Improve the user's prompt for ${modality} output.\nInstructions: Keep examples and constraints.\n\nOriginal Prompt:\n`;
  const improved = `${prefix}${prompt}\n\nImproved Prompt:\n${prompt.trim()}\n
 - Add explicit output format and constraints.
 - Add example outputs or numerical constraints where relevant.`;
  return improved;
}

app.post('/api/improve', async (req, res) => {
  const { prompt, model, modality } = req.body || {};
  if (!prompt) return res.status(400).json({ error: 'prompt is required' });

  const GEMINI_KEY = process.env.GEMINI_API_KEY;
  const GEMINI_URL = process.env.GEMINI_API_URL; // optional, set to your preferred endpoint

  if (!GEMINI_KEY || !GEMINI_URL) {
    // Return a locally improved prompt (free, deterministic)
    const improved = localImprove(prompt, modality || 'text');
    return res.json({ improvedPrompt: improved, source: 'local' });
  }

  try {
    // NOTE: Set GEMINI_API_URL to the exact endpoint your account requires.
    // This server forwards the improvement request to the configured Gemini endpoint.
    const instruction = `Improve the following prompt for ${modality || 'text'} output. Return only the improved prompt.`;
    const body = JSON.stringify({
      instruction,
      prompt
    });

    const fetchRes = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GEMINI_KEY}`
      },
      body
    });

    if (!fetchRes.ok) {
      const text = await fetchRes.text();
      return res.status(502).json({ error: 'Gemini API error', detail: text });
    }

    const json = await fetchRes.json();
    // Attempt to pull the improved text from the provider response;
    // shape will vary by provider, so we try fallbacks.
    const improvedPrompt = json.output || json.candidates?.[0]?.content || JSON.stringify(json);
    return res.json({ improvedPrompt, source: 'gemini', raw: json });
  } catch (err) {
    return res.status(500).json({ error: 'server error', detail: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`PromptLab server running on http://localhost:${PORT}`);
  console.log('Configure GEMINI_API_KEY and GEMINI_API_URL in your environment to enable real Gemini calls.');
});
