import { useTheme } from '../../hooks/useTheme';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-2 focus:ring-offset-background-base dark:focus:ring-offset-background-base"
      style={{
        backgroundColor: theme === 'dark' ? 'rgba(94,106,210,0.3)' : 'rgba(0,0,0,0.1)',
      }}
      aria-label="Toggle theme"
    >
      <span
        className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ease-out"
        style={{
          left: theme === 'dark' ? 'calc(100% - 24px)' : '4px',
          transform: 'scale(1)',
        }}
      >
        {theme === 'dark' ? (
          // Moon icon
          <svg className="w-3 h-3 text-accent" fill="currentColor" viewBox="0 0 20 20" style={{ marginTop: '2px', marginLeft: '2px' }}>
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        ) : (
          // Sun icon
          <svg className="w-3 h-3 text-amber-500" fill="currentColor" viewBox="0 0 20 20" style={{ marginTop: '2px', marginLeft: '2px' }}>
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707zM12 10.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM10 18a1 1 0 100-2 1 1 0 000 2zm-9-8a1 1 0 011-1V9a1 1 0 10-2 0v1a1 1 0 011 1zm-3.293 8.707a1 1 0 011.414-1.414l.707-.707a1 1 0 00-1.414 1.414l-.707.707a1 1 0 01-1.414-1.414z" clipRule="evenodd" />
          </svg>
        )}
      </span>
    </button>
  );
}
