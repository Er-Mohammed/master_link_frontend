import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface CTASectionProps {
  onOpenConsultation: () => void;
}

export function CTASection({ onOpenConsultation }: CTASectionProps) {
  const { t, isRtl } = useLanguage();

  return (
    <section id="cta" className="py-20 md:py-28 bg-[#F8FAFC] text-slate-900 relative overflow-hidden">
      {/* Visual background ambient lighting */}
      <motion.div 
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-50%] left-[-20%] w-[350px] md:w-[600px] h-[350px] md:h-[600px] rounded-full bg-[#F20530]/10 blur-[130px] pointer-events-none" 
      />
      <motion.div 
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-[-30%] right-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full bg-[#5683FC]/15 blur-[120px] pointer-events-none" 
      />
      <div className="absolute top-[20%] right-[30%] w-[200px] h-[200px] rounded-full bg-[#2EDFF2]/10 blur-[90px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6"
      >
        {/* Headline */}
        <div className="space-y-4">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15] max-w-2xl mx-auto">
            {isRtl ? (
              <>
                حوّل فكرتك إلى منظومة رقمية رائدة تتصدر بها المنافسة
              </>
            ) : (
              <>
                Scale Your Business With High-Performance Digital Solutions
              </>
            )}
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto font-normal leading-relaxed">
            {isRtl ? (
              <>
                احجز استشارتك الاستراتيجية المجانية الآن، ودع خبراءنا يحللون متطلبات مشروعك ويصممون لك خارطة طريق تسويقية وتقنية تضاعف مبيعاتك وتعزز حضورك في السوق.
              </>
            ) : (
              <>
                Book your free strategic consultation today. Let our digital architects analyze your goals and engineer a tailored roadmap to maximize your growth and ROI.
              </>
            )}
          </p>
        </div>

        {/* CTA Button */}
        <div className="pt-2">
          <button
            id="cta-section-book-btn"
            onClick={onOpenConsultation}
            className={`inline-flex items-center gap-2.5 px-9 py-4.5 font-bold text-white text-base bg-gradient-to-r from-[#F20530] via-[#E0042A] to-[#F20544] hover:from-[#5683FC] hover:to-[#5371C0] rounded-2xl transition-all duration-300 shadow-xl shadow-[#F20530]/25 hover:shadow-[#5683FC]/35 hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${isRtl ? 'flex-row-reverse' : ''}`}
          >
            <span>{isRtl ? 'احصل على استشارتك المجانية الآن' : 'Claim Your Free Consultation'}</span>
            {isRtl ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
          </button>
        </div>

      </motion.div>
    </section>
  );
}
