import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import logoWhite from '../assets/masterlink-logo-white.svg';
import logoDark from '../assets/masterlink-logo.svg';

interface LogoProps {
  variant?: 'header' | 'footer' | 'admin' | 'login' | 'light' | 'white';
  className?: string;
  imgClassName?: string;
  alt?: string;
}

export function resolveMediaUrl(url?: string | null): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // If already absolute URL or data URI
  if (/^(http|https|data):/i.test(trimmed)) {
    return trimmed;
  }

  // Handle relative server paths like /storage/... or storage/...
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
  const cleanBase = apiBase.replace(/\/+$/, '');
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;

  return `${cleanBase}${cleanPath}`;
}

export function Logo({ 
  variant = 'header',
  className = "",
  imgClassName = "",
  alt
}: LogoProps) {
  const { settings } = useData();

  // Priority: settings.siteLogo -> settings.companyLogo -> defaultAsset fallback (initial render fallback)
  const rawCustomLogo = settings?.siteLogo || settings?.companyLogo;
  const resolvedCustomLogo = resolveMediaUrl(rawCustomLogo);
  
  const isLight = variant === 'light' || variant === 'header' || variant === 'admin' || variant === 'login';
  const defaultAsset = isLight ? logoDark : logoWhite;

  const [imgSrc, setImgSrc] = useState<string>(resolvedCustomLogo || defaultAsset);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    const newSrc = resolveMediaUrl(settings?.siteLogo || settings?.companyLogo);
    if (newSrc) {
      setImgSrc(newSrc);
      setHasError(false);
    } else {
      setImgSrc(defaultAsset);
      setHasError(false);
    }
  }, [settings?.siteLogo, settings?.companyLogo, defaultAsset]);

  const handleImageError = () => {
    if (!hasError && imgSrc !== defaultAsset) {
      setHasError(true);
      setImgSrc(defaultAsset);
    }
  };

  let sizeClasses = "h-10 sm:h-12 md:h-13"; // Public Header container
  if (variant === 'footer') {
    sizeClasses = "h-20 sm:h-24 md:h-28"; // Public Footer container
  } else if (variant === 'login') {
    sizeClasses = "h-20 sm:h-24 md:h-28"; // Login card logo container
  } else if (variant === 'admin') {
    sizeClasses = "h-11 sm:h-12"; // Admin Header / Sidebar container
  }

  const siteName = alt || settings?.siteName || settings?.companyNameEn || "Master Link";

  return (
    <div 
      className={`inline-flex items-center justify-center shrink-0 select-none notranslate ${sizeClasses} ${className}`}
      dir="ltr"
      translate="no"
    >
      <img
        src={imgSrc}
        alt={siteName}
        className={`h-full w-auto max-h-full max-w-full object-contain transition-all duration-300 drop-shadow-sm ${imgClassName}`}
        loading="eager"
        fetchPriority="high"
        decoding="async"
        onError={handleImageError}
      />
    </div>
  );
}
