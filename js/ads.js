/**
 * Ad Network Integration Module
 * Handles Google AdSense and ImmoderateScarSheer ad networks
 */

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

        if (!adISS) return;

        // Wait for ImmoderateScarSheer to load
        setTimeout(() => {
            const hasISSAd = adISS.querySelector('iframe') ||
                adISS.querySelector('img') ||
                adISS.querySelector('[id^="container-"]')?.children.length > 0;

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
    }
};

export default Ads;
