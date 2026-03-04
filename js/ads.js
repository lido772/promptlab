/**
 * Ad Network Integration Module
 * Handles Google AdSense, ImmoderateScarSheer, and other ad networks
 */

import { DOM } from './dom-builder.js';

const Ads = {
    initialized: false,
    pendingAds: new Set(),

    /**
     * Initialize ad networks after page load
     */
    init() {
        if (this.initialized) return;

        // Check if page is already loaded
        if (document.readyState === 'complete') {
            // Page already loaded, initialize ads with a short delay
            setTimeout(() => {
                this.initializePendingAds();
            }, 1000);
        } else {
            // Wait for page to fully load
            window.addEventListener('load', () => {
                setTimeout(() => {
                    this.initializePendingAds();
                }, 1000);
            }, { once: true });
        }

        this.initialized = true;
    },

    /**
     * Initialize all pending ads
     */
    initializePendingAds() {
        const pendingAds = document.querySelectorAll('.adsbygoogle[data-ad-initialization="pending"]');

        pendingAds.forEach((ad) => {
            this.initializeAd(ad);
        });
    },

    /**
     * Initialize a single ad
     * @param {HTMLElement} ad - Ad element to initialize
     * @param {number} retryCount - Current retry attempt
     */
    initializeAd(ad, retryCount = 0) {
        const parent = ad.parentElement;
        if (!parent) return;

        // Check if already initialized
        if (ad.getAttribute('data-ad-initialized') === 'true') {
            return;
        }

        const parentWidth = parent.offsetWidth;
        const adWidth = ad.offsetWidth;

        // Ensure ad has minimum width before initializing
        if (parentWidth > 50 && adWidth >= 0) {
            // Set explicit width to match parent
            ad.style.width = parentWidth + 'px';
            ad.style.minWidth = '200px';
            ad.style.display = 'block';

            // Force reflow to ensure styles are applied
            void ad.offsetWidth;

            // Double-check width after forcing styles
            const finalWidth = ad.offsetWidth;
            if (finalWidth === 0) {
                // Width still 0, schedule retry
                this.scheduleRetry(ad, retryCount);
                return;
            }

            // Initialize AdSense ad
            if (window.adsbygoogle) {
                try {
                    (window.adsbygoogle = window.adsbygoogle || []).push({});
                    ad.removeAttribute('data-ad-initialization');
                    ad.setAttribute('data-ad-initialized', 'true');
                } catch (error) {
                    // If AdSense fails, schedule retry
                    if (retryCount < 5) {
                        this.scheduleRetry(ad, retryCount);
                    } else {
                        console.warn('AdSense initialization failed after 5 attempts:', ad.id);
                    }
                }
            }
        } else {
            // Width too small, schedule retry
            this.scheduleRetry(ad, retryCount);
        }
    },

    /**
     * Schedule a retry for ad initialization
     * @param {HTMLElement} ad - Ad element to retry
     * @param {number} retryCount - Current retry count
     */
    scheduleRetry(ad, retryCount) {
        if (retryCount >= 5) {
            // Max retries reached, mark as failed
            console.warn('Ad initialization skipped (width too small):', ad.id);
            ad.setAttribute('data-ad-initialization', 'failed');
            return;
        }

        // Exponential backoff: 500ms, 1000ms, 2000ms, 4000ms, 8000ms
        const delay = 500 * Math.pow(2, retryCount);

        setTimeout(() => {
            // Only retry if still pending
            if (ad.getAttribute('data-ad-initialization') === 'pending') {
                this.initializeAd(ad, retryCount + 1);
            }
        }, delay);
    },

    /**
     * Setup rewarded ad fallback mechanism
     */
    setupRewardedAdFallback() {
        const adISS = document.getElementById('adContentISS');
        const adGoogle = document.getElementById('adContent');
        const adFallback = document.getElementById('adContentFallback');

        if (!adISS) return;

        // Wait for ImmoderateScarSheer to load
        setTimeout(() => {
            const hasISSAd = adISS.querySelector('iframe') ||
                adISS.querySelector('img') ||
                adISS.innerHTML.includes('<script');

            if (!hasISSAd && adGoogle) {
                adISS.style.display = 'none';
                adGoogle.style.display = 'block';

                // Initialize Google AdSense
                if (window.adsbygoogle && adGoogle.querySelector('.adsbygoogle')) {
                    try {
                        (window.adsbygoogle = window.adsbygoogle || []).push({});
                    } catch (error) {
                        console.error('Rewarded ad initialization error:', error);
                    }
                }
            }
        }, 3000);
    },

    /**
     * Monitor ImmoderateScarSheer ad loading and fallback to Google AdSense
     */
    monitorAdFallback() {
        const adContainers = [
            { issElement: 'issTopBanner', googleElement: 'googleTopBanner' },
            { issElement: 'issHero', googleElement: 'googleHero' },
            { issElement: 'issRectangle', googleElement: 'googleRectangle' }
        ];

        window.addEventListener('load', () => {
            setTimeout(() => {
                adContainers.forEach((container) => {
                    const issEl = document.getElementById(container.issElement);
                    const googleEl = document.getElementById(container.googleElement);

                    if (!issEl) return;

                    // Check if ImmoderateScarSheer ad has loaded
                    const hasAdContent = issEl.querySelector('iframe') ||
                        issEl.querySelector('img') ||
                        issEl.querySelector('[data-ad-format]') ||
                        (issEl.innerHTML.includes('ins') && issEl.querySelector('ins.adsbygoogle'));

                    // If no ad content after 5 seconds, show Google AdSense fallback
                    if (!hasAdContent && googleEl) {
                        issEl.style.display = 'none';
                        googleEl.style.display = 'block';

                        // Initialize Google AdSense
                        if (window.adsbygoogle && googleEl.querySelector('.adsbygoogle')) {
                            try {
                                (window.adsbygoogle = window.adsbygoogle || []).push({});
                            } catch (error) {
                                console.error('Fallback ad initialization error:', error);
                            }
                        }
                    }
                });
            }, 5000);
        });
    },

    /**
     * Load dynamic ad scripts (only on real domains, not file://)
     */
    loadDynamicAds() {
        if (location.protocol === 'file:') return;

        // Google AdSense
        const ads = document.createElement('script');
        ads.async = true;
        ads.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5400335063218645';
        ads.crossOrigin = 'anonymous';
        ads.id = 'ad-dynamic-adsense';
        document.head.appendChild(ads);

        // Google Analytics (gtag.js)
        const gtag_s = document.createElement('script');
        gtag_s.async = true;
        gtag_s.src = 'https://www.googletagmanager.com/gtag/js?id=G-FP5GQJM9KZ';
        gtag_s.id = 'ad-dynamic-gtag';
        document.head.appendChild(gtag_s);

        window.dataLayer = window.dataLayer || [];

        function gtag() {
            window.dataLayer.push(arguments);
        }

        gtag('js', new Date());
        gtag('config', 'G-FP5GQJM9KZ');
        window.gtag = gtag;
    }
};

export default Ads;
