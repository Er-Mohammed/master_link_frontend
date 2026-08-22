import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useAuth } from '../../../context/AuthContext';
import { 
  adminTestimonialsApi, 
  authApi, 
  LaravelTestimonial 
} from '../../../services/api';
import { Create } from './Create';
import { Edit } from './Edit';
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  XCircle, 
  ArrowUpDown, 
  AlertTriangle,
  Quote,
  Loader2,
  RefreshCw,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Index() {
  const { isRtl } = useLanguage();
  const { canPerform } = useAuth();


  // Testimonials State
  const [testimonials, setTestimonials] = useState<LaravelTestimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Search states
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Toast Notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'danger' } | null>(null);

  const showToast = (message: string, type: 'success' | 'danger' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<LaravelTestimonial | null>(null);
  const [testimonialToDelete, setTestimonialToDelete] = useState<LaravelTestimonial | null>(null);

  const handle401Error = () => {
    authApi.clearToken();
    window.location.hash = '#admin-login';
  };

  // Fetch Testimonials from Laravel API
  const fetchTestimonials = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminTestimonialsApi.getAll();
      if (Array.isArray(response.data)) {
        setTestimonials(response.data);
      } else {
        setTestimonials([]);
      }
    } catch (err: any) {
      if (err?.status === 401) {
        handle401Error();
        return;
      }
      setError(err?.message || (isRtl ? 'تعذر تحميل آراء العملاء من السيرفر.' : 'Failed to load testimonials from server.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  // Filtered Testimonials list
  const filteredTestimonials = useMemo(() => {
    let list = testimonials || [];

    // Filter by tab
    if (activeTab === 'active') {
      list = list.filter(t => t.is_active);
    } else if (activeTab === 'inactive') {
      list = list.filter(t => !t.is_active);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(t => 
        t.display_name.toLowerCase().includes(q) ||
        t.message.toLowerCase().includes(q)
      );
    }

    // Sort order
    return [...list].sort((a, b) => {
      const orderA = a.sort_order ?? 0;
      const orderB = b.sort_order ?? 0;
      return sortDir === 'asc' ? orderA - orderB : orderB - orderA;
    });
  }, [testimonials, activeTab, searchTerm, sortDir]);

  // Counts for tabs
  const counts = useMemo(() => {
    const list = testimonials || [];
    return {
      all: list.length,
      active: list.filter(t => t.is_active).length,
      inactive: list.filter(t => !t.is_active).length,
    };
  }, [testimonials]);

  // Toggle active status
  const handleToggleActive = async (t: LaravelTestimonial) => {
    try {
      const updatedStatus = !t.is_active;
      await adminTestimonialsApi.update(t.id, { is_active: updatedStatus });
      setTestimonials(prev => prev.map(item => item.id === t.id ? { ...item, is_active: updatedStatus } : item));
      showToast(isRtl ? `تم تحديث حالة الرأي إلى: ${updatedStatus ? 'مفعل' : 'غير مفعل'}` : `Status updated to ${updatedStatus ? 'Active' : 'Inactive'}`);
    } catch (err: any) {
      if (err?.status === 401) handle401Error();
      else if (err?.status === 403) showToast(isRtl ? 'ليس لديك صلاحية لتغيير الحالة.' : 'Unauthorized action.', 'danger');
      else showToast(err?.message || (isRtl ? 'تعذر تغيير الحالة' : 'Failed to update status'), 'danger');
    }
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!testimonialToDelete) return;
    try {
      await adminTestimonialsApi.delete(testimonialToDelete.id);
      showToast(
        isRtl 
          ? `تم حذف رأي العميل "${testimonialToDelete.display_name}" نهائياً من قاعدة البيانات.` 
          : `Testimonial for "${testimonialToDelete.display_name}" deleted permanently.`, 
        'danger'
      );
      setTestimonialToDelete(null);
      await fetchTestimonials();
    } catch (err: any) {
      if (err?.status === 401) handle401Error();
      else if (err?.status === 403) showToast(isRtl ? 'ليس لديك صلاحية لحذف رأي العميل.' : 'Unauthorized action.', 'danger');
      else showToast(err?.message || (isRtl ? 'تعذر حذف رأي العميل' : 'Failed to delete testimonial'), 'danger');
    }
  };

  return (
    <div className={`space-y-6 ${isRtl ? 'rtl text-right' : 'ltr text-left'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-5 left-5 z-60 px-5 py-3 rounded-2xl shadow-xl border text-xs font-bold flex items-center gap-2 ${
              toast.type === 'success' ? 'bg-emerald-950 border-emerald-800 text-emerald-300' : 'bg-rose-950 border-rose-800 text-rose-300'
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header Card */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#F20530]/5 blur-3xl pointer-events-none" />
        
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F20530]/10 border border-[#F20530]/20 rounded-full text-[#F20530] text-xs font-semibold">
            <Quote className="w-3.5 h-3.5" />
            <span>{isRtl ? 'وحدة آراء العملاء' : 'Testimonials Module'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {isRtl ? 'إدارة آراء وانطباعات العملاء' : 'Testimonials Management'}
          </h2>
          <p className="text-sm text-slate-600 max-w-xl">
            {isRtl ? 'إدارة وحوكمة شهادات العملاء المعروضة في الواجهة الرئيسية عبر Laravel API.' : 'Manage client testimonials directly via Laravel API.'}
          </p>
        </div>

        {canPerform('testimonials', 'create') && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="relative z-10 px-5 py-3 rounded-2xl bg-[#F20530] hover:bg-[#d00428] text-white font-bold text-sm shadow-lg shadow-[#F20530]/20 hover:shadow-xl hover:shadow-[#F20530]/35 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isRtl ? 'إضافة رأي جديد' : 'Add Testimonial'}</span>
          </button>
        )}
      </div>

      {/* Filters and Search Toolbar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
        
        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
              activeTab === 'all' 
                ? 'bg-[#F20530] text-white shadow-md shadow-[#F20530]/20' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>{isRtl ? 'الكل' : 'All'}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'all' ? 'bg-black/20 text-white' : 'bg-slate-100 text-slate-600'}`}>{counts.all}</span>
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
              activeTab === 'active' 
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>{isRtl ? 'مفعل' : 'Active'}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'active' ? 'bg-black/20 text-white' : 'bg-slate-100 text-slate-600'}`}>{counts.active}</span>
          </button>
          <button
            onClick={() => setActiveTab('inactive')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
              activeTab === 'inactive' 
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>{isRtl ? 'غير مفعل' : 'Inactive'}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'inactive' ? 'bg-black/20 text-white' : 'bg-slate-100 text-slate-600'}`}>{counts.inactive}</span>
          </button>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isRtl ? 'بحث باسم العميل أو المحتوى...' : 'Search by name or message...'}
              className={`w-full bg-slate-50 border border-slate-200 focus:border-[#F20530] focus:bg-white text-slate-900 text-xs rounded-xl px-4 py-2.5 focus:outline-none transition-colors placeholder-slate-400 ${isRtl ? 'pr-3 pl-9' : 'pl-3 pr-9'}`}
            />
            <Search className={`w-4 h-4 text-slate-400 absolute top-3 ${isRtl ? 'left-3' : 'right-3'}`} />
          </div>

          <button
            onClick={() => setSortDir(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="p-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
            title={isRtl ? 'تغيير الترتيب' : 'Toggle Sort Order'}
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-[#F20530]" />
            <span className="hidden sm:inline">
              {isRtl 
                ? (sortDir === 'asc' ? 'تصاعدي' : 'تنازلي') 
                : sortDir.toUpperCase()
              }
            </span>
          </button>

          <button
            onClick={fetchTestimonials}
            disabled={loading}
            className="p-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold flex items-center shrink-0 transition-colors cursor-pointer"
            title={isRtl ? 'تحديث' : 'Refresh'}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-4 text-rose-800">
          <div className="flex items-center gap-3 text-xs font-bold">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchTestimonials}
            className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all cursor-pointer shrink-0"
          >
            {isRtl ? 'إعادة المحاولة' : 'Retry'}
          </button>
        </div>
      )}

      {/* Testimonials Table */}
      <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-[#F20530] animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-500">{isRtl ? 'جاري تحميل آراء العملاء من Laravel...' : 'Loading testimonials from Laravel...'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className={`py-4 px-5 ${isRtl ? 'text-right' : 'text-left'}`}>{isRtl ? 'الصورة' : 'Image'}</th>
                  <th className={`py-4 px-5 ${isRtl ? 'text-right' : 'text-left'}`}>{isRtl ? 'اسم العميل' : 'Display Name'}</th>
                  <th className={`py-4 px-5 ${isRtl ? 'text-right' : 'text-left'}`}>{isRtl ? 'نص الشهادة / الرأي' : 'Short Message'}</th>
                  <th className="py-4 px-5 text-center">{isRtl ? 'الترتيب' : 'Sort Order'}</th>
                  <th className="py-4 px-5 text-center">{isRtl ? 'الحالة' : 'Status'}</th>
                  <th className={`py-4 px-5 ${isRtl ? 'text-left' : 'text-right'}`}>{isRtl ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredTestimonials.length > 0 ? (
                  filteredTestimonials.map((testimonial) => {
                    const mediaUrl = testimonial.media?.url;

                    return (
                      <tr 
                        key={testimonial.id}
                        className="hover:bg-slate-50/80 transition-colors group"
                      >
                        {/* Image Thumbnail */}
                        <td className="py-4 px-5">
                          {mediaUrl ? (
                            <div className="w-12 h-12 rounded-full overflow-hidden border border-[#F20530]/40 bg-slate-100 shrink-0">
                              <img
                                src={mediaUrl}
                                alt={testimonial.display_name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm shrink-0">
                              {(testimonial.display_name || 'T').charAt(0).toUpperCase()}
                            </div>
                          )}
                        </td>

                        {/* Display Name */}
                        <td className="py-4 px-5 font-bold text-slate-900 transition-colors">
                          <div>
                            <span>{testimonial.display_name}</span>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">#{testimonial.id}</p>
                          </div>
                        </td>

                        {/* Short Message */}
                        <td className="py-4 px-5 text-slate-600 text-xs max-w-xs">
                          <p className="line-clamp-2 italic font-normal text-slate-600">
                            "{testimonial.message}"
                          </p>
                        </td>

                        {/* Sort Order */}
                        <td className="py-4 px-5 text-center">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 font-mono text-xs font-semibold text-[#F20530]">
                            #{testimonial.sort_order}
                          </span>
                        </td>

                        {/* Status Toggle */}
                        <td className="py-4 px-5 text-center">
                          <button
                            onClick={() => handleToggleActive(testimonial)}
                            className="cursor-pointer"
                            title={isRtl ? 'انقر لتغيير حالة الرأي' : 'Click to toggle status'}
                          >
                            {testimonial.is_active ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition-colors">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                {isRtl ? 'مفعل' : 'Active'}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 transition-colors">
                                <XCircle className="w-3.5 h-3.5" />
                                {isRtl ? 'غير مفعل' : 'Inactive'}
                              </span>
                            )}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-5">
                          <div className={`flex items-center gap-2 ${isRtl ? 'justify-start' : 'justify-end'}`}>
                            {canPerform('testimonials', 'edit') && (
                              <button
                                onClick={() => setEditingTestimonial(testimonial)}
                                className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                                title={isRtl ? 'تعديل' : 'Edit Testimonial'}
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                            )}
                            {canPerform('testimonials', 'delete') && (
                              <button
                                onClick={() => setTestimonialToDelete(testimonial)}
                                className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                                title={isRtl ? 'حذف نهائي' : 'Delete Testimonial'}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      {isRtl ? 'لا توجد آراء مطابقة للبحث أو التصفية الحالية.' : 'No testimonials match your filter criteria.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal Component */}
      <Create
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={fetchTestimonials}
      />

      {/* Edit Modal Component */}
      <Edit
        testimonial={editingTestimonial}
        isOpen={!!editingTestimonial}
        onClose={() => setEditingTestimonial(null)}
        onSuccess={fetchTestimonials}
      />

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {testimonialToDelete && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 ${isRtl ? 'text-right' : 'text-left'}`}
            >
              <div className="flex items-center gap-3 text-red-600">
                <div className="p-3 bg-red-50 border border-red-100 rounded-2xl shrink-0">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900">
                    {isRtl ? 'حذف رأي العميل نهائياً' : 'Delete Testimonial'}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {isRtl ? 'سيتم حذف هذا الرأي بشكل نهائي دون إمكانية التراجع' : 'This action will permanently remove this testimonial'}
                  </p>
                </div>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">
                {isRtl ? (
                  <>هل أنت أحدث بالتأكيد من رغبتك في حذف رأي العميل <strong className="text-slate-900">"{testimonialToDelete.display_name}"</strong> نهائياً؟ لا يمكن استعادته لاحقاً.</>
                ) : (
                  <>Are you sure you want to delete the testimonial for <strong className="text-slate-900">"{testimonialToDelete.display_name}"</strong>? This item will be removed permanently.</>
                )}
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setTestimonialToDelete(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold cursor-pointer transition-colors"
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-lg shadow-red-600/20 cursor-pointer transition-colors"
                >
                  {isRtl ? 'تأكيد الحذف' : 'Confirm Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Index;
