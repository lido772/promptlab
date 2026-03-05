import { useMemo } from 'react';

export default function ResultCard({ result, model, modality }) {
  const scoreClass = useMemo(() => {
    if (result.score >= 80) return 'excellent';
    if (result.score >= 60) return 'good';
    return 'fair';
  }, [result.score]);

  const scoreGradient = useMemo(() => {
    if (result.score >= 80) return 'from-emerald-500 to-emerald-400';
    if (result.score >= 60) return 'from-yellow-500 to-yellow-400';
    return 'from-red-500 to-red-400';
  }, [result.score]);

  // Find model label from the model value
  const getLabel = () => {
    const { modelsDatabase } = require('../data/models');
    for (const key in modelsDatabase) {
      for (const provider in modelsDatabase[key]) {
        const found = modelsDatabase[key][provider].find((m) => m.value === model);
        if (found) return found.label;
      }
    }
    return 'Unknown Model';
  };

  return (
    <div className="card p-5 animate-slide-in">
      <div className="flex justify-between items-center mb-4">
        <div className="font-semibold text-base text-foreground">{getLabel()} Analysis</div>
        <div className={`px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r ${scoreGradient}`}>
          {result.score}/100
        </div>
      </div>

      <div className="text-sm text-foreground-muted mb-3 p-2.5 bg-background-elevated border-l-2 border-accent rounded">
        {result.feedback}
      </div>

      <div className="grid grid-cols-2 gap-2.5 text-xs">
        <MetricItem label="Clarity" value={result.metrics.clarity} />
        <MetricItem label="Specificity" value={result.metrics.specificity} />
        <MetricItem label="Structure" value={result.metrics.structure} />
        <MetricItem label="Actionability" value={result.metrics.actionability} />
      </div>

      {result.suggestions && result.suggestions.length > 0 && (
        <div className="mt-4 card p-4">
          <h3 className="text-foreground font-semibold mb-3">💡 Optimization Tips</h3>
          {result.suggestions.map((suggestion, i) => (
            <div
              key={i}
              className="mb-3 p-3 bg-accent/10 border-l-2 border-accent rounded text-foreground-muted text-sm"
            >
              {i + 1}. {suggestion}
            </div>
          ))}
        </div>
      )}

      {/* Ad Placeholder */}
      <div className="mt-5 ad-banner">
        <div className="text-foreground-muted text-sm">Advertisement</div>
      </div>
    </div>
  );
}

function MetricItem({ label, value }) {
  return (
    <div className="p-2 bg-background-elevated rounded text-foreground-muted">
      <div className="text-xs text-foreground-subtle">{label}</div>
      <div className="text-accent font-semibold">{value}%</div>
    </div>
  );
}
