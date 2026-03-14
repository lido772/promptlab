/**
 * Cloudflare Worker for Pages
 * Handles OpenRouter API proxy
 * Deployed with: https://promptup.cloud/*
 */

export default {
  async fetch(request, env, ctx) {
    // Only handle API requests
    const url = new URL(request.url);
    const isApiRoute = url.pathname === '/api' || url.pathname.startsWith('/api/');

    // Serve static files for non-API requests
    if (!isApiRoute) {
      // Let Cloudflare Pages handle static assets
      return env.ASSETS.fetch(request);
    }

    // Handle API requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }

    // Lightweight health endpoint for deployment diagnostics.
    if (request.method === 'GET' && (url.pathname === '/api/health' || url.pathname === '/api/health/')) {
      return new Response(
        JSON.stringify({
          ok: true,
          service: 'openrouter-proxy',
          apiKeyConfigured: !!env.OPENROUTER_API_KEY,
          timestamp: new Date().toISOString()
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', {
        status: 405,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    // Check API key
    if (!env.OPENROUTER_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'OpenRouter API key not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    try {
      const body = await request.json();

      const hasSingleModel = typeof body.model === 'string' && body.model.length > 0;
      const hasFallbackModels = Array.isArray(body.models) && body.models.length > 0;

      if ((!hasSingleModel && !hasFallbackModels) || !body.messages) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields: model or models, messages' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Call OpenRouter
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://promptup.cloud',
          'X-Title': 'Prompt Analyzer'
        },
        body: JSON.stringify({
          ...(hasFallbackModels ? { models: body.models } : { model: body.model }),
          messages: body.messages,
          temperature: body.temperature || 0.7,
          max_tokens: body.max_tokens || 1000,
          stream: body.stream || false
        })
      });

      if (!response.ok) {
        const error = await response.text();
        return new Response(
          JSON.stringify({ error: `OpenRouter API error: ${error}` }),
          { status: response.status, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Handle streaming
      if (body.stream) {
        return new Response(response.body, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }

      // Non-streaming
      const data = await response.json();
      return new Response(JSON.stringify(data), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });

    } catch (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }
};
