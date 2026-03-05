import Spotlight from './Spotlight';

export default function Card({
  children,
  variant = 'default',
  className = '',
  interactive = false,
  ...props
}) {
  const baseClasses = 'relative rounded-2xl border bg-gradient-to-b from-surface to-surface/50 backdrop-blur-sm';

  const variants = {
    default: 'border-border',
    hover: 'border-border transition-all duration-300 ease-expo-out hover:border-border-hover hover:-translate-y-1 hover:bg-surface/60',
    glass: 'border-border/50 backdrop-blur-xl',
    accent: 'border-border-accent',
  };

  const shadowClasses = {
    default: 'shadow-card',
    hover: 'shadow-card hover:shadow-card-hover',
    glass: 'shadow-glass',
    accent: 'shadow-glow',
  };

  const cardContent = (
    <div className={`${baseClasses} ${variants[variant]} ${shadowClasses[variant]} ${className}`} {...props}>
      {children}
    </div>
  );

  if (interactive) {
    return (
      <Spotlight className="cursor-pointer">
        {cardContent}
      </Spotlight>
    );
  }

  return cardContent;
}
