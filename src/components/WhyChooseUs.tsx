import React from 'react';
import { motion } from 'motion/react';
import { Users, Sparkles, Zap, ShieldCheck, Activity, Award, Cpu, Layers, MessageSquare, Sliders, Target } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'tech-tools': Cpu,
  'full-experience': Layers,
  'communication': MessageSquare,
  'customization': Sliders,
  'quality': ShieldCheck,
  'vision-mission': Target,
  'expert-team': Users,
  'innovative-solutions': Sparkles,
  'fast-delivery': Zap,
  'high-quality': ShieldCheck,
  'ongoing-support': Activity,
  'proven-results': Award,
};

export function WhyChooseUs() {
  const { t, isRtl } = useLanguage();

  return (
    <section id="why-us" className="py-20 md:py-28 bg-[#F8FAFC] relative overflow-hidden text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Block */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className={`max-w-3xl mb-12 md:mb-16 ${isRtl ? 'text-right' : 'text-left'}`}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#111827] tracking-tight leading-tight">
            {t.whyUsTitle}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#6B7280] max-w-2xl font-normal leading-relaxed">
            {t.whyUsSubtitle}
          </p>
        </motion.div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {t.advantages.map((adv, index) => {
            const IconComponent = iconMap[adv.id] || Award;
            
            // Highlight specific cards (e.g., 1st and 4th) to create visual rhythm like a bento grid
            const isHighlighted = index === 0 || index === 4;

            return (
              <motion.div
                key={adv.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
                className={`group relative rounded-2xl border p-6 md:p-8 transition-all duration-300 hover:-translate-y-1.5 ${isRtl ? 'text-right' : 'text-left'} ${
                  isHighlighted
                    ? 'border-[#5683FC]/30 bg-gradient-to-br from-[#5683FC]/10 via-white to-slate-50 text-slate-900 shadow-xl shadow-[#5683FC]/10'
                    : 'border-[#E5E7EB] bg-white text-[#111827] hover:border-[#5683FC]/40 hover:shadow-xl hover:shadow-[#5683FC]/10'
                }`}
              >
                {/* Decorative background glow for highlighted items */}
                {isHighlighted && (
                  <div className="absolute inset-[-10px] bg-gradient-to-tr from-[#F20530]/10 to-[#5683FC]/10 rounded-3xl opacity-50 blur-xl pointer-events-none" />
                )}

                {/* Card Icon */}
                <div className={`inline-flex p-3 rounded-xl border mb-6 transition-all duration-300 ${
                  isHighlighted
                    ? 'bg-white border-[#5683FC]/40 text-[#5683FC] group-hover:scale-110 group-hover:bg-[#F20530] group-hover:text-white'
                    : 'bg-[#F5F9FF] border-[#E5E7EB] text-[#5683FC] group-hover:bg-[#F20530] group-hover:text-white group-hover:border-transparent group-hover:scale-110'
                }`}>
                  <IconComponent className="w-5.5 h-5.5" />
                </div>

                {/* Title */}
                <h3 className={`text-base font-bold tracking-tight mb-3 ${
                  isHighlighted ? 'text-slate-900' : 'text-[#111827]'
                }`}>
                  {adv.title}
                </h3>

                {/* Description */}
                <p className={`text-xs sm:text-sm leading-relaxed font-normal ${
                  isHighlighted ? 'text-slate-600' : 'text-[#6B7280]'
                }`}>
                  {adv.description}
                </p>

                {/* Subtle outline highlight hover effect */}
                <div className={`absolute bottom-4 ${isRtl ? 'left-4' : 'right-4'} text-[10px] font-mono font-bold select-none opacity-0 group-hover:opacity-40 transition-opacity ${
                  isHighlighted ? 'text-[#2EDFF2]' : 'text-[#F20530]'
                }`}>
                  {t.whyUsTag} // {isRtl ? (index + 1).toLocaleString('ar-EG') : index + 1}
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
