import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  Bell, 
  X, 
  Search, 
  Trash2, 
  CheckCheck, 
  Sparkles, 
  ShieldAlert, 
  Calendar, 
  Cpu, 
  Briefcase, 
  User, 
  TrendingUp, 
  Filter, 
  Eye, 
  EyeOff, 
  Mail, 
  ArrowRight, 
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  PlusCircle,
  Clock,
  Terminal,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Notification } from '../types';

// Storage key constant
const NOTIFICATIONS_STORAGE_KEY = 'masterlink_notifications';

// Helper to trigger custom state updates across components
export const triggerNotificationsUpdate = () => {
  window.dispatchEvent(new CustomEvent('masterlink_notifications_changed'));
};

// Default seed notifications
const DEFAULT_NOTIFICATIONS: Notification[] = [
  {
    id: 'NTF-101',
    titleEn: 'Critical Firewall Ingress Blocked',
    titleAr: 'تم حظر محاولة دخول جدار حماية حرجة',
    messageEn: 'Our MasterLink Edge Engine successfully blocked a multi-vector DDoS probing attempt targeting main API clusters. Zero packet leaks occurred.',
    messageAr: 'نجح محرك الحوسبة الطرفية لماستر لينك في إيقاف هجوم حجب خدمة متعدد النواقل استهدف مجموعات بوابات الربط الرئيسية. تم احتواء الهجوم بالكامل دون تسريب أي بيانات.',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
    category: 'system',
    read: false,
    metadata: {
      severity: 'critical',
      bulletCount: 12
    }
  },
  {
    id: 'NTF-102',
    titleEn: 'VIP Consultation Request Received',
    titleAr: 'تم استلام طلب استشارة لكبار العملاء',
    messageEn: 'Eng. Abdulaziz Al-Saud (Principal Architect at Neom) requested a full-stack IoT ERP migration brief for Q4 pipelines.',
    messageAr: 'طلب المهندس عبد العزيز آل سعود (كبير المهندسين في نيوم) ملفاً تعريفياً كاملاً لهجرة أنظمة تخطيط الموارد لتقنيات الإنترنت للأشياء للربع الرابع.',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    category: 'consultation',
    read: false,
    metadata: {
      name: 'Eng. Abdulaziz Al-Saud',
      email: 'a.alsaud@neom.com',
      services: ['IoT Integration', 'Full-Stack ERP Migration', 'Cloud Architecture'],
      severity: 'success'
    }
  },
  {
    id: 'NTF-103',
    titleEn: 'Global Cache Server Optimized',
    titleAr: 'تطوير أداء خوادم التخزين المؤقت العالمي',
    messageEn: 'Database replica synchronization was tuned to 24ms across EMEA edge instances, achieving a 34% drop in average query latency.',
    messageAr: 'تمت مزامنة النسخ الاحتياطية لقواعد البيانات لتصل إلى ٢٤ مللي ثانية عبر خوادم أوروبا والشرق الأوسط، مما أدى لانخفاض بنسبة ٣٤٪ في زمن الاستجابة.',
    timestamp: new Date(Date.now() - 1000 * 60 * 480).toISOString(), // 8 hours ago
    category: 'system',
    read: true,
    metadata: {
      severity: 'success'
    }
  },
  {
    id: 'NTF-104',
    titleEn: 'MasterLink Engine v4.2 Deployment Complete',
    titleAr: 'اكتمل نشر إصدار محرك ماستر لينك v4.2',
    messageEn: 'A major core upgrade was rolled out. Added features include dynamic Webhook retries, integrated translation schemas, and live stream tracing telemetry.',
    messageAr: 'تم تفعيل ترقية كبرى للنواة البرمجية للموقع. تشمل الإضافات: إعادة محاولة استدعاء الويب هُوك التلقائي، ومخططات ترجمة فورية متكاملة، وقنوات القياس عن بُعد للبث المباشر.',
    timestamp: new Date(Date.now() - 1000 * 60 * 1440).toISOString(), // 1 day ago
    category: 'update',
    read: true,
    metadata: {
      severity: 'info'
    }
  },
  {
    id: 'NTF-105',
    titleEn: 'New Consultation: Cloud Migrations',
    titleAr: 'طلب استشارة جديد: الهجرة السحابية للمؤسسات',
    messageEn: 'Riyadh Development Company submitted a scope brief for secure transition of legacy finance systems to Firestore clusters.',
    messageAr: 'قدمت شركة تطوير الرياض ملخص نطاق عمل للهجرة الآمنة للأنظمة المالية الموروثة إلى مجموعات قواعد بيانات فايرستور السحابية.',
    timestamp: new Date(Date.now() - 1000 * 60 * 2880).toISOString(), // 2 days ago
    category: 'consultation',
    read: true,
    metadata: {
      name: 'Faisal Al-Othman',
      email: 'faisal@rdc.com.sa',
      services: ['Cloud Migrations', 'Firestore Database Optimization'],
      severity: 'info'
    }
  }
];

// Load from storage or initialize with default seed
export function getSavedNotifications(): Notification[] {
  const saved = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Error parsing notifications:', e);
    }
  }
  
  // Set default seed
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(DEFAULT_NOTIFICATIONS));
  } catch (e) {
    console.error(e);
  }
  return DEFAULT_NOTIFICATIONS;
}

// Global push helper that can be imported anywhere
export function pushSystemNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) {
  try {
    const current = getSavedNotifications();
    const newNtf: Notification = {
      ...notification,
      id: `NTF-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    const updated = [newNtf, ...current];
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
    triggerNotificationsUpdate();
    
    // Dispatch native custom event to show active alert toasts
    window.dispatchEvent(new CustomEvent('masterlink_notification_toast', { detail: newNtf }));
  } catch (e) {
    console.error(e);
  }
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const { language, isRtl } = useLanguage();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'read'>('all');
  const [activeCategory, setActiveCategory] = useState<'all' | 'system' | 'consultation' | 'update'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // Sandbox Simulator State
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const [simName, setSimName] = useState('Sarah Jenkins');
  const [simEmail, setSimEmail] = useState('sarah@enterprise.io');
  const [simService, setSimService] = useState('Full-Stack ERP Migration');
  const [simAlertSeverity, setSimAlertSeverity] = useState<'info' | 'warning' | 'critical' | 'success'>('warning');

  // Load notifications from local storage
  const loadNotifications = () => {
    setNotifications(getSavedNotifications());
  };

  useEffect(() => {
    loadNotifications();
    
    // Listen for state mutations
    window.addEventListener('masterlink_notifications_changed', loadNotifications);
    return () => window.removeEventListener('masterlink_notifications_changed', loadNotifications);
  }, []);

  // Compute Unread Counts
  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  // Handle Mark All Read
  const handleMarkAllRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
    setNotifications(updated);
    triggerNotificationsUpdate();
  };

  // Handle Toggle Single Read/Unread
  const handleToggleRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = notifications.map(n => {
      if (n.id === id) {
        return { ...n, read: !n.read };
      }
      return n;
    });
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
    setNotifications(updated);
    triggerNotificationsUpdate();
  };

  // Handle Delete Single
  const handleDeleteNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = notifications.filter(n => n.id !== id);
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
    setNotifications(updated);
    triggerNotificationsUpdate();
    if (expandedId === id) {
      setExpandedId(null);
    }
  };

  // Handle Click Notification - toggles expand state & automatically marks as read
  const handleCardClick = (id: string, isAlreadyRead: boolean) => {
    setExpandedId(expandedId === id ? null : id);
    if (!isAlreadyRead) {
      const updated = notifications.map(n => {
        if (n.id === id) {
          return { ...n, read: true };
        }
        return n;
      });
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
      setNotifications(updated);
      triggerNotificationsUpdate();
    }
  };

  // Clear Sandbox Data
  const handleResetSimulatorDefaults = () => {
    setSimName('Sarah Jenkins');
    setSimEmail('sarah@enterprise.io');
    setSimService('Full-Stack ERP Migration');
    setSimAlertSeverity('warning');
  };

  // Mock Notification generators
  const triggerMockSystemAlert = () => {
    const alertsEn = [
      'Memory Overhead Warning: API Nodes reaching 89% threshold',
      'Database Rebalancing Routine Initiated',
      'SSL Certificate Renewed successfully for main domains',
      'Global DNS Propagation complete across all GCC regions'
    ];
    const alertsAr = [
      'تحذير من زيادة التحميل: وصلت عقدة واجهة البرمجة لمستوى ٨٩٪',
      'بدء الإجراء الروتيني لإعادة توازن قواعد البيانات السحابية',
      'تم تجديد شهادة التشفير SSL بنجاح للنطاقات الرئيسية للموقع',
      'اكتمل انتشار موازنة خوادم النطاقات (DNS) عبر كافة مناطق الخليج'
    ];
    const msgsEn = [
      'Node API-Node-04 reported high garbage collection latency. Auto-scaler deployed instance #5.',
      'Drizzle ORM executed active partitioning on transaction collections. Optimization took 42ms.',
      'Let’s Encrypt certified the connection profile for the next 90 days. Next review scheduled for Oct 2026.',
      'Sub-regional network queries are routing natively to local edge systems without latency hops.'
    ];
    const msgsAr = [
      'أبلغت العقدة API-Node-04 عن تأخر كبير في تفريغ الذاكرة. تم تفعيل التوسيع التلقائي.',
      'قام محرك قواعد البيانات بموازنة وتقسيم سجلات المعاملات. استغرق التحسين ٤٢ جزء من الثانية.',
      'قامت طبقة التشفير المعتمدة بتأمين قنوات الاتصال للتسعين يوماً القادمة بنجاح.',
      'تقوم شبكة توجيه البيانات بالاتصال بالأنظمة الطرفية محلياً دون أي قفزات تأخير.'
    ];

    const idx = Math.floor(Math.random() * alertsEn.length);
    pushSystemNotification({
      titleEn: alertsEn[idx],
      titleAr: alertsAr[idx],
      messageEn: msgsEn[idx],
      messageAr: msgsAr[idx],
      category: 'system',
      metadata: {
        severity: simAlertSeverity,
        bulletCount: Math.floor(5 + Math.random() * 20)
      }
    });
  };

  const triggerMockConsultation = () => {
    const services = [simService, 'Cloud Engineering', 'Arabization Compliance'];
    pushSystemNotification({
      titleEn: `Consultation Booked: ${simName}`,
      titleAr: `جلسة استشارية مؤكدة: ${simName}`,
      messageEn: `Corporate stakeholder ${simName} (${simEmail}) scheduled an expert review. Requested support: ${simService}.`,
      messageAr: `قام شريك الأعمال ${simName} (${simEmail}) بجدولة جلسة عمل معنا. الخدمات المطلوبة: ${simService}.`,
      category: 'consultation',
      metadata: {
        name: simName,
        email: simEmail,
        services: services,
        severity: 'success'
      }
    });
  };

  const triggerMockUpdate = () => {
    const updatesEn = [
      'MasterLink Analytics Dashboard updated to v4.3',
      'Arabic Localization Engine upgrade released',
      'New Case Study published: Neom Intelligent Hub'
    ];
    const updatesAr = [
      'تحديث لوحة تحكم تحليلات ماستر لينك للإصدار v4.3',
      'إطلاق الترقية الكبرى لمحرك الترجمة والتعريب',
      'نشر دراسة حالة ريادية جديدة: مشروع مركز نيوم الذكي'
    ];
    const msgsEn = [
      'Interactive chart performance was boosted by 60% with canvas-based Recharts rendering configurations.',
      'Enhanced RTL translation tables mapping correct tech jargon to localized Arabic interface fields.',
      'Explore how we deployed edge serverless architecture to support millions of low-latency API connections.'
    ];
    const msgsAr = [
      'تمت زيادة سرعة عرض الرسوم البيانية التفاعلية بنسبة ٦٠٪ باستخدام ميزات تحسين المعالجة.',
      'تحسين قواميس الترجمة والتعريب لمطابقة المصطلحات التقنية المعقدة بدقة مع الواجهات العربية.',
      'اكتشف كيف قمنا بنشر البنية اللامركزية الطرفية لدعم ملايين الاتصالات المتزامنة بزمن استجابة فائق.'
    ];

    const idx = Math.floor(Math.random() * updatesEn.length);
    pushSystemNotification({
      titleEn: updatesEn[idx],
      titleAr: updatesAr[idx],
      messageEn: msgsEn[idx],
      messageAr: msgsAr[idx],
      category: 'update',
      metadata: {
        severity: 'info'
      }
    });
  };

  // Filter and Search Logic
  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      // 1. Read / Unread tab filter
      if (activeTab === 'unread' && n.read) return false;
      if (activeTab === 'read' && !n.read) return false;

      // 2. Category tab filter
      if (activeCategory !== 'all' && n.category !== activeCategory) return false;

      // 3. Search query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const title = (language === 'en' ? n.titleEn : n.titleAr).toLowerCase();
        const message = (language === 'en' ? n.messageEn : n.messageAr).toLowerCase();
        const categoryLabel = n.category.toLowerCase();
        return title.includes(query) || message.includes(query) || categoryLabel.includes(query);
      }

      return true;
    });
  }, [notifications, activeTab, activeCategory, searchQuery, language]);

  // Formatter helper for relative timestamp
  const getRelativeTime = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHrs = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHrs / 24);

      if (isRtl) {
        if (diffSecs < 60) return 'الآن';
        if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
        if (diffHrs < 24) return `منذ ${diffHrs} ساعة`;
        return `منذ ${diffDays} يوم`;
      } else {
        if (diffSecs < 60) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHrs < 24) return `${diffHrs}h ago`;
        return `${diffDays}d ago`;
      }
    } catch (e) {
      return '';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50"
          />

          {/* Sliding sidebar Drawer */}
          <motion.div
            initial={{ x: isRtl ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: isRtl ? '-100%' : '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className={`fixed top-0 bottom-0 ${
              isRtl ? 'left-0 border-r' : 'right-0 border-l'
            } w-full sm:w-[480px] bg-slate-950 border-white/10 z-50 flex flex-col shadow-2xl overflow-hidden`}
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            {/* Header section with Premium Glow banner */}
            <div className="p-6 border-b border-white/15 bg-gradient-to-r from-slate-900 to-slate-950 relative overflow-hidden shrink-0">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#F20530]/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#F20530]/20 to-indigo-500/20 flex items-center justify-center border border-white/10">
                    <Bell className="w-5 h-5 text-[#F20530] animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-1.5">
                      <span>{language === 'en' ? 'Notification Center' : 'مركز الإشعارات'}</span>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-[#F20530] text-white text-[10px] font-black leading-none animate-bounce">
                          {unreadCount}
                        </span>
                      )}
                    </h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                      {language === 'en' ? 'Premium Enterprise UI' : 'واجهة تحكم المشروعات الاحترافية'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg bg-slate-900/60 hover:bg-rose-600 border border-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Top Read/Unread Filters Toolbar */}
              <div className="flex items-center justify-between gap-2 pt-2">
                <div className="flex bg-slate-900 rounded-lg p-1 border border-white/5">
                  {(['all', 'unread', 'read'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-1 rounded-md text-[10px] font-extrabold uppercase transition-all cursor-pointer ${
                        activeTab === tab
                          ? 'bg-slate-950 text-white shadow-sm border border-white/5'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {tab === 'all' && (language === 'en' ? 'All' : 'الكل')}
                      {tab === 'unread' && (language === 'en' ? 'Unread' : 'غير المقروءة')}
                      {tab === 'read' && (language === 'en' ? 'Read' : 'المقروءة')}
                    </button>
                  ))}
                </div>

                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="flex items-center gap-1 text-[10px] font-black text-rose-500 hover:text-rose-400 uppercase tracking-wider transition-all cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>{language === 'en' ? 'Mark All Read' : 'قراءة الكل'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Sub-Filters: Search bar and category selector chips */}
            <div className="px-6 py-4 bg-slate-900/40 border-b border-white/5 space-y-3 shrink-0">
              {/* Interactive Search Box */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder={language === 'en' ? 'Search notifications...' : 'ابحث في التنبيهات...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full text-xs font-semibold bg-slate-950/80 hover:bg-slate-950 border border-white/5 hover:border-white/15 focus:border-[#F20530] focus:ring-1 focus:ring-[#F20530] rounded-xl outline-none py-2 ${
                    isRtl ? 'pr-9 pl-8 text-right' : 'pl-9 pr-8 text-left'
                  } text-white placeholder-slate-500 transition-all`}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2 p-0.5 rounded text-slate-500 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Categories Selector Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <Filter className="w-3 h-3 text-rose-500 shrink-0" />
                <div className="flex items-center gap-1">
                  {(['all', 'system', 'consultation', 'update'] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold shrink-0 transition-all cursor-pointer ${
                        activeCategory === cat
                          ? 'bg-[#F20530]/15 text-[#F20530] border border-[#F20530]/35'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/5'
                      }`}
                    >
                      {cat === 'all' && (language === 'en' ? 'All Types' : 'كافة الأقسام')}
                      {cat === 'system' && (language === 'en' ? 'System Alerts' : 'تنبيهات النظام')}
                      {cat === 'consultation' && (language === 'en' ? 'Consultations' : 'الاستشارات')}
                      {cat === 'update' && (language === 'en' ? 'Updates' : 'التحديثات')}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Scrollable Notifications List Feed */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-none">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-16 bg-slate-900/10 rounded-2xl border border-white/5 max-w-sm mx-auto">
                  <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center mx-auto mb-4 border border-white/5 text-slate-500">
                    <Activity className="w-5 h-5 text-rose-500 animate-pulse" />
                  </div>
                  <h3 className="text-xs font-bold text-white mb-1">
                    {language === 'en' ? 'No Notifications Found' : 'لا توجد إشعارات'}
                  </h3>
                  <p className="text-[10px] text-slate-500 max-w-[200px] mx-auto leading-normal">
                    {language === 'en' 
                      ? 'No items match your active filters or search query.' 
                      : 'لا توجد عناصر تطابق خيارات التصفية الحالية أو كلمات البحث.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredNotifications.map((ntf) => {
                    const isExpanded = expandedId === ntf.id;
                    const isSystem = ntf.category === 'system';
                    const isConsult = ntf.category === 'consultation';
                    const isUpdate = ntf.category === 'update';

                    return (
                      <motion.div
                        key={ntf.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => handleCardClick(ntf.id, ntf.read)}
                        className={`p-4 rounded-xl border relative overflow-hidden transition-all duration-200 cursor-pointer ${
                          ntf.read 
                            ? 'bg-slate-900/20 border-white/5 hover:border-white/10' 
                            : 'bg-slate-900/60 border-white/10 hover:border-[#F20530]/20'
                        } ${
                          isExpanded ? 'ring-1 ring-[#F20530]/30 shadow-lg' : ''
                        }`}
                      >
                        {/* Dynamic Side Accent line for severity/category */}
                        <div className={`absolute top-0 bottom-0 ${isRtl ? 'right-0' : 'left-0'} w-1 ${
                          ntf.metadata?.severity === 'critical' ? 'bg-rose-500' :
                          isSystem ? 'bg-indigo-500' :
                          isConsult ? 'bg-emerald-500' : 'bg-rose-500'
                        }`} />

                        {/* Card Top: Icon, title, unread dot & timestamp */}
                        <div className={`flex items-start justify-between gap-3 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
                          <div className={`flex items-start gap-2.5 ${isRtl ? 'flex-row-reverse' : ''}`}>
                            {/* Category Icon */}
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                              isSystem ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' :
                              isConsult ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                              'bg-rose-500/10 border-rose-500/20 text-rose-400'
                            }`}>
                              {isSystem && <ShieldAlert className="w-4 h-4" />}
                              {isConsult && <Briefcase className="w-4 h-4" />}
                              {isUpdate && <Sparkles className="w-4 h-4" />}
                            </div>

                            <div className="space-y-0.5">
                              <h4 className={`text-xs font-bold leading-snug flex items-center gap-1.5 ${
                                ntf.read ? 'text-slate-300' : 'text-white'
                              }`}>
                                <span>{language === 'en' ? ntf.titleEn : ntf.titleAr}</span>
                                {!ntf.read && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 inline-block animate-ping" />
                                )}
                              </h4>
                              
                              <div className={`flex items-center gap-2 text-[9px] text-slate-500 font-bold ${isRtl ? 'flex-row-reverse' : ''}`}>
                                <span className="uppercase text-slate-400 font-extrabold">{ntf.category}</span>
                                <span className="text-slate-700">•</span>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-2.5 h-2.5" />
                                  <span>{getRelativeTime(ntf.timestamp)}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Quick Action buttons (Mark read/unread, trash) */}
                          <div className={`flex items-center gap-1.5 shrink-0 ${isRtl ? 'flex-row-reverse' : ''}`}>
                            <button
                              onClick={(e) => handleToggleRead(ntf.id, e)}
                              className="p-1 rounded bg-slate-950 border border-white/5 hover:border-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
                              title={ntf.read ? (language === 'en' ? 'Mark as Unread' : 'تحديد كغير مقروء') : (language === 'en' ? 'Mark as Read' : 'تحديد كمقروء')}
                            >
                              {ntf.read ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </button>
                            <button
                              onClick={(e) => handleDeleteNotification(ntf.id, e)}
                              className="p-1 rounded bg-slate-950 border border-white/5 hover:bg-rose-950 text-slate-500 hover:text-rose-400 transition-all cursor-pointer"
                              title={language === 'en' ? 'Delete' : 'حذف'}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Notification summary text */}
                        <p className={`text-[11px] text-slate-400 leading-relaxed mt-2.5 line-clamp-2 ${isRtl ? 'text-right mr-10' : 'text-left ml-10'}`}>
                          {language === 'en' ? ntf.messageEn : ntf.messageAr}
                        </p>

                        {/* EXPANDED RICH DETAILS AREA */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className={`overflow-hidden text-[11px] border-t border-white/5 mt-3 pt-3 text-slate-300 leading-relaxed space-y-3 ${isRtl ? 'mr-10 text-right' : 'ml-10 text-left'}`}
                            >
                              <p className="whitespace-pre-line bg-slate-950/40 p-2.5 rounded-lg border border-white/5 text-slate-300">
                                {language === 'en' ? ntf.messageEn : ntf.messageAr}
                              </p>

                              {/* Consultation Specific Metadata details */}
                              {isConsult && ntf.metadata && (
                                <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10 space-y-1.5 text-[10px]">
                                  <div className={`flex justify-between items-center ${isRtl ? 'flex-row-reverse' : ''}`}>
                                    <span className="text-slate-500 font-bold">{language === 'en' ? 'Applicant Name' : 'اسم مقدم الطلب'}:</span>
                                    <span className="text-emerald-400 font-black">{ntf.metadata.name}</span>
                                  </div>
                                  <div className={`flex justify-between items-center ${isRtl ? 'flex-row-reverse' : ''}`}>
                                    <span className="text-slate-500 font-bold">{language === 'en' ? 'Email Address' : 'البريد الإلكتروني'}:</span>
                                    <span className="text-slate-300 select-all font-mono">{ntf.metadata.email}</span>
                                  </div>
                                  {ntf.metadata.services && ntf.metadata.services.length > 0 && (
                                    <div className="space-y-1 pt-1 border-t border-white/5">
                                      <span className="text-slate-500 block font-bold">{language === 'en' ? 'Requested Services' : 'الخدمات المطلوبة'}:</span>
                                      <div className={`flex flex-wrap gap-1 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                        {ntf.metadata.services.map((s, idx) => (
                                          <span key={idx} className="px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/20 text-emerald-300 text-[8px] font-black uppercase">
                                            {s}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* System Alerts Specific severity and telemetry metadata */}
                              {isSystem && ntf.metadata && (
                                <div className="p-3 rounded-lg bg-slate-950 border border-white/5 flex items-center justify-between gap-4 text-[10px]">
                                  <div className="flex items-center gap-1.5">
                                    <Activity className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                                    <span className="text-slate-400 font-bold">{language === 'en' ? 'Telemetry Severity' : 'تصنيف خطورة القياس'}:</span>
                                  </div>
                                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                    ntf.metadata.severity === 'critical' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse' :
                                    ntf.metadata.severity === 'warning' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                                    'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  }`}>
                                    {ntf.metadata.severity || 'info'}
                                  </span>
                                </div>
                              )}

                              {/* Footer Action code stamp */}
                              <div className={`flex items-center justify-between text-[9px] text-slate-500 font-extrabold ${isRtl ? 'flex-row-reverse' : ''}`}>
                                <span>{language === 'en' ? 'System Code Reference' : 'كود مرجع النظام'}:</span>
                                <code className="px-1.5 py-0.5 bg-slate-950 border border-white/5 rounded text-rose-400 font-mono text-[8px]">
                                  {ntf.id}
                                </code>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Expanded state toggler Indicator */}
                        <div className="flex justify-center mt-2 border-t border-white/5 pt-1">
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400" />
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sandbox Simulation Trigger Panel accordion footer */}
            <div className="p-4 bg-slate-900 border-t border-white/10 shrink-0">
              <button
                onClick={() => setSimulatorOpen(!simulatorOpen)}
                className="w-full flex items-center justify-between text-xs font-black text-rose-500 hover:text-rose-400 cursor-pointer transition-all uppercase tracking-wider"
              >
                <div className="flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-[#F20530] animate-pulse" />
                  <span>{language === 'en' ? 'Real-Time Notification Sandbox' : 'مختبر اختبار الإشعارات الفورية'}</span>
                </div>
                {simulatorOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </button>

              <AnimatePresence>
                {simulatorOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mt-3 pt-3 border-t border-white/5 space-y-3.5 text-left text-xs text-slate-300"
                    dir="ltr" // Kept in LTR for technical developer ease
                  >
                    <div className="bg-slate-950/60 p-2.5 rounded-lg border border-white/5 space-y-2 text-[11px]">
                      <p className="text-[10px] text-slate-400 font-bold">
                        Configure mock payloads dynamically, then click a trigger category to instantly append real-time alerts.
                      </p>
                      
                      {/* Configuration Controls */}
                      <div className="grid grid-cols-2 gap-2 pt-1 text-[10px]">
                        <div>
                          <label className="text-slate-500 block mb-0.5">Mock Client Name</label>
                          <input
                            type="text"
                            value={simName}
                            onChange={(e) => setSimName(e.target.value)}
                            className="w-full bg-slate-900 border border-white/10 rounded px-1.5 py-0.5 text-white outline-none focus:border-rose-500 text-[10px]"
                          />
                        </div>
                        <div>
                          <label className="text-slate-500 block mb-0.5">Email Address</label>
                          <input
                            type="text"
                            value={simEmail}
                            onChange={(e) => setSimEmail(e.target.value)}
                            className="w-full bg-slate-900 border border-white/10 rounded px-1.5 py-0.5 text-white outline-none focus:border-rose-500 text-[10px]"
                          />
                        </div>
                        <div>
                          <label className="text-slate-500 block mb-0.5">Mock System Severity</label>
                          <select
                            value={simAlertSeverity}
                            onChange={(e) => setSimAlertSeverity(e.target.value as any)}
                            className="w-full bg-slate-900 border border-white/10 rounded px-1.5 py-0.5 text-white outline-none focus:border-rose-500 text-[10px]"
                          >
                            <option value="info">Info (Blue)</option>
                            <option value="success">Success (Green)</option>
                            <option value="warning">Warning (Yellow)</option>
                            <option value="critical">Critical (Red)</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-slate-500 block mb-0.5">Requested Service</label>
                          <select
                            value={simService}
                            onChange={(e) => setSimService(e.target.value)}
                            className="w-full bg-slate-900 border border-white/10 rounded px-1 py-0.5 text-white outline-none focus:border-rose-500 text-[10px]"
                          >
                            <option value="Full-Stack ERP Migration">ERP Migration</option>
                            <option value="Cloud Security Architecture">Security Audits</option>
                            <option value="Custom API Integrations">API Integrations</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Trigger Buttons row */}
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <button
                        onClick={triggerMockSystemAlert}
                        className="flex items-center justify-center gap-1 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-[9px] uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                      >
                        <PlusCircle className="w-3 h-3" />
                        <span>System</span>
                      </button>

                      <button
                        onClick={triggerMockConsultation}
                        className="flex items-center justify-center gap-1 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[9px] uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                      >
                        <PlusCircle className="w-3 h-3" />
                        <span>Consult</span>
                      </button>

                      <button
                        onClick={triggerMockUpdate}
                        className="flex items-center justify-center gap-1 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-[9px] uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                      >
                        <PlusCircle className="w-3 h-3" />
                        <span>Update</span>
                      </button>
                    </div>

                    {/* Reset default configs */}
                    <button
                      onClick={handleResetSimulatorDefaults}
                      className="text-[9px] text-slate-500 hover:text-slate-300 underline block text-center"
                    >
                      Reset Simulator Default Data
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
