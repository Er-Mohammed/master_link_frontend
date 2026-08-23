import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useAuth } from '../../../context/AuthContext';
import { useData } from '../../../context/DataContext';
import { 
  adminSiteSettingsApi, 
  adminMediaApi,
  authApi, 
  LaravelSiteSetting 
} from '../../../services/api';
import { MediaLibrary } from '../../../components/MediaLibrary';
import { AccessDenied403 } from '../../../components/AccessDenied403';
import { 
  Settings, 
  Building2, 
  Share2, 
  Save, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Instagram, 
  Youtube, 
  Github, 
  MessageCircle,
  Video,
  UploadCloud, 
  AlertCircle,
  Loader2,
  RefreshCw,
  Clock,
  Globe,
  Lock,
  Sparkles,
  FolderOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Known social setting keys for easy mapping
const SOCIAL_KEYS: Record<string, { label: string; icon: any; defaultKey: string }> = {
  facebook_url: { label: 'فيسبوك (Facebook)', icon: Facebook, defaultKey: 'facebook_url' },
  instagram_url: { label: 'إنستغرام (Instagram)', icon: Instagram, defaultKey: 'instagram_url' },
  x_url: { label: 'إكس (Twitter / X)', icon: Twitter, defaultKey: 'x_url' },
  linkedin_url: { label: 'لينكد إن (LinkedIn)', icon: Linkedin, defaultKey: 'linkedin_url' },
  youtube_url: { label: 'يوتيوب (YouTube)', icon: Youtube, defaultKey: 'youtube_url' },
  whatsapp_url: { label: 'واتساب (WhatsApp)', icon: MessageCircle, defaultKey: 'whatsapp_url' },
  tiktok_url: { label: 'تيك توك (TikTok)', icon: Video, defaultKey: 'tiktok_url' },
  github_url: { label: 'جيت هاب (GitHub)', icon: Github, defaultKey: 'github_url' },
};

export function Index() {
  const { isRtl } = useLanguage();
  const { canPerform, canAccess } = useAuth();
  const { refreshSettings, updateSettings } = useData();

  // Guard access to Site Settings (Super Admin only)
  if (!canAccess('settings')) {
    return <AccessDenied403 attemptedSection="settings" onReturnToDashboard={() => { window.location.hash = '#admin'; }} />;
  }

  // State
  const [rawSettings, setRawSettings] = useState<LaravelSiteSetting[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Active Tab
  const [activeTab, setActiveTab] = useState<'company' | 'socials' | 'general'>('company');

  // Media Selector Modal state for logo
  const [isMediaSelectorOpen, setIsMediaSelectorOpen] = useState(false);
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  const handleDirectLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingLogo(true);
      const res = await adminMediaApi.upload(file, 'Site Logo');
      const uploadedUrl = res.data?.url || (res.data as any)?.file_path;
      if (uploadedUrl) {
        updateFormField('site_logo', uploadedUrl);
        if (updateSettings) updateSettings({ siteLogo: uploadedUrl });
        triggerToast(isRtl ? 'تم رفع الشعار وتعيينه بنجاح.' : 'Logo uploaded and selected successfully.', 'success');
      }
    } catch (err: any) {
      triggerToast(err?.message || (isRtl ? 'فشل رفع صورة الشعار.' : 'Failed to upload logo.'), 'error');
    } finally {
      setIsUploadingLogo(false);
      if (logoFileInputRef.current) logoFileInputRef.current.value = '';
    }
  };

  // Key-value form dictionary
  const [formState, setFormState] = useState<Record<string, string>>({
    site_name: '',
    site_logo: '',
    company_email: '',
    company_phone: '',
    company_address: '',
    working_hours: '',
    about_company: '',
    facebook_url: '',
    instagram_url: '',
    x_url: '',
    linkedin_url: '',
    youtube_url: '',
    whatsapp_url: '',
    tiktok_url: '',
    github_url: '',
    default_language: 'ar',
    timezone: 'Asia/Riyadh (GMT+3)',
    date_format: 'YYYY-MM-DD',
    enable_maintenance: '0'
  });

  const triggerToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handle401Error = () => {
    authApi.clearToken();
    window.location.hash = '#admin-login';
  };

  // Fetch Settings from Laravel API
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await adminSiteSettingsApi.getAll();
      const items = response.data || [];
      setRawSettings(items);

      // Build dictionary from existing settings
      const dict: Record<string, string> = { ...formState };
      items.forEach(item => {
        if (item.key) {
          dict[item.key] = item.value ?? '';
        }
      });
      setFormState(dict);
    } catch (err: any) {
      if (err?.status === 401) {
        handle401Error();
        return;
      }
      if (err?.status === 403) {
        setError(isRtl ? 'غير مصرح لك بإدارة إعدادات الموقع (مقتصرة على مدير النظام Super Admin).' : 'Unauthorized to manage site settings.');
        return;
      }
      setError(err?.message || (isRtl ? 'حدث خطأ أثناء تحميل إعدادات الموقع.' : 'Failed to load site settings.'));
    } finally {
      setLoading(false);
    }
  }, [isRtl]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Update local form state field
  const updateFormField = (key: string, value: string) => {
    setFormState(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Save Settings to Laravel API
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setValidationErrors({});
    setError(null);

    try {
      const existingKeysMap = new Map<string, LaravelSiteSetting>();
      rawSettings.forEach(s => existingKeysMap.set(s.key, s));

      const updatePromises: Promise<any>[] = [];

      // Determine group and type for known keys
      const getKeyMetadata = (key: string): { type: LaravelSiteSetting['type']; group: string } => {
        if (key.endsWith('_url')) return { type: 'url', group: 'social' };
        if (key === 'company_email') return { type: 'email', group: 'contact' };
        if (key === 'company_phone') return { type: 'phone', group: 'contact' };
        if (key === 'site_logo') return { type: 'image', group: 'general' };
        if (key === 'about_company' || key === 'company_address') return { type: 'textarea', group: 'general' };
        return { type: 'text', group: 'general' };
      };

      Object.entries(formState).forEach(([key, rawVal]) => {
        const value = String(rawVal ?? '');
        const existingSetting = existingKeysMap.get(key);
        const { type, group } = getKeyMetadata(key);

        if (existingSetting) {
          // Update only if changed or always ensure current value is persisted
          updatePromises.push(
            adminSiteSettingsApi.update(existingSetting.id, {
              key,
              value,
              type: existingSetting.type || type,
              group_name: existingSetting.group_name || group
            })
          );
        } else if (value.trim()) {
          // Create new setting row in backend
          updatePromises.push(
            adminSiteSettingsApi.create({
              key,
              value,
              type,
              group_name: group
            })
          );
        }
      });

      await Promise.all(updatePromises);
      await refreshSettings();

      triggerToast(
        isRtl ? 'تم حفظ وتنسيق جميع إعدادات الموقع بنجاح في Laravel API.' : 'Site settings updated successfully.',
        'success'
      );

      // Re-fetch clean state from Laravel
      await fetchSettings();
    } catch (err: any) {
      if (err?.status === 401) {
        handle401Error();
        return;
      }
      if (err?.status === 403) {
        setError(isRtl ? 'ليس لديك صلاحية لتعديل إعدادات الموقع.' : 'Unauthorized to save settings.');
        return;
      }
      if (err?.status === 422 && err?.errors) {
        const fieldErrors: Record<string, string> = {};
        Object.entries(err.errors).forEach(([field, msgs]: [string, any]) => {
          fieldErrors[field] = Array.isArray(msgs) ? msgs[0] : String(msgs);
        });
        setValidationErrors(fieldErrors);
        triggerToast(isRtl ? 'يرجى مراجعة وتصحيح الحقول المدخلة.' : 'Please fix input errors.', 'error');
        return;
      }
      setError(err?.message || (isRtl ? 'حدث خطأ أثناء حفظ الإعدادات.' : 'Failed to save settings.'));
    } finally {
      setSaving(false);
    }
  };

  const tabsConfig = [
    { id: 'company', icon: Building2, label: isRtl ? 'بيانات الشركة والهوية' : 'Company Info' },
    { id: 'socials', icon: Share2, label: isRtl ? 'شبكات التواصل الاجتماعي' : 'Social Networks' },
    { id: 'general', icon: Settings, label: isRtl ? 'الإعدادات العامة للنظام' : 'General Controls' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-6 ${isRtl ? 'left-6' : 'right-6'} z-50 p-4 rounded-2xl shadow-2xl border flex items-center gap-3 max-w-md ${
              toast.type === 'error' ? 'bg-rose-950 text-rose-200 border-rose-800' :
              toast.type === 'info' ? 'bg-slate-950 text-slate-200 border-slate-800' :
              'bg-emerald-950 text-emerald-200 border-emerald-800'
            }`}
          >
            <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0">
              {toast.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-400" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              )}
            </div>
            <span className="text-xs font-bold leading-relaxed">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Banner Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#F20530]/10 border border-[#F20530]/20 text-[#F20530] flex items-center justify-center shrink-0">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              {isRtl ? 'إعدادات الموقع وتخصيص الهوية' : 'Site Settings & Branding'}
            </h2>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              {isRtl ? 'إدارة البيانات الرسمية وشبكات التواصل والروابط عبر Laravel Backend API' : 'Manage global settings and social networks synced with Laravel'}
            </p>
          </div>
        </div>

        {canPerform('settings', 'edit') && (
          <button
            type="button"
            disabled={saving || loading}
            onClick={() => handleSave()}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-xs font-black text-white bg-[#F20530] hover:bg-rose-600 transition-all cursor-pointer shadow-lg shadow-[#F20530]/20 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isRtl ? 'حفظ التعديلات' : 'Save Changes'}</span>
          </button>
        )}
      </div>

      {/* Access Denied Warning if Not Super Admin */}
      {!canPerform('settings', 'view') && (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-3xl text-center space-y-2">
          <Lock className="w-8 h-8 text-rose-600 mx-auto" />
          <h3 className="text-sm font-black text-rose-900">
            {isRtl ? 'غير مصرح لك بالوصول لإعدادات الموقع' : 'Access Restricted'}
          </h3>
          <p className="text-xs text-rose-700 font-semibold">
            {isRtl ? 'هذه الصفحة مقتصرة حصرياً على مدير النظام (Super Admin).' : 'This page is restricted to Super Admin users only.'}
          </p>
        </div>
      )}

      {/* Main Content Layout */}
      {canPerform('settings', 'view') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Tabs Sidebar */}
          <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-200/80 p-3 shadow-xs space-y-1">
            {tabsConfig.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                    isRtl ? 'flex-row-reverse text-right' : 'text-left'
                  } ${
                    isActive 
                      ? 'bg-rose-50 text-[#F20530] border border-rose-100 shadow-xs' 
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#F20530]' : 'text-slate-400'}`} />
                  <span className="flex-1 truncate">{tab.label}</span>
                </button>
              );
            })}

            <div className="pt-4 mt-4 border-t border-slate-100 px-3 pb-2 text-[10px] font-bold text-slate-400 space-y-2">
              <div className={`flex items-center justify-between ${isRtl ? 'flex-row-reverse' : ''}`}>
                <span>{isRtl ? 'المصدر:' : 'Source:'}</span>
                <span className="font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">Laravel API</span>
              </div>
              <div className={`flex items-center justify-between ${isRtl ? 'flex-row-reverse' : ''}`}>
                <span>{isRtl ? 'عدد الإعدادات:' : 'Total Keys:'}</span>
                <span className="font-mono text-[#F20530] bg-rose-50 px-1.5 py-0.5 rounded">{rawSettings.length}</span>
              </div>
            </div>
          </div>

          {/* Form Workspace */}
          <div className="lg:col-span-9">
            <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
              
              {loading ? (
                <div className="py-20 text-center space-y-3">
                  <Loader2 className="w-8 h-8 text-[#F20530] animate-spin mx-auto" />
                  <p className="text-xs text-slate-500 font-bold">
                    {isRtl ? 'جاري تحميل إعدادات الموقع من Laravel API...' : 'Loading settings from Laravel API...'}
                  </p>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  
                  {/* TAB 1: COMPANY INFORMATION */}
                  {activeTab === 'company' && (
                    <motion.div
                      key="company"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      <div className="border-b border-slate-100 pb-4">
                        <h3 className="text-sm font-black text-slate-900">
                          {isRtl ? 'معلومات الشركة والهوية الرسمية' : 'Company Information & Identity'}
                        </h3>
                        <p className="text-xs text-slate-400 font-semibold mt-1">
                          {isRtl ? 'تعديل بيانات المؤسسة والشعار ورسالة التواصل الظاهرة في الموقع.' : 'Update public company details, logo, and contact numbers.'}
                        </p>
                      </div>

                      {/* Logo Selector Panel */}
                      <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
                        <label className="block text-xs font-bold text-slate-800">
                          {isRtl ? 'شعار الشركة الرسمي (Company Logo URL)' : 'Company Logo URL'}
                        </label>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                          <div className="h-16 w-24 bg-slate-900 rounded-xl flex items-center justify-center p-2 shrink-0 border border-slate-800">
                            {formState.site_logo ? (
                              <img 
                                src={formState.site_logo} 
                                alt="Logo preview" 
                                referrerPolicy="no-referrer"
                                className="object-contain h-10 w-20"
                                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                              />
                            ) : (
                              <ImageIcon className="w-6 h-6 text-slate-500" />
                            )}
                          </div>
                          
                          <div className="flex-1 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <input
                                type="text"
                                value={formState.site_logo}
                                onChange={(e) => updateFormField('site_logo', e.target.value)}
                                placeholder="https://..."
                                className="block flex-1 min-w-[200px] px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-[#F20530] font-mono"
                              />
                              <input
                                type="file"
                                ref={logoFileInputRef}
                                onChange={handleDirectLogoUpload}
                                accept="image/*"
                                className="hidden"
                              />
                              <button
                                type="button"
                                onClick={() => logoFileInputRef.current?.click()}
                                disabled={isUploadingLogo}
                                className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                              >
                                {isUploadingLogo ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                                <span>{isRtl ? 'رفع ملف' : 'Upload'}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setIsMediaSelectorOpen(true)}
                                className="px-3.5 py-2.5 bg-[#F20530] hover:bg-rose-600 text-white rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5"
                              >
                                <FolderOpen className="w-4 h-4" />
                                <span>{isRtl ? 'من المكتبة' : 'From Library'}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Site Name & Email */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-700">
                            {isRtl ? 'اسم الموقع / الشركة:' : 'Site / Company Name:'}
                          </label>
                          <input
                            type="text"
                            value={formState.site_name}
                            onChange={(e) => updateFormField('site_name', e.target.value)}
                            className="block w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-[#F20530]"
                            placeholder="ماستر لينك للحلول البرمجية"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-700">
                            {isRtl ? 'البريد الإلكتروني العام:' : 'Public Email:'}
                          </label>
                          <div className="relative">
                            <Mail className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-3' : 'left-3'}`} />
                            <input
                              type="email"
                              value={formState.company_email}
                              onChange={(e) => updateFormField('company_email', e.target.value)}
                              className={`block w-full ${isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2.5 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-[#F20530] font-mono`}
                              placeholder="ops@masterlink.tech"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Phone & Working Hours */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-700">
                            {isRtl ? 'رقم الهاتف المباشر:' : 'Public Phone:'}
                          </label>
                          <div className="relative">
                            <Phone className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-3' : 'left-3'}`} />
                            <input
                              type="text"
                              value={formState.company_phone}
                              onChange={(e) => updateFormField('company_phone', e.target.value)}
                              className={`block w-full ${isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2.5 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-[#F20530] font-mono`}
                              placeholder="+966 53 000 0000"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-700">
                            {isRtl ? 'ساعات العمل المعتمدة:' : 'Working Hours:'}
                          </label>
                          <input
                            type="text"
                            value={formState.working_hours}
                            onChange={(e) => updateFormField('working_hours', e.target.value)}
                            className="block w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-[#F20530]"
                            placeholder="الأحد - الخميس، ٠٩:٠٠ صباحاً - ٠٦:٠٠ مساءً"
                          />
                        </div>
                      </div>

                      {/* Address */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700">
                          {isRtl ? 'العنوان الجغرافي والمكتب:' : 'Office Address:'}
                        </label>
                        <input
                          type="text"
                          value={formState.company_address}
                          onChange={(e) => updateFormField('company_address', e.target.value)}
                          className="block w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-[#F20530]"
                          placeholder="الرياض، المملكة العربية السعودية"
                        />
                      </div>

                      {/* About Company */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700">
                          {isRtl ? 'نبذة تعريفية للمؤسسة:' : 'About Company Text:'}
                        </label>
                        <textarea
                          rows={3}
                          value={formState.about_company}
                          onChange={(e) => updateFormField('about_company', e.target.value)}
                          className="block w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-[#F20530] leading-relaxed"
                          placeholder="تقديم أحدث الحلول والأنظمة السحابية المخصصة..."
                        />
                      </div>

                    </motion.div>
                  )}

                  {/* TAB 2: SOCIAL NETWORKS */}
                  {activeTab === 'socials' && (
                    <motion.div
                      key="socials"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      <div className="border-b border-slate-100 pb-4">
                        <h3 className="text-sm font-black text-slate-900">
                          {isRtl ? 'روابط وقنوات التواصل الاجتماعي الحقيقية' : 'Social Network URLs'}
                        </h3>
                        <p className="text-xs text-slate-400 font-semibold mt-1">
                          {isRtl ? 'تحديث وحفظ كافة روابط المنصات في Laravel Backend مباشرة بدون أي تلاعب بالرابط.' : 'All social URLs are stored cleanly as key-value pairs in Laravel API.'}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(SOCIAL_KEYS).map(([key, config]) => {
                          const Icon = config.icon;
                          const currentUrl = formState[key] || '';
                          return (
                            <div key={key} className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
                              <label className="block text-xs font-bold text-slate-800 flex items-center gap-2">
                                <Icon className="w-4 h-4 text-[#F20530]" />
                                <span>{config.label}</span>
                              </label>
                              <input
                                type="url"
                                value={currentUrl}
                                onChange={(e) => updateFormField(key, e.target.value)}
                                placeholder="https://..."
                                className="block w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-[#F20530] font-mono transition-colors"
                              />
                            </div>
                          );
                        })}
                      </div>

                    </motion.div>
                  )}

                  {/* TAB 3: GENERAL CONTROLS */}
                  {activeTab === 'general' && (
                    <motion.div
                      key="general"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      <div className="border-b border-slate-100 pb-4">
                        <h3 className="text-sm font-black text-slate-900">
                          {isRtl ? 'إعدادات النظام العامة' : 'General System Controls'}
                        </h3>
                        <p className="text-xs text-slate-400 font-semibold mt-1">
                          {isRtl ? 'تحديد خيارات المنطقة الزمنية واللغة الافتراضية وصيانة النظام.' : 'Manage default language, timezones, and maintenance flags.'}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-700">
                            {isRtl ? 'اللغة الافتراضية للموقع:' : 'Default Language:'}
                          </label>
                          <select
                            value={formState.default_language}
                            onChange={(e) => updateFormField('default_language', e.target.value)}
                            className="block w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold bg-white outline-none focus:border-[#F20530]"
                          >
                            <option value="ar">العربية (Arabic - RTL)</option>
                            <option value="en">English (LTR)</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-700">
                            {isRtl ? 'المنطقة الزمنية (Timezone):' : 'Timezone:'}
                          </label>
                          <input
                            type="text"
                            value={formState.timezone}
                            onChange={(e) => updateFormField('timezone', e.target.value)}
                            className="block w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-[#F20530] font-mono"
                            placeholder="Asia/Riyadh"
                          />
                        </div>

                      </div>

                      {/* Maintenance Toggle */}
                      <div className="p-4 bg-rose-50/50 border border-rose-100 rounded-2xl flex items-center justify-between gap-4">
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-slate-900 block">
                            {isRtl ? 'وضع الصيانة للموقع (Maintenance Mode)' : 'Enable Maintenance Mode'}
                          </span>
                          <span className="text-[11px] text-slate-500 font-semibold block">
                            {isRtl ? 'تفعيل وضع التوقف المؤقت للمستخدمين أثناء التحديثات.' : 'Temporarily disable public access during updates.'}
                          </span>
                        </div>
                        <input
                          type="checkbox"
                          checked={formState.enable_maintenance === '1'}
                          onChange={(e) => updateFormField('enable_maintenance', e.target.checked ? '1' : '0')}
                          className="w-5 h-5 accent-[#F20530] cursor-pointer"
                        />
                      </div>

                    </motion.div>
                  )}

                </AnimatePresence>
              )}

            </form>
          </div>

        </div>
      )}

      {/* Media Selector Modal */}
      <MediaLibrary
        isOpen={isMediaSelectorOpen}
        onClose={() => setIsMediaSelectorOpen(false)}
        selectable={true}
        onSelectMedia={(media) => {
          const selectedUrl = media.url || (media as any).file_path || '';
          updateFormField('site_logo', selectedUrl);
          if (updateSettings) updateSettings({ siteLogo: selectedUrl });
          setIsMediaSelectorOpen(false);
          triggerToast(isRtl ? 'تم اختيار الشعار من المكتبة بنجاح.' : 'Logo selected from library.', 'success');
        }}
      />

    </div>
  );
}

export default Index;
