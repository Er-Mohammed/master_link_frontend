import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Palette, 
  Code2, 
  Smartphone, 
  TrendingUp, 
  Video, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  ArrowUpRight,
  Sparkles,
  Check,
  Layers,
  Globe,
  Camera,
  Briefcase,
  Bot,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Image as ImageIcon,
  Play,
  Film,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { MediaLibraryItem, ServiceMediaItem } from '../types';
import { getMediaBlobUrl } from '../utils/indexedDbStorage';
import { CATEGORY_GALLERIES } from '../data';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'tech-services': Code2,
  'marketing-services': TrendingUp,
  'ads-media-services': Camera,
  'consulting-studies': Briefcase,
  'visual-identity-branding': Palette,
  'ai-production': Bot,
  'branding': Palette,
  'Palette': Palette,
  'web-dev': Code2,
  'Code2': Code2,
  'mobile-dev': Smartphone,
  'Smartphone': Smartphone,
  'marketing': TrendingUp,
  'TrendingUp': TrendingUp,
  'video-prod': Video,
  'Video': Video,
  'company-profiles': FileText,
  'FileText': FileText,
  'Layers': Layers,
  'Globe': Globe,
  'Camera': Camera,
  'Briefcase': Briefcase,
  'Bot': Bot,
};

// Component for digital media image & video slider & carousel integrated into card hero
interface MediaSlideItem {
  url: string;
  title: string;
  type: 'image' | 'video';
  videoUrl?: string;
  videoType?: 'direct' | 'youtube' | 'vimeo';
}

interface ServiceMediaCarouselProps {
  serviceId: string;
  coverImage?: string;
  videoUrl?: string;
  videoType?: 'direct' | 'youtube' | 'vimeo';
  serviceMedia?: ServiceMediaItem[];
  mediaItems: MediaLibraryItem[];
  isRtl: boolean;
  serviceTitle: string;
  iconComponent: React.ComponentType<{ className?: string }>;
  iconAccentClass: string;
}

function ServiceMediaCarousel({ 
  serviceId, 
  coverImage, 
  videoUrl,
  videoType = 'youtube',
  serviceMedia,
  mediaItems, 
  isRtl, 
  serviceTitle,
  iconComponent: IconComponent,
  iconAccentClass
}: ServiceMediaCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [resolvedVideoUrls, setResolvedVideoUrls] = useState<Record<string, string>>({});
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Helper to extract YouTube embed URL with autoplay
  const getEmbedUrl = (url?: string, type?: string) => {
    if (!url) return '';
    if (type === 'youtube' || url.includes('youtube.com') || url.includes('youtu.be')) {
      const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
      return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1&mute=0&loop=1&playlist=${match[1]}` : url;
    }
    if (type === 'vimeo' || url.includes('vimeo.com')) {
      const match = url.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
      return match ? `https://player.vimeo.com/video/${match[1]}?autoplay=1&muted=0&loop=1` : url;
    }
    return url;
  };

  // Collect images & videos strictly for this specific service
  const slidesList: MediaSlideItem[] = [];

  // 1. If serviceMedia relationship is provided (from CMS Editor)
  if (serviceMedia && serviceMedia.length > 0) {
    // Sort so primary item is first
    const sortedMedia = [...serviceMedia].sort((a, b) => {
      if (a.is_primary) return -1;
      if (b.is_primary) return 1;
      return (a.sort_order || 0) - (b.sort_order || 0);
    });

    sortedMedia.forEach((m, idx) => {
      const isVideo = m.media_type === 'video' || m.file_type === 'video' || !!m.video_url;
      const mediaKey = m.media_id;
      const rawVideoUrl = (mediaKey && resolvedVideoUrls[mediaKey]) 
        || m.video_url 
        || (isVideo ? m.file_path : undefined);

      slidesList.push({
        url: m.file_path,
        title: m.alt_text || (isRtl ? `وسائط الخدمة #${idx + 1}` : `Service Media #${idx + 1}`),
        type: isVideo ? 'video' : 'image',
        videoUrl: rawVideoUrl,
        videoType: m.video_type || (rawVideoUrl?.includes('vimeo') ? 'vimeo' : rawVideoUrl?.includes('youtu') ? 'youtube' : 'direct')
      });
    });
  } else {
    // 2. Add direct service video if attached
    if (videoUrl && videoUrl.trim().length > 0) {
      slidesList.push({
        url: coverImage || 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1000&q=80',
        title: isRtl ? `فيديو تعريفي - ${serviceTitle}` : `Service Video - ${serviceTitle}`,
        type: 'video',
        videoUrl: videoUrl.trim(),
        videoType: videoType
      });
    }

    // 3. Add main cover image if available
    if (coverImage && typeof coverImage === 'string' && coverImage.trim().length > 0) {
      if (!slidesList.some(s => s.url === coverImage)) {
        slidesList.push({
          url: coverImage,
          title: isRtl ? `الصورة الرئيسية - ${serviceTitle}` : `Primary Cover - ${serviceTitle}`,
          type: 'image'
        });
      }
    }

    // 4. Add specific digital media items matching this service from media library
    (mediaItems || []).forEach((m, idx) => {
      if (
        m.type === 'image' && 
        m.url && 
        typeof m.url === 'string' && 
        m.name?.toLowerCase().includes(serviceId.toLowerCase()) &&
        !slidesList.some(img => img.url === m.url)
      ) {
        slidesList.push({
          url: m.url,
          title: m.name || (isRtl ? `وسائط رقمية #${idx + 1}` : `Digital Media #${idx + 1}`),
          type: 'image'
        });
      }
    });
  }

  // Effect to resolve any IndexedDB-stored local videos for this service
  useEffect(() => {
    if (serviceMedia && serviceMedia.length > 0) {
      serviceMedia.forEach(async (m) => {
        if (m.media_id && m.media_id.startsWith('vid-')) {
          const blobUrl = await getMediaBlobUrl(m.media_id);
          if (blobUrl) {
            setResolvedVideoUrls(prev => ({ ...prev, [m.media_id!]: blobUrl }));
          }
        }
      });
    }
  }, [serviceMedia]);

  const totalSlides = slidesList.length;
  const currentSlide = slidesList[currentIndex] || slidesList[0];

  if (totalSlides === 0 || !currentSlide) {
    return (
      <div className="relative w-full overflow-hidden bg-slate-950 aspect-[16/10] flex flex-col items-center justify-center text-slate-500 gap-2 p-4">
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border backdrop-blur-md ${iconAccentClass}`}>
          <IconComponent className="w-4 h-4 text-white" />
          <span className="text-[11px] font-bold tracking-wide uppercase opacity-95 text-white">
            {serviceTitle}
          </span>
        </div>
      </div>
    );
  }

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
  };

  const handleDotClick = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setCurrentIndex(index);
  };

  const handleOpenLightbox = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLightboxOpen(true);
  };

  const isDirectVideo = currentSlide?.type === 'video' && (
    currentSlide.videoType === 'direct' ||
    currentSlide.videoUrl?.startsWith('blob:') ||
    currentSlide.videoUrl?.startsWith('data:video') ||
    currentSlide.videoUrl?.endsWith('.mp4') ||
    currentSlide.videoUrl?.endsWith('.webm') ||
    currentSlide.videoUrl?.endsWith('.mov')
  );

  // Auto-play direct video smoothly with audio when active
  useEffect(() => {
    if (currentSlide?.type === 'video' && isDirectVideo && videoRef.current) {
      videoRef.current.muted = false;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // If browser restricts unmuted autoplay before user gesture, play initially and unmute on first gesture
          if (videoRef.current) {
            videoRef.current.muted = true;
            videoRef.current.play().catch(() => {});
            const enableSound = () => {
              if (videoRef.current) {
                videoRef.current.muted = false;
              }
            };
            window.addEventListener('click', enableSound, { once: true });
            window.addEventListener('touchstart', enableSound, { once: true });
          }
        });
      }
    }
  }, [currentIndex, currentSlide, isDirectVideo, resolvedVideoUrls]);

  return (
    <div className="relative w-full overflow-hidden bg-slate-950 aspect-[16/10] group/hero" onClick={(e) => e.stopPropagation()}>
      {/* Main Slide View (Image or Video) */}
      <AnimatePresence mode="wait">
        {currentSlide.type === 'video' ? (
          <div key={currentSlide.videoUrl || currentSlide.url} className="w-full h-full relative flex items-center justify-center bg-black overflow-hidden">
            {isDirectVideo ? (
              <div className="w-full h-full relative flex items-center justify-center bg-black">
                <video
                  ref={videoRef}
                  src={currentSlide.videoUrl || currentSlide.url}
                  poster={currentSlide.url}
                  className="w-full h-full max-h-full max-w-full object-contain mx-auto my-auto"
                  controls
                  playsInline
                  autoPlay
                  loop
                />
              </div>
            ) : (
              <div className="w-full h-full relative cursor-pointer flex items-center justify-center bg-black" onClick={handleOpenLightbox}>
                <img
                  src={currentSlide.url}
                  alt={currentSlide.title}
                  className="w-full h-full object-contain opacity-90 group-hover/hero:scale-105 transition-transform duration-700 ease-out mx-auto my-auto"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/10 transition-colors">
                  <div className="w-14 h-14 rounded-full bg-[#F20530] text-white flex items-center justify-center shadow-2xl shadow-rose-950/60 hover:scale-115 transition-transform">
                    <Play className="w-6 h-6 fill-white ml-0.5" />
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <motion.img
            key={currentSlide.url}
            src={currentSlide.url}
            alt={currentSlide.title}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full object-cover object-center group-hover/hero:scale-105 transition-transform duration-700 ease-out"
          />
        )}
      </AnimatePresence>

      {/* Ambient Gradient Overlays for High-Contrast Text & Controls (only for images) */}
      {currentSlide.type !== 'video' && (
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-slate-950/40 pointer-events-none transition-opacity duration-300" />
      )}

      {/* Floating Category Icon Badge (Top Left / Right depending on RTL) */}
      {currentSlide.type !== 'video' && (
        <div className={`absolute top-3.5 z-20 ${isRtl ? 'right-3.5' : 'left-3.5'}`}>
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border backdrop-blur-md shadow-lg transition-transform duration-300 group-hover/hero:scale-105 ${iconAccentClass}`}>
            <IconComponent className="w-4 h-4" />
            <span className="text-[11px] font-bold tracking-wide uppercase opacity-95">
              {serviceId.replace('-', ' ')}
            </span>
          </div>
        </div>
      )}

      {/* Prev & Next Hover Arrows */}
      {totalSlides > 1 && (
        <>
          <button
            onClick={isRtl ? handleNext : handlePrev}
            className={`absolute z-20 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/70 hover:bg-[#5683FC] text-white backdrop-blur-md border border-white/20 transition-all duration-300 opacity-0 group-hover/hero:opacity-100 hover:scale-110 cursor-pointer shadow-lg ${
              isRtl ? 'right-2.5' : 'left-2.5'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={isRtl ? handlePrev : handleNext}
            className={`absolute z-20 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/70 hover:bg-[#5683FC] text-white backdrop-blur-md border border-white/20 transition-all duration-300 opacity-0 group-hover/hero:opacity-100 hover:scale-110 cursor-pointer shadow-lg ${
              isRtl ? 'left-2.5' : 'right-2.5'
            }`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}

      {/* Bottom Hero Info Bar: Caption & Pagination Dots */}
      <div className="absolute bottom-2.5 inset-x-3.5 z-20 flex items-center justify-between pointer-events-none">
        {currentSlide.type !== 'video' ? (
          <div className="flex items-center gap-1.5 text-white/90 drop-shadow-md truncate max-w-[70%]">
            <p className="text-[11px] font-medium truncate">
              {currentSlide.title}
            </p>
          </div>
        ) : (
          <div />
        )}

        {/* Pagination Dots */}
        {totalSlides > 1 && (
          <div className="flex items-center gap-1.5 pointer-events-auto bg-slate-900/60 backdrop-blur-md px-2 py-1 rounded-full border border-white/10">
            {slidesList.map((slide, idx) => (
              <button
                key={idx}
                onClick={(e) => handleDotClick(e, idx)}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  currentIndex === idx 
                    ? 'w-4 bg-[#5683FC]' 
                    : slide.type === 'video' 
                    ? 'w-2 bg-[#F20530]/80' 
                    : 'w-1.5 bg-white/40 hover:bg-white/80'
                }`}
                title={slide.type === 'video' ? (isRtl ? `فيديو ${idx + 1}` : `Video ${idx + 1}`) : (isRtl ? `صورة ${idx + 1}` : `Photo ${idx + 1}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Lightbox / Video Player Modal */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl flex flex-col items-center justify-between p-4 md:p-8"
            onClick={() => setIsLightboxOpen(false)}
          >
            {/* Modal Top Bar */}
            <div className="w-full max-w-5xl flex items-center justify-between text-white z-10">
              <div className="flex items-center gap-2">
                {currentSlide.type !== 'video' && (
                  <>
                    <ImageIcon className="w-4 h-4 text-[#5683FC]" />
                    <span className="text-sm font-bold text-white/90">
                      {currentSlide.title}
                    </span>
                  </>
                )}
              </div>
              <button
                onClick={() => setIsLightboxOpen(false)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer border border-white/10"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Media View (Image or Video) */}
            <div className="relative w-full max-w-5xl flex-1 flex items-center justify-center my-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
              {currentSlide.type === 'video' ? (
                <div className="w-full max-w-4xl aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black">
                  {isDirectVideo ? (
                    <video
                      src={currentSlide.videoUrl || currentSlide.url}
                      className="w-full h-full"
                      controls
                      autoPlay
                      playsInline
                    />
                  ) : (
                    <iframe
                      src={getEmbedUrl(currentSlide.videoUrl, currentSlide.videoType)}
                      title={currentSlide.title}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  )}
                </div>
              ) : (
                <img
                  src={currentSlide.url}
                  alt={currentSlide.title}
                  className="max-w-full max-h-[78vh] object-contain rounded-2xl shadow-2xl border border-white/10"
                />
              )}

              {totalSlides > 1 && (
                <>
                  <button
                    onClick={isRtl ? handleNext : handlePrev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3.5 rounded-full bg-slate-900/80 hover:bg-[#5683FC] text-white border border-white/20 transition-all cursor-pointer shadow-2xl hover:scale-110"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={isRtl ? handlePrev : handleNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3.5 rounded-full bg-slate-900/80 hover:bg-[#5683FC] text-white border border-white/20 transition-all cursor-pointer shadow-2xl hover:scale-110"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            {/* Modal Bottom Counter */}
            <div className="text-xs font-semibold text-white/70 bg-white/10 px-4 py-1.5 rounded-full border border-white/10">
              {isRtl ? `عنصر ${currentIndex + 1} من ${totalSlides}` : `Item ${currentIndex + 1} of ${totalSlides}`}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ServicesOverview() {
  const { language, t, isRtl } = useLanguage();
  const { services: cmsServices, mediaItems } = useData();
  const [expandedServiceId, setExpandedServiceId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedServiceId(expandedServiceId === id ? null : id);
  };

  // Filter active services from CMS context
  const activeCmsServices = cmsServices.filter(s => s.isActive);

  // Map CMS items directly from MySQL database
  const displayedServices = activeCmsServices.map(s => {
    const fullDesc = s.fullDescription || '';
    const parsedFeatures = fullDesc
      ? fullDesc
          .split(/\r?\n/)
          .map(line => line.trim().replace(/^[-*•]\s*/, ''))
          .filter(Boolean)
      : [];

    return {
      id: s.id,
      title: s.title,
      description: s.shortDescription || fullDesc || '',
      fullDescription: fullDesc,
      features: parsedFeatures,
      iconName: 'Code2',
      coverImage: s.coverImage,
      videoUrl: undefined,
      videoType: undefined,
      serviceMedia: s.serviceMedia
    };
  });

  return (
    <section id="services" className="py-24 md:py-32 bg-slate-50/50 relative overflow-hidden text-slate-900">
      {/* Architectural Background Glows */}
      <div className="absolute inset-0 pointer-events-none opacity-50">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-br from-[#5683FC]/15 to-transparent blur-3xl rounded-full" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-gradient-to-tr from-[#F20530]/10 to-transparent blur-3xl rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Block */}
        <div className={`max-w-3xl mb-12 md:mb-16 ${isRtl ? 'text-right' : 'text-left'}`}>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            {t.servicesTitle}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl font-normal leading-relaxed">
            {t.servicesSubtitle}
          </p>
        </div>

        {/* Services Grid - World-class Cards or Empty State */}
        {displayedServices.length === 0 ? (
          <div className="py-16 px-6 text-center bg-white rounded-3xl border border-slate-200/90 shadow-xs max-w-xl mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Layers className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-800">
                {isRtl ? 'لا تتوفر خدمات حالياً' : 'No Services Available'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed font-medium">
                {isRtl
                  ? 'لم يتم إضافة أي خدمات نشطة بعد في قاعدة البيانات. يمكن للإدارة إضافة خدمات جديدة من لوحة التحكم.'
                  : 'No active services have been published to the database yet.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {displayedServices.map((service, idx) => {
            const IconComponent = iconMap[service.iconName] || Code2;
            const isExpanded = expandedServiceId === service.id;

            // Vary icon accent badge styling per card
            const iconAccentClass = idx % 3 === 0 
              ? 'text-white bg-slate-900/90 border-white/20' 
              : idx % 3 === 1 
              ? 'text-white bg-[#5683FC] border-white/20'
              : 'text-white bg-[#F20530] border-white/20';

            return (
              <motion.div
                key={service.id}
                id={`service-card-${service.id}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className={`group relative rounded-3xl border bg-white overflow-hidden transition-all duration-500 flex flex-col justify-between hover:-translate-y-2 ${
                  isExpanded 
                    ? 'border-[#5683FC] shadow-2xl ring-2 ring-[#5683FC]/20' 
                    : 'border-slate-200/90 shadow-sm hover:border-slate-300 hover:shadow-2xl hover:shadow-slate-200/80'
                }`}
              >
                <div>
                  {/* Integrated Header Carousel Frame */}
                  <ServiceMediaCarousel
                    serviceId={service.id}
                    coverImage={service.coverImage}
                    videoUrl={service.videoUrl}
                    videoType={service.videoType}
                    serviceMedia={service.serviceMedia}
                    mediaItems={mediaItems}
                    isRtl={isRtl}
                    serviceTitle={service.title}
                    iconComponent={IconComponent}
                    iconAccentClass={iconAccentClass}
                  />

                  {/* Card Main Body Content */}
                  <div className="p-6 sm:p-7">
                    {/* Title */}
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mb-3 group-hover:text-[#5683FC] transition-colors duration-300">
                      {service.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs sm:text-sm leading-relaxed text-slate-600 font-normal mb-5 line-clamp-3">
                      {service.description}
                    </p>

                    {/* Quick Feature Chips / Tags (Top 3 features if available) */}
                    {service.features && service.features.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {service.features.slice(0, 3).map((feat, fIdx) => (
                          <span 
                            key={fIdx}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100/90 border border-slate-200/70 text-slate-700 text-[11px] font-semibold"
                          >
                            <Check className="w-3 h-3 text-[#5683FC] shrink-0" />
                            <span className="truncate max-w-[150px]">{feat}</span>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Accordion for Remaining Features if expanded */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="pt-4 mt-2 border-t border-slate-100 space-y-3">
                            <p className="text-[11px] font-bold text-[#F20530] uppercase tracking-wider flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-[#5683FC]" />
                              <span>{t.servicesCapabilities}</span>
                            </p>
                            
                            {service.features && service.features.length > 0 ? (
                              <ul className="space-y-2">
                                {service.features.map((feat, fIdx) => (
                                  <li key={fIdx} className="flex items-start gap-2 text-xs text-slate-800 font-medium">
                                    <Check className="w-3.5 h-3.5 text-[#F20530] shrink-0 mt-0.5" />
                                    <span>{feat}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : service.fullDescription ? (
                              <p className="text-xs text-slate-700 leading-relaxed font-medium whitespace-pre-line">
                                {service.fullDescription}
                              </p>
                            ) : (
                              <p className="text-xs text-slate-400 italic font-normal">
                                {isRtl ? 'لا تتوفر تفاصيل إضافية حالياً لهذه الخدمة.' : 'No additional capabilities listed for this service.'}
                              </p>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Card Bottom Footer */}
                <div className="px-6 sm:px-7 py-4 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between mt-auto">
                  <button
                    onClick={() => toggleExpand(service.id)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 hover:text-[#5683FC] transition-colors cursor-pointer"
                  >
                    <span>{isExpanded ? t.servicesCollapse : t.servicesExpand}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-[#F20530]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#5683FC]" />
                    )}
                  </button>

                  <a
                    href="#portfolio"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#5683FC] hover:text-[#F20530] transition-colors cursor-pointer group/link"
                  >
                    <span>{isRtl ? 'معرض الأعمال' : 'View Work'}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 transform transition-transform duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>
        )}

      </div>
    </section>
  );
}


