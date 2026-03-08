/**
 * Linear Design System - Interactive Animations
 * Handles mouse tracking, parallax, and scroll effects
 */

// Mouse Tracking Spotlight Effect
class SpotlightEffect {
    constructor() {
        this.spotlightCards = document.querySelectorAll('.spotlight-card');
        this.init();
    }

    init() {
        this.spotlightCards.forEach(card => {
            card.addEventListener('mousemove', (e) => this.handleMouseMove(e, card));
            card.addEventListener('mouseleave', (e) => this.handleMouseLeave(e, card));
        });
    }

    handleMouseMove(e, card) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const spotlight = card.querySelector('.spotlight-gradient');
        if (spotlight) {
            spotlight.style.left = `${x}px`;
            spotlight.style.top = `${y}px`;
        }
    }

    handleMouseLeave(e, card) {
        const spotlight = card.querySelector('.spotlight-gradient');
        if (spotlight) {
            spotlight.style.opacity = '0';
        }
    }
}

// Parallax Scroll Effect
class ParallaxEffect {
    constructor() {
        this.hero = document.querySelector('header');
        this.results = document.getElementById('results-area');
        this.lastScrollY = 0;
        this.ticking = false;
        this.init();
    }

    init() {
        window.addEventListener('scroll', () => this.onScroll(), { passive: true });
    }

    onScroll() {
        this.lastScrollY = window.scrollY;
        
        if (!this.ticking) {
            window.requestAnimationFrame(() => {
                this.updateParallax();
                this.ticking = false;
            });
            this.ticking = true;
        }
    }

    updateParallax() {
        const scrollY = this.lastScrollY;
        const maxScroll = window.innerHeight * 0.5;
        const progress = Math.min(scrollY / maxScroll, 1);
        
        if (this.hero) {
            // Fade out and scale down hero
            const opacity = 1 - (progress * 0.3);
            const scale = 1 - (progress * 0.05);
            const translateY = progress * 50;
            
            this.hero.style.opacity = opacity;
            this.hero.style.transform = `translateY(${translateY}px) scale(${scale})`;
        }
    }
}

// Staggered Reveal Animation
class RevealAnimation {
    constructor() {
        this.elements = document.querySelectorAll('.card, .btn-primary, .btn-secondary');
        this.init();
    }

    init() {
        // Create intersection observer
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.remove('stagger-reveal-initial');
                        entry.target.classList.add('animate-in');
                    }, index * 80);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        });

        this.elements.forEach(el => {
            observer.observe(el);
        });
    }
}

// Smooth Button Press Animation
class ButtonAnimation {
    constructor() {
        this.buttons = document.querySelectorAll('.btn-primary, .btn-secondary');
        this.init();
    }

    init() {
        this.buttons.forEach(button => {
            button.addEventListener('mousedown', () => {
                button.style.transform = 'translateY(0) scale(0.98)';
            });
            
            button.addEventListener('mouseup', () => {
                button.style.transform = '';
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.transform = '';
            });
        });
    }
}

// Progress Bar Animation
class ProgressAnimation {
    constructor() {
        this.progressBar = document.getElementById('progress-bar');
        this.progressText = document.getElementById('progress-text');
    }

    updateProgress(percent) {
        if (this.progressBar) {
            this.progressBar.style.width = `${percent}%`;
        }
        if (this.progressText) {
            this.progressText.textContent = `${Math.round(percent)}%`;
        }
    }
}

// Initialize all animations when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (!prefersReducedMotion) {
        new SpotlightEffect();
        new ParallaxEffect();
        new RevealAnimation();
        new ButtonAnimation();
    }
    
    // Progress animation is always available
    window.progressAnimation = new ProgressAnimation();
});

// Export for use in app.js
window.SpotlightEffect = SpotlightEffect;
window.ParallaxEffect = ParallaxEffect;
window.RevealAnimation = RevealAnimation;
window.ButtonAnimation = ButtonAnimation;
window.ProgressAnimation = ProgressAnimation;
