import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trash2, 
  Archive, 
  EyeOff, 
  UserX, 
  AlertTriangle, 
  X, 
  ArrowRight, 
  CheckCircle2, 
  RefreshCw,
  Lock,
  ChevronRight
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export type ConfirmationVariant = 'delete' | 'archive' | 'hide' | 'deactivate';

export interface PremiumConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  variant: ConfirmationVariant;
  itemName?: string; // Optional name of the item being targeted (e.g. "Campaign #3", "Service CLOUD-CORE")
  titleEn?: string;  // Custom title override (English)
  titleAr?: string;  // Custom title override (Arabic)
  descEn?: string;   // Custom description override (English)
  descAr?: string;   // Custom description override (Arabic)
  requireChallenge?: boolean; // If true, requires typing 'CONFIRM' or clicking a quick safe-lock checkbox
  confirmTextEn?: string; // Custom button text override
  confirmTextAr?: string;
}

export function PremiumConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  variant,
  itemName = '',
  titleEn,
  titleAr,
  descEn,
  descAr,
  requireChallenge = false,
  confirmTextEn,
  confirmTextAr
}: PremiumConfirmationDialogProps) {
  const { language, isRtl } = useLanguage();
  const [challengeInput, setChallengeInput] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Reset inputs when open state changes
  useEffect(() => {
    if (isOpen) {
      setChallengeInput('');
      setIsChecked(false);
      setIsSubmitting(false);
      setIsSuccess(false);
    }
  }, [isOpen]);

  // Variant Configuration
  const config = {
    delete: {
      icon: Trash2,
      colorClass: 'text-rose-600 bg-rose-50 border-rose-100',
      glowColor: 'shadow-rose-100/50',
      actionColor: 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500/20 text-white',
      accentBorder: 'border-rose-100 bg-rose-50/30',
      badgeTextEn: 'Critical Operation',
      badgeTextAr: 'عملية حرجة',
      defaultTitleEn: 'Delete Repository Permanently?',
      defaultTitleAr: 'هل ترغب في حذف السجل نهائياً؟',
      defaultDescEn: 'This action is irreversible. All associated database linkages, storage logs, and telemetry indexes will be permanently purged from our primary cluster nodes.',
      defaultDescAr: 'هذا الإجراء غير قابل للتراجع. سيتم مسح جميع روابط قواعد البيانات المقترنة، وسجلات التخزين، وفهارس القياس الفوري نهائياً من خوادمنا الرئيسية.',
      btnTextEn: 'Confirm & Delete Permanent',
      btnTextAr: 'تأكيد وحذف نهائي'
    },
    archive: {
      icon: Archive,
      colorClass: 'text-indigo-600 bg-indigo-50 border-indigo-100',
      glowColor: 'shadow-indigo-100/50',
      actionColor: 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500/20 text-white',
      accentBorder: 'border-indigo-100 bg-indigo-50/30',
      badgeTextEn: 'Resource Storage',
      badgeTextAr: 'نقل إلى المستودع',
      defaultTitleEn: 'Archive Resource Asset?',
      defaultTitleAr: 'أرشفة أصول الموارد ونقلها؟',
      defaultDescEn: 'Moving this to your archive removes it from active workspace queries. You can recover or restore it back online anytime from your admin registry settings.',
      defaultDescAr: 'سيؤدي نقل هذا الملف إلى الأرشيف إلى إزالته من مساحة العمل النشطة حالياً. يمكنك استعادته مجدداً إلى وضع الاتصال في أي وقت من سجلات الإدارة.',
      btnTextEn: 'Confirm & Archive Asset',
      btnTextAr: 'تأكيد وأرشفة الأصل'
    },
    hide: {
      icon: EyeOff,
      colorClass: 'text-slate-600 bg-slate-50 border-slate-100',
      glowColor: 'shadow-slate-100/50',
      actionColor: 'bg-slate-900 hover:bg-slate-800 focus:ring-slate-500/20 text-white',
      accentBorder: 'border-slate-150 bg-slate-50/30',
      badgeTextEn: 'Privacy Toggle',
      badgeTextAr: 'حجب الرؤية العامة',
      defaultTitleEn: 'Hide from Public Directory?',
      defaultTitleAr: 'إخفاء العنصر من الفهرس العام؟',
      defaultDescEn: 'Hiding this resource will keep it intact in your background servers but restrict it from appearing in public client-facing websites and portal widgets.',
      defaultDescAr: 'سيؤدي إخفاء هذا المورد إلى إبقائه سليماً تماماً في خوادمك الخلفية، مع تقييد ظهوره في المواقع العامة وواجهات المستخدم التي تظهر للعملاء والجمهور.',
      btnTextEn: 'Confirm & Hide Publicly',
      btnTextAr: 'تأكيد وإخفاء للعامة'
    },
    deactivate: {
      icon: UserX,
      colorClass: 'text-amber-600 bg-amber-50 border-amber-100',
      glowColor: 'shadow-amber-100/50',
      actionColor: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500/20 text-white',
      accentBorder: 'border-amber-100 bg-amber-50/30',
      badgeTextEn: 'Account Suspend',
      badgeTextAr: 'تعليق وتوقيف الحساب',
      defaultTitleEn: 'Deactivate Session Access?',
      defaultTitleAr: 'تعليق صلاحية الوصول للجلسة؟',
      defaultDescEn: 'Deactivating this credential immediately revokes security keys. Active sessions will be terminated and the user must re-verify security protocols to log in again.',
      defaultDescAr: 'يؤدي إلغاء تنشيط حساب الوصول هذا إلى إبطال مفاتيح الأمان فوراً. سيتم إنهاء كافة الجلسات النشطة، ويتعين على المستخدم إعادة التحقق لتسجيل الدخول.',
      btnTextEn: 'Deactivate Account Safely',
      btnTextAr: 'تعليق الحساب بأمان'
    }
  }[variant];

  const Icon = config.icon;

  // Compute Texts
  const title = language === 'en' ? (titleEn || config.defaultTitleEn) : (titleAr || config.defaultTitleAr);
  const description = language === 'en' ? (descEn || config.defaultDescEn) : (descAr || config.defaultDescAr);
  const confirmButtonText = language === 'en' ? (confirmTextEn || config.btnTextEn) : (confirmTextAr || config.btnTextAr);
  const badgeText = language === 'en' ? config.badgeTextEn : config.badgeTextAr;

  // Determine if confirm is enabled
  const isConfirmDisabled = requireChallenge 
    ? (challengeInput.toLowerCase() !== 'confirm' && !isChecked) 
    : false;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm();
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          
          {/* Backdrop blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm transition-all"
          />

          {/* Dialog Frame Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className={`bg-white w-full max-w-[460px] rounded-2xl border border-slate-200 shadow-2xl relative overflow-hidden z-10 p-6 space-y-6 ${
              isRtl ? 'text-right' : 'text-left'
            }`}
            id={`premium-confirm-dialog-${variant}`}
          >
            {/* Top Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-100"
              title={language === 'en' ? 'Close Dialog' : 'إغلاق النافذة'}
            >
              <X className="w-4 h-4" />
            </button>

            {/* Icon Header Grid */}
            <div className={`flex items-start gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <div className={`p-3 rounded-2xl border shrink-0 ${config.colorClass} shadow-md ${config.glowColor}`}>
                <Icon className="w-6 h-6" />
              </div>
              
              <div className="space-y-1">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider ${
                  variant === 'delete' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                  variant === 'archive' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                  variant === 'deactivate' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                  'bg-slate-50 text-slate-700 border border-slate-100'
                }`}>
                  {badgeText}
                </span>
                
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight leading-snug">
                  {title}
                </h3>
              </div>
            </div>

            {/* Description Body */}
            <div className={`space-y-3 p-4 rounded-xl border ${config.accentBorder}`}>
              <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                {description}
              </p>
              
              {itemName && (
                <div className={`flex items-center gap-1.5 text-xs ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <span className="text-slate-400 font-bold">{language === 'en' ? 'Target Resource:' : 'المورد المستهدف:'}</span>
                  <span className="font-mono font-extrabold text-slate-800 bg-white border border-slate-200/80 px-2 py-0.5 rounded-md text-[10px]">
                    {itemName}
                  </span>
                </div>
              )}
            </div>

            {/* Optional Challenge verification form */}
            {requireChallenge && (
              <div className="space-y-3 pt-1 border-t border-slate-100">
                <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  {language === 'en' ? 'Double-Verification Protocol' : 'بروتوكول التحقق الأمني المزدوج'}
                </span>

                {/* Challenge input */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-500">
                    {language === 'en' ? 'Type "confirm" to unlock the action:' : 'اكتب كلمة "confirm" بالإنجليزية لتنشيط العملية:'}
                  </label>
                  <input
                    type="text"
                    value={challengeInput}
                    onChange={(e) => setChallengeInput(e.target.value)}
                    placeholder="confirm"
                    className="block w-full px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold font-mono outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-100 transition-all text-center"
                  />
                </div>

                {/* OR check lock */}
                <div className={`flex items-center gap-2.5 pt-1 cursor-pointer ${isRtl ? 'flex-row-reverse' : ''}`} onClick={() => setIsChecked(!isChecked)}>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    className="w-4 h-4 rounded text-slate-900 focus:ring-0 border-slate-200 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-500 selection:bg-transparent">
                    {language === 'en' ? 'I authorize this administrative system override.' : 'أصرح بموجب هذا الإجراء الإداري للنظام.'}
                  </span>
                </div>
              </div>
            )}

            {/* Actions Footer */}
            <div className={`pt-3 border-t border-slate-100 flex items-center justify-end gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting || isSuccess}
                className="px-4 py-2.5 rounded-xl text-xs font-extrabold text-slate-500 hover:text-slate-700 hover:bg-slate-50 active:scale-95 transition-all cursor-pointer border border-transparent hover:border-slate-200/80 disabled:opacity-45"
              >
                {language === 'en' ? 'Cancel' : 'إلغاء الأمر'}
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || isSuccess || isConfirmDisabled}
                className={`px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-md disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 ${config.actionColor}`}
              >
                {isSubmitting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : isSuccess ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5" />
                )}
                <span>
                  {isSubmitting 
                    ? (language === 'en' ? 'Processing...' : 'جاري التنفيذ...') 
                    : isSuccess 
                    ? (language === 'en' ? 'Executed' : 'تم التنفيذ') 
                    : confirmButtonText
                  }
                </span>
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
