import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { adminMediaApi, adminServicesApi, mapLaravelServiceToItem, LaravelMedia } from '../services/api';
import { ServiceMediaItem } from '../types';
import { 
  ChevronRight, 
  ChevronLeft, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  RefreshCw, 
  AlertCircle, 
  FileText, 
  Tag, 
  Hash, 
  Copy, 
  Check, 
  FileCode, 
  ImageIcon, 
  Upload, 
  Star, 
  Trash2, 
  Settings, 
  Eye, 
  Minus, 
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ServiceItemPayload {
  id?: string;
  title: string;
  slug: string;
  shortDescription?: string | null;
  fullDescription?: string | null;
  sortOrder: number;
  isActive: boolean;
  coverImage?: string | null;
  serviceMedia?: ServiceMediaItem[];
  createdAt?: string;
}

interface ServiceEditorProps {
  serviceId?: string | null;
  onClose: () => void;
  onSave: (service: Partial<ServiceItemPayload>) => Promise<void> | void;
  existingService?: any;
}

export function ServiceEditor({ serviceId, onClose, onSave, existingService }: ServiceEditorProps) {
  const { isRtl } = useLanguage();

  // Page & Save states
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState(false);
  const [apiErrorMessage, setApiErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // 1. Field: Title (max 150)
  const [title, setTitle] = useState('');

  // 2. Field: Slug (max 180)
  const [slug, setSlug] = useState('');
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [showSlugWarning, setShowSlugWarning] = useState(false);

  // 3. Field: Short Description
  const [shortDescription, setShortDescription] = useState('');

  // 4. Field: Full Description
  const [fullDescription, setFullDescription] = useState('');

  // 5. Field: Sort Order (default 0)
  const [sortOrder, setSortOrder] = useState<number>(0);

  // 6. Field: Is Active (default true)
  const [isActive, setIsActive] = useState<boolean>(true);

  // 7. Field: Media List (service_media)
  const [serviceMediaList, setServiceMediaList] = useState<ServiceMediaItem[]>([]);
  const [isMediaLibraryModalOpen, setIsMediaLibraryModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Media Library fetch states
  const [libraryMediaItems, setLibraryMediaItems] = useState<LaravelMedia[]>([]);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState<boolean>(false);
  const [libraryFetchError, setLibraryFetchError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch real media from Laravel API when library modal is opened
  useEffect(() => {
    let isMounted = true;
    if (isMediaLibraryModalOpen) {
      setIsLoadingLibrary(true);
      setLibraryFetchError(null);
      adminMediaApi.getAll({ per_page: 50 })
        .then(res => {
          if (isMounted) {
            setLibraryMediaItems(res?.data || []);
          }
        })
        .catch(err => {
          if (isMounted) {
            setLibraryFetchError(err?.message || (isRtl ? 'فشل تحميل وسائط المكتبة من الخادم.' : 'Failed to fetch media library items from server.'));
          }
        })
        .finally(() => {
          if (isMounted) {
            setIsLoadingLibrary(false);
          }
        });
    }
    return () => {
      isMounted = false;
    };
  }, [isMediaLibraryModalOpen, isRtl]);

  // Fetch detailed service (including media relation) when editing
  useEffect(() => {
    let isMounted = true;
    if (serviceId) {
      adminServicesApi.getById(serviceId).then(res => {
        if (isMounted && res?.data) {
          const mapped = mapLaravelServiceToItem(res.data);
          setTitle(mapped.title || '');
          setSlug(mapped.slug || '');
          setShortDescription(mapped.shortDescription || '');
          setFullDescription(mapped.fullDescription || '');
          setSortOrder(mapped.sortOrder ?? 0);
          setIsActive(mapped.isActive ?? true);
          setIsSlugManuallyEdited(true);
          if (mapped.serviceMedia && Array.isArray(mapped.serviceMedia)) {
            setServiceMediaList(mapped.serviceMedia);
          }
        }
      }).catch(() => {
        // Fallback to existingService prop
      });
    }
    return () => {
      isMounted = false;
    };
  }, [serviceId]);

  // Populate data from prop if provided
  useEffect(() => {
    if (existingService) {
      setTitle(prev => prev || existingService.title || existingService.nameAr || existingService.nameEn || '');
      setSlug(prev => prev || existingService.slug || '');
      setShortDescription(prev => prev || existingService.shortDescription || existingService.descriptionAr || existingService.descriptionEn || '');
      setFullDescription(prev => prev || existingService.fullDescription || '');
      setSortOrder(prev => (prev !== undefined && prev !== 0) ? prev : (existingService.sortOrder ?? existingService.sort_order ?? 0));
      setIsActive(prev => prev ?? (existingService.isActive ?? existingService.is_active ?? true));
      setIsSlugManuallyEdited(true);

      const mediaFromProp = (existingService.serviceMedia && Array.isArray(existingService.serviceMedia) && existingService.serviceMedia.length > 0)
        ? existingService.serviceMedia
        : (existingService.media && Array.isArray(existingService.media) && existingService.media.length > 0)
          ? existingService.media.map((m: any, idx: number) => ({
              id: `sm-${m.id}`,
              media_id: String(m.id),
              file_path: m.url || m.file_path,
              file_name: m.file_name || `Media ${idx + 1}`,
              alt_text: m.alt_text || '',
              sort_order: m.sort_order ?? idx,
              is_primary: idx === 0,
              file_size: m.file_size,
              file_type: m.media_type === 'video' ? 'video' : 'image'
            }))
          : null;

      if (mediaFromProp && mediaFromProp.length > 0) {
        setServiceMediaList(prev => (prev && prev.length > 0) ? prev : mediaFromProp);
      }
    }
  }, [existingService]);

  // Slug Helpers
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 180);
  };

  const cleanAndSetSlug = (val: string) => {
    const cleaned = val
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .slice(0, 180);

    setSlug(cleaned);
    setIsSlugManuallyEdited(true);
    if (val !== cleaned) {
      setShowSlugWarning(true);
      setTimeout(() => setShowSlugWarning(false), 3000);
    }
  };

  const handleAutoGenerateSlug = () => {
    const generated = generateSlug(title) || `service-${Date.now().toString().slice(-4)}`;
    setSlug(generated);
    setIsSlugManuallyEdited(false);
  };

  // Upload Media Helper
  const processUploadedMedia = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(20);
    setApiErrorMessage(null);

    try {
      setUploadProgress(50);
      const res = await adminMediaApi.upload(file);
      setUploadProgress(90);

      const mediaObj: LaravelMedia | undefined = res.data;
      if (mediaObj && mediaObj.id) {
        const isFirst = serviceMediaList.length === 0;
        const newItem: ServiceMediaItem = {
          id: `sm-${mediaObj.id}`,
          media_id: String(mediaObj.id),
          file_path: mediaObj.url,
          file_name: mediaObj.file_name,
          alt_text: mediaObj.alt_text || '',
          sort_order: serviceMediaList.length,
          is_primary: isFirst,
          file_size: mediaObj.file_size,
          file_type: mediaObj.media_type === 'video' ? 'video' : 'image'
        };

        setServiceMediaList(prev => [...prev, newItem]);
      }
    } catch (err: any) {
      setApiErrorMessage(err?.message || (isRtl ? 'فشل رفع الملف.' : 'File upload failed.'));
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Select Media from Library (using real LaravelMedia)
  const selectMediaFromLibrary = (media: LaravelMedia) => {
    const numericId = String(media.id);
    const exists = serviceMediaList.some(m => String(m.media_id) === numericId);
    if (exists) return;

    const isFirst = serviceMediaList.length === 0;
    const newItem: ServiceMediaItem = {
      id: `sm-${media.id}`,
      media_id: numericId,
      file_path: media.url,
      file_name: media.file_name || `Media ${media.id}`,
      alt_text: media.alt_text || '',
      sort_order: serviceMediaList.length,
      is_primary: isFirst,
      file_size: media.file_size,
      file_type: media.media_type === 'video' ? 'video' : 'image'
    };

    setServiceMediaList(prev => [...prev, newItem]);
    setIsMediaLibraryModalOpen(false);
  };

  const removeMediaItem = (index: number) => {
    setServiceMediaList(prev => {
      const filtered = prev.filter((_, i) => i !== index);
      if (prev[index]?.is_primary && filtered.length > 0) {
        filtered[0].is_primary = true;
      }
      return filtered;
    });
  };

  const setPrimaryMedia = (index: number) => {
    setServiceMediaList(prev =>
      prev.map((item, i) => ({
        ...item,
        is_primary: i === index
      }))
    );
  };

  const updateMediaAltText = (index: number, text: string) => {
    setServiceMediaList(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], alt_text: text };
      return copy;
    });
  };

  const primaryMedia = serviceMediaList.find(m => m.is_primary) || serviceMediaList[0];

  // Submit Handler
  const handleSaveSubmit = async (e?: React.FormEvent, forceStatus?: boolean) => {
    if (e) e.preventDefault();

    setApiErrorMessage(null);
    setFieldErrors({});

    const effectiveTitle = title.trim().slice(0, 150);
    if (!effectiveTitle) {
      alert(isRtl ? 'حقل اسم الخدمة (Title) مطلوب ولا يمكن تركه فارغاً.' : 'Service Title is required.');
      return;
    }

    let effectiveSlug = slug.trim().slice(0, 180);
    if (!effectiveSlug) {
      effectiveSlug = generateSlug(effectiveTitle) || `service-${Date.now().toString().slice(-4)}`;
      setSlug(effectiveSlug);
    }

    const currentActiveState = forceStatus !== undefined ? forceStatus : isActive;

    setIsSaving(true);

    try {
      const payload: Partial<ServiceItemPayload> = {
        title: effectiveTitle,
        slug: effectiveSlug,
        shortDescription: shortDescription.trim() || null,
        fullDescription: fullDescription.trim() || null,
        sortOrder: Number(sortOrder) || 0,
        isActive: currentActiveState,
        coverImage: primaryMedia?.file_path || null,
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

        <div className={`space-y-1 ${isRtl ? 'text-right' : 'text-left'}`}>
          <h1 className="text-2xl sm:text-3xl font-black text-[#111827] tracking-tight">
            {serviceId 
              ? (isRtl ? `تعديل خدمة: ${title || 'الخدمة'}` : `Edit: ${title || 'Service'}`) 
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
            </div>

            {/* 1. Field: Title (max 150) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800">
                  <Tag className="w-3.5 h-3.5 text-[#F20530]" />
                  <span>{isRtl ? 'اسم الخدمة' : 'Service Title'}</span>
                  <span className="text-[#F20530] font-black">*</span>
                </label>
                <span className="text-[10px] font-mono text-slate-400">
                  {title.length}/150
                </span>
              </div>

              <input
                type="text"
                required
                maxLength={150}
                placeholder={isRtl ? 'مثال: تطوير المواقع والمتاجر الإلكترونية' : 'e.g. Web Development & E-Commerce Platforms'}
                value={title}
                onChange={(e) => {
                  const val = e.target.value;
                  setTitle(val);
                  if (!isSlugManuallyEdited) {
                    const generated = generateSlug(val);
                    if (generated) setSlug(generated);
                  }
                }}
                className={`block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold outline-none focus:bg-white focus:border-[#F20530] focus:ring-4 focus:ring-[#F20530]/5 transition-all ${isRtl ? 'text-right' : 'text-left'}`}
              />
            </div>

            {/* 2. Field: Slug (max 180) */}
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
                  maxLength={180}
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
              <label className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800">
                <span>{isRtl ? 'الوصف الموجز' : 'Short Description'}</span>
              </label>

              <textarea
                rows={3}
                placeholder={isRtl ? 'وصف موجز يظهر في بطاقة الخدمة بالصفحة الرئيسية...' : 'Concise overview displayed on homepage service cards...'}
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                className={`block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold outline-none focus:bg-white focus:border-[#F20530] transition-all resize-none ${isRtl ? 'text-right' : 'text-left'}`}
              />
            </div>

            {/* 4. Field: Full Description (Capabilities, Services & Solutions Profile) */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800">
                  <CheckCircle className="w-3.5 h-3.5 text-[#F20530]" />
                  <span>{isRtl ? 'ملف القدرات والخدمات والحلول المتاحة (الوصف التفصيلي)' : 'Capabilities, Services & Solutions Profile (Full Description)'}</span>
                </label>
                <span className="text-[10px] text-slate-400 font-semibold">
                  {isRtl ? 'يظهر عند الضغط على "عرض التفاصيل" في الموقع' : 'Displays when clicking "View Details" on website'}
                </span>
              </div>

              <textarea
                rows={7}
                placeholder={isRtl 
                  ? "أدخل عناصر ومخرجات الخدمة والحلول المتاحة (يمكنك إدخال كل عنصر في سطر جديد ليظهر كقائمة نقاط في بطاقة الخدمة):\n- تطوير المواقع والتطبيقات\n- تصميم واجهات المستخدم والمتاجر\n- التكامل المتقدم والربط مع الأنظمة" 
                  : "Enter service capabilities and available solutions (one item per line for bullet points):\n- Web & App Development\n- UI/UX & E-Commerce Design\n- Advanced API Integrations"}
                value={fullDescription}
                onChange={(e) => setFullDescription(e.target.value)}
                className={`block w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold outline-none text-slate-800 leading-relaxed focus:bg-white focus:border-[#F20530] transition-colors ${isRtl ? 'text-right' : 'text-left'}`}
              />
              <p className="text-[11px] text-slate-500 font-medium">
                {isRtl 
                  ? '💡 ملاحظة: كتابة الأسطر مسبوقة بـ (-) أو في أسطر مستقلة ستقوم بعرضها كقائمة نقاط تفاعلية أنيقة في الموقع العام.' 
                  : '💡 Tip: Entering bullet items or newlines formats them into interactive capability list items on the website.'}
              </p>
            </div>
          </div>

          {/* SECTION 3: Media Attachment & Gallery */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 space-y-6 shadow-xs relative">
            <div className={`flex items-center justify-between pb-4 border-b border-slate-100 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-50 text-[#F20530]">
                  <ImageIcon className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-none">
                    {isRtl ? 'وسائط وصور الخدمة' : 'Service Media'}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    {isRtl ? 'إمكانية إضافة وصور وتحديد صورة غلاف أساسية' : 'Attach media items and set a primary cover'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-mono">
                  {serviceMediaList.length} {isRtl ? 'عنصر وسائط' : 'Media items'}
                </span>
              </div>
            </div>

            {/* Hidden upload input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  processUploadedMedia(e.target.files[0]);
                }
              }}
              accept="image/*"
              className="hidden"
            />

            {/* Upload Area */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
                      {isRtl ? `جاري معالجة ورفع الملف (${uploadProgress}%)` : `Processing upload (${uploadProgress}%)`}
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

              {/* Media Library Selector */}
              <div 
                onClick={() => setIsMediaLibraryModalOpen(true)}
                className="border border-slate-200 hover:border-slate-300 rounded-2xl p-5 bg-gradient-to-br from-slate-50 to-white flex flex-col items-center justify-center text-center cursor-pointer transition-all space-y-2"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <p className="text-xs font-black text-slate-800">
                  {isRtl ? 'اختيار من مكتبة الوسائط' : 'Select from Media Library'}
                </p>
                <p className="text-[10px] text-slate-400 font-semibold">
                  {isRtl ? 'اختر من الصور المرفوعة مسبقاً في النظام' : 'Choose existing media items from library'}
                </p>
              </div>
            </div>

            {/* Attached Media List */}
            {serviceMediaList.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="block text-xs font-black text-slate-800">
                    {isRtl ? 'معرض الوسائط التابع للخدمة:' : 'Attached Service Media Gallery:'}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    {isRtl ? 'انقر على النجمة لتحديد الصورة كغلاف أساسي' : 'Click star to set as primary cover'}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {serviceMediaList.map((media, idx) => (
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
                          <img src={media.file_path} alt="" className="w-full h-full object-cover" />
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
                            {media.is_primary && (
                              <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-[#F20530] text-white">
                                {isRtl ? 'صورة الغلاف الأساسية' : 'Primary Cover'}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400 font-bold">Alt:</span>
                            <input
                              type="text"
                              value={media.alt_text || ''}
                              onChange={(e) => updateMediaAltText(idx, e.target.value)}
                              placeholder={isRtl ? 'نص بديل للصورة...' : 'Image alt text...'}
                              className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-[11px] font-semibold text-slate-700 outline-none focus:bg-white focus:border-[#F20530] w-48"
                            />
                          </div>
                        </div>
                      </div>

                      <div className={`flex items-center gap-2 shrink-0 ${isRtl ? 'flex-row-reverse' : ''}`}>
                        {!media.is_primary && (
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
                  ))}
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
              <label className="flex items-center gap-1 text-xs font-extrabold text-slate-800">
                <span>{isRtl ? 'حالة الخدمة بالموقع' : 'Service Status'}</span>
                <span className="text-[#F20530] font-black">*</span>
              </label>

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
              <label className="flex items-center gap-1 text-xs font-extrabold text-slate-800">
                <span>{isRtl ? 'ترتيب الظهور' : 'Display Order'}</span>
              </label>

              <div className="flex items-center border border-slate-200 bg-slate-50 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setSortOrder(prev => Math.max(0, prev - 1))}
                  className="p-3 text-slate-500 hover:text-slate-800 transition-colors bg-white border-r border-slate-200 cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  min={0}
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Math.max(0, Number(e.target.value)))}
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
          </div>

          {/* CARD 2: Interactive Live Preview of Service Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs relative">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-slate-400" />
              <span>{isRtl ? 'معاينة البطاقة على الموقع' : 'Live Website Card Preview'}</span>
            </h4>

            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="h-32 w-full overflow-hidden bg-slate-100 relative">
                {primaryMedia?.file_path ? (
                  <img src={primaryMedia.file_path} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                )}
              </div>

              <div className="p-5 space-y-2 text-right">
                <div className="flex items-center justify-between">
                  <h5 className="text-sm font-extrabold text-slate-900 leading-tight">
                    {title || (isRtl ? 'اسم الخدمة' : 'Service Title')}
                  </h5>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {isActive ? (isRtl ? 'مفعلة' : 'Active') : (isRtl ? 'مسودة' : 'Draft')}
                  </span>
                </div>

                <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">
                  {shortDescription || (isRtl ? 'وصف مختصر للخدمة يظهر هنا للزوار والعملاء.' : 'Short description appears here for website visitors.')}
                </p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-[#F20530]">
                  <span>{isRtl ? 'اكتشف المزيد ←' : 'Learn More →'}</span>
                  <span className="font-mono text-slate-400">#{sortOrder}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Media Library Selector Modal */}
        <AnimatePresence>
          {isMediaLibraryModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-3xl p-6 max-w-2xl w-full space-y-4 shadow-2xl border border-slate-100 max-h-[80vh] flex flex-col">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-base font-extrabold text-slate-900">
                    {isRtl ? 'اختر صورة من مكتبة الوسائط' : 'Select Image from Media Library'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsMediaLibraryModalOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    ×
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto min-h-[220px] p-1">
                  {isLoadingLibrary && (
                    <div className="flex flex-col items-center justify-center py-12 space-y-3">
                      <RefreshCw className="w-7 h-7 text-[#F20530] animate-spin" />
                      <p className="text-xs font-bold text-slate-500">
                        {isRtl ? 'جاري تحميل وسائط المكتبة من الخادم...' : 'Loading library media from server...'}
                      </p>
                    </div>
                  )}

                  {!isLoadingLibrary && libraryFetchError && (
                    <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold text-center">
                      {libraryFetchError}
                    </div>
                  )}

                  {!isLoadingLibrary && !libraryFetchError && libraryMediaItems.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {libraryMediaItems.map((media) => {
                        const isSelected = serviceMediaList.some(m => String(m.media_id) === String(media.id));
                        return (
                          <button
                            key={media.id}
                            type="button"
                            onClick={() => selectMediaFromLibrary(media)}
                            disabled={isSelected}
                            className={`group relative h-32 rounded-xl overflow-hidden border transition-all cursor-pointer bg-slate-900 flex flex-col text-left ${
                              isSelected ? 'border-emerald-500 ring-2 ring-emerald-500/20 opacity-60 cursor-not-allowed' : 'border-slate-200 hover:border-[#F20530]'
                            }`}
                          >
                            <div className="relative flex-1 w-full overflow-hidden bg-slate-950">
                              <img
                                src={media.url}
                                alt={media.alt_text || media.file_name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform opacity-90 group-hover:opacity-100"
                              />
                              {isSelected ? (
                                <div className="absolute top-2 right-2 p-1 bg-emerald-500 text-white rounded-full shadow-md">
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                </div>
                              ) : (
                                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                  <Plus className="w-6 h-6 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="p-1.5 bg-slate-900 text-white text-[10px] font-mono truncate w-full px-2">
                              {media.file_name}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {!isLoadingLibrary && !libraryFetchError && libraryMediaItems.length === 0 && (
                    <p className="col-span-full text-center py-12 text-xs font-bold text-slate-400">
                      {isRtl ? 'لا توجد وسائط مسبقة في المكتبة على الخادم.' : 'No media items found in library on server.'}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
