import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { getRoleDisplay, ROLE_SECTION_PERMISSIONS } from '../lib/permissions';
import { 
  ShieldAlert, 
  Lock, 
  ArrowRight, 
  ArrowLeft, 
  Home, 
  CheckCircle2, 
  AlertOctagon,
  RefreshCw,
  UserCheck
} from 'lucide-react';
import { motion } from 'motion/react';

interface AccessDenied403Props {
  attemptedSection: string;
  onReturnToDashboard: () => void;
}

export function AccessDenied403({ attemptedSection, onReturnToDashboard }: AccessDenied403Props) {
  const { language, isRtl } = useLanguage();
  const { currentUser, currentRole } = useAuth();

  const roleDisplay = currentRole ? getRoleDisplay(currentRole, language === 'en' ? 'en' : 'ar') : { name: '', desc: '', badgeClass: 'bg-slate-50 text-slate-700 border-slate-200' };
  const allowedSections = currentRole ? (ROLE_SECTION_PERMISSIONS[currentRole] || []) : [];

  const sectionNameMap: Record<string, { en: string; ar: string }> = {
    dashboard: { en: 'Dashboard Overview', ar: 'لوحة القيادة العامة' },
    services: { en: 'Platform Services', ar: 'الخدمات الرقمية' },
    projects: { en: 'Case Studies & Projects', ar: 'المشاريع ودراسات الحالة' },
    categories: { en: 'Project Categories', ar: 'تصنيفات المشاريع' },
    posts: { en: 'Articles & Posts', ar: 'المقالات والمنشورات' },
    media: { en: 'Media Library', ar: 'مكتبة الوسائط الرقمية' },
    testimonials: { en: 'Testimonials', ar: 'آراء وتقييمات العملاء' },
    client_logos: { en: 'Client Logos', ar: 'شعارات العملاء' },
    consultations: { en: 'Client Consultations', ar: 'استشارات العملاء' },
    settings: { en: 'Site Settings', ar: 'إعدادات النظام' },
    admins: { en: 'Admins & Employees Management', ar: 'إدارة المدراء والموظفين' },
    profile: { en: 'My Account', ar: 'الملف الشخصي' }
  };

  const targetName = sectionNameMap[attemptedSection] 
    ? (language === 'en' ? sectionNameMap[attemptedSection].en : sectionNameMap[attemptedSection].ar)
    : attemptedSection;

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-2xl bg-white rounded-3xl border border-rose-200/80 shadow-2xl p-6 sm:p-10 space-y-6 relative overflow-hidden"
      >
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#F20530] via-rose-500 to-amber-500" />

        {/* Header Visual */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-start">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200/80 text-[#F20530] flex items-center justify-center shrink-0 shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className={`space-y-1.5 flex-1 ${isRtl ? 'sm:text-right' : 'sm:text-left'}`}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100/80 text-[#F20530] text-[11px] font-mono font-extrabold uppercase tracking-wider border border-rose-200">
              <Lock className="w-3.5 h-3.5" />
              <span>HTTP 403 &bull; {language === 'en' ? 'Forbidden Access' : 'غير مصرح بالدخول'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {language === 'en' 
                ? 'Unauthorized Access Restricted' 
                : 'عذراً! لا تملك صلاحية الوصول لهذا القسم'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold leading-relaxed">
              {language === 'en'
                ? `You do not have the required permissions to view or interact with the "${targetName}" section.`
                : `حسابك الحالي لا يمتلك الإذن الكافي لفتح أو إدارة قسم "${targetName}".`}
            </p>
          </div>
        </div>

        {/* RBAC Role Context Box */}
        <div className={`p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 ${isRtl ? 'text-right' : 'text-left'}`}>
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 pb-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                {language === 'en' ? 'Current Active Role' : 'الدور والرتبة الحالية'}
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm font-extrabold text-slate-900">{currentUser?.nameAr || currentUser?.nameEn || 'Admin'}</span>
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${roleDisplay.badgeClass}`}>
                  {roleDisplay.name}
                </span>
              </div>
            </div>
            <span className="text-xs font-mono text-slate-500">{currentUser?.email || ''}</span>
          </div>

          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            {roleDisplay.desc}
          </p>

          <div className="pt-2">
            <span className="text-[11px] font-bold text-slate-500 block mb-2">
              {language === 'en' ? 'Sections authorized for your role:' : 'الأقسام المتاحة لدورك الحالي:'}
            </span>
            <div className="flex flex-wrap gap-2">
              {allowedSections.map((sec) => {
                const label = sectionNameMap[sec] 
                  ? (language === 'en' ? sectionNameMap[sec].en : sectionNameMap[sec].ar)
                  : sec;
                return (
                  <span 
                    key={sec}
                    className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center gap-1.5 shadow-2xs"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>{label}</span>
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <button
            onClick={onReturnToDashboard}
            className="w-full sm:w-auto px-6 py-3 bg-[#F20530] hover:bg-rose-600 text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-md shadow-[#F20530]/20 flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>{language === 'en' ? 'Return to Safe Dashboard' : 'العودة إلى لوحة القيادة الآمنة'}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
