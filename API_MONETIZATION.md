# PromptUp API Monetization Model

## Overview

PromptUp uses a **hybrid freemium model** where ad-supported optimizations fund the Gemini API costs. This ensures a sustainable, profitable business model with unlimited features for engaged users.

---

## Business Model

### User Tiers

#### **Free Tier (3 daily optimizations)**
- 3 free AI prompt optimizations per day
- No ads, no signup required
- Uses ~$0.0003 in Gemini API costs daily
- No revenue from free tier

#### **Rewarded Tier (Unlimited optimizations)**
- Unlimited optimizations after watching 15-second ad
- Each ad generates revenue covering API costs
- Typical user watches 3-5 ads per session
- Highly engaged users (better conversion for premium tier later)

---

## Cost Breakdown

### Gemini 2.5 Flash API Pricing
```
Input tokens:  $0.075 per 1,000,000 tokens
Output tokens: $0.30 per 1,000,000 tokens
```

### Typical Optimization Request
```
Input:  ~100 tokens (user prompt + system message)
Output: ~200 tokens (improved prompt)

Cost = (100 × $0.075/M) + (200 × $0.30/M)
Cost = $0.0000075 + $0.000060
Cost = $0.0000675 ≈ $0.0001 per optimization
```

### Daily Costs (Conservative Estimates)

| Scenario | Free Tier Cost | Rewarded Cost | Total |
|----------|----------------|---------------|-------|
| 10 users | $0.003 | $0.005 | $0.008 |
| 100 users | $0.03 | $0.05 | $0.08 |
| 1,000 users | $0.3 | $0.5 | $0.8 |
| 10,000 users | $3 | $5 | $8 |

---

## Revenue Model

### Ad Revenue Sources

#### **Google AdSense (Homepage + CTA)**
- Typical CPM: $2-5
- Expected CTR: 2-5%
- Placement: Between free tier CTA and premium features

**Monthly Revenue Formula:**
```
Monthly Revenue = (Unique Visitors × Pages/User × CPM / 1000)
Example: 50K visitors × 1.5 pages × $3 CPM / 1000 = $225/month
```

#### **Rewarded Video Ads (After Optimization)**
- Format: Video ads in modal (15 seconds)
- Completion Rate: 95%+ (users motivated to claim reward)
- Average CPM: $2-3
- Revenue per view: ~$0.0008 (CPM/1000 + engagement bonus)

**Monthly Revenue Formula:**
```
Monthly Rewarded Revenue = (Optimizations × Revenue per Ad)
Example: 1000 optimizations × $0.0008 = $0.80/month
Example: 10,000 optimizations × $0.0008 = $8/month
Example: 50,000 optimizations × $0.0008 = $40/month
```

#### **Affiliate Links**
- ChatGPT Plus, Claude Pro, Gemini Pro subscriptions
- Typical commission: 10-15%
- Placement: In prompt templates, success stories

---

## Profitability Analysis

### Break-Even Point
```
Free Tier Daily Cost: $0.0003 (3 optimizations × $0.0001)
Rewarded Tier Daily Cost: $0.0005 (5 optimizations × $0.0001)

Revenue per rewarded ad: $0.0008
Cost per rewarded optimization: $0.0001

Profit Margin: 8x cost (800% ROI)
```

### Monthly Scenarios

#### **Conservative (10 daily active users, 2 rewarded optimizations each)**
```
Free tier cost: 10 × 3 × $0.0001 = $0.003/day = $0.09/month
Rewarded cost: 10 × 2 × $0.0001 = $0.002/day = $0.06/month
Ad revenue: 10 × 2 × $0.0008 = $0.016/day = $0.48/month

Total Monthly Cost: $0.15
Total Monthly Revenue: $0.48
Monthly Profit: +$0.33 ✅
```

#### **Growth (100 daily active users, 3 rewarded optimizations each)**
```
Free tier cost: 100 × 3 × $0.0001 = $0.03/day = $0.90/month
Rewarded cost: 100 × 3 × $0.0001 = $0.03/day = $0.90/month
Ad revenue (rewarded): 100 × 3 × $0.0008 = $0.24/day = $7.20/month
Homepage ads: 100 × 1.5 × $3 CPM = $0.45/day = $13.50/month

Total Monthly Cost: $1.80
Total Monthly Revenue: $20.70
Monthly Profit: +$18.90 ✅
```

#### **Scale (1,000 daily active users, 4 rewarded optimizations each)**
```
Free tier cost: 1000 × 3 × $0.0001 = $0.30/day = $9/month
Rewarded cost: 1000 × 4 × $0.0001 = $0.40/day = $12/month
Ad revenue (rewarded): 1000 × 4 × $0.0008 = $3.20/day = $96/month
Homepage ads: 1000 × 1.5 × $3 CPM = $4.50/day = $135/month
Affiliate / Premium beta: $50/month (estimated)

Total Monthly Cost: $21
Total Monthly Revenue: $281
Monthly Profit: +$260 ✅ (12x ROI)
```

---

## Implementation Details

### Worker Code (Cloudflare)

The worker tracks:
- **Free tier**: IP-based daily limit enforcement
- **Rewarded tier**: Unlimited optimization requests with `rewarded: true` flag
- **Cost tracking**: Estimates per-request API cost
- **Revenue tracking**: Logs rewarded request count daily

Key Configuration:
```javascript
// Daily Free Limit
const DAILY_FREE_LIMIT = 3;        // 3 free optimizations/day

// Rewarded Threshold
const isRewarded = rewarded === true;  // Skip daily limit if rewarded

// Cost Estimation
const estimatedCost = 
  (inputTokens × $0.075/M) + (outputTokens × $0.30/M);

// Revenue Tracking (daily stats)
stats.estimated_ad_revenue += $0.0008 per rewarded request
```

### Frontend Implementation

User Flow:
1. User enters prompt → clicks "Test & Analyze"
2. Prompt analyzed locally (free)
3. User clicks "Improve Prompt (Free)" → uses daily quota
4. When free quota exhausted → shows "Watch Ad for More"
5. Modal shows 15s rewarded video ad
6. After ad completes → calls worker with `rewarded: true`
7. Worker returns improved prompt, no daily limit deducted
8. User can optimize unlimited times by watching ads

### Deployment Checklist

- [ ] Set `GEMINI_API_KEY` secret in Cloudflare Worker
- [ ] Create KV namespace `RATE_LIMIT_KV` for tracking
- [ ] Add `promptup.cloud` to CORS allowed origins
- [ ] Deploy worker with `wrangler deploy`
- [ ] Set up Google AdSense account
- [ ] Add AdSense code to `index.html`
- [ ] Configure rewarded ad network (Google Ad Manager / Mediavine)
- [ ] Test free tier → daily limit exhaustion → rewarded flow
- [ ] Monitor API costs daily on Google Cloud Console

---

## Scaling Strategy

### Phase 1: MVP (Month 1-2)
- Focus on organic traffic (Twitter, Reddit, Product Hunt)
- Simple Google AdSense setup
- Target: 100-500 daily active users
- Expected Revenue: $5-20/month
- Status: **Break-even on API costs**

### Phase 2: Growth (Month 3-6)
- Rewarded video scaling (Admob, DSP networks)
- Content marketing (blog, guides)
- Premium tier beta ($9.99/month) launch
- Target: 1K-5K daily active users
- Expected Revenue: $100-500/month
- Status: **10-20x ROI**

### Phase 3: Optimization (Month 6+)
- A/B test ad placements, formats, timing
- Negotiate better CPM rates
- Premium features: prompt templates, history, collaboration
- Target: 10K+ daily active users
- Expected Revenue: $1K-5K/month
- Status: **100x+ ROI**

---

## Monitoring & Alerts

### Key Metrics to Track

```
Daily Dashboard:
- Total optimizations (free + rewarded)
- Estimated API cost
- Estimated ad revenue
- Profit margin %
- Ad completion rate
- User retention %
```

### Alert Thresholds

```
⚠️ Warning if:
- Cost > Revenue (profitability risk)
- Ad completion rate < 80% (quality issue)
- API error rate > 1% (reliability issue)

🔴 Critical if:
- Cost > Revenue × 2 (immediate action needed)
- API downtime > 1 hour
- Gemini API quota exceeded
```

---

## Future Revenue Streams

1. **Premium Tier ($9.99/month)**
   - Unlimited optimizations (no ads)
   - Bulk import (CSV/JSON)
   - API access for automation
   - Prompt templates library

2. **Enterprise API ($99-999/month)**
   - High-volume optimization
   - Priority support
   - Custom integrations
   - Usage analytics

3. **B2B Partnerships**
   - Integrations with writing tools
   - White-label solutions
   - Content platforms (Medium, Substack)

---

## Conclusion

PromptUp's ad-supported model is **highly profitable** and **sustainable**. Each user generates 5-10x more revenue than their API cost, creating a virtuous cycle where growth = more profit.

**Key Advantage:** Users appreciate the free/ad-supported model over paywalls, leading to higher adoption and lower churn.
