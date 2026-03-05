export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  ...props
}) {
  const baseClasses = 'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 ease-expo-out active:scale-[0.98]';

  const variants = {
    primary: 'bg-accent text-white shadow-glow hover:bg-accent-bright hover:shadow-glow-lg',
    secondary: 'bg-surface text-foreground shadow-inner-light hover:bg-surface-hover hover:-translate-y-0.5',
    ghost: 'text-foreground-muted hover:text-foreground hover:bg-surface',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '';

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${disabledClasses} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
