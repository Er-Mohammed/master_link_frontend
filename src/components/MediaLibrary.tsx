import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { adminMediaApi, authApi, LaravelMedia } from '../services/api';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Trash2, 
  X, 
  Grid, 
  List, 
  UploadCloud, 
  Copy, 
  Eye, 
  Edit3, 
  Download, 
  FileText, 
  Image as ImageIcon, 
  Video, 
  HardDrive, 
  AlertCircle, 
  RefreshCw, 
  Calendar, 
  CheckCircle2, 
  FolderOpen, 
  Info,
  Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface MediaLibraryProps {
  isOpen?: boolean;
  onClose?: () => void;
  selectable?: boolean;
  onSelectMedia?: (media: LaravelMedia) => void;
}

export function MediaLibrary({
  isOpen,
  onClose,
  selectable = false,
  onSelectMedia
}: MediaLibraryProps = {}) {
  const { language, isRtl } = useLanguage();
  const { canPerform } = useAuth();

  // API State
  const [mediaList, setMediaList] = useState<LaravelMedia[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // View style: 'grid' | 'list'
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filters & Sorting state
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'image' | 'video' | 'document'>('all');
  const [sortBy, setSortBy] = useState<'created_at' | 'file_name' | 'file_size'>('created_at');
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');

  // Drag & Upload state
  const [isDragging, setIsDragging] = useState(false);
  const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(null);
  const [uploadFilePreviewUrl, setUploadFilePreviewUrl] = useState<string | null>(null);
  const [uploadAltText, setUploadAltText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit Alt Text Modal state
  const [itemToEdit, setItemToEdit] = useState<LaravelMedia | null>(null);
  const [editAltTextInput, setEditAltTextInput] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete Confirm Modal State
  const [itemToDelete, setItemToDelete] = useState<LaravelMedia | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Active preview item modal (Interactive player/inspector)
  const [previewItem, setPreviewItem] = useState<LaravelMedia | null>(null);

  // Toast alert
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'danger' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'danger' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Human readable size formatter
  const formatBytes = (bytes: number): string => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Fetch Media from Laravel Backend
  const fetchMedia = async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const res = await adminMediaApi.getAll({
        search: searchQuery.trim() || undefined,
        media_type: typeFilter !== 'all' ? typeFilter : undefined,
        sort: sortBy,
        direction: sortDirection,
        per_page: 100,
      });
      setMediaList(res.data || []);
    } catch (err: any) {
      if (err?.status === 401) {
        authApi.clearToken();
        window.location.hash = '#admin-login';
        return;
      }
      setApiError(err?.message || 'تعذر الاتصال بالخادم لجلب مكتبة الوسائط، حاول مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [searchQuery, typeFilter, sortBy, sortDirection]);

  // Compute stats dynamically from loaded API media items
  const stats = useMemo(() => {
    const totalCount = mediaList.length;
    let imagesSize = 0;
    let videosSize = 0;
    let documentsSize = 0;

    let imagesCount = 0;
    let videosCount = 0;
    let documentsCount = 0;

    mediaList.forEach(item => {
      if (item.media_type === 'image') {
        imagesSize += item.file_size || 0;
        imagesCount++;
      } else if (item.media_type === 'video') {
        videosSize += item.file_size || 0;
        videosCount++;
      } else if (item.media_type === 'document') {
        documentsSize += item.file_size || 0;
        documentsCount++;
      }
    });

    const totalUsedBytes = imagesSize + videosSize + documentsSize;
    const maxQuotaBytes = 2147483648; // 2 GB

    return {
      totalCount,
      imagesCount,
      videosCount,
      documentsCount,
      imagesSizeFormatted: formatBytes(imagesSize),
      videosSizeFormatted: formatBytes(videosSize),
      documentsSizeFormatted: formatBytes(documentsSize),
      totalUsedFormatted: formatBytes(totalUsedBytes),
      quotaFormatted: formatBytes(maxQuotaBytes),
      percentageUsed: parseFloat(((totalUsedBytes / maxQuotaBytes) * 100).toFixed(1)),
      imagesSizePercent: Math.max(2, (imagesSize / Math.max(1, totalUsedBytes)) * 100),
      videosSizePercent: Math.max(2, (videosSize / Math.max(1, totalUsedBytes)) * 100),
      documentsSizePercent: Math.max(2, (documentsSize / Math.max(1, totalUsedBytes)) * 100),
    };
  }, [mediaList]);

  // Drag & Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    setUploadError(null);

    // Validate size limit (10MB = 10,240,000 bytes)
    if (file.size > 10240 * 1024) {
      setUploadError('حجم الملف يتجاوز الحد الأقصى المسموح به وهو 10 ميجابايت.');
      setSelectedUploadFile(null);
      setUploadFilePreviewUrl(null);
      return;
    }

    setSelectedUploadFile(file);
    setUploadAltText('');

    // Generate local preview URL
    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
      const previewUrl = URL.createObjectURL(file);
      setUploadFilePreviewUrl(previewUrl);
    } else {
      setUploadFilePreviewUrl(null);
    }
  };

  // Perform actual multipart/form-data upload to Laravel
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUploadFile) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const res = await adminMediaApi.upload(selectedUploadFile, uploadAltText.trim() || undefined);
      showToast('تم رفع الملف بنجاح إلى مكتبة الوسائط.', 'success');
      
      // Cleanup upload modal state
      if (uploadFilePreviewUrl) {
        URL.revokeObjectURL(uploadFilePreviewUrl);
      }
      setSelectedUploadFile(null);
      setUploadFilePreviewUrl(null);
      setUploadAltText('');
      
      // Re-fetch live list from API
      await fetchMedia();
    } catch (err: any) {
      if (err?.status === 401) {
        authApi.clearToken();
        window.location.hash = '#admin-login';
        return;
      }
      if (err?.status === 413) {
        setUploadError('حجم الملف كبير جداً وتجاوز حد الخادم (10 ميجابايت).');
        return;
      }
      if (err?.status === 422 && err?.errors) {
        const messages = Object.values(err.errors).flat().join(' - ');
        setUploadError(messages || err.message);
        return;
      }
      setUploadError(err?.message || 'حدث خطأ أثناء رفع الملف إلى الخادم.');
    } finally {
      setIsUploading(false);
    }
  };

  // Cancel upload modal
  const handleCancelUpload = () => {
    if (uploadFilePreviewUrl) {
      URL.revokeObjectURL(uploadFilePreviewUrl);
    }
    setSelectedUploadFile(null);
    setUploadFilePreviewUrl(null);
    setUploadAltText('');
    setUploadError(null);
  };

  // Copy Direct File URL
  const handleCopyUrl = (item: LaravelMedia) => {
    if (item.url) {
      navigator.clipboard.writeText(item.url);
      showToast('تم نسخ رابط الملف المباشر إلى الحافظة بنجاح.', 'info');
    }
  };

  // Edit Alt Text
  const handleEditClick = (item: LaravelMedia) => {
    setItemToEdit(item);
    setEditAltTextInput(item.alt_text || '');
  };

  const handleEditConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemToEdit) return;

    setIsUpdating(true);
    try {
      await adminMediaApi.update(itemToEdit.id, editAltTextInput.trim());
      showToast('تم تحديث النص البديل للملف بنجاح.', 'success');
      setItemToEdit(null);
      await fetchMedia();
    } catch (err: any) {
      if (err?.status === 401) {
        authApi.clearToken();
        window.location.hash = '#admin-login';
        return;
      }
      showToast(err?.message || 'فشل تحديث بيانات الملف.', 'danger');
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete Media
  const handleDeleteClick = (item: LaravelMedia) => {
    setItemToDelete(item);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    setIsDeleting(true);
    try {
      await adminMediaApi.delete(itemToDelete.id);
      showToast(`تم حذف الملف "${itemToDelete.file_name}" نهائياً.`, 'danger');

      if (previewItem?.id === itemToDelete.id) {
        setPreviewItem(null);
      }
      setItemToDelete(null);
      await fetchMedia();
    } catch (err: any) {
      if (err?.status === 401) {
        authApi.clearToken();
        window.location.hash = '#admin-login';
        return;
      }
      showToast(err?.message || 'فشل حذف الملف من الخادم.', 'danger');
    } finally {
      setIsDeleting(false);
    }
  };

  // Render Thumbnail Helper
  const renderThumbnail = (item: LaravelMedia, sizeClass: string = 'w-full h-full') => {
    if (item.media_type === 'image' && item.url) {
      return (
        <img 
          src={item.url} 
          alt={item.alt_text || item.file_name} 
          referrerPolicy="no-referrer"
          className={`${sizeClass} object-cover transition-transform duration-500 group-hover:scale-105`} 
        />
      );
    }
    
    if (item.media_type === 'video' && item.url) {
      return (
        <div className="relative w-full h-full bg-slate-950 flex items-center justify-center overflow-hidden">
          <video 
            src={item.url} 
            preload="metadata" 
            className={`${sizeClass} object-cover opacity-60 pointer-events-none`} 
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-colors">
            <div className="w-9 h-9 rounded-full bg-[#F20530]/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Play className="w-4 h-4 fill-white ml-0.5" />
            </div>
          </div>
          <span className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-black/70 text-white text-[9px] font-mono font-bold rounded">
            VIDEO
          </span>
        </div>
      );
    }

    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-amber-50 text-amber-600 gap-1.5">
        <FileText className="w-8 h-8" />
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-white/80 px-1.5 py-0.5 rounded-md border border-slate-200/50">
          {item.extension || 'DOC'}
        </span>
      </div>
    );
  };

  if (isOpen !== undefined && !isOpen) return null;

  const content = (
    <div className={`space-y-6 ${isRtl ? 'text-right' : 'text-left'}`}>
      
      {/* Toast Alert Banner */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-6 ${isRtl ? 'left-6' : 'right-6'} z-50 p-4 rounded-xl shadow-xl border flex items-center gap-3 max-w-sm bg-slate-950 text-white border-slate-900`}
            id="media-library-toast"
          >
            <div className="w-5 h-5 rounded-full bg-[#F20530]/10 flex items-center justify-center shrink-0">
              {toast.type === 'danger' ? (
                <AlertCircle className="w-4 h-4 text-[#F20530]" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              )}
            </div>
            <span className="text-xs font-semibold leading-relaxed">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP HEADER CONTROLLER */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-rose-500/5 to-transparent pointer-events-none" />
        <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${isRtl ? 'md:flex-row-reverse' : ''}`}>
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-[#F20530] uppercase tracking-wider block">
              {isRtl ? 'مستودع الأصول الرقمية والتوزيع' : 'MASTERLINK MEDIA REPOSITORY'}
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-none">
              {isRtl ? 'مكتبة الوسائط الرقمية' : 'Media Core Library'}
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm font-semibold max-w-3xl leading-relaxed">
              {isRtl ? 'إدارة وفهرسة جميع الصور ومقاطع الفيديو والمستندات المخزنة مباشرة في سيرفر ماستر لينك.' : 'Manage, upload, and filter all image, video, and document media assets.'}
            </p>
          </div>
          
          {canPerform('media', 'create') && (
            <>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-extrabold text-white bg-[#F20530] hover:bg-rose-600 transition-all cursor-pointer shadow-lg shadow-rose-100 shrink-0"
                id="btn-trigger-upload"
              >
                <UploadCloud className="w-4 h-4" />
                <span>{isRtl ? 'إضافة Media' : 'Upload Media'}</span>
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileInputChange} 
                accept="image/*,video/*,.pdf,.doc,.docx"
                className="hidden" 
              />
            </>
          )}
        </div>
      </div>

      {/* STORAGE OVERVIEW STATS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-6">
          <div className={`flex items-start justify-between ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-[#F20530]" />
                <span>{isRtl ? 'سعة تخزين الوسائط المرفوعة' : 'Storage Allocations'}</span>
              </h3>
              <p className="text-xs text-slate-400 font-semibold">
                {isRtl ? 'إحصائيات إجمالي حجم الصور والفيديوهات المسجلة في الـ Backend' : 'Live storage metrics calculated from backend API'}
              </p>
            </div>
            
            <div className={`text-right ${isRtl ? 'text-left' : 'text-right'}`}>
              <span className="text-base font-black text-slate-900">{stats.totalUsedFormatted}</span>
              <span className="text-xs font-semibold text-slate-400 block mt-0.5">
                {isRtl ? 'مستخدم من إجمالي' : 'used of'} {stats.quotaFormatted}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex">
              <div style={{ width: `${stats.imagesSizePercent}%` }} className="h-full bg-rose-500 transition-all duration-500" />
              <div style={{ width: `${stats.videosSizePercent}%` }} className="h-full bg-blue-500 transition-all duration-500" />
              <div style={{ width: `${stats.documentsSizePercent}%` }} className="h-full bg-amber-500 transition-all duration-500" />
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2.5 text-xs font-semibold text-slate-600">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                <span>الصور ({stats.imagesCount})</span>
                <span className="text-slate-900 font-extrabold">{stats.imagesSizeFormatted}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                <span>الفيديو ({stats.videosCount})</span>
                <span className="text-slate-900 font-extrabold">{stats.videosSizeFormatted}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                <span>المستندات ({stats.documentsCount})</span>
                <span className="text-slate-900 font-extrabold">{stats.documentsSizeFormatted}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 bg-slate-950 text-white rounded-2xl p-6 border border-slate-900 flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-2 relative z-10">
            <div className="w-8 h-8 rounded-xl bg-[#F20530]/10 border border-[#F20530]/20 flex items-center justify-center">
              <Info className="w-4 h-4 text-[#F20530]" />
            </div>
            <h4 className="text-sm font-extrabold text-white">
              {isRtl ? 'دعم الوسائط المتعددة' : 'Media Compatibility'}
            </h4>
            <p className="text-slate-400 text-[11px] sm:text-xs font-semibold leading-relaxed">
              {isRtl ? 'يدعم السيرفر رفوعات الصور (JPG, PNG, WEBP) والفيديوهات (MP4, WEBM, MOV) حتى 10 ميجابايت للملف الواحد.' : 'Supports JPG, PNG, WEBP images and MP4, WEBM, MOV videos up to 10MB.'}
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-900 flex items-center justify-between text-[11px] text-rose-400 font-mono font-bold">
            <span>LARAVEL MEDIA DISK: PUBLIC</span>
            <span>MAX: 10 MB</span>
          </div>
        </div>
      </div>

      {/* DRAG AND DROP UPLOAD TRIGGER DROPZONE */}
      {canPerform('media', 'create') && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
            isDragging 
              ? 'border-[#F20530] bg-rose-500/5 scale-[0.99]' 
              : 'border-slate-300 hover:border-[#F20530] bg-white hover:bg-slate-50/50'
          }`}
          id="drag-drop-media-zone"
        >
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-[#F20530] flex items-center justify-center mx-auto">
              <UploadCloud className="w-6 h-6" />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-sm font-extrabold text-slate-800">
                {isRtl ? 'اسحب الملفات وأفلتها هنا أو انقر لتحديد ملف من جهازك' : 'Drag and drop files here or click to browse'}
              </h3>
              <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                {isRtl ? 'يدعم رفع الصور وفيديوهات MP4/WEBM والملفات حتى 10 ميجابايت.' : 'Supports JPG, PNG, WEBP, MP4, WEBM up to 10 MB'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD MODAL PREVIEW */}
      <AnimatePresence>
        {selectedUploadFile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={handleCancelUpload} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 p-6 shadow-2xl z-10 space-y-5"
            >
              <div className={`flex items-center justify-between border-b border-slate-100 pb-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <h3 className="text-sm font-extrabold text-slate-900">
                  {isRtl ? 'رفع وسائط جديدة إلى Laravel' : 'Upload New Media Asset'}
                </h3>
                <button onClick={handleCancelUpload} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {uploadError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Preview Box */}
              <div className="aspect-video w-full rounded-xl bg-slate-950 overflow-hidden flex items-center justify-center relative border border-slate-800">
                {selectedUploadFile.type.startsWith('image/') && uploadFilePreviewUrl ? (
                  <img src={uploadFilePreviewUrl} alt="Preview" className="w-full h-full object-contain" />
                ) : selectedUploadFile.type.startsWith('video/') && uploadFilePreviewUrl ? (
                  <video src={uploadFilePreviewUrl} controls className="w-full h-full object-contain" />
                ) : (
                  <div className="text-center text-slate-400 space-y-2">
                    <FileText className="w-10 h-10 mx-auto text-amber-500" />
                    <span className="text-xs font-mono font-bold block">{selectedUploadFile.name}</span>
                  </div>
                )}
              </div>

              <form onSubmit={handleUploadSubmit} className="space-y-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-700 block">اسم الملف:</span>
                  <p className="text-xs font-mono text-slate-500 truncate">{selectedUploadFile.name} ({formatBytes(selectedUploadFile.size)})</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    {isRtl ? 'النص البديل (Alt Text - اختياري):' : 'Alt Text (Optional):'}
                  </label>
                  <input
                    type="text"
                    value={uploadAltText}
                    onChange={(e) => setUploadAltText(e.target.value)}
                    placeholder={isRtl ? 'وصف مختصر للصورة أو الفيديو...' : 'Short description...'}
                    className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:border-[#F20530] outline-none"
                  />
                </div>

                <div className={`flex items-center justify-end gap-2 pt-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <button
                    type="button"
                    onClick={handleCancelUpload}
                    disabled={isUploading}
                    className="px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    {isRtl ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="px-5 py-2.5 bg-[#F20530] hover:bg-rose-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    {isUploading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>{isRtl ? 'جاري الرفع...' : 'Uploading...'}</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-4 h-4" />
                        <span>{isRtl ? 'بدء الرفع' : 'Start Upload'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SEARCH, FILTERS & VIEW MODE TOOLBAR */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className={`flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 ${isRtl ? 'lg:flex-row-reverse' : ''}`}>
          
          {/* Keyword Search Input */}
          <div className="relative flex-1 max-w-lg">
            <span className={`absolute inset-y-0 ${isRtl ? 'right-3.5' : 'left-3.5'} flex items-center pointer-events-none text-slate-400`}>
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder={isRtl ? 'ابحث في الوسائط باسم الملف أو النص البديل...' : 'Search media by file name or alt text...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`block w-full ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-[#F20530] focus:ring-4 focus:ring-[#F20530]/5 transition-all`}
              id="search-media-library-input"
            />
          </div>

          {/* Category Tabs & View Options */}
          <div className={`flex flex-wrap items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
            
            {/* Filter Pills */}
            <div className={`flex items-center gap-1 border border-slate-200 rounded-xl p-1 bg-slate-50 ${isRtl ? 'flex-row-reverse' : ''}`}>
              {[
                { id: 'all', label: isRtl ? 'الكل' : 'All' },
                { id: 'image', label: isRtl ? 'الصور' : 'Images' },
                { id: 'video', label: isRtl ? 'الفيديو' : 'Videos' },
                { id: 'document', label: isRtl ? 'الملفات' : 'Documents' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setTypeFilter(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    typeFilter === tab.id 
                      ? 'bg-white text-[#F20530] shadow-xs border border-slate-200/60' 
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Sorter Selection */}
            <div className={`flex items-center gap-1.5 border border-slate-200 rounded-xl px-3 py-1.5 bg-slate-50 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <ArrowUpDown className="w-3.5 h-3.5 text-[#F20530]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent border-none outline-none text-xs font-bold text-slate-700 cursor-pointer"
                id="sort-media-library-select"
              >
                <option value="created_at">{isRtl ? 'التاريخ' : 'Date'}</option>
                <option value="file_name">{isRtl ? 'الاسم' : 'Name'}</option>
                <option value="file_size">{isRtl ? 'الحجم' : 'Size'}</option>
              </select>
            </div>

            {/* Grid/List togglers */}
            <div className="flex items-center border border-slate-200 rounded-xl p-1 bg-slate-50 shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-white shadow-xs text-[#F20530] border border-slate-200/50' : 'text-slate-400 hover:text-slate-600'}`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${viewMode === 'list' ? 'bg-white shadow-xs text-[#F20530] border border-slate-200/50' : 'text-slate-400 hover:text-slate-600'}`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* ERROR STATE */}
      {apiError && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-[#F20530] mx-auto" />
          <h3 className="text-sm font-extrabold text-rose-900">{apiError}</h3>
          <button
            onClick={fetchMedia}
            className="px-4 py-2 bg-[#F20530] hover:bg-rose-600 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>إعادة المحاولة</span>
          </button>
        </div>
      )}

      {/* LOADING STATE */}
      {isLoading && !apiError ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 animate-pulse">
              <div className="aspect-video bg-slate-100 rounded-xl" />
              <div className="h-4 bg-slate-100 rounded w-3/4" />
              <div className="h-3 bg-slate-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : null}

      {/* MAIN ASSETS DISPLAY (GRID OR LIST) */}
      {!isLoading && !apiError && mediaList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 text-[#F20530] flex items-center justify-center mx-auto">
            <FolderOpen className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-slate-900">
              {isRtl ? 'لا توجد وسائط حتى الآن.' : 'No media items found.'}
            </h3>
            <p className="text-xs text-slate-400 font-semibold max-w-sm mx-auto leading-relaxed">
              {isRtl ? 'لم نجد أي ملف يطابق البحث الحسابي، جرب رفـع ملف جديد أو تغيير عوامل التصفية.' : 'Try adjusting filters or upload a new media file.'}
            </p>
          </div>
          {canPerform('media', 'create') && (
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-5 py-2.5 bg-[#F20530] hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md inline-flex items-center gap-2"
            >
              <UploadCloud className="w-4 h-4" />
              <span>إضافة Media</span>
            </button>
          )}
        </div>
      ) : null}

      {!isLoading && !apiError && mediaList.length > 0 ? (
        viewMode === 'grid' ? (
          
          /* GRID VIEW MODULE */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {mediaList.map((item) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
                >
                  {/* Thumbnail Layer with action triggers */}
                  <div className="aspect-video w-full relative bg-slate-100 overflow-hidden border-b border-slate-100 shrink-0">
                    {renderThumbnail(item)}
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                      {(selectable || onSelectMedia) && (
                        <button
                          onClick={() => {
                            if (onSelectMedia) onSelectMedia(item);
                            if (onClose) onClose();
                          }}
                          className="px-3 py-2 rounded-xl bg-[#F20530] text-white hover:bg-rose-600 text-xs font-bold transition-all cursor-pointer shadow-md flex items-center gap-1.5"
                          title={isRtl ? 'اختيار' : 'Select'}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{isRtl ? 'اختيار' : 'Select'}</span>
                        </button>
                      )}
                      <button
                        onClick={() => setPreviewItem(item)}
                        className="p-2 rounded-xl bg-white text-slate-900 hover:bg-rose-500 hover:text-white transition-all cursor-pointer shadow-md"
                        title={isRtl ? 'عرض المعاينة' : 'Inspect'}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleCopyUrl(item)}
                        className="p-2 rounded-xl bg-white text-slate-900 hover:bg-rose-500 hover:text-white transition-all cursor-pointer shadow-md"
                        title={isRtl ? 'نسخ الرابط' : 'Copy URL'}
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      {canPerform('media', 'edit') && (
                        <button
                          onClick={() => handleEditClick(item)}
                          className="p-2 rounded-xl bg-white text-slate-900 hover:bg-rose-500 hover:text-white transition-all cursor-pointer shadow-md"
                          title={isRtl ? 'تعديل النص البديل' : 'Edit Alt Text'}
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}
                      {canPerform('media', 'delete') && (
                        <button
                          onClick={() => handleDeleteClick(item)}
                          className="p-2 rounded-xl bg-white text-[#F20530] hover:bg-rose-600 hover:text-white transition-all cursor-pointer shadow-md"
                          title={isRtl ? 'حذف' : 'Delete'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Badge */}
                    <span className={`absolute top-2.5 ${isRtl ? 'left-2.5' : 'right-2.5'} px-2 py-0.5 rounded-md text-[9px] font-bold font-mono tracking-wider bg-black/60 text-white backdrop-blur-xs uppercase`}>
                      {item.extension || item.media_type}
                    </span>
                  </div>

                  {/* Info Content */}
                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase">
                        ID: {item.id}
                      </span>
                      <h4 
                        className="text-xs font-bold text-slate-800 truncate cursor-pointer hover:text-[#F20530] transition-colors"
                        onClick={() => setPreviewItem(item)}
                        title={item.file_name}
                      >
                        {item.file_name}
                      </h4>
                      {item.alt_text && (
                        <p className="text-[10px] text-slate-400 truncate italic">
                          "{item.alt_text}"
                        </p>
                      )}
                    </div>

                    <div className={`flex items-center justify-between text-[10px] font-semibold text-slate-400 border-t border-slate-100/80 pt-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                      <span className="font-mono">{formatBytes(item.file_size)}</span>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#F20530]" />
                        <span>{item.created_at ? new Date(item.created_at).toLocaleDateString(isRtl ? 'ar-SA' : 'en-US') : '-'}</span>
                      </div>
                    </div>

                    {(selectable || onSelectMedia) && (
                      <button
                        onClick={() => {
                          if (onSelectMedia) onSelectMedia(item);
                          if (onClose) onClose();
                        }}
                        className="w-full mt-2 py-2 px-3 bg-[#F20530] hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isRtl ? 'اختيار هذه الصورة' : 'Select Asset'}</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          
          /* LIST VIEW MODULE */
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider ${isRtl ? 'text-right' : 'text-left'}`}>
                    <th className="py-4 px-5">{isRtl ? 'الملف والمعاينة' : 'File & ID'}</th>
                    <th className="py-4 px-4">{isRtl ? 'نوع الوسائط' : 'Type'}</th>
                    <th className="py-4 px-4">{isRtl ? 'الحجم' : 'Size'}</th>
                    <th className="py-4 px-4">{isRtl ? 'تاريخ الرفع' : 'Date Uploaded'}</th>
                    <th className="py-4 px-5 text-right">{isRtl ? 'إجراءات التحكم' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700">
                  <AnimatePresence mode="popLayout">
                    {mediaList.map((item) => (
                      <motion.tr
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        key={item.id}
                        className="hover:bg-slate-50/50 transition-all group"
                      >
                        <td className="py-3 px-5">
                          <div className={`flex items-center gap-3.5 ${isRtl ? 'flex-row-reverse' : ''}`}>
                            <div className="w-12 h-8 rounded-lg overflow-hidden shrink-0 border border-slate-200 bg-slate-50 relative">
                              {renderThumbnail(item)}
                            </div>
                            <div className={`min-w-0 ${isRtl ? 'text-right' : 'text-left'}`}>
                              <h4 
                                onClick={() => setPreviewItem(item)}
                                className="text-xs font-extrabold text-slate-900 truncate hover:text-[#F20530] cursor-pointer transition-colors"
                              >
                                {item.file_name}
                              </h4>
                              <span className="text-[10px] font-mono text-slate-400 block mt-0.5">ID: {item.id}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold font-mono uppercase ${
                            item.media_type === 'image' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                            item.media_type === 'video' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                            'bg-amber-50 text-amber-600 border border-amber-100'
                          }`}>
                            {item.media_type}
                          </span>
                        </td>

                        <td className="py-3 px-4 font-mono text-slate-600">
                          {formatBytes(item.file_size)}
                        </td>

                        <td className="py-3 px-4 text-slate-500 font-mono">
                          {item.created_at ? new Date(item.created_at).toLocaleDateString(isRtl ? 'ar-SA' : 'en-US') : '-'}
                        </td>

                        <td className="py-3 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {(selectable || onSelectMedia) && (
                              <button
                                onClick={() => {
                                  if (onSelectMedia) onSelectMedia(item);
                                  if (onClose) onClose();
                                }}
                                className="px-3 py-1.5 bg-[#F20530] hover:bg-rose-600 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs mr-2"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>{isRtl ? 'اختيار' : 'Select'}</span>
                              </button>
                            )}
                            <button
                              onClick={() => setPreviewItem(item)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer"
                              title="Inspect"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleCopyUrl(item)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer"
                              title="Copy URL"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            {canPerform('media', 'edit') && (
                              <button
                                onClick={() => handleEditClick(item)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer"
                                title="Edit Alt Text"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                            )}
                            {canPerform('media', 'delete') && (
                              <button
                                onClick={() => handleDeleteClick(item)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-[#F20530] hover:bg-rose-50 transition-all cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : null}

      {/* POPUP 1: FULL DETAIL PREVIEW / PLAYER MODAL */}
      <AnimatePresence>
        {previewItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-xs" onClick={() => setPreviewItem(null)} />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-2xl max-w-4xl w-full border border-slate-200 overflow-hidden shadow-2xl z-10 flex flex-col md:flex-row max-h-[90vh] overflow-y-auto"
            >
              <div className="md:w-3/5 bg-slate-950 flex items-center justify-center relative min-h-[280px] md:min-h-[420px]">
                {previewItem.media_type === 'image' && previewItem.url ? (
                  <img 
                    src={previewItem.url} 
                    alt={previewItem.alt_text || previewItem.file_name} 
                    referrerPolicy="no-referrer"
                    className="max-h-[420px] max-w-full object-contain" 
                  />
                ) : previewItem.media_type === 'video' && previewItem.url ? (
                  <video 
                    src={previewItem.url} 
                    controls 
                    autoPlay 
                    className="max-h-[420px] w-full object-contain" 
                  />
                ) : (
                  <div className="text-center space-y-4">
                    <FileText className="w-16 h-16 text-amber-500 mx-auto" />
                    <span className="text-white text-xs font-mono font-bold block uppercase bg-white/5 px-3 py-1 rounded-full">
                      {previewItem.mime_type || previewItem.extension}
                    </span>
                  </div>
                )}

                <button
                  onClick={() => setPreviewItem(null)}
                  className="absolute top-4 left-4 p-2 rounded-xl bg-black/60 hover:bg-black text-white cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="md:w-2/5 p-6 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-100">
                <div className="space-y-5">
                  <div className={`flex items-start justify-between ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-[#F20530] uppercase tracking-widest">ID: {previewItem.id}</span>
                      <h3 className="text-base font-extrabold text-slate-900 break-all">{previewItem.file_name}</h3>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4 space-y-3.5">
                    <div className={`flex items-center justify-between text-xs font-semibold ${isRtl ? 'flex-row-reverse' : ''}`}>
                      <span className="text-slate-400">حجم الملف:</span>
                      <span className="text-slate-800 font-mono">{formatBytes(previewItem.file_size)}</span>
                    </div>
                    <div className={`flex items-center justify-between text-xs font-semibold ${isRtl ? 'flex-row-reverse' : ''}`}>
                      <span className="text-slate-400">النوع:</span>
                      <span className="text-slate-800 font-mono uppercase">{previewItem.media_type} ({previewItem.extension})</span>
                    </div>
                    <div className={`flex items-center justify-between text-xs font-semibold ${isRtl ? 'flex-row-reverse' : ''}`}>
                      <span className="text-slate-400">تاريخ الرفع:</span>
                      <span className="text-slate-800 font-mono">
                        {previewItem.created_at ? new Date(previewItem.created_at).toLocaleString(isRtl ? 'ar-SA' : 'en-US') : '-'}
                      </span>
                    </div>
                    <div className="space-y-1 pt-2 border-t border-slate-100">
                      <span className="text-xs font-semibold text-slate-400 block">النص البديل (Alt Text):</span>
                      <p className="text-xs font-semibold text-slate-800 bg-slate-50 p-2 rounded-lg border border-slate-200/60 min-h-[38px]">
                        {previewItem.alt_text || 'لا يوجد نص بديل'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5 mt-6">
                  <button
                    onClick={() => handleCopyUrl(previewItem)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                  >
                    <Copy className="w-4 h-4" />
                    <span>نسخ رابط الملف المباشر</span>
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    {canPerform('media', 'edit') && (
                      <button
                        onClick={() => {
                          handleEditClick(previewItem);
                          setPreviewItem(null);
                        }}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#F20530]" />
                        <span>تعديل Alt Text</span>
                      </button>
                    )}
                    {canPerform('media', 'delete') && (
                      <button
                        onClick={() => handleDeleteClick(previewItem)}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 border border-slate-200 hover:bg-rose-50 text-[#F20530] rounded-xl text-xs font-bold cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>حذف الملف</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* POPUP 2: EDIT ALT TEXT MODAL */}
      <AnimatePresence>
        {itemToEdit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setItemToEdit(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-md w-full border border-slate-200 p-6 shadow-2xl z-10 space-y-4"
            >
              <div className={`flex items-center justify-between border-b border-slate-100 pb-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <h3 className="text-sm font-extrabold text-slate-900">تعديل النص البديل (Alt Text)</h3>
                <button onClick={() => setItemToEdit(null)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleEditConfirm} className="space-y-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-700 block">اسم الملف الحالي:</span>
                  <p className="text-xs font-mono text-slate-500 truncate">{itemToEdit.file_name}</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    النص البديل الجديد:
                  </label>
                  <input
                    type="text"
                    value={editAltTextInput}
                    onChange={(e) => setEditAltTextInput(e.target.value)}
                    placeholder="أدخل النص البديل الجديد..."
                    className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:border-[#F20530] outline-none transition-all"
                  />
                </div>

                <div className={`flex items-center justify-end gap-2 pt-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <button
                    type="button"
                    onClick={() => setItemToEdit(null)}
                    disabled={isUpdating}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer"
                  >
                    {isUpdating ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>جاري الحفظ...</span>
                      </>
                    ) : (
                      <span>حفظ التغييرات</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* POPUP 3: DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {itemToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setItemToDelete(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-md w-full border border-slate-200 p-6 shadow-2xl z-10 space-y-4"
            >
              <div className={`flex items-center gap-3 border-b border-slate-100 pb-3 ${isRtl ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}>
                <div className="p-2 rounded-lg bg-rose-50 text-[#F20530]">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">حذف الملف نهائياً</h3>
                  <span className="text-[10px] text-slate-400 font-bold block truncate max-w-xs">{itemToDelete.file_name}</span>
                </div>
              </div>

              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                هل أنت متأكد من رغبتك في حذف هذا الملف نهائياً؟ عند حذف هذه الوسائط، سيتم حذف الملف الفيزيائي من السيرفر وإزالته تلقائياً من أي مشاريع أو خدمات أو شعارات عملاء مرتبطة به.
              </p>

              <div className={`flex items-center justify-end gap-2 pt-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <button
                  type="button"
                  onClick={() => setItemToDelete(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-[#F20530] hover:bg-rose-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer"
                >
                  {isDeleting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>جاري الحذف...</span>
                    </>
                  ) : (
                    <span>تأكيد الحذف نهائياً</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );

  if (isOpen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto p-6 z-10 space-y-6">
          <div className={`flex items-center justify-between border-b border-slate-100 pb-4 sticky top-0 bg-white z-20 pt-1 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 text-[#F20530] flex items-center justify-center font-bold">
                <FolderOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {isRtl ? 'مكتبة الوسائط - اختيار الشعار / الصورة' : 'Media Library - Select Asset'}
                </h3>
                <p className="text-xs text-slate-400 font-semibold">
                  {isRtl ? 'انقر على "اختيار" لتحديد الملف المطلوب' : 'Click "Select" to pick an asset'}
                </p>
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          {content}
        </div>
      </div>
    );
  }

  return content;
}
