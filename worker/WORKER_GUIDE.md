# Worker Implementation Guide

## Overview

The Cloudflare Worker handles:
1. **API optimization requests** (Gemini 2.5 Flash)
2. **Daily quota enforcement** (3 free optimizations per day)
3. **Rewarded request handling** (unlimited after ads)
4. **Cost & revenue tracking** (for monitoring profitability)

---

## Setup Instructions

### 1. Create KV Namespace for Rate Limiting

```bash
# Create production KV namespace
wrangler kv:namespace create "RATE_LIMIT_KV"

# Output example:
# ✓ Created namespace with id: abc123def456
# Add preview_id too:
wrangler kv:namespace create "RATE_LIMIT_KV" --preview

# Copy both IDs to wrangler.toml:
# [[kv_namespaces]]
# binding = "RATE_LIMIT_KV"
# id = "abc123def456"
# preview_id = "xyz789"
```

### 2. Set Gemini API Key

```bash
# Get API key from: https://aistudio.google.com/app/apikey
wrangler secret put GEMINI_API_KEY

# Paste your key when prompted
# ✓ Added secret GEMINI_API_KEY to .env.production
```

### 3. Update CORS Origins

Edit `wrangler.toml` and set environment variables:

```bash
wrangler secret put ALLOWED_ORIGINS

# Paste this string (single line, no quotes):
# http://localhost:*,https://promptup.cloud,https://www.promptup.cloud,https://promptailab.netlify.app
```

Or modify allowedOrigins in worker.js directly:

```javascript
const allowedOrigins = [
  "http://localhost:*",
  "https://promptup.cloud",
  "https://www.promptup.cloud",
  "https://promptlab.lido772.workers.dev",
  "https://broad-snow-9b87.lido772.workers.dev",
  "https://promptailab.netlify.app"
];
```

### 4. Deploy Worker

```bash
cd worker/
wrangler deploy

# Output example:
# ✓ Uploaded worker.js (15 KB)
# ✓ Deployed to broad-snow-9b87.lido772.workers.dev
```

### 5. Test the Endpoint

```bash
# Test free optimization
curl -X POST https://broad-snow-9b87.lido772.workers.dev \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Write a blog post about AI for beginners"}'

# Expected response (free tier):
# {
#   "result": "Improved prompt text...",
#   "remainingFree": 2,
#   "dailyLimit": 3,
#   "rewarded": false
# }

# Test rewarded optimization (bypasses daily limit)
curl -X POST https://broad-snow-9b87.lido772.workers.dev \
  -H "Content-Type: application/json" \
  -d '{"prompt": "...", "rewarded": true}'

# Expected response (rewarded):
# {
#   "result": "Improved prompt text...",
#   "remainingFree": 2,
#   "dailyLimit": 3,
#   "rewarded": true
# }
```

---

## Request/Response Format

### Request

```json
{
  "prompt": "Your prompt text here (10-10000 chars)",
  "rewarded": true  // Optional: set to true for ad-supported requests
}
```

### Response (Success)

```json
{
  "result": "Your improved prompt from Gemini API",
  "remainingFree": 2,
  "dailyLimit": 3,
  "rewarded": false,
  "_metrics": {
    "estimated_api_cost": 0.0001,
    "is_ad_supported": false
  }
}
```

### Response (Error - Daily Limit Reached)

```json
{
  "error": "Daily free limit reached. You've used all 3 free improvements for today.",
  "limit": 3,
  "resetAt": "2026-03-04T00:00:00Z"
}
```

### Response (Error - Rate Limited)

```json
{
  "error": "Too many requests. Please try again later.",
  "retryAfter": "3545"  // seconds
}
```

---

## Monitoring

### Daily Stats Tracking

The worker automatically tracks daily statistics in KV:

```
Key format: stats:YYYY-MM-DD
Example: stats:2026-03-03

Value:
{
  "rewarded_requests": 45,
  "estimated_api_cost": 0.0045,
  "estimated_ad_revenue": 0.036,
  "profit_margin": 0.0315
}
```

To retrieve stats:

```bash
# Using wrangler KV CLI
wrangler kv:key list --namespace-id=abc123def456 --prefix stats:

# View specific day
wrangler kv:key get --namespace-id=abc123def456 stats:2026-03-03
```

---

## Cost & Revenue Calculations

### Gemini API Costs

The worker estimates costs per request:

```javascript
// Typical prompt optimization cost
Input tokens: 100 × ($0.075 / 1,000,000) = $0.0000075
Output tokens: 200 × ($0.30 / 1,000,000) = $0.00006

Total per optimization: ~$0.0001
```

### Ad Revenue per Optimization

```javascript
// Rewarded video ad (15 seconds)
CPM (cost per 1000 views): $2-3
Estimated revenue per view: $0.0008

ROI: 8x (revenue covers API cost + 7x profit)
```

---

## Security & Rate Limiting

### IP-Based Rate Limiting
- **Limit:** 60 requests per hour per IP
- **Reset:** Hourly
- **Enforcement:** KV store tracking

### Daily Quota
- **Free users:** 3 optimizations per day (reset at UTC midnight)
- **Rewarded users:** Unlimited (bypasses quota)
- **Enforcement:** Client IP + date key

### Prompt Validation
- **Min length:** 10 characters
- **Max length:** 10,000 characters
- **XSS prevention:** Script tag stripping
- **SQL injection:** N/A (no database queries)

### CORS Security
- **Whitelisted origins only**
- **No wildcard allowed** (except for localhost development)
- **Preflight handling:** Automatic OPTIONS response

---

## Troubleshooting

### Issue: 403 Origin not allowed

**Solution:**
1. Check your website domain in browser console
2. Add to allowedOrigins in worker.js
3. Redeploy: `wrangler deploy`
4. Clear browser cache

### Issue: 429 Daily limit reached

**Expected behavior** – User has used 3 free optimizations
**Solution:** User should watch ad (rewarded flow) or wait until next day

### Issue: 502 API Error (Gemini)

**Cause:** Gemini API request failed
**Solutions:**
1. Check GEMINI_API_KEY is set: `wrangler secret list`
2. Verify API key is active: https://aistudio.google.com/app/apikey
3. Check quota limits in Google Cloud Console
4. Try later if Gemini service is down

### Issue: Prompt returned as "Optimization failed"

**Cause:** Gemini response parsing failed
**Solutions:**
1. Check prompt content (may contain unusual characters)
2. Test with simple prompt: "Write a book title about AI"
3. Check Gemini API response format in worker logs

---

## Logging & Debugging

### Enable Worker Logging

```bash
# View live logs
wrangler tail

# Output example:
# 2026-03-03 14:22:15.123 [debug] Stats tracking...
# 2026-03-03 14:22:16.456 [info] Optimization complete
```

### Useful Log Points

The worker logs important events to console:

```javascript
console.error('Stats tracking error:', e);  // If stats KV fails
console.log('Rewarded request:', clientIP); // Ad-supported optimization
```

---

## Advanced Configuration

### Custom Rate Limits

Edit in worker.js:

```javascript
const RATE_LIMIT = 60;        // Requests per hour
const RATE_LIMIT_WINDOW = 3600; // Window in seconds
const DAILY_FREE_LIMIT = 3;   // Free optimizations per day
const MAX_PROMPT_LENGTH = 10000; // Max prompt chars
```

### Custom Gemini Model

Change AI model (currently Gemini 2.5 Flash):

```javascript
// Line ~290 in worker.js
const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.GEMINI_API_KEY}`;

// Alternative models:
// - gemini-pro
// - gemini-1.5-pro
// - etc.
```

### Cost Tracking Configuration

Edit API cost constants:

```javascript
const API_COSTS = {
  gemini_input_token: 0.000000075,   // $0.075 per million
  gemini_output_token: 0.00000030,   // $0.30 per million
  avg_input_tokens: 100,             // Typical prompt
  avg_output_tokens: 200             // Typical response
};
```

---

## Monthly Maintenance

### 1. Review Daily Stats

```bash
# Get last 30 days of stats
wrangler kv:key list --namespace-id=abc123def456 \
  --prefix stats: --limit=30
```

### 2. Monitor API Costs

- Check Google Cloud Console daily API quota usage
- Estimate monthly cost: (AVG_COST × optimizations)
- Alert if cost > revenue

### 3. Check Ad Revenue

- Login to Google AdSense/Ad Manager
- Review weekly earnings
- Adjust CPM targets if needed

### 4. Update Configuration

- Review rate limits (increase if stable)
- Adjust daily free limit based on user feedback
- Update allowed origins as needed

---

## Next Steps

1. ✅ Deploy worker with `wrangler deploy`
2. ✅ Test endpoints with curl or Postman
3. ✅ Configure Google AdSense code in index.html
4. ✅ Monitor daily stats in KV
5. ✅ Track profitability (cost vs. revenue)
