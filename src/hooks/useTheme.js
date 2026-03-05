import { useState, useEffect } from 'react';

let themeState = {
  theme: 'dark',
  listeners: new Set(),
};

// Initialize theme from localStorage
if (typeof window !== 'undefined') {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    themeState.theme = savedTheme;
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    themeState.theme = 'dark';
  }
}

export function useTheme() {
  const [, forceUpdate] = useState({});

  useEffect(() => {
    // Set initial class
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', themeState.theme === 'dark');
    }

    // Listen for theme changes
    const listener = () => {
      forceUpdate({});
    };
    themeState.listeners.add(listener);

    return () => {
      themeState.listeners.delete(listener);
    };
  }, []);

  const toggleTheme = () => {
    themeState.theme = themeState.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', themeState.theme);
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', themeState.theme === 'dark');
    }
    // Notify all listeners
    themeState.listeners.forEach(listener => listener());
  };

  return {
    theme: themeState.theme,
    toggleTheme,
  };
}
