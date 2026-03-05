import { useState, useRef, useEffect } from 'react';

export default function Spotlight({ children, className = '' }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    };

    container.addEventListener('mousemove', handleMouseMove);
    return () => container.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Spotlight Effect */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 pointer-events-none"
        style={{
          opacity: isHovered ? 0.15 : 0,
          background: `radial-gradient(
            300px circle at ${mousePosition.x}px ${mousePosition.y}px,
            rgba(94, 106, 210, 0.3),
            transparent 40%
          )`,
        }}
      />

      {/* Content */}
      {children}
    </div>
  );
}
