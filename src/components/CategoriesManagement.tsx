import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, 
  Search, 
  SlidersHorizontal, 
  Filter, 
  ArrowUpDown, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Check, 
  X, 
  AlertCircle, 
  Calendar, 
  RefreshCw, 
  FolderHeart, 
  ChevronRight,
  Sparkles,
  Layers,
  MoreVertical,
  CheckSquare,
  Square,
  AlertTriangle,
  FileCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CategoryItem {
  id: string;
  nameEn: string;
  nameAr: string;
  slug: string;
  projectsCount: number;
  displayOrder: number;
  status: 'active' | 'hidden';
  createdAt: string;
}

export function CategoriesManagement() {
  const { language, isRtl } = useLanguage();
  const { canPerform } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'hidden'>('all');
  const [sortBy, setSortBy] = useState<'order' | 'projects' | 'name' | 'date'>('order');
  
  // Toast notifications state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'danger' | 'info' } | null>(null);

  const triggerToast = (msg: string, type: 'success' | 'danger' | 'info' = 'success') => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Seed Categories
  const [categories, setCategories] = useState<CategoryItem[]>([
    {
      id: 'CAT-01',
      nameEn: 'Web Development',
      nameAr: 'تطوير الويب المتكامل',
      slug: 'web-development',
      projectsCount: 12,
      displayOrder: 1,
      status: 'active',
      createdAt: '2026-01-10',
    },
    {
      id: 'CAT-02',
      nameEn: 'Mobile Applications',
      nameAr: 'تطبيقات الهواتف الذكية',
      slug: 'mobile-apps',
      projectsCount: 8,
      displayOrder: 2,
      status: 'active',
      createdAt: '2026-02-15',
    },
    {
      id: 'CAT-03',
      nameEn: 'AI Solutions',
      nameAr: 'حلول الذكاء الاصطناعي',
      slug: 'ai-solutions',
      projectsCount: 5,
      displayOrder: 3,
      status: 'active',
      createdAt: '2026-03-20',
    },
    {
      id: 'CAT-04',
      nameEn: 'ERP Systems',
      nameAr: 'أنظمة إدارة المؤسسات ERP',
      slug: 'erp-systems',
      projectsCount: 3,
      displayOrder: 4,
      status: 'hidden',
      createdAt: '2026-04-05',
    }
  ]);

  // Bulk actions selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkMenu, setShowBulkMenu] = useState(false);

  // Modal controller
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create');
  const [selectedCategory, setSelectedCategory] = useState<CategoryItem | null>(null);

  // Form Fields
  const [formNameEn, setFormNameEn] = useState('');
  const [formNameAr, setFormNameAr] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDisplayOrder, setFormDisplayOrder] = useState<number>(1);
  const [formStatus, setFormStatus] = useState<'active' | 'hidden'>('active');
  const [formProjectsCount, setFormProjectsCount] = useState<number>(0);

  // Auto slug generation trigger
  const [autoSlug, setAutoSlug] = useState(true);

  // Delete confirmation
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryItem | null>(null);

  // Active Dropdown Actions for specific rows (mainly for mobile view)
  const [activeRowDropdown, setActiveRowDropdown] = useState<string | null>(null);

  // Generate slug helper
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  // Sync English Name to Slug if autoSlug is active
  useEffect(() => {
    if (autoSlug && editorMode === 'create') {
      setFormSlug(generateSlug(formNameEn));
    }
  }, [formNameEn, autoSlug, editorMode]);

  // Reset/Trigger simulated loading
  const handleSimulateLoad = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      triggerToast(language === 'en' ? 'Categories synchronized.' : 'تم مزامنة التصنيفات السحابية.', 'success');
    }, 1000);
  };

  // Open Editor Modal (Create Mode)
  const handleOpenCreateModal = () => {
    setEditorMode('create');
    setSelectedCategory(null);
    setFormNameEn('');
    setFormNameAr('');
    setFormSlug('');
    setFormDisplayOrder(categories.length > 0 ? Math.max(...categories.map(c => c.displayOrder)) + 1 : 1);
    setFormStatus('active');
    setFormProjectsCount(0);
    setAutoSlug(true);
    setIsEditorOpen(true);
  };

  // Open Editor Modal (Edit Mode)
  const handleOpenEditModal = (cat: CategoryItem) => {
    setEditorMode('edit');
    setSelectedCategory(cat);
    setFormNameEn(cat.nameEn);
    setFormNameAr(cat.nameAr);
    setFormSlug(cat.slug);
    setFormDisplayOrder(cat.displayOrder);
    setFormStatus(cat.status);
    setFormProjectsCount(cat.projectsCount);
    setAutoSlug(false);
    setIsEditorOpen(true);
    setActiveRowDropdown(null);
  };

  // Toggle Visibility of category directly
  const handleToggleVisibility = (cat: CategoryItem) => {
    const nextStatus = cat.status === 'active' ? 'hidden' : 'active';
    setCategories(prev => prev.map(item => item.id === cat.id ? { ...item, status: nextStatus } : item));
    triggerToast(
      language === 'en' 
        ? `Category status is now ${nextStatus}` 
        : `حالة التصنيف الآن: ${nextStatus === 'active' ? 'نشط' : 'مخفي'}`,
      'info'
    );
  };

  // Trigger Delete Confirmation
  const handleConfirmDelete = (cat: CategoryItem) => {
    setCategoryToDelete(cat);
    setIsDeleteConfirmOpen(true);
    setActiveRowDropdown(null);
  };

  // Execute Delete
  const handleDeleteCategory = () => {
    if (!categoryToDelete) return;
    setCategories(prev => prev.filter(c => c.id !== categoryToDelete.id));
    setSelectedIds(prev => prev.filter(id => id !== categoryToDelete.id));
    setIsDeleteConfirmOpen(false);
    triggerToast(
      language === 'en' 
        ? `Category "${categoryToDelete.nameEn}" successfully deleted.` 
        : `تم حذف التصنيف "${categoryToDelete.nameAr}" بنجاح.`,
      'danger'
    );
    setCategoryToDelete(null);
  };

  // Save Category Form (Submit)
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNameEn && !formNameAr) {
      triggerToast(language === 'en' ? 'Category name is required.' : 'اسم التصنيف مطلوب.', 'danger');
      return;
    }

    const finalSlug = formSlug.trim() || generateSlug(formNameEn);

    if (editorMode === 'create') {
      const newCategory: CategoryItem = {
        id: `CAT-0${Math.floor(10 + Math.random() * 90)}`,
        nameEn: formNameEn,
        nameAr: formNameAr,
        slug: finalSlug,
        projectsCount: formProjectsCount,
        displayOrder: formDisplayOrder,
        status: formStatus,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setCategories(prev => [...prev, newCategory]);
      triggerToast(
        language === 'en' 
          ? `Category "${formNameEn}" successfully created.` 
          : `تم إنشاء التصنيف "${formNameAr}" بنجاح.`,
        'success'
      );
    } else if (editorMode === 'edit' && selectedCategory) {
      setCategories(prev => prev.map(item => 
        item.id === selectedCategory.id 
          ? { 
              ...item, 
              nameEn: formNameEn, 
              nameAr: formNameAr, 
              slug: finalSlug, 
              displayOrder: formDisplayOrder, 
              status: formStatus,
              projectsCount: formProjectsCount
            } 
          : item
      ));
      triggerToast(
        language === 'en' 
          ? `Category "${formNameEn}" updated successfully.` 
          : `تم تحديث التصنيف "${formNameAr}" بنجاح.`,
        'success'
      );
    }
    setIsEditorOpen(false);
  };

  // Handle selection of specific row
  const handleSelectRow = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Handle bulk toggle select
  const handleSelectAll = (filteredIds: string[]) => {
    if (selectedIds.length === filteredIds.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredIds);
    }
  };

  // Bulk Actions
  const handleBulkAction = (action: 'active' | 'hidden' | 'delete') => {
    if (selectedIds.length === 0) return;
    
    if (action === 'delete') {
      setCategories(prev => prev.filter(c => !selectedIds.includes(c.id)));
      setSelectedIds([]);
      triggerToast(
        language === 'en' 
          ? `Deleted ${selectedIds.length} categories.` 
          : `تم حذف ${selectedIds.length} تصنيفات بنجاح.`,
        'danger'
      );
    } else {
      setCategories(prev => prev.map(c => 
        selectedIds.includes(c.id) ? { ...c, status: action } : c
      ));
      triggerToast(
        language === 'en' 
          ? `Updated ${selectedIds.length} categories to ${action === 'active' ? 'active' : 'hidden'}.` 
          : `تم تعديل حالة ${selectedIds.length} تصنيفات بنجاح.`,
        'success'
      );
    }
    setShowBulkMenu(false);
  };

  // Statistics computation
  const totalCategories = categories.length;
  const activeCategories = categories.filter(c => c.status === 'active').length;
  const hiddenCategories = categories.filter(c => c.status === 'hidden').length;

  // Filter & Sort computation
  const filteredCategories = categories.filter(c => {
    const matchesSearch = 
      c.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    if (sortBy === 'order') {
      return a.displayOrder - b.displayOrder;
    }
    if (sortBy === 'projects') {
      return b.projectsCount - a.projectsCount;
    }
    if (sortBy === 'name') {
      return isRtl ? a.nameAr.localeCompare(b.nameAr) : a.nameEn.localeCompare(b.nameEn);
    }
    if (sortBy === 'date') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return 0;
  });

  // Localized string dictionary
  const dictionary = {
    title: language === 'en' ? 'Portfolio Categories' : 'تصنيفات معرض الأعمال',
    subtitle: language === 'en' 
      ? 'Manage and coordinate portfolio filter taxonomies such as Web Development, Mobile Applications, AI, and ERP tiers.'
      : 'إدارة وتنسيق تصنيفات معرض الأعمال وفهرستها مثل تطوير الويب، تطبيقات الهواتف، الذكاء الاصطناعي، والحلول المؤسسية.',
    statTotal: language === 'en' ? 'Total Categories' : 'إجمالي التصنيفات',
    statActive: language === 'en' ? 'Active Categories' : 'التصنيفات النشطة',
    statHidden: language === 'en' ? 'Hidden Categories' : 'التصنيفات المخفية',
    actionAdd: language === 'en' ? 'Add New Category' : 'إضافة تصنيف جديد',
    placeholderSearch: language === 'en' ? 'Search by category name or slug...' : 'ابحث باسم التصنيف أو المعرف البديل (الslug)...',
    filterAll: language === 'en' ? 'All Statuses' : 'جميع الحالات',
    filterActive: language === 'en' ? 'Active Only' : 'النشطة فقط',
    filterHidden: language === 'en' ? 'Hidden Only' : 'المخفية فقط',
    sortLabel: language === 'en' ? 'Sort By' : 'فرز حسب',
    sortOrder: language === 'en' ? 'Display Order' : 'ترتيب العرض',
    sortProjects: language === 'en' ? 'Projects Count' : 'عدد المشاريع',
    sortName: language === 'en' ? 'Alphabetical' : 'أبجدياً',
    sortDate: language === 'en' ? 'Date Created' : 'تاريخ الإنشاء',
    colName: language === 'en' ? 'Category Name' : 'اسم التصنيف',
    colSlug: language === 'en' ? 'Slug' : 'المعرف البديل (Slug)',
    colProjects: language === 'en' ? 'Projects Count' : 'المشاريع المرتبطة',
    colOrder: language === 'en' ? 'Display Order' : 'ترتيب العرض',
    colStatus: language === 'en' ? 'Status' : 'الحالة',
    colDate: language === 'en' ? 'Created Date' : 'تاريخ الإنشاء',
    colActions: language === 'en' ? 'Actions' : 'إجراءات والعمليات',
    bulkTitle: language === 'en' ? 'Bulk Actions' : 'العمليات الجماعية',
    bulkActive: language === 'en' ? 'Bulk Activate' : 'تنشيط جماعي',
    bulkHide: language === 'en' ? 'Bulk Hide' : 'إخفاء جماعي',
    bulkDelete: language === 'en' ? 'Bulk Delete' : 'حذف جماعي',
    selectedCount: language === 'en' ? 'selected' : 'محدد',
    emptyTitle: language === 'en' ? 'No matching categories found' : 'لم يتم العثور على أي تصنيفات مطابقة',
    emptyDesc: language === 'en' ? 'Try adjusting your search query, clearing filters, or adding a new category to get started.' : 'يرجى تغيير عبارة البحث، أو إعادة ضبط الفلاتر، أو إضافة تصنيف جديد للبدء.',
    emptyReset: language === 'en' ? 'Clear All Filters' : 'إعادة ضبط فلاتر البحث',
    labelActive: language === 'en' ? 'Active' : 'نشط ومفعل',
    labelHidden: language === 'en' ? 'Hidden' : 'مخفي',
    modalAddTitle: language === 'en' ? 'Add New Portfolio Category' : 'إنشاء تصنيف جديد لمعرض الأعمال',
    modalEditTitle: language === 'en' ? 'Edit Category Details' : 'تعديل بيانات التصنيف الرقمي',
    labelNameEn: language === 'en' ? 'Category Name (English)' : 'اسم التصنيف (بالإلكترونية/الإنجليزية)',
    labelNameAr: language === 'en' ? 'Category Name (Arabic)' : 'اسم التصنيف (بالعربية)',
    labelSlug: language === 'en' ? 'Custom URL Slug' : 'معرف الرابط الفريد (Slug)',
    labelSlugAuto: language === 'en' ? 'Auto-generate from English name' : 'توليد تلقائي من الاسم الإنجليزي',
    labelDisplayOrder: language === 'en' ? 'Display Sorting Order' : 'أولوية وترتيب العرض الفهرسي',
    labelStatus: language === 'en' ? 'Initial Visibility Status' : 'حالة الظهور الأولية',
    labelProjectsCount: language === 'en' ? 'Associated Projects Count' : 'عدد المشاريع المرتبطة (محاكاة)',
    btnCancel: language === 'en' ? 'Cancel' : 'إلغاء الأمر',
    btnConfirmSave: language === 'en' ? 'Save Category' : 'حفظ التصنيف وحياكته',
    deleteConfirmTitle: language === 'en' ? 'Delete Portfolio Category' : 'حذف تصنيف معرض الأعمال',
    deleteConfirmDesc: language === 'en' 
      ? 'Are you absolutely sure you want to delete this category? This action is irreversible and may affect how projects assigned to this category are filtered on the client website.'
      : 'هل أنت متأكد تماماً من رغبتك في حذف هذا التصنيف؟ هذا الإجراء غير قابل للتراجع وقد يؤثر على تصفية وفرز المشاريع الرقمية المرتبطة به في موقع الوكالة.',
    btnDelete: language === 'en' ? 'Delete Category' : 'تأكيد الحذف النهائي',
    btnSimulateLoading: language === 'en' ? 'Simulate Live Sync' : 'محاكاة التزامن الحي',
    viewCategoryDetails: language === 'en' ? 'View Details' : 'عرض التفاصيل',
    quickActionHide: language === 'en' ? 'Hide Category' : 'إخفاء التصنيف',
    quickActionShow: language === 'en' ? 'Activate Category' : 'تفعيل وتنشيط'
  };

  return (
    <div className={`space-y-6 ${isRtl ? 'text-right' : 'text-left'}`}>
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-6 ${isRtl ? 'left-6' : 'right-6'} z-50 p-4 rounded-xl shadow-lg border flex items-center gap-3 max-w-sm bg-slate-950 text-white border-slate-900`}
            id="categories-toast"
          >
            {toast.type === 'danger' ? (
              <AlertCircle className="w-4 h-4 text-[#F20530] shrink-0" />
            ) : (
              <Check className="w-4 h-4 text-[#F20530] shrink-0" />
            )}
            <span className="text-xs font-semibold leading-relaxed">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER SECTION */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm relative overflow-hidden space-y-4">
        <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-rose-500/5 to-transparent pointer-events-none" />
        
        {/* Top Actions Row */}
        <div className={`flex items-center justify-between gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#F20530]/10 text-[#F20530]">
              <Layers className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {isRtl ? 'بوابة إدارة الفهرسة والتصنيف' : 'PORTFOLIO TAXONOMY'}
            </span>
          </div>
          
          <div className={`flex flex-wrap items-center gap-2.5 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <button
              onClick={handleSimulateLoad}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 transition-all cursor-pointer"
              id="btn-simulate-sync"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#F20530] ${isLoading ? 'animate-spin' : ''}`} />
              <span>{dictionary.btnSimulateLoading}</span>
            </button>
            {canPerform('categories', 'create') && (
              <button
                onClick={handleOpenCreateModal}
                className="flex items-center gap-2 px-4.5 py-2 rounded-xl text-xs font-extrabold text-white bg-[#F20530] hover:bg-rose-600 transition-all cursor-pointer shadow-md shadow-rose-100 active:scale-95"
                id="btn-add-category"
              >
                <Plus className="w-4 h-4" />
                <span>{dictionary.actionAdd}</span>
              </button>
            )}
          </div>
        </div>

        {/* Title and Description Texts under the button */}
        <div className={`space-y-1 ${isRtl ? 'text-right' : 'text-left'}`}>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-none">
            {dictionary.title}
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm font-semibold max-w-3xl leading-relaxed">
            {dictionary.subtitle}
          </p>
        </div>
      </div>

      {/* STATISTICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[
          { title: dictionary.statTotal, value: totalCategories, icon: Layers, color: 'text-rose-500 bg-rose-50' },
          { title: dictionary.statActive, value: activeCategories, icon: Check, color: 'text-emerald-500 bg-emerald-50' },
          { title: dictionary.statHidden, value: hiddenCategories, icon: EyeOff, color: 'text-slate-500 bg-slate-50' }
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-slate-100 group-hover:bg-[#F20530] transition-colors" />
              <div className={`flex items-center gap-4 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`p-3 rounded-xl ${stat.color} shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">
                    {stat.title}
                  </h4>
                  <span className="text-2xl font-black text-slate-900 tracking-tight block">
                    {stat.value}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* TOOLBAR */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        <div className={`flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 ${isRtl ? 'md:flex-row-reverse' : ''}`}>
          
          {/* Live Search */}
          <div className="relative flex-1 max-w-md">
            <span className={`absolute inset-y-0 ${isRtl ? 'right-3.5' : 'left-3.5'} flex items-center pointer-events-none text-slate-400`}>
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder={dictionary.placeholderSearch}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`block w-full ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-[#F20530] focus:ring-4 focus:ring-[#F20530]/5 transition-all`}
              id="search-categories-input"
            />
          </div>

          {/* Filters & Sorting */}
          <div className={`flex flex-wrap items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
            
            {/* Status Filter */}
            <div className={`flex items-center gap-1.5 border border-slate-200 rounded-xl px-3 py-1.5 bg-slate-50 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <Filter className="w-3.5 h-3.5 text-[#F20530]" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-transparent border-none outline-none text-xs font-bold text-slate-700 cursor-pointer"
                id="filter-status-select"
              >
                <option value="all">{dictionary.filterAll}</option>
                <option value="active">{dictionary.filterActive}</option>
                <option value="hidden">{dictionary.filterHidden}</option>
              </select>
            </div>

            {/* Sorting Filter */}
            <div className={`flex items-center gap-1.5 border border-slate-200 rounded-xl px-3 py-1.5 bg-slate-50 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <ArrowUpDown className="w-3.5 h-3.5 text-[#F20530]" />
              <span className="text-[10px] text-slate-400 font-bold hidden sm:inline">{dictionary.sortLabel}:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent border-none outline-none text-xs font-bold text-slate-700 cursor-pointer font-sans"
                id="sort-categories-select"
              >
                <option value="order">{dictionary.sortOrder}</option>
                <option value="projects">{dictionary.sortProjects}</option>
                <option value="name">{dictionary.sortName}</option>
                <option value="date">{dictionary.sortDate}</option>
              </select>
            </div>

          </div>

        </div>
      </div>

      {/* BULK ACTIONS BANNER */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="overflow-hidden"
          >
            <div className={`bg-slate-950 text-white rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md border border-slate-900 ${isRtl ? 'sm:flex-row-reverse' : ''}`}>
              <div className={`flex items-center gap-2.5 text-xs font-bold ${isRtl ? 'flex-row-reverse' : ''}`}>
                <CheckSquare className="w-4 h-4 text-[#F20530]" />
                <span>
                  {selectedIds.length} {dictionary.selectedCount}
                </span>
              </div>
              <div className={`flex flex-wrap items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                {canPerform('categories', 'edit') && (
                  <>
                    <button
                      onClick={() => handleBulkAction('active')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-extrabold rounded-lg transition-all cursor-pointer"
                      id="bulk-activate-btn"
                    >
                      {dictionary.bulkActive}
                    </button>
                    <button
                      onClick={() => handleBulkAction('hidden')}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-extrabold rounded-lg transition-all cursor-pointer"
                      id="bulk-hide-btn"
                    >
                      {dictionary.bulkHide}
                    </button>
                  </>
                )}
                {canPerform('categories', 'delete') && (
                  <button
                    onClick={() => handleBulkAction('delete')}
                    className="px-3 py-1.5 bg-[#F20530] hover:bg-rose-600 text-white text-[11px] font-extrabold rounded-lg transition-all cursor-pointer flex items-center gap-1"
                    id="bulk-delete-btn"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>{dictionary.bulkDelete}</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedIds([])}
                  className="p-1.5 text-slate-400 hover:text-white rounded-md transition-colors cursor-pointer"
                  title={dictionary.btnCancel}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CORE CATEGORIES GRID / TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        
        {isLoading ? (
          /* SKELETON LOADING STATE */
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between gap-4 py-4 border-b border-slate-100 last:border-0 animate-pulse">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-5 h-5 bg-slate-200 rounded" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-slate-200 rounded w-1/4" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-4 bg-slate-200 rounded w-20" />
                <div className="h-4 bg-slate-200 rounded w-12" />
                <div className="h-8 bg-slate-100 rounded w-24" />
              </div>
            ))}
          </div>
        ) : filteredCategories.length === 0 ? (
          /* EMPTY STATE */
          <div className="p-12 text-center space-y-5" id="categories-empty-state">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 text-slate-400 flex items-center justify-center mx-auto shadow-inner">
              <FolderHeart className="w-7 h-7 text-[#F20530]" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-base font-extrabold text-slate-900">
                {dictionary.emptyTitle}
              </h3>
              <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                {dictionary.emptyDesc}
              </p>
            </div>
            {(searchQuery || statusFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
                className="px-4.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5"
                id="btn-clear-filters"
              >
                <span>{dictionary.emptyReset}</span>
              </button>
            )}
          </div>
        ) : (
          /* DESKTOP HIGH FIDELITY TABLE VIEW */
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-semibold text-slate-600" id="categories-table">
              <thead>
                <tr className={`border-b border-slate-200/80 bg-slate-50/50 text-slate-400 uppercase tracking-wider text-[10px] font-bold ${isRtl ? 'text-right' : 'text-left'}`}>
                  <th className="py-4 px-5 w-12 text-center">
                    <button
                      onClick={() => handleSelectAll(filteredCategories.map(c => c.id))}
                      className="p-1 hover:bg-slate-200 rounded-md transition-colors inline-block"
                    >
                      {selectedIds.length === filteredCategories.length ? (
                        <CheckSquare className="w-4 h-4 text-[#F20530]" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-300" />
                      )}
                    </button>
                  </th>
                  <th className="py-4 px-4">{dictionary.colName}</th>
                  <th className="py-4 px-4">{dictionary.colSlug}</th>
                  <th className="py-4 px-4 text-center">{dictionary.colProjects}</th>
                  <th className="py-4 px-4 text-center">{dictionary.colOrder}</th>
                  <th className="py-4 px-4 text-center">{dictionary.colStatus}</th>
                  <th className="py-4 px-4">{dictionary.colDate}</th>
                  <th className="py-4 px-5 text-center">{dictionary.colActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCategories.map((cat, idx) => {
                  const isSelected = selectedIds.includes(cat.id);
                  return (
                    <tr 
                      key={cat.id} 
                      className={`hover:bg-slate-50/40 transition-colors group ${
                        isSelected ? 'bg-slate-50/60' : ''
                      }`}
                      id={`category-row-${cat.id}`}
                    >
                      {/* Bulk Selection Checkbox */}
                      <td className="py-3.5 px-5 text-center">
                        <button
                          onClick={() => handleSelectRow(cat.id)}
                          className="p-1 rounded-md transition-colors inline-block"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-[#F20530]" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300 group-hover:text-slate-400" />
                          )}
                        </button>
                      </td>

                      {/* Category Name & Bilingual Label */}
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <div className="space-y-0.5">
                          <p className="text-xs font-extrabold text-slate-900">
                            {language === 'en' ? cat.nameEn : cat.nameAr}
                          </p>
                          <p className="text-[10px] text-slate-400 font-semibold font-sans">
                            {language === 'en' ? cat.nameAr : cat.nameEn}
                          </p>
                        </div>
                      </td>

                      {/* Slug string */}
                      <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px] max-w-[140px] truncate">
                        /{cat.slug}
                      </td>

                      {/* Projects count */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-50 text-slate-800 text-[10px] font-bold border border-slate-100 font-mono">
                          {cat.projectsCount}
                        </span>
                      </td>

                      {/* Display sorting order */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100/50 px-2 py-0.5 rounded-md">
                          #{cat.displayOrder}
                        </span>
                      </td>

                      {/* Status indicator badge */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex justify-center">
                          {canPerform('categories', 'edit') ? (
                            <button
                              onClick={() => handleToggleVisibility(cat)}
                              className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                cat.status === 'active'
                                  ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-100'
                                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200'
                              }`}
                              title={cat.status === 'active' ? dictionary.quickActionHide : dictionary.quickActionShow}
                              id={`status-toggle-${cat.id}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${cat.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                              <span>{cat.status === 'active' ? dictionary.labelActive : dictionary.labelHidden}</span>
                            </button>
                          ) : (
                            <div
                              className={`px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 ${
                                cat.status === 'active'
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                                  : 'bg-slate-50 text-slate-500 border border-slate-200'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${cat.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                              <span>{cat.status === 'active' ? dictionary.labelActive : dictionary.labelHidden}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Created date */}
                      <td className="py-3.5 px-4 font-mono text-slate-400 text-[10px]">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-300" />
                          <span>{cat.createdAt}</span>
                        </div>
                      </td>

                      {/* Core Row Actions */}
                      <td className="py-3.5 px-5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              triggerToast(
                                language === 'en' 
                                  ? `Viewing category: ${cat.nameEn}` 
                                  : `عرض تفاصيل تصنيف: ${cat.nameAr}`,
                                'info'
                              );
                            }}
                            className="p-1.5 hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-400 hover:text-slate-700 rounded-lg transition-all cursor-pointer"
                            title={dictionary.viewCategoryDetails}
                            id={`btn-view-${cat.id}`}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {canPerform('categories', 'edit') && (
                            <button
                              onClick={() => handleOpenEditModal(cat)}
                              className="p-1.5 hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-400 hover:text-blue-600 rounded-lg transition-all cursor-pointer"
                              title={language === 'en' ? 'Edit Category' : 'تعديل التصنيف'}
                              id={`btn-edit-${cat.id}`}
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {canPerform('categories', 'delete') && (
                            <button
                              onClick={() => handleConfirmDelete(cat)}
                              className="p-1.5 hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-400 hover:text-[#F20530] rounded-lg transition-all cursor-pointer"
                              title={language === 'en' ? 'Delete Category' : 'حذف التصنيف'}
                              id={`btn-delete-${cat.id}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* EDIT/CREATE CREATIVE MODAL DIALOG */}
      <AnimatePresence>
        {isEditorOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setIsEditorOpen(false)}
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-xl bg-white rounded-[24px] border border-slate-200 p-6 sm:p-8 space-y-6 shadow-2xl z-50 overflow-y-auto max-h-[90vh]"
              id="category-editor-modal"
            >
              
              {/* Modal Title and close */}
              <div className={`flex items-center justify-between border-b border-slate-100 pb-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <div className={`flex items-center gap-2.5 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <div className="w-8 h-8 rounded-lg bg-rose-50 text-[#F20530] flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {editorMode === 'create' ? dictionary.modalAddTitle : dictionary.modalEditTitle}
                  </h3>
                </div>
                <button 
                  onClick={() => setIsEditorOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-all border border-transparent hover:border-slate-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Input fields */}
              <form onSubmit={handleSaveForm} className="space-y-4">
                
                {/* Category Name (Unified Single Input) */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    {language === 'en' ? 'Category Name' : 'اسم التصنيف'} <span className="text-[#F20530]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={language === 'en' ? 'e.g. Web Development / تطوير الويب' : 'مثال: تطوير الويب المتكامل'}
                    value={formNameEn || formNameAr}
                    onChange={(e) => {
                      setFormNameEn(e.target.value);
                      setFormNameAr(e.target.value);
                    }}
                    className={`block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-[#F20530] focus:ring-4 focus:ring-[#F20530]/5 transition-all ${
                      isRtl ? 'text-right' : 'text-left'
                    }`}
                    id="input-category-name"
                  />
                </div>

                {/* Custom URL Slug */}
                <div className="space-y-1.5 bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                  <div className={`flex items-center justify-between gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                      {dictionary.labelSlug} <span className="text-[#F20530]">*</span>
                    </label>
                    
                    {editorMode === 'create' && (
                      <button
                        type="button"
                        onClick={() => setAutoSlug(!autoSlug)}
                        className={`flex items-center gap-1.5 text-[10px] font-bold text-slate-500 hover:text-[#F20530] transition-colors ${isRtl ? 'flex-row-reverse' : ''}`}
                      >
                        <span className={`w-4 h-4 border rounded flex items-center justify-center transition-all ${
                          autoSlug ? 'bg-[#F20530] border-transparent text-white' : 'border-slate-300 bg-white'
                        }`}>
                          {autoSlug && <Check className="w-3 h-3" />}
                        </span>
                        <span>{dictionary.labelSlugAuto}</span>
                      </button>
                    )}
                  </div>
                  
                  <div className="relative mt-2">
                    <span className="hidden sm:flex absolute inset-y-0 left-3.5 items-center text-slate-400 font-mono text-[11px] pointer-events-none">
                      masterlink.com/portfolio/category/
                    </span>
                    <span className="flex sm:hidden absolute inset-y-0 left-3.5 items-center text-slate-400 font-mono text-[11px] pointer-events-none">
                      /category/
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="web-development"
                      disabled={autoSlug && editorMode === 'create'}
                      value={formSlug}
                      onChange={(e) => setFormSlug(generateSlug(e.target.value))}
                      className="block w-full pl-[85px] sm:pl-[215px] pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold outline-none focus:border-[#F20530] focus:ring-4 focus:ring-[#F20530]/5 disabled:opacity-60 disabled:bg-slate-100 transition-all text-left"
                      id="input-slug"
                    />
                  </div>
                </div>

                {/* Sorting and Initial count / Status layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Sorting Display Order */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      {dictionary.labelDisplayOrder}
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={formDisplayOrder}
                      onChange={(e) => setFormDisplayOrder(parseInt(e.target.value) || 1)}
                      className="block w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold outline-none focus:bg-white focus:border-[#F20530] transition-all text-center"
                      id="input-display-order"
                    />
                  </div>

                  {/* Projects Count (Simulated) */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      {dictionary.labelProjectsCount}
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formProjectsCount}
                      onChange={(e) => setFormProjectsCount(parseInt(e.target.value) || 0)}
                      className="block w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold outline-none focus:bg-white focus:border-[#F20530] transition-all text-center"
                      id="input-projects-count"
                    />
                  </div>

                  {/* Initial visibility status */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      {dictionary.labelStatus}
                    </label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as any)}
                      className="block w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:bg-white focus:border-[#F20530] transition-all cursor-pointer text-center"
                      id="input-status-select"
                    >
                      <option value="active">{dictionary.labelActive}</option>
                      <option value="hidden">{dictionary.labelHidden}</option>
                    </select>
                  </div>

                </div>

                {/* Buttons Cancel/Confirm */}
                <div className={`flex items-center justify-end gap-3 pt-4 border-t border-slate-100 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <button
                    type="button"
                    onClick={() => setIsEditorOpen(false)}
                    className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-extrabold transition-colors cursor-pointer"
                  >
                    {dictionary.btnCancel}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#F20530] hover:bg-rose-600 text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-lg shadow-rose-100 flex items-center gap-2"
                    id="btn-save-category-submit"
                  >
                    <FileCheck className="w-4 h-4" />
                    <span>{dictionary.btnConfirmSave}</span>
                  </button>
                </div>

              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION DIALOG */}
      <AnimatePresence>
        {isDeleteConfirmOpen && categoryToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setIsDeleteConfirmOpen(false)}
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-white rounded-[22px] border border-slate-200 p-6 space-y-6 shadow-2xl z-50 text-center"
              id="delete-confirmation-dialog"
            >
              <div className="w-14 h-14 rounded-2xl bg-rose-50 text-[#F20530] flex items-center justify-center mx-auto shadow-inner">
                <AlertTriangle className="w-6 h-6 animate-bounce" />
              </div>

              <div className="space-y-2">
                <h3 className="text-base font-extrabold text-slate-900">
                  {dictionary.deleteConfirmTitle}
                </h3>
                <p className="text-slate-800 text-xs font-extrabold">
                  {isRtl ? categoryToDelete.nameAr : categoryToDelete.nameEn} (/{categoryToDelete.slug})
                </p>
                <p className="text-slate-400 text-xs leading-relaxed font-semibold">
                  {dictionary.deleteConfirmDesc}
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsDeleteConfirmOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-extrabold transition-colors cursor-pointer"
                >
                  {dictionary.btnCancel}
                </button>
                <button
                  type="button"
                  onClick={handleDeleteCategory}
                  className="flex-1 py-2.5 bg-[#F20530] hover:bg-rose-600 text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-lg shadow-rose-100"
                  id="confirm-delete-action-btn"
                >
                  {dictionary.btnDelete}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
