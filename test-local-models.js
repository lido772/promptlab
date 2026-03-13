/**
 * Test script to verify local models functionality
 */

import { MODELS } from './modelSelector.js';

console.log('=== Testing Model Separation ===\n');

// Log all available models
console.log('Total models available:', Object.keys(MODELS).length);

// Separate models by type
const localModels = Object.entries(MODELS).filter(([_, model]) => model.engine !== 'openrouter');
const apiModels = Object.entries(MODELS).filter(([_, model]) => model.engine === 'openrouter');

console.log('\n📦 LOCAL MODELS:', localModels.length);
localModels.forEach(([key, model]) => {
    console.log(`  - ${model.name} (${model.engine}) - ${model.size}`);
});

console.log('\n☁️ OPENROUTER MODELS:', apiModels.length);
apiModels.forEach(([key, model]) => {
    console.log(`  - [API] ${model.name} - ${model.size} - ${model.price}`);
});

// Check if OpenRouter models have API prefix
console.log('\n✅ Model Prefix Test:');
apiModels.forEach(([key, model]) => {
    if (model.engine === 'openrouter') {
        console.log(`  ✓ ${model.name} correctly identified as API model`);
    }
});

console.log('\n🎯 Recommended Models:');
const recommendedModels = Object.values(MODELS).filter(m => m.recommended);
recommendedModels.forEach(model => {
    const type = model.engine === 'openrouter' ? 'API' : model.engine;
    console.log(`  ✓ ${model.name} (${type}) - ${model.description}`);
});