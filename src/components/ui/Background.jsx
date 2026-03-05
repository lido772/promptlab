import { useEffect, useRef } from 'react';

export default function Background({ children }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Create noise pattern
    const createNoise = () => {
      const imageData = ctx.createImageData(canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const value = Math.random() * 255;
        data[i] = value;     // R
        data[i + 1] = value; // G
        data[i + 2] = value; // B
        data[i + 3] = 4;     // A (very subtle, ~1.5% opacity)
      }

      ctx.putImageData(imageData, 0, 0);
    };

    createNoise();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Layer 1: Base Gradient */}
      <div className="absolute inset-0 dark:bg-base-gradient bg-base-gradient-light" />

      {/* Layer 2: Noise Texture */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 opacity-[0.015]"
        style={{ mixBlendMode: 'overlay' }}
      />

      {/* Layer 3: Animated Gradient Blobs (Dark mode only) */}
      <div className="absolute inset-0 overflow-hidden dark:block hidden">
        {/* Primary blob - Top center */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[1400px] bg-accent opacity-[0.25] blur-[150px] animate-float rounded-full" />

        {/* Secondary blob - Left side */}
        <div className="absolute top-1/4 left-0 -translate-x-1/4 w-[600px] h-[800px] bg-purple-600 opacity-[0.15] blur-[120px] animate-float-delayed rounded-full" />

        {/* Tertiary blob - Right side */}
        <div className="absolute top-1/3 right-0 translate-x-1/4 w-[500px] h-[700px] bg-indigo-500 opacity-[0.12] blur-[100px] animate-float rounded-full" />

        {/* Bottom accent - Pulsing */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-[400px] h-[600px] bg-accent opacity-[0.10] blur-[100px] animate-glow-pulse rounded-full" />
      </div>

      {/* Layer 3: Light Mode Ambient Glow */}
      <div className="absolute inset-0 overflow-hidden block dark:hidden">
        {/* Top light */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[800px] bg-accent/10 opacity-[0.15] blur-[120px] animate-float rounded-full" />

        {/* Right light */}
        <div className="absolute top-1/4 right-0 translate-x-1/4 w-[400px] h-[600px] bg-amber-400/10 opacity-[0.1] blur-[100px] animate-float-delayed rounded-full" />
      </div>

      {/* Layer 4: Grid Overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
        }}
      />

      {/* Children content */}
      {children && <div className="relative z-10">{children}</div>}
    </div>
  );
}
