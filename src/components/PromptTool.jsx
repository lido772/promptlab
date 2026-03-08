import { useState, useEffect } from 'react';
import { modelsDatabase } from '../data/models';
import ResultCard from './ResultCard';
import { useToast } from '../hooks/useToast';
import { useDailyLimit } from '../hooks/useDailyLimit';
import { analyzePrompt } from '../lib/promptAnalyzer';

const WORKER_URL = import.meta.env.VITE_WORKER_URL || 'https://promptlab.lido772.workers.dev';

export default function PromptTool() {
  const [modality, setModality] = useState('text');
  const [provider, setProvider] = useState('');
  const [model, setModel] = useState('');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [improvedPrompt, setImprovedPrompt] = useState(null);

  const { toast } = useToast();
  const { remaining, total, checkLimit, updateRemaining } = useDailyLimit();

  useEffect(() => {
    checkLimit();
    setProvider('');
    setModel('');
  }, [modality]);

  const providers = Object.keys(modelsDatabase[modality] || {});
  const availableModels = provider ? (modelsDatabase[modality]?.[provider] || []) : [];

  const handleTest = () => {
    if (!prompt.trim()) {
      toast.warning('Please enter a prompt to analyze');
      return;
    }
    if (!model) {
      toast.warning('Please select a model');
      return;
    }

    setLoading(true);
    setImprovedPrompt(null);

    setTimeout(() => {
      const analysisResult = analyzePrompt(prompt, model, modality);
      setResult(analysisResult);
      setLoading(false);
    }, 800);
  };

  const handleImproveFree = async () => {
    if (!prompt.trim()) {
      toast.warning('Please enter a prompt first');
      return;
    }

    if (remaining <= 0) {
      toast.warning('Daily limit reached. Use ad-supported option to continue!');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const headers = { 'Content-Type': 'application/json' };

      const response = await fetch(WORKER_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      setImprovedPrompt(data.result);
      updateRemaining(data.remainingFree ?? remaining - 1, data.dailyLimit ?? total);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      toast.error(err.message || 'Failed to improve prompt');
    }
  };

  const handleApplyImproved = () => {
    if (improvedPrompt) {
      setPrompt(improvedPrompt);
      setImprovedPrompt(null);
    }
  };

  const handleCopyImproved = () => {
    if (improvedPrompt) {
      navigator.clipboard.writeText(improvedPrompt);
      toast.success('Copied to clipboard!');
    }
  };

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
      {/* Input Panel */}
      <div className="card p-8">
        <h2 className="text-xl font-semibold mb-5 text-foreground">Your Prompt</h2>

        {/* Content Type Select */}
        <label className="block mb-2.5 text-sm text-foreground-muted font-medium">
          Content Type
        </label>
        <select
          value={modality}
          onChange={(e) => setModality(e.target.value)}
          className="input-field mb-4"
        >
          <option value="text">📝 Text Generation</option>
          <option value="image">🖼️ Image Generation</option>
          <option value="video">🎬 Video Generation</option>
          <option value="audio">🎵 Audio/Speech</option>
          <option value="code">💻 Code Generation</option>
        </select>

        {/* Provider Select */}
        <label className="block mb-2.5 text-sm text-foreground-muted font-medium">
          Provider
        </label>
        <select
          value={provider}
          onChange={(e) => {
            setProvider(e.target.value);
            setModel('');
          }}
          className="input-field mb-4"
          disabled={!modality}
        >
          <option value="">Select Provider...</option>
          {providers.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        {/* Model Select */}
        <label className="block mb-2.5 text-sm text-foreground-muted font-medium">
          Model
        </label>
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="input-field mb-4"
          disabled={!provider}
        >
          <option value="">Select Model...</option>
          {availableModels.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>

        {/* Prompt Input */}
        <label className="block mb-2.5 text-sm text-foreground-muted font-medium">
          Paste your prompt below
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Example: You are an expert copywriter. Write a compelling product description for a fitness tracker..."
          className="w-full h-52 p-4 bg-background-elevated border border-border rounded-lg text-foreground font-mono text-sm resize-y mb-4 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent-glow"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Test Button */}
          <button onClick={handleTest} className="btn-secondary w-full">
            Test & Analyze
          </button>

          {/* Improve Button */}
          <button onClick={handleImproveFree} className="btn-primary w-full">
            Improve Prompt (Free)
          </button>
        </div>
      </div>

      {/* Results Panel */}
      <div className="flex flex-col gap-5">
        {loading ? (
          <div className="text-center py-16 text-accent">
            <div className="spinner" />
            <p>{improvedPrompt === null ? 'Analyzing your prompt...' : 'Improving prompt...'}</p>
          </div>
        ) : result ? (
          <ResultCard result={result} model={model} modality={modality} />
        ) : improvedPrompt ? (
          <div className="card p-5">
            <h3 className="text-foreground font-semibold mb-3">🔧 Improved Prompt</h3>
            <textarea
              value={improvedPrompt}
              readOnly
              className="w-full h-40 p-3 bg-background-elevated border border-border rounded-lg text-foreground font-mono text-sm resize-none mb-3"
            />
            <div className="flex gap-2.5">
              <button onClick={handleApplyImproved} className="btn-primary flex-1">
                Use This Prompt
              </button>
              <button onClick={handleCopyImproved} className="btn-secondary flex-1">
                Copy
              </button>
            </div>
            <div className="mt-4 p-2.5 bg-emerald-500/10 rounded-lg text-center">
              <span className="text-emerald-400 text-sm">
                🎉 Free improvements remaining today: {remaining}/{total}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 text-foreground-muted">
            <p className="text-lg">👆 Enter a prompt and click &quot;Test & Analyze&quot;</p>
            <p className="text-sm mt-5 text-foreground-subtle">
              Your prompts are analyzed locally — nothing is saved or shared.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
