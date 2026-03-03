export default {
  async fetch(request, env, ctx) {

    // ========================================
    // BUSINESS MODEL: Ad-Supported Prompt Optimization
    // ========================================
    // Free Tier: 3 daily optimizations (no cost to user)
    // Rewarded Tier: Unlimited optimizations after watching 15s ad
    //
    // Revenue Model:
    // - Free tier uses ~$0.0001 per optimization in Gemini API costs
    // - Rewarded tier supported by ad revenue (~$0.0005-0.001 per ad view)
    // - Typical CPM (cost per 1000 impressions): $1-3, CPC (cost per click): $0.1-0.5
    // - PromptUp shows ads only after optimization request, higher engagement
    //
    // Cost Breakdown per API Call:
    // - Gemini 2.5 Flash: $0.075/M input tokens + $0.30/M output tokens
    // - Average prompt: ~100 input tokens, ~200 output tokens = $0.0001
    // - Ad revenue per optimization: $0.0005-0.001 (after 15s engagement)
    // - Profit margin: ~5-10x the API cost
    // ========================================

    // Security headers
    const securityHeaders = {
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "geolocation=(), microphone=(), camera=()"
    };

    // API Cost Metrics (for monitoring)
    const API_COSTS = {
      gemini_input_token: 0.000000075, // $0.075 per million
      gemini_output_token: 0.00000030,  // $0.30 per million
      avg_input_tokens: 100,            // typical prompt request
      avg_output_tokens: 200            // typical improvement response
    };

    // Estimated Revenue from Ads
    const AD_REVENUE = {
      estimated_cpm: 2.00,     // $2 per 1000 impressions
      estimated_revenue_per_ad: 0.0008 // avg revenue per 15s ad view (CPM/1000 * engagement_bonus)
    };

    // Rate limiting configuration
    const RATE_LIMIT = 60; // requests per hour
    const RATE_LIMIT_WINDOW = 3600; // seconds (1 hour)
    const MAX_PROMPT_LENGTH = 10000; // characters
    const MIN_PROMPT_LENGTH = 10; // characters

    // Daily free limit configuration
    const DAILY_FREE_LIMIT = 3; // free improvements per day
    const DAILY_WINDOW = 86400; // seconds (24 hours)

    // Get client IP for rate limiting
    const clientIP = request.headers.get("CF-Connecting-IP") || "unknown";

    // CORS configuration - Restrict to specific origins
    const allowedOrigins = env.ALLOWED_ORIGINS?.split(",") || [
      "http://localhost:*",
      "https://promptup.cloud",
      "https://www.promptup.cloud",
      "https://promptlab.lido772.workers.dev",
      "https://promptailab.netlify.app"
    ];

    const origin = request.headers.get("Origin");
    let allowedOrigin = null;

    // Normalize origin by removing trailing slash for comparison
    const normalizeOrigin = (url) => url ? url.replace(/\/$/, "") : "";
    const normalizedOrigin = normalizeOrigin(origin);

    // Check if origin is allowed (supports wildcard subdomains)
    for (const allowed of allowedOrigins) {
      const normalizedAllowed = normalizeOrigin(allowed);

      if (allowed === "*") {
        allowedOrigin = origin || "*";
        break;
      }

      if (origin) {
        // Exact match
        if (normalizedAllowed === normalizedOrigin) {
          allowedOrigin = origin;
          break;
        }

        // Wildcard match (e.g., http://localhost:* matches any port)
        if (allowed.includes("*")) {
          const pattern = "^" + allowed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace("*", ".*") + "$";
          if (normalizedOrigin.match(new RegExp(pattern))) {
            allowedOrigin = origin;
            break;
          }
        }
      }
    }

    // If no origin match, reject the request with a clear error
    if (!allowedOrigin && origin) {
      return new Response(JSON.stringify({
        error: "Origin not allowed",
        origin: origin
      }), {
        status: 403,
        headers: {
          "Content-Type": "application/json",
          ...securityHeaders
        }
      });
    }

    // For requests without Origin header (like curl), use first allowed origin
    if (!allowedOrigin && allowedOrigins.length > 0) {
      // Find first non-wildcard origin to use as default
      const defaultOrigin = allowedOrigins.find(o => !o.includes("*")) || allowedOrigins[0];
      allowedOrigin = defaultOrigin.replace(/:\*$/, ":8080"); // Replace wildcard port with default
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

      // Parse and validate request body (must happen before daily limit check to read rewarded flag)
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

      const { prompt, rewarded } = body;

      // Daily free limit check (3 free improvements per day) — skip for rewarded requests
      let remainingFree = 0;
      const isRewarded = rewarded === true;

      if (env.RATE_LIMIT_KV && !isRewarded) {
        // Get current date (UTC midnight)
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
        const dailyKey = `daily:${clientIP}:${todayStr}`;

        const dailyData = await env.RATE_LIMIT_KV.get(dailyKey, { type: "json" });

        if (dailyData) {
          const { count: dailyCount } = dailyData;

          if (dailyCount >= DAILY_FREE_LIMIT) {
            return new Response(JSON.stringify({
              error: "Daily free limit reached. You've used all 3 free improvements for today.",
              limit: DAILY_FREE_LIMIT,
              resetAt: new Date(today.setHours(24, 0, 0, 0)).toISOString()
            }), {
              status: 429,
              headers: {
                "Content-Type": "application/json",
                "X-DailyLimit": String(DAILY_FREE_LIMIT),
                "X-DailyRemaining": "0",
                "X-DailyReset": new Date(today.setHours(24, 0, 0, 0)).toISOString(),
                ...corsHeaders
              }
            });
          }

          // Increment daily counter
          remainingFree = DAILY_FREE_LIMIT - dailyCount - 1;
          await env.RATE_LIMIT_KV.put(dailyKey, JSON.stringify({
            count: dailyCount + 1
          }), { expirationTtl: DAILY_WINDOW });
        } else {
          // First request of the day
          remainingFree = DAILY_FREE_LIMIT - 1;
          await env.RATE_LIMIT_KV.put(dailyKey, JSON.stringify({
            count: 1
          }), { expirationTtl: DAILY_WINDOW });
        }
      }

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

      // Estimate API cost for this request
      const estimatedInputTokens = API_COSTS.avg_input_tokens;
      const estimatedOutputTokens = (result?.split(' ') || []).length || API_COSTS.avg_output_tokens; // rough estimate
      const estimatedCost = 
        (estimatedInputTokens * API_COSTS.gemini_input_token) +
        (estimatedOutputTokens * API_COSTS.gemini_output_token);

      // Track metrics for rewarded requests (ad-supported)
      if (isRewarded && env.RATE_LIMIT_KV) {
        const today = new Date().toISOString().split('T')[0];
        const statsKey = `stats:${today}`;

        try {
          const stats = await env.RATE_LIMIT_KV.get(statsKey, { type: "json" }) || {
            rewarded_requests: 0,
            estimated_api_cost: 0,
            estimated_ad_revenue: 0
          };

          stats.rewarded_requests = (stats.rewarded_requests || 0) + 1;
          stats.estimated_api_cost = (stats.estimated_api_cost || 0) + estimatedCost;
          stats.estimated_ad_revenue = (stats.estimated_ad_revenue || 0) + AD_REVENUE.estimated_revenue_per_ad;
          stats.profit_margin = stats.estimated_ad_revenue - stats.estimated_api_cost;

          await env.RATE_LIMIT_KV.put(statsKey, JSON.stringify(stats), { expirationTtl: 86400 * 7 }); // Keep for 7 days
        } catch (e) {
          // Stats tracking optional - don't fail on stats errors
          console.error('Stats tracking error:', e);
        }
      }

      return new Response(JSON.stringify({
        result,
        remainingFree: remainingFree,
        dailyLimit: DAILY_FREE_LIMIT,
        rewarded: isRewarded,
        // Optional: Return cost estimate for transparency
        _metrics: {
          estimated_api_cost: Math.round(estimatedCost * 100000) / 100000, // Round to 5 decimals
          is_ad_supported: isRewarded
        }
      }), {
        headers: {
          "Content-Type": "application/json",
          "X-DailyLimit": String(DAILY_FREE_LIMIT),
          "X-DailyRemaining": String(remainingFree),
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
