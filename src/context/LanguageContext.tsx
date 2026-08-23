import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, TranslationDictionary } from '../translations';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  t: TranslationDictionary;
  isRtl: boolean;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('masterlink_lang') as Language;
    if (saved === 'en' || saved === 'ar') return saved;
    return 'ar';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('masterlink_lang', lang);
  };

  useEffect(() => {
    const dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
    
    // Add RTL class helper to body
    if (language === 'ar') {
      document.body.classList.add('rtl-active');
      document.body.classList.remove('ltr-active');
    } else {
      document.body.classList.add('ltr-active');
      document.body.classList.remove('rtl-active');
    }
  }, [language]);

  const value: LanguageContextType = {
    language,
    t: translations[language],
    isRtl: language === 'ar',
    setLanguage,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
