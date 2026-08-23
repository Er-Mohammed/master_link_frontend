import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { getRoleDisplay } from '../lib/permissions';
import { Logo } from './Logo';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Globe, 
  ArrowLeft, 
  AlertCircle, 
  Check, 
  ShieldCheck, 
  Database,
  Cpu,
  Layers,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdminLoginProps {
  onBackToLanding: () => void;
  onLoginSuccess: () => void;
}

export function AdminLogin({ onBackToLanding, onLoginSuccess }: AdminLoginProps) {
  const { language, setLanguage, isRtl } = useLanguage();
  const { login } = useAuth();
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // Validation / Feedback states
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  const validateForm = () => {
    let isValid = true;
    
    // Email check
    if (!email) {
      setEmailError(language === 'en' ? 'Email address is required' : 'البريد الإلكتروني مطلوب');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError(language === 'en' ? 'Please enter a valid email address' : 'يرجى إدخال بريد إلكتروني صحيح');
      isValid = false;
    } else {
      setEmailError('');
    }

    // Password check
    if (!password) {
      setPasswordError(language === 'en' ? 'Password is required' : 'كلمة المرور مطلوبة');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError(language === 'en' ? 'Password must be at least 6 characters' : 'كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      isValid = false;
    } else {
      setPasswordError('');
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setNotification(null);
    
    const result = await login(email, password);

    if (result.success) {
      setIsSubmitting(false);
      setLoginSuccess(true);
      const successMsgEn = 'Successfully authenticated. Redirecting to MasterLink Command Dashboard...';
      const successMsgAr = 'تم التحقق بنجاح. جاري توجيهك إلى لوحة تحكم ماستر لينك...';
      setNotification({
        message: isRtl ? successMsgAr : successMsgEn,
        type: 'success'
      });
      setTimeout(() => {
        onLoginSuccess();
      }, 1200);
    } else {
      setIsSubmitting(false);
      // Map error message to Arabic if needed
      let errorMessage = result.error || (language === 'en' ? 'Authentication failed. Please verify credentials.' : 'فشل التحقق من الهوية. يرجى التأكد من البيانات المدخلة.');
      
      // Translate common backend error messages
      if (isRtl && errorMessage) {
        if (errorMessage.toLowerCase().includes('invalid') || errorMessage.toLowerCase().includes('credentials')) {
          errorMessage = 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
        } else if (errorMessage.toLowerCase().includes('inactive') || errorMessage.toLowerCase().includes('forbidden')) {
          errorMessage = 'الحساب غير نشط أو الوصول محظور';
        } else if (errorMessage.toLowerCase().includes('server error') || errorMessage.toLowerCase().includes('try again')) {
          errorMessage = 'خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقاً.';
        } else if (errorMessage.toLowerCase().includes('validation')) {
          errorMessage = 'يرجى التحقق من البيانات المدخلة';
        }
      }
      
      setNotification({
        message: errorMessage,
        type: 'error'
      });
    }
  };

  // Localized copy
  const t = {
    adminTitle: language === 'en' ? 'Admin Login' : 'تسجيل دخول المشرف',
    adminSubtitle: language === 'en' ? 'Sign in to access MasterLink Control Panel' : 'قم بتسجيل الدخول للوصول إلى لوحة تحكم ماستر لينك',
    emailLabel: language === 'en' ? 'Email Address' : 'البريد الإلكتروني',
    emailPlaceholder: language === 'en' ? 'name@masterlink.com' : 'name@masterlink.com',
    passwordLabel: language === 'en' ? 'Password' : 'كلمة المرور',
    passwordPlaceholder: language === 'en' ? '••••••••' : '••••••••',
    rememberMe: language === 'en' ? 'Remember this device' : 'تذكر هذا الجهاز',
    forgotPassword: language === 'en' ? 'Forgot password?' : 'نسيت كلمة المرور؟',
    signInButton: language === 'en' ? 'Sign In to Dashboard' : 'تسجيل الدخول للوحة التحكم',
    signingIn: language === 'en' ? 'Authenticating...' : 'جاري التحقق من الهوية...',
    welcomeEn: 'Enterprise Control Unit',
    welcomeAr: 'وحدة التحكم الرئيسية للمؤسسات',
    welcomeDescEn: 'Manage network nodes, telemetry links, custom digital assets, and customer deployments in one single-pane platform.',
    welcomeDescAr: 'إدارة عقد الشبكة، وصلات الاتصال اللاسلكي، الأصول الرقمية المخصصة، وعمليات نشر العملاء في منصة موحدة واحدة.',
    backLanding: language === 'en' ? 'Back to Digital Agency Site' : 'العودة لموقع الوكالة الرقمية',
    systemStatus: language === 'en' ? 'All Core Systems Active' : 'جميع الأنظمة الأساسية نشطة',
  };

  return (
    <div className={`min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col justify-between antialiased selection:bg-[#F20530] selection:text-white ${isRtl ? 'rtl-active' : 'ltr-active'}`}>
      
      {/* Top Bar with Agency Redirection and Language Switcher */}
      <header className="w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <button
          onClick={onBackToLanding}
          className="group flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer border border-transparent hover:border-slate-200"
        >
          <ArrowLeft className={`w-4 h-4 transition-transform group-hover:-translate-x-1 ${isRtl ? 'rotate-180 group-hover:translate-x-1' : ''}`} />
          <span>{t.backLanding}</span>
        </button>

        <button
          onClick={toggleLanguage}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer border border-transparent hover:border-slate-200"
        >
          <Globe className="w-4 h-4 text-[#F20530]" />
          <span>{language === 'en' ? 'العربية' : 'English'}</span>
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10">
        <div className="w-full max-w-5xl bg-white rounded-[24px] shadow-xl shadow-slate-100 border border-slate-100 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
          
          {/* Left Column: Visual Brand Identity & Tech Illustration (Hidden on mobile/tablet) */}
          <div className="hidden lg:flex lg:col-span-5 bg-[#F8FAFC] border-r border-slate-200 p-12 flex-col justify-between relative overflow-hidden">
            
            {/* Ambient Background Soft Glows */}
            <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-[#F20530]/5 blur-[80px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-[#5683FC]/5 blur-[80px] rounded-full pointer-events-none" />

            {/* Brand Logo & Unit badge */}
            <div className="relative z-10">
              <Logo variant="login" className="h-16 sm:h-20 max-w-[240px]" imgClassName="h-full w-auto max-w-full object-contain" />
            </div>

            {/* Premium Vector Tech Illustration */}
            <div className="relative z-10 py-10 flex items-center justify-center">
              <div className="w-full max-w-[280px] aspect-square relative">
                
                {/* Center Node */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-2xl bg-white border-2 border-[#F20530] flex items-center justify-center shadow-xl shadow-[#F20530]/10 animate-pulse">
                  <Cpu className="w-9 h-9 text-[#F20530]" />
                </div>

                {/* Orbit Line 1 */}
                <div className="absolute inset-0 border border-slate-200 rounded-full animate-spin [animation-duration:15s]" />
                
                {/* Orbit Line 2 */}
                <div className="absolute inset-6 border border-dashed border-slate-300 rounded-full animate-spin [animation-duration:10s] [animation-direction:reverse]" />
                
                {/* Orbit Node - Database (Blue #5683FC) */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-white border border-[#5683FC] text-[#5683FC] shadow-md">
                  <Database className="w-4 h-4" />
                </div>

                {/* Orbit Node - Security (Red #F20530) */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 translate-y-1/2 p-2.5 rounded-xl bg-white border border-[#F20530] text-[#F20530] shadow-md">
                  <ShieldCheck className="w-4 h-4" />
                </div>

                {/* Orbit Node - Infrastructure (Light blue #5371C0) */}
                <div className="absolute left-2 top-1/2 -translate-y-1/2 -translate-x-1/2 p-2.5 rounded-xl bg-white border border-[#5371C0] text-[#5371C0] shadow-md">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Bottom brand tagline */}
            <div className="relative z-10 space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold tracking-wider uppercase border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                {t.systemStatus}
              </span>
              <h3 className="text-slate-900 font-bold text-lg leading-tight">
                {language === 'en' ? t.welcomeEn : t.welcomeAr}
              </h3>
              <p className="text-slate-600 text-xs font-normal leading-relaxed">
                {language === 'en' ? t.welcomeDescEn : t.welcomeDescAr}
              </p>
            </div>
          </div>

          {/* Right Column: Premium Login Form */}
          <div className="col-span-1 lg:col-span-7 p-8 sm:p-12 lg:p-14 flex flex-col justify-between">
            
            {/* Header branding for mobile view only */}
            <div className="flex lg:hidden items-center gap-2.5 mb-8">
              <Logo variant="login" className="h-12 sm:h-14 max-w-[200px]" imgClassName="h-full w-auto max-w-full object-contain" />
            </div>

            {/* Form Content */}
            <div className="my-auto">
              <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-none mb-2.5 font-display">
                  {t.adminTitle}
                </h1>
                <p className="text-slate-500 text-sm font-medium">
                  {t.adminSubtitle}
                </p>
              </div>

              {/* System Messages Banner */}
              <AnimatePresence mode="wait">
                {notification && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`p-4 rounded-xl border mb-6 text-xs font-medium flex items-start gap-3 ${
                      notification.type === 'success' 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-100' 
                        : notification.type === 'info'
                        ? 'bg-blue-50 text-blue-800 border-blue-100'
                        : 'bg-rose-50 text-[#F20530] border-rose-100'
                    }`}
                  >
                    {notification.type === 'success' ? (
                      <Check className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                    ) : (
                      <AlertCircle className={`w-4 h-4 shrink-0 mt-0.5 ${notification.type === 'info' ? 'text-blue-600' : 'text-[#F20530]'}`} />
                    )}
                    <span className="leading-relaxed">{notification.message}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Actual Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Email Field Container */}
                <div className="space-y-2">
                  <label htmlFor="admin-email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    {t.emailLabel}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="admin-email"
                      type="email"
                      autoComplete="email"
                      disabled={isSubmitting || loginSuccess}
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailError) setEmailError('');
                      }}
                      placeholder={t.emailPlaceholder}
                      className={`block w-full pl-11 pr-4 py-3.5 text-slate-900 bg-slate-50/50 hover:bg-slate-50 border rounded-xl text-sm font-semibold transition-all outline-none focus:bg-white ${
                        emailError 
                          ? 'border-[#F20530] focus:ring-2 focus:ring-[#F20530]/20' 
                          : 'border-slate-200/80 focus:border-[#F20530] focus:ring-4 focus:ring-[#F20530]/5'
                      } disabled:opacity-60 disabled:cursor-not-allowed`}
                    />
                  </div>
                  {emailError && (
                    <p className="text-xs font-semibold text-[#F20530] flex items-center gap-1.5 mt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{emailError}</span>
                    </p>
                  )}
                </div>

                {/* Password Field Container */}
                <div className="space-y-2">
                  <label htmlFor="admin-password" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    {t.passwordLabel}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="admin-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      disabled={isSubmitting || loginSuccess}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (passwordError) setPasswordError('');
                      }}
                      placeholder={t.passwordPlaceholder}
                      className={`block w-full pl-11 pr-12 py-3.5 text-slate-900 bg-slate-50/50 hover:bg-slate-50 border rounded-xl text-sm font-semibold transition-all outline-none focus:bg-white ${
                        passwordError 
                          ? 'border-[#F20530] focus:ring-2 focus:ring-[#F20530]/20' 
                          : 'border-slate-200/80 focus:border-[#F20530] focus:ring-4 focus:ring-[#F20530]/5'
                      } disabled:opacity-60 disabled:cursor-not-allowed`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {passwordError && (
                    <p className="text-xs font-semibold text-[#F20530] flex items-center gap-1.5 mt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{passwordError}</span>
                    </p>
                  )}
                </div>

                {/* Remember Me Toggle */}
                <div className="flex items-center">
                  <label className="flex items-center gap-2.5 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        disabled={isSubmitting || loginSuccess}
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="sr-only"
                      />
                      <div className={`w-4.5 h-4.5 rounded-md border transition-all flex items-center justify-center ${
                        rememberMe 
                          ? 'bg-[#F20530] border-[#F20530] shadow-sm' 
                          : 'border-slate-300 bg-white group-hover:border-slate-400'
                      }`}>
                        {rememberMe && <Check className="w-3 h-3 text-white stroke-[3.5]" />}
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-slate-600 select-none group-hover:text-slate-900 transition-colors">
                      {t.rememberMe}
                    </span>
                  </label>
                </div>

                {/* Primary login CTA Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || loginSuccess}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-sm font-extrabold text-white bg-[#F20530] hover:bg-rose-600 active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-rose-100 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>{t.signingIn}</span>
                    </>
                  ) : (
                    <span>{t.signInButton}</span>
                  )}
                </button>

              </form>
            </div>

            {/* Micro footer inside the form area */}
            <div className="pt-8 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-400">
              <span>&copy; MasterLink 2026</span>
              <div className="flex items-center gap-1.5 hover:text-slate-600 transition-colors cursor-pointer" onClick={onBackToLanding}>
                <span>Control Tower Platform</span>
                <ExternalLink className="w-3 h-3" />
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Footer copyright */}
      <footer className="w-full text-center py-6 text-xs font-medium text-slate-400">
        <p>Enterprise Zero-Trust Certified &bull; SSL Encrypted Protocol</p>
      </footer>

    </div>
  );
}
