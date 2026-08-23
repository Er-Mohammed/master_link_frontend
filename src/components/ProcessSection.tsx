import React, { useState } from 'react';
import { HelpCircle, ChevronDown, Compass, Workflow, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';

export function ProcessSection() {
  const [activeStepIdx, setActiveStepIdx] = useState(0);
  const { t, isRtl } = useLanguage();

  return (
    <section id="process" className="py-20 md:py-28 bg-[#F8FAFC] relative overflow-hidden text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className={`max-w-3xl mb-12 md:mb-16 ${isRtl ? 'text-right' : 'text-left'}`}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#111827] tracking-tight leading-tight">
            {t.processTitle}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#6B7280] max-w-2xl font-normal leading-relaxed">
            {t.processSubtitle}
          </p>
        </motion.div>

        {/* Process Steps Connected Selector */}
        <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 items-start ${isRtl ? 'direction-rtl' : ''}`}>
          
          {/* Left/Right Column: Interactive connected list */}
          <div className="lg:col-span-5 space-y-3">
            {t.processSteps.map((step, index) => {
              const isActive = activeStepIdx === index;
              return (
                <motion.button
                  key={step.number}
                  id={`process-step-selector-${step.number}`}
                  onClick={() => setActiveStepIdx(index)}
                  initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-30px' }}
                  transition={{ duration: 0.4, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  className={`w-full ${isRtl ? 'text-right flex-row-reverse' : 'text-left'} p-4.5 rounded-2xl border transition-all duration-300 flex items-start gap-4 cursor-pointer relative overflow-hidden ${
                    isActive
                      ? 'border-[#5683FC] bg-white shadow-md shadow-[#5683FC]/10 ring-1 ring-[#5683FC]/20'
                      : 'border-[#E5E7EB] bg-white/70 hover:bg-white hover:border-[#5683FC]/40'
                  }`}
                >
                  {/* Visual active indicator bar */}
                  {isActive && (
                    <div className={`absolute top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#F20530] to-[#5683FC] ${isRtl ? 'right-0 rounded-l' : 'left-0 rounded-r'}`} />
                  )}

                  {/* Step Index Circle */}
                  <div className={`w-8 h-8 rounded-xl font-mono font-bold text-xs flex items-center justify-center shrink-0 border transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#F20530] to-[#F20544] border-transparent text-white shadow-sm'
                      : 'bg-[#F5F9FF] border-[#E5E7EB] text-[#6B7280]'
                  }`}>
                    {step.number}
                  </div>

                  {/* Content summary */}
                  <div className="space-y-1">
                    <h4 className={`text-sm font-bold tracking-tight transition-colors ${isActive ? 'text-[#F20530]' : 'text-[#111827]'}`}>
                      {step.title}
                    </h4>
                    <p className="text-xs text-[#6B7280] leading-normal font-normal line-clamp-1">
                      {step.description}
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Right/Left Column: Expanded Step Insights card */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {t.processSteps.map((step, index) => {
                if (index !== activeStepIdx) return null;

                return (
                  <motion.div
                    key={step.number}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className={`rounded-3xl border border-[#E5E7EB] bg-white p-6 md:p-8 space-y-6 shadow-xl shadow-[#5683FC]/5 relative overflow-hidden ${isRtl ? 'text-right' : 'text-left'}`}
                  >
                    {/* Decorative accent graphic in back */}
                    <div className={`absolute top-6 ${isRtl ? 'left-6' : 'right-6'} font-mono text-8xl font-extrabold text-[#BFDDF7]/25 pointer-events-none select-none`}>
                      {step.number}
                    </div>

                    <div className="space-y-2 relative z-10 max-w-lg">
                      <h3 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight leading-tight">
                        {step.title}
                      </h3>
                      <p className="text-sm text-[#6B7280] font-normal leading-relaxed">
                        {step.description}
                      </p>
                    </div>

                    {/* Deliverables / Details Grid */}
                    <div className="border-t border-[#E5E7EB] pt-6 space-y-4 relative z-10">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">{t.processDeliverables}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {step.details.map((detail, idx) => (
                          <div
                            key={idx}
                            className={`flex items-center gap-2.5 p-3 bg-[#F5F9FF] border border-[#E5E7EB] rounded-xl shadow-2xs ${isRtl ? 'flex-row-reverse' : ''}`}
                          >
                            <div className="w-2 h-2 rounded-full bg-[#F20530] shrink-0" />
                            <span className="text-xs font-semibold text-[#111827]">{detail}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Small support message */}
                    <div className={`flex items-start gap-2.5 p-3.5 bg-[#BFDDF7]/20 border border-[#5683FC]/20 rounded-xl relative z-10 ${isRtl ? 'flex-row-reverse' : ''}`}>
                      <Compass className="w-4 h-4 text-[#5683FC] shrink-0 mt-0.5 animate-spin" style={{ animationDuration: '6s' }} />
                      <p className="text-[11px] text-[#111827] leading-normal">
                        {t.processSupport}
                      </p>
                    </div>

                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

        </div>

      </div>
    </section>
  );
}
