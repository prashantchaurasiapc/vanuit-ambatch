import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import clsx from 'clsx';
import { useLanguage } from '../context/LanguageContext';

export const LanguageSwitcher = () => {
    const { i18n } = useTranslation();
    const { language, setLanguage } = useLanguage();

    const [currentLang, setCurrentLang] = useState(() => {
        const stored = localStorage.getItem('app_language');
        if (stored) return stored.toLowerCase();
        return (language || 'en').toLowerCase();
    });

    useEffect(() => {
        if (language) {
            setCurrentLang(language.toLowerCase());
        }
    }, [language]);

    const handleLanguageChange = (lang) => {
        const upperLang = lang.toUpperCase();
        // 1. Update LanguageContext (triggers instantaneous 0ms React re-render)
        setLanguage(upperLang);

        // 2. Update local state
        setCurrentLang(lang.toLowerCase());

        // 3. Persist to localStorage
        localStorage.setItem('app_language', upperLang);

        // 4. Sync i18next
        i18n.changeLanguage(lang.toLowerCase());
    };

    return (
        <div className="flex items-center bg-[#F8F7F4] border border-[#D6CFC2] rounded-lg p-0.5 h-8 shadow-xs">
            <div className="pl-2 pr-1 text-primary flex items-center">
                <Globe className="w-3.5 h-3.5" />
            </div>
            <button
                type="button"
                onClick={() => handleLanguageChange('en')}
                className={clsx(
                    "px-2.5 h-full text-[11px] font-bold rounded-md transition-all uppercase tracking-wider font-mono cursor-pointer",
                    currentLang === 'en'
                        ? "bg-primary text-cream shadow-xs"
                        : "text-dark/60 hover:text-dark hover:bg-[#EAE4D9]/40"
                )}
            >
                EN
            </button>
            <button
                type="button"
                onClick={() => handleLanguageChange('nl')}
                className={clsx(
                    "px-2.5 h-full text-[11px] font-bold rounded-md transition-all uppercase tracking-wider font-mono cursor-pointer",
                    currentLang === 'nl'
                        ? "bg-primary text-cream shadow-xs"
                        : "text-dark/60 hover:text-dark hover:bg-[#EAE4D9]/40"
                )}
            >
                NL
            </button>
        </div>
    );
};

export default LanguageSwitcher;
