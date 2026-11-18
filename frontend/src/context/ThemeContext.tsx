import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'dark' | 'light' | 'contrast';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(
    (localStorage.getItem('clearsky_theme') as Theme) || 'dark'
  );

  useEffect(() => {
    document.body.classList.remove('theme-light', 'theme-contrast');
    if (theme === 'light') {
      document.body.classList.add('theme-light');
    } else if (theme === 'contrast') {
      document.body.classList.add('theme-contrast');
    }
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    localStorage.setItem('clearsky_theme', newTheme);
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

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
