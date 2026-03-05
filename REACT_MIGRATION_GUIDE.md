# React + Vite + TailwindCSS - GitHub Pages Deployment Guide

## Project Structure

```
promptup-react/
├── public/                 # Static assets (optional)
├── src/
│   ├── components/         # React components
│   │   ├── Header.jsx
│   │   ├── Hero.jsx
│   │   ├── PromptTool.jsx
│   │   ├── ResultCard.jsx
│   │   ├── CTASection.jsx
│   │   ├── Footer.jsx
│   │   ├── HistorySection.jsx
│   │   ├── RewardedModal.jsx
│   │   └── ToastContainer.jsx
│   ├── contexts/           # React Context providers
│   │   ├── AuthContext.jsx
│   │   ├── ToastContext.jsx
│   │   └── AdsContext.jsx
│   ├── hooks/              # Custom React hooks
│   │   ├── useAuth.js
│   │   ├── useToast.js
│   │   ├── useDailyLimit.js
│   │   └── useRewardedModal.js
│   ├── lib/                # Utility functions
│   │   ├── promptAnalyzer.js
│   │   └── history.js
│   ├── data/               # Static data
│   │   └── models.js
│   ├── App.jsx             # Main app component
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles + Tailwind
├── index.html              # HTML template
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # TailwindCSS configuration
├── package.json            # Dependencies
└── .env.local              # Environment variables (not committed)
```

---

## Installation & Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Firebase and API credentials:

```env
# Base path for GitHub Pages deployment
BASE_PATH=/

# Cloudflare Worker URL
VITE_WORKER_URL=https://your-worker.workers.dev

# Firebase Configuration
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
```

### 3. Set Base Path for GitHub Pages

**For custom domain (root):**
```env
BASE_PATH=/
```

**For GitHub Pages subdirectory:**
```env
BASE_PATH=/your-repo-name/
```

---

## Local Development

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## Build for Production

```bash
npm run build
```

This creates a `dist/` folder with the optimized static files.

---

## GitHub Pages Deployment

### Option 1: Using gh-pages (Automated)

1. **Install gh-pages** (already in dependencies)

2. **Update homepage in package.json** (if using GitHub Pages):

```json
{
  "homepage": "https://your-username.github.io/your-repo-name/"
}
```

3. **Deploy:**

```bash
npm run deploy
```

This command:
- Builds the project (`npm run build`)
- Publishes the `dist/` folder to the `gh-pages` branch
- Makes it available at `https://your-username.github.io/your-repo-name/`

### Option 2: Using GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          BASE_PATH: /your-repo-name/

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### Option 3: Custom Domain (CNAME)

1. **Create `public/CNAME`** with your domain:

```
promptup.cloud
```

2. **Configure DNS** at your domain provider:
   - Add a CNAME record pointing to `your-username.github.io`

3. **Enable GitHub Pages** in repository settings:
   - Go to Settings → Pages
   - Select source: Deploy from a branch
   - Select branch: `gh-pages` / `root`

---

## Vite Configuration for GitHub Pages

The `vite.config.js` includes:

1. **Base Path Configuration:**
   ```js
   const BASE_PATH = process.env.BASE_PATH || '/';
   export default defineConfig({
     base: BASE_PATH,
     // ...
   });
   ```

2. **Path Aliases:**
   ```js
   resolve: {
     alias: {
       '@': path.resolve(__dirname, './src'),
       '@components': path.resolve(__dirname, './src/components'),
       // ...
     }
   }
   ```

3. **Code Splitting:**
   ```js
   rollupOptions: {
     output: {
       manualChunks: {
         'react-vendor': ['react', 'react-dom'],
         'firebase': ['firebase'],
       }
     }
   }
   ```

---

## SEO Optimization

The `index.html` includes:

- Meta description
- Open Graph tags
- Twitter Card tags
- Canonical URL
- Semantic HTML structure

For dynamic SEO, consider using `react-helmet-async`:

```bash
npm install react-helmet-async
```

```jsx
import { Helmet } from 'react-helmet-async';

function Page() {
  return (
    <>
      <Helmet>
        <title>PromptUp - Test & Optimize AI Prompts</title>
        <meta name="description" content="..." />
      </Helmet>
      {/* ... */}
    </>
  );
}
```

---

## Performance Optimization

### 1. Code Splitting (Already Configured)

React vendors and Firebase are split into separate chunks.

### 2. Lazy Loading Components

```jsx
import { lazy, Suspense } from 'react';

const HistorySection = lazy(() => import('./components/HistorySection'));

// Usage
<Suspense fallback={<div>Loading...</div>}>
  <HistorySection />
</Suspense>
```

### 3. Image Optimization

Use WebP format and include responsive images:

```jsx
<img
  src="/image.webp"
  srcSet="/image-small.webp 400w, /image.webp 800w"
  sizes="(max-width: 600px) 400px, 800px"
  alt="Description"
  loading="lazy"
/>
```

---

## Troubleshooting

### Issue: Blank page after deployment

**Cause:** Incorrect `BASE_PATH` configuration.

**Fix:** Ensure `BASE_PATH` matches your GitHub Pages URL:
- Root domain: `BASE_PATH=/`
- Subdirectory: `BASE_PATH=/repo-name/`

### Issue: Fonts/styles not loading

**Cause:** Relative path issues with GitHub Pages.

**Fix:** Check that assets use relative paths. Vite handles this automatically with `base` config.

### Issue: AdSense not working

**Cause:** CSP blocking or missing scripts.

**Fix:** Update Content Security Policy in `index.html` to allow AdSense domains.

---

## Security Checklist

- [ ] Environment variables committed (should use `.env.local`)
- [ ] Firebase config exposed (acceptable for client-side apps)
- [ ] API keys have proper restrictions
- [ ] CSP headers properly configured
- [ ] No sensitive data in client-side code

---

## Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [TailwindCSS Documentation](https://tailwindcss.com/)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Firebase Documentation](https://firebase.google.com/docs)
