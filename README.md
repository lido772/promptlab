# Prompt Analyzer - Linear Design System

A stunning, 100% local AI prompt optimization tool with a premium Linear-inspired design system.

![Prompt Analyzer](https://img.shields.io/badge/Design-Linear%20Modern-blue)
![Offline First](https://img.shields.io/badge/Features-Offline%20First-green)
![Privacy Focused](https://img.shields.io/badge/Privacy-100%25%20Local-orange)

## ✨ Features

### 🎨 Linear Design System
- **Cinematic Ambient Lighting**: 4 animated gradient blobs create atmospheric depth
- **Mouse-Tracking Spotlights**: Interactive cards respond to cursor position
- **Multi-Layer Glass Morphism**: Cards with gradient backgrounds and subtle borders
- **Gradient Typography**: Headlines with vertical fade and shimmer effects
- **Precision Micro-Interactions**: 200-300ms animations with expo-out easing

### 🤖 Local AI Engine
- **100% Browser-Based**: Runs entirely in your browser using Transformers.js
- **Multi-Model Support**: Choose from DistilGPT2 (~80MB), TinyLlama (~650MB), or Phi-3 Mini (~2.2GB)
- **Offline Capable**: Works without internet after initial model download
- **Privacy First**: No data leaves your device

### 🌍 Multi-Language Support
- 8 languages: English, French, Spanish, German, Arabic, Hindi, Chinese, Japanese
- Language-specific heuristic analysis
- Instant UI switching

### 📊 Heuristic Scoring
- **Role Definition**: Detects persona/expert role setup
- **Format Specification**: Identifies output format requirements
- **Constraints**: Evaluates limitations and boundaries
- **Context Clarity**: Measures contextual information quality
- **Real-time Analysis**: Instant scoring without server requests

## 🚀 Quick Start

1. **Open `index.html`** in a modern browser
2. **Enter your prompt** in the text area
3. **Click "Analyze Instantly"** for heuristic scoring
4. **Optional**: Load a local AI model for AI-powered prompt rewriting
5. **Copy** the optimized version

## 🎯 Design System Highlights

### Color Palette
- **Background Deep**: `#020203` - Deepest layers
- **Background Base**: `#050506` - Primary canvas
- **Foreground**: `#EDEDEF` - Primary text
- **Accent**: `#5E6AD2` - Interactive elements
- **Accent Glow**: `rgba(94, 106, 210, 0.3)` - Ambient lighting

### Typography
- **Font**: Inter (Google Fonts)
- **Scale**: Display (7xl-8xl) → H1 (5xl-6xl) → H2 (3xl-4xl) → Body (sm-base)
- **Gradient Text**: Vertical fade from white to semi-transparent

### Components
- **Cards**: Glass morphism with gradient backgrounds, multi-layer shadows
- **Buttons**: Primary with glow effect, secondary with inset shadow
- **Inputs**: Dark background with accent focus ring
- **Spotlight Effect**: Mouse-tracking radial gradient on hover

### Animations
- **Ambient Blobs**: 8-10s float animation with 150px blur
- **Parallax**: Hero fades and scales on scroll
- **Stagger Reveals**: 80ms delay between elements
- **Easing**: Expo-out `cubic-bezier(0.16, 1, 0.3, 1)`

## 📁 File Structure

```
├── index.html              # Main application
├── app.js                  # Application logic
├── animations.js           # Animation system (spotlight, parallax)
├── styles.css              # Linear design system
├── i18n.js                 # Internationalization
├── llmEngine.js            # Local LLM engine
├── modelSelector.js        # Model selection logic
├── promptAnalyzer.js       # Heuristic scoring engine
├── README.md               # This file
├── assets/                 # Images and static assets
├── css/                    # Additional stylesheets
└── js/                     # Additional scripts
```

## 🎨 Customization

### Change Accent Color
Update CSS custom properties in `styles.css`:

```css
:root {
    --accent: #5E6AD2;          /* Main accent */
    --accent-bright: #6872D9;   /* Hover state */
    --accent-glow: rgba(94, 106, 210, 0.3);  /* Glow effect */
}
```

### Adjust Animation Speed
Modify animation durations:

```css
:root {
    --duration-fast: 200ms;     /* Quick interactions */
    --duration-normal: 300ms;   /* Standard transitions */
    --duration-slow: 600ms;     /* Entrance animations */
}
```

### Disable Animations
The system respects `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
    /* Animations automatically disabled */
}
```

## 🔧 Technical Details

### Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Performance Optimizations
- CSS-only animations (no heavy JS libraries)
- `will-change` hints for GPU acceleration
- Lazy loading for AI models
- Passive scroll listeners
- RequestAnimationFrame for parallax

### Accessibility Features
- WCAG AA contrast ratios
- Visible focus indicators
- Keyboard navigation support
- Screen reader friendly
- Reduced motion support

## 📝 License

MIT License - Feel free to use this design system in your projects!

## 🙏 Credits

- **Transformers.js** by Hugging Face
- **Inter Font** by Rasmus Andersson
- **Design Inspiration** from Linear, Vercel, and Raycast

---

Built with ❤️ using the Linear Design System
