import React from 'react';
import { Logo } from './Logo';
import { Twitter, Linkedin, Github, Instagram, Mail, Phone, MapPin, Sparkles, Youtube, Facebook } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { language, t, isRtl } = useLanguage();
  const { settings, services } = useData();

  const quickLinks = [
    { name: isRtl ? 'الرئيسية' : 'Home', href: '#home' },
    { name: isRtl ? 'خدماتنا' : 'Services Overview', href: '#services' },
    { name: isRtl ? 'لماذا نحن' : 'Why Partner Us', href: '#why-us' },
    { name: isRtl ? 'أعمالنا' : 'Case Studies', href: '#portfolio' },
    { name: isRtl ? 'شركاء النجاح' : 'Success Partners', href: '#clients' }
  ];

  const activeServices = services.filter(s => s.status === 'active');
  const servicesLinks = activeServices.length > 0
    ? activeServices.map(s => ({
        name: language === 'ar' ? s.nameAr : s.nameEn,
        href: '#services'
      }))
    : t.services.map(s => ({
        name: s.title,
        href: '#services'
      }));

  const socialIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    twitter: Twitter,
    linkedin: Linkedin,
    github: Github,
    instagram: Instagram,
    youtube: Youtube,
    facebook: Facebook
  };

  const socialLinks = settings.socials.map(s => ({
    icon: socialIconMap[s.platform] || Twitter,
    href: s.url,
    name: s.platform
  }));

  const handleFooterLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string, isRoute?: boolean) => {
    e.preventDefault();
    if (isRoute || href === '#admin-login') {
      window.location.hash = href;
      return;
    }
    const targetElement = document.querySelector(href);
    if (targetElement) {
      const navHeight = 80;
      const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  };

  const aboutText = language === 'ar' ? settings.aboutCompanyAr : settings.aboutCompanyEn;
  const addressText = language === 'ar' ? settings.companyAddressAr : settings.companyAddressEn;

  return (
    <footer className="bg-white/95 backdrop-blur-xl text-slate-700 pt-16 pb-8 relative overflow-hidden">
      {/* Light subtle ambient glow accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#5683FC]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#2EDFF2]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Grid content */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 ${isRtl ? 'direction-rtl text-right' : 'text-left'}`}>
          
          {/* Col 1: Socials & Brand */}
          <div className={`lg:col-span-4 space-y-6 ${isRtl ? 'text-right' : 'text-left'}`}>
            <Logo 
              variant="light"
              className="h-16 sm:h-20 md:h-24" 
              imgClassName="h-16 sm:h-20 md:h-24 w-auto object-contain transition-all duration-300 drop-shadow-sm"
            />
            <p className="text-xs text-slate-600 font-normal leading-relaxed max-w-sm">
              {aboutText || t.footerAbout}
            </p>
            {/* Socials */}
            <div className={`flex items-center gap-3 ${isRtl ? 'justify-start flex-row-reverse' : ''}`}>
              {socialLinks.map((social, idx) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={idx}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={social.name}
                    className="p-2 rounded-xl bg-white hover:bg-[#F20530] text-slate-600 hover:text-white border border-slate-200/80 transition-all shadow-2xs cursor-pointer duration-300"
                  >
                    <IconComponent className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Col 2: Services links */}
          <div className={`lg:col-span-3 ${isRtl ? 'text-right' : 'text-left'}`}>
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#0F172A] mb-4">{t.footerCapabilities}</h4>
            <ul className="space-y-2.5">
              {servicesLinks.map((link, idx) => (
                <li key={idx}>
                  <a
                    href={link.href}
                    onClick={(e) => handleFooterLinkClick(e, link.href)}
                    className="text-xs text-slate-600 hover:text-[#F20530] transition-colors duration-200 font-medium"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Quick links */}
          <div className={`lg:col-span-2 ${isRtl ? 'text-right' : 'text-left'}`}>
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#0F172A] mb-4">{t.footerQuickLinks}</h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    onClick={(e) => handleFooterLinkClick(e, link.href)}
                    className="text-xs text-slate-600 hover:text-[#F20530] transition-colors duration-200 font-medium"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Contact details */}
          <div className={`lg:col-span-3 space-y-4 ${isRtl ? 'text-right' : 'text-left'}`}>
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#0F172A] mb-4">{t.footerContact}</h4>
            <div className="space-y-3.5 text-xs text-slate-700">
              <div 
                className={`flex items-start gap-2.5 ${isRtl ? 'flex-row-reverse' : ''}`}
              >
                <MapPin className="w-4 h-4 text-[#5683FC] shrink-0 mt-0.5" />
                <span className="text-slate-600 font-medium">{addressText || t.footerAddress}</span>
              </div>
              <div className={`flex items-center gap-2.5 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <Mail className="w-4 h-4 text-[#5683FC] shrink-0" />
                <a href={`mailto:${settings.companyEmail}`} className="hover:text-[#F20530] transition-colors font-medium">
                  {settings.companyEmail || 'info@mastrlink.com'}
                </a>
              </div>
              <div className={`flex items-center gap-2.5 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <Phone className="w-4 h-4 text-[#5683FC] shrink-0" />
                <a href={`tel:${settings.companyPhone.split('-')[0].trim()}`} className="hover:text-[#F20530] transition-colors font-medium">
                  {settings.companyPhone || '771039883 - 543059985'}
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom copyright row */}
        <div className={`pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center text-center text-xs text-slate-500`}>
          <div className="flex items-center gap-1.5 font-normal">
            <span>© {isRtl ? (currentYear).toLocaleString('ar-EG') : currentYear} {language === 'ar' ? settings.companyNameAr : settings.companyNameEn}. {t.footerRights}</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
