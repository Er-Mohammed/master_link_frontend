import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { DEFAULT_CLIENT_LOGOS } from '../data';
import { ClientLogo } from '../types';
import { ShieldCheck, Sparkles, ArrowUpRight, ArrowUpLeft, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LogoCardProps {
  key?: string;
  logo: ClientLogo;
  index: number;
  isRtl: boolean;
  mediaItems: any[];
}

function LogoCard({ logo, index, isRtl, mediaItems }: LogoCardProps) {
  const [imgError, setImgError] = useState(false);

  // Resolve image URL from logo.media, mediaItems, or direct media_id
  const matchedMedia = (mediaItems || []).find((m: any) => m.id === logo.media_id || m.id === logo.media?.id);
  const rawImage = logo.media?.file_path || matchedMedia?.url || (typeof logo.media_id === 'string' && (logo.media_id.startsWith('http') || logo.media_id.startsWith('data:') || logo.media_id.startsWith('/')) ? logo.media_id : null);
  
  const logoImage = typeof rawImage === 'string' ? rawImage : null;

  React.useEffect(() => {
    setImgError(false);
  }, [logoImage]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{ y: -4 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.05,
        ease: [0.16, 1, 0.3, 1]
      }}
      className="group relative flex flex-row items-center gap-2 sm:gap-2.5 p-3.5 sm:p-4 cursor-pointer transition-all duration-500 ease-out rounded-2xl bg-transparent hover:bg-transparent"
    >
      {/* Logo Container with Soft Ambient Aura Glow */}
      <div className="relative w-36 h-24 sm:w-44 sm:h-30 shrink-0 flex items-center justify-center overflow-visible">
        {/* Soft Radial Ambient Aura on Hover */}
        <div className="absolute inset-0 rounded-full bg-radial from-[#5683FC]/25 via-[#F20530]/10 to-transparent blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none scale-150" />

        {logoImage && !imgError ? (
          <img
            src={logoImage}
            alt={logo.company_name}
            className="relative z-10 object-contain object-center w-full h-full scale-140 sm:scale-150 group-hover:scale-160 opacity-95 group-hover:opacity-100 transition-all duration-500 ease-out filter drop-shadow-sm group-hover:drop-shadow-lg rounded-xl"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="relative z-10 w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 p-0.5 shadow-md group-hover:shadow-lg transition-all duration-500 ease-out group-hover:scale-115 flex items-center justify-center">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex flex-col items-center justify-center p-2 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#5683FC]/25 via-[#F20530]/15 to-transparent opacity-80" />
              <span className="relative z-10 text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#5683FC] via-white to-[#2EDFF2]">
                {logo.company_name.substring(0, 2).toUpperCase()}
              </span>
              <span className="relative z-10 text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-full mt-1">
                {logo.company_name.split(' ')[0]}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Company Name & Interactive Link - Full Name Displayed Cleanly */}
      <div className="flex flex-col items-start text-start gap-1 min-w-0 flex-1 opacity-90 group-hover:opacity-100 transition-all duration-300 ease-out z-10">
        <span className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#5683FC] transition-colors duration-300 leading-snug tracking-tight whitespace-normal break-words">
          {logo.company_name}
        </span>

        {logo.website_url && (
          <a
            href={logo.website_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="group/link inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-slate-500 hover:text-[#5683FC] transition-colors duration-300 mt-0.5"
            title={logo.website_url}
          >
            <span className="relative">
              {isRtl ? 'زيارة الموقع' : 'Visit Website'}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#5683FC] group-hover/link:w-full transition-all duration-300" />
            </span>
            {isRtl ? (
              <ArrowUpLeft className="w-3 h-3 transform transition-transform duration-300 group-hover/link:-translate-x-0.5 group-hover/link:-translate-y-0.5 text-[#5683FC]" />
            ) : (
              <ArrowUpRight className="w-3 h-3 transform transition-transform duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 text-[#5683FC]" />
            )}
          </a>
        )}
      </div>
    </motion.div>
  );
}

export function ClientLogosSection() {
  const { isRtl } = useLanguage();
  const { clientLogos, mediaItems } = useData();
  const [showAll, setShowAll] = useState(false);

  // Filter active, non-deleted logos and sort by sort_order
  const filteredLogos: ClientLogo[] = (clientLogos || [])
    .filter(logo => logo.is_active && !logo.deleted_at)
    .sort((a, b) => a.sort_order - b.sort_order);

  const activeLogos = filteredLogos.length > 0 ? filteredLogos : DEFAULT_CLIENT_LOGOS;

  // Show at least 4 logos initially
  const INITIAL_COUNT = 4;
  const visibleLogos = showAll ? activeLogos : activeLogos.slice(0, INITIAL_COUNT);
  const hasMore = activeLogos.length > INITIAL_COUNT;

  return (
    <section 
      id="clients" 
      className="py-16 md:py-24 bg-white relative overflow-hidden text-slate-900"
    >
      {/* Ambient background glows */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-[#5683FC]/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[450px] h-[450px] bg-[#F20530]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 space-y-3"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {isRtl ? 'نعتز بثقة كبرى المؤسسات والقطاعات الرائدة' : 'Empowering Industry Leaders & Global Enterprises'}
          </h2>
        </motion.div>

        {/* LOGO SHOWCASE GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 items-stretch justify-center">
          <AnimatePresence mode="popLayout">
            {visibleLogos.map((logo, index) => {
              const logoImage = logo.media?.file_path || logo.media_id;
              return (
                <LogoCard key={logo.id + '-' + logoImage} logo={logo} index={index} isRtl={isRtl} mediaItems={mediaItems || []} />
              );
            })}
          </AnimatePresence>
        </div>

        {/* Show More / Show Less Arrow Toggle Button */}
        {hasMore && (
          <div className="mt-10 sm:mt-12 text-center flex justify-center">
            <button
              onClick={() => setShowAll(!showAll)}
              className="group relative inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-slate-50 border border-slate-200 hover:border-[#5683FC]/40 hover:bg-white text-slate-800 hover:text-[#5683FC] text-sm font-bold shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer active:scale-95"
            >
              <span>
                {showAll 
                  ? (isRtl ? 'عرض أقل' : 'Show Less') 
                  : (isRtl ? 'عرض المزيد من الشركات' : 'Show More Partners')
                }
              </span>
              <ChevronDown className={`w-4 h-4 text-[#5683FC] transition-transform duration-300 ${showAll ? 'rotate-180' : 'group-hover:translate-y-0.5'}`} />
            </button>
          </div>
        )}

      </div>
    </section>
  );
}

