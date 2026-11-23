import React, { useState } from 'react';
import { en } from '../locales/en';
import { ml } from '../locales/ml';
import { LanguageContext, type Language } from './hooks';

type TranslationTree = Record<string, unknown>;

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(
    () => (localStorage.getItem('clearsky_lang') as Language) || 'en',
  );

  const setLanguage = (lang: Language) => {
    localStorage.setItem('clearsky_lang', lang);
    setLanguageState(lang);
  };

  const translations: TranslationTree = (language === 'ml' ? ml : en) as unknown as TranslationTree;

  const t = (path: string): string => {
    const keys = path.split('.');
    let current: unknown = translations;
    for (const key of keys) {
      if (current && typeof current === 'object' && key in (current as TranslationTree)) {
        current = (current as TranslationTree)[key];
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
