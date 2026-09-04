import React from 'react';
import { motion } from 'motion/react';
import { Quote, MessageSquare, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';

export function TestimonialsSection() {
  const { t, isRtl } = useLanguage();
  const { testimonials } = useData();

  // Filter only active, non-deleted testimonials and sort by sort_order ASC
  const activeTestimonials = (testimonials || [])
    .filter(testi => testi.is_active && !testi.deleted_at)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  return (
    <section 
      id="testimonials" 
      className="py-24 md:py-32 bg-[#F8FAFC] relative overflow-hidden text-slate-900 selection:bg-[#F20530] selection:text-white"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-[#5683FC]/8 via-[#F20530]/5 to-transparent blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-10 w-96 h-96 bg-[#2EDFF2]/8 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className={`max-w-3xl mb-12 sm:mb-16 ${isRtl ? 'text-right' : 'text-left'}`}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {t.testimonialsTitle}
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-2xl">
            {t.testimonialsSubtitle}
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        {activeTestimonials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {activeTestimonials.map((testimonial, idx) => {
              const imageUrl = testimonial.media?.url || testimonial.media?.file_path;
              const displayName = (isRtl && testimonial.display_name_ar) ? testimonial.display_name_ar : testimonial.display_name;
              const message = (isRtl && testimonial.message_ar) ? testimonial.message_ar : testimonial.message;

              return (
                <motion.div
                  key={testimonial.id}
                  initial={{ opacity: 0, y: 35 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.5, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -6 }}
                  className="group relative bg-slate-50/70 backdrop-blur-xl border border-slate-200/90 hover:border-[#5683FC]/50 rounded-3xl p-7 lg:p-8 flex flex-col justify-between shadow-md shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-300/40 transition-all duration-500 overflow-hidden"
                >
                  {/* Luxury Glassmorphic Glow Line Accent */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#F20530] to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                  
                  {/* Ambient Card Radial Soft Glow */}
                  <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#5683FC]/5 rounded-full blur-2xl group-hover:bg-[#5683FC]/15 transition-all duration-500 pointer-events-none" />

                  {/* Top Row: Verified Badge Tag & Quote Icon */}
                  <div className={`relative z-10 flex items-center justify-between mb-6 ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold shadow-2xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t.testimonialsVerified}</span>
                    </div>

                    <div className="text-slate-300 group-hover:text-[#5683FC]/40 transition-colors duration-500 pointer-events-none">
                      <Quote className="w-8 h-8 stroke-[1.5]" />
                    </div>
                  </div>

                  {/* Message Content */}
                  <div className="relative z-10 space-y-4 mb-8 flex-1">
                    <p className="text-slate-700 text-base lg:text-[17px] leading-relaxed font-normal tracking-wide italic">
                      "{message}"
                    </p>
                  </div>

                  {/* Client Info Row */}
                  <div className={`relative z-10 flex items-center gap-4 pt-6 border-t border-slate-200/80 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
                    {imageUrl ? (
                      <div className="relative shrink-0 w-13 h-13 rounded-full overflow-hidden border-2 border-slate-200 group-hover:border-[#5683FC] shadow-sm transition-colors duration-300">
                        <img
                          src={imageUrl}
                          alt={testimonial.media?.alt_text || displayName}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          decoding="async"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="shrink-0 w-13 h-13 rounded-full bg-gradient-to-br from-[#5683FC] to-[#F20530] border border-slate-200 flex items-center justify-center font-bold text-white text-lg shadow-sm">
                        {(displayName || 'C').charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-slate-900 tracking-tight group-hover:text-[#5683FC] transition-colors duration-300 truncate">
                        {displayName}
                      </h3>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-slate-50 border border-slate-200 rounded-3xl max-w-xl mx-auto">
            <Quote className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600 font-medium text-base">
              {isRtl ? 'لا تتوفر شهادات حالياً.' : 'No active testimonials available at the moment.'}
            </p>
          </div>
        )}

      </div>
    </section>
  );
}

export default TestimonialsSection;
