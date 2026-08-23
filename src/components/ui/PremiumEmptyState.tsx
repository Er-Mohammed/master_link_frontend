import React from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, 
  ArrowRight, 
  Layers, 
  FileText, 
  Image as ImageIcon, 
  Calendar, 
  Briefcase,
  Plus,
  HelpCircle,
  Search,
  BookOpen,
  Compass,
  UploadCloud,
  ChevronRight,
  Clock,
  ExternalLink
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export type EmptyStateVariant = 'services' | 'projects' | 'posts' | 'media' | 'consultations';

export interface PremiumEmptyStateProps {
  variant: EmptyStateVariant;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  primaryActionTextEn?: string;
  primaryActionTextAr?: string;
  secondaryActionTextEn?: string;
  secondaryActionTextAr?: string;
  customTitleEn?: string;
  customTitleAr?: string;
  customDescEn?: string;
  customDescAr?: string;
}

export function PremiumEmptyState({
  variant,
  onPrimaryAction,
  onSecondaryAction,
  primaryActionTextEn,
  primaryActionTextAr,
  secondaryActionTextEn,
  secondaryActionTextAr,
  customTitleEn,
  customTitleAr,
  customDescEn,
  customDescAr
}: PremiumEmptyStateProps) {
  const { language, isRtl } = useLanguage();

  // Illustrations configured using highly customized CSS/SVG/Framer Motion setups
  const renderIllustration = () => {
    switch (variant) {
      case 'services':
        // Modern isometric service catalog block assembly with scanning rays
        return (
          <div className="relative w-48 h-40 mx-auto flex items-center justify-center">
            {/* Blueprint grid background */}
            <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1.5px,transparent_1.5px)] [background-size:12px_12px] opacity-70" />
            
            {/* Center concentric glowing rings */}
            <div className="absolute w-24 h-24 rounded-full border border-rose-100/80 bg-rose-50/20 animate-pulse" />
            <div className="absolute w-16 h-16 rounded-full border border-dashed border-rose-200/50" />

            {/* Floating isometric boxes with Framer Motion */}
            <motion.div
              animate={{ 
                y: [0, -10, 0],
                rotateY: [0, 15, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute z-10 w-12 h-12 rounded-xl bg-white border border-rose-100 shadow-md flex items-center justify-center text-rose-500"
            >
              <Layers className="w-6 h-6" />
            </motion.div>

            {/* Orbiting auxiliary blocks */}
            <motion.div
              animate={{ 
                y: [4, -4, 4],
                x: [-15, -10, -15]
              }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute left-6 top-8 w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 shadow-sm flex items-center justify-center text-indigo-500 text-xs font-bold"
            >
              <Plus className="w-4 h-4" />
            </motion.div>

            <motion.div
              animate={{ 
                y: [-3, 3, -3],
                x: [15, 10, 15]
              }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute right-6 bottom-8 w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 shadow-sm flex items-center justify-center text-amber-500"
            >
              <Sparkles className="w-4 h-4" />
            </motion.div>

            {/* Laser scanning line */}
            <motion.div
              animate={{ 
                y: [0, 40, 0],
                opacity: [0.1, 0.6, 0.1]
              }}
              transition={{ duration: 2.8, repeat: Infinity, ease: "linear" }}
              className="absolute top-8 left-12 right-12 h-[2px] bg-gradient-to-r from-transparent via-rose-500 to-transparent blur-[1px]"
            />
          </div>
        );

      case 'projects':
        // Wireframe drafting drawing board with a floating stellar sphere
        return (
          <div className="relative w-48 h-40 mx-auto flex items-center justify-center">
            {/* Grid canvas background */}
            <div className="absolute inset-0 bg-[radial-gradient(#e0f2fe_2px,transparent_2px)] [background-size:16px_16px] opacity-60" />
            
            {/* Main structural wireframe frame */}
            <div className="absolute w-28 h-20 rounded-lg border-2 border-dashed border-sky-200/80 bg-sky-50/20 flex items-center justify-center" />

            {/* Floating architect sphere */}
            <motion.div
              animate={{ 
                y: [-8, 8, -8],
                scale: [0.95, 1.05, 0.95]
              }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute w-12 h-12 rounded-full bg-gradient-to-tr from-sky-400 to-blue-600 shadow-lg shadow-sky-200 flex items-center justify-center text-white"
            >
              <Briefcase className="w-5 h-5" />
            </motion.div>

            {/* Drafting ticks / ruler bars */}
            <div className="absolute bottom-6 left-12 w-24 h-1 bg-sky-100 rounded-full" />
            <div className="absolute bottom-6 left-16 w-16 h-1 bg-sky-300 rounded-full" />
            
            {/* Target scope crosshair */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              className="absolute w-18 h-18 border border-dashed border-sky-400/30 rounded-full"
            />
          </div>
        );

      case 'posts':
        // Editorial digital notebook sheet with pen guides and text tracks
        return (
          <div className="relative w-48 h-40 mx-auto flex items-center justify-center">
            {/* Sheet background */}
            <motion.div
              initial={{ rotate: -2 }}
              animate={{ rotate: [2, -2, 2] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute w-28 h-36 bg-white border border-slate-200 rounded-xl shadow-md p-3.5 flex flex-col justify-between"
            >
              {/* Header paper simulation */}
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <div className="w-12 h-2 bg-slate-100 rounded-full" />
              </div>

              {/* Text tracks lines */}
              <div className="space-y-2 mt-4 flex-1">
                <div className="h-1.5 bg-slate-100 rounded-full w-full" />
                <div className="h-1.5 bg-slate-100 rounded-full w-5/6" />
                <div className="h-1.5 bg-slate-100 rounded-full w-4/5" />
                <div className="h-1.5 bg-slate-100 rounded-full w-2/3" />
              </div>

              {/* Footer status bar */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-2">
                <div className="w-6 h-1.5 bg-indigo-50 rounded-full" />
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
              </div>
            </motion.div>

            {/* Glowing search glass tracking the written post */}
            <motion.div
              animate={{ 
                x: [15, -15, 15],
                y: [10, -10, 10]
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute z-10 w-9 h-9 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-500 shadow-md flex items-center justify-center text-white text-xs font-bold"
            >
              <Sparkles className="w-4 h-4" />
            </motion.div>
          </div>
        );

      case 'media':
        // Glowing cylinder server cabinet hosting interactive floating file/image plates
        return (
          <div className="relative w-48 h-40 mx-auto flex items-center justify-center">
            {/* Concentric waves */}
            <div className="absolute w-32 h-32 rounded-full border border-violet-100 bg-violet-50/10 animate-ping" style={{ animationDuration: '3s' }} />

            {/* Interactive cloud upload server */}
            <motion.div
              animate={{ 
                y: [-6, 6, -6],
              }}
              transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-lg shadow-violet-200 flex items-center justify-center text-white"
            >
              <UploadCloud className="w-9 h-9" />
            </motion.div>

            {/* Floating Polaroid Image cards */}
            <motion.div
              animate={{ 
                x: [-35, -45, -35],
                y: [-25, -20, -25],
                rotate: [-8, -12, -8]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute w-10 h-10 rounded bg-white border border-slate-150 p-1 shadow-sm flex flex-col justify-between"
            >
              <div className="bg-slate-100 w-full h-5 rounded-xs flex items-center justify-center">
                <ImageIcon className="w-3.5 h-3.5 text-violet-400" />
              </div>
              <div className="w-4 h-1 bg-slate-200 rounded-full" />
            </motion.div>

            <motion.div
              animate={{ 
                x: [35, 45, 35],
                y: [20, 15, 20],
                rotate: [12, 8, 12]
              }}
              transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute w-10 h-10 rounded bg-white border border-slate-150 p-1 shadow-sm flex flex-col justify-between"
            >
              <div className="bg-slate-100 w-full h-5 rounded-xs flex items-center justify-center">
                <ImageIcon className="w-3.5 h-3.5 text-fuchsia-400" />
              </div>
              <div className="w-5 h-1 bg-slate-200 rounded-full" />
            </motion.div>
          </div>
        );

      case 'consultations':
        // Modern calendar agenda sheet with a ticking elegant clock node
        return (
          <div className="relative w-48 h-40 mx-auto flex items-center justify-center">
            {/* Grid alignment backdrop */}
            <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1.5px,transparent_1.5px)] [background-size:14px_14px] opacity-50" />
            
            {/* Glassmorphism calendar widget mockup */}
            <div className="absolute w-28 h-24 rounded-2xl border border-slate-200/80 bg-white/70 backdrop-blur-xs p-3 shadow-md flex flex-col justify-between">
              {/* Header Red Strip */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <div className="w-10 h-2 bg-slate-100 rounded-full" />
                </div>
                <Calendar className="w-3.5 h-3.5 text-emerald-500" />
              </div>

              {/* Time grid rows */}
              <div className="space-y-1.5 mt-2 flex-1">
                <div className="flex items-center gap-1">
                  <div className="w-6 h-1.5 bg-slate-100 rounded-full" />
                  <div className="flex-1 h-3 bg-emerald-50/80 rounded-sm border border-emerald-100/60" />
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-6 h-1.5 bg-slate-100 rounded-full" />
                  <div className="flex-1 h-3 bg-slate-50 rounded-sm" />
                </div>
              </div>
            </div>

            {/* Hovering Clock */}
            <motion.div
              animate={{ 
                y: [-6, 6, -6],
                rotate: [0, 4, 0]
              }}
              transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -right-4 bottom-4 w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 shadow-md flex items-center justify-center text-white"
            >
              <Clock className="w-4 h-4 animate-pulse" />
            </motion.div>
          </div>
        );
    }
  };

  // Base Data configurations
  const baseConfig = {
    services: {
      defaultTitleEn: 'No Services Formulated Yet',
      defaultTitleAr: 'لم يتم إنشاء أي خدمات بعد',
      defaultDescEn: 'Formulate and publish high-converting digital service tiers, hourly consultancy models, or package items to initiate automatic client-onboarding pipelines.',
      defaultDescAr: 'قم بصياغة ونشر باقات الخدمات الرقمية المتكاملة، أو الاستشارات بالساعة، لتفعيل مسارات العمل الإلكترونية لعملائك ومؤسستك.',
      primaryBtnEn: 'Create New Service',
      primaryBtnAr: 'إضافة خدمة جديدة',
      secondaryBtnEn: 'Browse Library Templates',
      secondaryBtnAr: 'تصفح النماذج والمسودات'
    },
    projects: {
      defaultTitleEn: 'Your Portfolio Stage is Empty',
      defaultTitleAr: 'معرض أعمالك فارغ حالياً',
      defaultDescEn: 'Showcase your masterpieces, technical case studies, and engineering achievements to prove real-world delivery competence to prospective clients.',
      defaultDescAr: 'ابدأ بعرض روائع تصميماتك، دراسات الحالة التقنية، والإنجازات الهندسية لإثبات كفاءتك المهنية الموثوقة لزوار موقعك.',
      primaryBtnEn: 'Add Case Study Project',
      primaryBtnAr: 'إضافة مشروع جديد',
      secondaryBtnEn: 'Import from GitHub Repos',
      secondaryBtnAr: 'استيراد من مستودعات جيت هاب'
    },
    posts: {
      defaultTitleEn: 'No Editorial Articles Published',
      defaultTitleAr: 'لا توجد مقالات منشورة بعد',
      defaultDescEn: 'Begin drafting business insights, technical updates, and expert opinions to educate visitors, capture email newsletter signups, and build authority.',
      defaultDescAr: 'ابدأ بكتابة المقالات الغنية بالرؤى التجارية، والشروحات الفنية، لتعليم زوار موقعك وبناء سمعة ريادية وقاعدة مشتركين قوية.',
      primaryBtnEn: 'Draft First Article',
      primaryBtnAr: 'كتابة مقال جديد',
      secondaryBtnEn: 'Manage Content Categories',
      secondaryBtnAr: 'إدارة تصنيفات المحتوى'
    },
    media: {
      defaultTitleEn: 'Media Storage Vault is Empty',
      defaultTitleAr: 'مستودع الوسائط والملفات فارغ',
      defaultDescEn: 'Centralize your vector icons, brand imagery, documents, and corporate video elements. Instantly hosted on CDN edges for blazing load performance.',
      defaultDescAr: 'قم بجمع وتنظيم أيقوناتك البصرية، صور العلامات التجارية، والملفات التعريفية. يتم استضافتها على خوادم سحابية لسرعة استجابة فائقة.',
      primaryBtnEn: 'Upload Digital Assets',
      primaryBtnAr: 'رفع ملفات الوسائط',
      secondaryBtnEn: 'Link External Drive Cloud',
      secondaryBtnAr: 'ربط سحابة تخزين خارجية'
    },
    consultations: {
      defaultTitleEn: 'No Inbound Meeting Bookings Yet',
      defaultTitleAr: 'لا توجد حجوزات استشارية بعد',
      defaultDescEn: 'When active visitors schedule advisory sessions, brief project audits, or secure strategist consultations, their slots and agendas will populate here.',
      defaultDescAr: 'بمجرد قيام زوار موقعك بحجز مكالمات استشارية، أو جلسات تدقيق تقنية، ستظهر تفاصيل الحجوزات، والأجندة المقترحة، وروابط الاجتماعات هنا.',
      primaryBtnEn: 'Configure Work Schedule',
      primaryBtnAr: 'إعداد جدول المواعيد',
      secondaryBtnEn: 'Consultation Preferences',
      secondaryBtnAr: 'تفضيلات المقابلات'
    }
  }[variant];

  // Resolve strings based on custom or default setup
  const title = language === 'en' 
    ? (customTitleEn || baseConfig.defaultTitleEn) 
    : (customTitleAr || baseConfig.defaultTitleAr);

  const description = language === 'en' 
    ? (customDescEn || baseConfig.defaultDescEn) 
    : (customDescAr || baseConfig.defaultDescAr);

  const primaryBtnText = language === 'en' 
    ? (primaryActionTextEn || baseConfig.primaryBtnEn) 
    : (primaryActionTextAr || baseConfig.primaryBtnAr);

  const secondaryBtnText = language === 'en' 
    ? (secondaryActionTextEn || baseConfig.secondaryBtnEn) 
    : (secondaryActionTextAr || baseConfig.secondaryBtnAr);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-sm relative overflow-hidden space-y-6"
      id={`premium-empty-state-${variant}`}
    >
      {/* Visual illustration top frame */}
      <div className="flex items-center justify-center">
        {renderIllustration()}
      </div>

      {/* Header textual content */}
      <div className="space-y-2.5 max-w-lg mx-auto">
        <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
          {title}
        </h3>
        <p className="text-xs text-slate-500 font-semibold leading-relaxed">
          {description}
        </p>
      </div>

      {/* Action Buttons Footer Frame */}
      {(onPrimaryAction || onSecondaryAction) && (
        <div className={`flex flex-col sm:flex-row items-center justify-center gap-3 pt-3 max-w-md mx-auto ${isRtl ? 'sm:flex-row-reverse' : ''}`}>
          {onPrimaryAction && (
            <button
              onClick={onPrimaryAction}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-extrabold hover:bg-slate-800 active:scale-95 transition-all shadow-md cursor-pointer border border-transparent"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>{primaryBtnText}</span>
            </button>
          )}

          {onSecondaryAction && (
            <button
              onClick={onSecondaryAction}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-50 text-slate-600 text-xs font-extrabold hover:bg-slate-100 hover:text-slate-800 active:scale-95 transition-all border border-slate-200/85 cursor-pointer"
            >
              <span>{secondaryBtnText}</span>
              <ArrowRight className={`w-3.5 h-3.5 shrink-0 ${isRtl ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}
