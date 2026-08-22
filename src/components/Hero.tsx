import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { TechHeroBackground } from './ui/tech-hero-background';

interface HeroProps {
  onOpenConsultation: () => void;
}

export function Hero({ onOpenConsultation }: HeroProps) {
  const { t, isRtl } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);

  // Hook into the page scroll progress for interactive feedback
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Calculate dynamic opacity fade out as the user scrolls down
  const opacityIndicator = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  return (
    <div 
      ref={containerRef}
      id="home" 
      className="relative min-h-screen bg-[#060913] text-white flex flex-col justify-center items-center overflow-hidden"
    >
      {/* 1. Modern Interactive Cyber Mesh Background with Node Matrix */}
      <TechHeroBackground 
        head="Master Link" 
        text={isRtl ? "تصميم • تطوير • ريادة" : "Design • Develop • Deliver"} 
        className="w-full min-h-screen flex flex-col justify-center items-center pt-24 pb-16"
      >
        {/* 2. Sleek Modern Hero container */}
        <div className="relative z-20" />
      </TechHeroBackground>

      {/* 3. Scroll Down Hint */}
      <motion.div 
        style={{ opacity: opacityIndicator }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 cursor-pointer group"
        onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
      >
        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 group-hover:text-[#2EDFF2] transition-colors">
          {isRtl ? 'اسحب للأسفل' : 'Scroll Down'}
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
        >
          <ChevronDown className="w-5 h-5 text-[#F20530] group-hover:text-[#2EDFF2] transition-colors" />
        </motion.div>
      </motion.div>
    </div>
  );
}

