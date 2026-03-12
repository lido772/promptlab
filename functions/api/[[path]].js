/**
 * Cloudflare Pages Function for OpenRouter API
 * Securely handles API calls without exposing API key to client
 * Deployed at: https://promptup.cloud/api
 */

export default async function onRequest(context) {
  const { request, env } = context;

  // Check if API key is configured
  if (!env.OPENROUTER_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'OpenRouter API key not configured' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }

    // Only allow POST requests
    if (request.method !== 'POST') {
      return new Response('Method not allowed', {
        status: 405,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    try {
      // Parse request body
      const body = await request.json();

      // Validate required fields
      if (!body.model || !body.messages) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields: model, messages' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      // Prepare OpenRouter request
      const openRouterUrl = 'https://openrouter.ai/api/v1/chat/completions';

      const openRouterRequest = {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://promptup.cloud',
          'X-Title': 'Prompt Analyzer'
        },
        body: JSON.stringify({
          model: body.model,
          messages: body.messages,
          temperature: body.temperature || 0.7,
          max_tokens: body.max_tokens || 1000,
          stream: body.stream || false
        })
      };

      // Call OpenRouter API
      const response = await fetch(openRouterUrl, openRouterRequest);

      if (!response.ok) {
        const error = await response.text();
        return new Response(
          JSON.stringify({ error: `OpenRouter API error: ${error}` }),
          {
            status: response.status,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          }
        );
      }

      // Handle streaming response
      if (body.stream) {
        const readableStream = new ReadableStream({
          async start(controller) {
            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                controller.enqueue(new TextEncoder().encode(chunk));
              }
              controller.close();
            } catch (error) {
              controller.error(error);
            }
          }
        });

        return new Response(readableStream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }

      // Non-streaming response
      const data = await response.json();

      return new Response(JSON.stringify(data), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }
}
