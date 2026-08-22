import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { adminServicesApi, mapLaravelServiceToItem, mapServiceItemToLaravelPayload, authApi } from '../services/api';
import { ServiceEditor } from './ServiceEditor';
import { PremiumEmptyState } from './ui/PremiumEmptyState';
import { 
  Palette, 
  Code2, 
  Smartphone, 
  TrendingUp, 
  Video, 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  RotateCcw, 
  LayoutGrid, 
  List, 
  MoreVertical, 
  Edit, 
  Copy, 
  Eye, 
  EyeOff, 
  Trash2, 
  Check, 
  X, 
  ChevronDown, 
  ArrowUpDown, 
  SlidersHorizontal, 
  Sparkles, 
  RefreshCw, 
  Clock, 
  Settings, 
  AlertCircle, 
  Calendar, 
  Layers, 
  Globe,
  Trash,
  CheckCircle,
  HelpCircle,
  Undo2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Map of string names to Lucide icons
const iconComponents: Record<string, React.ComponentType<{ className?: string }>> = {
  Palette: Palette,
  Code2: Code2,
  Smartphone: Smartphone,
  TrendingUp: TrendingUp,
  Video: Video,
  FileText: FileText,
  Layers: Layers,
  Globe: Globe,
};

interface ServiceItem {
  id: string;
  nameEn: string;
  nameAr: string;
  title?: string;
  descriptionEn: string;
  descriptionAr: string;
  shortDescription?: string;
  fullDescription?: string;
  slug: string;
  displayOrder: number;
  sortOrder?: number;
  status: 'active' | 'hidden' | 'deleted'; // deleted is soft deleted
  isActive?: boolean;
  iconName: string;
  coverImage: string;
  createdAt: string;
  featuresEn: string[];
  featuresAr: string[];
  serviceMedia?: any[];
}

export function ServicesManagement() {
  const { language, isRtl } = useLanguage();
  const { canPerform } = useAuth();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'hidden' | 'deleted'>('all');
  const [sortBy, setSortBy] = useState<'order' | 'date' | 'name'>('order');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Selected services for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Last update tracker state to feed into stats
  const [lastUpdatedText, setLastUpdatedText] = useState({ en: 'Branding & Visual Identity', ar: 'الهوية البصرية' });

  // Soft Delete Confirmation Modal
  const [deleteConfirmationModal, setDeleteConfirmationModal] = useState<{ isOpen: boolean; serviceId: string | null }>({
    isOpen: false,
    serviceId: null
  });

  // Create / Edit Modal Form State
  const [formModal, setFormModal] = useState<{
    isOpen: boolean;
    type: 'add' | 'edit';
    serviceId: string | null;
  }>({
    isOpen: false,
    type: 'add',
    serviceId: null
  });

  // Form Fields
  const [fieldNameEn, setFieldNameEn] = useState('');
  const [fieldNameAr, setFieldNameAr] = useState('');
  const [fieldDescriptionEn, setFieldDescriptionEn] = useState('');
  const [fieldDescriptionAr, setFieldDescriptionAr] = useState('');
  const [fieldSlug, setFieldSlug] = useState('');
  const [fieldDisplayOrder, setFieldDisplayOrder] = useState<number>(1);
  const [fieldStatus, setFieldStatus] = useState<'active' | 'hidden'>('active');
  const [fieldIconName, setFieldIconName] = useState('Code2');
  const [fieldCoverImage, setFieldCoverImage] = useState('');
  const [fieldFeaturesEn, setFieldFeaturesEn] = useState<string[]>(['', '', '']);
  const [fieldFeaturesAr, setFieldFeaturesAr] = useState<string[]>(['', '', '']);

  // UI Toast helper
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'deleted' } | null>(null);

  const triggerToast = (msg: string, type: 'success' | 'info' | 'deleted' = 'success') => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Fetch Services from Laravel API
  const loadServices = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const res = await adminServicesApi.getAll({
        search: searchQuery || undefined,
        is_active: statusFilter === 'active' ? true : statusFilter === 'hidden' ? false : undefined
      });
      if (res.data) {
        const mapped = res.data.map(mapLaravelServiceToItem);
        setServices(mapped);
      }
    } catch (err: any) {
      if (err?.status === 401) {
        authApi.clearToken();
        window.location.hash = '#admin-login';
        return;
      }
      setApiError(err?.message || (language === 'en' ? 'Failed to fetch services from server.' : 'فشل تحميل الخدمات من الخادم.'));
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, statusFilter, language]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const handleRefresh = () => {
    setSelectedIds([]);
    loadServices();
    triggerToast(
      language === 'en' ? 'Services reloaded from Laravel API.' : 'تم تحديث وتحميل الخدمات من خادم لارافيل.',
      'success'
    );
  };


  // Calculations for stats
  const totalServices = services.filter(s => s.status !== 'deleted').length;
  const activeServices = services.filter(s => s.status === 'active').length;
  const hiddenServices = services.filter(s => s.status === 'hidden').length;
  const deletedServicesCount = services.filter(s => s.status === 'deleted').length;

  // Auto slug generation helper
  const generateSlugFromName = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  // Sync slug field with english name during creation
  useEffect(() => {
    if (formModal.type === 'add' && fieldNameEn) {
      setFieldSlug(generateSlugFromName(fieldNameEn));
    }
  }, [fieldNameEn, formModal.type]);

  // Handle open add / edit modal
  const openFormModal = (type: 'add' | 'edit', service?: ServiceItem) => {
    if (type === 'edit' && service) {
      setFormModal({ isOpen: true, type: 'edit', serviceId: service.id });
      setFieldNameEn(service.nameEn);
      setFieldNameAr(service.nameAr);
      setFieldDescriptionEn(service.descriptionEn);
      setFieldDescriptionAr(service.descriptionAr);
      setFieldSlug(service.slug);
      setFieldDisplayOrder(service.displayOrder);
      setFieldStatus(service.status === 'deleted' ? 'hidden' : service.status);
      setFieldIconName(service.iconName);
      setFieldCoverImage(service.coverImage);
      setFieldFeaturesEn([...service.featuresEn, '', ''].slice(0, 3));
      setFieldFeaturesAr([...service.featuresAr, '', ''].slice(0, 3));
    } else {
      setFormModal({ isOpen: true, type: 'add', serviceId: null });
      setFieldNameEn('');
      setFieldNameAr('');
      setFieldDescriptionEn('');
      setFieldDescriptionAr('');
      setFieldSlug('');
      // set next logical order
      const nonDeleted = services.filter(s => s.status !== 'deleted');
      const maxOrder = nonDeleted.length > 0 ? Math.max(...nonDeleted.map(s => s.displayOrder)) : 0;
      setFieldDisplayOrder(maxOrder + 1);
      setFieldStatus('active');
      setFieldIconName('Code2');
      setFieldCoverImage('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80');
      setFieldFeaturesEn(['', '', '']);
      setFieldFeaturesAr(['', '', '']);
    }
  };

  // Save Add/Edit
  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!fieldNameEn && !fieldNameAr) || !fieldSlug) {
      triggerToast(language === 'en' ? 'Please fill in name and slug fields.' : 'يرجى ملء حقلي الاسم والمعرف اللطيف.', 'info');
      return;
    }

    const cleanFeaturesEn = fieldFeaturesEn.filter(f => f.trim() !== '');
    const cleanFeaturesAr = fieldFeaturesAr.filter(f => f.trim() !== '');

    if (formModal.type === 'edit' && formModal.serviceId) {
      // Update
      setServices(prev => prev.map(s => {
        if (s.id === formModal.serviceId) {
          return {
            ...s,
            nameEn: fieldNameEn,
            nameAr: fieldNameAr,
            descriptionEn: fieldDescriptionEn,
            descriptionAr: fieldDescriptionAr,
            slug: fieldSlug,
            displayOrder: Number(fieldDisplayOrder),
            status: fieldStatus,
            iconName: fieldIconName,
            coverImage: fieldCoverImage || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
            featuresEn: cleanFeaturesEn.length > 0 ? cleanFeaturesEn : ['Custom Solutions'],
            featuresAr: cleanFeaturesAr.length > 0 ? cleanFeaturesAr : ['حلول برمجية مخصصة'],
          };
        }
        return s;
      }));
      setLastUpdatedText({ en: fieldNameEn, ar: fieldNameAr });
      triggerToast(
        language === 'en' ? 'Service updated successfully.' : 'تم تحديث الخدمة بنجاح.',
        'success'
      );
    } else {
      // Create
      const newId = generateSlugFromName(fieldNameEn) || `service-${Date.now()}`;
      // check if id already exists
      const idExists = services.some(s => s.id === newId);
      const uniqueId = idExists ? `${newId}-${Math.floor(Math.random() * 1000)}` : newId;

      const newService: ServiceItem = {
        id: uniqueId,
        nameEn: fieldNameEn,
        nameAr: fieldNameAr,
        descriptionEn: fieldDescriptionEn,
        descriptionAr: fieldDescriptionAr,
        slug: fieldSlug,
        displayOrder: Number(fieldDisplayOrder),
        status: fieldStatus,
        iconName: fieldIconName,
        coverImage: fieldCoverImage || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
        createdAt: new Date().toISOString().split('T')[0],
        featuresEn: cleanFeaturesEn.length > 0 ? cleanFeaturesEn : ['Custom Solutions'],
        featuresAr: cleanFeaturesAr.length > 0 ? cleanFeaturesAr : ['حلول برمجية مخصصة'],
      };

      setServices(prev => [newService, ...prev]);
      setLastUpdatedText({ en: fieldNameEn, ar: fieldNameAr });
      triggerToast(
        language === 'en' ? 'New service created successfully.' : 'تم إنشاء الخدمة الجديدة بنجاح.',
        'success'
      );
    }

    setFormModal({ isOpen: false, type: 'add', serviceId: null });
  };

  // Duplicate Action
  const handleDuplicate = (service: ServiceItem) => {
    const duplicated: ServiceItem = {
      ...service,
      id: `${service.id}-copy-${Math.floor(Math.random() * 1000)}`,
      nameEn: `${service.nameEn} (Copy)`,
      nameAr: `${service.nameAr} (نسخة)`,
      slug: `${service.slug}-copy`,
      displayOrder: service.displayOrder + 1,
      createdAt: new Date().toISOString().split('T')[0],
    };

    // Bump display order of subsequent services
    setServices(prev => {
      const updated = prev.map(s => {
        if (s.displayOrder >= duplicated.displayOrder && s.id !== service.id) {
          return { ...s, displayOrder: s.displayOrder + 1 };
        }
        return s;
      });
      return [duplicated, ...updated];
    });

    setLastUpdatedText({ en: duplicated.nameEn, ar: duplicated.nameAr });
    triggerToast(
      language === 'en' ? `Duplicated "${service.nameEn}" successfully.` : `تم تكرار "${service.nameAr}" بنجاح.`,
      'success'
    );
  };

  // Toggle quick visibility
  const handleToggleVisibility = async (service: ServiceItem) => {
    const nextActive = !service.isActive;
    try {
      const res = await adminServicesApi.update(service.id, { is_active: nextActive });
      if (res.data) {
        const updated = mapLaravelServiceToItem(res.data);
        setServices(prev => prev.map(s => s.id === service.id ? updated : s));
        setLastUpdatedText({ en: service.nameEn, ar: service.nameAr });
        triggerToast(
          language === 'en' 
            ? `Status for "${service.nameEn}" set to ${nextActive ? 'active' : 'hidden'}.` 
            : `تم تغيير حالة "${service.nameAr}" إلى ${nextActive ? 'نشط' : 'مخفي'}.`,
          'info'
        );
      }
    } catch (err: any) {
      if (err?.status === 401) {
        authApi.clearToken();
        window.location.hash = '#admin-login';
        return;
      }
      triggerToast(err?.message || (language === 'en' ? 'Update failed' : 'فشلت العملية'), 'deleted');
    }
  };

  // Delete flow trigger
  const confirmDelete = (serviceId: string) => {
    setDeleteConfirmationModal({ isOpen: true, serviceId });
  };

  // Confirm and apply Delete via API
  const handleApplySoftDelete = async () => {
    const targetId = deleteConfirmationModal.serviceId;
    if (!targetId) return;

    const targetService = services.find(s => s.id === targetId);
    try {
      await adminServicesApi.delete(targetId);
      setServices(prev => prev.filter(s => s.id !== targetId));
      setSelectedIds(prev => prev.filter(id => id !== targetId));
      if (targetService) {
        setLastUpdatedText({ en: targetService.nameEn, ar: targetService.nameAr });
        triggerToast(
          language === 'en' 
            ? `"${targetService.nameEn}" deleted successfully.` 
            : `تم حذف "${targetService.nameAr}" بنجاح من قاعدة بيانات لارافيل.`,
          'deleted'
        );
      }
    } catch (err: any) {
      if (err?.status === 401) {
        authApi.clearToken();
        window.location.hash = '#admin-login';
        return;
      }
      if (err?.status === 403) {
        triggerToast(
          language === 'en' ? 'Unauthorized (HTTP 403). You do not have permission to delete this service.' : 'غير مصرح لك (HTTP 403). لا تملك صلاحية حذف هذه الخدمة.',
          'deleted'
        );
      } else {
        triggerToast(err?.message || (language === 'en' ? 'Delete failed' : 'فشلت عملية الحذف'), 'deleted');
      }
    } finally {
      setDeleteConfirmationModal({ isOpen: false, serviceId: null });
    }
  };

  // Restore Soft Deleted service (local toggle for active status)
  const handleRestore = async (service: ServiceItem) => {
    try {
      const res = await adminServicesApi.update(service.id, { is_active: true });
      if (res.data) {
        const updated = mapLaravelServiceToItem(res.data);
        setServices(prev => prev.map(s => s.id === service.id ? updated : s));
        triggerToast(
          language === 'en' ? `Restored "${service.nameEn}" to active list.` : `تم استعادة خدمة "${service.nameAr}" لقائمة الخدمات النشطة.`,
          'success'
        );
      }
    } catch (err: any) {
      triggerToast(err?.message || (language === 'en' ? 'Restore failed' : 'فشلت الاستعادة'), 'deleted');
    }
  };

  // Permanent Delete
  const handlePermanentDelete = async (service: ServiceItem) => {
    try {
      await adminServicesApi.delete(service.id);
      setServices(prev => prev.filter(s => s.id !== service.id));
      setSelectedIds(prev => prev.filter(id => id !== service.id));
      triggerToast(
        language === 'en' ? `Permanently destroyed "${service.nameEn}".` : `تم حذف الخدمة "${service.nameAr}" نهائياً من قاعدة البيانات.`,
        'deleted'
      );
    } catch (err: any) {
      if (err?.status === 401) {
        authApi.clearToken();
        window.location.hash = '#admin-login';
        return;
      }
      if (err?.status === 403) {
        triggerToast(
          language === 'en' ? 'Unauthorized (HTTP 403). You do not have permission to delete this service.' : 'غير مصرح لك (HTTP 403). لا تملك صلاحية حذف هذه الخدمة.',
          'deleted'
        );
      } else {
        triggerToast(err?.message || (language === 'en' ? 'Delete failed' : 'فشلت عملية الحذف'), 'deleted');
      }
    }
  };


  // Select item toggle
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = (visibleItems: ServiceItem[]) => {
    const visibleIds = visibleItems.map(item => item.id);
    const allSelected = visibleIds.every(id => selectedIds.includes(id));
    
    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      setSelectedIds(prev => {
        const union = new Set([...prev, ...visibleIds]);
        return Array.from(union);
      });
    }
  };

  // Bulk Actions
  const handleBulkActivate = () => {
    if (selectedIds.length === 0) return;
    setServices(prev => prev.map(s => selectedIds.includes(s.id) ? { ...s, status: 'active' } : s));
    setSelectedIds([]);
    triggerToast(
      language === 'en' ? 'Selected services activated.' : 'تم تفعيل الخدمات المحددة بنجاح.',
      'success'
    );
  };

  const handleBulkHide = () => {
    if (selectedIds.length === 0) return;
    setServices(prev => prev.map(s => selectedIds.includes(s.id) ? { ...s, status: 'hidden' } : s));
    setSelectedIds([]);
    triggerToast(
      language === 'en' ? 'Selected services hidden from public site.' : 'تم إخفاء الخدمات المحددة عن الموقع العام.',
      'info'
    );
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setServices(prev => prev.map(s => selectedIds.includes(s.id) ? { ...s, status: 'deleted' } : s));
    setSelectedIds([]);
    triggerToast(
      language === 'en' ? 'Selected services moved to trash.' : 'تم نقل الخدمات المحددة إلى المهملات (حذف مؤقت).',
      'deleted'
    );
  };

  // Filtering and sorting services list
  const filteredServices = services.filter(service => {
    // 1. Search Query Match
    const matchesSearch = 
      service.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.descriptionEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.descriptionAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.slug.toLowerCase().includes(searchQuery.toLowerCase());

    // 2. Status Match
    if (statusFilter === 'all') {
      return service.status !== 'deleted' && matchesSearch; // default hide deleted
    }
    return service.status === statusFilter && matchesSearch;
  });

  // Sort logic
  const sortedServices = [...filteredServices].sort((a, b) => {
    if (sortBy === 'order') {
      return a.displayOrder - b.displayOrder;
    } else if (sortBy === 'date') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else {
      const nameA = language === 'en' ? a.nameEn : a.nameAr;
      const nameB = language === 'en' ? b.nameEn : b.nameAr;
      return nameA.localeCompare(nameB);
    }
  });

  // Reset filters helper
  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setSortBy('order');
    setSelectedIds([]);
    triggerToast(
      language === 'en' ? 'Filters reset to baseline setup.' : 'تم إعادة تعيين مرشحات البحث للوضع الافتراضي.',
      'info'
    );
  };

  // Feature items inline handler
  const updateFeatureEnValue = (index: number, val: string) => {
    const updated = [...fieldFeaturesEn];
    updated[index] = val;
    setFieldFeaturesEn(updated);
  };

  const updateFeatureArValue = (index: number, val: string) => {
    const updated = [...fieldFeaturesAr];
    updated[index] = val;
    setFieldFeaturesAr(updated);
  };

  // Open active action dropdown index
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  if (formModal.isOpen) {
    const selectedService = formModal.serviceId ? services.find(s => s.id === formModal.serviceId) : null;
    return (
      <ServiceEditor
        serviceId={formModal.serviceId}
        existingService={selectedService}
        onClose={() => setFormModal({ isOpen: false, type: 'add', serviceId: null })}
        onSave={async (updatedFields: any) => {
          const payload = mapServiceItemToLaravelPayload(updatedFields);

          if (formModal.type === 'edit' && formModal.serviceId) {
            const res = await adminServicesApi.update(formModal.serviceId, payload);
            if (res.data) {
              const updatedItem = mapLaravelServiceToItem(res.data);
              setServices(prev => prev.map(s => s.id === updatedItem.id ? updatedItem : s));
              if (updatedFields.nameEn && updatedFields.nameAr) {
                setLastUpdatedText({ en: updatedFields.nameEn, ar: updatedFields.nameAr });
              }
              triggerToast(language === 'en' ? 'Service updated successfully in Laravel.' : 'تم تحديث بيانات الخدمة في قاعدة بيانات لارافيل.', 'success');
            }
          } else {
            const res = await adminServicesApi.create(payload);
            if (res.data) {
              const newItem = mapLaravelServiceToItem(res.data);
              setServices(prev => [newItem, ...prev]);
              if (updatedFields.nameEn && updatedFields.nameAr) {
                setLastUpdatedText({ en: updatedFields.nameEn, ar: updatedFields.nameAr });
              }
              triggerToast(language === 'en' ? 'New service created successfully in Laravel.' : 'تم إضافة الخدمة الجديدة بنجاح في قاعدة بيانات لارافيل.', 'success');
            }
          }
        }}
      />
    );
  }

  return (
    <div className={`space-y-8 ${isRtl ? 'text-right' : 'text-left'}`}>
      
      {/* Dynamic Toast feedback */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-6 ${isRtl ? 'left-6' : 'right-6'} z-50 p-4 rounded-xl shadow-xl border flex items-center gap-3.5 max-w-sm bg-slate-900 text-white border-slate-800`}
          >
            <div className={`p-1.5 rounded-lg ${toast.type === 'deleted' ? 'bg-rose-500/10' : 'bg-[#F20530]/10'}`}>
              {toast.type === 'deleted' ? (
                <Trash className="w-4 h-4 text-rose-500" />
              ) : (
                <CheckCircle className="w-4 h-4 text-[#F20530]" />
              )}
            </div>
            <span className="text-xs font-bold leading-relaxed">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Laravel API Connection Error Alert */}
      {apiError && (
        <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-800 text-xs font-semibold flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <p className="font-bold text-sm text-rose-900">{isRtl ? 'خطأ في الاتصال بخادم لارافيل' : 'Laravel Connection Error'}</p>
              <p className="text-rose-700 font-medium">{apiError}</p>
            </div>
          </div>
          <button
            onClick={loadServices}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs transition-all shadow-sm cursor-pointer"
          >
            {isRtl ? 'إعادة المحاولة' : 'Retry'}
          </button>
        </div>
      )}

      {/* 1. PAGE HEADER */}
      <section className="flex flex-col gap-4 pb-2 border-b border-slate-200">
        <div className={`flex items-center justify-between gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#F20530]/10 text-[#F20530]">
              <Layers className="w-4 h-4" />
            </span>
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
              {isRtl ? 'لوحة إدارة الخدمات' : 'SERVICES MANAGEMENT'}
            </span>
          </div>

          {canPerform('services', 'create') && (
            <button
              onClick={() => openFormModal('add')}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#F20530] text-white text-xs font-extrabold hover:bg-rose-600 transition-all cursor-pointer shadow-md shadow-rose-100 active:scale-95"
            >
              <Plus className="w-4.5 h-4.5" />
              <span>{isRtl ? 'إضافة خدمة جديدة' : 'Add New Service'}</span>
            </button>
          )}
        </div>

        <div className={`space-y-1 ${isRtl ? 'text-right' : 'text-left'}`}>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight leading-none">
            {isRtl ? 'الخدمات الرقمية' : 'Services'}
          </h2>
          <p className="text-sm font-semibold text-[#6B7280] max-w-xl leading-relaxed">
            {isRtl 
              ? 'إدارة وتنظيم كافة خدمات الوكالة المعروضة في الموقع التعريفي للعملاء والمؤسسات.' 
              : 'Manage all services displayed on the company website.'}
          </p>
        </div>
      </section>

      {/* 2. STATISTICS SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          {
            title: isRtl ? 'إجمالي الخدمات' : 'Total Services',
            value: totalServices,
            changeText: isRtl ? 'نشطة ومسودات' : 'Active and drafts',
            colorClass: 'text-slate-900 bg-white border-slate-200',
            icon: Layers,
            iconColor: 'text-indigo-600 bg-indigo-50 border-indigo-100'
          },
          {
            title: isRtl ? 'الخدمات النشطة' : 'Active Services',
            value: activeServices,
            changeText: isRtl ? 'معروضة على الموقع' : 'Displayed on live site',
            colorClass: 'text-slate-900 bg-white border-slate-200',
            icon: CheckCircle,
            iconColor: 'text-emerald-600 bg-emerald-50 border-emerald-100'
          },
          {
            title: isRtl ? 'الخدمات المخفية' : 'Hidden Services',
            value: hiddenServices,
            changeText: isRtl ? 'تعديل تمهيدي' : 'Under preparation',
            colorClass: 'text-slate-900 bg-white border-slate-200',
            icon: EyeOff,
            iconColor: 'text-amber-600 bg-amber-50 border-amber-100'
          },
          {
            title: isRtl ? 'آخر تحديث' : 'Recently Updated',
            value: language === 'en' ? lastUpdatedText.en : lastUpdatedText.ar,
            isText: true,
            changeText: isRtl ? 'تعديل وحفظ فوري' : 'Dynamically saved to indexes',
            colorClass: 'text-slate-900 bg-white border-slate-200',
            icon: Clock,
            iconColor: 'text-rose-600 bg-rose-50 border-rose-100'
          }
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index} 
              className={`bg-white rounded-2xl border ${stat.colorClass} p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-all duration-300 relative overflow-hidden group`}
            >
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-slate-100 group-hover:bg-[#F20530] transition-all" />
              <div className={`flex items-start justify-between mb-3.5 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <span className="text-[11px] font-extrabold text-[#6B7280] uppercase tracking-wider">
                  {stat.title}
                </span>
                <div className={`p-2 rounded-xl border ${stat.iconColor} shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <span className={`font-extrabold text-slate-900 tracking-tight block ${stat.isText ? 'text-sm truncate max-w-full' : 'text-2xl sm:text-3xl'}`}>
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
        <div className={`flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${isRtl ? 'lg:flex-row-reverse' : ''}`}>
          
          {/* Left search */}
          <div className="relative flex-1">
            <span className={`absolute inset-y-0 ${isRtl ? 'right-3' : 'left-3'} flex items-center pointer-events-none text-slate-400`}>
              <Search className="w-4.5 h-4.5" />
            </span>
            <input
              type="text"
              placeholder={isRtl ? 'ابحث باسم الخدمة، الوصف أو الرابط اللطيف...' : 'Search by name, description, slug...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#F20530] focus:ring-4 focus:ring-[#F20530]/5 outline-none transition-all ${isRtl ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'}`}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className={`absolute inset-y-0 ${isRtl ? 'left-3' : 'right-3'} flex items-center text-slate-400 hover:text-slate-600 transition-colors`}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Right actions and status dropdowns */}
          <div className={`flex flex-wrap items-center gap-3 ${isRtl ? 'justify-start' : 'justify-end'}`}>
            
            {/* Filter by status */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider hidden sm:inline-block">
                {isRtl ? 'الحالة:' : 'Status:'}
              </span>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className={`appearance-none bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl py-2 pl-3.5 pr-8 text-xs font-bold text-slate-700 outline-none focus:border-[#F20530] focus:ring-4 focus:ring-[#F20530]/5 transition-all cursor-pointer ${isRtl ? 'pl-8 pr-3.5 text-right' : 'pl-3.5 pr-8'}`}
                >
                  <option value="all">{isRtl ? 'جميع الخدمات' : 'All Services'}</option>
                  <option value="active">{isRtl ? 'الخدمات النشطة' : 'Active Services'}</option>
                  <option value="hidden">{isRtl ? 'الخدمات المخفية' : 'Hidden Services'}</option>
                  <option value="deleted">{isRtl ? 'سلة المهملات (المحذوفة مؤقتاً)' : 'Soft Deleted'}</option>
                </select>
                <div className={`absolute inset-y-0 ${isRtl ? 'left-2.5' : 'right-2.5'} flex items-center pointer-events-none text-slate-400`}>
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Sort by dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider hidden sm:inline-block">
                {isRtl ? 'الترتيب:' : 'Sort By:'}
              </span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className={`appearance-none bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl py-2 pl-3.5 pr-8 text-xs font-bold text-slate-700 outline-none focus:border-[#F20530] focus:ring-4 focus:ring-[#F20530]/5 transition-all cursor-pointer ${isRtl ? 'pl-8 pr-3.5 text-right' : 'pl-3.5 pr-8'}`}
                >
                  <option value="order">{isRtl ? 'ترتيب العرض (تصاعدي)' : 'Display Order'}</option>
                  <option value="date">{isRtl ? 'تاريخ الإنشاء' : 'Date Created'}</option>
                  <option value="name">{isRtl ? 'الاسم الأبجدي' : 'Alphabetical Name'}</option>
                </select>
                <div className={`absolute inset-y-0 ${isRtl ? 'left-2.5' : 'right-2.5'} flex items-center pointer-events-none text-slate-400`}>
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* View Mode toggles */}
            <div className="flex items-center border border-slate-200 rounded-xl p-0.5 bg-slate-50 shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-white text-[#F20530] shadow-xs' : 'text-slate-400 hover:text-slate-600'}`}
                title={isRtl ? 'عرض شبكي' : 'Grid view'}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${viewMode === 'list' ? 'bg-white text-[#F20530] shadow-xs' : 'text-slate-400 hover:text-slate-600'}`}
                title={isRtl ? 'عرض قائمة' : 'List view'}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

        {/* 4. BULK ACTIONS BAR (Visible when items selected) */}
        <AnimatePresence>
          {selectedIds.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              className="bg-slate-900 text-white rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 overflow-hidden"
            >
              <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <span className="w-2 h-2 rounded-full bg-[#F20530] animate-pulse" />
                <span className="text-xs font-bold">
                  {isRtl 
                    ? `تم تحديد عدد ${selectedIds.length} من الخدمات للعمليات الجماعية` 
                    : `Selected ${selectedIds.length} services for bulk operation:`}
                </span>
              </div>

              <div className={`flex items-center gap-2 w-full sm:w-auto ${isRtl ? 'flex-row-reverse' : ''}`}>
                <button
                  onClick={handleBulkActivate}
                  className="flex-1 sm:flex-none px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-[11px] font-bold text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isRtl ? 'تفعيل جماعي' : 'Bulk Activate'}</span>
                </button>
                <button
                  onClick={handleBulkHide}
                  className="flex-1 sm:flex-none px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-[11px] font-bold text-slate-300 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>{isRtl ? 'إخفاء جماعي' : 'Bulk Hide'}</span>
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="flex-1 sm:flex-none px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-900/40 rounded-lg text-[11px] font-bold text-rose-300 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Trash className="w-3.5 h-3.5" />
                  <span>{isRtl ? 'حذف جماعي' : 'Bulk Delete'}</span>
                </button>
                <button
                  onClick={() => setSelectedIds([])}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title={isRtl ? 'إلغاء التحديد' : 'Deselect all'}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 5. LOADING / SHIMMER STATE */}
      {isLoading ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div 
              key={idx} 
              className={`bg-white rounded-2xl border border-slate-200 p-5 ${viewMode === 'list' ? 'flex items-center gap-5' : 'space-y-4'} relative overflow-hidden`}
            >
              {/* Cover simulation for grid */}
              {viewMode === 'grid' && (
                <div className="h-40 w-full bg-slate-100 rounded-xl animate-pulse relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
                </div>
              )}
              
              <div className="flex-1 space-y-3">
                {/* Header row simulation */}
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 animate-pulse shrink-0" />
                  <div className="w-20 h-5 bg-slate-100 rounded-md animate-pulse" />
                </div>

                <div className="h-4 bg-slate-100 rounded-md w-3/4 animate-pulse" />
                <div className="space-y-2">
                  <div className="h-3 bg-slate-100 rounded-md w-full animate-pulse" />
                  <div className="h-3 bg-slate-100 rounded-md w-5/6 animate-pulse" />
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                  <div className="w-24 h-4 bg-slate-100 rounded-md animate-pulse" />
                  <div className="w-16 h-7 bg-slate-100 rounded-md animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : sortedServices.length === 0 ? (
        
        /* 6. EMPTY STATE */
        <PremiumEmptyState
          variant="services"
          onPrimaryAction={() => openFormModal('add')}
          onSecondaryAction={handleResetFilters}
          primaryActionTextEn="Create Service"
          primaryActionTextAr="إنشاء خدمة جديدة"
          secondaryActionTextEn="Clear Filters"
          secondaryActionTextAr="إعادة تعيين المرشحات"
          customTitleEn="No matching services"
          customTitleAr="لا توجد خدمات مطابقة"
          customDescEn="We couldn't find any services matching your active search or filters. Try adjusting your query or filters, or add a brand new service tier."
          customDescAr="لم نجد أي خدمات تتوافق مع معايير البحث والفرز المحددة. يرجى تعديل الكلمات المفتاحية أو إضافة خدمة جديدة تماماً."
        />

      ) : (

        /* 7. SERVICES DISPLAY GRID / LIST */
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {sortedServices.map((service) => {
            const Icon = iconComponents[service.iconName] || Code2;
            const isChecked = selectedIds.includes(service.id);
            const isMenuOpen = activeMenuId === service.id;

            return (
              <div
                key={service.id}
                className={`bg-white rounded-2xl border transition-all duration-300 relative group flex ${
                  viewMode === 'list' 
                    ? 'flex-col sm:flex-row items-start sm:items-center p-4 gap-5' 
                    : 'flex-col p-5 space-y-4 hover:shadow-lg hover:-translate-y-0.5'
                } ${
                  isChecked 
                    ? 'border-[#F20530] ring-1 ring-[#F20530]/10 bg-rose-50/5' 
                    : 'border-slate-200'
                }`}
              >
                {/* Cover Image for Grid view */}
                {viewMode === 'grid' && (
                  <div className="h-44 w-full rounded-xl overflow-hidden relative border border-slate-100/50">
                    <img 
                      src={service.coverImage} 
                      alt={service.nameEn} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Checkbox overlay */}
                    <button
                      onClick={() => toggleSelect(service.id)}
                      className={`absolute top-3 ${isRtl ? 'right-3' : 'left-3'} w-5.5 h-5.5 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                        isChecked 
                          ? 'bg-[#F20530] border-[#F20530] text-white' 
                          : 'bg-white/80 backdrop-blur-xs border-slate-300 hover:border-slate-400 text-transparent'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </button>

                    {/* Order indicator */}
                    <span className={`absolute bottom-3 ${isRtl ? 'left-3' : 'right-3'} px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur-xs text-[10px] font-mono font-bold text-slate-200 border border-slate-700/50`}>
                      #{service.displayOrder}
                    </span>
                  </div>
                )}

                {/* Main Content Area */}
                <div className="flex-1 min-w-0 space-y-3 w-full">
                  
                  {/* Top line with Icon, Badges and Menu Trigger */}
                  <div className="flex items-start justify-between gap-2">
                    
                    <div className={`flex items-center gap-3.5 ${isRtl ? 'flex-row-reverse' : ''}`}>
                      {viewMode === 'list' && (
                        <button
                          onClick={() => toggleSelect(service.id)}
                          className={`w-5.5 h-5.5 rounded-lg border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                            isChecked 
                              ? 'bg-[#F20530] border-[#F20530] text-white' 
                              : 'bg-white border-slate-300 hover:border-slate-400 text-transparent'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </button>
                      )}

                      <div className={`p-2.5 rounded-xl border shrink-0 transition-colors ${
                        service.status === 'deleted' 
                          ? 'bg-slate-100 border-slate-200 text-slate-400' 
                          : 'bg-slate-50 border-slate-200 text-slate-800 group-hover:bg-[#F20530] group-hover:text-white duration-300'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>

                      {viewMode === 'list' && (
                        <div className="hidden md:block w-14 h-10 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                          <img src={service.coverImage} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}

                      <div className={isRtl ? 'text-right' : 'text-left'}>
                        <div className={`flex items-center gap-2 flex-wrap ${isRtl ? 'flex-row-reverse' : ''}`}>
                          <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-[#F20530] transition-colors leading-snug truncate max-w-[200px] sm:max-w-xs">
                            {isRtl ? service.nameAr : service.nameEn}
                          </h4>
                        </div>
                        <span className="block text-[10px] font-mono text-slate-400 mt-1 truncate">
                          /{service.slug}
                        </span>
                      </div>
                    </div>

                    {/* Action trigger & menu */}
                    <div className="relative shrink-0">
                      <button
                        onClick={() => setActiveMenuId(isMenuOpen ? null : service.id)}
                        className="p-1.5 rounded-lg border border-transparent hover:border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {isMenuOpen && (
                        <>
                          {/* Close overlay click blocker */}
                          <div className="fixed inset-0 z-10" onClick={() => setActiveMenuId(null)} />
                          
                          <div className={`absolute ${isRtl ? 'left-0' : 'right-0'} mt-1.5 w-44 bg-white rounded-xl border border-slate-200 shadow-xl py-1.5 z-20`}>
                            {service.status !== 'deleted' ? (
                              <>
                                {canPerform('services', 'edit') && (
                                  <button
                                    onClick={() => {
                                      openFormModal('edit', service);
                                      setActiveMenuId(null);
                                    }}
                                    className={`w-full px-3.5 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-2 ${isRtl ? 'text-right flex-row-reverse' : ''}`}
                                  >
                                    <Edit className="w-4 h-4 text-slate-400" />
                                    <span>{isRtl ? 'تعديل الخدمة' : 'Edit Service'}</span>
                                  </button>
                                )}
                                {canPerform('services', 'create') && (
                                  <button
                                    onClick={() => {
                                      handleDuplicate(service);
                                      setActiveMenuId(null);
                                    }}
                                    className={`w-full px-3.5 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-2 ${isRtl ? 'text-right flex-row-reverse' : ''}`}
                                  >
                                    <Copy className="w-4 h-4 text-slate-400" />
                                    <span>{isRtl ? 'تكرار الخدمة' : 'Duplicate'}</span>
                                  </button>
                                )}
                                {canPerform('services', 'edit') && (
                                  <button
                                    onClick={() => {
                                      handleToggleVisibility(service);
                                      setActiveMenuId(null);
                                    }}
                                    className={`w-full px-3.5 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-2 ${isRtl ? 'text-right flex-row-reverse' : ''}`}
                                  >
                                    {service.status === 'active' ? (
                                      <>
                                        <EyeOff className="w-4 h-4 text-slate-400" />
                                        <span>{isRtl ? 'إخفاء الخدمة' : 'Hide service'}</span>
                                      </>
                                    ) : (
                                      <>
                                        <Eye className="w-4 h-4 text-slate-400" />
                                        <span>{isRtl ? 'عرض الخدمة' : 'Show service'}</span>
                                      </>
                                    )}
                                  </button>
                                )}
                                {canPerform('services', 'delete') && (
                                  <>
                                    <div className="h-px bg-slate-100 my-1" />
                                    <button
                                      onClick={() => {
                                        confirmDelete(service.id);
                                        setActiveMenuId(null);
                                      }}
                                      className={`w-full px-3.5 py-2 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer flex items-center gap-2 ${isRtl ? 'text-right flex-row-reverse' : ''}`}
                                    >
                                      <Trash className="w-4 h-4" />
                                      <span>{isRtl ? 'حذف مؤقت' : 'Soft Delete'}</span>
                                    </button>
                                  </>
                                )}
                              </>
                            ) : (
                              <>
                                {canPerform('services', 'edit') && (
                                  <button
                                    onClick={() => {
                                      handleRestore(service);
                                      setActiveMenuId(null);
                                    }}
                                    className={`w-full px-3.5 py-2 text-left text-xs font-bold text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer flex items-center gap-2 ${isRtl ? 'text-right flex-row-reverse' : ''}`}
                                  >
                                    <Undo2 className="w-4 h-4" />
                                    <span>{isRtl ? 'استعادة الخدمة' : 'Restore Service'}</span>
                                  </button>
                                )}
                                {canPerform('services', 'delete') && (
                                  <button
                                    onClick={() => {
                                      handlePermanentDelete(service);
                                      setActiveMenuId(null);
                                    }}
                                    className={`w-full px-3.5 py-2 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer flex items-center gap-2 ${isRtl ? 'text-right flex-row-reverse' : ''}`}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    <span>{isRtl ? 'حذف نهائي' : 'Destroy Forever'}</span>
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </>
                      )}
                    </div>

                  </div>

                  {/* Short Description */}
                  <p className={`text-xs text-slate-500 font-semibold leading-relaxed line-clamp-2 ${isRtl ? 'text-right' : 'text-left'}`}>
                    {isRtl ? service.descriptionAr : service.descriptionEn}
                  </p>

                  {/* List of custom capabilities inside card */}
                  <div className={`flex flex-wrap gap-1.5 pt-1.5 ${isRtl ? 'justify-start flex-row-reverse' : 'justify-start'}`}>
                    {(isRtl ? service.featuresAr : service.featuresEn).map((feat, index) => (
                      <span key={index} className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-500">
                        {feat}
                      </span>
                    ))}
                  </div>

                  {/* Bottom Stats/Dates line */}
                  <div className={`pt-3 border-t border-slate-100 flex items-center justify-between gap-4 text-[10px] font-semibold text-slate-400 ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{service.createdAt}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {viewMode === 'list' && (
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 font-mono text-slate-500 font-bold">
                          {isRtl ? `الترتيب: ${service.displayOrder}` : `Order: ${service.displayOrder}`}
                        </span>
                      )}

                      <span className={`px-2.5 py-1.5 rounded-lg text-[9px] font-extrabold uppercase tracking-wider ${
                        service.status === 'active' 
                          ? 'bg-emerald-50 text-emerald-800' 
                          : service.status === 'hidden'
                          ? 'bg-amber-50 text-amber-800'
                          : 'bg-rose-50 text-rose-800'
                      }`}>
                        {service.status === 'active' 
                          ? (isRtl ? 'نشط' : 'Active') 
                          : service.status === 'hidden'
                          ? (isRtl ? 'مخفي' : 'Hidden')
                          : (isRtl ? 'مهملات' : 'Trash')}
                      </span>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 8. BULK SELECT SELECT-ALL CHECKBOX DESCRIPTOR */}
      {!isLoading && sortedServices.length > 0 && (
        <div className={`flex items-center gap-2 text-xs font-semibold text-slate-400 justify-end`}>
          <span>
            {isRtl 
              ? `عرض ${sortedServices.length} من إجمالي ${services.filter(s=>s.status!=='deleted').length} خدمة` 
              : `Showing ${sortedServices.length} of ${services.filter(s=>s.status!=='deleted').length} services`}
          </span>
          <span>&bull;</span>
          <button 
            onClick={() => toggleSelectAll(sortedServices)}
            className="text-slate-500 hover:text-[#F20530] transition-colors cursor-pointer text-xs font-bold"
          >
            {sortedServices.every(id => selectedIds.includes(id.id)) 
              ? (isRtl ? 'إلغاء تحديد الكل' : 'Deselect All') 
              : (isRtl ? 'تحديد الكل المعروض' : 'Select All Visible')}
          </button>
        </div>
      )}

      {/* 9. DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deleteConfirmationModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setDeleteConfirmationModal({ isOpen: false, serviceId: null })}
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-2xl z-50"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-[#F20530] shrink-0">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div className={`space-y-1.5 ${isRtl ? 'text-right' : 'text-left'}`}>
                  <h3 className="text-lg font-extrabold text-slate-900 leading-none">
                    {isRtl ? 'هل تريد حذف الخدمة؟' : 'Delete Service?'}
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                    {isRtl 
                      ? 'سيتم إيقاف عرض هذه الخدمة فوراً على الموقع العام ونقلها لقسم المحذوفات. يمكن استعادتها لاحقاً في أي وقت.' 
                      : 'This action can be restored later because the system uses Soft Delete.'}
                  </p>
                </div>
              </div>

              <div className={`flex items-center gap-3 justify-end pt-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <button
                  onClick={() => setDeleteConfirmationModal({ isOpen: false, serviceId: null })}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  onClick={handleApplySoftDelete}
                  className="px-4 py-2.5 rounded-xl bg-[#F20530] hover:bg-rose-600 text-white text-xs font-bold transition-all cursor-pointer shadow-lg shadow-rose-100"
                >
                  {isRtl ? 'تأكيد الحذف' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 10. CREATE / EDIT FORM DIALOG MODAL */}
      <AnimatePresence>
        {formModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
              onClick={() => setFormModal({ isOpen: false, type: 'add', serviceId: null })}
            />

            {/* Form Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-2xl bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-2xl z-50 my-8 overflow-y-auto max-h-[90vh] custom-scrollbar"
            >
              {/* Header */}
              <div className={`flex items-center justify-between border-b border-slate-100 pb-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <div className="p-2 rounded-lg bg-[#F20530]/10 text-[#F20530]">
                    <Sparkles className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 leading-none">
                      {formModal.type === 'add' 
                        ? (isRtl ? 'إضافة خدمة رقمية جديدة' : 'Add New Service')
                        : (isRtl ? 'تعديل الخدمة البرمجية' : 'Edit Service details')}
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-1 font-semibold">
                      {isRtl ? 'أدخل البيانات بوضوح باللغتين العربية والإنجليزية لتقديم الدعم الأمثل' : 'Provide exact descriptions for LTR/RTL support.'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setFormModal({ isOpen: false, type: 'add', serviceId: null })}
                  className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Form container */}
              <form onSubmit={handleSaveService} className="space-y-5">
                
                {/* 1. Single Unified Service Name Input */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                    {isRtl ? 'اسم الخدمة' : 'Service Name'} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isRtl ? 'مثال: تطوير البرمجيات وحلول السحاب' : 'e.g. Software Development & Cloud Solutions'}
                    value={fieldNameEn || fieldNameAr}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFieldNameEn(val);
                      setFieldNameAr(val);
                      if (formModal.type === 'add') {
                        setFieldSlug(generateSlugFromName(val));
                      }
                    }}
                    className={`block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-[#F20530] focus:ring-4 focus:ring-[#F20530]/5 transition-all ${isRtl ? 'text-right' : 'text-left'}`}
                  />
                </div>

                {/* 2. Slug & Display Order Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                      {isRtl ? 'المعرف اللطيف (Slug للرابط)' : 'Slug URL Prefix'} *
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400 text-xs font-mono">
                        masterlink.sa/services/
                      </span>
                      <input
                        type="text"
                        required
                        placeholder="web-dev"
                        value={fieldSlug}
                        onChange={(e) => setFieldSlug(generateSlugFromName(e.target.value))}
                        className="block w-full pl-36 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold outline-none focus:bg-white focus:border-[#F20530] transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                      {isRtl ? 'ترتيب العرض بالصفحة' : 'Display Order Index'}
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={fieldDisplayOrder}
                      onChange={(e) => setFieldDisplayOrder(Number(e.target.value))}
                      className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-[#F20530] transition-all"
                    />
                  </div>
                </div>

                {/* 3. Cover Image and Icon selection */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                      {isRtl ? 'رابط صورة الغلاف الفنية' : 'Cover Image URL'}
                    </label>
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={fieldCoverImage}
                      onChange={(e) => setFieldCoverImage(e.target.value)}
                      className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:bg-white focus:border-[#F20530] transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                      {isRtl ? 'أيقونة الخدمة' : 'Service Icon'}
                    </label>
                    <div className="relative">
                      <select
                        value={fieldIconName}
                        onChange={(e) => setFieldIconName(e.target.value)}
                        className="appearance-none block w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-[#F20530] transition-all cursor-pointer"
                      >
                        <option value="Code2">Code2 &lt;/&gt;</option>
                        <option value="Palette">Palette 🎨</option>
                        <option value="Smartphone">Smartphone 📱</option>
                        <option value="TrendingUp">TrendingUp 📈</option>
                        <option value="Video">Video 🎥</option>
                        <option value="FileText">FileText 📄</option>
                        <option value="Layers">Layers 🥞</option>
                        <option value="Globe">Globe 🌐</option>
                      </select>
                      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Single Unified Description Input */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                    {isRtl ? 'الوصف المختصر للخدمة' : 'Short Service Description'}
                  </label>
                  <textarea
                    rows={3}
                    placeholder={isRtl ? 'أدخل وصفًا تفصيليًا ومختصرًا للخدمة الرقمية...' : 'Enter description of service...'}
                    value={fieldDescriptionEn || fieldDescriptionAr}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFieldDescriptionEn(val);
                      setFieldDescriptionAr(val);
                    }}
                    className={`block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-[#F20530] transition-all resize-none ${isRtl ? 'text-right' : 'text-left'}`}
                  />
                </div>

                {/* 5. Service Features - Single List */}
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                    <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1">
                      <Check className="w-4 h-4 text-[#F20530]" />
                      <span>{isRtl ? 'المميزات والقدرات الرئيسية (Features)' : 'Key Service Capabilities'}</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">
                      {isRtl ? 'بحد أقصى ٣ نقاط' : 'Max 3 bulletpoints'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {fieldFeaturesEn.map((feat, index) => (
                      <input
                        key={index}
                        type="text"
                        placeholder={isRtl ? `الميزة / القدرة رقم ${index + 1}` : `Capability #${index + 1}`}
                        value={feat || fieldFeaturesAr[index] || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateFeatureEnValue(index, val);
                          updateFeatureArValue(index, val);
                        }}
                        className={`block w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:border-[#F20530] transition-all ${isRtl ? 'text-right' : 'text-left'}`}
                      />
                    ))}
                  </div>
                </div>

                {/* 6. Form Status Checkbox */}
                <div className={`flex items-center gap-3 py-1 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <span className="text-xs font-bold text-slate-600">
                    {isRtl ? 'حالة النشر التشغيلية:' : 'Initial Deployment Status:'}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFieldStatus('active')}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                        fieldStatus === 'active' 
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                          : 'bg-white text-slate-400 border border-slate-200 hover:text-slate-600'
                      }`}
                    >
                      {isRtl ? 'نشط (معروض فوراً)' : 'Active (Live)'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setFieldStatus('hidden')}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                        fieldStatus === 'hidden' 
                          ? 'bg-amber-50 text-amber-800 border border-amber-200' 
                          : 'bg-white text-slate-400 border border-slate-200 hover:text-slate-600'
                      }`}
                    >
                      {isRtl ? 'مخفي (مسودة عمل)' : 'Hidden (Draft)'}
                    </button>
                  </div>
                </div>

                {/* Footer action buttons */}
                <div className={`flex items-center gap-3 justify-end pt-4 border-t border-slate-100 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <button
                    type="button"
                    onClick={() => setFormModal({ isOpen: false, type: 'add', serviceId: null })}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                  >
                    {isRtl ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#F20530] hover:bg-rose-600 text-white text-xs font-extrabold transition-all cursor-pointer shadow-lg shadow-rose-100"
                  >
                    {formModal.type === 'add' 
                      ? (isRtl ? 'تأكيد وحفظ الخدمة' : 'Create Service') 
                      : (isRtl ? 'حفظ التعديلات' : 'Save Changes')}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
