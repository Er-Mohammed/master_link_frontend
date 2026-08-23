import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { 
  adminTestimonialsApi, 
  adminMediaApi, 
  authApi, 
  LaravelMedia 
} from '../../../services/api';
import { 
  X, 
  Image as ImageIcon, 
  Check, 
  FolderOpen, 
  UploadCloud, 
  AlertCircle,
  Hash,
  User,
  MessageSquare,
  ToggleLeft,
  ToggleRight,
  Loader2,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CreateProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function Create({ isOpen, onClose, onSuccess }: CreateProps) {
  const { isRtl } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state according to Laravel schema
  const [displayName, setDisplayName] = useState('');
  const [message, setMessage] = useState('');
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [selectedMediaId, setSelectedMediaId] = useState<number | null>(null);
  const [selectedMediaUrl, setSelectedMediaUrl] = useState<string>('');

  // UI States
  const [submitting, setSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]> | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'danger' } | null>(null);

  // Media Picker state
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [availableMedia, setAvailableMedia] = useState<LaravelMedia[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaUploadLoading, setMediaUploadLoading] = useState(false);

  const showToast = (msg: string, type: 'success' | 'danger' = 'success') => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handle401Error = () => {
    authApi.clearToken();
    window.location.hash = '#admin-login';
  };

  // Fetch Available Images from Media Library
  const fetchMedia = async () => {
    setMediaLoading(true);
    try {
      const response = await adminMediaApi.getAll({ media_type: 'image', per_page: 50 });
      if (Array.isArray(response.data)) {
        setAvailableMedia(response.data);
      } else if (response.data && Array.isArray((response.data as any).data)) {
        setAvailableMedia((response.data as any).data);
      } else {
        setAvailableMedia([]);
      }
    } catch (err: any) {
      if (err?.status === 401) handle401Error();
      else console.warn('Failed to fetch media for picker:', err);
    } finally {
      setMediaLoading(false);
    }
  };

  useEffect(() => {
    if (isMediaPickerOpen) {
      fetchMedia();
    }
  }, [isMediaPickerOpen]);

  const resetForm = () => {
    setDisplayName('');
    setMessage('');
    setSortOrder(0);
    setIsActive(true);
    setSelectedMediaId(null);
    setSelectedMediaUrl('');
    setValidationErrors(null);
  };

  const handleUploadNewMedia = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showToast(isRtl ? 'حجم الملف أكبر من 10 ميجابايت' : 'File size exceeds 10MB', 'danger');
      return;
    }

    setMediaUploadLoading(true);
    try {
      const response = await adminMediaApi.upload(file, displayName || file.name);
      const uploadedMedia = response.data;
      if (uploadedMedia) {
        setAvailableMedia(prev => [uploadedMedia, ...prev]);
        setSelectedMediaId(uploadedMedia.id);
        setSelectedMediaUrl(uploadedMedia.url);
        setIsMediaPickerOpen(false);
        showToast(isRtl ? 'تم رفع الصورة بنجاح وتحديدها!' : 'Image uploaded successfully!');
      }
    } catch (err: any) {
      if (err?.status === 401) handle401Error();
      else showToast(err?.message || (isRtl ? 'فشل رفع الصورة' : 'Failed to upload image'), 'danger');
    } finally {
      setMediaUploadLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors(null);

    const clientErrors: Record<string, string[]> = {};
    if (!displayName.trim()) {
      clientErrors.display_name = [isRtl ? 'اسم العميل مطلوب' : 'Display Name is required'];
    }
    if (!message.trim()) {
      clientErrors.message = [isRtl ? 'نص الشهادة / الرأي مطلوب' : 'Message is required'];
    }

    if (Object.keys(clientErrors).length > 0) {
      setValidationErrors(clientErrors);
      return;
    }

    setSubmitting(true);
    try {
      await adminTestimonialsApi.create({
        display_name: displayName.trim(),
        message: message.trim(),
        sort_order: Number(sortOrder) || 0,
        is_active: isActive,
        media_id: selectedMediaId
      });

      showToast(isRtl ? 'تم إضافة رأي العميل بنجاح!' : 'Testimonial created successfully!');
      resetForm();
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      if (err?.status === 401) handle401Error();
      else if (err?.status === 403) showToast(isRtl ? 'ليس لديك صلاحية لإضافة رأي عميل.' : 'Unauthorized action.', 'danger');
      else if (err?.status === 422 && err?.errors) setValidationErrors(err.errors);
      else showToast(err?.message || (isRtl ? 'تعذر إضافة رأي العميل' : 'Failed to create testimonial'), 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto" dir={isRtl ? 'rtl' : 'ltr'}>
        
        {/* Local Toast Alert */}
        {toast && (
          <div className={`fixed top-4 left-4 z-60 px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 shadow-xl ${
            toast.type === 'success' ? 'bg-emerald-950 border-emerald-800 text-emerald-300' : 'bg-rose-950 border-rose-800 text-rose-300'
          }`}>
            <Sparkles className="w-4 h-4" />
            <span>{toast.message}</span>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={`bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative my-8 ${isRtl ? 'text-right' : 'text-left'}`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-950/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F20530]/10 border border-[#F20530]/30 flex items-center justify-center text-[#F20530]">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {isRtl ? 'إضافة رأي عميل جديد' : 'Create Testimonial'}
                </h3>
                <p className="text-xs text-slate-400">
                  {isRtl ? 'إدخال بيانات التقييم والشهادة عبر Laravel API' : 'Enter testimonial details via Laravel API'}
                </p>
              </div>
            </div>
            <button
              onClick={() => { resetForm(); onClose(); }}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Validation Errors Banner */}
          {validationErrors && (
            <div className="m-6 mb-0 p-4 bg-rose-950/40 border border-rose-800/80 rounded-2xl space-y-1">
              <div className="flex items-center gap-2 text-rose-400 text-xs font-bold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{isRtl ? 'يرجى تصحيح الأخطاء التالية:' : 'Please fix the following errors:'}</span>
              </div>
              <ul className="list-disc list-inside text-xs font-medium text-rose-300 space-y-0.5 pr-2">
                {Object.entries(validationErrors).flatMap(([field, msgs]) =>
                  Array.isArray(msgs)
                    ? msgs.map((m, i) => <li key={`${field}-${i}`}>{m}</li>)
                    : [<li key={field}>{String(msgs)}</li>]
                )}
              </ul>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            
            {/* Image (Select from Media Library) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                {isRtl ? 'صورة العميل (اختياري - من مكتبة الوسائط)' : 'Client Image (Optional - Select from Media Library)'}
              </label>

              {selectedMediaUrl ? (
                <div className="flex items-center justify-between p-4 bg-slate-950/60 border border-slate-800 rounded-2xl">
                  <div className="flex items-center gap-4">
                    <img
                      src={selectedMediaUrl}
                      alt="Selected Avatar"
                      className="w-14 h-14 rounded-full object-cover border-2 border-[#F20530]/40 bg-slate-900"
                    />
                    <div>
                      <p className="text-sm font-semibold text-white">Media ID: {selectedMediaId}</p>
                      <span className="text-xs text-slate-400 truncate max-w-xs block">{selectedMediaUrl}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => { setSelectedMediaId(null); setSelectedMediaUrl(''); }}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-rose-950 text-xs font-semibold text-slate-400 hover:text-rose-400 rounded-xl transition-colors border border-slate-700 cursor-pointer"
                    >
                      {isRtl ? 'إزالة' : 'Remove'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsMediaPickerOpen(true)}
                      className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-xl transition-colors border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                    >
                      <FolderOpen className="w-3.5 h-3.5 text-[#F20530]" />
                      {isRtl ? 'تغيير الصورة' : 'Change Image'}
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => setIsMediaPickerOpen(true)}
                  className="border-2 border-dashed border-slate-800 hover:border-[#F20530]/60 bg-slate-950/40 rounded-2xl p-6 text-center cursor-pointer transition-all hover:bg-slate-950/70 group"
                >
                  <div className="w-12 h-12 rounded-full bg-slate-800 group-hover:bg-[#F20530]/20 flex items-center justify-center text-slate-400 group-hover:text-[#F20530] mx-auto mb-3 transition-colors">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-slate-200 group-hover:text-white">
                    {isRtl ? 'اختر صورة العميل من مكتبة الوسائط' : 'Select Image from Media Library'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">PNG, JPG, WEBP, SVG</p>
                </div>
              )}
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                {isRtl ? 'اسم العميل / الشركة' : 'Display Name'} <span className="text-[#F20530]">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  maxLength={150}
                  value={displayName}
                  onChange={(e) => {
                    setDisplayName(e.target.value);
                    if (validationErrors?.display_name) {
                      setValidationErrors(prev => prev ? { ...prev, display_name: [] } : null);
                    }
                  }}
                  placeholder={isRtl ? 'مثال: م. خالد المنصور' : 'e.g. Eng. Khalid Al-Mansoor'}
                  className={`w-full bg-slate-950/60 border ${validationErrors?.display_name?.length ? 'border-[#F20530]' : 'border-slate-800 focus:border-[#F20530]'} rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none transition-colors`}
                />
                <User className={`absolute top-3.5 w-4 h-4 text-slate-600 pointer-events-none ${isRtl ? 'left-3.5' : 'right-3.5'}`} />
              </div>
            </div>

            {/* Testimonial Message */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                {isRtl ? 'نص الرأي / الشهادة' : 'Message'} <span className="text-[#F20530]">*</span>
              </label>
              <textarea
                required
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  if (validationErrors?.message) {
                    setValidationErrors(prev => prev ? { ...prev, message: [] } : null);
                  }
                }}
                rows={4}
                placeholder={isRtl ? 'اكتب نص رأي العميل وانطباعه عن الخدمات...' : 'Write client testimonial message...'}
                className={`w-full bg-slate-950/60 border ${validationErrors?.message?.length ? 'border-[#F20530]' : 'border-slate-800 focus:border-[#F20530]'} rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none transition-colors leading-relaxed`}
              />
            </div>

            {/* Row: Sort Order & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Sort Order */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  {isRtl ? 'ترتيب الظهور (sort_order)' : 'Sort Order (Default 0)'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                    min={0}
                    className="w-full bg-slate-950/60 border border-slate-800 focus:border-[#F20530] rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-colors"
                  />
                  <Hash className={`absolute top-3.5 w-4 h-4 text-slate-600 pointer-events-none ${isRtl ? 'left-3.5' : 'right-3.5'}`} />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  {isRtl ? 'حالة التفعيل (is_active)' : 'Status'}
                </label>
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={`w-full py-3 px-4 rounded-xl border flex items-center justify-between font-semibold text-sm transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {isActive ? <ToggleRight className="w-5 h-5 text-emerald-400" /> : <ToggleLeft className="w-5 h-5 text-slate-500" />}
                    {isRtl ? (isActive ? 'مفعل' : 'غير مفعل') : (isActive ? 'Active' : 'Inactive')}
                  </span>
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => { resetForm(); onClose(); }}
                className="px-5 py-2.5 rounded-xl border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-sm font-semibold transition-colors cursor-pointer"
              >
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-[#F20530] hover:bg-[#d00428] text-white text-sm font-bold shadow-lg shadow-[#F20530]/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>{isRtl ? 'حفظ الرأي' : 'Save Testimonial'}</span>
              </button>
            </div>
          </form>

          {/* Media Picker Modal Overlay */}
          <AnimatePresence>
            {isMediaPickerOpen && (
              <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl relative p-6 space-y-5 ${isRtl ? 'text-right' : 'text-left'}`}
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div>
                      <h4 className="text-lg font-bold text-white">
                        {isRtl ? 'اختر من مكتبة الوسائط' : 'Select from Media Library'}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {isRtl ? 'اختر صورة من السيرفر أو ارفع صورة جديدة' : 'Choose an existing image or upload a new one'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsMediaPickerOpen(false)}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Upload new image button */}
                  <div className="flex items-center justify-between bg-slate-950/60 border border-slate-800 p-4 rounded-2xl">
                    <span className="text-xs font-semibold text-slate-300">
                      {isRtl ? 'رفع صورة جديدة مباشر إلى مكتبة الوسائط:' : 'Upload new image to Media Library:'}
                    </span>
                    <button
                      type="button"
                      disabled={mediaUploadLoading}
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-[#F20530] hover:bg-[#d00428] text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      {mediaUploadLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                      <span>{isRtl ? 'رفع صورة جديدة' : 'Upload Image'}</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleUploadNewMedia}
                      className="hidden"
                    />
                  </div>

                  {/* Media Items Grid */}
                  {mediaLoading ? (
                    <div className="py-12 text-center text-slate-400 space-y-2">
                      <Loader2 className="w-6 h-6 text-[#F20530] animate-spin mx-auto" />
                      <p className="text-xs font-medium">{isRtl ? 'جاري تحميل الوسائط...' : 'Loading media...'}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[50vh] overflow-y-auto p-1">
                      {availableMedia.length > 0 ? (
                        availableMedia.map((item) => {
                          const isSelected = selectedMediaId === item.id;
                          return (
                            <div
                              key={item.id}
                              onClick={() => {
                                setSelectedMediaId(item.id);
                                setSelectedMediaUrl(item.url);
                                setIsMediaPickerOpen(false);
                              }}
                              className={`relative group rounded-2xl border ${isSelected ? 'border-[#F20530] ring-2 ring-[#F20530]/40' : 'border-slate-800 hover:border-slate-700'} overflow-hidden bg-slate-950 cursor-pointer transition-all p-2 text-center`}
                            >
                              <div className="aspect-square rounded-xl overflow-hidden bg-slate-900 mb-2 flex items-center justify-center p-1">
                                <img
                                  src={item.url}
                                  alt={item.alt_text || item.file_name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                              </div>
                              <p className="text-xs font-semibold text-slate-300 truncate" title={item.file_name}>{item.file_name}</p>
                              <p className="text-[10px] text-slate-500 font-mono">ID: {item.id}</p>
                            </div>
                          );
                        })
                      ) : (
                        <div className="col-span-full py-12 text-center text-slate-500 text-sm">
                          {isRtl ? 'لا توجد صور في مكتبة الوسائط.' : 'No images found in Media Library.'}
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              </div>
            )}
          </AnimatePresence>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default Create;
