import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Users, 
  ShieldCheck, 
  User, 
  Globe, 
  Clock, 
  Search, 
  Filter, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight, 
  Laptop, 
  Smartphone, 
  Radio, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface SystemActivityLog {
  id: string;
  userNameAr: string;
  userNameEn: string;
  userRoleAr: string;
  userRoleEn: string;
  userType: 'admin' | 'user' | 'client';
  isOnline: boolean;
  onlineStatus: 'online' | 'idle' | 'offline';
  lastSeenAr: string;
  lastSeenEn: string;
  actionAr: string;
  actionEn: string;
  detailAr: string;
  detailEn: string;
  category: 'security' | 'consultation' | 'project' | 'media' | 'system' | 'testimonial';
  ipAddress: string;
  locationAr: string;
  locationEn: string;
  device: string;
  timestampAr: string;
  timestampEn: string;
  targetTab?: string;
}

interface LiveActivityTrackerProps {
  isRtl: boolean;
  language: 'ar' | 'en';
  onNavigate: (tab: any) => void;
  triggerToast: (msg: string, type?: 'success' | 'info') => void;
}

const INITIAL_ACTIVITIES: SystemActivityLog[] = [
  {
    id: 'act-01',
    userNameAr: 'م. فهد القحطاني',
    userNameEn: 'Eng. Fahad Al-Qahtani',
    userRoleAr: 'مدير النظام (Super Admin)',
    userRoleEn: 'Super Admin',
    userType: 'admin',
    isOnline: true,
    onlineStatus: 'online',
    lastSeenAr: 'متصل الآن',
    lastSeenEn: 'Online Now',
    actionAr: 'تحديث صلاحيات التوثيق السحابي والشهادات الأمنية',
    actionEn: 'Updated Zero-Trust Cloud SSL Certificates',
    detailAr: 'تم تفعيل التشفير المتقدم لخوادم الوكيل السحابية',
    detailEn: 'Applied high-grade encryption to proxy edge nodes',
    category: 'security',
    ipAddress: '188.52.14.90',
    locationAr: 'الرياض، السعودية',
    locationEn: 'Riyadh, KSA',
    device: 'MacBook Pro • Chrome',
    timestampAr: 'الآن',
    timestampEn: 'Just now',
    targetTab: 'settings'
  },
  {
    id: 'act-02',
    userNameAr: 'سارة المنصور',
    userNameEn: 'Sara Al-Mansoor',
    userRoleAr: 'مشرفة محتوى ومشاريع',
    userRoleEn: 'Content & Projects Editor',
    userType: 'admin',
    isOnline: true,
    onlineStatus: 'online',
    lastSeenAr: 'متصل الآن',
    lastSeenEn: 'Online Now',
    actionAr: 'إضافة مشروع رقمي جديد لمعرض الأعمال الحية',
    actionEn: 'Published new FinTech Case Study to Portfolio',
    detailAr: 'مشروع نواة الراجحي للحلول المالية المصرفية',
    detailEn: 'Al-Rajhi Digital Core Platform',
    category: 'project',
    ipAddress: '94.200.31.12',
    locationAr: 'جدة، السعودية',
    locationEn: 'Jeddah, KSA',
    device: 'Windows 11 • Edge',
    timestampAr: 'قبل 4 دقائق',
    timestampEn: '4m ago',
    targetTab: 'projects'
  },
  {
    id: 'act-03',
    userNameAr: 'م. راشد البلوشي (شركة سحاب)',
    userNameEn: 'Eng. Rashid (Sahab Corp)',
    userRoleAr: 'عميل مؤسسي معتمد',
    userRoleEn: 'Enterprise Client',
    userType: 'client',
    isOnline: true,
    onlineStatus: 'online',
    lastSeenAr: 'متصل الآن',
    lastSeenEn: 'Online Now',
    actionAr: 'تقديم طلب حجز استشارة تقنية سحابية عاجلة',
    actionEn: 'Submitted Enterprise Architecture Consultation Request',
    detailAr: 'طلب دراسة بنية تحتية لتحويل منظومة الـ ERP السحابية',
    detailEn: 'Cloud migration feasibility assessment',
    category: 'consultation',
    ipAddress: '212.118.142.8',
    locationAr: 'الدمام، السعودية',
    locationEn: 'Dammam, KSA',
    device: 'iPhone 15 Pro • Safari',
    timestampAr: 'قبل 11 دقيقة',
    timestampEn: '11m ago',
    targetTab: 'consultations'
  },
  {
    id: 'act-04',
    userNameAr: 'د. وليد الدوسري',
    userNameEn: 'Dr. Waleed Al-Dawsari',
    userRoleAr: 'مستشار تقني خارجي',
    userRoleEn: 'Technical Advisor',
    userType: 'user',
    isOnline: false,
    onlineStatus: 'idle',
    lastSeenAr: 'نشط قبل 20 دقيقة',
    lastSeenEn: 'Idle (20m ago)',
    actionAr: 'نشر تعليق ورأي في مركز تجارب العملاء',
    actionEn: 'Added review feedback to Testimonials Hub',
    detailAr: 'تقييم تجربة تطوير الأنظمة السحابية الموزعة',
    detailEn: 'Distributed systems performance evaluation',
    category: 'testimonial',
    ipAddress: '82.165.197.44',
    locationAr: 'الخبر، السعودية',
    locationEn: 'Khobar, KSA',
    device: 'iPad Pro • Safari',
    timestampAr: 'قبل 22 دقيقة',
    timestampEn: '22m ago',
    targetTab: 'testimonials'
  },
  {
    id: 'act-05',
    userNameAr: 'عبدالرحمن العتيبي',
    userNameEn: 'Abdulrahman Al-Otaibi',
    userRoleAr: 'مسؤول الوسائط الرقمية',
    userRoleEn: 'Media Specialist',
    userType: 'admin',
    isOnline: false,
    onlineStatus: 'offline',
    lastSeenAr: 'غير متصل (منذ ساعتين)',
    lastSeenEn: 'Offline (2h ago)',
    actionAr: 'رفع 8 أصول بصرية وشعارات عالية الدقة للـ CDN',
    actionEn: 'Uploaded 8 High-Res Brand Assets to Media Cloud',
    detailAr: 'تحديث هوية وشعارات الشركاء الاستراتيجيين',
    detailEn: 'Partner brand identity package sync',
    category: 'media',
    ipAddress: '151.254.128.5',
    locationAr: 'الرياض، السعودية',
    locationEn: 'Riyadh, KSA',
    device: 'Mac Studio • Chrome',
    timestampAr: 'قبل ساعتين',
    timestampEn: '2h ago',
    targetTab: 'media'
  }
];

export function LiveActivityTracker({
  isRtl,
  language,
  onNavigate,
  triggerToast
}: LiveActivityTrackerProps) {
  const [activities, setActivities] = useState<SystemActivityLog[]>(INITIAL_ACTIVITIES);
  const [filterType, setFilterType] = useState<'all' | 'admin' | 'user' | 'online'>('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const onlineCount = activities.filter(a => a.isOnline).length;
  const adminCount = activities.filter(a => a.userType === 'admin').length;
  const clientUserCount = activities.filter(a => a.userType !== 'admin').length;

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      // Update timestamps to simulate fresh telemetry feed
      setActivities(prev => prev.map((act, i) => {
        if (i === 0) {
          return {
            ...act,
            timestampAr: 'الآن (مباشر)',
            timestampEn: 'Just now (Live)',
            lastSeenAr: 'متصل الآن'
          };
        }
        return act;
      }));
      triggerToast(
        isRtl 
          ? 'تم تحديث سجل العمليات وحالات اتصال المشرفين والعملاء بنجاح' 
          : 'Live operations stream & presence telemetry refreshed',
        'success'
      );
    }, 600);
  };

  const filteredActivities = activities.filter(act => {
    // Filter type check
    if (filterType === 'admin' && act.userType !== 'admin') return false;
    if (filterType === 'user' && act.userType === 'admin') return false;
    if (filterType === 'online' && !act.isOnline) return false;

    // Search check
    if (searchKeyword.trim()) {
      const q = searchKeyword.toLowerCase();
      const matchName = act.userNameAr.toLowerCase().includes(q) || act.userNameEn.toLowerCase().includes(q);
      const matchAction = act.actionAr.toLowerCase().includes(q) || act.actionEn.toLowerCase().includes(q);
      const matchRole = act.userRoleAr.toLowerCase().includes(q) || act.userRoleEn.toLowerCase().includes(q);
      const matchLoc = act.locationAr.toLowerCase().includes(q) || act.locationEn.toLowerCase().includes(q);
      if (!matchName && !matchAction && !matchRole && !matchLoc) return false;
    }
    return true;
  });

  const getCategoryBadge = (category: SystemActivityLog['category']) => {
    switch (category) {
      case 'security':
        return {
          label: isRtl ? 'الأمان والشهادات' : 'Security',
          bg: 'bg-rose-50 text-[#F20530] border-rose-200/60'
        };
      case 'project':
        return {
          label: isRtl ? 'المشاريع' : 'Projects',
          bg: 'bg-blue-50 text-[#5683FC] border-blue-200/60'
        };
      case 'consultation':
        return {
          label: isRtl ? 'الاستشارات' : 'Consultations',
          bg: 'bg-amber-50 text-amber-700 border-amber-200/60'
        };
      case 'testimonial':
        return {
          label: isRtl ? 'الآراء والتعليقات' : 'Testimonials',
          bg: 'bg-purple-50 text-purple-700 border-purple-200/60'
        };
      case 'media':
        return {
          label: isRtl ? 'الوسائط' : 'Media CDN',
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
        };
      default:
        return {
          label: isRtl ? 'النظام' : 'System Core',
          bg: 'bg-slate-50 text-slate-700 border-slate-200/60'
        };
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
      
      {/* CARD HEADER WITH LIVE TELEMETRY BADGE */}
      <div className={`p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r ${isRtl ? 'from-slate-50/80 to-white flex-row-reverse text-right' : 'from-white to-slate-50/80 flex-row text-left'}`}>
        <div className="space-y-1">
          <div className={`flex items-center gap-2.5 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className="p-2 rounded-xl bg-slate-900 text-white shadow-xs">
              <Activity className="w-4 h-4 text-[#F20530]" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight leading-none">
                {isRtl ? 'تتبع العمليات وحركات النظام المباشرة' : 'Live System Operations & Presence Tracker'}
              </h3>
              <p className="text-[11px] text-slate-400 font-semibold mt-1">
                {isRtl ? 'مراقبة حركات المشرفين والعملاء وحالة الاتصال والعمليات الجارية' : 'Real-time telemetry of admins, users, active sessions & transactions'}
              </p>
            </div>
          </div>
        </div>

        {/* LIVE STATUS PILL & REFRESH */}
        <div className={`flex items-center gap-2.5 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/70 text-emerald-800 text-[10px] font-extrabold shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>{onlineCount} {isRtl ? 'متصل الآن' : 'Online'}</span>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            title={isRtl ? 'تحديث السجل المباشر' : 'Refresh Telemetry Feed'}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#F20530]' : ''}`} />
          </button>
        </div>
      </div>

      {/* FILTER BUTTONS & SEARCH BAR */}
      <div className="p-4 sm:px-6 bg-slate-50/50 border-b border-slate-100 space-y-3">
        <div className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 ${isRtl ? 'sm:flex-row-reverse' : ''}`}>
          
          {/* SEGMENTED FILTER TABS */}
          <div className={`flex items-center gap-1 p-1 bg-slate-200/70 rounded-xl overflow-x-auto ${isRtl ? 'flex-row-reverse' : ''}`}>
            {[
              { key: 'all', labelAr: 'كافة الحركات', labelEn: 'All Logs', count: activities.length },
              { key: 'admin', labelAr: 'المشرفين', labelEn: 'Admins', count: adminCount },
              { key: 'user', labelAr: 'العملاء والمستخدمين', labelEn: 'Clients & Users', count: clientUserCount },
              { key: 'online', labelAr: 'المتصلين فقط', labelEn: 'Online Only', count: onlineCount }
            ].map((tab) => {
              const isActive = filterType === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setFilterType(tab.key as any)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    isActive 
                      ? 'bg-white text-slate-900 shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>{isRtl ? tab.labelAr : tab.labelEn}</span>
                  <span className={`px-1.5 py-0.2 rounded-md text-[9px] font-mono ${
                    isActive ? 'bg-slate-900 text-white' : 'bg-slate-300/60 text-slate-700'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* QUICK SEARCH WITHIN ACTIVITY STREAM */}
          <div className="relative min-w-[200px]">
            <input
              type="text"
              placeholder={isRtl ? 'بحث في الأسماء أو العمليات...' : 'Search actions or users...'}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className={`w-full py-1.5 ${isRtl ? 'pr-8 pl-3 text-right' : 'pl-8 pr-3 text-left'} bg-white border border-slate-200 rounded-xl text-xs font-semibold placeholder:text-slate-400 outline-none focus:border-[#F20530] focus:ring-2 focus:ring-[#F20530]/10 transition-all`}
            />
            <Search className={`w-3.5 h-3.5 text-slate-400 absolute top-2.5 ${isRtl ? 'right-2.5' : 'left-2.5'}`} />
          </div>

        </div>
      </div>

      {/* ACTIVITY FEED LISTING */}
      <div className="divide-y divide-slate-100 max-h-[460px] overflow-y-auto">
        {filteredActivities.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <AlertCircle className="w-7 h-7 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-500">
              {isRtl ? 'لا توجد حركات أو عمليات مطابقة للفلتر المحدد' : 'No matching activities found for this filter'}
            </p>
          </div>
        ) : (
          filteredActivities.map((act) => {
            const isExpanded = expandedId === act.id;
            const catBadge = getCategoryBadge(act.category);

            return (
              <div 
                key={act.id} 
                className={`p-4 sm:p-5 transition-colors hover:bg-slate-50/70 group ${
                  isExpanded ? 'bg-slate-50/90' : ''
                }`}
              >
                <div className={`flex items-start justify-between gap-3.5 ${isRtl ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}>
                  
                  {/* USER AVATAR & PRESENCE INDICATOR */}
                  <div className="relative shrink-0 mt-0.5">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-extrabold text-xs shadow-xs border ${
                      act.userType === 'admin' 
                        ? 'bg-slate-900 text-white border-slate-800' 
                        : act.userType === 'client'
                        ? 'bg-gradient-to-br from-[#5683FC] to-blue-700 text-white border-blue-600'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {act.userType === 'admin' ? (
                        <ShieldCheck className="w-5 h-5 text-[#F20530]" />
                      ) : (
                        <span>{(isRtl ? act.userNameAr : act.userNameEn).substring(0, 2).toUpperCase()}</span>
                      )}
                    </div>

                    {/* STATUS PULSE DOT */}
                    <span 
                      title={isRtl ? act.lastSeenAr : act.lastSeenEn}
                      className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white flex items-center justify-center ${
                        act.onlineStatus === 'online' 
                          ? 'bg-emerald-500 ring-2 ring-emerald-500/20' 
                          : act.onlineStatus === 'idle'
                          ? 'bg-amber-500'
                          : 'bg-slate-400'
                      }`}
                    >
                      {act.onlineStatus === 'online' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      )}
                    </span>
                  </div>

                  {/* USER INFO & ACTION DETAILS */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className={`flex flex-wrap items-center gap-2 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
                      <h4 className="text-xs font-black text-slate-900 leading-none">
                        {isRtl ? act.userNameAr : act.userNameEn}
                      </h4>

                      {/* ROLE BADGE */}
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold ${
                        act.userType === 'admin' 
                          ? 'bg-rose-50 text-[#F20530] border border-rose-200/60' 
                          : 'bg-blue-50 text-[#5683FC] border border-blue-200/60'
                      }`}>
                        {isRtl ? act.userRoleAr : act.userRoleEn}
                      </span>

                      {/* ONLINE / PRESENCE LABEL */}
                      <span className={`text-[10px] font-bold inline-flex items-center gap-1 ${
                        act.onlineStatus === 'online' 
                          ? 'text-emerald-700' 
                          : act.onlineStatus === 'idle'
                          ? 'text-amber-600'
                          : 'text-slate-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          act.onlineStatus === 'online' ? 'bg-emerald-500' : act.onlineStatus === 'idle' ? 'bg-amber-500' : 'bg-slate-300'
                        }`} />
                        {isRtl ? act.lastSeenAr : act.lastSeenEn}
                      </span>
                    </div>

                    {/* MAIN ACTION TITLE */}
                    <p className="text-xs font-bold text-slate-800 leading-snug">
                      {isRtl ? act.actionAr : act.actionEn}
                    </p>

                    {/* ACTION DESCRIPTION & TARGET */}
                    <p className="text-[11px] font-medium text-slate-500">
                      {isRtl ? act.detailAr : act.detailEn}
                    </p>

                    {/* EXPANDED TELEMETRY DETAILS */}
                    {isExpanded && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="pt-2.5 mt-2 border-t border-slate-200/60 space-y-2 text-[10px]"
                      >
                        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 font-semibold ${isRtl ? 'text-right' : 'text-left'}`}>
                          <div className={`flex items-center gap-1.5 ${isRtl ? 'flex-row-reverse' : ''}`}>
                            <Globe className="w-3.5 h-3.5 text-slate-400" />
                            <span>{isRtl ? 'الموقع:' : 'Location:'}</span>
                            <strong className="text-slate-800">{isRtl ? act.locationAr : act.locationEn}</strong>
                          </div>

                          <div className={`flex items-center gap-1.5 ${isRtl ? 'flex-row-reverse' : ''}`}>
                            <Radio className="w-3.5 h-3.5 text-slate-400" />
                            <span>{isRtl ? 'عنوان الـ IP:' : 'IP Address:'}</span>
                            <code className="text-slate-800 font-mono">{act.ipAddress}</code>
                          </div>

                          <div className={`flex items-center gap-1.5 sm:col-span-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                            <Laptop className="w-3.5 h-3.5 text-slate-400" />
                            <span>{isRtl ? 'بيئة الجهاز والمتصفح:' : 'Client Device:'}</span>
                            <span className="text-slate-700">{act.device}</span>
                          </div>
                        </div>

                        {act.targetTab && (
                          <div className={`pt-1 flex ${isRtl ? 'justify-start' : 'justify-end'}`}>
                            <button
                              onClick={() => {
                                onNavigate(act.targetTab);
                                triggerToast(
                                  isRtl 
                                    ? `الانتقال المباشر إلى قسم: ${catBadge.label}` 
                                    : `Navigating to ${catBadge.label} section`,
                                  'info'
                                );
                              }}
                              className="px-3 py-1.5 bg-slate-900 hover:bg-[#F20530] text-white rounded-lg font-extrabold text-[10px] transition-colors cursor-pointer flex items-center gap-1.5"
                            >
                              <span>{isRtl ? 'الانتقال إلى القسم المرتبط' : 'Open Related Module'}</span>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* METADATA BAR (Category + Time + Expand Toggle) */}
                    <div className={`flex flex-wrap items-center justify-between gap-2 pt-1 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold border ${catBadge.bg}`}>
                          {catBadge.label}
                        </span>

                        <span className={`text-[10px] font-mono text-slate-400 flex items-center gap-1 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
                          <Clock className="w-3 h-3 text-slate-300" />
                          <span>{isRtl ? act.timestampAr : act.timestampEn}</span>
                        </span>
                      </div>

                      <button
                        onClick={() => setExpandedId(isExpanded ? null : act.id)}
                        className="text-[10px] font-extrabold text-slate-500 hover:text-slate-900 flex items-center gap-0.5 cursor-pointer transition-colors"
                      >
                        <span>{isExpanded ? (isRtl ? 'إخفاء التفاصيل' : 'Hide details') : (isRtl ? 'تفاصيل الحركة والـ IP' : 'Inspect Details')}</span>
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    </div>

                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CARD FOOTER */}
      <div className={`p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs font-bold ${isRtl ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-[11px] text-slate-500 font-semibold">
            {isRtl ? 'نظام المراقبة وتتبع السجلات يعمل باستقرار عالي' : 'Audit logs & telemetry engine operating at 100% precision'}
          </span>
        </div>

        <button
          onClick={() => {
            onNavigate('settings');
            triggerToast(isRtl ? 'فتح مركز الأمان وسجلات النظام العامة' : 'Opening System Security Center');
          }}
          className="text-[11px] font-extrabold text-[#F20530] hover:text-rose-600 transition-colors cursor-pointer flex items-center gap-1"
        >
          <span>{isRtl ? 'مركز الأمان الكامل' : 'Security Audit'}</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
}
