import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';
import { Menu, X, Globe, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';

interface NavigationProps {
  onOpenConsultation: () => void;
}

export function Navigation({ onOpenConsultation }: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('#home');
  const { language, t, isRtl, setLanguage } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      // Detect active section
      const sections = ['#home', '#services', '#why-us', '#portfolio', '#process', '#testimonials', '#clients'];
      const scrollPos = window.scrollY + 120;

      for (const section of sections) {
        const el = document.querySelector(section);
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY;
          const height = el.getBoundingClientRect().height;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks: { name: string; href: string; isRoute?: boolean }[] = [
    { name: t.navHome, href: '#home' },
    { name: t.navServices, href: '#services' },
    { name: t.navWhyUs, href: '#why-us' },
    { name: t.navPortfolio, href: '#portfolio' },
    { name: isRtl ? 'شركاء النجاح' : 'Clients', href: '#clients' },
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string, isRoute?: boolean) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    if (isRoute || href === '#admin-login') {
      window.location.hash = href;
      return;
    }
    const targetElement = document.querySelector(href);
    if (targetElement) {
      const navHeight = 84;
      const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
      setActiveSection(href);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  return (
    <header
      id="navigation-header"
      className="fixed top-0 left-0 right-0 z-40 px-3 sm:px-6 lg:px-8 pt-3 sm:pt-4 pointer-events-none"
    >
      <div 
        className={`max-w-7xl mx-auto rounded-2xl sm:rounded-full pointer-events-auto transition-all duration-500 border shadow-lg backdrop-blur-2xl px-4 sm:px-6 py-1.5 grid grid-cols-2 md:grid-cols-3 items-center gap-2 ${
          isScrolled
            ? 'bg-white/95 border-slate-200/90 shadow-slate-900/10'
            : 'bg-white/85 border-white/70 shadow-slate-900/5'
        }`}
      >
        {/* 1. Left Grid Column: Brand Logo inside transparent normal div */}
        <div className="flex justify-start items-center">
          <a 
            href="#home" 
            onClick={(e) => handleLinkClick(e, '#home')} 
            className="group hover:opacity-95 transition-all flex items-center shrink-0 pl-1 sm:pl-2"
          >
            <div className="flex items-center justify-start h-10 sm:h-11 md:h-12 w-32 sm:w-36 md:w-44">
              <Logo 
                variant="light" 
                className="h-full w-auto justify-start"
                imgClassName="h-full w-auto object-contain transition-all duration-300 drop-shadow-sm scale-135 sm:scale-145 md:scale-150 origin-left group-hover:scale-[1.6]" 
              />
            </div>
          </a>
        </div>

        {/* 2. Center Grid Column: Centered Navigation Menu Pill */}
        <nav className="hidden md:flex items-center justify-center">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100/90 border border-slate-200/80 backdrop-blur-md shadow-inner shadow-slate-900/5">
            {navLinks.map((link) => {
              const isActive = activeSection === link.href;
              return (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href, link.isRoute)}
                  className={`relative px-4 py-2 rounded-full text-xs lg:text-sm font-extrabold transition-all duration-300 ${
                    isActive 
                      ? 'text-blue-600 bg-white shadow-sm shadow-slate-900/10' 
                      : 'text-slate-700 hover:text-blue-600 hover:bg-white/80'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNavTab"
                      className="absolute inset-0 rounded-full bg-white border border-slate-200/80 shadow-sm -z-10"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  <span className="tracking-wide select-none whitespace-nowrap">
                    {link.name}
                  </span>
                </a>
              );
            })}
          </div>
        </nav>

        {/* 3. Right Grid Column: Language Switcher & Controls */}
        <div className="flex justify-end items-center gap-3">
          {/* Desktop Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black text-slate-700 bg-slate-100 hover:bg-slate-200/80 border border-slate-200/80 hover:border-blue-300 transition-all duration-300 shadow-sm shadow-slate-900/5 cursor-pointer active:scale-[0.97]"
          >
            <Globe className="w-4 h-4 text-blue-600" />
            <span className="tracking-wider">{language === 'en' ? 'العربية' : 'English'}</span>
          </button>

          {/* Mobile Menu Toggle & Lang Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="p-2 rounded-xl text-slate-700 bg-slate-100 border border-slate-200 hover:bg-slate-200 transition-colors"
              aria-label="Toggle language"
            >
              <Globe className="w-4 h-4 text-blue-600" />
            </button>

            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 bg-slate-100 border border-slate-200 hover:bg-slate-200 transition-colors"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel (Clean White Frosted Glassmorphism with smooth radius) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            id="mobile-navigation-menu"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="max-w-7xl mx-auto mt-2 pointer-events-auto md:hidden bg-white/95 border border-slate-200/90 rounded-2xl backdrop-blur-2xl shadow-2xl overflow-hidden"
          >
            <div className="px-5 pt-4 pb-6 space-y-3">
              <div className="flex flex-col gap-1.5">
                {navLinks.map((link) => {
                  const isActive = activeSection === link.href;
                  return (
                    <a
                      key={link.name}
                      href={link.href}
                      onClick={(e) => handleLinkClick(e, link.href, link.isRoute)}
                      className={`px-4 py-3 rounded-xl text-sm font-extrabold transition-all ${
                        isActive
                          ? 'bg-blue-50 text-blue-600 border border-blue-200/80 font-black'
                          : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                      }`}
                    >
                      {link.name}
                    </a>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
                {/* Mobile Language switch */}
                <button
                  onClick={() => {
                    toggleLanguage();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-xs font-black text-slate-700 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-xl transition-all"
                >
                  <Globe className="w-4 h-4 text-blue-600" />
                  {language === 'en' ? 'تحويل للغة العربية' : 'Switch to English'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}


