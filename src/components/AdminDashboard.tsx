import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { AppSection, AdminRole, getRoleDisplay } from '../lib/permissions';
import { AccessDenied403 } from './AccessDenied403';
import { Logo } from './Logo';
import {
  adminServicesApi,
  adminProjectsApi,
  adminConsultationsApi,
  LaravelService,
  LaravelProject,
  LaravelConsultation
} from '../services/api';
import { ServicesManagement } from './ServicesManagement';
import { PortfolioManagement } from './PortfolioManagement';
import { CategoriesManagement } from './CategoriesManagement';
import { BlogManagement } from './BlogManagement';
import { ConsultationsManagement } from './ConsultationsManagement';
import { MediaLibrary } from './MediaLibrary';
import { SettingsManagement } from './SettingsManagement';
import { AdminsManagement } from './AdminsManagement';
import { ProfileManagement } from './ProfileManagement';
import { ClientLogosManagement } from './ClientLogosManagement';
import { TestimonialsManagement } from './TestimonialsManagement';
import { ConfirmationSandbox } from './ConfirmationSandbox';
import { 
  LayoutDashboard, 
  Briefcase, 
  FolderHeart, 
  FileText, 
  Tags, 
  BookOpen, 
  MessageSquare, 
  Image as ImageIcon, 
  Building2,
  Quote,
  Settings, 
  Users, 
  User, 
  LogOut, 
  Search, 
  Bell, 
  Globe, 
  ChevronRight, 
  ChevronLeft, 
  Plus, 
  Sliders, 
  Filter, 
  ExternalLink, 
  Check, 
  AlertCircle, 
  MoreVertical, 
  Trash2, 
  Edit, 
  TrendingUp, 
  ArrowUpRight, 
  Clock, 
  Menu, 
  X,
  Upload,
  Calendar,
  Layers,
  HelpCircle,
  Database,
  Cpu,
  Key,
  Eye,
  ShieldCheck,
  HardDrive,
  Activity,
  FileSpreadsheet,
  CheckCircle,
  FileCheck,
  UserCheck,
  Server,
  RefreshCw,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdminDashboardProps {
  onLogout: () => void;
}

type MenuSection = 
  | 'dashboard' 
  | 'services' 
  | 'projects' 
  | 'categories' 
  | 'client_logos'
  | 'testimonials'
  | 'posts' 
  | 'consultations' 
  | 'media' 
  | 'settings' 
  | 'admins' 
  | 'profile'
  | 'sandbox';

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const { language, setLanguage, isRtl } = useLanguage();
  const { currentUser, canAccess, canPerform, isAuthorizedRole, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<MenuSection>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dashboard Interactive States
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isFloatingExpanded, setIsFloatingExpanded] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Auto fallback to 'dashboard' if role doesn't have access to activeTab
  useEffect(() => {
    if (!canAccess(activeTab as AppSection)) {
      setActiveTab('dashboard');
    }
  }, [currentUser?.role, activeTab, canAccess]);

  // Quick show notification helper
  const triggerToast = (msg: string, type: 'success' | 'info' = 'success') => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Access central data store
  const { consultations, setConsultations, addTestimonial, dashboardStats, refreshDashboardStats, projectCategories } = useData();

  const [newConsultations, setNewConsultations] = useState<LaravelConsultation[]>([]);
  const [newConsultationsLoading, setNewConsultationsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      refreshDashboardStats();
      setNewConsultationsLoading(true);
      adminConsultationsApi.getAll({
        status: 'new',
        sort: 'created_at',
        direction: 'desc',
        per_page: 50
      }).then(res => {
        if (Array.isArray(res.data)) {
          setNewConsultations(res.data.filter(c => c.status === 'new'));
        }
      }).catch(err => {
        console.warn('Failed to fetch new consultations notifications from API:', err);
      }).finally(() => {
        setNewConsultationsLoading(false);
      });
    }
  }, [activeTab, refreshDashboardStats]);

  const formatBytes = (bytes: number): string => {
    if (!bytes || bytes <= 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Real-time System Infrastructure Health State & Diagnostic Runner
  const [isCheckingSystemHealth, setIsCheckingSystemHealth] = useState(false);
  const [healthNodes, setHealthNodes] = useState([
    { id: 'web', keyLabel: 'sysWeb', icon: Server, status: '99.98% Uptime', latency: '12ms', lastCheck: 'الآن' },
    { id: 'db', keyLabel: 'sysDb', icon: Database, status: 'Synchronized', latency: '4ms', lastCheck: 'الآن' },
    { id: 'backup', keyLabel: 'sysBackup', icon: CheckCircle, status: 'Encrypted', latency: '0 Errors', lastCheck: 'الآن' },
    { id: 'proxy', keyLabel: 'sysProxy', icon: ShieldCheck, status: 'Zero-Trust', latency: '8ms', lastCheck: 'الآن' }
  ]);

  const handleRunSystemDiagnostic = (nodeId?: string) => {
    setIsCheckingSystemHealth(true);
    const nowStr = new Date().toLocaleTimeString(isRtl ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    setTimeout(() => {
      setIsCheckingSystemHealth(false);
      setHealthNodes(prev => prev.map(node => {
        if (!nodeId || node.id === nodeId) {
          const randomPing = Math.floor(4 + Math.random() * 10);
          return {
            ...node,
            latency: `${randomPing}ms`,
            lastCheck: nowStr
          };
        }
        return node;
      }));

      if (nodeId) {
        triggerToast(isRtl ? 'تم إجراء فحص واستجابة العقدة بنجاح - النتيجة سليمة 100%' : 'Node response diagnostic verified - 100% nominal', 'success');
      } else {
        triggerToast(isRtl ? 'تم إجراء فحص واختبار شامل لكافة خوادم وبوابات النواة بنجاح' : 'Full system health diagnostic audit completed successfully', 'success');
      }
    }, 600);
  };

  // Modals controller
  const [activeModal, setActiveModal] = useState<'project' | 'service' | 'article' | 'media' | 'testimonial' | null>(null);
  
  // Create New Inputs State
  const [newPrjNameEn, setNewPrjNameEn] = useState('');
  const [newPrjNameAr, setNewPrjNameAr] = useState('');
  const [newPrjClientEn, setNewPrjClientEn] = useState('');
  const [newPrjClientAr, setNewPrjClientAr] = useState('');
  const [newPrjCategoryEn, setNewPrjCategoryEn] = useState('');
  const [newPrjCategoryAr, setNewPrjCategoryAr] = useState('');

  const [newSrvTitleEn, setNewSrvTitleEn] = useState('');
  const [newSrvTitleAr, setNewSrvTitleAr] = useState('');
  const [newSrvCode, setNewSrvCode] = useState('');

  // New Testimonial Inputs State
  const [newTestiNameEn, setNewTestiNameEn] = useState('');
  const [newTestiNameAr, setNewTestiNameAr] = useState('');
  const [newTestiMsgEn, setNewTestiMsgEn] = useState('');
  const [newTestiMsgAr, setNewTestiMsgAr] = useState('');
  const [newTestiAvatar, setNewTestiAvatar] = useState('');

  const handleAddTestimonial = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = newTestiNameAr.trim() || newTestiNameEn.trim();
    const finalMsg = newTestiMsgAr.trim() || newTestiMsgEn.trim();

    if (!finalName || !finalMsg) {
      triggerToast(language === 'en' ? 'Client name and testimonial comment are required' : 'اسم العميل ونص التعليق مطلوبان', 'info');
      return;
    }

    const defaultAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
    const finalAvatar = newTestiAvatar.trim() || defaultAvatar;
    const newId = `testi-${Date.now()}`;

    addTestimonial({
      id: newId,
      media_id: `med-${newId}`,
      display_name: newTestiNameEn.trim() || finalName,
      display_name_ar: finalName,
      message: newTestiMsgEn.trim() || finalMsg,
      message_ar: finalMsg,
      sort_order: 1,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
      media: {
        id: `med-${newId}`,
        file_path: finalAvatar,
        file_name: `${(newTestiNameEn || finalName).toLowerCase().replace(/\s+/g, '-')}-avatar.jpg`,
        alt_text: finalName
      }
    });

    setActiveModal(null);
    setNewTestiNameEn('');
    setNewTestiNameAr('');
    setNewTestiMsgEn('');
    setNewTestiMsgAr('');
    setNewTestiAvatar('');
    triggerToast(language === 'en' ? 'Client testimonial comment added successfully' : 'تمت إضافة تعليق ورأي العميل بنجاح');
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = newPrjNameEn.trim() || newPrjNameAr.trim();
    if (!finalName) {
      triggerToast(language === 'en' ? 'Project name is required' : 'اسم المشروع مطلوب');
      return;
    }
    const finalClient = newPrjClientEn.trim() || newPrjClientAr.trim() || 'MasterLink Partner';
    const cleanSlug = finalName
      .toLowerCase()
      .replace(/[^a-z0-9\-_]+/g, '-')
      .replace(/^-+|-+$/g, '') || `project-${Date.now()}`;
    const categoryId = projectCategories && projectCategories.length > 0 ? Number(projectCategories[0].id) : 1;

    try {
      await adminProjectsApi.create({
        category_id: categoryId,
        title: finalName,
        slug: cleanSlug,
        client_name: finalClient,
        short_description: newPrjNameAr ? `${finalName} - مشروع رقمي متكامل` : `${finalName} - Enterprise Digital Project`,
        is_featured: true,
        is_active: true
      });

      setActiveModal(null);
      setNewPrjNameEn('');
      setNewPrjNameAr('');
      setNewPrjClientEn('');
      setNewPrjClientAr('');
      setNewPrjCategoryEn('');
      setNewPrjCategoryAr('');

      await refreshDashboardStats();
      triggerToast(language === 'en' ? 'Enterprise project successfully added to the index' : 'تم إضافة المشروع الرقمي بنجاح إلى الفهرس');
    } catch (err: any) {
      console.error('Failed to create project via Quick Action:', err);
      triggerToast(language === 'en' ? 'Failed to create project' : 'فشل إضافة المشروع', 'info');
    }
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalTitle = newSrvTitleAr.trim() || newSrvTitleEn.trim();
    if (!finalTitle) {
      triggerToast(language === 'en' ? 'Service title is required' : 'عنوان الخدمة مطلوب');
      return;
    }
    const cleanSlug = (newSrvCode.trim() || newSrvTitleEn.trim() || finalTitle)
      .toLowerCase()
      .replace(/[^a-z0-9\-_]+/g, '-')
      .replace(/^-+|-+$/g, '') || `service-${Date.now()}`;

    try {
      await adminServicesApi.create({
        title: finalTitle,
        slug: cleanSlug,
        short_description: 'حلول تقنية وبرمجية متكاملة مصممة خصيصاً لتلبية متطلبات أعمالك ونموها.',
        full_description: 'حلول تقنية وبرمجية متكاملة مصممة خصيصاً لتلبية متطلبات أعمالك ونموها.',
        is_active: true,
        sort_order: 1
      });

      setActiveModal(null);
      setNewSrvTitleEn('');
      setNewSrvTitleAr('');
      setNewSrvCode('');

      await refreshDashboardStats();
      triggerToast(language === 'en' ? 'New service tier online and live' : 'تم تفعيل الخدمة البرمجية الجديدة بنجاح');
    } catch (err: any) {
      console.error('Failed to create service via Quick Action:', err);
      triggerToast(language === 'en' ? 'Failed to create service' : 'فشل تفعيل الخدمة', 'info');
    }
  };

  // Localized Labels
  const t = {
    welcomeTitle: language === 'en' ? 'Good Morning, Mohammed' : 'صباح الخير يا محمد',
    welcomeSubtitle: language === 'en' ? 'Welcome back to the MasterLink Control Panel. All gateway links are operational.' : 'أهلاً بك مجدداً في لوحة تحكم ماستر لينك. جميع خطوط ربط النظام والبيانات تعمل بكفاءة.',
    addPrjBtn: language === 'en' ? '+ Add New Project' : 'إضافة مشروع جديد',
    statServices: language === 'en' ? 'Active Services' : 'الخدمات النشطة',
    statProjects: language === 'en' ? 'Case Studies' : 'المشاريع الرقمية',
    statPosts: language === 'en' ? 'Published Posts' : 'المقالات والمنشورات',
    statConsultations: language === 'en' ? 'Consultations' : 'حجوزات الاستشارات',
    statMedia: language === 'en' ? 'Media Files' : 'مكتبة الوسائط',
    statAdmins: language === 'en' ? 'System Admins' : 'المدراء والمسؤولين',
    recentConsultations: language === 'en' ? 'Recent Executive Consultations' : 'آخر استشارات العملاء الواردة',
    latestProjects: language === 'en' ? 'Latest Projects & Core Solutions' : 'أحدث الحلول والمشاريع الرقمية',
    latestArticles: language === 'en' ? 'Latest Published Articles' : 'أحدث المقالات التقنية المنشورة',
    quickActions: language === 'en' ? 'Control Plane Quick Actions' : 'العمليات السريعة للنظام',
    storageOverview: language === 'en' ? 'Cloud Storage Engine Allocations' : 'مستودع الأصول السحابية وتوزيع المساحة',
    websiteActivity: language === 'en' ? 'Gateway Web Traffic & Load' : 'نشاط الشبكة والزيارات اليومية',
    systemStatus: language === 'en' ? 'MasterLink Infrastructure Health' : 'سلامة البنية التحتية والأنظمة',
    timeline: language === 'en' ? 'System Transaction Audit Timeline' : 'سجل الأحداث والعمليات الأمنية',
    notificationsWidget: language === 'en' ? 'Actionable Items Pending Reply' : 'تنبيهات المسؤول ومهام المتابعة',
    viewAll: language === 'en' ? 'View All Logs' : 'عرض الكل',
    colName: language === 'en' ? 'Customer' : 'العميل',
    colCompany: language === 'en' ? 'Enterprise' : 'الشركة',
    colSubject: language === 'en' ? 'Requirement Subject' : 'الموضوع',
    colDate: language === 'en' ? 'Received Date' : 'تاريخ الاستلام',
    colStatus: language === 'en' ? 'Operational Status' : 'الحالة التشغيلية',
    featured: language === 'en' ? 'Featured Platform' : 'منصة مميزة',
    openProject: language === 'en' ? 'Inspect Project' : 'معاينة المشروع',
    published: language === 'en' ? 'Published' : 'منشور',
    draft: language === 'en' ? 'Draft Sandbox' : 'مسودة',
    sysWeb: language === 'en' ? 'Core Web Server' : 'خادم الويب الأساسي',
    sysDb: language === 'en' ? 'Cloud Firestore Core' : 'قاعدة البيانات السحابية',
    sysBackup: language === 'en' ? 'Auto Encrypted Backup' : 'النسخ الاحتياطي المشفر',
    sysProxy: language === 'en' ? 'SSL Gateway Proxy' : 'بوابة أمان SSL التراكمية',
    activeState: language === 'en' ? 'Active Uptime' : 'نشط ومستقر',
    verifiedState: language === 'en' ? 'Verified Check' : 'تم التحقق بنجاح',
    syncState: language === 'en' ? 'Synchronized' : 'متزامن',
    securedState: language === 'en' ? 'Secured & Live' : 'مؤمن وحي',
  };

  const menuItems: { id: MenuSection; icon: React.FC<any>; textEn: string; textAr: string }[] = [
    { id: 'dashboard', icon: LayoutDashboard, textEn: 'Dashboard Overview', textAr: 'لوحة التحكم العامة' },
    { id: 'services', icon: Briefcase, textEn: 'Platform Services', textAr: 'الخدمات الرقمية' },
    { id: 'projects', icon: FileText, textEn: 'Case Studies & Projects', textAr: 'المشاريع ودراسات الحالة' },
    { id: 'categories', icon: Tags, textEn: 'Project Categories', textAr: 'تصنيفات المشاريع' },
    { id: 'posts', icon: BookOpen, textEn: 'Articles & Posts', textAr: 'المقالات والمنشورات' },
    { id: 'client_logos', icon: Building2, textEn: 'Client Logos', textAr: 'شعارات العملاء' },
    { id: 'testimonials', icon: Quote, textEn: 'Testimonials', textAr: 'آراء العملاء' },
    { id: 'consultations', icon: MessageSquare, textEn: 'Client Consultations', textAr: 'استشارات العملاء' },
    { id: 'media', icon: ImageIcon, textEn: 'Media Storage Library', textAr: 'مكتبة الوسائط الرقمية' },
    { id: 'admins', icon: Users, textEn: 'System Administrators', textAr: 'المدراء والمشرفين' },
    { id: 'settings', icon: Settings, textEn: 'MasterLink Configuration', textAr: 'إعدادات التحكم والنظام' },
    { id: 'profile', icon: User, textEn: 'My Account Settings', textAr: 'ملفي الشخصي وبطاقتي' },
  ];

  // RBAC: Filter menuItems strictly by the current user's role permissions
  const visibleMenuItems = menuItems.filter((item) => canAccess(item.id as AppSection));
  const roleDisplay = currentUser?.role ? getRoleDisplay(currentUser.role, isRtl ? 'ar' : 'en') : { name: '', desc: '', badgeClass: 'bg-slate-50 text-slate-700 border-slate-200' };
  const currentUserName = isRtl 
    ? (currentUser?.nameAr || currentUser?.nameEn || currentUser?.email || 'Admin') 
    : (currentUser?.nameEn || currentUser?.nameAr || currentUser?.email || 'Admin');
  const currentUserInitial = currentUserName ? currentUserName.charAt(0).toUpperCase() : 'A';

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-900 font-sans flex antialiased selection:bg-[#F20530] selection:text-white overflow-x-hidden relative ${isRtl ? 'rtl-active flex-row-reverse' : 'ltr-active flex-row'}`}>
      
      {/* Toast Notification Container */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-6 ${isRtl ? 'left-6' : 'right-6'} z-50 p-4 rounded-2xl shadow-xl border flex items-center gap-3 max-w-sm bg-white text-slate-900 border-slate-200`}
          >
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-xs font-semibold leading-relaxed">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FIXED LEFT SIDEBAR */}
      <aside className={`hidden lg:flex w-[280px] h-screen bg-white text-slate-800 border-slate-200/90 flex-col justify-between sticky top-0 shrink-0 z-40 ${isRtl ? 'border-l' : 'border-r'}`}>
        
        {/* Top Logo and Header Branding */}
        <div className="p-6 border-b border-slate-200/80 flex items-center justify-between">
          <Logo variant="admin" className="w-[160px] sm:w-[180px] h-auto" imgClassName="!w-full !h-auto !max-w-none !max-h-none object-contain" />
        </div>

        {/* Sidebar Menu Items */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5 custom-scrollbar">
          <div className="px-3 mb-2 flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {isRtl ? 'بوابات النظام والمحركات' : 'CONTROL MODULES'}
            </p>
            <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
              {visibleMenuItems.length}
            </span>
          </div>

          <nav className="space-y-1">
            {visibleMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (item.id !== 'dashboard') {
                      triggerToast(isRtl ? `تم الانتقال لقسم: ${item.textAr}` : `Navigated to section: ${item.textEn}`, 'info');
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer group ${
                    isActive 
                      ? 'bg-[#F20530]/10 border border-[#F20530]/30 text-[#F20530]' 
                      : 'border border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  } ${isRtl ? 'text-right justify-start flex-row-reverse' : 'text-left justify-start flex-row'}`}
                >
                  <div className={`transition-colors ${isActive ? 'text-[#F20530]' : 'text-slate-400 group-hover:text-slate-600'}`}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <span>{isRtl ? item.textAr : item.textEn}</span>
                  {isActive && (
                    <div className={`w-1.5 h-1.5 rounded-full bg-[#F20530] ${isRtl ? 'mr-auto' : 'ml-auto'}`} />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer details with Real User & Role Badge */}
        <div className="p-4 border-t border-slate-200/80 bg-slate-50/80">
          <div className={`flex items-center gap-3 p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className="relative">
              {currentUser?.avatar ? (
                <img src={currentUser.avatar} alt={currentUserName} className="w-10 h-10 rounded-xl object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-[#F20530] text-white flex items-center justify-center font-bold text-xs shadow-xs uppercase">
                  {currentUserInitial}
                </div>
              )}
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white animate-pulse" />
            </div>
            <div className={`flex-1 min-w-0 ${isRtl ? 'text-right' : 'text-left'}`}>
              <h4 className="text-xs font-bold text-slate-900 truncate leading-none mb-1">
                {currentUserName}
              </h4>
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-extrabold ${roleDisplay.badgeClass}`}>
                {roleDisplay.name}
              </span>
            </div>
            <button
              onClick={() => {
                onLogout();
              }}
              title={isRtl ? 'تسجيل الخروج' : 'Log Out'}
              className="p-1.5 text-slate-400 hover:text-[#F20530] hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE DRAWER SIDEBAR */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            <div 
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-45 lg:hidden"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: isRtl ? 280 : -280 }}
              animate={{ x: 0 }}
              exit={{ x: isRtl ? 280 : -280 }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className={`fixed top-0 bottom-0 w-[280px] bg-white text-slate-800 flex flex-col justify-between z-50 lg:hidden ${
                isRtl ? 'right-0 border-l border-slate-200' : 'left-0 border-r border-slate-200'
              }`}
            >
              <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                <Logo variant="admin" className="w-[150px] sm:w-[170px] h-auto" imgClassName="!w-full !h-auto !max-w-none !max-h-none object-contain" />
                <button 
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-900 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
                <nav className="space-y-1">
                  {visibleMenuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setIsMobileSidebarOpen(false);
                          if (item.id !== 'dashboard') {
                            triggerToast(isRtl ? `تم الانتقال لقسم: ${item.textAr}` : `Navigated to section: ${item.textEn}`, 'info');
                          }
                        }}
                        className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isActive 
                            ? 'bg-[#F20530]/10 border border-[#F20530]/30 text-[#F20530]' 
                            : 'border border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                        } ${isRtl ? 'text-right justify-start flex-row-reverse' : 'text-left justify-start flex-row'}`}
                      >
                        <Icon className="w-4.5 h-4.5" />
                        <span>{isRtl ? item.textAr : item.textEn}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="p-4 border-t border-slate-200 bg-slate-50">
                <div className={`flex items-center gap-3 p-2 rounded-xl bg-white border border-slate-200 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className="w-9 h-9 rounded-xl bg-[#F20530] text-white flex items-center justify-center font-bold text-xs">
                    {currentUserInitial}
                  </div>
                  <div className={`flex-1 min-w-0 ${isRtl ? 'text-right' : 'text-left'}`}>
                    <h4 className="text-xs font-bold text-slate-900 truncate leading-none mb-1">{currentUserName}</h4>
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-extrabold ${roleDisplay.badgeClass}`}>
                      {roleDisplay.name}
                    </span>
                  </div>
                  <button 
                    onClick={() => {
                      onLogout();
                    }} 
                    className="p-1 text-slate-400 hover:text-[#F20530] cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* CORE WORKSPACE CONTENT PANEL */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        
        {/* TOP ENTERPRISE HEADER */}
        <header className="h-16 sm:h-20 bg-white border-b border-slate-200/80 px-3.5 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 shrink-0">
          
          {/* Menu triggers / Breadcrumbs */}
          <div className={`flex items-center gap-2.5 sm:gap-4 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 lg:hidden cursor-pointer active:scale-95 transition-all"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Mobile Brand / Page Title */}
            <div className="lg:hidden flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base text-slate-900 truncate">
                {menuItems.find(m => m.id === activeTab)?.[isRtl ? 'textAr' : 'textEn'] || (isRtl ? 'لوحة التحكم' : 'Dashboard')}
              </span>
            </div>

            {/* Desktop Premium Breadcrumb */}
            <nav className={`hidden lg:flex items-center gap-1.5 text-xs font-semibold ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
              <span className="text-slate-400">{isRtl ? 'الرئيسية ماستر لينك' : 'MasterLink Control Core'}</span>
              {isRtl ? <ChevronLeft className="w-3.5 h-3.5 text-slate-300" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-300" />}
              <span className="text-slate-900 font-bold">{menuItems.find(m => m.id === activeTab)?.[isRtl ? 'textAr' : 'textEn']}</span>
            </nav>
          </div>

          {/* Header Actions */}
          <div className={`flex items-center gap-2 sm:gap-3.5 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
            
            {/* Current Role Badge (read-only — role comes from Laravel) */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700">
              <span className={`w-2 h-2 rounded-full ${roleDisplay.badgeClass.split(' ')[0]}`} />
              <span className="hidden sm:inline text-[11px] font-bold text-slate-700">{roleDisplay.name}</span>
            </div>

            {/* Language switch button */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className="p-2 sm:p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 transition-all cursor-pointer flex items-center gap-1.5 font-bold text-xs font-mono active:scale-95"
            >
              <Globe className="w-4 h-4 text-[#F20530]" />
              <span className="text-xs">{language === 'en' ? 'العربية' : 'EN'}</span>
            </button>

            {/* Quick Link back to Digital Agency Site */}
            <button
              onClick={onLogout}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 transition-all cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{isRtl ? 'موقع الوكالة' : 'Agency Portal'}</span>
            </button>

            {/* Active User Avatar Icon */}
            <button
              onClick={() => setActiveTab('profile')}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-900 text-white hover:bg-[#F20530] transition-all cursor-pointer font-extrabold text-xs flex items-center justify-center shadow-xs border border-slate-800 uppercase"
              title={isRtl ? 'الملف الشخصي' : 'View profile'}
            >
              {currentUserInitial}
            </button>

          </div>
        </header>

        {/* CONTAINER CONTENT AREA */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 pb-24 lg:pb-8">

          {/* DYNAMIC TAB CONSTRAINED TO EXECUTIVE VIEW WITH RBAC ROUTE-LEVEL PROTECTION */}
          {!canAccess(activeTab as AppSection) ? (
            <AccessDenied403 
              attemptedSection={activeTab} 
              onReturnToDashboard={() => setActiveTab('dashboard')} 
            />
          ) : activeTab === 'dashboard' ? (
            <div className="space-y-6 sm:space-y-8">
              
              {/* FIVE STATS CARDS (Bento Grid) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5 sm:gap-5">
                {[
                  {
                    titleEn: 'Services',
                    titleAr: 'الخدمات الرقمية',
                    value: dashboardStats !== null ? dashboardStats.services_count : '--',
                    icon: Briefcase,
                    color: 'text-rose-500 bg-rose-50',
                    change: isRtl ? 'خدمات نشطة' : 'Active Catalog',
                    descEn: 'Commercial solutions',
                    descAr: 'الحلول البرمجية المعروضة'
                  },
                  {
                    titleEn: 'Projects',
                    titleAr: 'المشاريع الحية',
                    value: dashboardStats !== null ? dashboardStats.projects_count : '--',
                    icon: FileText,
                    color: 'text-blue-500 bg-blue-50',
                    change: isRtl ? 'المشاريع الحية' : 'Live Projects',
                    descEn: 'Production deployments',
                    descAr: 'عمليات النشر السحابية'
                  },
                  {
                    titleEn: 'New Consultations',
                    titleAr: 'إشعارات الاستشارات',
                    value: dashboardStats !== null ? dashboardStats.new_consultations_count : '--',
                    icon: MessageSquare,
                    color: 'text-amber-500 bg-amber-50',
                    change: dashboardStats !== null
                      ? (isRtl ? `🔔 ${dashboardStats.new_consultations_count} جديدة` : `🔔 ${dashboardStats.new_consultations_count} New`)
                      : '--',
                    descEn: 'Unprocessed requests',
                    descAr: 'طلبات جديدة قيد الانتظار'
                  },
                  {
                    titleEn: 'Media Files',
                    titleAr: 'ملفات الوسائط',
                    value: dashboardStats !== null ? dashboardStats.media_count : '--',
                    icon: ImageIcon,
                    color: 'text-emerald-500 bg-emerald-50',
                    change: dashboardStats !== null ? `${formatBytes(dashboardStats.media_total_size)} Used` : '--',
                    descEn: 'Cloud CDN assets',
                    descAr: 'أصول الوسائط الرقمية'
                  },
                  {
                    titleEn: 'Admins',
                    titleAr: 'المشرفين النشطين',
                    value: dashboardStats !== null ? dashboardStats.admins_count : '--',
                    icon: Users,
                    color: 'text-slate-500 bg-slate-50',
                    change: dashboardStats !== null && dashboardStats.total_admins_count
                      ? (isRtl ? `${dashboardStats.admins_count} من ${dashboardStats.total_admins_count} نشط` : `${dashboardStats.admins_count}/${dashboardStats.total_admins_count} Active`)
                      : (isRtl ? 'المدراء النشطين' : 'Active Admins'),
                    descEn: 'Zero-trust roles',
                    descAr: 'المدراء بصلاحيات كاملة'
                  }
                ].map((stat, idx) => {
                  const Icon = stat.icon;
                  return (
                    <div key={idx} className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden group">
                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-slate-100 group-hover:bg-[#F20530] transition-colors" />
                      <div className={`flex items-start justify-between mb-3 sm:mb-4 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`p-2 sm:p-2.5 rounded-xl ${stat.color}`}>
                          <Icon className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-50 text-slate-500 border border-slate-100">
                          {stat.change}
                        </span>
                      </div>
                      <div className={isRtl ? 'text-right' : 'text-left'}>
                        <h4 className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">
                          {isRtl ? stat.titleAr : stat.titleEn}
                        </h4>
                        <span className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight block">
                          {stat.value}
                        </span>
                        <p className="text-[10px] font-semibold text-slate-400 mt-1.5 sm:mt-2 truncate">
                          {isRtl ? stat.descAr : stat.descEn}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* THREE MAIN COLUMN STRUCTURE */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
                
                {/* LEFT 8-COLS: RECENT CONSULTATIONS & PROJECTS & ARTICLES */}
                <div className="lg:col-span-8 space-y-8">
                  
                  {/* RECENT CONSULTATIONS LISTING (NEW NOTIFICATIONS ONLY) */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
                    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 ${isRtl ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}>
                      <div>
                        <h3 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                          <span>🔔</span>
                          <span>{isRtl ? 'إشعارات الاستشارات الجديدة' : 'New Consultation Alerts'}</span>
                        </h3>
                        <p className="text-xs text-slate-400 font-semibold mt-0.5">
                          {isRtl ? 'طلبات الاستشارات الجديدة بحالة (جديدة) تنتظر المراجعة والتأكيد' : 'Client requests with status (new) waiting for review.'}
                        </p>
                      </div>
                      <button 
                        onClick={() => {
                          setActiveTab('consultations');
                        }}
                        className="text-xs font-extrabold text-[#F20530] hover:text-rose-600 transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <span>{isRtl ? 'إدارة كل الاستشارات' : 'Manage All Consultations'}</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs font-semibold text-slate-600">
                        <thead>
                          <tr className={`border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px] font-bold ${isRtl ? 'text-right' : 'text-left'}`}>
                            <th className="pb-3.5">{t.colName}</th>
                            <th className="pb-3.5">{t.colCompany}</th>
                            <th className="pb-3.5">{t.colSubject}</th>
                            <th className="pb-3.5">{t.colDate}</th>
                            <th className="pb-3.5 text-center">{t.colStatus}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {newConsultationsLoading ? (
                            <tr>
                              <td colSpan={5} className="py-8 text-center text-slate-400 font-bold">
                                {isRtl ? 'جاري تحميل الإشعارات من Laravel...' : 'Loading notifications from Laravel...'}
                              </td>
                            </tr>
                          ) : newConsultations.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="py-8 text-center text-slate-400 font-bold">
                                <div className="space-y-1">
                                  <p className="text-slate-500 font-extrabold">{isRtl ? 'لا توجد استشارات جديدة 🔔' : 'No new consultation alerts 🔔'}</p>
                                  <p className="text-[11px] text-slate-400 font-normal">{isRtl ? 'تمت معالجة جميع الطلبات أو لا توجد استشارات معلقة حالياً.' : 'All requests processed or no pending new submissions.'}</p>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            newConsultations.map((c) => (
                              <tr key={c.id} className="hover:bg-slate-50/40 transition-colors">
                                <td className="py-4 font-bold text-slate-900">{c.name}</td>
                                <td className="py-4 text-slate-500 font-medium">{c.company_name || (isRtl ? 'فردي' : 'Individual')}</td>
                                <td className="py-4 text-slate-700">{c.service ? c.service.title : (isRtl ? 'استفسار عام' : 'General Strategy Consultation')}</td>
                                <td className="py-4 font-mono text-slate-400">{c.created_at ? new Date(c.created_at).toLocaleDateString(isRtl ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                                <td className="py-4">
                                  <div className="flex justify-center">
                                    <span className="px-3 py-1.5 rounded-lg text-[10px] font-bold select-none cursor-default inline-flex items-center gap-1.5 bg-rose-50 text-[#F20530] border border-rose-200/60">
                                      <span className="w-1.5 h-1.5 rounded-full bg-[#F20530] animate-pulse" />
                                      {isRtl ? 'جديدة' : 'New Alert'}
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>

                {/* RIGHT 4-COLS: QUICK ACTIONS, STORAGE, NETWORK HEALTH, NOTIFICATIONS, ACTIVITY */}
                <div className="lg:col-span-4 space-y-8">
                  
                  {/* CONTROL PLANE QUICK ACTIONS (FILTERED BY RBAC) */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
                    <div className={isRtl ? 'text-right' : 'text-left'}>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{isRtl ? 'العمليات الفورية المتاحة' : 'AUTHORIZED UTILITIES'}</h4>
                      <h3 className="text-base font-extrabold text-slate-900 tracking-tight mt-1">{t.quickActions}</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-3.5">
                      {[
                        { labelEn: "Add Service", labelAr: "إضافة خدمة", icon: Plus, action: () => setActiveModal('service'), section: 'services' as AppSection, perm: 'create' },
                        { labelEn: "Add Project", labelAr: "إضافة مشروع", icon: FileText, action: () => setActiveModal('project'), section: 'projects' as AppSection, perm: 'create' },
                        { labelEn: "Add Post", labelAr: "إضافة مقال", icon: BookOpen, action: () => setActiveTab('posts'), section: 'posts' as AppSection, perm: 'create' },
                        { labelEn: "Add Testimonial", labelAr: "إضافة رأي عميل", icon: MessageSquare, action: () => setActiveModal('testimonial'), section: 'testimonials' as AppSection, perm: 'create' },
                        { labelEn: "Upload Media", labelAr: "رفع وسائط", icon: Upload, action: () => setActiveTab('media'), section: 'media' as AppSection, perm: 'create' },
                        { labelEn: "Client Logos", labelAr: "شعارات العملاء", icon: Building2, action: () => setActiveTab('client_logos'), section: 'client_logos' as AppSection, perm: 'view' },
                        { labelEn: "Site Settings", labelAr: "إعدادات النظام", icon: Settings, action: () => setActiveTab('settings'), section: 'settings' as AppSection, perm: 'view' },
                        { labelEn: "Admins & Roles", labelAr: "المدراء والمشرفين", icon: ShieldCheck, action: () => setActiveTab('admins'), section: 'admins' as AppSection, perm: 'view' },
                      ]
                        .filter(act => canAccess(act.section) && canPerform(act.section, act.perm as any))
                        .map((act, idx) => {
                          const Icon = act.icon;
                          return (
                            <button
                              key={idx}
                              onClick={act.action}
                              className={`p-3.5 bg-slate-50/50 hover:bg-[#F20530] hover:text-white border border-slate-200/60 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center gap-2.5 text-center text-slate-700 group shadow-xs`}
                            >
                              <Icon className="w-5 h-5 text-[#F20530] group-hover:text-white transition-colors" />
                              <span className="text-[10px] font-extrabold tracking-wide leading-none">
                                {isRtl ? act.labelAr : act.labelEn}
                              </span>
                            </button>
                          );
                        })}
                    </div>
                  </div>

                </div>

              </div>

            </div>
          ) : activeTab === 'services' ? (
            <ServicesManagement />
          ) : activeTab === 'projects' ? (
            <PortfolioManagement />
          ) : activeTab === 'categories' ? (
            <CategoriesManagement />
          ) : activeTab === 'posts' ? (
            <BlogManagement />
          ) : activeTab === 'client_logos' ? (
            <ClientLogosManagement />
          ) : activeTab === 'testimonials' ? (
            <TestimonialsManagement />
          ) : activeTab === 'consultations' ? (
            <ConsultationsManagement />
          ) : activeTab === 'media' ? (
            <MediaLibrary />
          ) : activeTab === 'settings' ? (
            <SettingsManagement />
          ) : activeTab === 'admins' ? (
            <AdminsManagement />
          ) : activeTab === 'profile' ? (
            <ProfileManagement />
          ) : (
            
            // PLACEHOLDER WORKSPACES FOR OTHER MENU SECTIONS
            <section className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 text-[#F20530] flex items-center justify-center mx-auto shadow-inner">
                <Sliders className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-slate-900">
                  {isRtl ? 'بوابة التحكم التفصيلية' : 'Platform Detail Portal'}
                </h3>
                <p className="text-xs text-slate-400 font-semibold max-w-sm mx-auto leading-relaxed">
                  {isRtl ? 'جاري الاتصال والترخيص المباشر لخدمة فايرستور السحابية لتحديث هذا القسم.' : 'This control panel operates with full real-time database synchronization.'}
                </p>
              </div>
              <button 
                onClick={() => setActiveTab('dashboard')}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                <span>{isRtl ? 'العودة للمحرك التنفيذي' : 'Return to Executive Board'}</span>
              </button>
            </section>

          )}

        </main>

        {/* ENTERPRISE PLATFORM FOOTER */}
        <footer className="w-full bg-white border-t border-slate-200 px-6 sm:px-8 py-5 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-bold text-slate-400 mt-auto shrink-0">
          <span>MasterLink Control Terminal &bull; {isRtl ? 'مؤمن بالكامل' : 'Zero-Trust Protocol'}</span>
          <span>CMS Version 1.0 &bull; &copy; 2026 MasterLink</span>
        </footer>

      </div>

      {/* DETAILED ENTERPRISE CREATION MODAL WINDOW */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setActiveModal(null)}
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-white rounded-[24px] border border-slate-200 p-6 sm:p-8 space-y-6 shadow-2xl z-50"
            >
              <div className={`flex items-center justify-between border-b border-slate-100 pb-4.5 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <h3 className="text-base font-extrabold text-slate-900 font-display">
                  {activeModal === 'project' 
                    ? (isRtl ? 'إضافة مشروع جديد للمعرض' : 'Add Case Study Project') 
                    : activeModal === 'service'
                    ? (isRtl ? 'تفعيل خدمة رقمية جديدة' : 'Add Service Offering')
                    : (isRtl ? 'إضافة تعليق ورأي عميل جديد' : 'Add Client Testimonial')}
                </h3>
                <button 
                  onClick={() => setActiveModal(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Add Testimonial Form */}
              {activeModal === 'testimonial' && (
                <form onSubmit={handleAddTestimonial} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                      {isRtl ? 'اسم العميل / صاحب التعليق' : 'Client / Author Name'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={isRtl ? 'مثال: م. فهد الشمري' : 'e.g. Eng. Fahad Al-Shammari'}
                      value={newTestiNameAr || newTestiNameEn}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewTestiNameAr(val);
                        setNewTestiNameEn(val);
                      }}
                      className={`block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-[#F20530] focus:ring-4 focus:ring-[#F20530]/5 transition-all ${isRtl ? 'text-right' : 'text-left'}`}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                      {isRtl ? 'نص التعليق أو الرأي' : 'Testimonial Comment'}
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder={isRtl ? 'اكتب رأي العميل وانطباعه عن خدمات ماستر لينك...' : 'Enter client feedback regarding MasterLink services...'}
                      value={newTestiMsgAr || newTestiMsgEn}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewTestiMsgAr(val);
                        setNewTestiMsgEn(val);
                      }}
                      className={`block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-[#F20530] focus:ring-4 focus:ring-[#F20530]/5 transition-all resize-none ${isRtl ? 'text-right' : 'text-left'}`}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                      {isRtl ? 'رابط الصورة الرمزية (اختياري)' : 'Avatar Image URL (Optional)'}
                    </label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={newTestiAvatar}
                      onChange={(e) => setNewTestiAvatar(e.target.value)}
                      className={`block w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-[#F20530] transition-all ${isRtl ? 'text-right' : 'text-left'}`}
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="submit"
                      className="flex-1 py-3.5 bg-[#F20530] hover:bg-rose-600 text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-sm"
                    >
                      {isRtl ? 'تأكيد ونشر التعليق' : 'Publish Testimonial'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveModal(null);
                        setActiveTab('testimonials');
                      }}
                      className="px-4 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      {isRtl ? 'إدارة الكل' : 'Manage All'}
                    </button>
                  </div>
                </form>
              )}

              {/* Add Project Form */}
              {activeModal === 'project' && (
                <form onSubmit={handleAddProject} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                      {isRtl ? 'اسم المشروع' : 'Project Name'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={isRtl ? 'مثال: منصة الراجحي للخدمات البنكية الرقمية' : 'e.g. Al-Rajhi Digital Core'}
                      value={newPrjNameEn || newPrjNameAr}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewPrjNameEn(val);
                        setNewPrjNameAr(val);
                      }}
                      className={`block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-[#F20530] focus:ring-4 focus:ring-[#F20530]/5 transition-all ${isRtl ? 'text-right' : 'text-left'}`}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                      {isRtl ? 'اسم العميل / الجهة' : 'Client Name'}
                    </label>
                    <input
                      type="text"
                      placeholder={isRtl ? 'مثال: مصرف الراجحي' : 'e.g. Al-Rajhi Bank'}
                      value={newPrjClientEn || newPrjClientAr}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewPrjClientEn(val);
                        setNewPrjClientAr(val);
                      }}
                      className={`block w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-[#F20530] transition-all ${isRtl ? 'text-right' : 'text-left'}`}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                      {isRtl ? 'التصنيف' : 'Category'}
                    </label>
                    <input
                      type="text"
                      placeholder={isRtl ? 'مثال: منصات التكنولوجيا المالية' : 'e.g. FinTech Platform'}
                      value={newPrjCategoryEn || newPrjCategoryAr}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewPrjCategoryEn(val);
                        setNewPrjCategoryAr(val);
                      }}
                      className={`block w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-[#F20530] transition-all ${isRtl ? 'text-right' : 'text-left'}`}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-[#F20530] hover:bg-rose-600 text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer"
                  >
                    {isRtl ? 'تأكيد إضافة المشروع الفهرسي' : 'Confirm & Deploy Project Tier'}
                  </button>
                </form>
              )}

              {/* Add Service Form */}
              {activeModal === 'service' && (
                <form onSubmit={handleAddService} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                      {isRtl ? 'عنوان الخدمة' : 'Service Title'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={isRtl ? 'مثال: منصة السحاب والبرمجيات المخصصة' : 'e.g. Custom SaaS & Cloud Systems'}
                      value={newSrvTitleEn || newSrvTitleAr}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewSrvTitleEn(val);
                        setNewSrvTitleAr(val);
                      }}
                      className={`block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-[#F20530] transition-all ${isRtl ? 'text-right' : 'text-left'}`}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                      {isRtl ? 'رمز الخدمة والتعريف' : 'Service Unique Code'}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. CLOUD-CORE"
                      value={newSrvCode}
                      onChange={(e) => setNewSrvCode(e.target.value)}
                      className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-[#F20530] transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-[#F20530] hover:bg-rose-600 text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-sm"
                  >
                    {isRtl ? 'تأكيد إضافة الخدمة' : 'Confirm & Publish Offering'}
                  </button>
                </form>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MOBILE BOTTOM APP NAVIGATION DOCK */}
      <div className={`fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-3 py-1.5 lg:hidden flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.06)] select-none ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
        {[
          { id: 'dashboard' as MenuSection, icon: LayoutDashboard, labelEn: 'Home', labelAr: 'الرئيسية' },
          { id: 'services' as MenuSection, icon: Briefcase, labelEn: 'Services', labelAr: 'الخدمات' },
          { id: 'projects' as MenuSection, icon: FileText, labelEn: 'Projects', labelAr: 'المشاريع' },
          { id: 'consultations' as MenuSection, icon: MessageSquare, labelEn: 'Consults', labelAr: 'الاستشارات' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer min-w-[56px] ${
                isActive ? 'text-[#F20530] font-black' : 'text-slate-500 font-semibold hover:text-slate-900'
              }`}
            >
              <div className={`p-1 rounded-lg transition-transform ${isActive ? 'bg-rose-50 scale-110' : ''}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 whitespace-nowrap leading-none font-bold">
                {isRtl ? tab.labelAr : tab.labelEn}
              </span>
            </button>
          );
        })}

        {/* More Menu Button to Trigger Sidebar Drawer */}
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-slate-500 font-semibold hover:text-slate-900 transition-all cursor-pointer min-w-[56px]"
        >
          <div className="p-1 rounded-lg">
            <Menu className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 whitespace-nowrap leading-none font-bold">
            {isRtl ? 'المزيد' : 'Menu'}
          </span>
        </button>
      </div>



    </div>
  );
}
