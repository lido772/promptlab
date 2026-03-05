// AI Prompt Analyzer - Client-side analysis

export function calculateClarity(prompt) {
  const words = prompt.split(/\s+/).length;
  const clarity = Math.min(100, (words / 50) * 100);
  return Math.round(clarity);
}

export function calculateSpecificity(prompt, modality) {
  let score = 50;
  if (prompt.match(/\d+/)) score += 15;
  if (prompt.includes('specific') || prompt.includes('exactly') || prompt.includes('detailed'))
    score += 10;

  const modalityChecks = {
    image: ['style', 'color', 'size'],
    video: ['duration', 'speed', 'scene'],
    audio: ['voice', 'tone', 'accent'],
    code: ['language', 'function', 'format'],
  };

  const checks = modalityChecks[modality] || [];
  if (checks.some((keyword) => prompt.includes(keyword))) score += 10;

  return Math.min(100, score);
}

export function calculateStructure(prompt, modality) {
  let score = 50;
  const hasContext =
    prompt.match(/[A-Z]{2,}/) || prompt.includes('You are') || prompt.includes('As a');
  const hasTask =
    prompt.includes('create') ||
    prompt.includes('write') ||
    prompt.includes('generate') ||
    prompt.includes('show') ||
    prompt.includes('make');
  const hasConstraints =
    prompt.includes("don't") || prompt.includes('avoid') || prompt.includes('must') || prompt.includes('should');

  if (hasContext) score += 20;
  if (hasTask) score += 20;
  if (hasConstraints) score += 10;
  return Math.min(100, score);
}

export function calculateActionability(prompt, modality) {
  let score = 50;
  const actionVerbs = {
    text: ['write', 'create', 'generate', 'analyze', 'explain', 'summarize', 'list', 'compare', 'design', 'build'],
    image: ['create', 'generate', 'design', 'draw', 'paint', 'render', 'illustrate', 'visualize'],
    video: ['create', 'generate', 'produce', 'show', 'make', 'film', 'animate'],
    audio: ['create', 'generate', 'speak', 'voice', 'narrate', 'produce', 'synthesize'],
    code: ['write', 'create', 'generate', 'build', 'develop', 'implement', 'code'],
  };

  const verbs = actionVerbs[modality] || actionVerbs.text;
  const hasActionVerb = verbs.some((verb) => prompt.toLowerCase().includes(verb));

  if (hasActionVerb) score += 25;
  if (prompt.split('.').length > 2) score += 15;
  return Math.min(100, score);
}

export function generateFeedback(prompt, metrics, modality) {
  const lowest = Math.min(...Object.values(metrics));

  if (lowest >= 80)
    return `Excellent ${modality} prompt! You've included clear context, specific requirements, and actionable instructions.`;
  if (lowest >= 60)
    return `Good work. Your ${modality} prompt is clear but could benefit from more specific details.`;
  return `Your ${modality} prompt has potential. Add more specific details about what you want.`;
}

export function generateSuggestions(prompt, metrics, modality) {
  const suggestions = [];

  if (metrics.clarity < 70) suggestions.push('Add more context at the beginning');
  if (metrics.specificity < 70) {
    if (modality === 'image') suggestions.push('Describe style, colors, and composition details');
    else if (modality === 'video') suggestions.push('Specify duration, scene details, and transitions');
    else if (modality === 'audio') suggestions.push('Describe voice type, tone, and accent preferences');
    else if (modality === 'code') suggestions.push('Specify programming language, output format, and requirements');
    else suggestions.push('Include specific numbers, formats, or example outputs');
  }
  if (metrics.structure < 70) suggestions.push('Organize: Context → Task → Constraints → Details');
  if (metrics.actionability < 70)
    suggestions.push('Start with a clear action verb (Create, Generate, Build, etc.)');

  if (suggestions.length === 0)
    suggestions.push('This is a solid prompt! Consider adding more edge cases or specific examples.');

  return suggestions;
}

export function analyzePrompt(prompt, model, modality) {
  const metrics = {
    clarity: calculateClarity(prompt),
    specificity: calculateSpecificity(prompt, modality),
    structure: calculateStructure(prompt, modality),
    actionability: calculateActionability(prompt, modality),
  };

  const overallScore = Math.round(
    (metrics.clarity + metrics.specificity + metrics.structure + metrics.actionability) / 4
  );

  return {
    score: overallScore,
    metrics,
    feedback: generateFeedback(prompt, metrics, modality),
    suggestions: generateSuggestions(prompt, metrics, modality),
  };
}
