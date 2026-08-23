import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { authApi, adminMediaApi, ApiError, LaravelMedia } from '../services/api';
import { mapLaravelAdminToUser } from '../lib/permissions';
import { 
  User, 
  Mail, 
  Lock, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  RefreshCw, 
  Sparkles, 
  Shield, 
  Key,
  Info,
  Camera,
  ImageIcon,
  Trash2,
  X,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function ProfileManagement() {
  const { language, isRtl } = useLanguage();
  const { currentUser, roleInfo, updateCurrentUser, refreshUser, logout } = useAuth();

  // Active sub tab
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'security'>('profile');

  // Toast notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'danger' | 'info' } | null>(null);

  // Profile Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profileMediaId, setProfileMediaId] = useState<number | null>(null);
  const [selectedMediaUrl, setSelectedMediaUrl] = useState<string | null>(null);

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileValidationErrors, setProfileValidationErrors] = useState<Record<string, string[]> | null>(null);

  // Media Picker Modal State
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [availableMedia, setAvailableMedia] = useState<LaravelMedia[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);

  // Password Form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordValidationErrors, setPasswordValidationErrors] = useState<Record<string, string[]> | null>(null);

  // Sync form inputs with currentUser whenever currentUser changes
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.nameAr || currentUser.nameEn || '');
      setEmail(currentUser.email || '');
      setProfileMediaId(currentUser.profile_media_id ?? null);
      setSelectedMediaUrl(currentUser.avatar || currentUser.profile_media?.url || null);
    }
  }, [currentUser]);

  // Re-verify current user from backend when component mounts
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const triggerToast = (msg: string, type: 'success' | 'danger' | 'info' = 'success') => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Load image media for profile avatar selection
  const fetchAvailableMedia = async () => {
    setMediaLoading(true);
    try {
      const response = await adminMediaApi.getAll({ media_type: 'image', per_page: 50 });
      if (Array.isArray(response.data)) {
        setAvailableMedia(response.data);
      } else if (response.data && Array.isArray((response.data as any).data)) {
        setAvailableMedia((response.data as any).data);
      } else {
        setAvailableMedia([]);
      }
    } catch (err: unknown) {
      console.warn('Failed to fetch media:', err);
      setAvailableMedia([]);
    } finally {
      setMediaLoading(false);
    }
  };

  // ─── Handle Profile Update Submit ─────────────────────────────────
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileValidationErrors(null);
    setIsSavingProfile(true);

    try {
      const response = await authApi.updateProfile({
        name: name.trim(),
        email: email.trim(),
        profile_media_id: profileMediaId
      });

      if (response.success && response.data) {
        // Update currentUser in AuthContext and Sidebar/Header immediately
        updateCurrentUser(mapLaravelAdminToUser(response.data));
        triggerToast(
          language === 'en' ? 'Profile details updated successfully.' : 'تم تحديث بيانات الملف الشخصي بنجاح.',
          'success'
        );
      }
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      if (apiErr.status === 401) {
        await logout();
        window.location.hash = '#login';
        return;
      }
      if (apiErr.status === 422) {
        setProfileValidationErrors(apiErr.errors || null);
        setProfileError(apiErr.message || (language === 'en' ? 'Validation error.' : 'خطأ في البيانات المدخلة.'));
      } else if (apiErr.status === 403) {
        setProfileError(language === 'en' ? 'Forbidden: You do not have permission to update profile.' : 'ليس لديك صلاحية لتحديث الحساب.');
      } else {
        setProfileError(apiErr.message || (language === 'en' ? 'Failed to save profile.' : 'فشل حفظ بيانات الملف الشخصي.'));
      }
    } finally {
      setIsSavingProfile(false);
    }
  };

  // ─── Handle Password Change Submit ────────────────────────────────
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordValidationErrors(null);

    if (newPassword !== confirmPassword) {
      setPasswordError(language === 'en' ? 'New passwords do not match.' : 'تأكيد كلمة المرور الجديدة غير متطابق.');
      setPasswordValidationErrors({
        confirmPassword: [language === 'en' ? 'Passwords do not match' : 'كلمتا المرور غير متطابقتين']
      });
      return;
    }

    setIsChangingPassword(true);

    try {
      const response = await authApi.changePassword(
        currentPassword,
        newPassword,
        confirmPassword
      );

      if (response.success) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        triggerToast(
          response.message || (language === 'en' ? 'Password changed successfully.' : 'تم تغيير كلمة المرور بنجاح.'),
          'success'
        );
      }
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      if (apiErr.status === 401) {
        await logout();
        window.location.hash = '#login';
        return;
      }
      if (apiErr.status === 422) {
        setPasswordValidationErrors(apiErr.errors || null);
        setPasswordError(apiErr.message || (language === 'en' ? 'Password change failed.' : 'فشل تغيير كلمة المرور.'));
      } else if (apiErr.status === 403) {
        setPasswordError(language === 'en' ? 'Forbidden' : 'غير مصرح لك بتغيير كلمة المرور.');
      } else {
        setPasswordError(apiErr.message || (language === 'en' ? 'Server error occurred.' : 'حدث خطأ أثناء تغيير كلمة المرور.'));
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className={`space-y-6 ${isRtl ? 'text-right' : 'text-left'}`}>
      
      {/* TOAST SYSTEM */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-6 ${isRtl ? 'left-6' : 'right-6'} z-50 p-4 rounded-xl shadow-2xl border flex items-center gap-3 max-w-md ${
              toast.type === 'danger' ? 'bg-red-950 text-red-200 border-red-900' :
              toast.type === 'info' ? 'bg-slate-950 text-slate-200 border-slate-900' :
              'bg-emerald-950 text-emerald-200 border-emerald-900'
            }`}
          >
            <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0">
              {toast.type === 'danger' ? (
                <AlertCircle className="w-4 h-4 text-red-400" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              )}
            </div>
            <span className="text-xs font-semibold leading-relaxed">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER USER CARD */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-full bg-gradient-to-l from-[#F20530]/5 to-transparent pointer-events-none" />
        
        <div className={`flex flex-col sm:flex-row items-center gap-6 ${isRtl ? 'sm:flex-row-reverse text-right' : 'text-left'}`}>
          
          {/* Avatar Display */}
          <div className="relative group shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-center justify-center text-2xl font-black shadow-md border-2 border-slate-100 overflow-hidden relative">
              {selectedMediaUrl ? (
                <img 
                  src={selectedMediaUrl} 
                  alt="Avatar" 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <span>{(currentUser?.nameAr || currentUser?.nameEn || 'A').charAt(0).toUpperCase()}</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                setIsMediaPickerOpen(true);
                fetchAvailableMedia();
              }}
              className="absolute -bottom-1 -right-1 p-1.5 bg-[#F20530] text-white rounded-xl shadow-md hover:bg-rose-600 transition-colors cursor-pointer"
              title={language === 'en' ? 'Change Avatar' : 'تغيير الصورة الشخصية'}
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1.5 flex-1">
            <div className={`flex items-center gap-2 flex-wrap ${isRtl ? 'flex-row-reverse' : ''}`}>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-none">
                {currentUser?.nameAr || currentUser?.nameEn || 'Admin User'}
              </h2>
              <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase border ${roleInfo.badgeClass}`}>
                {roleInfo.name || currentUser?.role}
              </span>
              <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-extrabold border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{language === 'en' ? 'Active' : 'حساب مفعل'}</span>
              </span>
            </div>
            
            <p className="text-slate-500 text-xs font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#F20530] shrink-0" />
              <span>{roleInfo.desc || (language === 'en' ? 'Authenticated System Administrator' : 'حساب إداري مصرح له')}</span>
            </p>

            <div className={`flex items-center gap-4 text-[11px] text-slate-400 font-semibold font-mono flex-wrap ${isRtl ? 'flex-row-reverse' : ''}`}>
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{currentUser?.email}</span>
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Laravel Sanctum Authenticated</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* TWO COLUMN WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* TAB NAVIGATION (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-3 shadow-xs space-y-1">
          <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            {isRtl ? 'قائمة تفاصيل الإعدادات' : 'Profile Settings Menu'}
          </div>
          
          {[
            { id: 'profile', labelEn: 'Personal Information', labelAr: 'البيانات الشخصية', icon: User },
            { id: 'security', labelEn: 'Change Password', labelAr: 'تغيير كلمة المرور والأمان', icon: Lock }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeSubTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSubTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isRtl ? 'flex-row-reverse text-right' : 'text-left'
                } ${
                  isActive 
                    ? 'bg-rose-50 text-[#F20530] border border-rose-100/50 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#F20530]' : 'text-slate-400'}`} />
                <span className="flex-1">{language === 'en' ? item.labelEn : item.labelAr}</span>
              </button>
            );
          })}
        </div>

        {/* MAIN FORM WORKSPACE (9 cols) */}
        <div className="lg:col-span-9">
          <AnimatePresence mode="wait">
            
            {/* SUB TAB 1: PERSONAL INFORMATION */}
            {activeSubTab === 'profile' && (
              <motion.div
                key="personal-info-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <form onSubmit={handleSaveProfile} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
                  
                  <div className={`flex items-center gap-2 border-b border-slate-100 pb-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <User className="w-4 h-4 text-[#F20530]" />
                    <h3 className="text-sm font-extrabold text-slate-900">
                      {language === 'en' ? 'Edit Personal Information' : 'تحديث البيانات الشخصية للحساب'}
                    </h3>
                  </div>

                  {/* General Error Alert */}
                  {profileError && (
                    <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-[#F20530] shrink-0" />
                      <span>{profileError}</span>
                    </div>
                  )}

                  {/* PROFILE AVATAR SECTION */}
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
                    <label className="block text-xs font-extrabold text-slate-800">
                      {language === 'en' ? 'Profile Image' : 'الصورة الشخصية'}
                    </label>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 shadow-xs overflow-hidden shrink-0 flex items-center justify-center">
                        {selectedMediaUrl ? (
                          <img src={selectedMediaUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-center justify-center font-bold text-lg uppercase">
                            {(name || 'A').charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="space-y-1.5 text-center sm:text-right flex-1">
                        <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                          {language === 'en' ? 'Choose an avatar image from your Media Library' : 'اختر صورة شخصية تعبر عن حسابك الإداري من مكتبة الوسائط.'}
                        </p>
                        <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                          <button
                            type="button"
                            onClick={() => {
                              setIsMediaPickerOpen(true);
                              fetchAvailableMedia();
                            }}
                            className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 border border-slate-200 shadow-2xs"
                          >
                            <ImageIcon className="w-3.5 h-3.5 text-[#F20530]" />
                            <span>{language === 'en' ? 'Select from Media Library' : 'اختيار من مكتبة الوسائط'}</span>
                          </button>
                          {(profileMediaId !== null || selectedMediaUrl !== null) && (
                            <button
                              type="button"
                              onClick={() => {
                                setProfileMediaId(null);
                                setSelectedMediaUrl(null);
                              }}
                              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 border border-rose-200"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>{language === 'en' ? 'Remove Image' : 'إزالة الصورة'}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    {profileValidationErrors?.profile_media_id && (
                      <p className="text-[11px] font-bold text-red-600">
                        {profileValidationErrors.profile_media_id.join(' ')}
                      </p>
                    )}
                  </div>

                  {/* Name Input */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-extrabold text-slate-700">
                      {language === 'en' ? 'Full Name' : 'الاسم الكامل'} <span className="text-[#F20530]">*</span>
                    </label>
                    <div className="relative">
                      <User className={`absolute inset-y-0 ${isRtl ? 'right-3' : 'left-3'} w-4 h-4 text-slate-400 my-auto`} />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={language === 'en' ? 'Enter full name' : 'أدخل الاسم الكامل'}
                        className={`block w-full ${isRtl ? 'pr-9 pl-4' : 'pl-9 pr-4'} py-2.5 border rounded-xl text-xs font-semibold outline-none transition-all ${
                          profileValidationErrors?.name ? 'border-red-400 bg-red-50/20' : 'border-slate-200 focus:border-[#F20530]'
                        }`}
                      />
                    </div>
                    {profileValidationErrors?.name && (
                      <p className="text-[11px] font-bold text-red-600">
                        {profileValidationErrors.name.join(' ')}
                      </p>
                    )}
                  </div>

                  {/* Email Input */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-extrabold text-slate-700">
                      {language === 'en' ? 'Email Address' : 'البريد الإلكتروني'} <span className="text-[#F20530]">*</span>
                    </label>
                    <div className="relative">
                      <Mail className={`absolute inset-y-0 ${isRtl ? 'right-3' : 'left-3'} w-4 h-4 text-slate-400 my-auto`} />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@example.com"
                        className={`block w-full ${isRtl ? 'pr-9 pl-4' : 'pl-9 pr-4'} py-2.5 border rounded-xl text-xs font-semibold outline-none font-mono transition-all ${
                          profileValidationErrors?.email ? 'border-red-400 bg-red-50/20' : 'border-slate-200 focus:border-[#F20530]'
                        }`}
                      />
                    </div>
                    {profileValidationErrors?.email && (
                      <p className="text-[11px] font-bold text-red-600">
                        {profileValidationErrors.email.join(' ')}
                      </p>
                    )}
                  </div>

                  {/* READ ONLY Role & Status Display */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                    
                    {/* Read Only Role */}
                    <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                      <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        {language === 'en' ? 'Assigned System Role (Read Only)' : 'الدور المخصص (غير قابل للتعديل هنا)'}
                      </span>
                      <div className="flex items-center gap-2 pt-1">
                        <Shield className="w-4 h-4 text-slate-500" />
                        <span className={`px-2.5 py-1 rounded-md text-xs font-extrabold border ${roleInfo.badgeClass}`}>
                          {roleInfo.name || currentUser?.role}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium leading-relaxed pt-1">
                        {language === 'en' ? 'Roles can only be altered by Super Admin from the Admins Management panel.' : 'تغيير الدور الوظيفي يتم حصرًا من قبل مدير النظام الرئيسي من قسم إدارة المدراء.'}
                      </p>
                    </div>

                    {/* Read Only Status */}
                    <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                      <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        {language === 'en' ? 'Account Status' : 'حالة الحساب في النظام'}
                      </span>
                      <div className="flex items-center gap-2 pt-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100/60 px-2.5 py-1 rounded-md border border-emerald-200">
                          {language === 'en' ? 'Active & Verified' : 'مفعل ومصرح له'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium leading-relaxed pt-1">
                        {language === 'en' ? 'Your account is active and connected with Laravel Sanctum.' : 'حسابك مفعل وجلستك محمية بواسطة Laravel Sanctum.'}
                      </p>
                    </div>

                  </div>

                  {/* Submit Button */}
                  <div className={`pt-4 border-t border-slate-100 flex justify-end ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <button
                      type="submit"
                      disabled={isSavingProfile}
                      className="px-6 py-3 rounded-xl text-xs font-extrabold text-white bg-[#F20530] hover:bg-rose-600 transition-all cursor-pointer shadow-md shadow-rose-100 flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50"
                    >
                      {isSavingProfile ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      <span>
                        {isSavingProfile 
                          ? (language === 'en' ? 'Saving changes...' : 'جاري الحفظ في Laravel...') 
                          : (language === 'en' ? 'Update Profile' : 'حفظ البيانات الشخصية')}
                      </span>
                    </button>
                  </div>

                </form>
              </motion.div>
            )}

            {/* SUB TAB 2: CHANGE PASSWORD */}
            {activeSubTab === 'security' && (
              <motion.div
                key="account-security-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <form onSubmit={handleChangePassword} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
                  
                  <div className={`flex items-center gap-2 border-b border-slate-100 pb-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <Key className="w-4 h-4 text-[#F20530]" />
                    <h3 className="text-sm font-extrabold text-slate-900">
                      {language === 'en' ? 'Change Account Password' : 'تغيير كلمة المرور للحساب الحالي'}
                    </h3>
                  </div>

                  {/* General Password Error Alert */}
                  {passwordError && (
                    <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-[#F20530] shrink-0" />
                      <span>{passwordError}</span>
                    </div>
                  )}

                  {/* Current Password Field */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-extrabold text-slate-700">
                      {language === 'en' ? 'Current Password' : 'كلمة المرور الحالية'} <span className="text-[#F20530]">*</span>
                    </label>
                    <div className="relative">
                      <Lock className={`absolute inset-y-0 ${isRtl ? 'right-3' : 'left-3'} w-4 h-4 text-slate-400 my-auto`} />
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className={`block w-full ${isRtl ? 'pr-9 pl-10' : 'pl-9 pr-10'} py-2.5 border rounded-xl text-xs font-semibold outline-none transition-all ${
                          passwordValidationErrors?.current_password ? 'border-red-400 bg-red-50/20' : 'border-slate-200 focus:border-[#F20530]'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className={`absolute inset-y-0 ${isRtl ? 'left-3' : 'right-3'} my-auto text-slate-400 hover:text-slate-600 transition-colors`}
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {passwordValidationErrors?.current_password && (
                      <p className="text-[11px] font-bold text-red-600">
                        {passwordValidationErrors.current_password.join(' ')}
                      </p>
                    )}
                  </div>

                  {/* New Password Field */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-extrabold text-slate-700">
                      {language === 'en' ? 'New Password' : 'كلمة المرور الجديدة'} <span className="text-[#F20530]">*</span>
                    </label>
                    <div className="relative">
                      <Lock className={`absolute inset-y-0 ${isRtl ? 'right-3' : 'left-3'} w-4 h-4 text-slate-400 my-auto`} />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        minLength={8}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className={`block w-full ${isRtl ? 'pr-9 pl-10' : 'pl-9 pr-10'} py-2.5 border rounded-xl text-xs font-semibold outline-none transition-all ${
                          passwordValidationErrors?.new_password ? 'border-red-400 bg-red-50/20' : 'border-slate-200 focus:border-[#F20530]'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className={`absolute inset-y-0 ${isRtl ? 'left-3' : 'right-3'} my-auto text-slate-400 hover:text-slate-600 transition-colors`}
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {passwordValidationErrors?.new_password && (
                      <p className="text-[11px] font-bold text-red-600">
                        {passwordValidationErrors.new_password.join(' ')}
                      </p>
                    )}
                  </div>

                  {/* Confirm New Password Field */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-extrabold text-slate-700">
                      {language === 'en' ? 'Confirm New Password' : 'تأكيد كلمة المرور الجديدة'} <span className="text-[#F20530]">*</span>
                    </label>
                    <div className="relative">
                      <Lock className={`absolute inset-y-0 ${isRtl ? 'right-3' : 'left-3'} w-4 h-4 text-slate-400 my-auto`} />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        minLength={8}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`block w-full ${isRtl ? 'pr-9 pl-10' : 'pl-9 pr-10'} py-2.5 border rounded-xl text-xs font-semibold outline-none transition-all ${
                          passwordValidationErrors?.confirmPassword || passwordValidationErrors?.new_password_confirmation ? 'border-red-400 bg-red-50/20' : 'border-slate-200 focus:border-[#F20530]'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className={`absolute inset-y-0 ${isRtl ? 'left-3' : 'right-3'} my-auto text-slate-400 hover:text-slate-600 transition-colors`}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {(passwordValidationErrors?.confirmPassword || passwordValidationErrors?.new_password_confirmation) && (
                      <p className="text-[11px] font-bold text-red-600">
                        {(passwordValidationErrors.confirmPassword || passwordValidationErrors.new_password_confirmation)?.join(' ')}
                      </p>
                    )}
                  </div>

                  {/* Password Info Note */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-start gap-2.5 text-[11px] text-slate-500 font-semibold leading-relaxed">
                    <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>
                      {language === 'en'
                        ? 'Changing your password will automatically invalidate existing active session tokens on other devices, while maintaining your current session with a newly generated Sanctum token.'
                        : 'تغيير كلمة المرور سيؤدي تلقائيًا إلى إلغاء الرموز القديمة على الأجهزة الأخرى واستبدال رمز الجلسة الحالية لضمان استمرار دخولك بأمان.'}
                    </span>
                  </div>

                  {/* Submit Password Button */}
                  <div className={`pt-4 border-t border-slate-100 flex justify-end ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <button
                      type="submit"
                      disabled={isChangingPassword}
                      className="px-6 py-3 rounded-xl text-xs font-extrabold text-white bg-slate-900 hover:bg-slate-800 transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50"
                    >
                      {isChangingPassword ? (
                        <RefreshCw className="w-4 h-4 animate-spin text-[#F20530]" />
                      ) : (
                        <Key className="w-4 h-4 text-[#F20530]" />
                      )}
                      <span>
                        {isChangingPassword 
                          ? (language === 'en' ? 'Updating password...' : 'جاري تغيير كلمة المرور...') 
                          : (language === 'en' ? 'Change Password' : 'تحديث كلمة المرور')}
                      </span>
                    </button>
                  </div>

                </form>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>

      {/* MEDIA PICKER MODAL */}
      <AnimatePresence>
        {isMediaPickerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200"
            >
              {/* Header */}
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-[#F20530]" />
                  <h3 className="text-sm font-bold text-slate-900">
                    {language === 'en' ? 'Select Profile Image from Media Library' : 'اختر صورة الملف الشخصي من مكتبة الوسائط'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMediaPickerOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Grid / Content */}
              <div className="flex-1 overflow-y-auto p-4">
                {mediaLoading ? (
                  <div className="py-16 text-center space-y-3">
                    <RefreshCw className="w-8 h-8 text-[#F20530] animate-spin mx-auto" />
                    <p className="text-xs text-slate-500 font-semibold">
                      {language === 'en' ? 'Loading Media Library...' : 'جاري تحميل الصور من مكتبة الوسائط...'}
                    </p>
                  </div>
                ) : availableMedia.length === 0 ? (
                  <div className="py-16 text-center space-y-3">
                    <ImageIcon className="w-12 h-12 text-slate-300 mx-auto" />
                    <p className="text-xs text-slate-500 font-semibold">
                      {language === 'en' ? 'No images found in Media Library.' : 'لا توجد صور في مكتبة الوسائط حالياً.'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {availableMedia
                      .filter((m) => m.media_type === 'image')
                      .map((media) => {
                        const isSelected = profileMediaId === media.id;
                        return (
                          <div
                            key={media.id}
                            onClick={() => {
                              setProfileMediaId(media.id);
                              setSelectedMediaUrl(media.url);
                              setIsMediaPickerOpen(false);
                            }}
                            className={`group relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                              isSelected
                                ? 'border-[#F20530] ring-2 ring-rose-200'
                                : 'border-slate-200 hover:border-slate-400'
                            }`}
                          >
                            <img
                              src={media.url}
                              alt={media.alt_text || media.file_name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {isSelected && (
                              <div className="absolute inset-0 bg-[#F20530]/20 flex items-center justify-center">
                                <div className="w-7 h-7 rounded-full bg-[#F20530] text-white flex items-center justify-center shadow-md">
                                  <Check className="w-4 h-4" />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsMediaPickerOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  {language === 'en' ? 'Close' : 'إغلاق'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
