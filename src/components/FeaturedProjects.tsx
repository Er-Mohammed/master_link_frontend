import React, { useState } from 'react';
import { ArrowUpRight, ArrowUpLeft, Target, Zap, Sparkles, X, Check, Image as ImageIcon, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';

interface ProjectVideoProps {
  src: string;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

function ProjectAutoplayVideo({ src, className, onClick }: ProjectVideoProps) {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Pause any other playing videos on the page to prevent multiple overlapping playbacks
            document.querySelectorAll('video').forEach((v) => {
              if (v !== video && !v.paused) {
                try {
                  v.pause();
                } catch {
                  // ignore safe catch
                }
              }
            });

            video.play().catch(() => {
              // Safe catch if browser autoplay policies block initial play
            });
          } else {
            if (!video.paused) {
              try {
                video.pause();
              } catch {
                // ignore
              }
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(video);

    return () => {
      observer.disconnect();
      if (video && !video.paused) {
        try {
          video.pause();
        } catch {
          // ignore
        }
      }
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      src={src}
      controls
      muted
      playsInline
      preload="metadata"
      className={className}
      onClick={onClick}
    />
  );
}

function ModalVideoPlayer({ src, className }: { src: string; className?: string }) {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Pause all background videos when modal opens
    document.querySelectorAll('video').forEach((v) => {
      if (v !== video && !v.paused) {
        try {
          v.pause();
        } catch {
          // ignore
        }
      }
    });

    video.play().catch(() => {
      // Safe catch for browser policies
    });

    return () => {
      if (video) {
        video.pause();
        video.currentTime = 0;
      }
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      src={src}
      controls
      autoPlay
      muted
      playsInline
      preload="metadata"
      className={className}
    />
  );
}

interface FeaturedProjectsProps {
  onOpenConsultation?: () => void;
}

export function FeaturedProjects({ onOpenConsultation }: FeaturedProjectsProps) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const { t, isRtl, language } = useLanguage();
  const { projects: cmsProjects, services: cmsServices } = useData();

  // Primary predefined categories with English and Arabic translations
  const baseCategories = [
    { key: 'All', id: 'All', nameEn: 'All', nameAr: 'الكل', label: isRtl ? 'الكل' : 'All' },
    { key: 'Technical Services', id: 'tech-services', nameEn: 'Technical Services', nameAr: 'خدماتنا التقنية', label: isRtl ? 'خدماتنا التقنية' : 'Technical Services' },
    { key: 'Marketing Services', id: 'marketing-services', nameEn: 'Marketing Services', nameAr: 'خدماتنا التسويقية', label: isRtl ? 'خدماتنا التسويقية' : 'Marketing Services' },
    { key: 'Advertising & Media', id: 'ads-media-services', nameEn: 'Advertising & Media', nameAr: 'خدماتنا الإعلانية والتصوير', label: isRtl ? 'خدماتنا الإعلانية والتصوير' : 'Advertising & Media' },
    { key: 'Digital Consulting', id: 'consulting-studies', nameEn: 'Digital Consulting', nameAr: 'استشارات ودراسات رقمية', label: isRtl ? 'استشارات ودراسات رقمية' : 'Digital Consulting' },
    { key: 'Branding & Identity', id: 'visual-identity-branding', nameEn: 'Branding & Identity', nameAr: 'الشعارات والهويات البصرية', label: isRtl ? 'الشعارات والهويات البصرية' : 'Branding & Identity' },
    { key: 'AI Production', id: 'ai-production', nameEn: 'AI Production', nameAr: 'الإنتاج بالذكاء الاصطناعي', label: isRtl ? 'الإنتاج بالذكاء الاصطناعي' : 'AI Production' }
  ];

  // Filter published active projects from CMS / Laravel DB
  const publishedCmsProjects = cmsProjects.filter(p => p.status === 'published' || (p as any).isActive !== false);

  const dynamicCategories = React.useMemo(() => {
    const list = [...baseCategories];

    // Add categories from database projects if not already present
    publishedCmsProjects.forEach(p => {
      if (p.categoryEn || p.categoryAr) {
        const catEn = p.categoryEn || p.categoryAr || '';
        const catAr = p.categoryAr || p.categoryEn || '';
        const exists = list.some(
          c => c.nameEn.toLowerCase() === catEn.toLowerCase() || 
               c.nameAr === catAr || 
               c.key.toLowerCase() === catEn.toLowerCase()
        );
        if (!exists && (catEn || catAr)) {
          list.push({
            key: catEn || catAr,
            id: (catEn || catAr).toLowerCase().replace(/\s+/g, '-'),
            nameEn: catEn,
            nameAr: catAr,
            label: isRtl ? catAr : catEn
          });
        }
      }
    });

    return list;
  }, [cmsProjects, cmsServices, isRtl]);

  // Map CMS published projects cleanly from database including both images and videos
  const formattedProjects = publishedCmsProjects.map(p => {
    const rawMedia = Array.isArray(p.media) && p.media.length > 0 ? p.media : [];

    const mediaItems: Array<{ url: string; isVideo: boolean; mimeType?: string }> = rawMedia.length > 0
      ? rawMedia.map((m: any) => {
          const rawUrl = typeof m === 'string' ? m : (m?.url || m?.file_path || '');
          const isVid = typeof m === 'object' && m !== null
            ? (m.media_type === 'video' || (m.mime_type && m.mime_type.startsWith('video/')) || /\.(mp4|webm|ogg|mov|m4v)$/i.test(rawUrl))
            : /\.(mp4|webm|ogg|mov|m4v)$/i.test(rawUrl);
          return {
            url: rawUrl,
            isVideo: isVid,
            mimeType: m?.mime_type
          };
        }).filter(m => Boolean(m.url))
      : (p.images && p.images.length > 0 ? p.images : [p.image || p.img || ''])
          .filter(Boolean)
          .map(url => ({
            url,
            isVideo: /\.(mp4|webm|ogg|mov|m4v)$/i.test(url)
          }));

    const primaryMedia = mediaItems.length > 0 ? mediaItems[0] : null;
    const projectImages = mediaItems.map(m => m.url);
    const primaryImage = primaryMedia ? primaryMedia.url : '';

    return {
      id: p.id,
      title: (language === 'ar' ? (p.titleAr || p.nameAr) : (p.titleEn || p.nameEn)) || '',
      category: (language === 'ar' ? p.categoryAr : p.categoryEn) || p.categoryAr || p.categoryEn || '',
      categoryEn: p.categoryEn || '',
      categoryAr: p.categoryAr || '',
      description: (language === 'ar' ? p.descriptionAr : p.descriptionEn) || '',
      fullDescription: (language === 'ar' ? (p.fullDescriptionAr || p.descriptionAr) : (p.fullDescriptionEn || p.descriptionEn)) || '',
      image: primaryImage,
      images: projectImages,
      mediaItems: mediaItems,
      primaryMedia: primaryMedia,
      stats: {
        label: language === 'ar' ? 'إنجاز' : 'Metric',
        value: (language === 'ar' ? p.statsAr : p.statsEn) || (language === 'ar' ? 'أداء ممتاز' : 'High Performance')
      },
      tags: p.tags || p.services || [],
      challenge: language === 'ar' ? 'تحقيق أعلى مستويات الأمان والأداء السلس للمستخدمين.' : 'Achieving peak performance, responsive design, and high security.',
      strategy: language === 'ar' ? 'تصميم بنية برمجية متطورة باستخدام أحدث إطارات العمل.' : 'Engineered bespoke frontend and backend architecture.',
      results: (language === 'ar' ? p.statsAr : p.statsEn) || ''
    };
  });

  // Category filter matching logic
  const filteredProjects = React.useMemo(() => {
    if (activeCategory === 'All' || activeCategory === 'all') {
      return formattedProjects;
    }

    const selectedCatObj = dynamicCategories.find(c => c.key === activeCategory || c.id === activeCategory);

    return formattedProjects.filter(p => {
      const pCatEn = (p.categoryEn || p.category || '').toLowerCase();
      const pCatAr = (p.categoryAr || p.category || '').toLowerCase();
      const pTags = (p.tags || []).map(t => t.toLowerCase());

      const targetKey = activeCategory.toLowerCase();
      const targetNameEn = (selectedCatObj?.nameEn || '').toLowerCase();
      const targetNameAr = (selectedCatObj?.nameAr || '').toLowerCase();
      const targetLabel = (selectedCatObj?.label || '').toLowerCase();

      return (
        pCatEn === targetKey ||
        pCatAr === targetKey ||
        (targetNameEn && pCatEn === targetNameEn) ||
        (targetNameAr && pCatAr === targetNameAr) ||
        (targetLabel && (pCatEn === targetLabel || pCatAr === targetLabel)) ||
        pCatEn.includes(targetKey) ||
        pCatAr.includes(targetKey) ||
        pTags.some(tag => tag === targetKey || tag.includes(targetKey) || (targetNameAr && tag.includes(targetNameAr)))
      );
    });
  }, [activeCategory, formattedProjects, dynamicCategories]);

  const selectedProject = formattedProjects.find(p => p.id === selectedProjectId);

  const activeModalMedia = selectedProject
    ? (selectedProject.mediaItems && selectedProject.mediaItems.length > 0
        ? selectedProject.mediaItems[selectedImageIndex] || selectedProject.mediaItems[0]
        : selectedProject.primaryMedia)
    : null;

  const resultsList = selectedProject?.results
    ? selectedProject.results.split('.').map(s => s.trim()).filter(Boolean)
    : [
        isRtl ? 'نمو كبير في نسب تحويل المستخدمين النشطين.' : 'Substantial growth in active user conversion scores.',
        isRtl ? 'الحصول على درجة سرعة Lighthouse كاملة ١٠٠.' : 'Flawless Lighthouse speed matrix score of 100.',
        isRtl ? 'تحقيق انتشار ورؤية مؤسسية أوسع.' : 'Secured major corporate visibility index scaling.'
      ];

  return (
    <section id="portfolio" className="py-20 md:py-28 bg-white relative overflow-hidden text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className={`flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16 gap-6 ${isRtl ? 'text-right' : 'text-left'}`}
        >
          <div className="max-w-xl">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#111827] tracking-tight leading-tight">
              {t.portfolioTitle}
            </h2>
            <p className="mt-4 text-sm sm:text-base text-[#6B7280] font-normal leading-relaxed">
              {t.portfolioSubtitle}
            </p>
          </div>

          {/* Filtering Tabs */}
          <div className={`flex flex-wrap gap-1.5 bg-white p-1.5 rounded-2xl border border-[#E5E7EB] shadow-xs self-start md:self-auto ${isRtl ? 'flex-row-reverse' : ''}`}>
            {dynamicCategories.map(cat => (
              <button
                key={cat.key}
                id={`filter-btn-${cat.key.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-3.5 py-1.5 text-[11px] font-bold rounded-xl transition-all duration-200 cursor-pointer ${
                  activeCategory === cat.key
                    ? 'bg-gradient-to-r from-[#F20530] to-[#F20544] text-white shadow-md shadow-[#F20530]/20'
                    : 'text-[#6B7280] hover:text-[#111827] hover:bg-[#F5F9FF]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Portfolio Cards Grid */}
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, y: 35, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.45, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  className="group cursor-pointer bg-white rounded-3xl border border-[#E5E7EB] overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-[#5683FC]/15 hover:border-[#5683FC]/50 transition-all duration-300 relative"
                  onClick={() => {
                    setSelectedProjectId(project.id);
                    setSelectedImageIndex(0);
                  }}
                >
                  {/* Media Container */}
                  <div className="relative aspect-[16/9] sm:aspect-[16/9.5] overflow-hidden bg-slate-100 border-b border-[#E5E7EB]">
                    {project.primaryMedia ? (
                      project.primaryMedia.isVideo ? (
                        <ProjectAutoplayVideo
                          src={project.primaryMedia.url}
                          className="object-cover w-full h-full"
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <motion.img
                          src={project.primaryMedia.url}
                          alt={project.title}
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          className="object-cover w-full h-full scale-105 group-hover:scale-120"
                          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        />
                      )
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#5683FC]/20 via-[#F20530]/10 to-transparent opacity-60 pointer-events-none" />
                        <ImageIcon className="w-10 h-10 text-slate-500 mb-2 relative z-10" />
                        <span className="text-xs font-bold text-slate-400 relative z-10 text-center">
                          {isRtl ? 'مشروع بدون وسائط' : 'No Media Available'}
                        </span>
                      </div>
                    )}

                    {/* Category Tag */}
                    <div className={`absolute top-4 ${isRtl ? 'right-4' : 'left-4'}`}>
                      <span className="px-3 py-1 bg-white/95 backdrop-blur-md text-[#111827] font-bold rounded-full text-[10px] tracking-wide border border-white shadow-sm uppercase">
                        {project.category}
                      </span>
                    </div>

                    {/* Gallery Count Pill */}
                    {project.mediaItems && project.mediaItems.length > 1 && (
                      <div className={`absolute top-4 ${isRtl ? 'left-4' : 'right-4'}`}>
                        <span className="px-2.5 py-1 bg-slate-900/85 backdrop-blur-md text-white font-mono font-bold rounded-full text-[10px] tracking-wide border border-white/20 shadow-sm flex items-center gap-1">
                          {project.mediaItems.some(m => m.isVideo) ? (
                            <Play className="w-3 h-3 text-[#2EDFF2] fill-[#2EDFF2]" />
                          ) : (
                            <ImageIcon className="w-3 h-3 text-[#2EDFF2]" />
                          )}
                          {project.mediaItems.length} {isRtl ? 'وسائط' : 'Media'}
                        </span>
                      </div>
                    )}

                    {/* Statistics overlay */}
                    <div className={`absolute bottom-4 ${isRtl ? 'left-4' : 'right-4'}`}>
                      <div className="bg-[#0F172A]/85 backdrop-blur-sm text-white px-3.5 py-1.5 rounded-2xl border border-white/10 flex items-center gap-1.5 shadow-md">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#2EDFF2]" />
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-300">{project.stats.label}:</span>
                        <span className="text-xs font-extrabold font-mono text-[#2EDFF2]">{project.stats.value}</span>
                      </div>
                    </div>
                  </div>

                  {/* Info Container */}
                  <div className={`p-6 md:p-8 space-y-4 ${isRtl ? 'text-right' : 'text-left'}`}>
                    <div className="space-y-1.5">
                      <h3 className="text-xl font-extrabold text-[#111827] tracking-tight group-hover:text-[#F20530] transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed font-normal">
                        {project.description}
                      </p>
                    </div>

                    {/* Tags & Action Row */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E5E7EB]">
                      <div className="flex flex-wrap gap-1">
                        {project.tags.map(tag => (
                          <span key={tag} className="px-2.5 py-1 bg-[#F5F9FF] text-[#5683FC] border border-[#BFDDF7]/40 rounded-lg text-[9px] font-bold">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <button
                        id={`view-study-btn-${project.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#F20530] group-hover:text-[#5683FC] transition-colors cursor-pointer"
                      >
                        {t.portfolioViewCase}
                        {isRtl ? (
                          <ArrowUpLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5 group-hover:-translate-y-0.5" />
                        ) : (
                          <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          /* Empty State when no projects match filter */
          <div className="text-center py-16 px-4 bg-slate-50 border border-slate-200 rounded-3xl max-w-xl mx-auto space-y-3">
            <ImageIcon className="w-12 h-12 text-slate-400 mx-auto" />
            <h4 className="text-lg font-bold text-slate-800">
              {isRtl ? 'لا توجد مشاريع مضافة في هذا القسم' : 'No Projects Found in This Category'}
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {isRtl ? 'يمكنك استعراض الأقسام الأخرى أو التواصل معنا لاستشارات مخصصة.' : 'Please explore other categories or contact us for custom consultations.'}
            </p>
          </div>
        )}

      </div>

      {/* Case Study Modal */}
      <AnimatePresence>
        {selectedProject && (
          <div
            id="case-study-backdrop"
            onClick={(e) => e.target === e.currentTarget && setSelectedProjectId(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md"
          >
            <motion.div
              id="case-study-content"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white border border-slate-100 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col"
            >
              {/* Cover Image / Video & Active Photo Showcase */}
              <div className="h-64 sm:h-72 overflow-hidden relative shrink-0 bg-slate-900">
                {activeModalMedia ? (
                  activeModalMedia.isVideo ? (
                    <ModalVideoPlayer
                      src={activeModalMedia.url}
                      className="w-full h-full object-contain bg-black"
                    />
                  ) : (
                    <img
                      src={activeModalMedia.url}
                      alt={selectedProject.title}
                      referrerPolicy="no-referrer"
                      className="object-cover w-full h-full scale-105 transition-all duration-500"
                    />
                  )
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-950 flex flex-col items-center justify-center p-4">
                    <ImageIcon className="w-12 h-12 text-slate-600 mb-2" />
                    <span className="text-xs font-bold text-slate-400">
                      {isRtl ? 'لا توجد وسائط لهذا المشروع' : 'No Media Uploaded'}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent pointer-events-none" />
                <button
                  id="close-case-study-btn"
                  onClick={() => setSelectedProjectId(null)}
                  className={`absolute top-4 ${isRtl ? 'left-4' : 'right-4'} p-1.5 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors border border-white/20 cursor-pointer z-20`}
                >
                  <X className="w-5 h-5" />
                </button>

                <div className={`absolute bottom-4 ${isRtl ? 'right-6 text-right' : 'left-6 text-left'} z-10 max-w-[85%]`}>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-rose-400 bg-rose-950/60 border border-rose-500/40 px-2.5 py-0.5 rounded-full mb-1 inline-block">
                    {selectedProject.category}
                  </span>
                  <h4 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-snug">
                    {selectedProject.title}
                  </h4>
                </div>
              </div>

              {/* Multi-Media Gallery Bar (if project has more than 1 media item) */}
              {selectedProject.mediaItems && selectedProject.mediaItems.length > 1 && (
                <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center gap-2 overflow-x-auto shrink-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                    {isRtl ? 'الوسائط (' + selectedProject.mediaItems.length + '):' : 'Gallery (' + selectedProject.mediaItems.length + '):'}
                  </span>
                  <div className="flex items-center gap-2 overflow-x-auto py-0.5">
                    {selectedProject.mediaItems.map((mediaItem, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`relative w-14 h-10 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                          selectedImageIndex === idx
                            ? 'border-[#F20530] scale-105 shadow-md shadow-[#F20530]/40 opacity-100 ring-2 ring-[#F20530]/20'
                            : 'border-slate-700 opacity-55 hover:opacity-100 hover:scale-102'
                        }`}
                      >
                        {mediaItem.isVideo ? (
                          <div className="w-full h-full bg-slate-900 flex items-center justify-center relative">
                            <video src={mediaItem.url} className="w-full h-full object-cover opacity-60" preload="metadata" />
                            <Play className="w-4 h-4 text-white absolute inset-0 m-auto fill-white" />
                          </div>
                        ) : (
                          <img src={mediaItem.url} alt={`${selectedProject.title} ${idx + 1}`} className="w-full h-full object-cover" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Case Study details */}
              <div className={`p-6 md:p-8 space-y-6 overflow-y-auto flex-1 ${isRtl ? 'text-right' : 'text-left'}`}>
                
                {/* Challenge & Strategy */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-wider justify-start">
                      <Target className="w-4 h-4" />
                      {t.caseStudyChallenge}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-normal">
                      {selectedProject.challenge}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-wider justify-start">
                      <Zap className="w-4 h-4 animate-pulse" />
                      {t.caseStudyStrategy}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-normal">
                      {selectedProject.strategy}
                    </p>
                  </div>
                </div>

                {/* Metrics / Results Checklist */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-3">
                  <h5 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t.caseStudyResults}</h5>
                  <div className="space-y-2.5">
                    {resultsList.map((result, i) => (
                      <div key={i} className={`flex items-start gap-2.5 ${isRtl ? 'flex-row-reverse' : ''}`}>
                        <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                        <span className="text-xs font-semibold text-slate-700 leading-normal">{result}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                {selectedProject.tags && selectedProject.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-2 border-t border-slate-100">
                    {selectedProject.tags.map(tag => (
                      <span key={tag} className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded text-[9px] font-bold">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className={`px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex shrink-0 ${isRtl ? 'justify-start' : 'justify-end'}`}>
                <button
                  id="case-study-close-footer-btn"
                  onClick={() => setSelectedProjectId(null)}
                  className="px-5 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm cursor-pointer"
                >
                  {t.caseStudyClose}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
