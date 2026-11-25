import React, { useEffect, useState } from 'react';
import { en } from '../locales/en';
import { ml } from '../locales/ml';
import { LanguageContext, type Language } from './hooks';

type TranslationNode = string | { readonly [key: string]: TranslationNode };

function resolveInitialLanguage(): Language {
  if (typeof localStorage === 'undefined') return 'en';
  const saved = localStorage.getItem('clearsky_lang');
  return saved === 'ml' ? 'ml' : 'en';
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(resolveInitialLanguage);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  const setLanguage = (lang: Language) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('clearsky_lang', lang);
    }
    setLanguageState(lang);
  };

  const translations: TranslationNode = language === 'ml' ? ml : en;

  const t = (path: string): string => {
    const keys = path.split('.');
    let current: TranslationNode = translations;
    for (const key of keys) {
      if (typeof current === 'object' && current !== null && key in current) {
        current = current[key];
      } else {
        return path;
      }
    }
    return typeof current === 'string' ? current : path;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
