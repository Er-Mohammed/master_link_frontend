import React, { useEffect, useState, Suspense } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { useLanguage } from '../../context/LanguageContext';
import { Sparkles, Globe, Orbit, Check } from 'lucide-react';

const Spline = React.lazy(() => import('@splinetool/react-spline'));

interface CosmicParallaxBgProps {
  /**
   * Main heading text (displayed large in the center)
   */
  head: string;
  
  /**
   * Subtitle text (displayed below the heading)
   * Comma-separated string that will be split into animated parts
   */
  text: string;
  
  /**
   * Whether the text animations should loop
   * @default true
   */
  loop?: boolean;
  
  /**
   * Whether to hide the built-in title/subtitle to use it purely as a background
   * @default false
   */
  hideText?: boolean;
  
  /**
   * Custom class name for additional styling
   */
  className?: string;

  /**
   * Optional action elements to place under the subtitle
   */
  children?: React.ReactNode;
}

type BackgroundPattern = 'spline' | 'cosmic' | 'hybrid';

/**
 * A cosmic parallax background component that supports multiple patterns:
 * 1. Spline 3D Scene (interactive 3D particle landscape)
 * 2. Cosmic Space Stars (classic animated star field with Earth and horizon glow)
 * 3. Hybrid Cyber Mode (stars parallax + active 3D particle landscape)
 */
const CosmicParallaxBg: React.FC<CosmicParallaxBgProps> = ({
  head,
  text,
  loop = true,
  hideText = false,
  className = '',
  children,
}) => {
  const { isRtl } = useLanguage();
  const [pattern, setPattern] = useState<BackgroundPattern>('cosmic');
  const [smallStars, setSmallStars] = useState<string>('');
  const [mediumStars, setMediumStars] = useState<string>('');
  const [bigStars, setBigStars] = useState<string>('');
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [showPatternMenu, setShowPatternMenu] = useState(false);
  
  const { scrollY } = useScroll();

  // Scroll-linked transformations for the centerpiece text
  const titleY = useTransform(scrollY, [0, 500], [0, -120]);
  const titleOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const titleScale = useTransform(scrollY, [0, 500], [1, 0.85]);
  
  const subtitleY = useTransform(scrollY, [0, 400], [0, -60]);
  const subtitleOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const subtitleScale = useTransform(scrollY, [0, 400], [1, 0.9]);

  // Split the text by commas and trim whitespace
  const textParts = text.split(',').map(part => part.trim());
  
  // Generate random star positions
  const generateStarBoxShadow = (count: number): string => {
    let shadows = [];
    
    for (let i = 0; i < count; i++) {
      const x = Math.floor(Math.random() * 2000);
      const y = Math.floor(Math.random() * 2000);
      shadows.push(`${x}px ${y}px #FFF`);
    }
    
    return shadows.join(', ');
  };
  
  useEffect(() => {
    // Generate star shadows when component mounts
    setSmallStars(generateStarBoxShadow(700));
    setMediumStars(generateStarBoxShadow(200));
    setBigStars(generateStarBoxShadow(100));
    
    // Set animation iteration based on loop prop
    document.documentElement.style.setProperty(
      '--animation-iteration', 
      loop ? 'infinite' : '1'
    );

    // Track mouse movement for reactive parallax effect and cursor light tracker
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const x = (clientX - window.innerWidth / 2) / 30;
      const y = (clientY - window.innerHeight / 2) / 30;
      setMouseOffset({ x, y });
      setMousePos({ x: clientX, y: clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [loop]);

  const patterns = [
    {
      id: 'spline' as BackgroundPattern,
      nameEn: 'Spline 3D Scene',
      nameAr: 'ثلاثي الأبعاد Spline',
      icon: Orbit,
      descEn: 'Interactive 3D particle web landscape',
      descAr: 'مجسم شبكي جسيمي تفاعلي ثلاثي الأبعاد',
    },
    {
      id: 'cosmic' as BackgroundPattern,
      nameEn: 'Cosmic Starfield',
      nameAr: 'الفضاء والنجوم الكونية',
      icon: Sparkles,
      descEn: 'Parallax star layers & horizon earth glow',
      descAr: 'طبقات نجوم متحركة مع توهج كوكب الأرض والمعدل',
    },
    {
      id: 'hybrid' as BackgroundPattern,
      nameEn: 'Hybrid Cyber Mode',
      nameAr: 'النمط المدمج الفاخر',
      icon: Globe,
      descEn: 'Spline 3D combined with animated stars',
      descAr: 'دمج المجسم ثلاثي الأبعاد مع النجوم المتحركة',
    }
  ];
  
  return (
    <div className={`cosmic-parallax-container ${className}`}>
      
      {/* BACKGROUND PATTERN: SPLINE 3D SCENE */}
      {(pattern === 'spline' || pattern === 'hybrid') && (
        <div className="absolute inset-0 z-0" style={{ filter: 'hue-rotate(240deg) saturate(1.4) brightness(1.1)' }}>
          <Suspense fallback={<div className="absolute inset-0 bg-[#030712] animate-pulse" />}>
            <Spline 
              scene="https://prod.spline.design/Slk6b8kz3LRlKiyk/scene.splinecode" 
              className="w-full h-full"
            />
          </Suspense>
          {/* Subtle overlay to enhance contrast over the 3D Spline scene */}
          <div className="absolute inset-0 bg-black/35 z-[1] pointer-events-none" />
        </div>
      )}

      {/* BACKGROUND PATTERN: COSMIC STARFIELD / HYBRID STARS */}
      {(pattern === 'cosmic' || pattern === 'hybrid') && (
        <>
          {/* Stars layer 1 (Small) with mouse parallax */}
          <div 
            style={{ 
              transform: `translate(${mouseOffset.x * 0.3}px, ${mouseOffset.y * 0.3}px)`,
              transition: 'transform 0.15s ease-out'
            }}
            className="absolute inset-0 pointer-events-none z-[1]"
            dir="ltr"
          >
            <div 
              id="stars" 
              style={{ boxShadow: smallStars }}
              className="cosmic-stars"
            ></div>
          </div>

          {/* Stars layer 2 (Medium) with mouse parallax */}
          <div 
            style={{ 
              transform: `translate(${mouseOffset.x * 0.6}px, ${mouseOffset.y * 0.6}px)`,
              transition: 'transform 0.15s ease-out'
            }}
            className="absolute inset-0 pointer-events-none z-[1]"
            dir="ltr"
          >
            <div 
              id="stars2" 
              style={{ boxShadow: mediumStars }}
              className="cosmic-stars-medium"
            ></div>
          </div>

          {/* Stars layer 3 (Large) with mouse parallax */}
          <div 
            style={{ 
              transform: `translate(${mouseOffset.x * 1.2}px, ${mouseOffset.y * 1.2}px)`,
              transition: 'transform 0.15s ease-out'
            }}
            className="absolute inset-0 pointer-events-none z-[1]"
            dir="ltr"
          >
            <div 
              id="stars3" 
              style={{ boxShadow: bigStars }}
              className="cosmic-stars-large"
            ></div>
          </div>
          
          {/* Horizon and Earth layers with slow parallax movement */}
          <div 
            style={{ 
              transform: `translate(${mouseOffset.x * 0.1}px, ${mouseOffset.y * 0.05}px)`,
              transition: 'transform 0.25s ease-out'
            }}
            className="absolute inset-0 pointer-events-none z-[2]"
            dir="ltr"
          >
            <div id="horizon">
              <div className="glow"></div>
            </div>
            <div id="earth"></div>
          </div>
        </>
      )}


      
      {/* Centerpiece title & subtitle */}
      {!hideText && (
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto space-y-12">
          <div>
            <motion.div 
              id="title"
              style={{ 
                y: titleY,
                opacity: titleOpacity,
                scale: titleScale,
                animation: 'none' // Override the automatic CSS loop animation
              }}
            >
              {head.toUpperCase()}
            </motion.div>
            
            <motion.div 
              id="subtitle" 
              className="mt-6"
              style={{
                y: subtitleY,
                opacity: subtitleOpacity,
                scale: subtitleScale
              }}
            >
              {textParts.map((part, index) => (
                <span 
                  key={index} 
                  className={`subtitle-part-${index + 1} mx-2 inline-block`}
                  style={{ animation: 'none' }} // Override the automatic CSS loop animation
                >
                  {part.toUpperCase()}
                </span>
              ))}
            </motion.div>
          </div>
          
          {children && (
            <div className="w-full flex justify-center items-center">
              {children}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export { CosmicParallaxBg };
