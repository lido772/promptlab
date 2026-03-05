import { useContext } from 'react';
import { RewardedContext } from '../contexts/AdsContext';

export default function RewardedModal() {
  const { isOpen, closeAd, claimAd, cancelAd } = useContext(RewardedContext);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background-deep/95 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="card bg-background-elevated p-8 max-w-lg w-full text-center relative shadow-card-hover">
        {/* Close Button */}
        <button
          onClick={cancelAd}
          className="absolute top-4 right-4 bg-surface text-foreground w-9 h-9 rounded-lg flex items-center justify-center hover:bg-surface-hover transition-all duration-200"
          aria-label="Close modal"
        >
          ✕
        </button>

        <h3 className="text-foreground text-xl font-semibold mb-2">💜 Your Optimization is Ready!</h3>
        <p className="text-foreground-muted text-sm mb-5">
          Would you like to view an ad to support free tools? (completely optional)
        </p>

        {/* Ad Container */}
        <div className="w-full aspect-video bg-background-base rounded-xl overflow-hidden mb-5 relative border border-border">
          {/* ImmoderateScarSheer Ad */}
          <div
            id="container-72243473abb5417a0f414d4950c80145"
            className="absolute inset-0 flex items-center justify-center bg-white"
          />

          {/* Fallback AdSense */}
          <ins
            className="adsbygoogle absolute inset-0"
            style={{ display: 'block' }}
            data-ad-client="ca-pub-5400335063218645"
            data-ad-slot="9302843472"
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>

        {/* Buttons */}
        <button
          onClick={claimAd}
          className="btn-primary w-full bg-orange-600 hover:bg-orange-700"
        >
          View ad to support 💜
        </button>

        <button
          onClick={cancelAd}
          className="btn-ghost w-auto mt-3"
        >
          Skip, continue now
        </button>

        <div className="mt-4 p-2.5 bg-accent/10 rounded-lg text-xs text-foreground-muted border-l-2 border-accent">
          💜 Ad revenue helps us provide free AI tools to everyone. Thank you for your support!
        </div>
      </div>
    </div>
  );
}
