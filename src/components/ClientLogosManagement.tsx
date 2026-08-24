import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { 
  adminClientLogosApi, 
  adminMediaApi, 
  authApi,
  LaravelClientLogo, 
  LaravelMedia 
} from '../services/api';
import { 
  Building2, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  CheckCircle2, 
  XCircle, 
  ArrowUpDown, 
  ImageIcon, 
  Check, 
  X, 
  Globe, 
  UploadCloud, 
  Loader2, 
  AlertCircle,
  RefreshCw,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function ClientLogosManagement() {
  const { isRtl } = useLanguage();
  const { canPerform } = useAuth();
  const { refreshClientLogos } = useData();


  // State Management
  const [logos, setLogos] = useState<LaravelClientLogo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tabs & Search
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'danger' | 'warning' | 'info' } | null>(null);

  const triggerToast = (message: string, type: 'success' | 'danger' | 'warning' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Modal & Form States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingLogo, setEditingLogo] = useState<LaravelClientLogo | null>(null);
  const [logoToDelete, setLogoToDelete] = useState<LaravelClientLogo | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]> | null>(null);

  // Media Selector Modal State
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [availableMedia, setAvailableMedia] = useState<LaravelMedia[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaUploadLoading, setMediaUploadLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form Input State
  const [formData, setFormData] = useState<{
    company_name: string;
    website_url: string;
    sort_order: number;
    is_active: boolean;
    media_id: number | null;
    selectedMediaUrl: string;
  }>({
    company_name: '',
    website_url: '',
    sort_order: 1,
    is_active: true,
    media_id: null,
    selectedMediaUrl: ''
  });

  // Handle 401 Unauthorized redirect
  const handle401Error = () => {
    authApi.clearToken();
    window.location.hash = '#admin-login';
  };

  // Fetch Logos from Laravel Backend
  const fetchLogos = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminClientLogosApi.getAll();
      const rawData = Array.isArray(response.data) ? response.data : [];
      const uniqueData = Array.from(
        new Map<number, LaravelClientLogo>(rawData.map(item => [item.id, item])).values()
      );
      setLogos(uniqueData);
    } catch (err: any) {
      if (err?.status === 401) {
        handle401Error();
        return;
      }
      setError(err?.message || 'تعذر جلب بيانات شعارات العملاء من السيرفر.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Media Items for picker
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
      else console.warn('Failed to load media for picker:', err);
    } finally {
      setMediaLoading(false);
    }
  };

  useEffect(() => {
    fetchLogos();
  }, []);

  // Filtered & Sorted list
  const filteredLogos = useMemo(() => {
    return logos
      .filter(logo => {
        if (activeTab === 'active' && !logo.is_active) return false;
        if (activeTab === 'inactive' && logo.is_active) return false;

        if (searchTerm.trim()) {
          const query = searchTerm.toLowerCase();
          return (
            logo.company_name.toLowerCase().includes(query) ||
            (logo.website_url && logo.website_url.toLowerCase().includes(query))
          );
        }
        return true;
      })
      .sort((a, b) => {
        return sortOrder === 'asc' ? a.sort_order - b.sort_order : b.sort_order - a.sort_order;
      });
  }, [logos, activeTab, searchTerm, sortOrder]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setValidationErrors(null);
    const nextOrder = logos.length + 1;
    setFormData({
      company_name: '',
      website_url: '',
      sort_order: nextOrder,
      is_active: true,
      media_id: null,
      selectedMediaUrl: ''
    });
    setIsCreateModalOpen(true);
    fetchMedia();
  };

  // Open Edit Modal
  const handleOpenEdit = (logo: LaravelClientLogo) => {
    setValidationErrors(null);
    setEditingLogo(logo);
    setFormData({
      company_name: logo.company_name,
      website_url: logo.website_url || '',
      sort_order: logo.sort_order,
      is_active: logo.is_active,
      media_id: logo.media_id,
      selectedMediaUrl: logo.media?.url || ''
    });
    fetchMedia();
  };

  // Handle Save Create
  const handleSaveCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors(null);

    if (!formData.media_id) {
      setValidationErrors({ media_id: ['يرجى اختيار صورة الشعار من مكتبة الوسائط.'] });
      return;
    }

    setSubmitting(true);
    try {
      await adminClientLogosApi.create({
        media_id: formData.media_id,
        company_name: formData.company_name.trim(),
        website_url: formData.website_url.trim() || null,
        sort_order: Number(formData.sort_order) || 1,
        is_active: formData.is_active
      });

      triggerToast('تم إضافة شعار العميل بنجاح.');
      setIsCreateModalOpen(false);
      await fetchLogos();
      if (refreshClientLogos) refreshClientLogos();
    } catch (err: any) {
      if (err?.status === 401) handle401Error();
      else if (err?.status === 403) triggerToast('غير مصرح لك بإضافة شعارات العملاء.', 'danger');
      else if (err?.status === 422 && err?.errors) setValidationErrors(err.errors);
      else triggerToast(err?.message || 'تعذر إضافة شعار العميل.', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLogo) return;
    setValidationErrors(null);

    setSubmitting(true);
    try {
      const payload: Partial<{
        media_id: number;
        company_name: string;
        website_url: string | null;
        sort_order: number;
        is_active: boolean;
      }> = {
        company_name: formData.company_name.trim(),
        website_url: formData.website_url.trim() || null,
        sort_order: Number(formData.sort_order) || 1,
        is_active: formData.is_active
      };

      if (formData.media_id) {
        payload.media_id = formData.media_id;
      }

      await adminClientLogosApi.update(editingLogo.id, payload);
      triggerToast('تم تحديث بيانات شعار العميل بنجاح.');
      setEditingLogo(null);
      await fetchLogos();
      if (refreshClientLogos) refreshClientLogos();
    } catch (err: any) {
      if (err?.status === 401) handle401Error();
      else if (err?.status === 403) triggerToast('غير مصرح لك بتعديل شعارات العملاء.', 'danger');
      else if (err?.status === 422 && err?.errors) setValidationErrors(err.errors);
      else triggerToast(err?.message || 'تعذر تحديث شعار العميل.', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Active Status
  const handleToggleStatus = async (logo: LaravelClientLogo) => {
    try {
      const updatedIsActive = !logo.is_active;
      await adminClientLogosApi.update(logo.id, { is_active: updatedIsActive });
      setLogos(prev => prev.map(item => item.id === logo.id ? { ...item, is_active: updatedIsActive } : item));
      triggerToast(`تم تحديث حالة الشعار إلى: ${updatedIsActive ? 'نشط (منشور)' : 'مخفي'}`);
      if (refreshClientLogos) refreshClientLogos();
    } catch (err: any) {
      if (err?.status === 401) handle401Error();
      else if (err?.status === 403) triggerToast('غير مصرح لك بتعديل حالة الشعار.', 'danger');
      else triggerToast('تعذر تغيير حالة الشعار عبر السيرفر.', 'danger');
    }
  };

  // Permanent Delete
  const handleConfirmDelete = async () => {
    const targetId = logoToDelete.id;
    try {
      await adminClientLogosApi.delete(targetId);
      setLogos(prev => prev.filter(l => l.id !== targetId));
      triggerToast('تم حذف الشعار بشكل نهائي من قاعدة البيانات.', 'danger');
      setLogoToDelete(null);
      if (refreshClientLogos) refreshClientLogos();
    } catch (err: any) {
      if (err?.status === 401) handle401Error();
      else if (err?.status === 403) triggerToast('غير مصرح لك بحذف شعار هذا العميل.', 'danger');
      else triggerToast(err?.message || 'تعذر حذف الشعار عبر السيرفر.', 'danger');
    }
  };

  // Direct File Upload to Media Library
  const handleFileUploadToLibrary = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      triggerToast('حجم الصورة أكبر من الحد الأقصى المسموح به (10 ميجابايت).', 'warning');
      return;
    }

    setMediaUploadLoading(true);
    try {
      const res = await adminMediaApi.upload(file, formData.company_name || file.name);
      const mediaItem = res.data || (res as any);
      setAvailableMedia(prev => [mediaItem, ...prev]);
      setFormData(prev => ({
        ...prev,
        media_id: mediaItem.id,
        selectedMediaUrl: mediaItem.url
      }));
      triggerToast('تم رفع الصورة بنجاح وتعيينها للشعار.');
    } catch (err: any) {
      if (err?.status === 401) handle401Error();
      else triggerToast(err?.message || 'فشل رفع الصورة إلى مكتبة الوسائط.', 'danger');
    } finally {
      setMediaUploadLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-right rtl" dir="rtl">
      
      {/* Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-5 left-5 z-60 px-5 py-3 rounded-2xl shadow-xl border text-xs font-bold flex items-center gap-2 ${
              toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
              toast.type === 'danger' ? 'bg-rose-50 border-rose-200 text-rose-800' :
              toast.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' :
              'bg-blue-50 border-blue-200 text-blue-800'
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER BAR */}
      <div className="bg-white rounded-[24px] border border-slate-200/80 p-6 shadow-xs flex flex-col gap-4">
        {/* Top Action Row */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0B132B] to-slate-800 text-white flex items-center justify-center shadow-md shadow-slate-900/10">
              <Building2 className="w-5 h-5 text-[#5683FC]" />
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
              {logos.length} شعار في النظام
            </span>
          </div>

          {canPerform('client_logos', 'create') && (
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F20530] hover:bg-rose-600 text-white font-extrabold text-xs transition-all cursor-pointer shadow-md shadow-rose-100 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة شعار عميل جديد</span>
            </button>
          )}
        </div>

        {/* Title & Description */}
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            إدارة شعارات العملاء والشركاء
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-500">
            إدارة وحوكمة شعارات شركاء النجاح والمعروضة في الواجهة الرئيسية للموقع عبر Laravel API
          </p>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white rounded-[20px] border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* TABS */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            كافة الشعارات ({logos.length})
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'active'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            النشطة بالموقع ({logos.filter(l => l.is_active).length})
          </button>
          <button
            onClick={() => setActiveTab('inactive')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'inactive'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            المخفية ({logos.filter(l => !l.is_active).length})
          </button>
        </div>

        {/* SEARCH & SORT */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 right-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="البحث عن شركة..."
              className="w-full py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#5683FC] pr-9 pl-3 text-right"
            />
          </div>

          <button
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold transition-colors cursor-pointer"
            title="ترتيب حسب الترتيب"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <span>{sortOrder === 'asc' ? 'تصاعدي' : 'تنازلي'}</span>
          </button>

          <button
            onClick={fetchLogos}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            title="تحديث البيانات"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

      </div>

      {/* ERROR BANNER */}
      {error && (
        <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-4 text-rose-800">
          <div className="flex items-center gap-3 text-xs font-bold">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchLogos}
            className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all cursor-pointer shrink-0"
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* CLIENT LOGOS GRID / LIST */}
      <div className="bg-white rounded-[24px] border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-[#5683FC] animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-500">جاري تحميل شعارات العملاء من Laravel...</p>
          </div>
        ) : filteredLogos.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto">
              <Building2 className="w-8 h-8" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-800">لا توجد شعارات مطابقة للبحث</h3>
            <p className="text-xs font-medium text-slate-400">
              يمكنك إضافة شعارات جديدة لشركاء النجاح وعرضهم في موقعك
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            
            {/* CARDS GRID adhering strictly to AGENTS.md Design Rules */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredLogos.map((logo) => {
                const mediaUrl = logo.media?.url || '';
                return (
                  <motion.div
                    key={logo.id}
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl p-4 shadow-xs relative overflow-hidden group transition-all"
                  >
                    {/* Horizontal Side-by-Side Alignment: Container (w-32 h-22 sm:w-40 sm:h-28) image on left, text on right */}
                    <div className="flex items-center gap-2">
                      
                      {/* Logo Container */}
                      <div className="w-32 h-22 sm:w-40 sm:h-28 rounded-xl bg-[#0B132B] border border-slate-800 flex items-center justify-center p-3 relative overflow-visible shrink-0">
                        {/* Ambient aura blur behind logo on hover */}
                        <div className="absolute inset-0 bg-blue-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md pointer-events-none" />
                        
                        {mediaUrl ? (
                          <img
                            src={mediaUrl}
                            alt={logo.company_name}
                            className="max-h-16 max-w-[120px] object-contain scale-120 group-hover:scale-135 transition-transform duration-500 ease-out filter drop-shadow-md cursor-pointer"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-800 text-slate-300 font-black flex items-center justify-center text-sm">
                            {(logo.company_name || 'L').charAt(0)}
                          </div>
                        )}
                      </div>

                      {/* Content Info */}
                      <div className="flex-1 min-w-0 space-y-1.5 pr-1">
                        <div className="flex items-center justify-between gap-1">
                          <h3 className="font-extrabold text-slate-900 text-sm truncate" title={logo.company_name}>
                            {logo.company_name}
                          </h3>
                          <span className="text-[10px] text-slate-400 font-mono shrink-0">
                            #{logo.id}
                          </span>
                        </div>

                        {/* Website Link */}
                        <div>
                          {logo.website_url ? (
                            <a
                              href={logo.website_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-bold text-[#5683FC] hover:underline group/link"
                            >
                              <Globe className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate max-w-[110px]">
                                {logo.website_url.replace(/^https?:\/\//, '')}
                              </span>
                              <ArrowRight className="w-3 h-3 transition-transform group-hover/link:-translate-x-0.5" />
                            </a>
                          ) : (
                            <span className="text-slate-300 italic text-[11px]">بدون رابط</span>
                          )}
                        </div>

                        {/* Status & Actions */}
                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                          {canPerform('client_logos', 'edit') ? (
                            <button
                              onClick={() => handleToggleStatus(logo)}
                              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold transition-colors cursor-pointer ${
                                logo.is_active
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {logo.is_active ? 'نشط' : 'مخفي'}
                            </button>
                          ) : (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${logo.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                              {logo.is_active ? 'نشط' : 'مخفي'}
                            </span>
                          )}

                          <div className="flex items-center gap-1">
                            {canPerform('client_logos', 'edit') && (
                              <button
                                onClick={() => handleOpenEdit(logo)}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                                title="تعديل"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {canPerform('client_logos', 'delete') && (
                              <button
                                onClick={() => setLogoToDelete(logo)}
                                className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                                title="حذف"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                      </div>

                    </div>
                  </motion.div>
                );
              })}
            </div>

          </div>
        )}
      </div>

      {/* CREATE / ADD MODAL */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setIsCreateModalOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-white rounded-[24px] border border-slate-200 p-6 space-y-6 shadow-2xl z-50 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#F20530] flex items-center justify-center font-bold">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">إضافة شعار عميل جديد</h3>
                    <p className="text-xs text-slate-400 font-medium">ربط الشعار بالوسائط وإدخال بيانات الشركة عبر API</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 422 Errors Banner */}
              {validationErrors && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
                  <div className="flex items-center gap-2 text-rose-700 text-xs font-bold">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>تنبيه: يرجى تصحيح الأخطاء التالية:</span>
                  </div>
                  <ul className="list-disc list-inside text-xs font-semibold text-rose-600 space-y-0.5 pr-2">
                    {Object.entries(validationErrors).flatMap(([field, msgs]) =>
                      Array.isArray(msgs)
                        ? msgs.map((m, i) => <li key={`${field}-${i}`}>{m}</li>)
                        : [<li key={field}>{String(msgs)}</li>]
                    )}
                  </ul>
                </div>
              )}

              <form onSubmit={handleSaveCreate} className="space-y-4">
                
                {/* Media Picker Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">
                    صورة الشعار (من مكتبة الوسائط) <span className="text-[#F20530]">*</span>
                  </label>

                  <div className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="w-24 h-16 bg-[#0B132B] rounded-lg p-2 border border-slate-800 flex items-center justify-center shrink-0">
                      {formData.selectedMediaUrl ? (
                        <img
                          src={formData.selectedMediaUrl}
                          alt="Preview"
                          className="max-h-12 max-w-[80px] object-contain scale-120"
                        />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-slate-500" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-800 truncate">
                        {formData.media_id ? `Media ID: ${formData.media_id}` : 'لم يتم اختيار صورة بعد'}
                      </div>
                      <span className="text-[10px] text-slate-400 block truncate">
                        {formData.selectedMediaUrl || 'اختر صورة من المكتبة أو قم برفع ملف جديد'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsMediaPickerOpen(true)}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
                    >
                      اختيار ميديا
                    </button>
                  </div>
                </div>

                {/* Company Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    اسم الشركة / الشريك <span className="text-[#F20530]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={150}
                    value={formData.company_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                    placeholder="مثال: شركة أرامكو السعودية"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-[#5683FC]"
                  />
                </div>

                {/* Website URL */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    رابط الموقع الإلكتروني (اختياري)
                  </label>
                  <input
                    type="url"
                    value={formData.website_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, website_url: e.target.value }))}
                    placeholder="https://example.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-[#5683FC]"
                  />
                </div>

                {/* Sort Order & Active Status */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      ترتيب العرض (sort_order)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formData.sort_order}
                      onChange={(e) => setFormData(prev => ({ ...prev, sort_order: Number(e.target.value) }))}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-[#5683FC]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      حالة الشعار بالموقع
                    </label>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, is_active: !prev.is_active }))}
                      className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                        formData.is_active
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : 'bg-slate-100 border-slate-200 text-slate-600'
                      }`}
                    >
                      {formData.is_active ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-slate-400" />}
                      <span>{formData.is_active ? 'نشط (منشور)' : 'مخفي'}</span>
                    </button>
                  </div>
                </div>

                {/* Form Action Buttons */}
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-extrabold transition-all cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-[#F20530] hover:bg-rose-600 text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-lg shadow-rose-100 flex items-center justify-center gap-2"
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>حفظ الشعار</span>
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT MODAL */}
      <AnimatePresence>
        {editingLogo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setEditingLogo(null)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-white rounded-[24px] border border-slate-200 p-6 space-y-6 shadow-2xl z-50 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
                    <Edit3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">تعديل شعار العميل</h3>
                    <p className="text-xs text-slate-400 font-medium">تعديل البيانات وعلاقة Media ID: #{editingLogo.id}</p>
                  </div>
                </div>

                <button
                  onClick={() => setEditingLogo(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 422 Validation Errors Banner */}
              {validationErrors && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
                  <div className="flex items-center gap-2 text-rose-700 text-xs font-bold">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>تنبيه: يرجى تصحيح الأخطاء التالية:</span>
                  </div>
                  <ul className="list-disc list-inside text-xs font-semibold text-rose-600 space-y-0.5 pr-2">
                    {Object.entries(validationErrors).flatMap(([field, msgs]) =>
                      Array.isArray(msgs)
                        ? msgs.map((m, i) => <li key={`${field}-${i}`}>{m}</li>)
                        : [<li key={field}>{String(msgs)}</li>]
                    )}
                  </ul>
                </div>
              )}

              <form onSubmit={handleSaveEdit} className="space-y-4">
                
                {/* Media Preview & Change */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">
                    صورة الشعار (الميديا)
                  </label>
                  <div className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="w-24 h-16 bg-[#0B132B] rounded-lg p-2 border border-slate-800 flex items-center justify-center shrink-0">
                      {formData.selectedMediaUrl ? (
                        <img
                          src={formData.selectedMediaUrl}
                          alt="Preview"
                          className="max-h-12 max-w-[80px] object-contain scale-120"
                        />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-slate-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-800 truncate">
                        Media ID: {formData.media_id}
                      </div>
                      <span className="text-[10px] text-slate-400 block truncate">
                        {formData.selectedMediaUrl}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsMediaPickerOpen(true)}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
                    >
                      تغيير الميديا
                    </button>
                  </div>
                </div>

                {/* Company Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    اسم الشركة / الشريك <span className="text-[#F20530]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={150}
                    value={formData.company_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-[#5683FC]"
                  />
                </div>

                {/* Website URL */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    رابط الموقع الإلكتروني (اختياري)
                  </label>
                  <input
                    type="url"
                    value={formData.website_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, website_url: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-[#5683FC]"
                  />
                </div>

                {/* Sort Order & Active Status */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      ترتيب العرض (sort_order)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formData.sort_order}
                      onChange={(e) => setFormData(prev => ({ ...prev, sort_order: Number(e.target.value) }))}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-[#5683FC]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      حالة الشعار
                    </label>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, is_active: !prev.is_active }))}
                      className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                        formData.is_active
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : 'bg-slate-100 border-slate-200 text-slate-600'
                      }`}
                    >
                      {formData.is_active ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-slate-400" />}
                      <span>{formData.is_active ? 'نشط (منشور)' : 'مخفي'}</span>
                    </button>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingLogo(null)}
                    className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-extrabold transition-all cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-[#0B132B] hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>تحديث البيانات</span>
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MEDIA SELECTION MODAL */}
      <AnimatePresence>
        {isMediaPickerOpen && (
          <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-black/70 backdrop-blur-xs"
              onClick={() => setIsMediaPickerOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-2xl bg-white rounded-[24px] border border-slate-200 p-6 space-y-5 shadow-2xl z-50 max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold">
                    <ImageIcon className="w-5 h-5 text-[#5683FC]" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">مكتبة الوسائط - اختيار صورة الشعار</h3>
                    <p className="text-xs text-slate-400 font-medium">اختر صورة من السيرفر أو قم برفع ملف جديد مباشر</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileUploadToLibrary}
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={mediaUploadLoading}
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#5683FC]/10 text-[#5683FC] hover:bg-[#5683FC]/20 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    {mediaUploadLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                    <span>رفع صورة جديدة</span>
                  </button>

                  <button
                    onClick={() => setIsMediaPickerOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Media Items Grid */}
              {mediaLoading ? (
                <div className="py-12 text-center space-y-2">
                  <Loader2 className="w-6 h-6 text-[#5683FC] animate-spin mx-auto" />
                  <p className="text-xs text-slate-400 font-medium">جاري تحميل الوسائط...</p>
                </div>
              ) : availableMedia.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs font-medium space-y-2">
                  <p>لا توجد صور في مكتبة الوسائط حالياً.</p>
                  <p>قم برفع صورة جديدة باستخدام زر "رفع صورة جديدة".</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto p-1 max-h-[360px]">
                  {availableMedia.map((media) => {
                    const isSelected = formData.media_id === media.id;
                    return (
                      <div
                        key={media.id}
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            media_id: media.id,
                            selectedMediaUrl: media.url
                          }));
                          setIsMediaPickerOpen(false);
                        }}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all flex flex-col items-center justify-center text-center gap-2 group ${
                          isSelected
                            ? 'bg-rose-50/50 border-[#F20530] ring-2 ring-[#F20530]/20'
                            : 'bg-slate-50 border-slate-200 hover:border-slate-400 hover:bg-slate-100'
                        }`}
                      >
                        <div className="w-full h-20 bg-[#0B132B] rounded-xl p-2 border border-slate-800 flex items-center justify-center relative overflow-hidden">
                          <img
                            src={media.url}
                            alt={media.alt_text || media.file_name}
                            className="max-h-14 max-w-[100px] object-contain group-hover:scale-110 transition-transform"
                          />
                          {isSelected && (
                            <div className="absolute top-1 right-1 bg-[#F20530] text-white rounded-full p-0.5">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                        <div className="w-full space-y-0.5">
                          <span className="text-xs font-bold text-slate-800 block truncate" title={media.file_name}>
                            {media.file_name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono block">
                            ID: {media.id}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {logoToDelete && (
          <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setLogoToDelete(null)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-white rounded-[24px] border border-slate-200 p-6 space-y-6 shadow-2xl z-50 text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 text-[#F20530] flex items-center justify-center mx-auto shadow-inner">
                <Trash2 className="w-6 h-6" />
              </div>

              <div className="space-y-2">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 leading-tight">
                  تأكيد الحذف النهائي للشعار
                </h3>
                <p className="text-slate-500 text-xs font-semibold leading-relaxed max-w-sm mx-auto">
                  هل أنت متأكد من حذف شعار "{logoToDelete.company_name}" بشكل نهائي من قاعدة البيانات؟ لا يمكن استعادته لاحقاً.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setLogoToDelete(null)}
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-extrabold transition-all cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="w-full py-3 bg-[#F20530] hover:bg-rose-600 text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-lg shadow-rose-100"
                >
                  تأكيد الحذف
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
