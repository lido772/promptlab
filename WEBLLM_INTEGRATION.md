# WebLLM Integration Guide

This guide explains how to use the WebLLM integration in your Prompt Analyzer application.

## Overview

The integration provides **two LLM engines**:

1. **WebLLM** (WebGPU-accelerated) - Faster, requires WebGPU support
2. **Transformers.js** (CPU-based) - Slower but more compatible

## Available Models

### WebLLM Models (WebGPU)
- **Qwen 2.5 1.5B** (~1.1GB) - Fastest, good for quick responses
- **Qwen 2.5 3B** (~2.1GB) - Balanced speed and quality ⭐ Recommended
- **Phi 3.5 Mini** (~2.6GB) - Best reasoning and structure

### Transformers.js Models (CPU)
- **SmolLM2 360M** (~360MB) - Fastest, basic quality
- **TinyLlama 1.1B** (~650MB) - Balanced ⭐ Recommended
- **Qwen2 0.5B** (~900MB) - Good multilingual support
- **Phi-3 Mini** (~2.2GB) - Best reasoning

## Quick Start

### 1. Simple Usage (Global API)

The easiest way to use LLM functions from anywhere in your page:

```javascript
// Auto-initialize and run
const response = await runLLM(
    "You are a helpful assistant.",
    "Write a short poem about AI."
);
console.log(response);
```

### 2. Advanced Usage

```javascript
// Initialize with specific engine
const { engine, model } = await initializeLLM('webllm'); // or 'transformers' or 'auto'

// Run with options
const response = await runLLM(
    "You are a prompt engineering expert.",
    "Improve this prompt: 'Write code'",
    {
        temperature: 0.7,
        maxTokens: 512
    }
);
```

### 3. Check Status

```javascript
const status = getLLMStatus();
console.log(status);
// { engine: 'webllm', model: 'Qwen2.5-3B...', initialized: true, webgpu: 'supported' }
```

## Integration in Your App

### Model Selection UI

The model selector automatically:
- Detects WebGPU support
- Shows appropriate models
- Displays loading progress
- Handles errors gracefully

### Prompt Improvement Flow

```javascript
// In your app.js or main script
async function improvePrompt() {
    const prompt = document.getElementById('prompt-input').value;

    // Get heuristic analysis
    const { analyzePromptHeuristics } = await import('./promptAnalyzer.js');
    const heuristics = analyzePromptHeuristics(prompt, 'en');

    // Improve with LLM
    const { improvePromptWebLLM } = await import('./webLLMEngine.js');
    const improved = await improvePromptWebLLM(prompt, 'en', heuristics);

    // Display result
    document.getElementById('output').textContent = improved;
}
```

## Browser Compatibility

### WebGPU Support
- ✅ Chrome 113+
- ✅ Edge 113+
- ⚠️ Firefox Nightly (with flags)
- ❌ Safari (not yet supported)

### Fallback
If WebGPU is not available, the system automatically falls back to Transformers.js (CPU-based).

## Performance Notes

### WebGPU Models
- **Speed**: 5-10x faster than CPU
- **Memory**: Requires GPU with 2-4GB VRAM
- **Quality**: Better for complex reasoning

### CPU Models
- **Speed**: Slower, but functional
- **Memory**: Uses system RAM (4-8GB recommended)
- **Quality**: Good for simple tasks

## Troubleshooting

### Model Loading Fails
1. Check browser console for errors
2. Verify WebGPU support: Check the status indicator
3. Try a different model (smaller size)
4. Clear browser cache and reload

### Slow Generation
1. Check if WebGPU is being used (look for "🚀 WebGPU Accelerated")
2. Try a smaller model
3. Close other browser tabs
4. Check system resources

### Out of Memory
1. Clear model cache (click trash icon)
2. Use a smaller model
3. Close other applications
4. Restart browser

## API Reference

### `runLLM(systemPrompt, userPrompt, options)`
Main function to generate text.

**Parameters:**
- `systemPrompt` (string): System instructions
- `userPrompt` (string): User input
- `options` (object, optional):
  - `temperature` (number): 0.0-1.0, default 0.7
  - `maxTokens` (number): Maximum response length
  - `topP` (number): Nucleus sampling, default 0.9

**Returns:** Promise<string> - Generated text

### `initializeLLM(engine)`
Initialize LLM with specific engine.

**Parameters:**
- `engine` (string): 'webllm', 'transformers', or 'auto'

**Returns:** Promise<{engine, model}>

### `getLLMStatus()`
Get current engine status.

**Returns:** {engine, model, initialized, webgpu}

### `resetLLM()`
Unload the model and free memory.

**Returns:** Promise<void>

## Demo

Try the interactive demo: [public/weblm-demo.html](public/weblm-demo.html)

## Example: Prompt Improvement

```javascript
// Complete example of prompt improvement
async function improveUserPrompt() {
    const originalPrompt = "write code";

    // 1. Analyze with heuristics
    const { analyzePromptHeuristics } = await import('./promptAnalyzer.js');
    const analysis = analyzePromptHeuristics(originalPrompt);

    console.log('Score:', analysis.totalScore);
    console.log('Issues:', analysis.issues);

    // 2. Improve with LLM
    const improvedPrompt = await runLLM(
        "You are a prompt engineering expert. Improve the user's prompt.",
        `Original: "${originalPrompt}". Issues: ${analysis.issues.join(', ')}`
    );

    console.log('Improved:', improvedPrompt);

    // 3. Verify improvement
    const newAnalysis = analyzePromptHeuristics(improvedPrompt);
    console.log('New Score:', newAnalysis.totalScore);
}
```

## Files Structure

```
├── webLLMEngine.js       # WebLLM implementation
├── llmEngine.js          # Transformers.js implementation
├── llmAPI.js             # Simple wrapper API
├── modelSelector.js      # Model definitions and detection
├── modelUI.js            # UI handling for model selection
├── promptAnalyzer.js     # Heuristic analysis
├── app.js                # Main application logic
└── index.html            # Main HTML (with integration)
```

## Security & Privacy

- ✅ **100% Client-Side**: No data leaves the browser
- ✅ **No API Keys**: Completely free to use
- ✅ **Offline Capable**: Models cached in browser
- ✅ **Privacy First**: No tracking or telemetry

## Contributing

To add new models:

1. Add to `modelSelector.js`:
```javascript
'new-model-key': {
    name: 'Model Name',
    id: 'Model-ID-MLC', // for WebLLM
    path: 'Org/Model',  // for Transformers.js
    size: '~1GB',
    performance: 'Fast',
    description: 'Description',
    engine: 'webllm', // or 'transformers'
    recommended: false
}
```

2. Update `webLLMEngine.js` if needed

## License

This integration uses:
- @mlc-ai/web-llm: Apache 2.0
- @xenova/transformers: MIT

## Support

For issues:
1. Check browser console for errors
2. Verify WebGPU support
3. Try the demo page first
4. Check system requirements

---

**Built with ❤️ for private, local AI inference**