import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { 
  adminPostsApi, 
  adminMediaApi, 
  authApi, 
  LaravelMedia,
  LaravelPostPayload 
} from '../../../services/api';
import { 
  X, 
  UploadCloud, 
  Image as ImageIcon, 
  Loader2, 
  AlertCircle, 
  Sparkles,
  FileText,
  Calendar,
  Globe,
  CheckCircle2,
  HelpCircle,
  Clock,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CreateProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function Create({ isOpen, onClose, onSuccess }: CreateProps) {
  const { isRtl } = useLanguage();

  // Form State matching Laravel DB fields 100%
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [autoSlug, setAutoSlug] = useState(true);
  const [shortDescription, setShortDescription] = useState('');
  const [content, setContent] = useState('');
  const [mediaId, setMediaId] = useState<number | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<LaravelMedia | null>(null);
  const [publishedAt, setPublishedAt] = useState<string>('');
  const [isFeatured, setIsFeatured] = useState<boolean>(false);
  const [isActive, setIsActive] = useState<boolean>(true);

  // Status & Validation State
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Media Picker Modal State
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [mediaItems, setMediaItems] = useState<LaravelMedia[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaUploadLoading, setMediaUploadLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset Form
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setSlug('');
      setAutoSlug(true);
      setShortDescription('');
      setContent('');
      setMediaId(null);
      setSelectedMedia(null);
      setPublishedAt(new Date().toISOString().slice(0, 16));
      setIsFeatured(false);
      setIsActive(true);
      setErrors({});
      setGeneralError(null);
    }
  }, [isOpen]);

  // Auto-generate slug from title
  useEffect(() => {
    if (autoSlug && title.trim()) {
      const generatedSlug = title
        .trim()
        .toLowerCase()
        .replace(/[\s\W]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generatedSlug || `post-${Date.now()}`);
    }
  }, [title, autoSlug]);

  const handle401Error = () => {
    authApi.clearToken();
    window.location.hash = '#admin-login';
  };

  // Fetch Media Items for picker
  const fetchMediaItems = async () => {
    setMediaLoading(true);
    try {
      const response = await adminMediaApi.getAll({ per_page: 30, media_type: 'image' });
      setMediaItems(response.data || []);
    } catch (err: any) {
      if (err?.status === 401) handle401Error();
    } finally {
      setMediaLoading(false);
    }
  };

  const handleOpenMediaPicker = () => {
    setShowMediaPicker(true);
    fetchMediaItems();
  };

  const handleSelectMedia = (media: LaravelMedia) => {
    setSelectedMedia(media);
    setMediaId(media.id);
    setShowMediaPicker(false);
  };

  // Quick upload new media inside picker
  const handleQuickUploadMedia = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMediaUploadLoading(true);
    try {
      const response = await adminMediaApi.upload(file);
      if (response.data) {
        setSelectedMedia(response.data);
        setMediaId(response.data.id);
        setShowMediaPicker(false);
      }
    } catch (err: any) {
      if (err?.status === 401) handle401Error();
      else alert(err?.message || 'فشل رفع الصورة');
    } finally {
      setMediaUploadLoading(false);
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setGeneralError(null);

    const payload: LaravelPostPayload = {
      title: title.trim(),
      slug: slug.trim(),
      short_description: shortDescription.trim() || null,
      content: content.trim(),
      media_id: mediaId,
      published_at: publishedAt ? new Date(publishedAt).toISOString() : null,
      is_featured: isFeatured,
      is_active: isActive,
    };

    try {
      await adminPostsApi.create(payload);
      onSuccess();
      onClose();
    } catch (err: any) {
      if (err?.status === 401) {
        handle401Error();
        return;
      }
      if (err?.status === 403) {
        setGeneralError(isRtl ? 'ليس لديك صلاحية لإضافة مقال جديد.' : 'Unauthorized action.');
        return;
      }
      if (err?.status === 422 && err.errors) {
        setErrors(err.errors);
      } else {
        setGeneralError(err?.message || (isRtl ? 'حدث خطأ أثناء حفظ المقال.' : 'Failed to create post.'));
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className={`bg-white border border-slate-200 rounded-3xl w-full max-w-3xl my-8 shadow-2xl overflow-hidden ${isRtl ? 'rtl text-right' : 'ltr text-left'}`}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="p-6 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#F20530]/10 border border-[#F20530]/20 rounded-2xl text-[#F20530]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">
                {isRtl ? 'إضافة مقال جديد' : 'Add New Article'}
              </h3>
              <p className="text-xs text-slate-500 font-semibold">
                {isRtl ? 'إدخال بيانات المقال وحفظه في قاعدة بيانات Laravel' : 'Create new post record via Laravel API'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* General Error Banner */}
        {generalError && (
          <div className="mx-6 mt-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs font-bold">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            <span>{generalError}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Main Grid: Title & Slug */}
          <div className="space-y-4">
            
            {/* Article Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isRtl ? 'عنوان المقال' : 'Article Title'} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={isRtl ? 'أدخل عنوان المقال بالعربية...' : 'Enter article title...'}
                className="w-full bg-slate-50 border border-slate-200 focus:border-[#F20530] focus:bg-white text-slate-900 text-xs font-semibold rounded-2xl px-4 py-3 outline-none transition-colors"
              />
              {errors.title && (
                <p className="text-[11px] font-bold text-rose-600 mt-1">{errors.title[0]}</p>
              )}
            </div>

            {/* Slug */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  {isRtl ? 'معرف الرابط (Slug)' : 'Permalink Slug'} <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setAutoSlug(!autoSlug)}
                  className="text-[11px] font-bold text-[#F20530] hover:underline cursor-pointer"
                >
                  {autoSlug ? (isRtl ? 'توليد يدوي' : 'Manual Slug') : (isRtl ? 'توليد تلقائي' : 'Auto Slug')}
                </button>
              </div>
              <input
                type="text"
                required
                disabled={autoSlug}
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="article-slug-example"
                className="w-full bg-slate-50 border border-slate-200 focus:border-[#F20530] focus:bg-white text-slate-900 text-xs font-mono font-semibold rounded-2xl px-4 py-3 outline-none transition-colors disabled:opacity-60"
              />
              {errors.slug && (
                <p className="text-[11px] font-bold text-rose-600 mt-1">{errors.slug[0]}</p>
              )}
            </div>

          </div>

          {/* Short Description / Excerpt */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {isRtl ? 'الوصف المختصر / المقتطف' : 'Short Description / Excerpt'}
            </label>
            <textarea
              rows={3}
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder={isRtl ? 'ملخص قصير يظهر في بطاقة المقال وفي نتائج البحث...' : 'Short snippet for article preview...'}
              className="w-full bg-slate-50 border border-slate-200 focus:border-[#F20530] focus:bg-white text-slate-900 text-xs font-semibold rounded-2xl p-4 outline-none transition-colors resize-none"
            />
            {errors.short_description && (
              <p className="text-[11px] font-bold text-rose-600 mt-1">{errors.short_description[0]}</p>
            )}
          </div>

          {/* Full Article Content */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {isRtl ? 'محتوى المقال الكامل' : 'Full Content'} <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={8}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={isRtl ? 'اكتب محتوى المقال هنا...' : 'Write complete post content here...'}
              className="w-full bg-slate-50 border border-slate-200 focus:border-[#F20530] focus:bg-white text-slate-900 text-xs font-semibold rounded-2xl p-4 outline-none transition-colors resize-y leading-relaxed"
            />
            {errors.content && (
              <p className="text-[11px] font-bold text-rose-600 mt-1">{errors.content[0]}</p>
            )}
          </div>

          {/* Image Selection from Media Library */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {isRtl ? 'صورة الغلاف (من مكتبة الوسائط)' : 'Cover Image (from Media Library)'}
            </label>
            <div className="flex items-center gap-4">
              {selectedMedia ? (
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 group shrink-0">
                  <img
                    src={selectedMedia.url}
                    alt={selectedMedia.alt_text || 'Cover'}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMedia(null);
                      setMediaId(null);
                    }}
                    className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-90 hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleOpenMediaPicker}
                  className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-200 hover:border-[#F20530] bg-slate-50 hover:bg-slate-100/50 flex flex-col items-center justify-center gap-1.5 text-slate-400 hover:text-[#F20530] transition-colors shrink-0 cursor-pointer"
                >
                  <ImageIcon className="w-6 h-6" />
                  <span className="text-[10px] font-bold">{isRtl ? 'اختر صورة' : 'Select'}</span>
                </button>
              )}

              <div className="space-y-1">
                <button
                  type="button"
                  onClick={handleOpenMediaPicker}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  {selectedMedia ? (isRtl ? 'تغيير الصورة' : 'Change Image') : (isRtl ? 'فتح مكتبة الوسائط' : 'Open Media Library')}
                </button>
                <p className="text-[11px] text-slate-400 font-semibold">
                  {isRtl ? 'يمكنك اختيار صورة مرفوعة مسبقاً أو رفع صورة جديدة' : 'Choose existing media or upload new'}
                </p>
              </div>
            </div>
            {errors.media_id && (
              <p className="text-[11px] font-bold text-rose-600 mt-1">{errors.media_id[0]}</p>
            )}
          </div>

          {/* Publishing Settings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
            
            {/* Published At Date/Time */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isRtl ? 'تاريخ ووقت النشر' : 'Publish Date & Time'}
              </label>
              <input
                type="datetime-local"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-[#F20530] focus:bg-white text-slate-900 text-xs font-semibold rounded-2xl px-4 py-2.5 outline-none transition-colors"
              />
              {errors.published_at && (
                <p className="text-[11px] font-bold text-rose-600 mt-1">{errors.published_at[0]}</p>
              )}
            </div>

            {/* Is Featured Checkbox */}
            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="create_is_featured"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 text-[#F20530] focus:ring-[#F20530] rounded cursor-pointer"
              />
              <label htmlFor="create_is_featured" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                {isRtl ? 'مقال مميز (Featured)' : 'Featured Article'}
              </label>
            </div>

            {/* Is Active Checkbox */}
            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="create_is_active"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 text-[#F20530] focus:ring-[#F20530] rounded cursor-pointer"
              />
              <label htmlFor="create_is_active" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                {isRtl ? 'تفعيل المقال (Active)' : 'Active Status'}
              </label>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
            >
              {isRtl ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-[#F20530] hover:bg-[#d00428] text-white text-xs font-bold shadow-lg shadow-[#F20530]/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isRtl ? 'جاري الحفظ...' : 'Saving...'}</span>
                </>
              ) : (
                <span>{isRtl ? 'حفظ المقال' : 'Save Article'}</span>
              )}
            </button>
          </div>

        </form>
      </motion.div>

      {/* Media Picker Modal */}
      <AnimatePresence>
        {showMediaPicker && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[80vh] flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="text-sm font-bold text-slate-900">
                  {isRtl ? 'اختر صورة من مكتبة الوسائط' : 'Select Image from Media Library'}
                </h4>
                <button
                  onClick={() => setShowMediaPicker(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Upload trigger */}
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                <span className="text-xs font-bold text-slate-600">
                  {isRtl ? 'أو ارفع صورة جديدة من جهازك:' : 'Or upload new image:'}
                </span>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleQuickUploadMedia}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={mediaUploadLoading}
                  className="px-4 py-2 bg-[#F20530] hover:bg-[#d00428] text-white text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer"
                >
                  {mediaUploadLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
                  <span>{isRtl ? 'رفع صورة جديدة' : 'Upload Image'}</span>
                </button>
              </div>

              {/* Grid of images */}
              <div className="flex-1 overflow-y-auto min-h-[250px] p-2">
                {mediaLoading ? (
                  <div className="py-12 text-center space-y-2">
                    <Loader2 className="w-6 h-6 text-[#F20530] animate-spin mx-auto" />
                    <p className="text-xs text-slate-500 font-bold">{isRtl ? 'جاري تحميل الصور...' : 'Loading images...'}</p>
                  </div>
                ) : mediaItems.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {mediaItems.map((media) => (
                      <button
                        key={media.id}
                        type="button"
                        onClick={() => handleSelectMedia(media)}
                        className="aspect-square rounded-xl overflow-hidden border border-slate-200 hover:border-[#F20530] hover:ring-2 hover:ring-[#F20530]/20 transition-all group relative bg-slate-100"
                      >
                        <img
                          src={media.url}
                          alt={media.alt_text || 'Media'}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-400 text-xs font-bold">
                    {isRtl ? 'لا توجد صور في مكتبة الوسائط.' : 'No images found in library.'}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Create;
