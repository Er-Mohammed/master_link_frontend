import React from 'react';
import { useData } from '../context/DataContext';
import logoWhite from '../assets/masterlink-logo-white.svg';
import logoDark from '../assets/masterlink-logo.svg';

interface LogoProps {
  variant?: 'header' | 'footer' | 'light' | 'white';
  className?: string;
  imgClassName?: string;
  span1Style?: React.CSSProperties;
  span2Style?: React.CSSProperties;
}

export function Logo({ 
  variant = 'header',
  className = "",
  imgClassName = ""
}: LogoProps) {
  const { settings } = useData();

  // If a custom company logo is uploaded in dashboard settings, use it. Otherwise use the primary official logo asset.
  const customLogo = settings?.siteLogo || settings?.companyLogo;
  const isLight = variant === 'light';
  
  // Use Vite imported asset as primary source, with direct fallback
  const defaultAsset = isLight ? logoDark : logoWhite;
  const logoSrc = (customLogo && customLogo.trim() !== '') ? customLogo : defaultAsset;

  return (
    <div 
      className={`inline-flex items-center justify-center shrink-0 select-none notranslate ${className}`}
      dir="ltr"
      translate="no"
    >
      <img 
        src={logoSrc} 
        alt={settings?.siteName || settings?.companyNameEn || "Master Link"} 
        className={`max-h-full max-w-full w-auto object-contain transition-all duration-300 drop-shadow-sm ${imgClassName}`}
        loading="eager"
        decoding="async"
        onError={(e) => {
          // Fallback if dynamic URL fails to resolve
          const target = e.target as HTMLImageElement;
          const fallback = isLight ? logoDark : logoWhite;
          if (target.src !== fallback) {
            target.src = fallback;
          }
        }}
      />
    </div>
  );
}
