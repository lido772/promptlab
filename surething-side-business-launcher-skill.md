name: side-business-launcher description: "Autonomous side business discovery and launch. Use when: (1) user wants to start a side business or online tool, (2) user provides an email address for profiling + business idea generation, (3) user wants a tool website built and deployed automatically, (4) user needs growth engine (outreach lists + social media traffic plan). Full 5-step closed-loop pipeline: profile → recommend → build → deploy → grow."

Side Business Discovery & Launch Skill
5-step closed-loop pipeline: User Profile → Idea Recommendation → Auto Build Website → Auto Deploy to GitHub Pages → Growth Engine. Input: user email (or existing profile). Output: live tool website + actionable growth plan.

Critical Rules
Single unbroken loop — All 5 steps execute sequentially without stopping. HITL only at outreach email send (Step 5B).
Minimize HITL aggressively — SureThing auto-completes wherever possible. Do NOT ask user to choose between options; pick the best one and go. User can interrupt anytime.
Thin profile fallback — If web search returns insufficient public data, fall back to internal user data + email domain inference. Never block the pipeline on missing profile data.
GitHub Pages only — Deploy to GitHub Pages via connected GitHub account. No Vercel. No custom domain (future enhancement).
Never fabricate contacts — Outreach targets must come from real web search results with verifiable names and contact info.
CTA to surething.io — Every generated website must include a bottom CTA linking to surething.io.
Prerequisites
Resource	Required	How to Connect
GitHub	Yes	COMPOSIO_MANAGE_CONNECTIONS → toolkit: github → OAuth
Twitter	Optional	COMPOSIO_MANAGE_CONNECTIONS → toolkit: twitter → OAuth (enables real-time search in Step 5C)
Before starting the pipeline, verify GitHub connection:

COMPOSIO_SEARCH_TOOLS({ queries: [{ use_case: "create a GitHub repository" }] })
→ Check connection status. If not connected → COMPOSIO_MANAGE_CONNECTIONS → return auth URL → STOP until connected.
Workflow
User triggers pipeline (provides email or says "start side business")
    │
    ▼
Step 1: User Profiling
    │
    ▼
Step 2: Idea Recommendation (auto-select #1, list 2 alternates)
    │
    ▼
Step 3: Website Generation (single-file HTML SPA)
    │
    ▼
Step 4: Deploy to GitHub Pages
    │
    ▼
Step 5: Growth Engine
    ├── 5A: Outreach target list (auto)
    ├── 5B: Email templates (auto) → HITL before sending ✋
    └── 5C: Twitter traffic plan (auto)
    │
    ▼
Pipeline complete. Present summary + next actions.
Step 1: User Profiling
Goal
Build a structured user profile from public web data + internal context.

Execution
1. web_research({ goal: "Find professional background, social profiles, skills for [user_name] at [email_domain]" })
2. COMPOSIO_SEARCH_TOOLS → search Twitter/LinkedIn/GitHub for user name
3. Merge with internal data: user_memory, user_context, email history
Output Schema
User Profile:
- Identity / Title
- Email
- Industry
- Tech Stack
- Skill Tags (weighted)
- Thinking Style
- Public Social Accounts
- Company Background
Thin Profile Handling
If web search returns < 3 relevant results:

Fall back to: email domain → infer company/industry; user_memory → extract skills and preferences
Mark profile as thin_profile: true — this does NOT block pipeline
Log: "Thin profile — enrichment API (Datagma/Apollo) recommended for production"
Step 2: Idea Recommendation
Goal
Auto-select the best side business direction. No HITL — pick #1 and go.

Decision Framework
Dimension	Weight	Criteria
Domain Fit	40%	User's existing skills/industry directly applicable
Tech Simplicity	25%	Implementable as single-file SPA, no backend
SEO/Traffic Potential	20%	Search terms have real volume, clear intent
Monetization/Funnel	15%	Natural CTA or commercial conversion path
Template Library
Type	Best For	Example
ROI Calculator	SaaS/AI/productivity professionals	AI Agent ROI Calculator
Scorer/Detector	Security/compliance/tech experts	AI Workflow Complexity Scorer
Generator	Content/creative/marketing professionals	Side Hustle Idea Generator
Comparison Tool	Procurement/selection decision-makers	SaaS Feature Comparison Tool
Simulator	Finance/data analysts	Investment Return Simulator
Execution
1. Score top 3 ideas against framework using user profile
2. Select rank #1 automatically
3. Present recommendation with:
   - What it is (1 sentence)
   - Why it fits THIS user (3-5 specific reasons linking to profile)
   - 2 alternates (user can switch anytime)
4. Proceed to Step 3 immediately — do NOT wait for confirmation
Step 3: Website Generation
Goal
Generate a complete, deployable single-file website.

Tech Spec
Attribute	Requirement
Format	Single index.html (embedded CSS + JS)
Theme	Dark mode, modern design
Responsive	Mobile-first layout
Dependencies	Zero — no CDN, no Node.js, no build step
CTA	Bottom section linking to surething.io
SEO	Complete meta tags (title, description, og:image, og:title, og:description)
Execution
1. Determine page structure from idea type:
   - Calculator → input fields + real-time computation + result display
   - Scorer → questionnaire + weighted scoring + grade output
   - Generator → input parameters + randomized/AI output + share button
   - Comparison → feature matrix + highlight differences
   - Simulator → variable sliders + chart/graph output
2. Generate full HTML in COMPOSIO_REMOTE_WORKBENCH:
   COMPOSIO_REMOTE_WORKBENCH({
     code_to_execute: "... generate HTML, write to /home/user/index.html ...",
     thought: "Generate complete single-file SPA for [idea name]"
   })
3. Generate README.md:
   - Project name, description, live link (placeholder until Step 4)
   - Built with SureThing badge
Quality Checklist
 Page runs standalone (open HTML directly = fully functional)
 Mobile layout renders correctly
 All interactive logic works (input validation, calculation, result display, animations)
 CTA links to surething.io
 Meta tags complete
 No external dependencies or broken references
Step 4: Deploy to GitHub Pages
Goal
Push code to GitHub and enable GitHub Pages. Output: live public URL.

Execution
1. Create public repo:
   COMPOSIO_SEARCH_TOOLS({ queries: [{ use_case: "create a GitHub repository" }] })
   COMPOSIO_MULTI_EXECUTE_TOOL → GITHUB_CREATE_A_REPOSITORY_FOR_THE_AUTHENTICATED_USER({
     name: "<repo-name>",  // kebab-case from idea name, e.g. "ai-roi-calculator"
     description: "<one-line description>",
     private: false,
     auto_init: false
   })

2. Push files (index.html + README.md):
   COMPOSIO_MULTI_EXECUTE_TOOL → GITHUB_CREATE_OR_UPDATE_FILE_CONTENTS({
     owner: "<github_username>",
     repo: "<repo-name>",
     path: "index.html",
     message: "Initial commit: [idea name]",
     content: "<base64_encoded_html>"
   })
   // Repeat for README.md

3. Enable GitHub Pages:
   COMPOSIO_REMOTE_WORKBENCH → proxy_execute(
     "POST",
     "/repos/<owner>/<repo>/pages",
     "github",
     body={ "source": { "branch": "main", "path": "/" } }
   )

4. Output live URL: https://<github_username>.github.io/<repo-name>
   // GitHub Pages takes 1-2 minutes to propagate
Error Handling
If repo already exists → append -v2, -v3 suffix
If Pages API fails → retry once, then report error and provide manual instructions
If push fails (auth issue) → prompt user to re-authorize GitHub
Step 5: Growth Engine
Goal
Generate a complete, actionable growth plan: outreach targets + email templates + Twitter traffic plan.

5A: Outreach Target List
Execution:

web_research({
  goal: "Find podcast hosts, newsletter writers, and founders/KOLs in the [industry/topic] space who would be interested in [tool name]. Need names, roles, contact info (email or LinkedIn), and relevance explanation."
})
Output format (3 tiers):

Tier	Role	Count	Priority
Tier 1	Podcast Hosts	3-5	Highest — broad audience reach
Tier 2	Newsletter Writers	3-5	High — targeted reader intent
Tier 3	Founders / KOLs	3-5	Medium — amplification potential
Each target includes: Name, Role, Contact (email/LinkedIn), Relevance (why they'd care).

5B: Email Templates
Generate 3 templates (one per tier):

Template	Target	Style
Podcast Guest Pitch	Tier 1	Formal, value-first, include tool link
Newsletter Feature Request	Tier 2	Concise, data-driven, mutual benefit
Founder Intro DM	Tier 3	Short, reference their work, low-pressure
⚠️ HITL GATE: Before sending any outreach emails, create HITL task for user approval.

email_draft_manage({ operation: "create", to: [...], subject: "...", body: "..." })
task_manage({ operation: "create", executor: "human", draft_id: "...", title: "Review outreach email to [name]", why_human: "Outreach email — review before sending" })
5C: Twitter Traffic Plan
Generate these deliverables:

5 ready-to-post tweets:

Hook + Value (feature list)
Stat Hook (data-driven angle)
Thread Starter (discussion prompt)
Reply Bait (comment section engagement)
Community Drop (subreddit/community share format)
Engagement targets:

6-10 relevant Twitter accounts to interact with
8+ monitoring hashtags
5 daily search queries (for discovering engagement opportunities)
If Twitter is connected:

COMPOSIO_SEARCH_TOOLS({ queries: [{ use_case: "search Twitter for recent tweets" }] })
→ Use real-time search to find active conversations to engage with
If Twitter is NOT connected:

→ Generate static target lists from web research
→ Prompt user to connect Twitter for real-time monitoring: COMPOSIO_MANAGE_CONNECTIONS({ toolkit: "twitter" })
Tools Reference
Tool	Used In	Purpose
web_research	Step 1, 5A	Full-web profile search, outreach target discovery
COMPOSIO_SEARCH_TOOLS	Step 1, 4, 5C	Find GitHub/Twitter/LinkedIn tool actions
COMPOSIO_MULTI_EXECUTE_TOOL	Step 4	Execute GitHub repo creation, file push
COMPOSIO_REMOTE_WORKBENCH	Step 3, 4	Generate HTML code, enable GitHub Pages via proxy_execute
COMPOSIO_MANAGE_CONNECTIONS	Prerequisites	Connect GitHub (required), Twitter (optional)
email_draft_manage	Step 5B	Draft outreach emails for HITL review
task_manage	Step 5B	Create HITL task for email send confirmation
social_draft_manage	Step 5C	Draft Twitter posts (if auto-posting enabled)
Handling User Operations
When <user_operation> appears during pipeline execution:

User Action	Response
User switches idea direction	Re-run from Step 2 with new direction, skip Steps 3-5 artifacts from old direction
User approves outreach email	Send via surething execute --task-id=<id>, create follow-up delay task to check replies
User edits outreach email	Create new draft + new HITL task, skip old task (see Email Skill pattern)
User cancels outreach	Skip task, ask if user wants different targets or to stop outreach entirely
User says "run for another person"	Re-run full pipeline from Step 1 with new email input
Post-Pipeline Summary
After all 5 steps complete, present a single summary:

Pipeline Complete:
| Step | Output |
|------|--------|
| 1. Profile | ✅ [profile quality: rich/thin] |
| 2. Recommendation | ✅ [idea name] |
| 3. Website | ✅ [tech summary] |
| 4. Deployment | ✅ [live URL] |
| 5. Growth | ✅ [X targets + Y templates + Z tweets] |

Next actions:
1. Approve outreach emails → I'll send them
2. Connect Twitter → I'll run daily engagement monitoring
3. Run for another user → validate pipeline generalization
Known Limitations & Roadmap
Limitation	Current Handling	Future Enhancement
Thin public profiles	Internal data fallback	Datagma/Apollo enrichment API
Single website template style	Dark-theme SPA only	Template library (multi-page, dashboard, Next.js)
GitHub Pages only	Works for static sites	Vercel + surething.io subdomain
Twitter engagement is manual	Static target lists	Connected Twitter API → auto-monitor + auto-engage
Email outreach only	Email templates	LinkedIn InMail, Twitter DM, cold outreach sequences