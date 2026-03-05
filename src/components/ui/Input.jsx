import { forwardRef } from 'react';

export default forwardRef(function Input(
  { className = '', error = false, ...props },
  ref
) {
  const baseClasses = 'w-full px-4 py-3 bg-background-elevated border text-foreground placeholder-foreground-subtle rounded-lg transition-all duration-200 focus:outline-none';

  const stateClasses = error
    ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
    : 'border-border focus:border-accent focus:ring-2 focus:ring-accent-glow';

  return (
    <input
      ref={ref}
      className={`${baseClasses} ${stateClasses} ${className}`}
      {...props}
    />
  );
});
