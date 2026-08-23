import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { useLanguage } from '../../context/LanguageContext';
import { Sparkles } from 'lucide-react';

interface TechHeroBackgroundProps {
  head: string;
  text: string;
  className?: string;
  children?: React.ReactNode;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  pulse: number;
  pulseSpeed: number;
}

export const TechHeroBackground: React.FC<TechHeroBackgroundProps> = ({
  head,
  text,
  className = '',
  children,
}) => {
  const { isRtl } = useLanguage();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseCoordsRef = useRef<{ x: number | null; y: number | null }>({ x: null, y: null });

  const { scrollY } = useScroll();

  // Scroll parallax effects
  const contentY = useTransform(scrollY, [0, 500], [0, -60]);
  const contentOpacity = useTransform(scrollY, [0, 450], [1, 0.15]);

  // Handle cursor tracker with coordinate normalization
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const x = (clientX - window.innerWidth / 2) / 25;
      const y = (clientY - window.innerHeight / 2) / 25;
      setMousePos({ x, y });

      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        mouseCoordsRef.current = {
          x: clientX - rect.left,
          y: clientY - rect.top,
        };
      }
    };

    const handleMouseLeave = () => {
      mouseCoordsRef.current = { x: null, y: null };
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Canvas particle node animation (Tech Network Mesh with dynamic interconnected constellation)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Color palette aligned with Master Link visual identity
    const brandColors = ['#5683FC', '#2EDFF2', '#F20530', '#FFFFFF', '#8AB4F8'];

    // Generate tech network particles
    const particleCount = Math.min(Math.max(Math.floor((width * height) / 18000), 45), 90);
    const particles: Particle[] = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.75,
      vy: (Math.random() - 0.5) * 0.75,
      radius: Math.random() * 2.2 + 1.2,
      color: brandColors[Math.floor(Math.random() * brandColors.length)],
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.02 + Math.random() * 0.03,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const mouseX = mouseCoordsRef.current.x;
      const mouseY = mouseCoordsRef.current.y;
      const connectionDist = 135;
      const mouseConnectionDist = 175;

      // 1. Draw Connecting Lines between close particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDist) {
            const lineAlpha = (1 - dist / connectionDist) * 0.28;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = particles[i].color === '#F20530' || particles[j].color === '#F20530' 
              ? `rgba(242, 5, 48, ${lineAlpha})` 
              : `rgba(86, 131, 252, ${lineAlpha})`;
            ctx.lineWidth = 0.9;
            ctx.stroke();
          }
        }

        // 2. Connect to mouse pointer if active
        if (mouseX !== null && mouseY !== null) {
          const mdx = particles[i].x - mouseX;
          const mdy = particles[i].y - mouseY;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);

          if (mdist < mouseConnectionDist) {
            const mAlpha = (1 - mdist / mouseConnectionDist) * 0.55;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(mouseX, mouseY);
            ctx.strokeStyle = `rgba(46, 223, 242, ${mAlpha})`;
            ctx.lineWidth = 1.2;
            ctx.stroke();

            // Gentle interactive gravity drift towards cursor
            particles[i].x -= (mdx / mdist) * 0.35;
            particles[i].y -= (mdy / mdist) * 0.35;
          }
        }
      }

      // 3. Render Particles with Glowing Cores
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += p.pulseSpeed;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const currentAlpha = 0.45 + Math.sin(p.pulse) * 0.4;
        const currentRadius = p.radius * (0.85 + Math.sin(p.pulse) * 0.3);

        // Ambient outer glow
        ctx.save();
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(currentRadius, 1), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.min(Math.max(currentAlpha, 0.2), 0.95);
        ctx.fill();
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className={`relative w-full min-h-screen bg-[#060913] text-white overflow-hidden flex flex-col justify-center items-center ${className}`}>
      
      {/* 1. Geometric Cyber Mesh Grid Pattern */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-25"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(86, 131, 252, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(86, 131, 252, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: '3.5rem 3.5rem',
          maskImage: 'radial-gradient(ellipse 75% 65% at 50% 50%, black 30%, transparent 85%)',
          WebkitMaskImage: 'radial-gradient(ellipse 75% 65% at 50% 50%, black 30%, transparent 85%)'
        }}
      />

      {/* 2. Interactive High-Contrast Dynamic Particle Constellation Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0 pointer-events-none w-full h-full"
      />

      {/* 3. Visual Identity Ambient Aura Glow Orbs */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
        style={{
          transform: `translate(${mousePos.x * 0.6}px, ${mousePos.y * 0.6}px)`,
          transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Tech Blue Orb */}
        <div className="absolute top-[8%] left-[12%] w-[520px] h-[520px] bg-[#5683FC]/20 rounded-full blur-[140px]" />
        
        {/* Electric Crimson Red Orb */}
        <div className="absolute bottom-[12%] right-[8%] w-[550px] h-[550px] bg-[#F20530]/18 rounded-full blur-[150px]" />
        
        {/* Cyan Luminous Core Orb */}
        <div className="absolute top-[35%] right-[22%] w-[420px] h-[420px] bg-[#2EDFF2]/15 rounded-full blur-[130px]" />
      </div>

      {/* 4. Subtle Radial Vignette for Depth */}
      <div className="absolute inset-0 pointer-events-none bg-radial from-transparent via-[#060913]/40 to-[#060913]/90 z-0" />

      {/* 5. Centerpiece Main Content */}
      <motion.div 
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 pt-20 pb-12"
      >
        {/* Large Master Title */}
        <div className="space-y-3">
          <motion.h1 
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight text-white leading-none drop-shadow-2xl"
          >
            <span className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
              {head}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="text-lg sm:text-2xl md:text-3xl font-extrabold tracking-wider bg-gradient-to-r from-[#2EDFF2] via-[#5683FC] to-[#F20530] bg-clip-text text-transparent uppercase"
          >
            {text}
          </motion.p>
        </div>

        {/* Action Buttons passed as children */}
        {children && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="pt-2"
          >
            {children}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
