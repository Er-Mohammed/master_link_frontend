import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { ServiceMediaItem } from '../types';
import { storeMediaBlob } from '../utils/indexedDbStorage';
import { 
  Palette, 
  Code2, 
  Smartphone, 
  TrendingUp, 
  Video, 
  FileText, 
  Layers, 
  Globe,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  Upload,
  X,
  Check,
  Search,
  Settings,
  HelpCircle,
  Eye,
  Info,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Bold,
  Italic,
  Link,
  List,
  Quote,
  Heading1,
  Heading2,
  Terminal,
  RefreshCw,
  Trash2,
  Lock,
  Globe2,
  FileCode,
  SlidersHorizontal,
  Plus,
  Minus,
  Image as ImageIcon,
  Star,
  MoveUp,
  MoveDown,
  FolderOpen,
  Database,
  Tag,
  Hash,
  ToggleLeft,
  ToggleRight,
  Copy,
  Play,
  Film,
  Youtube,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Map of string names to Lucide icons
const iconList = [
  { name: 'Code2', component: Code2, labelEn: 'Software & Web Dev', labelAr: 'تطوير البرمجيات والويب' },
  { name: 'Palette', component: Palette, labelEn: 'Design & Branding', labelAr: 'تصميم وهوية بصرية' },
  { name: 'Smartphone', component: Smartphone, labelEn: 'Mobile Apps', labelAr: 'تطبيقات الهواتف الذكية' },
  { name: 'TrendingUp', component: TrendingUp, labelEn: 'Marketing & SEO', labelAr: 'تسويق ونمو رقمي' },
  { name: 'Video', component: Video, labelEn: 'Video Production', labelAr: 'إنتاج وتصوير مرئي' },
  { name: 'FileText', component: FileText, labelEn: 'Copywriting & Studies', labelAr: 'كتابة محتوى ودراسات' },
  { name: 'Layers', component: Layers, labelEn: 'Cloud & Infrastructure', labelAr: 'بنية سحابية وأنظمة' },
  { name: 'Globe', component: Globe, labelEn: 'Digital Solutions', labelAr: 'حلول ومتاجر رقمية' },
];

const PRESET_MEDIA = [
  { url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80', name: 'web-engineering-overview.jpg', alt: 'Web Engineering Architecture' },
  { url: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=800&q=80', name: 'mobile-app-ui.jpg', alt: 'Mobile Application User Interface' },
  { url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80', name: 'branding-guidelines.jpg', alt: 'Visual Identity & Branding Concept' },
  { url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80', name: 'digital-marketing-analytics.jpg', alt: 'Marketing Dashboard & Analytics' },
  { url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80', name: 'commercial-media-production.jpg', alt: 'Professional Video & Photography' },
  { url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80', name: 'consulting-technical-blueprint.jpg', alt: 'Digital Consulting & Technical Plan' },
];

interface ServiceItemPayload {
  id?: string;
  nameEn: string;
  nameAr: string;
  title?: string;
  slug: string;
  descriptionEn: string;
  descriptionAr: string;
  shortDescription?: string;
  fullDescription?: string;
  displayOrder: number;
  sortOrder?: number;
  status: 'active' | 'hidden' | 'deleted';
  isActive?: boolean;
  iconName: string;
  coverImage: string;
  videoUrl?: string;
  videoType?: 'direct' | 'youtube' | 'vimeo';
  createdAt: string;
  featuresEn: string[];
  featuresAr: string[];
  serviceMedia?: ServiceMediaItem[];
}

interface ServiceEditorProps {
  serviceId?: string | null;
  onClose: () => void;
  onSave: (service: Partial<ServiceItemPayload>) => Promise<void> | void;
  existingService?: any;
}

export function ServiceEditor({ serviceId, onClose, onSave, existingService }: ServiceEditorProps) {
  const { language, isRtl } = useLanguage();
  const { mediaItems, addMediaItem } = useData();
  
  // Page states
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState(false);
  const [apiErrorMessage, setApiErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});


  // 1. Field: Title (✅ المطلوب)
  const [titleAr, setTitleAr] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [activeLangTab, setActiveLangTab] = useState<'ar' | 'en'>('ar');

  // 2. Field: Slug (✅ المطلوب)
  const [slug, setSlug] = useState('');
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [showSlugWarning, setShowSlugWarning] = useState(false);

  // 3. Field: Short Description (اختياري)
  const [shortDescriptionAr, setShortDescriptionAr] = useState('');
  const [shortDescriptionEn, setShortDescriptionEn] = useState('');

  // 4. Field: Full Description (اختياري)
  const [fullDescriptionAr, setFullDescriptionAr] = useState('');
  const [fullDescriptionEn, setFullDescriptionEn] = useState('');
  const [activeEditorTab, setActiveEditorTab] = useState<'ar' | 'en'>('ar');
  const [editorSelection, setEditorSelection] = useState<string | null>(null);

  // 5. Field: Sort Order (اختياري)
  const [sortOrder, setSortOrder] = useState<number>(1);

  // 6. Field: Is Active (✅ المطلوب)
  const [isActive, setIsActive] = useState<boolean>(true);

  // 7. Field: Media / Images & Video (حسب التصميم - علاقة service_media)
  const [serviceMediaList, setServiceMediaList] = useState<ServiceMediaItem[]>([]);
  const [isMediaLibraryModalOpen, setIsMediaLibraryModalOpen] = useState(false);
  const [editingMediaIndex, setEditingMediaIndex] = useState<number | null>(null);
  const [mediaSearchQuery, setMediaSearchQuery] = useState('');
  
  // Video Integration State
  const [videoUrl, setVideoUrl] = useState('');
  const [videoType, setVideoType] = useState<'direct' | 'youtube' | 'vimeo'>('youtube');
  const [videoInputTab, setVideoInputTab] = useState<'url' | 'file'>('url');
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // Auxiliary / Design Fields
  const [iconName, setIconName] = useState('Code2');
  const [searchIconQuery, setSearchIconQuery] = useState('');
  const [featuresAr, setFeaturesAr] = useState<string[]>(['', '', '']);
  const [featuresEn, setFeaturesEn] = useState<string[]>(['', '', '']);
  const [createdAtDate, setCreatedAtDate] = useState('');

  // Quick Preset Suggestions for Capabilities & Solutions
  const CAPABILITY_PRESETS = [
    { ar: 'تصميم وبرمجة مخصصة عالية الأداء', en: 'Custom High-Performance Engineering' },
    { ar: 'بنية تحتية سحابية واستضافة آمنة', en: 'Secure Cloud Infrastructure & Hosting' },
    { ar: 'دعم فني مستمر واستجابة 24/7 وفق SLA', en: '24/7 Continuous SLA Technical Support' },
    { ar: 'تحسين محركات البحث وتجربة المستخدم (SEO & UX)', en: 'Advanced SEO & Conversion UX Architecture' },
    { ar: 'ربط برمجي وتكامل API والأنظمة المصغرة', en: 'Custom API & Microservices Integrations' },
    { ar: 'إدارة الحملات الإعلانية الممولة وتحليل ROI', en: 'Data-Driven Paid Ad Campaigns & ROI Tracking' },
    { ar: 'تصميم ومونتاج فيديوهات الموشن جرافيك', en: 'Motion Graphics & Commercial Video Production' },
    { ar: 'صياغة استراتيجية الهوية البصرية المتكاملة', en: 'Comprehensive Brand & Visual Identity Strategy' },
    { ar: 'أتمتة العمليات والحلول بالذكاء الاصطناعي', en: 'AI Workflow Automation & Smart Solutions' },
    { ar: 'لوحات تحكم تفاعلية وتقارير أداء دورية', en: 'Interactive Dashboards & Periodic Performance Audits' }
  ];

  // Helper methods to dynamically manage capabilities
  const addCapabilityItem = (lang: 'ar' | 'en') => {
    if (lang === 'ar') {
      setFeaturesAr(prev => [...prev, '']);
    } else {
      setFeaturesEn(prev => [...prev, '']);
    }
  };

  const updateCapabilityItem = (lang: 'ar' | 'en', index: number, val: string) => {
    if (lang === 'ar') {
      setFeaturesAr(prev => {
        const next = [...prev];
        next[index] = val;
        return next;
      });
    } else {
      setFeaturesEn(prev => {
        const next = [...prev];
        next[index] = val;
        return next;
      });
    }
  };

  const removeCapabilityItem = (lang: 'ar' | 'en', index: number) => {
    if (lang === 'ar') {
      setFeaturesAr(prev => prev.filter((_, i) => i !== index));
    } else {
      setFeaturesEn(prev => prev.filter((_, i) => i !== index));
    }
  };

  const moveCapabilityItem = (lang: 'ar' | 'en', index: number, dir: 'up' | 'down') => {
    const list = lang === 'ar' ? [...featuresAr] : [...featuresEn];
    const targetIdx = dir === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;
    if (lang === 'ar') {
      setFeaturesAr(list);
    } else {
      setFeaturesEn(list);
    }
  };

  const addPresetCapabilityToForm = (preset: { ar: string; en: string }) => {
    // Add to Arabic if not present
    setFeaturesAr(prev => {
      const clean = prev.filter(f => f.trim() !== '');
      if (clean.includes(preset.ar)) return prev;
      return [...clean, preset.ar];
    });
    // Add to English if not present
    setFeaturesEn(prev => {
      const clean = prev.filter(f => f.trim() !== '');
      if (clean.includes(preset.en)) return prev;
      return [...clean, preset.en];
    });
  };

  // File Upload Handling
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadLabel, setUploadLabel] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);

  // Auto slug generation helper from title
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[\s_]+/g, '-')
      .replace(/[^a-z0-9\-]/g, '')
      .replace(/--+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Convert Arabic text or transliterated names into safe URL slug
  const handleAutoGenerateSlug = () => {
    const sourceText = titleEn || titleAr;
    if (!sourceText) return;
    
    // If text contains English characters, use direct slugify
    let generated = generateSlug(sourceText);
    if (!generated) {
      // Fallback timestamp slug for pure non-latin if empty
      generated = `service-${Date.now().toString().slice(-4)}`;
    }
    setSlug(generated);
    setIsSlugManuallyEdited(true);
  };

  // Simulate premium skeleton loader
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  // Initialize form with existing values or database defaults
  useEffect(() => {
    if (existingService) {
      const initTitleAr = existingService.nameAr || existingService.title_ar || existingService.title || '';
      const initTitleEn = existingService.nameEn || existingService.title_en || existingService.title || '';
      setTitleAr(initTitleAr);
      setTitleEn(initTitleEn);

      setSlug(existingService.slug || generateSlug(initTitleEn || initTitleAr || 'service'));
      setIsSlugManuallyEdited(true);

      setShortDescriptionAr(existingService.descriptionAr || existingService.short_description_ar || existingService.short_description || existingService.description || '');
      setShortDescriptionEn(existingService.descriptionEn || existingService.short_description_en || existingService.short_description || existingService.description || '');

      setFullDescriptionAr(existingService.full_description_ar || existingService.full_description || existingService.fullDescription || `### تفاصيل ومنهجية الخدمة\nنقدم حلولاً متقدمة ومتكاملة لـ ${initTitleAr || 'هذه الخدمة'}.\n\n- أداء فائق وموثوقية عالية\n- دعم وتطوير مستمر وفق أفضل الممارسات\n- بنية تحتية آمنة ومتوافقة مع المعايير القياسية`);
      setFullDescriptionEn(existingService.full_description_en || existingService.full_description || existingService.fullDescription || `### Methodology & Scope\nWe deliver enterprise-grade execution for ${initTitleEn || 'this service'}.\n\n- High availability architecture\n- Continuous support and SLA compliance\n- Modern responsive interfaces`);

      const orderVal = existingService.sort_order ?? existingService.sortOrder ?? existingService.displayOrder ?? 1;
      setSortOrder(Number(orderVal));

      const activeVal = existingService.is_active !== undefined 
        ? Boolean(existingService.is_active) 
        : existingService.status !== 'hidden' && existingService.status !== 'deleted';
      setIsActive(activeVal);

      setIconName(existingService.iconName || existingService.icon_name || 'Code2');
      setCreatedAtDate(existingService.createdAt || existingService.created_at || new Date().toISOString().split('T')[0]);

      // Initialize service_media relationship
      if (existingService.serviceMedia && existingService.serviceMedia.length > 0) {
        setServiceMediaList(existingService.serviceMedia);
      } else if (existingService.service_media && existingService.service_media.length > 0) {
        setServiceMediaList(existingService.service_media);
      } else if (existingService.coverImage) {
        // Wrap existing cover image into service_media relation
        setServiceMediaList([
          {
            id: `sm-${Date.now()}-1`,
            media_id: `med-${Date.now()}`,
            file_path: existingService.coverImage,
            file_name: 'primary-cover.jpg',
            alt_text: initTitleAr || 'Service Primary Image',
            sort_order: 1,
            is_primary: true
          }
        ]);
      } else {
        setServiceMediaList([
          {
            id: `sm-${Date.now()}-1`,
            media_id: `med-default-1`,
            file_path: PRESET_MEDIA[0].url,
            file_name: PRESET_MEDIA[0].name,
            alt_text: PRESET_MEDIA[0].alt,
            sort_order: 1,
            is_primary: true
          }
        ]);
      }

      // Video initialization
      setVideoUrl(existingService.videoUrl || existingService.video_url || '');
      setVideoType(existingService.videoType || existingService.video_type || 'youtube');

      // Features / Capabilities initialization
      const initFeatAr = existingService.featuresAr && existingService.featuresAr.length > 0
        ? existingService.featuresAr
        : (existingService.features && existingService.features.length > 0 ? existingService.features : []);
      const initFeatEn = existingService.featuresEn && existingService.featuresEn.length > 0
        ? existingService.featuresEn
        : (existingService.features && existingService.features.length > 0 ? existingService.features : []);

      setFeaturesAr(initFeatAr.length > 0 ? initFeatAr : ['', '', '']);
      setFeaturesEn(initFeatEn.length > 0 ? initFeatEn : ['', '', '']);
    } else {
      // New record defaults
      setTitleAr('');
      setTitleEn('');
      setSlug('');
      setIsSlugManuallyEdited(false);
      setShortDescriptionAr('');
      setShortDescriptionEn('');
      setFullDescriptionAr('');
      setFullDescriptionEn('');
      setSortOrder(1);
      setIsActive(true);
      setIconName('Code2');
      setVideoUrl('');
      setVideoType('youtube');
      setCreatedAtDate(new Date().toISOString().split('T')[0]);
      setFeaturesAr(['', '', '']);
      setFeaturesEn(['', '', '']);

      // Default primary media item in service_media relationship
      setServiceMediaList([
        {
          id: `sm-${Date.now()}-1`,
          media_id: `med-preset-0`,
          file_path: PRESET_MEDIA[0].url,
          file_name: PRESET_MEDIA[0].name,
          alt_text: PRESET_MEDIA[0].alt,
          sort_order: 1,
          is_primary: true
        }
      ]);
    }
  }, [existingService]);

  // Clean slug characters handler
  const cleanAndSetSlug = (val: string) => {
    setIsSlugManuallyEdited(true);
    const cleaned = val
      .toLowerCase()
      .replace(/[^a-z0-9\-_]+/g, '-')
      .replace(/--+/g, '-')
      .replace(/^-+/g, '');
    
    setSlug(cleaned);
    
    if (val !== cleaned) {
      setShowSlugWarning(true);
      setTimeout(() => setShowSlugWarning(false), 3000);
    }
  };

  // Media Management Helpers (service_media relationship)
  const primaryMedia = serviceMediaList.find(m => m.is_primary) || serviceMediaList[0];

  const setPrimaryMedia = (index: number) => {
    setServiceMediaList(prev => prev.map((item, idx) => ({
      ...item,
      is_primary: idx === index
    })));
  };

  const removeMediaItem = (index: number) => {
    setServiceMediaList(prev => {
      const filtered = prev.filter((_, idx) => idx !== index);
      // Ensure at least one primary exists if items remain
      if (filtered.length > 0 && !filtered.some(m => m.is_primary)) {
        filtered[0].is_primary = true;
      }
      return filtered;
    });
  };

  const updateMediaAltText = (index: number, alt: string) => {
    setServiceMediaList(prev => prev.map((item, idx) => idx === index ? { ...item, alt_text: alt } : item));
  };

  const updateMediaSortOrder = (index: number, order: number) => {
    setServiceMediaList(prev => prev.map((item, idx) => idx === index ? { ...item, sort_order: order } : item));
  };

  const addPresetMediaToGallery = (preset: typeof PRESET_MEDIA[0]) => {
    const isFirst = serviceMediaList.length === 0;
    const newItem: ServiceMediaItem = {
      id: `sm-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      media_id: `med-${Date.now()}`,
      file_path: preset.url,
      file_name: preset.name,
      alt_text: preset.alt,
      sort_order: serviceMediaList.length + 1,
      is_primary: isFirst
    };
    setServiceMediaList(prev => [...prev, newItem]);
  };

  // Upload file processor (Images & Videos) with client-side image compression & local video handling
  const processUploadedMedia = (file: File, forceVideo: boolean = false) => {
    if (!file) return;
    const isImage = !forceVideo && file.type.startsWith('image/');
    const isVideo = forceVideo || file.type.startsWith('video/') || file.name.match(/\.(mp4|webm|ogg|mov|m4v)$/i);
    if (!isImage && !isVideo) return;

    setIsUploading(true);
    setUploadProgress(15);
    setUploadLabel(isVideo ? (isRtl ? 'جاري معالجة ورفع ملف الفيديو من جهازك...' : 'Processing video from device...') : (isRtl ? 'جاري ضغط ومعالجة الصورة...' : 'Processing image...'));

    // If it's an image, resize and compress it to lightweight JPEG/WebP to prevent exceeding localStorage quota
    if (isImage) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const rawResult = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          const maxDim = 1280;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedUrl = canvas.toDataURL('image/jpeg', 0.82);
            finalizeMediaAddition(compressedUrl, file.name, file.size, false);
          } else {
            finalizeMediaAddition(rawResult, file.name, file.size, false);
          }
        };
        img.onerror = () => {
          finalizeMediaAddition(rawResult, file.name, file.size, false);
        };
        img.src = rawResult;
      };
      reader.readAsDataURL(file);
    } else {
      // For video files from device, generate blob object URL and persist into IndexedDB
      const mediaKey = `vid-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      const videoBlobUrl = URL.createObjectURL(file);
      
      // Store blob in IndexedDB for lifetime persistence across reloads/sessions
      storeMediaBlob(mediaKey, file).catch(() => {});

      // Also generate a snapshot poster frame from the uploaded video
      const videoElement = document.createElement('video');
      videoElement.preload = 'metadata';
      videoElement.src = videoBlobUrl;
      videoElement.muted = true;
      videoElement.playsInline = true;

      setUploadProgress(60);

      videoElement.onloadeddata = () => {
        videoElement.currentTime = Math.min(1.0, videoElement.duration || 0.5);
      };

      videoElement.onseeked = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = videoElement.videoWidth || 640;
          canvas.height = videoElement.videoHeight || 360;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
            const posterData = canvas.toDataURL('image/jpeg', 0.8);
            finalizeMediaAddition(videoBlobUrl, file.name, file.size, true, posterData, mediaKey);
            return;
          }
        } catch {
          // fallback
        }
        finalizeMediaAddition(videoBlobUrl, file.name, file.size, true, undefined, mediaKey);
      };

      videoElement.onerror = () => {
        finalizeMediaAddition(videoBlobUrl, file.name, file.size, true, undefined, mediaKey);
      };
    }
  };

  const finalizeMediaAddition = (mediaPath: string, fileName: string, fileSize: number, isVideo: boolean, posterUrl?: string, mediaKey?: string) => {
    setUploadProgress(100);
    setTimeout(() => {
      const isFirst = serviceMediaList.length === 0;
      const defaultPoster = posterUrl || (isVideo 
        ? 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80' 
        : mediaPath);

      const newItem: ServiceMediaItem = {
        id: `sm-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        media_id: mediaKey || `med-upload-${Date.now()}`,
        file_path: defaultPoster,
        file_name: fileName,
        alt_text: fileName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' '),
        sort_order: serviceMediaList.length + 1,
        is_primary: isFirst,
        file_size: fileSize,
        file_type: isVideo ? 'video' : 'image',
        media_type: isVideo ? 'video' : 'image',
        video_url: isVideo ? mediaPath : undefined,
        video_type: isVideo ? 'direct' : undefined
      };
      setServiceMediaList(prev => [...prev, newItem]);
      if (isVideo) {
        setVideoUrl(mediaPath);
        setVideoType('direct');
      }
      setIsUploading(false);
      setUploadProgress(0);
      setUploadLabel('');
    }, 250);
  };

  // Add external video link (YouTube / Vimeo / Direct URL)
  const addVideoMediaItem = (url: string, type: 'youtube' | 'vimeo' | 'direct' = 'youtube') => {
    if (!url.trim()) return;
    const isFirst = serviceMediaList.length === 0;
    
    // Auto detect video thumbnail / placeholder
    let defaultPoster = 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80';
    if (type === 'youtube') {
      const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
      if (ytMatch && ytMatch[1]) {
        defaultPoster = `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
      }
    }

    const newItem: ServiceMediaItem = {
      id: `sm-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      media_id: `med-video-${Date.now()}`,
      file_path: defaultPoster,
      file_name: type === 'youtube' ? 'YouTube Video Showcase' : type === 'vimeo' ? 'Vimeo Video Showcase' : 'Direct Video Stream',
      alt_text: titleAr || titleEn || 'Service Promotional Video',
      sort_order: serviceMediaList.length + 1,
      is_primary: isFirst,
      file_type: 'video',
      media_type: 'video',
      video_url: url.trim(),
      video_type: type
    };

    setServiceMediaList(prev => [...prev, newItem]);
    setVideoUrl(url.trim());
    setVideoType(type);
  };

  // Rich Text Editor Toolbar Append Action
  const appendRichText = (tag: string) => {
    const isEn = activeEditorTab === 'en';
    const setText = isEn ? setFullDescriptionEn : setFullDescriptionAr;

    let appendText = '';
    switch (tag) {
      case 'bold': appendText = ' **نص عريض** '; break;
      case 'italic': appendText = ' *نص مائل* '; break;
      case 'link': appendText = ' [رابط المرجع](https://masterlink.sa) '; break;
      case 'list': appendText = '\n- ميزة ومخرج رئيسي أول\n- ميزة ومخرج رئيسي ثانٍ\n'; break;
      case 'quote': appendText = '\n> قيمة مضافة واستراتيجية تنفيذية\n'; break;
      case 'h1': appendText = '\n# عنوان رئيسي للخدمة\n'; break;
      case 'h2': appendText = '\n## محور تفصيلي\n'; break;
      case 'code': appendText = ' `code_snippet` '; break;
    }
    setText(prev => prev + appendText);
    setEditorSelection(tag);
    setTimeout(() => setEditorSelection(null), 800);
  };

  // Form Submission Validation and Packaging
  const handleSaveSubmit = async (e?: React.FormEvent, forceStatus?: boolean) => {
    if (e) e.preventDefault();

    setApiErrorMessage(null);
    setFieldErrors({});

    // 1. Validation Check: Title is Required (✅)
    const effectiveTitleAr = titleAr.trim();
    const effectiveTitleEn = titleEn.trim();
    if (!effectiveTitleAr && !effectiveTitleEn) {
      setActiveLangTab(isRtl ? 'ar' : 'en');
      alert(isRtl ? 'حقل اسم الخدمة (Title) مطلوب ولا يمكن تركه فارغاً.' : 'Service Title is required.');
      return;
    }

    // 2. Validation Check: Slug is Required (✅)
    let effectiveSlug = slug.trim();
    if (!effectiveSlug) {
      effectiveSlug = generateSlug(effectiveTitleEn || effectiveTitleAr) || `service-${Date.now().toString().slice(-4)}`;
      setSlug(effectiveSlug);
    }

    const currentActiveState = forceStatus !== undefined ? forceStatus : isActive;

    setIsSaving(true);

    try {
      const payload: Partial<ServiceItemPayload> = {
        nameAr: effectiveTitleAr || effectiveTitleEn,
        nameEn: effectiveTitleEn || effectiveTitleAr,
        title: isRtl ? (effectiveTitleAr || effectiveTitleEn) : (effectiveTitleEn || effectiveTitleAr),
        slug: effectiveSlug,
        shortDescription: shortDescriptionAr || shortDescriptionEn,
        descriptionAr: shortDescriptionAr || shortDescriptionEn,
        descriptionEn: shortDescriptionEn || shortDescriptionAr,
        fullDescription: fullDescriptionAr || fullDescriptionEn,
        sortOrder: Number(sortOrder) || 1,
        displayOrder: Number(sortOrder) || 1,
        isActive: currentActiveState,
        status: currentActiveState ? 'active' : 'hidden',
        iconName: iconName,
        coverImage: primaryMedia?.file_path || PRESET_MEDIA[0].url,
        videoUrl: videoUrl.trim() || undefined,
        videoType: videoUrl.trim() ? videoType : undefined,
        createdAt: createdAtDate || new Date().toISOString().split('T')[0],
        featuresAr: featuresAr.filter(f => f.trim() !== ''),
        featuresEn: featuresEn.filter(f => f.trim() !== ''),
        serviceMedia: serviceMediaList
      };

      await onSave(payload);
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      setIsSaving(false);
      if (err?.errors) {
        setFieldErrors(err.errors);
      }
      if (err?.message) {
        setApiErrorMessage(err.message);
      } else {
        setApiErrorMessage(isRtl ? 'حدث خطأ أثناء حفظ الخدمة في الخادم.' : 'Failed to save service on server.');
      }
    }
  };


  const filteredIcons = iconList.filter(icon => 
    icon.name.toLowerCase().includes(searchIconQuery.toLowerCase()) ||
    icon.labelEn.toLowerCase().includes(searchIconQuery.toLowerCase()) ||
    icon.labelAr.includes(searchIconQuery)
  );

  return (
    <div className={`space-y-8 bg-[#F8FAFC] -m-6 p-6 sm:p-8 min-h-screen pb-32 ${isRtl ? 'text-right' : 'text-left'}`}>
      
      {/* Save Success Overlay Modal */}
      <AnimatePresence>
        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex flex-col items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.85, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full text-center space-y-5 shadow-2xl border border-slate-100"
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
                <Check className="w-9 h-9 stroke-[3]" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-xl font-black text-slate-900">
                  {isRtl ? 'تم حفظ بيانات الخدمة بنجاح' : 'Service Saved Successfully'}
                </h3>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                  {isRtl 
                    ? 'تم حفظ الحقول المتوافقة مع قاعدة البيانات وتحديث فهرس الخدمات.' 
                    : 'The schema-aligned service record has been stored.'}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Header Navigation & Breadcrumb */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <nav className={`flex items-center gap-2 text-xs font-bold text-slate-400 select-none ${isRtl ? 'flex-row-reverse' : ''}`}>
          <span onClick={onClose} className="hover:text-slate-700 transition-colors cursor-pointer">{isRtl ? 'لوحة التحكم' : 'Dashboard'}</span>
          {isRtl ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          <span onClick={onClose} className="hover:text-slate-700 transition-colors cursor-pointer">{isRtl ? 'إدارة الخدمات' : 'Services Management'}</span>
          {isRtl ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          <span className="text-[#F20530] font-extrabold">
            {serviceId ? (isRtl ? 'تعديل الخدمة' : 'Edit Service') : (isRtl ? 'إضافة خدمة جديدة' : 'Add New Service')}
          </span>
        </nav>
      </div>

      {/* 2. Top Header Title & Actions */}
      <section className="flex flex-col gap-4 pb-6 border-b border-slate-200">
        {/* Header Action Buttons */}
        <div className={`flex flex-wrap items-center justify-between gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            <span>{isRtl ? 'إلغاء ورجوع' : 'Cancel'}</span>
          </button>

          <div className={`flex items-center gap-2.5 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <button
              type="button"
              onClick={() => handleSaveSubmit(undefined, false)}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>{isRtl ? 'حفظ كمسودة (مخفية)' : 'Save as Draft'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleSaveSubmit(undefined, true)}
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-[#F20530] hover:bg-rose-600 text-white text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-rose-100 disabled:opacity-50 active:scale-95"
            >
              {isSaving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              <span>{isRtl ? 'حفظ وتفعيل الخدمة' : 'Save & Publish'}</span>
            </button>
          </div>
        </div>

        {/* Title & Description Texts under the buttons */}
        <div className={`space-y-1 ${isRtl ? 'text-right' : 'text-left'}`}>
          <h1 className="text-2xl sm:text-3xl font-black text-[#111827] tracking-tight">
            {serviceId 
              ? (isRtl ? `تعديل خدمة: ${titleAr || titleEn || 'الخدمة'}` : `Edit: ${titleEn || titleAr || 'Service'}`) 
              : (isRtl ? 'إضافة خدمة جديدة' : 'Create New Service')}
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 max-w-2xl leading-relaxed">
            {isRtl 
              ? 'أدخل بيانات وتفاصيل الخدمة، الصور المرتبطة بها، وحالة تفعيلها لعرضها على الموقع.' 
              : 'Configure service details, associated media, and publishing status for the website.'}
          </p>
        </div>
      </section>

      {/* Validation / API Error Banner */}
      {apiErrorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-800 text-xs font-semibold flex items-start gap-3 shadow-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-sm text-rose-900">{apiErrorMessage}</p>
            {Object.entries(fieldErrors).map(([field, messages]) => (
              <p key={field} className="text-rose-700 font-medium">
                • <strong className="font-bold">{field}:</strong> {Array.isArray(messages) ? messages.join(', ') : String(messages)}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* 3. Main Form Grid */}
      <form onSubmit={(e) => handleSaveSubmit(e)} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* LEFT & CENTER COLUMN (2/3) - Core Schema Fields */}
        <div className="lg:col-span-2 space-y-6">

          {/* SECTION 1: Title & Slug */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 space-y-5 shadow-xs relative">
            <div className={`flex items-center justify-between pb-4 border-b border-slate-100 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-50 text-[#F20530]">
                  <FileText className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-none">
                    {isRtl ? 'اسم ورابط الخدمة' : 'Service Title & URL Slug'}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    {isRtl ? 'المعلومات الأساسية لتعريف الخدمة وعنوانها على الموقع' : 'Primary details and web address for the service'}
                  </span>
                </div>
              </div>

              {/* Language Switcher Tabs */}
              <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/60">
                <button
                  type="button"
                  onClick={() => setActiveLangTab('ar')}
                  className={`px-3 py-1 text-xs font-extrabold rounded-lg transition-all ${
                    activeLangTab === 'ar' 
                      ? 'bg-white text-[#F20530] shadow-xs' 
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  العربية (AR)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveLangTab('en')}
                  className={`px-3 py-1 text-xs font-extrabold rounded-lg transition-all ${
                    activeLangTab === 'en' 
                      ? 'bg-white text-[#F20530] shadow-xs' 
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  English (EN)
                </button>
              </div>
            </div>

            {/* 1. Field: Title */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800">
                  <Tag className="w-3.5 h-3.5 text-[#F20530]" />
                  <span>{isRtl ? 'اسم الخدمة' : 'Service Title'}</span>
                  <span className="text-[#F20530] font-black">*</span>
                </label>
                <span className="text-[10px] font-mono text-slate-400">
                  {activeLangTab === 'ar' ? `${titleAr.length} حرف` : `${titleEn.length} chars`}
                </span>
              </div>

              {activeLangTab === 'ar' ? (
                <input
                  type="text"
                  required
                  placeholder="مثال: تطوير المواقع والمتاجر الإلكترونية"
                  value={titleAr}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTitleAr(val);
                    if (!isSlugManuallyEdited && (!titleEn || titleEn.trim() === '')) {
                      const roman = generateSlug(val);
                      if (roman) setSlug(roman);
                    }
                  }}
                  className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold outline-none focus:bg-white focus:border-[#F20530] focus:ring-4 focus:ring-[#F20530]/5 transition-all text-right"
                />
              ) : (
                <input
                  type="text"
                  required
                  placeholder="e.g. Web Development & E-Commerce Platforms"
                  value={titleEn}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTitleEn(val);
                    if (!isSlugManuallyEdited) {
                      setSlug(generateSlug(val));
                    }
                  }}
                  className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold outline-none focus:bg-white focus:border-[#F20530] focus:ring-4 focus:ring-[#F20530]/5 transition-all text-left"
                />
              )}
            </div>

            {/* 2. Field: Slug */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800">
                  <Hash className="w-3.5 h-3.5 text-[#F20530]" />
                  <span>{isRtl ? 'الرابط المختصر (Slug)' : 'URL Slug Path'}</span>
                  <span className="text-[#F20530] font-black">*</span>
                </label>
                
                <button
                  type="button"
                  onClick={handleAutoGenerateSlug}
                  className="text-[10px] font-bold text-[#F20530] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>{isRtl ? 'توليد تلقائي من الاسم' : 'Auto-Generate'}</span>
                </button>
              </div>

              <div className="relative">
                <span className={`absolute inset-y-0 ${isRtl ? 'right-4' : 'left-4'} flex items-center pointer-events-none text-slate-400 text-xs font-mono select-none`}>
                  masterlink.sa/services/
                </span>
                <input
                  type="text"
                  required
                  placeholder="web-development"
                  value={slug}
                  onChange={(e) => cleanAndSetSlug(e.target.value)}
                  className={`block w-full py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono font-bold outline-none focus:bg-white focus:border-[#F20530] transition-all ${
                    isRtl ? 'pr-40 pl-10 text-right' : 'pl-40 pr-10 text-left'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(`https://masterlink.sa/services/${slug}`);
                    setCopiedSlug(true);
                    setTimeout(() => setCopiedSlug(false), 2000);
                  }}
                  className={`absolute inset-y-0 ${isRtl ? 'left-3' : 'right-3'} flex items-center text-slate-400 hover:text-slate-700 cursor-pointer`}
                  title={isRtl ? 'نسخ الرابط' : 'Copy link'}
                >
                  {copiedSlug ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {showSlugWarning && (
                <p className="text-[10px] text-amber-600 font-bold flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{isRtl ? 'تم تنظيف الرابط تلقائياً ليطابق معايير الروابط (أحرف صغيرة وشرطات فقط).' : 'Auto-corrected to standard slug format.'}</span>
                </p>
              )}
            </div>
          </div>

          {/* SECTION 2: Descriptions (Short & Full) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 space-y-6 shadow-xs relative">
            <div className={`flex items-center gap-2.5 pb-4 border-b border-slate-100 justify-start`}>
              <div className="p-2 rounded-xl bg-slate-50 text-slate-700 border border-slate-200">
                <FileCode className="w-4.5 h-4.5 text-[#F20530]" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-none">
                  {isRtl ? 'أوصاف الخدمة' : 'Service Descriptions'}
                </h3>
                <span className="text-[10px] text-slate-400 font-semibold">
                  {isRtl ? 'وصف موجز لبطاقات العرض وشرح تفصيلي لصفحة الخدمة' : 'Card summaries and full narrative description'}
                </span>
              </div>
            </div>

            {/* 3. Field: Short Description */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800">
                  <span>{isRtl ? 'الوصف الموجز' : 'Short Description'}</span>
                </label>
                <span className="text-[10px] font-mono text-slate-400">
                  {activeLangTab === 'ar' ? `${shortDescriptionAr.length}/180` : `${shortDescriptionEn.length}/180`}
                </span>
              </div>

              {activeLangTab === 'ar' ? (
                <textarea
                  rows={2}
                  maxLength={180}
                  placeholder="وصف موجز يظهر في بطاقة الخدمة بالصفحة الرئيسية..."
                  value={shortDescriptionAr}
                  onChange={(e) => setShortDescriptionAr(e.target.value)}
                  className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold outline-none focus:bg-white focus:border-[#F20530] transition-all resize-none text-right"
                />
              ) : (
                <textarea
                  rows={2}
                  maxLength={180}
                  placeholder="Concise overview displayed on homepage service cards..."
                  value={shortDescriptionEn}
                  onChange={(e) => setShortDescriptionEn(e.target.value)}
                  className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold outline-none focus:bg-white focus:border-[#F20530] transition-all resize-none text-left"
                />
              )}
            </div>

            {/* 4. Field: Full Description */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800">
                  <span>{isRtl ? 'الوصف التفصيلي والمنهجية' : 'Full Description & Scope'}</span>
                </label>
              </div>

              {/* Rich text / Markdown Editor Box */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 focus-within:border-[#F20530] transition-colors">
                {/* Toolbar */}
                <div className="border-b border-slate-200 bg-white p-2 flex flex-wrap items-center gap-1">
                  {[
                    { icon: Heading1, tag: 'h1', tooltip: 'Heading 1' },
                    { icon: Heading2, tag: 'h2', tooltip: 'Heading 2' },
                    { icon: Bold, tag: 'bold', tooltip: 'Bold text' },
                    { icon: Italic, tag: 'italic', tooltip: 'Italic text' },
                    { icon: Link, tag: 'link', tooltip: 'Add hyperlink' },
                    { icon: List, tag: 'list', tooltip: 'Unordered List' },
                    { icon: Quote, tag: 'quote', tooltip: 'Blockquote' },
                    { icon: Terminal, tag: 'code', tooltip: 'Code snippet' }
                  ].map((btn, i) => {
                    const IconComp = btn.icon;
                    const isSelected = editorSelection === btn.tag;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => appendRichText(btn.tag)}
                        className={`p-1.5 rounded-lg border border-transparent hover:border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-900 transition-all cursor-pointer ${
                          isSelected ? 'bg-rose-50 text-[#F20530] border-rose-200 scale-95' : ''
                        }`}
                        title={btn.tooltip}
                      >
                        <IconComp className="w-4 h-4" />
                      </button>
                    );
                  })}
                </div>

                {/* Editor Textarea */}
                {activeLangTab === 'ar' ? (
                  <textarea
                    rows={6}
                    placeholder="اكتب تفاصيل الخدمة والمنهجية الكاملة والمخرجات..."
                    value={fullDescriptionAr}
                    onChange={(e) => setFullDescriptionAr(e.target.value)}
                    className="block w-full p-4 bg-white/80 text-xs sm:text-sm font-semibold outline-none text-slate-800 leading-relaxed text-right focus:bg-white transition-colors"
                  />
                ) : (
                  <textarea
                    rows={6}
                    placeholder="Write complete service methodology and technical deliverables..."
                    value={fullDescriptionEn}
                    onChange={(e) => setFullDescriptionEn(e.target.value)}
                    className="block w-full p-4 bg-white/80 text-xs sm:text-sm font-mono outline-none text-slate-800 leading-relaxed text-left focus:bg-white transition-colors"
                  />
                )}
              </div>
            </div>

          </div>

          {/* SECTION 3: Detailed Capabilities & Solutions (ملف القدرات والخدمات والحلول المتاحة) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 space-y-6 shadow-xs relative">
            <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 ${isRtl ? 'sm:flex-row-reverse' : ''}`}>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                  <Sparkles className="w-4.5 h-4.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-none">
                      {isRtl ? 'ملف القدرات والخدمات والحلول المتاحة' : 'Detailed Capabilities & Available Solutions'}
                    </h3>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {activeLangTab === 'ar' ? `${featuresAr.filter(f => f.trim() !== '').length} عناصر` : `${featuresEn.filter(f => f.trim() !== '').length} items`}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold block mt-1">
                    {isRtl 
                      ? 'أضف قدرات وحلول الخدمة وميزاتها التي تظهر في بطاقة الخدمة عند توسيعها من قبل الزائر' 
                      : 'Define detailed execution capabilities displayed when visitors expand the service card'}
                  </span>
                </div>
              </div>

              {/* Language Switcher Tabs */}
              <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/60 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveLangTab('ar')}
                  className={`px-3 py-1 text-xs font-extrabold rounded-lg transition-all ${
                    activeLangTab === 'ar' 
                      ? 'bg-white text-[#F20530] shadow-xs' 
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  العربية ({featuresAr.filter(f => f.trim() !== '').length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveLangTab('en')}
                  className={`px-3 py-1 text-xs font-extrabold rounded-lg transition-all ${
                    activeLangTab === 'en' 
                      ? 'bg-white text-[#F20530] shadow-xs' 
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  English ({featuresEn.filter(f => f.trim() !== '').length})
                </button>
              </div>
            </div>

            {/* Smart Presets Suggestions Bar */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-indigo-50/30 border border-indigo-100/60 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{isRtl ? 'مقترحات ذكية للقدرات والحلول (إضافة بنقرة واحدة):' : 'Smart Capability Suggestions (1-Click Add):'}</span>
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">
                  {isRtl ? 'انقر على أي ميزة لإدراجها فوراً' : 'Click to instantly append'}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {CAPABILITY_PRESETS.map((preset, pIdx) => {
                  const currentList = activeLangTab === 'ar' ? featuresAr : featuresEn;
                  const targetText = activeLangTab === 'ar' ? preset.ar : preset.en;
                  const isAlreadyAdded = currentList.some(item => item.trim().toLowerCase() === targetText.trim().toLowerCase());

                  return (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => addPresetCapabilityToForm(preset)}
                      disabled={isAlreadyAdded}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                        isAlreadyAdded 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 opacity-60 cursor-default' 
                          : 'bg-white hover:bg-indigo-50 hover:border-indigo-300 text-slate-700 hover:text-indigo-700 border-slate-200/80 shadow-2xs'
                      }`}
                    >
                      {isAlreadyAdded ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Plus className="w-3 h-3 text-indigo-500" />
                      )}
                      <span>{activeLangTab === 'ar' ? preset.ar : preset.en}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Capabilities List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800">
                  <CheckCircle className="w-4 h-4 text-[#F20530]" />
                  <span>
                    {isRtl 
                      ? (activeLangTab === 'ar' ? 'قائمة القدرات والحلول المتاحة (باللغة العربية):' : 'قائمة القدرات والحلول المتاحة (باللغة الإنجليزية):') 
                      : (activeLangTab === 'ar' ? 'Capabilities & Solutions List (Arabic):' : 'Capabilities & Solutions List (English):')}
                  </span>
                </label>

                <button
                  type="button"
                  onClick={() => addCapabilityItem(activeLangTab)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-[#F20530] text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isRtl ? 'إضافة قدرة جديدة' : 'Add New Capability'}</span>
                </button>
              </div>

              {/* Items Container */}
              <div className="space-y-2.5">
                {(activeLangTab === 'ar' ? featuresAr : featuresEn).map((feat, index) => {
                  const currentArray = activeLangTab === 'ar' ? featuresAr : featuresEn;
                  const isFirst = index === 0;
                  const isLast = index === currentArray.length - 1;

                  return (
                    <div 
                      key={index}
                      className="group p-2.5 sm:p-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/60 hover:bg-white transition-all flex items-center gap-2.5 shadow-2xs"
                    >
                      {/* Numbering Badge */}
                      <span className="w-6 h-6 rounded-lg bg-white border border-slate-200 text-[11px] font-black text-slate-500 flex items-center justify-center shrink-0 font-mono">
                        {index + 1}
                      </span>

                      {/* Text Input */}
                      <div className="flex-1">
                        <input
                          type="text"
                          value={feat}
                          onChange={(e) => updateCapabilityItem(activeLangTab, index, e.target.value)}
                          placeholder={
                            isRtl 
                              ? (activeLangTab === 'ar' ? `مثال: تصميم وتطوير متجر إلكتروني متكامل أو استشارات دورية` : `e.g. End-to-End Cloud Infrastructure Setup`) 
                              : `e.g. Custom API integrations & continuous SLA monitoring`
                          }
                          className={`w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm font-semibold outline-none focus:border-[#F20530] focus:ring-2 focus:ring-rose-50 transition-all ${
                            activeLangTab === 'ar' ? 'text-right' : 'text-left'
                          }`}
                        />
                      </div>

                      {/* Reorder and Delete Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => moveCapabilityItem(activeLangTab, index, 'up')}
                          disabled={isFirst}
                          className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                          title={isRtl ? 'تحريك لأعلى' : 'Move up'}
                        >
                          <MoveUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveCapabilityItem(activeLangTab, index, 'down')}
                          disabled={isLast}
                          className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                          title={isRtl ? 'تحريك لأسفل' : 'Move down'}
                        >
                          <MoveDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeCapabilityItem(activeLangTab, index)}
                          className="p-1.5 rounded-lg border border-transparent hover:border-rose-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-all cursor-pointer"
                          title={isRtl ? 'حذف هذه القدرة' : 'Delete capability'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {(activeLangTab === 'ar' ? featuresAr : featuresEn).length === 0 && (
                  <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-xl space-y-2">
                    <p className="text-xs font-bold text-slate-500">
                      {isRtl ? 'لم تتم إضافة قدرات تفصيلية بعد' : 'No capabilities added yet'}
                    </p>
                    <button
                      type="button"
                      onClick={() => addCapabilityItem(activeLangTab)}
                      className="px-4 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-[#F20530] transition-colors inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isRtl ? 'إضافة أول قدرة أو حل' : 'Add First Capability'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Bottom Quick Add Bar */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => addCapabilityItem(activeLangTab)}
                  className="text-xs font-bold text-[#F20530] hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isRtl ? '+ إضافة سطر قدرة جديد' : '+ Add another capability line'}</span>
                </button>

                <span className="text-[10px] text-slate-400 font-semibold">
                  {isRtl ? 'يتم عرض أول ٣ قدرات في بطاقة الخدمة، وكامل القدرات عند توسيعها.' : 'Top 3 shown as quick tags, all shown when expanded.'}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 4: Media & Images & Video */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 space-y-6 shadow-xs relative">
            <div className={`flex items-center justify-between pb-4 border-b border-slate-100 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-50 text-[#F20530]">
                  <ImageIcon className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-none">
                    {isRtl ? 'صور وفيديوهات الخدمة' : 'Service Media (Photos & Videos)'}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    {isRtl ? 'إمكانية إضافة عدة صور وتحديد غلاف أساسي ودمج مقاطع فيديو' : 'Add multiple images, set primary cover, and attach promotional videos'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-mono">
                  {serviceMediaList.length} {isRtl ? 'عنصر وسائط' : 'Media items'}
                </span>
              </div>
            </div>

            {/* Hidden upload inputs for images and video */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  processUploadedMedia(e.target.files[0], false);
                }
              }}
              accept="image/*"
              className="hidden"
            />
            <input
              type="file"
              ref={videoFileInputRef}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  processUploadedMedia(e.target.files[0], true);
                }
              }}
              accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-m4v,video/*"
              className="hidden"
            />

            {/* Upload & Add Video Controls Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Image Upload Area */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    processUploadedMedia(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
                  isDragging 
                    ? 'border-[#F20530] bg-rose-50/30' 
                    : 'border-slate-200 hover:border-[#F20530]/60 hover:bg-slate-50/60'
                }`}
              >
                {isUploading ? (
                  <div className="space-y-2 py-2">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#F20530]" />
                    <span className="text-xs font-bold text-slate-600 block">
                      {uploadLabel || (isRtl ? `جاري معالجة ورفع الملف (${uploadProgress}%)` : `Processing upload (${uploadProgress}%)`)}
                    </span>
                  </div>
                ) : (
                  <div className="space-y-1.5 select-none">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-[#F20530] mx-auto">
                      <Upload className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-black text-slate-800">
                      {isRtl ? 'رفع صور للخدمة من جهازك' : 'Upload Images From Device'}
                    </p>
                    <p className="text-[10px] text-slate-400 font-semibold">
                      PNG, JPG, WebP (انقر لتحديد أو سحب وإفلات)
                    </p>
                  </div>
                )}
              </div>

              {/* Video Upload & Attachment Area (Device File or Link) */}
              <div className="border border-indigo-100 rounded-2xl p-4 bg-gradient-to-br from-indigo-50/50 to-slate-50 flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-600">
                      <Film className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900">
                        {isRtl ? 'فيديو تعريفي للخدمة' : 'Service Showcase Video'}
                      </h4>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {isRtl ? 'رفع مباشر من جهازك أو إضافة رابط خارجي' : 'Upload file from device or add web link'}
                      </span>
                    </div>
                  </div>

                  <div className="flex bg-white p-0.5 rounded-lg border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setVideoInputTab('file')}
                      className={`px-2 py-1 rounded-md text-[10px] font-extrabold transition-all cursor-pointer ${
                        videoInputTab === 'file' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {isRtl ? 'من الجهاز' : 'From Device'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setVideoInputTab('url')}
                      className={`px-2 py-1 rounded-md text-[10px] font-extrabold transition-all cursor-pointer ${
                        videoInputTab === 'url' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {isRtl ? 'رابط' : 'Link / URL'}
                    </button>
                  </div>
                </div>

                {videoInputTab === 'file' ? (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => videoFileInputRef.current?.click()}
                      className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-indigo-300 hover:border-indigo-500 bg-white hover:bg-indigo-50/50 text-indigo-700 font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                    >
                      <Upload className="w-4 h-4" />
                      <span>{isRtl ? 'اختر ملف فيديو من جهازك (MP4 / WebM / MOV)' : 'Select Video File From Device (MP4 / MOV)'}</span>
                    </button>
                    <span className="text-[9px] text-center block text-slate-400 font-medium">
                      {isRtl ? 'يتم تحضير وعرض الفيديو مباشرة في سلايدر الخدمة ومنافذ العرض' : 'Video will be rendered directly in service slider & lightbox'}
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-1.5">
                      <select
                        value={videoType}
                        onChange={(e) => setVideoType(e.target.value as any)}
                        className="px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#F20530]"
                      >
                        <option value="youtube">YouTube</option>
                        <option value="vimeo">Vimeo</option>
                        <option value="direct">Direct MP4</option>
                      </select>

                      <input
                        type="url"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder={videoType === 'youtube' ? 'https://youtube.com/watch?v=...' : 'https://...'}
                        className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-[#F20530]"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (videoUrl.trim()) {
                          addVideoMediaItem(videoUrl, videoType);
                        }
                      }}
                      disabled={!videoUrl.trim()}
                      className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-[#F20530] text-white text-xs font-extrabold transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{isRtl ? 'إدراج رابط الفيديو' : 'Attach Video Link'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Preset Image Library Fast Attach */}
            <div className="space-y-2.5">
              <span className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                {isRtl ? 'أو اختر صوراً جاهزة فائقة الدقة من مكتبة النظام:' : 'Or choose curated photos from media library:'}
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                {PRESET_MEDIA.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => addPresetMediaToGallery(preset)}
                    className="group relative h-16 rounded-xl overflow-hidden border border-slate-200 hover:border-[#F20530] transition-all cursor-pointer"
                    title={preset.alt}
                  >
                    <img src={preset.url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Plus className="w-4 h-4 text-white" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Attached Media List */}
            {serviceMediaList.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="block text-xs font-black text-slate-800">
                    {isRtl ? 'معرض الوسائط التابع للخدمة (الصور والفيديوهات):' : 'Attached Service Media Gallery:'}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    {isRtl ? 'انقر على النجمة لتحديد الصورة كغلاف أساسي' : 'Click star to set as primary cover'}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {serviceMediaList.map((media, idx) => {
                    const isVideoItem = media.file_type === 'video' || media.media_type === 'video' || !!media.video_url;

                    return (
                      <div 
                        key={media.id || idx}
                        className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                          media.is_primary 
                            ? 'border-[#F20530]/40 bg-rose-50/20 shadow-xs' 
                            : 'border-slate-200 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3.5 w-full sm:w-auto">
                          <div className="relative w-16 h-14 rounded-lg overflow-hidden shrink-0 border border-slate-200 bg-slate-950">
                            {isVideoItem ? (
                              <div className="relative w-full h-full flex items-center justify-center group/vid">
                                <img src={media.file_path} alt="" className="w-full h-full object-cover opacity-80" />
                                <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center">
                                  <Play className="w-4 h-4 text-white fill-white" />
                                </div>
                              </div>
                            ) : (
                              <img src={media.file_path} alt="" className="w-full h-full object-cover" />
                            )}

                            {media.is_primary && (
                              <div className="absolute top-1 right-1 p-0.5 rounded-full bg-[#F20530] text-white shadow-xs" title={isRtl ? 'صورة الغلاف الأساسية' : 'Primary Cover'}>
                                <Star className="w-2.5 h-2.5 fill-current" />
                              </div>
                            )}
                          </div>

                          <div className="space-y-1 flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-slate-800 truncate">
                                {media.file_name || `Media Item #${idx + 1}`}
                              </span>

                              {isVideoItem && (
                                <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 flex items-center gap-1">
                                  <Film className="w-2.5 h-2.5" />
                                  <span>{media.video_type?.toUpperCase() || 'VIDEO'}</span>
                                </span>
                              )}

                              {media.is_primary && (
                                <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-[#F20530] text-white">
                                  {isRtl ? 'صورة الغلاف الأساسية' : 'Primary Cover'}
                                </span>
                              )}
                            </div>
                            
                            {/* Alt text / Video URL field */}
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-400 font-bold">
                                {isVideoItem ? 'URL:' : 'Alt:'}
                              </span>
                              {isVideoItem ? (
                                <span className="text-[11px] font-mono text-slate-600 truncate max-w-[240px]">
                                  {media.video_url || media.file_path}
                                </span>
                              ) : (
                                <input
                                  type="text"
                                  value={media.alt_text || ''}
                                  onChange={(e) => updateMediaAltText(idx, e.target.value)}
                                  placeholder={isRtl ? 'نص بديل للصورة...' : 'Image alt text...'}
                                  className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-[11px] font-semibold text-slate-700 outline-none focus:bg-white focus:border-[#F20530] w-48"
                                />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className={`flex items-center gap-2 shrink-0 ${isRtl ? 'flex-row-reverse' : ''}`}>
                          {!media.is_primary && !isVideoItem && (
                            <button
                              type="button"
                              onClick={() => setPrimaryMedia(idx)}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[10px] font-extrabold text-slate-700 transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <Star className="w-3 h-3 text-amber-500" />
                              <span>{isRtl ? 'تعيين كغلاف أساسي' : 'Set as Cover'}</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => removeMediaItem(idx)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title={isRtl ? 'حذف من الخدمة' : 'Remove from service'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN (1/3) - Publishing, Sort Order, Is Active & Live Preview */}
        <div className="space-y-6">

          {/* CARD 1: Status & Sort Order Controls */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#F20530]" />
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center gap-1.5">
              <Settings className="w-4 h-4 text-slate-400" />
              <span>{isRtl ? 'إعدادات النشر والحالة' : 'Publishing & Status'}</span>
            </h4>

            {/* 6. Field: Is Active */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1 text-xs font-extrabold text-slate-800">
                  <span>{isRtl ? 'حالة الخدمة بالموقع' : 'Service Status'}</span>
                  <span className="text-[#F20530] font-black">*</span>
                </label>
              </div>

              {/* State Switcher Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsActive(true)}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    isActive 
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-2 ring-emerald-400/20' 
                      : 'bg-white text-slate-400 border-slate-200 hover:text-slate-700'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{isRtl ? 'مفعلة (ظاهرة بالموقع)' : 'Active (Live)'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsActive(false)}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    !isActive 
                      ? 'bg-amber-50 text-amber-800 border-amber-300 ring-2 ring-amber-400/20' 
                      : 'bg-white text-slate-400 border-slate-200 hover:text-slate-700'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>{isRtl ? 'مسودة (مخفية)' : 'Draft (Hidden)'}</span>
                </button>
              </div>
            </div>

            {/* 5. Field: Sort Order */}
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1 text-xs font-extrabold text-slate-800">
                  <span>{isRtl ? 'ترتيب الظهور' : 'Display Order'}</span>
                </label>
              </div>

              <div className="flex items-center border border-slate-200 bg-slate-50 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setSortOrder(prev => Math.max(1, prev - 1))}
                  className="p-3 text-slate-500 hover:text-slate-800 transition-colors bg-white border-r border-slate-200 cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  min={1}
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-transparent text-center text-xs sm:text-sm font-extrabold text-slate-800 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setSortOrder(prev => prev + 1)}
                  className="p-3 text-slate-500 hover:text-slate-800 transition-colors bg-white border-l border-slate-200 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Icon Picker */}
            <div className="space-y-2 pt-2">
              <label className="flex items-center justify-between text-xs font-extrabold text-slate-800">
                <span>{isRtl ? 'أيقونة الخدمة البصرية' : 'Service Display Icon'}</span>
                <span className="text-[10px] font-mono text-slate-400">{iconName}</span>
              </label>

              <div className="grid grid-cols-4 gap-2">
                {iconList.map((item, idx) => {
                  const IconComp = item.component;
                  const isChecked = iconName === item.name;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setIconName(item.name)}
                      className={`p-2.5 rounded-xl border transition-all flex items-center justify-center cursor-pointer ${
                        isChecked 
                          ? 'border-[#F20530] bg-rose-50 text-[#F20530] shadow-xs' 
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                      }`}
                      title={isRtl ? item.labelAr : item.labelEn}
                    >
                      <IconComp className="w-5 h-5" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* CARD 2: Interactive Live Preview of Service Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs relative">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-slate-400" />
              <span>{isRtl ? 'معاينة البطاقة على الموقع' : 'Live Website Card Preview'}</span>
            </h4>

            {/* Service card replication */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="h-32 w-full overflow-hidden bg-slate-100 relative">
                {primaryMedia?.file_path ? (
                  <img src={primaryMedia.file_path} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                )}

                <div className={`absolute -bottom-4 ${isRtl ? 'right-4' : 'left-4'} w-10 h-10 bg-white rounded-xl shadow-md border border-slate-100 flex items-center justify-center text-[#F20530]`}>
                  {React.createElement(iconList.find(i => i.name === iconName)?.component || Code2, { className: 'w-5 h-5' })}
                </div>
              </div>

              <div className="p-5 pt-6 space-y-2 text-right">
                <div className="flex items-center justify-between">
                  <h5 className="text-sm font-extrabold text-slate-900 leading-tight">
                    {isRtl ? (titleAr || titleEn || 'اسم الخدمة') : (titleEn || titleAr || 'Service Title')}
                  </h5>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {isActive ? (isRtl ? 'مفعلة' : 'Active') : (isRtl ? 'مسودة' : 'Draft')}
                  </span>
                </div>

                <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">
                  {isRtl 
                    ? (shortDescriptionAr || shortDescriptionEn || 'وصف مختصر للخدمة يظهر هنا للزوار والعملاء.') 
                    : (shortDescriptionEn || shortDescriptionAr || 'Short description appears here for website visitors.')}
                </p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-[#F20530]">
                  <span>{isRtl ? 'اكتشف المزيد ←' : 'Learn More →'}</span>
                  <span className="font-mono text-slate-400">#{sortOrder}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* BOTTOM STICKY ACTION BAR */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-4 px-6 sm:px-10 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className={`flex items-center gap-2 text-xs font-bold text-slate-600 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <span className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span>
              {isRtl 
                ? (serviceId ? 'أنت تقوم بتعديل بيانات الخدمة الحالية' : 'أنت تقوم بإدخال بيانات خدمة جديدة')
                : (serviceId ? 'Editing existing service' : 'Creating new service record')}
            </span>
          </div>

          <div className={`flex items-center gap-3 w-full sm:w-auto ${isRtl ? 'flex-row-reverse' : ''}`}>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-extrabold transition-all cursor-pointer"
            >
              {isRtl ? 'إلغاء' : 'Cancel'}
            </button>

            <button
              type="button"
              onClick={() => handleSaveSubmit(undefined, false)}
              disabled={isSaving}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-extrabold transition-all cursor-pointer"
            >
              {isRtl ? 'حفظ كمسودة (مخفية)' : 'Save Draft'}
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-[#F20530] hover:bg-rose-600 text-white text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-rose-200 disabled:opacity-50"
            >
              {isSaving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              <span>{isRtl ? 'حفظ وتأكيد الخدمة' : 'Save & Publish Service'}</span>
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}
