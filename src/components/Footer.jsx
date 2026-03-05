import { useEffect } from 'react';

export default function Footer() {
  useEffect(() => {
    // Initialize Instant-Gaming affiliate banner
    if (typeof window !== 'undefined') {
      window.igBannerConfig = {
        lang: 'en',
        igr: 'gamer-244970',
        banners: ['my-banner']
      };

      // Load Instant-Gaming script if not already loaded
      if (!document.querySelector('#ad-instant-gaming-loader')) {
        const script = document.createElement('script');
        script.id = 'ad-instant-gaming-loader';
        script.src = 'https://www.instant-gaming.com/api/banner/partner/loader.js';
        script.defer = true;
        document.head.appendChild(script);
      }

      // Initialize AdSense ads
      if (window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    }
  }, []);

  return (
    <footer className="text-center py-10 px-5 border-t border-border text-foreground-muted text-sm">
      <p>Made for AI enthusiasts by PromptUp. No credit card required to test now.</p>
      <p className="text-xs text-foreground-subtle mt-2.5 max-w-xl mx-auto">
        This site contains affiliate links and ads. We may earn a commission at no extra cost to you.
        Your data is analyzed locally and never stored.
      </p>

      {/* Footer Ad */}
      <div className="ad-banner mt-5" aria-label="Advertisement">
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-5400335063218645"
          data-ad-slot="3926365469"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </footer>
  );
}
