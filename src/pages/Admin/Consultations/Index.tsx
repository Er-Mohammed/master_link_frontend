import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useAuth } from '../../../context/AuthContext';
import { 
  adminConsultationsApi, 
  authApi, 
  LaravelConsultation 
} from '../../../services/api';
import { 
  MessageSquare, 
  Search, 
  Filter, 
  Eye, 
  Trash2, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  RefreshCw, 
  User, 
  Mail, 
  Phone, 
  Building, 
  Briefcase, 
  Calendar, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Send,
  AlertTriangle,
  FileText,
  Download,
  FileSpreadsheet
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Index() {
  const { isRtl } = useLanguage();
  const { canPerform } = useAuth();

  // State
  const [consultations, setConsultations] = useState<LaravelConsultation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Export Loading & Dropdown State
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);

  // Filter & Search Params
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState<number>(1);
  const [perPage] = useState<number>(10);
  const [meta, setMeta] = useState<{ current_page: number; last_page: number; total: number } | null>(null);

  // Modal / Drawer States
  const [selectedConsultation, setSelectedConsultation] = useState<LaravelConsultation | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [consultationToDelete, setConsultationToDelete] = useState<LaravelConsultation | null>(null);
  
  // Status Update State
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handle401Error = () => {
    authApi.clearToken();
    window.location.hash = '#admin-login';
  };

  // Fetch Consultations from Laravel API
  const fetchConsultations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params: any = {
        page,
        per_page: perPage,
        sort: sortField,
        direction: sortDirection,
      };

      if (search.trim()) params.search = search.trim();
      if (statusFilter !== 'all') params.status = statusFilter;

      const response = await adminConsultationsApi.getAll(params);
      setConsultations(response.data || []);
      if (response.meta) {
        setMeta({
          current_page: response.meta.current_page,
          last_page: response.meta.last_page,
          total: response.meta.total,
        });
      }
    } catch (err: any) {
      if (err?.status === 401) {
        handle401Error();
        return;
      }
      if (err?.status === 403) {
        setError(isRtl ? 'غير مصرح لك بعرض طلبات الاستشارات.' : 'Unauthorized to view consultations.');
        return;
      }
      setError(err?.message || (isRtl ? 'حدث خطأ أثناء تحميل طلبات الاستشارات.' : 'Failed to load consultations.'));
    } finally {
      setLoading(false);
    }
  }, [page, perPage, search, statusFilter, sortField, sortDirection, isRtl]);

  useEffect(() => {
    fetchConsultations();
  }, [fetchConsultations]);

  // Export Excel Handler
  const handleExportExcel = async () => {
    setIsExportingExcel(true);
    try {
      const params: any = {};
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== 'all') params.status = statusFilter;
      if (sortField) params.sort = sortField;
      if (sortDirection) params.direction = sortDirection;

      const blob = await adminConsultationsApi.exportExcel(params);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `masterlink-consultations-${new Date().toISOString().slice(0, 10)}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      if (err?.status === 401) {
        handle401Error();
        return;
      }
      if (err?.status === 403) {
        alert(isRtl ? 'ليس لديك صلاحية لتصدير الاستشارات.' : 'Unauthorized to export consultations.');
        return;
      }
      alert(err?.message || (isRtl ? 'تعذر إنشاء ملف Excel للتصدير.' : 'Failed to export Excel file.'));
    } finally {
      setIsExportingExcel(false);
    }
  };

  // Export PDF Handler
  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    try {
      const params: any = {};
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== 'all') params.status = statusFilter;
      if (sortField) params.sort = sortField;
      if (sortDirection) params.direction = sortDirection;

      const blob = await adminConsultationsApi.exportPdf(params);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `masterlink-consultations-${new Date().toISOString().slice(0, 10)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      if (err?.status === 401) {
        handle401Error();
        return;
      }
      if (err?.status === 403) {
        alert(isRtl ? 'ليس لديك صلاحية لتصدير الاستشارات.' : 'Unauthorized to export consultations.');
        return;
      }
      alert(err?.message || (isRtl ? 'تعذر إنشاء ملف PDF للتصدير.' : 'Failed to export PDF file.'));
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Status Change Handler
  const handleUpdateStatus = async (consultationId: number, newStatus: LaravelConsultation['status']) => {
    setUpdatingStatus(true);
    try {
      const response = await adminConsultationsApi.update(consultationId, { status: newStatus });
      if (selectedConsultation && selectedConsultation.id === consultationId) {
        setSelectedConsultation(response.data);
      }
      fetchConsultations();
    } catch (err: any) {
      if (err?.status === 401) {
        handle401Error();
        return;
      }
      alert(err?.message || (isRtl ? 'فشل تغيير حالة الاستشارة' : 'Failed to update consultation status'));
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Delete Handler
  const handleDeleteConfirm = async () => {
    if (!consultationToDelete) return;
    setDeleteLoading(true);

    try {
      await adminConsultationsApi.delete(consultationToDelete.id);
      if (selectedConsultation?.id === consultationToDelete.id) {
        setSelectedConsultation(null);
        setIsDetailsOpen(false);
      }
      setConsultationToDelete(null);
      fetchConsultations();
    } catch (err: any) {
      if (err?.status === 401) {
        handle401Error();
        return;
      }
      alert(err?.message || (isRtl ? 'حدث خطأ أثناء حذف الاستشارة.' : 'Failed to delete consultation.'));
    } finally {
      setDeleteLoading(false);
    }
  };

  // Helper for Status Badge Styling
  const getStatusBadge = (status: LaravelConsultation['status']) => {
    switch (status) {
      case 'new':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            {isRtl ? 'جديد' : 'New'}
          </span>
        );
      case 'contacted':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
            {isRtl ? 'تم التواصل' : 'Contacted'}
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            {isRtl ? 'قيد المتابعة' : 'In Progress'}
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {isRtl ? 'مكتمل' : 'Completed'}
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            {isRtl ? 'ملغي' : 'Cancelled'}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#F20530]/10 border border-[#F20530]/20 text-[#F20530] flex items-center justify-center shrink-0">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              {isRtl ? 'إدارة استشارات العملاء' : 'Consultations Management'}
            </h2>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              {isRtl ? 'متابعة طلبات الاستشارات الواردة ومعالجتها عبر Laravel API' : 'Review and manage incoming consultation requests'}
            </p>
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-4' : 'left-4'}`} />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={isRtl ? 'بحث باسم العميل، البريد، الهاتف، الشركة...' : 'Search by name, email, phone...'}
            className={`w-full bg-slate-50 border border-slate-200 focus:border-[#F20530] focus:bg-white text-slate-900 text-xs font-semibold rounded-2xl py-2.5 outline-none transition-colors ${
              isRtl ? 'pr-11 pl-4' : 'pl-11 pr-4'
            }`}
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-2xl px-3.5 py-2.5 outline-none cursor-pointer focus:border-[#F20530]"
          >
            <option value="all">{isRtl ? 'جميع الحالات' : 'All Statuses'}</option>
            <option value="new">{isRtl ? 'جديد (New)' : 'New'}</option>
            <option value="contacted">{isRtl ? 'تم التواصل (Contacted)' : 'Contacted'}</option>
            <option value="in_progress">{isRtl ? 'قيد المتابعة (In Progress)' : 'In Progress'}</option>
            <option value="completed">{isRtl ? 'مكتمل (Completed)' : 'Completed'}</option>
            <option value="cancelled">{isRtl ? 'ملغي (Cancelled)' : 'Cancelled'}</option>
          </select>

          {/* Sort Control */}
          <select
            value={`${sortField}:${sortDirection}`}
            onChange={(e) => {
              const [f, d] = e.target.value.split(':');
              setSortField(f);
              setSortDirection(d as 'asc' | 'desc');
              setPage(1);
            }}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-2xl px-3.5 py-2.5 outline-none cursor-pointer focus:border-[#F20530]"
          >
            <option value="created_at:desc">{isRtl ? 'الأحدث أولاً' : 'Newest First'}</option>
            <option value="created_at:asc">{isRtl ? 'الأقدم أولاً' : 'Oldest First'}</option>
            <option value="name:asc">{isRtl ? 'اسم العميل (أ - ي)' : 'Name (A-Z)'}</option>
            <option value="status:asc">{isRtl ? 'حسب الحالة' : 'By Status'}</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={() => fetchConsultations()}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl border border-slate-200 transition-colors cursor-pointer"
            title={isRtl ? 'تحديث' : 'Refresh'}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Export Data Dropdown */}
          {canPerform('consultations', 'view') && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
                disabled={isExportingExcel || isExportingPdf}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-2xl px-4 py-2.5 flex items-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isExportingExcel || isExportingPdf ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#F20530]" />
                ) : (
                  <Download className="w-4 h-4 text-[#F20530]" />
                )}
                <span>
                  {isExportingExcel
                    ? (isRtl ? 'جاري تجهيز Excel...' : 'Preparing Excel...')
                    : isExportingPdf
                    ? (isRtl ? 'جاري تجهيز PDF...' : 'Preparing PDF...')
                    : (isRtl ? 'تصدير البيانات' : 'Export Data')}
                </span>
              </button>

              {isExportDropdownOpen && (
                <div
                  className={`absolute top-full mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-30 ${
                    isRtl ? 'left-0' : 'right-0'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setIsExportDropdownOpen(false);
                      handleExportExcel();
                    }}
                    disabled={isExportingExcel}
                    className="w-full px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors text-right"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>{isRtl ? 'تصدير Excel (.xlsx)' : 'Export Excel (.xlsx)'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsExportDropdownOpen(false);
                      handleExportPdf();
                    }}
                    disabled={isExportingPdf}
                    className="w-full px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors text-right border-t border-slate-100"
                  >
                    <FileText className="w-4 h-4 text-[#F20530]" />
                    <span>{isRtl ? 'تصدير PDF (.pdf)' : 'Export PDF (.pdf)'}</span>
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs font-bold">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-[#F20530] animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-bold">
              {isRtl ? 'جاري تحميل الاستشارات من Laravel API...' : 'Loading consultations from Laravel...'}
            </p>
          </div>
        ) : consultations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className={`w-full text-xs font-semibold text-slate-700 ${isRtl ? 'text-right' : 'text-left'}`}>
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-4 px-6">#</th>
                  <th className="py-4 px-6">{isRtl ? 'العميل والجهة' : 'Client & Company'}</th>
                  <th className="py-4 px-6">{isRtl ? 'معلومات التواصل' : 'Contact Info'}</th>
                  <th className="py-4 px-6">{isRtl ? 'الخدمة المطلوبة' : 'Requested Service'}</th>
                  <th className="py-4 px-6">{isRtl ? 'تاريخ الطلب' : 'Submitted At'}</th>
                  <th className="py-4 px-6 text-center">{isRtl ? 'الحالة' : 'Status'}</th>
                  <th className="py-4 px-6 text-center">{isRtl ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {consultations.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    
                    {/* ID */}
                    <td className="py-4 px-6 font-mono text-slate-400 font-bold">
                      #{item.id}
                    </td>

                    {/* Client Name & Company */}
                    <td className="py-4 px-6">
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{item.name}</span>
                        </div>
                        {item.company_name && (
                          <div className="text-[11px] text-slate-500 font-semibold flex items-center gap-1.5">
                            <Building className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{item.company_name}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Contact Info */}
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <a 
                          href={`mailto:${item.email}`}
                          className="text-[11px] text-slate-600 hover:text-[#F20530] transition-colors flex items-center gap-1.5 font-mono"
                        >
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{item.email}</span>
                        </a>
                        <a 
                          href={`tel:${item.phone}`}
                          className="text-[11px] text-slate-600 hover:text-[#F20530] transition-colors flex items-center gap-1.5 font-mono"
                        >
                          <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{item.phone}</span>
                        </a>
                      </div>
                    </td>

                    {/* Service */}
                    <td className="py-4 px-6">
                      {item.service ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-[11px] font-bold">
                          <Briefcase className="w-3 h-3 text-slate-400" />
                          {item.service.title}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-sans italic text-[11px]">
                          {isRtl ? 'استشارة عامة' : 'General Inquiry'}
                        </span>
                      )}
                    </td>

                    {/* Created Date */}
                    <td className="py-4 px-6 font-mono text-slate-500 text-xs">
                      {new Date(item.created_at).toLocaleDateString(isRtl ? 'ar-SA' : 'en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-6 text-center">
                      {getStatusBadge(item.status)}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        
                        {/* View Details */}
                        <button
                          onClick={() => {
                            setSelectedConsultation(item);
                            setIsDetailsOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-[#F20530] hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title={isRtl ? 'عرض التفاصيل' : 'View Case Details'}
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Quick Status Select */}
                        {canPerform('consultations', 'edit') && (
                          <select
                            disabled={updatingStatus}
                            value={item.status}
                            onChange={(e) => handleUpdateStatus(item.id, e.target.value as any)}
                            className="text-[10px] font-bold bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none focus:border-[#F20530] cursor-pointer"
                          >
                            <option value="new">{isRtl ? 'جديد' : 'New'}</option>
                            <option value="contacted">{isRtl ? 'تم التواصل' : 'Contacted'}</option>
                            <option value="in_progress">{isRtl ? 'قيد المتابعة' : 'In Progress'}</option>
                            <option value="completed">{isRtl ? 'مكتمل' : 'Completed'}</option>
                            <option value="cancelled">{isRtl ? 'ملغي' : 'Cancelled'}</option>
                          </select>
                        )}

                        {/* Delete */}
                        {canPerform('consultations', 'delete') && (
                          <button
                            onClick={() => setConsultationToDelete(item)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title={isRtl ? 'حذف' : 'Delete'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}

                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 text-center space-y-3">
            <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500 font-bold">
              {isRtl ? 'لا توجد طلبات استشارات مطابقة للبحث.' : 'No consultation requests found.'}
            </p>
          </div>
        )}

        {/* Pagination Footer */}
        {meta && meta.last_page > 1 && (
          <div className="p-4 bg-slate-50/80 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold">
              {isRtl ? `الصفحة ${meta.current_page} من ${meta.last_page} (${meta.total} استشارة)` : `Page ${meta.current_page} of ${meta.last_page} (${meta.total} consultations)`}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold disabled:opacity-50 cursor-pointer bg-white hover:bg-slate-50"
              >
                {isRtl ? 'السابق' : 'Previous'}
              </button>
              <button
                disabled={page >= meta.last_page}
                onClick={() => setPage(p => Math.min(meta.last_page, p + 1))}
                className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold disabled:opacity-50 cursor-pointer bg-white hover:bg-slate-50"
              >
                {isRtl ? 'التالي' : 'Next'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Case Details Drawer / Modal */}
      <AnimatePresence>
        {isDetailsOpen && selectedConsultation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className={`bg-white border border-slate-200 rounded-3xl w-full max-w-2xl my-8 shadow-2xl overflow-hidden ${isRtl ? 'rtl text-right' : 'ltr text-left'}`}
              dir={isRtl ? 'rtl' : 'ltr'}
            >
              {/* Header */}
              <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#F20530]/10 border border-[#F20530]/20 rounded-2xl text-[#F20530]">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      {isRtl ? `طلب استشارة #${selectedConsultation.id}` : `Consultation Case #${selectedConsultation.id}`}
                    </h3>
                    <p className="text-xs text-slate-500 font-semibold">
                      {new Date(selectedConsultation.created_at).toLocaleString(isRtl ? 'ar-SA' : 'en-US')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsDetailsOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                
                {/* Client Intelligence Card */}
                <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-[#F20530]" />
                      <span className="font-bold text-slate-900 text-xs">{selectedConsultation.name}</span>
                    </div>
                    {getStatusBadge(selectedConsultation.status)}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {selectedConsultation.company_name && (
                      <div className="flex items-center gap-2 text-slate-600 font-semibold">
                        <Building className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>{selectedConsultation.company_name}</span>
                      </div>
                    )}
                    <a href={`mailto:${selectedConsultation.email}`} className="flex items-center gap-2 text-slate-600 hover:text-[#F20530] font-semibold font-mono">
                      <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{selectedConsultation.email}</span>
                    </a>
                    <a href={`tel:${selectedConsultation.phone}`} className="flex items-center gap-2 text-slate-600 hover:text-[#F20530] font-semibold font-mono">
                      <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{selectedConsultation.phone}</span>
                    </a>
                    {selectedConsultation.service && (
                      <div className="flex items-center gap-2 text-slate-600 font-semibold">
                        <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>{selectedConsultation.service.title}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Message Content */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#F20530]" />
                    <span>{isRtl ? 'تفاصيل الرسالة والمتطلبات:' : 'Inquiry Message:'}</span>
                  </h4>
                  <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs text-slate-800 font-semibold leading-relaxed whitespace-pre-wrap">
                    {selectedConsultation.message}
                  </div>
                </div>

                {/* Status Updater inside Drawer */}
                {canPerform('consultations', 'edit') && (
                  <div className="p-4 bg-rose-50/50 border border-rose-100 rounded-2xl space-y-2">
                    <label className="block text-xs font-bold text-slate-800">
                      {isRtl ? 'تحديث حالة الاستشارة:' : 'Update Consultation Status:'}
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                      {(['new', 'contacted', 'in_progress', 'completed', 'cancelled'] as const).map((st) => (
                        <button
                          key={st}
                          disabled={updatingStatus || selectedConsultation.status === st}
                          onClick={() => handleUpdateStatus(selectedConsultation.id, st)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            selectedConsultation.status === st
                              ? 'bg-[#F20530] text-white shadow-md shadow-[#F20530]/20'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {st === 'new' && (isRtl ? 'جديد' : 'New')}
                          {st === 'contacted' && (isRtl ? 'تم التواصل' : 'Contacted')}
                          {st === 'in_progress' && (isRtl ? 'قيد المتابعة' : 'In Progress')}
                          {st === 'completed' && (isRtl ? 'مكتمل' : 'Completed')}
                          {st === 'cancelled' && (isRtl ? 'ملغي' : 'Cancelled')}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <a
                  href={`mailto:${selectedConsultation.email}?subject=${encodeURIComponent(isRtl ? 'بخصوص طلب الاستشارة - MasterLink' : 'RE: Consultation Request')}`}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isRtl ? 'إرسال بريد إلكتروني للعميل' : 'Send Email to Client'}</span>
                </a>

                <button
                  type="button"
                  onClick={() => setIsDetailsOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100"
                >
                  {isRtl ? 'إغلاق' : 'Close'}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {consultationToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5 text-center ${isRtl ? 'rtl' : 'ltr'}`}
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-[#F20530] flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-base font-black text-slate-900">
                  {isRtl ? 'حذف طلب الاستشارة' : 'Delete Consultation Request'}
                </h3>
                <p className="text-xs text-slate-500 font-semibold mt-1">
                  {isRtl ? `هل أنت متأكد من حذف طلب الاستشارة الخاص بـ "${consultationToDelete.name}"؟ لا يمكن التراجع عن هذا الإجراء.` : `Are you sure you want to delete consultation for "${consultationToDelete.name}"?`}
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setConsultationToDelete(null)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="button"
                  disabled={deleteLoading}
                  onClick={handleDeleteConfirm}
                  className="flex-1 py-2.5 bg-[#F20530] hover:bg-[#d00428] text-white rounded-xl text-xs font-bold shadow-lg shadow-[#F20530]/20 flex items-center justify-center gap-2 transition-all"
                >
                  {deleteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>{isRtl ? 'حذف' : 'Delete'}</span>}
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
