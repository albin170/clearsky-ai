import React, { useEffect, useState } from 'react';
import { ThemeContext, type Theme } from './hooks';

function resolveInitialTheme(): Theme {
  if (typeof localStorage === 'undefined') return 'dark';
  const saved = localStorage.getItem('clearsky_theme');
  if (saved === 'light' || saved === 'contrast' || saved === 'dark') {
    return saved;
  }
  return 'dark';
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(resolveInitialTheme);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.classList.remove('theme-light', 'theme-contrast');
    if (theme === 'light') {
      document.body.classList.add('theme-light');
    } else if (theme === 'contrast') {
      document.body.classList.add('theme-contrast');
    }
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('clearsky_theme', newTheme);
    }
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    if (theme === 'dark') setTheme('light');
    else if (theme === 'light') setTheme('contrast');
    else setTheme('dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
