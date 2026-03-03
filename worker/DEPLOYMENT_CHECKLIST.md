# PromptUp Worker Deployment Checklist

Complete this checklist to deploy the PromptUp Worker successfully.

---

## ✅ Pre-Deployment Steps

### 1. Install Wrangler CLI
```bash
npm install -g wrangler
wrangler --version  # Should show version 4.70.0+
```

### 2. Authenticate with Cloudflare
```bash
wrangler login
# Opens browser to authenticate
# Returns a valid API token
```

### 3. Get Your Account ID
```bash
# After login, your account ID is saved
# Verify it:
wrangler whoami
# Shows: Account ID: abc123def456xyz
```

---

## 🔑 Setup Secrets & Environment

### Step 1: Create KV Namespace

```bash
cd worker/

# Create production KV namespace
wrangler kv:namespace create "RATE_LIMIT_KV"

# Output example:
# ✓ Created namespace with ID: xxxxx
# Binding RATE_LIMIT_KV with ID xxxxx

# Also create preview namespace (for testing)
wrangler kv:namespace create "RATE_LIMIT_KV" --preview

# Output will show preview_id
```

### Step 2: Update wrangler.toml with KV IDs

Edit `wrangler.toml` and replace the placeholder IDs:

```toml
[[kv_namespaces]]
binding = "RATE_LIMIT_KV"
id = "YOUR-PRODUCTION-ID-HERE"        # From step above
preview_id = "YOUR-PREVIEW-ID-HERE"   # From step above
```

### Step 3: Set Required Secrets

```bash
# Get Gemini API Key from: https://aistudio.google.com/app/apikey
wrangler secret put GEMINI_API_KEY
# Paste your key when prompted
# ✓ Added secret GEMINI_API_KEY

# Set CORS allowed origins
wrangler secret put ALLOWED_ORIGINS
# Paste this (single line):
# http://localhost:*,https://promptup.cloud,https://www.promptup.cloud,https://promptailab.netlify.app
# ✓ Added secret ALLOWED_ORIGINS

# Verify secrets are set
wrangler secret list
# Should show:
# - GEMINI_API_KEY
# - ALLOWED_ORIGINS
```

---

## 🚀 Deployment

### Option A: Deploy to Cloudflare Workers (Recommended)

```bash
cd worker/
wrangler deploy

# Output should show:
# ⛅️ wrangler 4.70.0
# Total Upload: 11.56 KiB / gzip: 2.99 KiB
# Your Worker has access to the following bindings:
# Binding             Resource
# RATE_LIMIT_KV       KV Workspace
# ✓ Deployed successfully to: https://promptup-worker.YOUR_SUBDOMAIN.workers.dev
```

### Option B: Deploy to Custom Domain

1. Add domain route to wrangler.toml:
```toml
routes = [
  { pattern = "api.promptup.cloud/*", zone_name = "promptup.cloud" }
]
```

2. Deploy:
```bash
wrangler deploy
```

3. Update your DNS:
```
Type: CNAME
Name: api
Content: promptup-worker.YOUR_SUBDOMAIN.workers.dev
```

---

## 🧪 Test the Deployment

### Test 1: Health Check

```bash
# Replace URL with your actual deployment URL
curl https://promptup-worker.YOUR_SUBDOMAIN.workers.dev \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Write a blog post about artificial intelligence for beginners"}'
```

**Expected Response (Free Tier):**
```json
{
  "result": "Improved prompt text here...",
  "remainingFree": 2,
  "dailyLimit": 3,
  "rewarded": false,
  "_metrics": {
    "estimated_api_cost": 0.0001,
    "is_ad_supported": false
  }
}
```

### Test 2: Rewarded Flow

```bash
curl https://promptup-worker.YOUR_SUBDOMAIN.workers.dev \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Write a blog post about artificial intelligence for beginners", "rewarded": true}'
```

**Expected Response:**
```json
{
  "result": "...",
  "remaining_free": 3,
  "dailyLimit": 3,
  "rewarded": true
}
```

### Test 3: From Browser

Update `index.html` with your worker URL:

```javascript
const CONFIG = {
  WORKER_URL: "https://promptup-worker.YOUR_SUBDOMAIN.workers.dev"
};
```

Then test the UI:
1. Open https://promptup.cloud
2. Enter a prompt
3. Click "Test & Analyze"
4. Click "Improve Prompt (Free)"
5. Should return improved prompt

---

## 📊 Monitor After Deployment

### Check Logs

```bash
# View real-time logs
wrangler tail

# Output example:
# 23:31:45.123 [info] Optimization request from IP: 1.2.3.4
# 23:31:46.456 [info] Gemini API response: 200 OK
# 23:31:47.789 [info] Estimated cost: $0.0001
```

### View KV Storage

```bash
# List all KV keys
wrangler kv:key list --binding=RATE_LIMIT_KV

# View daily stats
wrangler kv:key get --binding=RATE_LIMIT_KV stats:2026-03-03

# Example output:
# {
#   "rewarded_requests": 45,
#   "estimated_api_cost": 0.0045,
#   "estimated_ad_revenue": 0.036,
#   "profit_margin": 0.0315
# }
```

---

## 🐛 Troubleshooting

### Issue: "Multiple environments defined" warning

**Solution:** Already fixed in wrangler.toml - just make sure you use `wrangler deploy` without `-e` flag

### Issue: 403 Origin not allowed

**Solution:**
1. Check your domain in browser DevTools (F12 → Network tab)
2. Add it to ALLOWED_ORIGINS secret:
```bash
wrangler secret put ALLOWED_ORIGINS
# Add your domain to the comma-separated list
```
3. Redeploy

### Issue: GEMINI_API_KEY error

**Solution:**
1. Verify key is set: `wrangler secret list`
2. Get new key: https://aistudio.google.com/app/apikey
3. Update secret: `wrangler secret put GEMINI_API_KEY`

### Issue: 429 Rate Limited

**Reason:** Too many requests per hour (limit: 60/hour)
**Solution:** 
- Spread requests over time
- Increase RATE_LIMIT in worker.js if needed
- Check Google Cloud quota (Gemini API limits)

### Issue: KV namespace errors

**Solution:**
1. Verify namespace was created: `wrangler kv:namespace list`
2. Check IDs in wrangler.toml match output
3. Redeploy: `wrangler deploy`

---

## ✨ Post-Deployment

### 1. Configure Google AdSense

1. Sign up: https://adsense.google.com
2. Add site: promptup.cloud
3. Get AdSense code
4. Add to `index.html` in `<head>`:

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_PUB_ID"
 crossorigin="anonymous"></script>
```

### 2. Set Up Analytics

Google Analytics 4 is already in index.html:
```javascript
<!-- Already configured with ID: G-FP5GQJM9KZ -->
```

Monitor daily stats:
- Visitor count
- Optimization requests
- Ad impressions

### 3. Enable Custom Domain (Optional)

```bash
# If you have a Cloudflare domain:
# 1. Add DNS record (CNAME)
# 2. Wait for propagation (~5 min)
# 3. Test: curl https://api.promptup.cloud
```

---

## 💰 Revenue Monitoring

### Daily Checklist

1. **Check Worker Stats**
```bash
wrangler kv:key get --binding=RATE_LIMIT_KV stats:$(date +%Y-%m-%d)
```

2. **Calculate Daily Profit**
```
Daily Profit = (Rewarded Optimizations × $0.0008) - (Total Optimizations × $0.0001)
```

3. **Monitor Ad Revenue**
- Login to Google AdSense
- Check earnings from last 24h
- Compare vs. estimated revenue

4. **Alert if Problem**
```
⚠️ If: Cost > Revenue (rare, but check Gemini API usage)
🔴 If: API error rate > 1%
```

---

## 🎉 Success!

Your PromptUp Worker is now live and earning money! 

**Key Metrics:**
- ✅ Free tier cost: $0.0003 per user daily
- ✅ Rewarded revenue: $0.0008 per optimization
- ✅ Profit margin: 8x per rewarded request
- ✅ Break-even: ~2 active users

**Next Steps:**
1. Deploy frontend (GitHub Pages / Netlify)
2. Start marketing (Twitter, Reddit, etc.)
3. Monitor daily stats & revenue
4. Iterate based on user feedback
