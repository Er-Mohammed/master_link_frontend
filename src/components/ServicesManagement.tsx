import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { adminServicesApi, mapLaravelServiceToItem, mapServiceItemToLaravelPayload, authApi } from '../services/api';
import { ServiceEditor } from './ServiceEditor';
import { PremiumEmptyState } from './ui/PremiumEmptyState';
import { ServiceItem } from '../types';
import { 
  Plus, 
  Search, 
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
  AlertCircle, 
  Calendar, 
  Layers, 
  CheckCircle, 
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function ServicesManagement() {
  const { language, isRtl } = useLanguage();
  const { canPerform } = useAuth();
  const { refreshDashboardStats } = useData();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'hidden'>('all');
  const [sortBy, setSortBy] = useState<'order' | 'date' | 'name'>('order');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Selected services for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Last update tracker state to feed into stats
  const [lastUpdatedText, setLastUpdatedText] = useState('الهوية البصرية');

  // Delete Confirmation Modal
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

  // UI Toast helper
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'deleted' } | null>(null);

  const triggerToast = (msg: string, type: 'success' | 'info' | 'deleted' = 'success') => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch Services from Laravel API
  const loadServices = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const res = await adminServicesApi.getAll({
        search: debouncedSearchQuery || undefined,
        is_active: statusFilter === 'active' ? true : statusFilter === 'hidden' ? false : undefined
      });
      if (res.data) {
        const mapped = res.data.map(mapLaravelServiceToItem);
        setServices(prev => {
          const prevMap = new Map<string, ServiceItem>(prev.map(s => [s.id, s]));
          return mapped.map(newItem => {
            const prevItem = prevMap.get(newItem.id);
            if (prevItem && prevItem.serviceMedia && prevItem.serviceMedia.length > 0 && (!newItem.serviceMedia || newItem.serviceMedia.length === 0)) {
              return {
                ...newItem,
                serviceMedia: prevItem.serviceMedia,
                coverImage: prevItem.coverImage || newItem.coverImage
              };
            }
            return newItem;
          });
        });
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
  }, [debouncedSearchQuery, statusFilter, language]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  // Calculations for stats
  const totalServices = services.length;
  const activeServices = services.filter(s => s.isActive).length;
  const hiddenServices = services.filter(s => !s.isActive).length;

  // Filter & Sort Logic
  const filteredServices = services.filter(s => {
    if (statusFilter === 'active' && !s.isActive) return false;
    if (statusFilter === 'hidden' && s.isActive) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = s.title?.toLowerCase().includes(q);
      const matchSlug = s.slug?.toLowerCase().includes(q);
      const matchDesc = s.shortDescription?.toLowerCase().includes(q);
      if (!matchTitle && !matchSlug && !matchDesc) return false;
    }
    return true;
  });

  const sortedServices = [...filteredServices].sort((a, b) => {
    if (sortBy === 'order') return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
    if (sortBy === 'name') return (a.title || '').localeCompare(b.title || '');
    if (sortBy === 'date') return (b.createdAt || '').localeCompare(a.createdAt || '');
    return 0;
  });

  // Open add / edit modal
  const openFormModal = (type: 'add' | 'edit', service?: ServiceItem) => {
    if (type === 'edit' && service) {
      setFormModal({ isOpen: true, type: 'edit', serviceId: service.id });
    } else {
      setFormModal({ isOpen: true, type: 'add', serviceId: null });
    }
  };

  // Duplicate Action via Laravel API
  const handleDuplicate = async (service: ServiceItem) => {
    try {
      const duplicatePayload = {
        title: `${service.title} (نسخة)`,
        slug: `${service.slug}-copy-${Math.floor(Math.random() * 1000)}`,
        short_description: service.shortDescription || null,
        full_description: service.fullDescription || null,
        sort_order: (service.sortOrder ?? 0) + 1,
        is_active: service.isActive ?? true
      };

      const res = await adminServicesApi.create(duplicatePayload);
      if (res.data) {
        await loadServices();
        refreshDashboardStats();
        setLastUpdatedText(`${service.title} (نسخة)`);
        triggerToast(
          language === 'en' ? `Duplicated "${service.title}" successfully.` : `تم تكرار "${service.title}" بنجاح في قاعدة البيانات.`,
          'success'
        );
      }
    } catch (err: any) {
      if (err?.status === 401) {
        authApi.clearToken();
        window.location.hash = '#admin-login';
        return;
      }
      triggerToast(err?.message || (language === 'en' ? 'Duplicate failed' : 'فشلت عملية التكرار'), 'deleted');
    }
  };

  // Toggle quick visibility
  const handleToggleVisibility = async (service: ServiceItem) => {
    const nextActive = !service.isActive;
    try {
      const res = await adminServicesApi.update(service.id, { is_active: nextActive });
      if (res.data) {
        const updated = mapLaravelServiceToItem(res.data);
        setServices(prev => prev.map(s => s.id === service.id ? updated : s));
        setLastUpdatedText(service.title);
        triggerToast(
          language === 'en' 
            ? `Status for "${service.title}" set to ${nextActive ? 'active' : 'hidden'}.` 
            : `تم تغيير حالة "${service.title}" إلى ${nextActive ? 'نشط' : 'مخفي'}.`,
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

  // Confirm Permanent Delete
  const confirmDelete = (serviceId: string) => {
    setDeleteConfirmationModal({ isOpen: true, serviceId });
  };

  const handleApplyPermanentDelete = async () => {
    const targetId = deleteConfirmationModal.serviceId;
    if (!targetId) return;

    const targetService = services.find(s => s.id === targetId);
    try {
      await adminServicesApi.delete(targetId);
      setServices(prev => prev.filter(s => s.id !== targetId));
      setSelectedIds(prev => prev.filter(id => id !== targetId));
      refreshDashboardStats();
      if (targetService) {
        setLastUpdatedText(targetService.title);
        triggerToast(
          language === 'en' 
            ? `"${targetService.title}" deleted successfully.` 
            : `تم حذف "${targetService.title}" نهائياً من قاعدة بيانات لارافيل.`,
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
  const handleBulkActivate = async () => {
    if (selectedIds.length === 0) return;
    setIsLoading(true);
    try {
      await Promise.all(selectedIds.map(id => adminServicesApi.update(id, { is_active: true })));
      await loadServices();
      setSelectedIds([]);
      triggerToast(
        language === 'en' ? 'Selected services activated in Laravel.' : 'تم تفعيل الخدمات المحددة بنجاح في قاعدة بيانات لارافيل.',
        'success'
      );
    } catch (err: any) {
      triggerToast(err?.message || (language === 'en' ? 'Bulk update failed' : 'فشلت عملية التعديل الجماعي'), 'deleted');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkHide = async () => {
    if (selectedIds.length === 0) return;
    setIsLoading(true);
    try {
      await Promise.all(selectedIds.map(id => adminServicesApi.update(id, { is_active: false })));
      await loadServices();
      setSelectedIds([]);
      triggerToast(
        language === 'en' ? 'Selected services hidden from public site.' : 'تم إخفاء الخدمات المحددة عن الموقع العام.',
        'info'
      );
    } catch (err: any) {
      triggerToast(err?.message || (language === 'en' ? 'Bulk update failed' : 'فشلت عملية التعديل الجماعي'), 'deleted');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setIsLoading(true);
    try {
      await Promise.all(selectedIds.map(id => adminServicesApi.delete(id)));
      await loadServices();
      setSelectedIds([]);
      refreshDashboardStats();
      triggerToast(
        language === 'en' ? 'Selected services deleted from Laravel.' : 'تم حذف الخدمات المحددة نهائياً من قاعدة بيانات لارافيل.',
        'deleted'
      );
    } catch (err: any) {
      triggerToast(err?.message || (language === 'en' ? 'Bulk delete failed' : 'فشلت عملية الحذف الجماعي'), 'deleted');
    } finally {
      setIsLoading(false);
    }
  };

  // Open dropdown index
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

          let targetServiceId = formModal.serviceId;

          if (formModal.type === 'edit' && formModal.serviceId) {
            const res = await adminServicesApi.update(formModal.serviceId, payload);
            if (res.data) {
              targetServiceId = String(res.data.id);
            }
          } else {
            const res = await adminServicesApi.create(payload);
            if (res.data) {
              targetServiceId = String(res.data.id);
            }
          }

          // Full Media Synchronization (Attach & Detach)
          let updatedServiceFromApi: ServiceItem | null = null;

          if (targetServiceId) {
            const existingMediaList = selectedService?.serviceMedia || [];
            const existingMediaIds = existingMediaList
              .map((m: any) => Number(m.media_id || m.id))
              .filter((id: number) => !isNaN(id) && id > 0);

            const selectedMediaList = Array.isArray(updatedFields.serviceMedia) ? updatedFields.serviceMedia : [];
            const selectedMediaIds = selectedMediaList
              .map((m: any) => Number(m.media_id || m.id))
              .filter((id: number) => !isNaN(id) && id > 0);

            // Detach media that were in backend but no longer selected
            const mediaToDetach = existingMediaIds.filter((id: number) => !selectedMediaIds.includes(id));
            for (const mediaId of mediaToDetach) {
              try {
                const res = await adminServicesApi.detachMedia(targetServiceId, mediaId);
                if (res?.data) {
                  updatedServiceFromApi = mapLaravelServiceToItem(res.data);
                }
              } catch {
                // ignore pivot errors
              }
            }

            // Attach selected media items
            for (const mediaItem of selectedMediaList) {
              const rawId = mediaItem.media_id || mediaItem.id;
              const numericMediaId = Number(rawId);
              if (!isNaN(numericMediaId) && numericMediaId > 0) {
                try {
                  const res = await adminServicesApi.attachMedia(targetServiceId, numericMediaId, mediaItem.sort_order || 0);
                  if (res?.data) {
                    updatedServiceFromApi = mapLaravelServiceToItem(res.data);
                  }
                } catch (attachErr) {
                  console.error(`Failed to attach media ID ${numericMediaId} to service ID ${targetServiceId}:`, attachErr);
                }
              } else {
                console.warn(`[ServicesManagement] Skipping media attachment for non-numeric media ID: "${rawId}"`);
              }
            }

            // If attach/detach didn't run or return data, fetch full details with media
            if (!updatedServiceFromApi) {
              try {
                const res = await adminServicesApi.getById(targetServiceId);
                if (res?.data) {
                  updatedServiceFromApi = mapLaravelServiceToItem(res.data);
                }
              } catch {
                // ignore
              }
            }
          }

          if (updatedServiceFromApi) {
            const freshService = updatedServiceFromApi;
            setServices(prev => {
              const exists = prev.some(s => s.id === freshService.id);
              if (exists) {
                return prev.map(s => s.id === freshService.id ? freshService : s);
              }
              return [freshService, ...prev];
            });
          } else {
            await loadServices();
          }
          refreshDashboardStats();
          if (updatedFields.title) {
            setLastUpdatedText(updatedFields.title);
          }
          triggerToast(
            formModal.type === 'edit'
              ? (language === 'en' ? 'Service updated successfully in Laravel.' : 'تم تحديث بيانات الخدمة في قاعدة بيانات لارافيل.')
              : (language === 'en' ? 'New service created successfully in Laravel.' : 'تم إضافة الخدمة الجديدة بنجاح في قاعدة بيانات لارافيل.'),
            'success'
          );
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
                <Trash2 className="w-4 h-4 text-rose-500" />
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
            value: lastUpdatedText,
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
              placeholder={isRtl ? 'ابحث باسم الخدمة، الوصف أو الرابط اللطيف...' : 'Search by title, description, slug...'}
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
                  <option value="name">{isRtl ? 'الاسم الأبجدي' : 'Alphabetical Title'}</option>
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

        {/* 4. BULK ACTIONS BAR */}
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
                  <Trash2 className="w-3.5 h-3.5" />
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
              {viewMode === 'grid' && (
                <div className="h-40 w-full bg-slate-100 rounded-xl animate-pulse relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
                </div>
              )}
              
              <div className="flex-1 space-y-3">
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
          onSecondaryAction={() => { setSearchQuery(''); setStatusFilter('all'); }}
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
                  <div className="h-44 w-full rounded-xl overflow-hidden relative border border-slate-100/50 bg-slate-100">
                    {service.coverImage ? (
                      <img 
                        src={service.coverImage} 
                        alt={service.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <Layers className="w-8 h-8" />
                      </div>
                    )}
                    
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
                      #{service.sortOrder ?? 0}
                    </span>
                  </div>
                )}

                {/* Main Content Area */}
                <div className="flex-1 min-w-0 space-y-3 w-full">
                  
                  {/* Top line */}
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

                      {viewMode === 'list' && service.coverImage && (
                        <div className="hidden md:block w-14 h-10 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                          <img src={service.coverImage} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}

                      <div className={isRtl ? 'text-right' : 'text-left'}>
                        <div className={`flex items-center gap-2 flex-wrap ${isRtl ? 'flex-row-reverse' : ''}`}>
                          <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-[#F20530] transition-colors leading-snug truncate max-w-[200px] sm:max-w-xs">
                            {service.title}
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
                          <div className="fixed inset-0 z-10" onClick={() => setActiveMenuId(null)} />
                          
                          <div className={`absolute ${isRtl ? 'left-0' : 'right-0'} mt-1.5 w-44 bg-white rounded-xl border border-slate-200 shadow-xl py-1.5 z-20`}>
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
                                {service.isActive ? (
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
                                  <Trash2 className="w-4 h-4" />
                                  <span>{isRtl ? 'حذف الخدمة' : 'Delete Service'}</span>
                                </button>
                              </>
                            )}
                          </div>
                        </>
                      )}
                    </div>

                  </div>

                  {/* Short Description */}
                  {service.shortDescription && (
                    <p className={`text-xs text-slate-500 font-semibold leading-relaxed line-clamp-2 ${isRtl ? 'text-right' : 'text-left'}`}>
                      {service.shortDescription}
                    </p>
                  )}

                  {/* Bottom line */}
                  <div className={`pt-3 border-t border-slate-100 flex items-center justify-between gap-4 text-[10px] font-semibold text-slate-400 ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{service.createdAt}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {viewMode === 'list' && (
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 font-mono text-slate-500 font-bold">
                          {isRtl ? `الترتيب: ${service.sortOrder ?? 0}` : `Order: ${service.sortOrder ?? 0}`}
                        </span>
                      )}

                      <span className={`px-2.5 py-1.5 rounded-lg text-[9px] font-extrabold uppercase tracking-wider ${
                        service.isActive
                          ? 'bg-emerald-50 text-emerald-800' 
                          : 'bg-amber-50 text-amber-800'
                      }`}>
                        {service.isActive 
                          ? (isRtl ? 'نشط' : 'Active') 
                          : (isRtl ? 'مخفي' : 'Hidden')}
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
              ? `عرض ${sortedServices.length} من إجمالي ${services.length} خدمة` 
              : `Showing ${sortedServices.length} of ${services.length} services`}
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
                    {isRtl ? 'هل تريد حذف الخدمة نهائياً؟' : 'Permanently Delete Service?'}
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                    {isRtl 
                      ? 'سيتم حذف هذه الخدمة نهائياً من قاعدة البيانات.' 
                      : 'This action will permanently delete the service from the database.'}
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
                  onClick={handleApplyPermanentDelete}
                  className="px-4 py-2.5 rounded-xl bg-[#F20530] hover:bg-rose-600 text-white text-xs font-bold transition-all cursor-pointer shadow-lg shadow-rose-100"
                >
                  {isRtl ? 'تأكيد الحذف' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
