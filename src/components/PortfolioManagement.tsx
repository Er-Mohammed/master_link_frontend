import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { 
  MoreVertical,
  CheckCircle,
  EyeOff,
  Clock,
  Layers,
  ChevronDown,
  X,
  Briefcase, 
  Sparkles, 
  Trash2, 
  Edit, 
  Plus, 
  Search, 
  Filter, 
  Check, 
  Eye, 
  Star, 
  Grid, 
  List as ListIcon, 
  ChevronRight, 
  ChevronLeft, 
  AlertCircle, 
  ExternalLink, 
  Upload, 
  ImageIcon,
  Loader2,
  Globe,
  Bold,
  Italic,
  Heading2,
  List,
  Link,
  ArrowLeft,
  RefreshCw,
  Settings,
  Video
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  adminProjectsApi,
  adminProjectCategoriesApi,
  adminServicesApi,
  adminMediaApi,
  LaravelProject,
  LaravelProjectCategory,
  LaravelProjectPayload,
  LaravelService,
  LaravelMedia,
  authApi,
  ApiError
} from '../services/api';

export function PortfolioManagement() {
  const { isRtl } = useLanguage();
  const { canPerform } = useAuth();
  const { refreshDashboardStats } = useData();

  // API Data States
  const [projects, setProjects] = useState<LaravelProject[]>([]);
  const [categories, setCategories] = useState<LaravelProjectCategory[]>([]);
  const [availableServices, setAvailableServices] = useState<LaravelService[]>([]);
  const [availableMedia, setAvailableMedia] = useState<LaravelMedia[]>([]);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  // Relationship Selection States
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);
  const [selectedMediaIds, setSelectedMediaIds] = useState<number[]>([]);

  // Filtering & Layout States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modals & Action States
  const [activeMenuId, setActiveMenuId] = useState<number | string | null>(null);
  const [deleteId, setDeleteId] = useState<number | string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<LaravelProject | null>(null);
  const [editorLoading, setEditorLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]> | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'danger' } | null>(null);

  // Single-Field Form States for Project Editor (Laravel Contract)
  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [isManualSlug, setIsManualSlug] = useState(false);
  const [formCategoryId, setFormCategoryId] = useState<number | string>('');
  const [formClientName, setFormClientName] = useState('');
  const [formShortDescription, setFormShortDescription] = useState('');
  const [formFullDescription, setFormFullDescription] = useState('');
  const [formProjectUrl, setFormProjectUrl] = useState('');
  const [formCompletionDate, setFormCompletionDate] = useState('');
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formSortOrder, setFormSortOrder] = useState<number>(0);
  const [formIsActive, setFormIsActive] = useState<boolean>(true);
  
  // Custom cover preview & media upload state
  const [formImg, setFormImg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);

  // File Upload Handler (upload from local device)
  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setIsUploadingMedia(true);

    try {
      const result = await adminMediaApi.upload(file);
      const newMedia: LaravelMedia = result.data || (result as any);

      setAvailableMedia(prev => [newMedia, ...prev.filter(m => m.id !== newMedia.id)]);
      setSelectedMediaIds(prev => Array.from(new Set([...prev, newMedia.id])));
      triggerToast('تم رفع الملف وإضافته للمشروع بنجاح', 'success');
    } catch (err: any) {
      if (err?.status === 401) {
        handle401Error();
      } else {
        triggerToast(err?.message || 'تعذر رفع الملف إلى السيرفر', 'danger');
      }
    } finally {
      setIsUploadingMedia(false);
    }
  };

  // Markdown Tab State
  const [descTab, setDescTab] = useState<'write' | 'preview'>('write');

  // Notification Toast Helper
  const triggerToast = (msg: string, type: 'success' | 'info' | 'danger' = 'success') => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Handle Unauthorized 401
  const handle401Error = () => {
    authApi.clearToken();
    window.location.hash = '#admin-login';
  };

  // Fetch Available Services and Media for Relationship Syncing
  const fetchAvailableServicesAndMedia = async () => {
    try {
      const [servicesRes, mediaRes] = await Promise.allSettled([
        adminServicesApi.getAll({ per_page: 100, is_active: true }),
        adminMediaApi.getAll({ per_page: 100 })
      ]);
      if (servicesRes.status === 'fulfilled') {
        setAvailableServices(servicesRes.value.data || []);
      }
      if (mediaRes.status === 'fulfilled') {
        setAvailableMedia(mediaRes.value.data || []);
      }
    } catch (err) {
      console.warn('Could not load services/media relationships', err);
    }
  };

  // Fetch Categories from Laravel Backend API
  const fetchCategories = async () => {
    try {
      const res = await adminProjectCategoriesApi.getAll({ per_page: 100, is_active: true });
      const cats = res.data || [];
      setCategories(cats);
      if (cats.length > 0 && !formCategoryId) {
        setFormCategoryId(cats[0].id);
      }
    } catch (err: any) {
      if (err?.status === 401) {
        handle401Error();
      }
    }
  };

  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch Projects from Laravel Backend API
  const fetchProjects = async () => {
    setIsPageLoading(true);
    setPageError(null);
    try {
      const params: any = {
        per_page: 100,
        sort: sortBy,
        direction: sortDirection
      };
      if (debouncedSearchQuery.trim()) {
        params.search = debouncedSearchQuery.trim();
      }
      if (selectedCategory !== 'all') {
        params.category_id = selectedCategory;
      }
      if (selectedStatus === 'active') {
        params.is_active = true;
      } else if (selectedStatus === 'hidden') {
        params.is_active = false;
      }

      const res = await adminProjectsApi.getAll(params);
      setProjects(res.data || []);
    } catch (err: any) {
      if (err?.status === 401) {
        handle401Error();
      } else if (err?.status === 403) {
        setPageError('غير مصرح لك باستعراض سجلات المشاريع.');
      } else {
        setPageError(err?.message || 'تعذر الاتصال بخادم البيانات المباشر للمشاريع.');
      }
    } finally {
      setIsPageLoading(false);
    }
  };

  // Load initial categories, services, media, and projects
  useEffect(() => {
    fetchCategories();
    fetchAvailableServicesAndMedia();
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [debouncedSearchQuery, selectedCategory, selectedStatus, sortBy, sortDirection]);

  // Sync Slug auto-generation
  useEffect(() => {
    if (!isManualSlug && !editingProject) {
      setFormSlug(
        formTitle
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
          .replace(/(^-|-$)/g, '')
      );
    }
  }, [formTitle, isManualSlug, editingProject]);

  // Sync Form fields when editing an existing project or creating new
  useEffect(() => {
    setValidationErrors(null);
    if (editingProject) {
      setFormTitle(editingProject.title || '');
      setFormSlug(editingProject.slug || '');
      setIsManualSlug(true);
      setFormCategoryId(editingProject.category_id || (categories[0]?.id ?? ''));
      setFormClientName(editingProject.client_name || '');
      setFormShortDescription(editingProject.short_description || '');
      setFormFullDescription(editingProject.full_description || '');
      setFormProjectUrl(editingProject.project_url || '');
      setFormCompletionDate(editingProject.completion_date || '');
      setFormIsFeatured(Boolean(editingProject.is_featured));
      setFormSortOrder(editingProject.sort_order ?? 0);
      setFormIsActive(Boolean(editingProject.is_active));
      
      const cover = editingProject.media && editingProject.media.length > 0 
        ? editingProject.media[0].url 
        : 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80';
      setFormImg(cover);

      setSelectedServiceIds(editingProject.services ? editingProject.services.map(s => s.id) : []);
      setSelectedMediaIds(editingProject.media ? editingProject.media.map(m => m.id) : []);
    } else {
      setFormTitle('');
      setFormSlug('');
      setIsManualSlug(false);
      setFormCategoryId(categories[0]?.id ?? '');
      setFormClientName('');
      setFormShortDescription('');
      setFormFullDescription('');
      setFormProjectUrl('');
      setFormCompletionDate('');
      setFormIsFeatured(false);
      setFormSortOrder(0);
      setFormIsActive(true);
      setFormImg('https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80');

      setSelectedServiceIds([]);
      setSelectedMediaIds([]);
    }
  }, [editingProject, isEditorOpen, categories]);

  // Individual Card Actions (Toggle Status, Toggle Featured, Delete)
  const handleToggleStatus = async (project: LaravelProject) => {
    if (!canPerform('projects', 'edit')) {
      triggerToast('ليس لديك صلاحية تعديل حالة المشاريع.', 'danger');
      return;
    }

    try {
      const updatedIsActive = !project.is_active;
      await adminProjectsApi.update(project.id, { is_active: updatedIsActive });
      setProjects(prev => prev.map(p => p.id === project.id ? { ...p, is_active: updatedIsActive } : p));
      triggerToast(`تم تحديث حالة المشروع إلى: ${updatedIsActive ? 'نشط (منشور)' : 'مخفي'}`);
    } catch (err: any) {
      if (err?.status === 401) handle401Error();
      else if (err?.status === 403) triggerToast('غير مصرح لك بتغيير حالة هذا المشروع.', 'danger');
      else triggerToast('تعذر تغيير حالة المشروع عبر الخادم.', 'danger');
    }
  };

  const handleToggleFeatured = async (project: LaravelProject) => {
    if (!canPerform('projects', 'edit')) {
      triggerToast('ليس لديك صلاحية تمييز المشاريع.', 'danger');
      return;
    }

    try {
      const updatedIsFeatured = !project.is_featured;
      await adminProjectsApi.update(project.id, { is_featured: updatedIsFeatured });
      setProjects(prev => prev.map(p => p.id === project.id ? { ...p, is_featured: updatedIsFeatured } : p));
      triggerToast(`تم تحديث التمييز للمشروع: ${updatedIsFeatured ? 'مشروع مميز' : 'مشروع عادي'}`);
    } catch (err: any) {
      if (err?.status === 401) handle401Error();
      else if (err?.status === 403) triggerToast('غير مصرح لك بتعديل التمييز.', 'danger');
      else triggerToast('تعذر تحديث تمييز المشروع عبر الخادم.', 'danger');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    if (!canPerform('projects', 'delete')) {
      triggerToast('ليس لديك صلاحية حذف المشاريع.', 'danger');
      setDeleteId(null);
      return;
    }

    try {
      await adminProjectsApi.delete(deleteId);
      setProjects(prev => prev.filter(p => p.id !== deleteId));
      refreshDashboardStats();
      triggerToast('تم حذف المشروع نهائياً من قاعدة البيانات بنجاح.', 'danger');
    } catch (err: any) {
      if (err?.status === 401) handle401Error();
      else if (err?.status === 403) triggerToast('غير مصرح لك بحذف هذا المشروع.', 'danger');
      else triggerToast(err?.message || 'تعذر حذف المشروع عبر الخادم.', 'danger');
    } finally {
      setDeleteId(null);
    }
  };

  // Save / Update Form Submission
  const handleSaveProjectForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors(null);

    if (!formTitle.trim()) {
      setValidationErrors({ title: ['عنوان المشروع مطلوب.'] });
      return;
    }
    if (!formSlug.trim()) {
      setValidationErrors({ slug: ['المعرف اللاتيني للرابط (Slug) مطلوب.'] });
      return;
    }
    if (!formCategoryId) {
      setValidationErrors({ category_id: ['يرجى اختيار القسم الرئيسي للمشروع.'] });
      return;
    }

    setEditorLoading(true);

    const payload: LaravelProjectPayload = {
      category_id: Number(formCategoryId),
      title: formTitle.trim(),
      slug: formSlug.trim(),
      client_name: formClientName.trim() || null,
      short_description: formShortDescription.trim() || null,
      full_description: formFullDescription.trim() || null,
      project_url: formProjectUrl.trim() || null,
      completion_date: formCompletionDate || null,
      is_featured: formIsFeatured,
      sort_order: Number(formSortOrder),
      is_active: formIsActive
    };

    try {
      let savedProjectId: number | string;

      if (editingProject) {
        // Edit Mode
        const res = await adminProjectsApi.update(editingProject.id, payload);
        savedProjectId = editingProject.id;
      } else {
        // Create Mode
        const res = await adminProjectsApi.create(payload);
        savedProjectId = res.data.id;
      }

      // Sync Media relationship with backend: PUT /api/admin/projects/{id}/media
      try {
        await adminProjectsApi.syncMedia(savedProjectId, selectedMediaIds);
      } catch (mediaErr) {
        console.warn('Failed to sync project media:', mediaErr);
      }

      // Sync Services relationship with backend: PUT /api/admin/projects/{id}/services
      try {
        await adminProjectsApi.syncServices(savedProjectId, selectedServiceIds);
      } catch (servicesErr) {
        console.warn('Failed to sync project services:', servicesErr);
      }

      await fetchProjects();
      refreshDashboardStats();
      triggerToast(editingProject ? 'تم تحديث بيانات المشروع والمرفقات بنجاح.' : 'تم إضافة المشروع الجديد والمرفقات بنجاح.');

      setIsEditorOpen(false);
      setEditingProject(null);
    } catch (err: any) {
      if (err?.status === 401) {
        handle401Error();
      } else if (err?.status === 403) {
        triggerToast('غير مصرح لك بإجراء هذه العملية على المشاريع (HTTP 403).', 'danger');
      } else if (err?.status === 422 && err?.errors) {
        setValidationErrors(err.errors);
      } else {
        triggerToast(err?.message || 'حدث خطأ غير متوقع أثناء حفظ البيانات على الخادم.', 'danger');
      }
    } finally {
      setEditorLoading(false);
    }
  };

  // Markdown Formatter helper
  const handleInsertFormat = (type: string) => {
    let prefix = '';
    let suffix = '';
    switch (type) {
      case 'bold': prefix = '**'; suffix = '**'; break;
      case 'italic': prefix = '*'; suffix = '*'; break;
      case 'h2': prefix = '## '; suffix = ''; break;
      case 'list': prefix = '- '; suffix = ''; break;
      case 'link': prefix = '['; suffix = '](url)'; break;
    }
    setFormFullDescription(prev => prev + prefix + 'نص تجريبي' + suffix);
  };

  // Simple Markdown Renderer
  const renderMarkdownPreview = (text: string) => {
    if (!text) {
      return (
        <p className="text-slate-400 italic text-xs">
          لا يوجد تفاصيل تفصيلية للمعاينة الحالية.
        </p>
      );
    }
    const lines = text.split('\n');
    return (
      <div className="space-y-2 text-xs text-slate-700 leading-relaxed font-semibold">
        {lines.map((line, idx) => {
          const content = line.trim();
          if (content.startsWith('## ')) return <h3 key={idx} className="text-sm font-black text-slate-900 mt-3 mb-1">{content.slice(3)}</h3>;
          if (content.startsWith('# ')) return <h2 key={idx} className="text-base font-black text-[#F20530] mt-4 mb-1.5">{content.slice(2)}</h2>;
          if (content.startsWith('- ')) return <li key={idx} className="list-disc list-inside text-slate-600 mr-2">{content.slice(2)}</li>;
          return <p key={idx} className="text-slate-600">{content}</p>;
        })}
      </div>
    );
  };

  // Stats computation directly from real loaded data
  const statTotal = projects.length;
  const statActive = projects.filter(p => p.is_active).length;
  const statFeatured = projects.filter(p => p.is_featured).length;
  const statHidden = projects.filter(p => !p.is_active).length;

  return (
    <div className="p-4 md:p-6 space-y-6 bg-[#F8FAFC] min-h-screen rtl" dir="rtl">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-xl text-xs font-black flex items-center gap-2 border ${
              toast.type === 'danger'
                ? 'bg-red-500 text-white border-red-600'
                : toast.type === 'info'
                ? 'bg-blue-600 text-white border-blue-700'
                : 'bg-emerald-600 text-white border-emerald-700'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editor Full Screen Modal */}
      <AnimatePresence>
        {isEditorOpen && (
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="fixed inset-0 bg-slate-50 z-50 overflow-y-auto pb-32"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-right">
               
              {/* Header Breadcrumbs */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-5 flex-row-reverse">
                <div className="space-y-1.5 text-right">
                  <nav className="flex items-center gap-2 text-[11px] font-extrabold text-slate-400 tracking-wide flex-row-reverse">
                    <span 
                      onClick={() => { setIsEditorOpen(false); setEditingProject(null); }} 
                      className="hover:text-slate-600 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>الرئيسية</span>
                    </span>
                    <ChevronLeft className="w-3 h-3" />
                    <span onClick={() => { setIsEditorOpen(false); setEditingProject(null); }} className="hover:text-slate-600 transition-colors cursor-pointer">المشاريع</span>
                    <ChevronLeft className="w-3 h-3" />
                    <span className="text-[#F20530] font-black">{editingProject ? 'تعديل مشروع' : 'إنشاء مشروع جديد'}</span>
                  </nav>
                  
                  <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <span className="w-2.5 h-6 rounded-md bg-[#F20530] inline-block" />
                    {editingProject ? `تعديل مشروع: ${editingProject.title}` : 'إضافة مشروع جديد'}
                  </h1>
                </div>

                {/* Header Actions */}
                <div className="flex items-center gap-3 w-full md:w-auto flex-row-reverse">
                  <button
                    type="button"
                    onClick={() => { setIsEditorOpen(false); setEditingProject(null); }}
                    className="px-4.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <span>إلغاء</span>
                  </button>

                  <button
                    onClick={handleSaveProjectForm}
                    disabled={editorLoading}
                    className="px-5 py-2.5 rounded-xl bg-[#F20530] hover:bg-rose-600 text-white text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-rose-100"
                  >
                    {editorLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 fill-white" />}
                    <span>{editingProject ? 'حفظ التغييرات' : 'نشر المشروع'}</span>
                  </button>
                </div>
              </div>

              {/* 422 Validation Error Banner */}
              {validationErrors && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-right space-y-2">
                  <div className="flex items-center gap-2 text-red-700 text-xs font-black">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>تنبيه: يرجى تصحيح الأخطاء التالية قبل الحفظ:</span>
                  </div>
                  <ul className="list-disc list-inside text-xs font-bold text-red-600 pr-2 space-y-1">
                    {Object.entries(validationErrors).flatMap(([field, msgs]) =>
                      Array.isArray(msgs)
                        ? msgs.map((m, i) => <li key={`${field}-${i}`}>{m}</li>)
                        : [<li key={field}>{String(msgs)}</li>]
                    )}
                  </ul>
                </div>
              )}

              {/* Form Layout Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Main Section */}
                <div className="lg:col-span-8 space-y-6">
                  
                  {/* Basic Project Info */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 space-y-6 relative overflow-hidden shadow-xs">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#F20530]" />
                    
                    <div className="border-b border-slate-100 pb-3">
                      <h3 className="text-sm font-black text-slate-900">بيانات المشروع الأساسية</h3>
                      <p className="text-[10px] text-slate-400 font-bold mt-0.5">أدخل البيانات كما تظهر في واجهة الموقع</p>
                    </div>

                    <div className="space-y-5">
                      
                      {/* Title & Client */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider text-right">
                            اسم المشروع <span className="text-[#F20530]">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={formTitle}
                            onChange={(e) => setFormTitle(e.target.value)}
                            placeholder="مثال: منصة الراجحي الرقمية"
                            className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-[#F20530] focus:ring-2 focus:ring-[#F20530]/10 transition-all text-right"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider text-right">
                            اسم العميل أو الجهة
                          </label>
                          <input
                            type="text"
                            value={formClientName}
                            onChange={(e) => setFormClientName(e.target.value)}
                            placeholder="مثال: مصرف الراجحي"
                            className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-[#F20530] focus:ring-2 focus:ring-[#F20530]/10 transition-all text-right"
                          />
                        </div>
                      </div>

                      {/* Slug field */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider text-right">
                            المعرف اللاتيني للرابط (Slug) <span className="text-[#F20530]">*</span>
                          </label>
                          {isManualSlug && (
                            <button
                              type="button"
                              onClick={() => {
                                setIsManualSlug(false);
                                setFormSlug(formTitle.toLowerCase().trim().replace(/[^a-z0-9\u0600-\u06FF]+/g, '-'));
                              }}
                              className="text-[9px] text-[#F20530] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <RefreshCw className="w-2.5 h-2.5" />
                              <span>إعادة التوليد التلقائي</span>
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          required
                          value={formSlug}
                          onChange={(e) => {
                            setFormSlug(e.target.value);
                            setIsManualSlug(true);
                          }}
                          placeholder="al-rajhi-digital-platform"
                          className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold outline-none focus:bg-white focus:border-[#F20530] transition-all text-left"
                          dir="ltr"
                        />
                      </div>

                      {/* Category Selector */}
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider text-right">
                          قسم المشروع <span className="text-[#F20530]">*</span>
                        </label>
                        <select
                          value={formCategoryId}
                          onChange={(e) => setFormCategoryId(e.target.value)}
                          className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:bg-white focus:border-[#F20530] transition-all cursor-pointer text-right"
                        >
                          {categories.map(c => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Short Description */}
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider text-right">
                          نبذة موجزة عن المشروع
                        </label>
                        <textarea
                          rows={2}
                          value={formShortDescription}
                          onChange={(e) => setFormShortDescription(e.target.value)}
                          placeholder="اكتب نبذة وموجز عن الإنجاز والتقنيات لتظهر في البطاقة العريضة..."
                          className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-[#F20530] transition-all text-right"
                        />
                      </div>

                      {/* Full Description with Markdown toolbar */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider text-right">
                            التفاصيل الكاملة للمشروع (Markdown)
                          </label>
                          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                            <button
                              type="button"
                              onClick={() => setDescTab('write')}
                              className={`px-2.5 py-1 text-[9px] font-bold rounded-md transition-all cursor-pointer ${
                                descTab === 'write' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                              }`}
                            >
                              كتابة
                            </button>
                            <button
                              type="button"
                              onClick={() => setDescTab('preview')}
                              className={`px-2.5 py-1 text-[9px] font-bold rounded-md transition-all cursor-pointer ${
                                descTab === 'preview' ? 'bg-white text-[#F20530] shadow-xs' : 'text-slate-500'
                              }`}
                            >
                              معاينة
                            </button>
                          </div>
                        </div>

                        {descTab === 'write' ? (
                          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                            <div className="bg-slate-50 border-b border-slate-200 px-3 py-1.5 flex items-center gap-1 justify-end">
                              <button
                                type="button"
                                onClick={() => handleInsertFormat('bold')}
                                className="p-1 hover:bg-slate-200 rounded text-xs font-bold text-slate-700 cursor-pointer"
                                title="عريض"
                              >
                                <Bold className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleInsertFormat('italic')}
                                className="p-1 hover:bg-slate-200 rounded text-xs text-slate-700 cursor-pointer"
                                title="مائل"
                              >
                                <Italic className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleInsertFormat('h2')}
                                className="p-1 hover:bg-slate-200 rounded text-xs text-slate-700 cursor-pointer"
                                title="عنوان فرعي"
                              >
                                <Heading2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleInsertFormat('list')}
                                className="p-1 hover:bg-slate-200 rounded text-xs text-slate-700 cursor-pointer"
                                title="قائمة نقطية"
                              >
                                <List className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            
                            <textarea
                              rows={8}
                              value={formFullDescription}
                              onChange={(e) => setFormFullDescription(e.target.value)}
                              placeholder="اكتب التفاصيل الكاملة والحلول البرمجية باللغة العربية..."
                              className="block w-full p-4 text-xs bg-white outline-none text-slate-800 text-right"
                            />
                          </div>
                        ) : (
                          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 min-h-[200px] text-right">
                            {renderMarkdownPreview(formFullDescription)}
                          </div>
                        )}
                      </div>

                    </div>
                  </div>

                  {/* Project URL */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 space-y-4">
                    <h3 className="text-sm font-black text-slate-900">رابط المشروع الخارجي</h3>
                    <input
                      type="url"
                      value={formProjectUrl}
                      onChange={(e) => setFormProjectUrl(e.target.value)}
                      placeholder="https://example.com"
                      className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:bg-white focus:border-[#F20530] text-left"
                      dir="ltr"
                    />
                  </div>

                </div>

                {/* Sidebar Configuration */}
                <div className="lg:col-span-4 space-y-6">
                  
                  {/* Publishing Status Card */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-5 shadow-xs relative text-right">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5 flex-row-reverse">
                      <Settings className="w-3.5 h-3.5 text-[#F20530]" />
                      <span>إعدادات النشر والترتيب</span>
                    </h3>

                    <div className="space-y-2">
                      <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider">
                        حالة النشر
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setFormIsActive(true)}
                          className={`py-2 rounded-xl text-[10px] font-black transition-all border ${
                            formIsActive 
                              ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm' 
                              : 'bg-white text-slate-500 hover:bg-slate-50 border-slate-200'
                          }`}
                        >
                          نشط (مفعل)
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormIsActive(false)}
                          className={`py-2 rounded-xl text-[10px] font-black transition-all border ${
                            !formIsActive 
                              ? 'bg-slate-800 border-slate-800 text-white shadow-sm' 
                              : 'bg-white text-slate-500 hover:bg-slate-50 border-slate-200'
                          }`}
                        >
                          مخفي
                        </button>
                      </div>
                    </div>

                    {/* Featured Toggle */}
                    <div className="space-y-2 pt-3 border-t border-slate-100">
                      <div className="flex items-center justify-between flex-row-reverse">
                        <div className="max-w-[70%] text-right">
                          <label className="block text-xs font-black text-slate-900 leading-tight">
                            مشروع مميز
                          </label>
                          <span className="text-[9px] text-slate-400 font-bold block mt-0.5">
                            تثبيت المشروع في الواجهة الرئيسية للموقع
                          </span>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => setFormIsFeatured(!formIsFeatured)}
                          className={`w-10 h-5.5 rounded-full transition-colors flex items-center p-0.5 cursor-pointer shrink-0 ${
                            formIsFeatured ? 'bg-[#F20530]' : 'bg-slate-200'
                          } flex-row-reverse`}
                        >
                          <span className="w-4 h-4 rounded-full bg-white shadow-xs transition-transform" style={{
                            transform: formIsFeatured ? 'translateX(-18px)' : 'none'
                          }} />
                        </button>
                      </div>
                    </div>

                    {/* Order & Date */}
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                      <div className="space-y-1">
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider text-right">
                          تاريخ التسليم
                        </label>
                        <input
                          type="date"
                          value={formCompletionDate}
                          onChange={(e) => setFormCompletionDate(e.target.value)}
                          className="block w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold outline-none focus:bg-white focus:border-[#F20530]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider text-right">
                          ترتيب العرض
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={formSortOrder}
                          onChange={(e) => setFormSortOrder(Number(e.target.value))}
                          className="block w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold outline-none focus:bg-white focus:border-[#F20530]"
                        />
                      </div>
                    </div>

                  </div>

                  {/* Services Sync Section */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs text-right">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5 flex-row-reverse">
                      <Sparkles className="w-3.5 h-3.5 text-[#F20530]" />
                      <span>الخدمات المرتبطة بالمشروع</span>
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold">
                      اختر الخدمات التي ينتمي إليها هذا المشروع للمزامنة المباشرة.
                    </p>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {availableServices.length === 0 ? (
                        <span className="text-[10px] text-slate-400 font-semibold block">لا توجد خدمات متاحة حالياً</span>
                      ) : (
                        availableServices.map((svc) => {
                          const isChecked = selectedServiceIds.includes(svc.id);
                          return (
                            <label
                              key={svc.id}
                              className={`flex items-center justify-between p-2 rounded-xl border text-[11px] font-bold cursor-pointer transition-all ${
                                isChecked
                                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                                  : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100/60'
                              }`}
                            >
                              <span className="truncate max-w-[180px]">{svc.title}</span>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedServiceIds(prev => [...prev, svc.id]);
                                  } else {
                                    setSelectedServiceIds(prev => prev.filter(id => id !== svc.id));
                                  }
                                }}
                                className="w-4 h-4 rounded text-[#F20530] focus:ring-[#F20530]"
                              />
                            </label>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Media Sync Section matching ServiceEditor UX & Screenshot 2 */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs text-right">
                    <div className="flex items-center justify-between flex-row-reverse">
                      <div className="flex items-center gap-2 flex-row-reverse">
                        <span className="p-1.5 rounded-lg bg-rose-50 text-[#F20530]">
                          <ImageIcon className="w-4 h-4" />
                        </span>
                        <h3 className="text-xs font-black text-slate-900">وسائط وصور المشروع</h3>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
                        {selectedMediaIds.length} وسائط محددة
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 font-semibold">
                      يمكنك رفع صورة جديدة من جهازك أو اختيار الصور من مكتبة النظام الحالية. الصورة الأولى ستحدد كغلاف رئيسي.
                    </p>

                    {/* Hidden Local File Input */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={async (e) => {
                        if (e.target.files && e.target.files[0]) {
                          await handleFileUpload(e.target.files[0]);
                        }
                      }}
                      accept="image/*,video/*,.pdf,.doc,.docx"
                      className="hidden"
                    />

                    {/* 1. Direct Upload Dropzone from Device (Matching ServiceEditor UX) */}
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-200 hover:border-[#F20530]/60 rounded-2xl p-4 text-center cursor-pointer bg-slate-50/60 hover:bg-rose-50/20 transition-all text-right group select-none"
                    >
                      {isUploadingMedia ? (
                        <div className="flex items-center justify-center gap-2 py-1 text-xs font-bold text-slate-600">
                          <RefreshCw className="w-4.5 h-4.5 animate-spin text-[#F20530]" />
                          <span>جاري رفع ومعالجة وسائط جديدة من الجهاز...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between flex-row-reverse">
                          <div className="flex items-center gap-3 flex-row-reverse">
                            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-[#F20530] shrink-0 group-hover:scale-105 transition-transform">
                              <Upload className="w-5 h-5" />
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-extrabold text-slate-900 group-hover:text-[#F20530] transition-colors">
                                رفع وسائط وصور أو فيديو من جهازك
                              </p>
                              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                                PNG, JPG, WebP, MP4, WebM (اضغط لاختيار صورة أو فيديو من جهازك)
                              </p>
                            </div>
                          </div>
                          <span className="px-3 py-1.5 bg-slate-900 group-hover:bg-[#F20530] text-white rounded-xl text-[10px] font-bold shrink-0 transition-colors shadow-xs">
                            رفع من الجهاز
                          </span>
                        </div>
                      )}
                    </div>

                    {/* 2. Visual Media Thumbnails Chooser (Library Media) */}
                    {availableMedia.length === 0 ? (
                      <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-400 font-bold">
                        لا توجد وسائط سابقة في مكتبة النظام. يمكنك رفع صورة أو فيديو من جهازك أعلاه.
                      </div>
                    ) : (
                      <div className="space-y-3 pt-2">
                        <span className="text-[11px] font-extrabold text-slate-700 block">
                          أو اختر من مكتبة وسائط النظام الجاهزة:
                        </span>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-56 overflow-y-auto pr-1">
                          {availableMedia.map((med) => {
                            const isSelected = selectedMediaIds.includes(med.id);
                            const isPrimary = selectedMediaIds[0] === med.id;

                            return (
                              <div
                                key={med.id}
                                onClick={() => {
                                  if (isSelected) {
                                    setSelectedMediaIds(prev => prev.filter(id => id !== med.id));
                                  } else {
                                    setSelectedMediaIds(prev => [...prev, med.id]);
                                  }
                                }}
                                className={`relative h-20 rounded-xl overflow-hidden cursor-pointer border-2 transition-all group ${
                                  isSelected
                                    ? 'border-[#F20530] ring-2 ring-[#F20530]/20 scale-[1.02] shadow-xs'
                                    : 'border-slate-200 hover:border-slate-400 opacity-80 hover:opacity-100'
                                }`}
                              >
                                {med.media_type === 'video' ? (
                                  <div className="relative w-full h-full bg-slate-900 flex items-center justify-center">
                                    <video src={med.url} preload="metadata" className="w-full h-full object-cover opacity-70" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <Video className="w-5 h-5 text-white drop-shadow-sm" />
                                    </div>
                                  </div>
                                ) : (
                                  <img
                                    src={med.url || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=300&q=80'}
                                    alt={med.file_name}
                                    className="w-full h-full object-cover"
                                  />
                                )}
                                
                                <div className={`absolute inset-0 transition-colors ${isSelected ? 'bg-black/15' : 'group-hover:bg-black/10'}`} />

                                {isSelected && (
                                  <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#F20530] text-white flex items-center justify-center shadow-xs">
                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                  </div>
                                )}

                                {isPrimary && (
                                  <div className="absolute bottom-1 right-1 left-1 bg-rose-600 text-white text-[8px] font-black px-1 py-0.5 rounded text-center truncate">
                                    غلاف رئيسي
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Selected Gallery Preview (Matching Screenshot 2) */}
                    {selectedMediaIds.length > 0 && (
                      <div className="space-y-2 pt-3 border-t border-slate-100">
                        <span className="text-[11px] font-extrabold text-slate-800 block">
                          معرض الوسائط التابع للمشروع ({selectedMediaIds.length}):
                        </span>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                          {selectedMediaIds.map((id, index) => {
                            const med = availableMedia.find(m => m.id === id);
                            const isPrimary = index === 0;

                            return (
                              <div
                                key={id}
                                className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 transition-all flex-row-reverse ${
                                  isPrimary ? 'bg-rose-50/60 border-rose-200' : 'bg-slate-50/80 border-slate-200'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 flex-row-reverse min-w-0">
                                  <div className="w-10 h-8 rounded-lg overflow-hidden shrink-0 border border-slate-200 bg-slate-900 relative">
                                    <img
                                      src={med?.url || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=300&q=80'}
                                      alt={med?.file_name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="min-w-0 text-right">
                                    <span className="text-[11px] font-bold text-slate-800 truncate block">
                                      {med?.file_name || `وسائط #${id}`}
                                    </span>
                                    {isPrimary && (
                                      <span className="inline-block mt-0.5 text-[8px] font-black px-1.5 py-0.2 bg-rose-600 text-white rounded">
                                        صورة الغلاف الأساسية
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => setSelectedMediaIds(prev => prev.filter(mId => mId !== id))}
                                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-100/50 transition-colors cursor-pointer"
                                  title="حذف من المعرض"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                </div>

              </div>

            </div>

            {/* STICKY BOTTOM ACTIONS BAR */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 py-3.5 px-6 md:px-12 z-40 flex items-center justify-between shadow-2xl flex-row-reverse">
              <button
                type="button"
                onClick={() => { setIsEditorOpen(false); setEditingProject(null); }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>إلغاء والتراجع</span>
              </button>

              <button
                onClick={handleSaveProjectForm}
                disabled={editorLoading}
                className="px-6 py-2.5 bg-[#F20530] hover:bg-rose-600 text-white text-xs font-black rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-rose-100"
              >
                {editorLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>{editingProject ? 'حفظ التعديلات' : 'تأكيد وإضافة المشروع'}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteId !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-5 shadow-2xl border border-slate-100"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-black text-slate-900">هل تريد حذف هذا المشروع؟</h3>
                <p className="text-xs text-slate-500 font-bold leading-relaxed">
                  سيتم حذف المشروع نهائياً من قاعدة البيانات. لا يمكن التراجع عن هذا الإجراء.
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteId(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black rounded-xl cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-xl cursor-pointer shadow-md shadow-red-200"
                >
                  تأكيد الحذف
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. PAGE HEADER */}
      <section className="flex flex-col gap-4 pb-2 border-b border-slate-200">
        <div className="flex items-center justify-between gap-4 flex-row-reverse">
          <div className="flex items-center gap-2 flex-row-reverse">
            <span className="p-1.5 rounded-lg bg-[#F20530]/10 text-[#F20530]">
              <Layers className="w-4 h-4" />
            </span>
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
              لوحة إدارة المشاريع
            </span>
          </div>

          {canPerform('projects', 'create') && (
            <button
              onClick={() => {
                setEditingProject(null);
                setIsEditorOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#F20530] text-white text-xs font-extrabold hover:bg-rose-600 transition-all cursor-pointer shadow-md shadow-rose-100 active:scale-95 flex-row-reverse"
            >
              <Plus className="w-4.5 h-4.5" />
              <span>إضافة مشروع جديد</span>
            </button>
          )}
        </div>

        <div className="space-y-1 text-right">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight leading-none">
            المشاريع ودراسات الحالة
          </h2>
          <p className="text-sm font-semibold text-[#6B7280] max-w-xl leading-relaxed">
            إدارة وتنظيم كافة أعمال ومشاريع الشركة المربوطة بخادم البيانات المباشر.
          </p>
        </div>
      </section>

      {/* 2. STATISTICS SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          {
            title: 'إجمالي المشاريع',
            value: statTotal,
            changeText: 'نشطة ومسودات',
            colorClass: 'text-slate-900 bg-white border-slate-200',
            icon: Briefcase,
            iconColor: 'text-indigo-600 bg-indigo-50 border-indigo-100'
          },
          {
            title: 'المشاريع النشطة',
            value: statActive,
            changeText: 'معروضة على الموقع',
            colorClass: 'text-slate-900 bg-white border-slate-200',
            icon: CheckCircle,
            iconColor: 'text-emerald-600 bg-emerald-50 border-emerald-100'
          },
          {
            title: 'المشاريع المميزة',
            value: statFeatured,
            changeText: 'تعرض في الرئيسية',
            colorClass: 'text-slate-900 bg-white border-slate-200',
            icon: Star,
            iconColor: 'text-amber-600 bg-amber-50 border-amber-100'
          },
          {
            title: 'المشاريع المخفية',
            value: statHidden,
            changeText: 'تحت التعديل والتجهيز',
            colorClass: 'text-slate-900 bg-white border-slate-200',
            icon: EyeOff,
            iconColor: 'text-rose-600 bg-rose-50 border-rose-100'
          }
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index} 
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-all duration-300 relative overflow-hidden group text-right"
            >
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-slate-100 group-hover:bg-[#F20530] transition-all" />
              <div className="flex items-start justify-between mb-3.5 flex-row-reverse">
                <span className="text-[11px] font-extrabold text-[#6B7280] uppercase tracking-wider">
                  {stat.title}
                </span>
                <div className={`p-2 rounded-xl border ${stat.iconColor} shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <span className="font-extrabold text-slate-900 tracking-tight block text-2xl sm:text-3xl">
                  {stat.value}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold block mt-1">
                  {stat.changeText}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. TOOLBAR FILTERS */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 flex-row-reverse">
          
          {/* Search */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4.5 h-4.5" />
            </span>
            <input
              type="text"
              placeholder="ابحث باسم المشروع، العميل أو الرابط اللطيف..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#F20530] focus:ring-4 focus:ring-[#F20530]/5 outline-none transition-all pr-10 pl-4 text-right"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 left-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto flex-row-reverse">
            
            {/* Category Filter */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pr-8 text-xs font-bold text-slate-700 focus:bg-white focus:border-[#F20530] outline-none transition-all cursor-pointer text-right"
              >
                <option value="all">جميع الأقسام</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pr-8 text-xs font-bold text-slate-700 focus:bg-white focus:border-[#F20530] outline-none transition-all cursor-pointer text-right"
              >
                <option value="all">جميع الحالات</option>
                <option value="active">نشط (منشور)</option>
                <option value="hidden">مخفي</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* View Mode */}
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-400 hover:text-slate-600'
                }`}
                title="عرض شبكي"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-400 hover:text-slate-600'
                }`}
                title="عرض قائمة"
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Refresh Button */}
            <button
              onClick={fetchProjects}
              className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white text-slate-600 hover:text-[#F20530] transition-all cursor-pointer"
              title="تحديث البيانات"
            >
              <RefreshCw className={`w-4 h-4 ${isPageLoading ? 'animate-spin' : ''}`} />
            </button>

          </div>

        </div>
      </div>

      {/* Global Page Error Banner with Retry */}
      {pageError && (
        <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-800 text-xs font-semibold flex items-center justify-between gap-4 shadow-xs flex-row-reverse">
          <div className="flex items-center gap-3 flex-row-reverse text-right">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <p className="font-bold text-sm text-rose-900">خطأ في الاتصال بخادم بيانات المشاريع</p>
              <p className="text-rose-700 font-medium">{pageError}</p>
            </div>
          </div>
          <button
            onClick={fetchProjects}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs transition-all shadow-xs cursor-pointer"
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* 4. CARDS GRID OR LIST DISPLAY */}
      {isPageLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200 space-y-4 animate-pulse">
              <div className="h-44 bg-slate-100 rounded-xl" />
              <div className="space-y-2">
                <div className="h-4 bg-slate-100 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-[#F20530] flex items-center justify-center mx-auto border border-rose-100">
            <Briefcase className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-slate-900">لا يوجد مشاريع مطابقة</h3>
            <p className="text-xs text-slate-500 font-semibold max-w-sm mx-auto">
              لم يتم العثور على أي مشاريع في قاعدة البيانات حسب محددات البحث الحالية. يمكنك إضافة مشروع جديد الآن.
            </p>
          </div>
          {canPerform('projects', 'create') && (
            <button
              onClick={() => {
                setEditingProject(null);
                setIsEditorOpen(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F20530] text-white text-xs font-extrabold rounded-xl hover:bg-rose-600 transition-all cursor-pointer shadow-md shadow-rose-100 flex-row-reverse"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة أول مشروع</span>
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid Display */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            const coverImage = project.media && project.media.length > 0 
              ? project.media[0].url 
              : 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80';
            const isMenuOpen = activeMenuId === project.id;

            return (
              <div
                key={project.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between space-y-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 relative group"
              >
                <div className="space-y-4">
                  {/* Cover Image Container */}
                  <div className="h-44 w-full rounded-xl overflow-hidden relative border border-slate-100/50 bg-slate-900">
                    <img 
                      src={coverImage} 
                      alt={project.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    
                    {/* Index Badge */}
                    <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur-xs text-[10px] font-mono font-bold text-slate-200 border border-slate-700/50">
                      #{project.id}
                    </span>

                    {/* Featured Badge */}
                    {project.is_featured && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-amber-500/90 backdrop-blur-xs text-white text-[9px] font-black flex items-center gap-1 shadow-xs">
                        <Star className="w-3 h-3 fill-white" />
                        <span>مميز</span>
                      </span>
                    )}
                  </div>

                  {/* Main Content Area */}
                  <div className="space-y-3">
                    
                    {/* Top line with Icon, Title, Subtitle, and 3-Dots Menu Trigger */}
                    <div className="flex items-start justify-between gap-2">
                      
                      <div className="flex items-center gap-3.5 flex-row-reverse text-right flex-1 min-w-0">
                        {/* Red Category Icon Container */}
                        <div className="p-2.5 rounded-xl border shrink-0 bg-slate-50 border-slate-200 text-slate-800 group-hover:bg-[#F20530] group-hover:text-white transition-colors duration-300">
                          <Briefcase className="w-5 h-5" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-[#F20530] transition-colors leading-snug truncate">
                            {project.title}
                          </h4>
                          <span className="block text-[10px] font-mono text-slate-400 mt-0.5 truncate">
                            {project.category?.name || 'قسم المشاريع'} {project.client_name ? `• العميل: ${project.client_name}` : ''}
                          </span>
                        </div>
                      </div>

                      {/* 3-Dots Dropdown Trigger & Menu (Positioned to open inwards nicely without clipping!) */}
                      <div className="relative shrink-0">
                        <button
                          onClick={() => setActiveMenuId(isMenuOpen ? null : project.id)}
                          className="p-1.5 rounded-lg border border-transparent hover:border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
                          title="خيارات"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {isMenuOpen && (
                          <>
                            {/* Backdrop click blocker */}
                            <div className="fixed inset-0 z-20" onClick={() => setActiveMenuId(null)} />
                            
                            <div className="absolute left-0 mt-1.5 w-44 bg-white rounded-xl border border-slate-200 shadow-xl py-1.5 z-30 text-right">
                              {canPerform('projects', 'edit') && (
                                <button
                                  onClick={() => {
                                    setEditingProject(project);
                                    setIsEditorOpen(true);
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full px-3.5 py-2 text-right text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-start gap-2 flex-row-reverse"
                                >
                                  <Edit className="w-4 h-4 text-slate-400" />
                                  <span>تعديل المشروع</span>
                                </button>
                              )}

                              {canPerform('projects', 'edit') && (
                                <button
                                  onClick={() => {
                                    handleToggleStatus(project);
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full px-3.5 py-2 text-right text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-start gap-2 flex-row-reverse"
                                >
                                  {project.is_active ? (
                                    <>
                                      <EyeOff className="w-4 h-4 text-slate-400" />
                                      <span>إخفاء المشروع</span>
                                    </>
                                  ) : (
                                    <>
                                      <Eye className="w-4 h-4 text-slate-400" />
                                      <span>إظهار المشروع</span>
                                    </>
                                  )}
                                </button>
                              )}

                              {canPerform('projects', 'edit') && (
                                <button
                                  onClick={() => {
                                    handleToggleFeatured(project);
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full px-3.5 py-2 text-right text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-start gap-2 flex-row-reverse"
                                >
                                  <Star className={`w-4 h-4 ${project.is_featured ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
                                  <span>{project.is_featured ? 'إلغاء التمييز' : 'تمييز كـ مميز'}</span>
                                </button>
                              )}

                              {canPerform('projects', 'delete') && (
                                <>
                                  <div className="h-px bg-slate-100 my-1" />
                                  <button
                                    onClick={() => {
                                      setDeleteId(project.id);
                                      setActiveMenuId(null);
                                    }}
                                    className="w-full px-3.5 py-2 text-right text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer flex items-center justify-start gap-2 flex-row-reverse"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    <span>حذف المشروع</span>
                                  </button>
                                </>
                              )}
                            </div>
                          </>
                        )}
                      </div>

                    </div>

                    {/* Short Description */}
                    {project.short_description && (
                      <p className="text-xs text-slate-500 font-semibold leading-relaxed line-clamp-2 text-right">
                        {project.short_description}
                      </p>
                    )}

                    {/* Services Tags */}
                    {project.services && project.services.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1.5 justify-start flex-row-reverse">
                        {project.services.map((svc) => (
                          <span key={svc.id} className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-500">
                            {svc.title}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Stats & Status Badge (Matching Screenshot 3) */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-4 text-[10px] font-semibold text-slate-400 flex-row-reverse">
                  <span className="truncate">
                    {project.completion_date ? `التسليم: ${project.completion_date}` : (project.client_name ? `العميل: ${project.client_name}` : `مشروع #${project.id}`)}
                  </span>

                  <span className={`px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-wider border ${
                    project.is_active 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : 'bg-slate-50 text-slate-500 border-slate-200'
                  }`}>
                    {project.is_active ? 'نشط' : 'مخفي'}
                  </span>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* List Display */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="divide-y divide-slate-100">
            {projects.map((project) => {
              const isMenuOpen = activeMenuId === project.id;
              return (
                <div key={project.id} className="p-4 flex items-center justify-between hover:bg-slate-50/80 transition-all flex-row-reverse">
                  <div className="flex items-center gap-4 flex-row-reverse text-right">
                    <div className="w-16 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                      <img 
                        src={project.media?.[0]?.url || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80'} 
                        alt="" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-row-reverse">
                        <h4 className="text-xs font-extrabold text-slate-900">{project.title}</h4>
                        {project.is_featured && (
                          <span className="text-[9px] font-extrabold px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-md">
                            مميز
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 block mt-0.5">
                        {project.category?.name || 'قسم المشاريع'} &bull; العميل: {project.client_name || 'بدون عميل'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-extrabold border ${
                      project.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-200'
                    }`}>
                      {project.is_active ? 'نشط' : 'مخفي'}
                    </span>

                    {/* 3-Dots Dropdown Menu */}
                    <div className="relative shrink-0">
                      <button
                        onClick={() => setActiveMenuId(isMenuOpen ? null : project.id)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-all cursor-pointer"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {isMenuOpen && (
                        <>
                          <div className="fixed inset-0 z-20" onClick={() => setActiveMenuId(null)} />
                          <div className="absolute left-0 mt-1.5 w-44 bg-white rounded-xl border border-slate-200 shadow-xl py-1.5 z-30 text-right">
                            {canPerform('projects', 'edit') && (
                              <button
                                onClick={() => {
                                  setEditingProject(project);
                                  setIsEditorOpen(true);
                                  setActiveMenuId(null);
                                }}
                                className="w-full px-3.5 py-2 text-right text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-start gap-2 flex-row-reverse"
                              >
                                <Edit className="w-4 h-4 text-slate-400" />
                                <span>تعديل المشروع</span>
                              </button>
                            )}

                            {canPerform('projects', 'edit') && (
                              <button
                                onClick={() => {
                                  handleToggleStatus(project);
                                  setActiveMenuId(null);
                                }}
                                className="w-full px-3.5 py-2 text-right text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-start gap-2 flex-row-reverse"
                              >
                                {project.is_active ? (
                                  <>
                                    <EyeOff className="w-4 h-4 text-slate-400" />
                                    <span>إخفاء المشروع</span>
                                  </>
                                ) : (
                                  <>
                                    <Eye className="w-4 h-4 text-slate-400" />
                                    <span>إظهار المشروع</span>
                                  </>
                                )}
                              </button>
                            )}

                            {canPerform('projects', 'edit') && (
                              <button
                                onClick={() => {
                                  handleToggleFeatured(project);
                                  setActiveMenuId(null);
                                }}
                                className="w-full px-3.5 py-2 text-right text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-start gap-2 flex-row-reverse"
                              >
                                <Star className={`w-4 h-4 ${project.is_featured ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
                                <span>{project.is_featured ? 'إلغاء التمييز' : 'تمييز كـ مميز'}</span>
                              </button>
                            )}

                            {canPerform('projects', 'delete') && (
                              <>
                                <div className="h-px bg-slate-100 my-1" />
                                <button
                                  onClick={() => {
                                    setDeleteId(project.id);
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full px-3.5 py-2 text-right text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer flex items-center justify-start gap-2 flex-row-reverse"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  <span>حذف المشروع</span>
                                </button>
                              </>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
