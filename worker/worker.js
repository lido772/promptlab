export default {
  async fetch(request, env, ctx) {

    // Security headers
    const securityHeaders = {
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "geolocation=(), microphone=(), camera=()"
    };

    // Rate limiting configuration
    const RATE_LIMIT = 60; // requests per hour
    const RATE_LIMIT_WINDOW = 3600; // seconds (1 hour)
    const MAX_PROMPT_LENGTH = 10000; // characters
    const MIN_PROMPT_LENGTH = 10; // characters

    // Get client IP for rate limiting
    const clientIP = request.headers.get("CF-Connecting-IP") || "unknown";

    // CORS configuration - Restrict to specific origins
    const allowedOrigins = env.ALLOWED_ORIGINS?.split(",") || [
      "http://localhost:*",
      "https://promptlab.lido772.workers.dev",
      "https://broad-snow-9b87.lido772.workers.dev",
      "https://promptailab.netlify.app/"
    ];

    const origin = request.headers.get("Origin");
    let allowedOrigin = null;

    // Check if origin is allowed (supports wildcard subdomains)
    for (const allowed of allowedOrigins) {
      if (allowed === "*" || (origin && (
        allowed === origin ||
        (allowed.includes("*") && origin.match(new RegExp("^" + allowed.replace("*", ".*") + "$")))
      ))) {
        allowedOrigin = origin || allowed;
        break;
      }
    }

    // If no origin match and no Origin header (like direct API calls), use first allowed origin
    if (!allowedOrigin && allowedOrigins.length > 0) {
      allowedOrigin = allowedOrigins[0].replace("*", "localhost");
    }

    const corsHeaders = {
      "Access-Control-Allow-Origin": allowedOrigin || "null",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
      ...securityHeaders
    };

    // Handle preflight CORS
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    // Only allow POST requests
    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      });
    }

    try {
      // Rate limiting check
      if (env.RATE_LIMIT_KV) {
        const rateLimitKey = `ratelimit:${clientIP}`;
        const now = Math.floor(Date.now() / 1000);

        const rateLimitData = await env.RATE_LIMIT_KV.get(rateLimitKey, { type: "json" });

        if (rateLimitData) {
          const { count, windowStart } = rateLimitData;

          // Reset if window expired
          if (now - windowStart >= RATE_LIMIT_WINDOW) {
            await env.RATE_LIMIT_KV.put(rateLimitKey, JSON.stringify({
              count: 1,
              windowStart: now
            }), { expirationTtl: RATE_LIMIT_WINDOW });
          } else if (count >= RATE_LIMIT) {
            return new Response(JSON.stringify({
              error: "Too many requests. Please try again later."
            }), {
              status: 429,
              headers: {
                "Content-Type": "application/json",
                "Retry-After": String(RATE_LIMIT_WINDOW - (now - windowStart)),
                ...corsHeaders
              }
            });
          } else {
            // Increment counter
            await env.RATE_LIMIT_KV.put(rateLimitKey, JSON.stringify({
              count: count + 1,
              windowStart: windowStart
            }), { expirationTtl: RATE_LIMIT_WINDOW });
          }
        } else {
          // First request
          await env.RATE_LIMIT_KV.put(rateLimitKey, JSON.stringify({
            count: 1,
            windowStart: now
          }), { expirationTtl: RATE_LIMIT_WINDOW });
        }
      }

      // Parse and validate request body
      let body;
      try {
        body = await request.json();
      } catch (parseError) {
        return new Response(JSON.stringify({
          error: "Invalid request body"
        }), {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        });
      }

      const { prompt } = body;

      // Validate prompt
      if (!prompt) {
        return new Response(JSON.stringify({
          error: "Prompt is required"
        }), {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        });
      }

      // Validate prompt length
      if (typeof prompt !== "string" || prompt.length < MIN_PROMPT_LENGTH) {
        return new Response(JSON.stringify({
          error: `Prompt must be at least ${MIN_PROMPT_LENGTH} characters`
        }), {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        });
      }

      if (prompt.length > MAX_PROMPT_LENGTH) {
        return new Response(JSON.stringify({
          error: `Prompt must not exceed ${MAX_PROMPT_LENGTH} characters`
        }), {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        });
      }

      // Sanitize prompt (basic XSS prevention)
      const sanitizedPrompt = prompt
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        .trim();

      if (!sanitizedPrompt) {
        return new Response(JSON.stringify({
          error: "Invalid prompt content"
        }), {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        });
      }

      // Call Gemini API
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Improve this prompt:\n\n${sanitizedPrompt}`
                  }
                ]
              }
            ]
          })
        }
      );

      // Handle API errors
      if (!response.ok) {
        if (response.status === 429) {
          return new Response(JSON.stringify({
            error: "Service temporarily unavailable. Please try again later."
          }), {
            status: 503,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders
            }
          });
        }

        return new Response(JSON.stringify({
          error: "Failed to process request. Please try again."
        }), {
          status: 502,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        });
      }

      const data = await response.json();

      const result =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Optimization failed";

      return new Response(JSON.stringify({ result }), {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      });

    } catch (err) {
      // Generic error message - don't leak implementation details
      return new Response(JSON.stringify({
        error: "An unexpected error occurred. Please try again later."
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      });
    }
  }
};
