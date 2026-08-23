import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, ArrowRight, ArrowLeft, CheckCircle2, Building, Mail, User, Phone, Globe, MessageSquare, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { pushSystemNotification } from './NotificationCenter';

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const modalTranslations = {
  en: {
    requestConsultation: 'Request Free Consultation',
    stepOf: (curr: number, total: number) => `Step ${curr} of ${total}`,
    steps: {
      1: 'Contact Details',
      2: 'Project Scope',
      3: 'Project Brief',
      4: 'Review & Submit'
    } as Record<number, string>,
    successTitle: 'Consultation Request Received!',
    successDesc: (name: string) => name 
      ? `Thank you, ${name}. Your consultation request has been received. Our team will review your project details and reach out to you directly.`
      : `Thank you. Your consultation request has been received. Our team will review your project details and reach out to you directly.`,
    servicesRequested: 'Services Requested:',
    generalInquiry: 'General Inquiry',
    backHome: 'Back to Homepage',
    labels: {
      fullName: 'Full Name *',
      emailAddress: 'Email Address (Optional)',
      phoneNumber: 'Phone Number *',
      companyName: 'Company Name *',
      companyWebsite: 'Company Website (Optional)',
      selectServices: 'Select Services Needed *',
      selectServicesSub: 'Select as many as apply to your requirements',
      budgetRange: 'Project Budget Range',
      timeline: 'Desired Timeline',
      goalsDesc: 'Project Goals & Description',
      goalsSub: 'Briefly describe what you are looking to achieve, major challenges, or specific parameters',
      summaryTitle: 'Information Summary',
      agreeTerms: 'By submitting this form, you agree to receive a diagnostic brief and follow-up emails from Master Link in compliance with our Privacy Policy.',
    },
    placeholders: {
      name: 'e.g., Alexander Mercer',
      email: 'e.g., alexander@company.com',
      phone: 'e.g., +1 (555) 019-2834',
      company: 'e.g., Acme Corporation',
      website: 'e.g., https://acme.com',
      budget: 'Select a budget range...',
      timeline: 'Select desired timeline...',
      brief: 'Tell us about your brand, technology targets, marketing goals, or current bottlenecks...'
    },
    budgets: [
      { value: '<$10,000', label: 'Less than $10,000' },
      { value: '$10,000 - $25,000', label: '$10,000 – $25,000' },
      { value: '$25,000 - $50,000', label: '$25,000 – $50,000' },
      { value: '$50,000 - $100,000', label: '$50,000 – $100,000' },
      { value: '$100,000+', label: '$100,000 or more' }
    ],
    timelines: [
      { value: 'Urgent (< 1 month)', label: 'Urgent (Less than 1 month)' },
      { value: '1 - 3 months', label: '1 to 3 months' },
      { value: '3 - 6 months', label: '3 to 6 months' },
      { value: 'Flexible', label: 'Flexible / Ongoing' }
    ],
    aiProcessing: 'AI-Assisted Processing:',
    aiProcessingSub: 'Our backend matches your brief with relevant past project blueprints from Master Link to fast-track your tailored proposal deck.',
    actions: {
      back: 'Back',
      continue: 'Continue',
      scheduling: 'Scheduling...',
      bookFree: 'Book Free Session'
    }
  },
  ar: {
    requestConsultation: 'طلب استشارة مجانية',
    stepOf: (curr: number, total: number) => `الخطوة ${curr} من ${total}`,
    steps: {
      1: 'تفاصيل الاتصال',
      2: 'نطاق المشروع',
      3: 'تفاصيل المشروع',
      4: 'المراجعة والإرسال'
    } as Record<number, string>,
    successTitle: 'تم استلام طلب الاستشارة بنجاح!',
    successDesc: (name: string) => name 
      ? `شكراً لك يا ${name}. تم تسجيل طلب الاستشارة بنجاح، وسيقوم فريقنا بمراجعة تفاصيل مشروعك والتواصل معك مباشرة لمناقشة خطة العمل.`
      : `شكراً لك. تم تسجيل طلب الاستشارة بنجاح، وسيقوم فريقنا بمراجعة تفاصيل مشروعك والتواصل معك مباشرة لمناقشة خطة العمل.`,
    servicesRequested: 'الخدمات المطلوبة:',
    generalInquiry: 'استفسار عام',
    backHome: 'العودة للصفحة الرئيسية',
    labels: {
      fullName: 'الاسم الكامل *',
      emailAddress: 'البريد الإلكتروني (اختياري)',
      phoneNumber: 'رقم الهاتف *',
      companyName: 'اسم الشركة *',
      companyWebsite: 'موقع الشركة الإلكتروني (اختياري)',
      selectServices: 'اختر الخدمات المطلوبة *',
      selectServicesSub: 'يرجى تحديد جميع الخدمات المناسبة لاحتياجاتك',
      budgetRange: 'ميزانية المشروع التقريبية',
      timeline: 'الجدول الزمني المطلوب',
      goalsDesc: 'أهداف وتفاصيل المشروع',
      goalsSub: 'صف باختصار ما تأمل في تحقيقه، والتحديات الأساسية، أو أي متمتطلبات محددة',
      summaryTitle: 'ملخص المعلومات',
      agreeTerms: 'بإرسال هذا النموذج، فإنك توافق على تلقي ملخص تشخيصي ورسائل تواصل لاحقة من ماستر لينك بما يتوافق مع سياسة الخصوصية لدينا.',
    },
    placeholders: {
      name: 'مثال: ألكسندر ميرسر',
      email: 'مثال: alexander@company.com',
      phone: 'مثال: +1 (555) 019-2834',
      company: 'مثال: شركة أكمي',
      website: 'مثال: https://acme.com',
      budget: 'حدد نطاق الميزانية...',
      timeline: 'حدد الجدول الزمني المناسب...',
      brief: 'أخبرنا عن علامتك التجارية، والأهداف التقنية، والأهداف التسويقية، أو أي عقبات حالية...'
    },
    budgets: [
      { value: '<$10,000', label: 'أقل من 10,000 دولار' },
      { value: '$10,000 - $25,000', label: '10,000 دولار - 25,000 دولار' },
      { value: '$25,000 - $50,000', label: '25,000 دولار - 50,000 دولار' },
      { value: '$50,000 - $100,000', label: '50,000 دولار - 100,000 دولار' },
      { value: '$100,000+', label: '100,000 دولار أو أكثر' }
    ],
    timelines: [
      { value: 'Urgent (< 1 month)', label: 'عاجل (أقل من شهر)' },
      { value: '1 - 3 months', label: 'من شهر إلى 3 أشهر' },
      { value: '3 - 6 months', label: 'من 3 إلى 6 أشهر' },
      { value: 'Flexible', label: 'مرن / مستمر' }
    ],
    aiProcessing: 'المعالجة المدعومة بالذكاء الاصطناعي:',
    aiProcessingSub: 'يقوم نظامنا بمطابقة متطلباتك مع النماذج السابقة لمشاريع ماستر لينك لتسريع إعداد عرضك المخصص.',
    actions: {
      back: 'رجوع',
      continue: 'متابعة',
      scheduling: 'جاري الجدولة...',
      bookFree: 'حجز الجلسة المجانية'
    }
  }
};

export function ConsultationModal({ isOpen, onClose }: ConsultationModalProps) {
  const [step, setStep] = useState(1);
  const { language, isRtl } = useLanguage();
  const { addConsultation } = useData();
  const mt = language === 'ar' ? modalTranslations.ar : modalTranslations.en;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    website: '',
    services: [] as string[],
    budget: '',
    timeline: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const toggleService = (service: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Save directly to DataContext for live Admin Panel sync
    addConsultation({
      nameEn: formData.name,
      nameAr: formData.name,
      email: formData.email,
      phone: formData.phone,
      companyEn: formData.company || 'Individual',
      companyAr: formData.company || 'فردي',
      subjectEn: formData.services.length > 0 ? formData.services.join(', ') : 'General Strategy Consultation',
      subjectAr: formData.services.length > 0 ? formData.services.join(', ') : 'استشارة استراتيجية عامة',
      budget: formData.budget || 'Flexible',
      timeline: formData.timeline || 'Flexible',
      message: formData.message,
      services: formData.services.length > 0 ? formData.services : ['General Inquiry']
    });

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);

      // Trigger real system notification
      pushSystemNotification({
        titleEn: `Consultation Booked: ${formData.name}`,
        titleAr: `جلسة استشارية مؤكدة: ${formData.name}`,
        messageEn: `Consultation request from ${formData.name} was logged successfully.`,
        messageAr: `تم تسجيل طلب استشارة من ${formData.name} بنجاح.`,
        category: 'consultation',
        metadata: {
          name: formData.name,
          email: formData.email,
          services: formData.services.length > 0 ? formData.services : ['General Inquiry'],
          severity: 'success'
        }
      });
    }, 1000);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      website: '',
      services: [],
      budget: '',
      timeline: '',
      message: ''
    });
    setStep(1);
    setIsSubmitted(false);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const servicesList = isRtl
    ? [
        'العلامة التجارية والهوية',
        'تطوير مواقع الويب',
        'تطبيقات الهواتف المحمولة',
        'التسويق الرقمي',
        'إنتاج الفيديو',
        'الملفات التعريفية للمؤسسات'
      ]
    : [
        'Branding & Identity',
        'Website Development',
        'Mobile App Development',
        'Digital Marketing',
        'Video Production',
        'Company Profiles'
      ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          id="consultation-modal-backdrop"
          onClick={handleBackdropClick}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md"
        >
          <motion.div
            id="consultation-modal-content"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={`relative w-full max-w-2xl overflow-hidden bg-white border border-slate-100 rounded-2xl shadow-2xl ${isRtl ? 'text-right' : 'text-left'}`}
          >
            {/* Header */}
            <div className={`flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-rose-50 text-rose-500">
                  <Calendar className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm md:text-base">{mt.requestConsultation}</h3>
                  {!isSubmitted && (
                    <p className="text-xs text-slate-500">{mt.stepOf(step, 4)} — {mt.steps[step]}</p>
                  )}
                </div>
              </div>
              <button
                id="close-modal-btn"
                onClick={onClose}
                className="p-1.5 transition-colors rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100/80 animate-pulse"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Inner Content */}
            <div className="p-6 md:p-8">
              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center text-center py-8"
                >
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-rose-50 text-rose-500 mb-4 animate-bounce">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-2xl font-bold text-slate-900 mb-2">{mt.successTitle}</h4>
                  <p className="text-slate-600 max-w-md mb-8 leading-relaxed text-sm md:text-base">
                    {mt.successDesc(formData.name)}
                  </p>
                  <button
                    id="submit-success-close-btn"
                    onClick={() => {
                      resetForm();
                      onClose();
                    }}
                    className="px-8 py-3 font-semibold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-all shadow-sm active:scale-[0.98] cursor-pointer"
                  >
                    {mt.backHome}
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Step 1: Contact Details */}
                  {step === 1 && (
                    <motion.div
                      initial={{ opacity: 0, x: isRtl ? -20 : 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: isRtl ? 20 : -20 }}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700">{mt.labels.fullName}</label>
                          <div className="relative">
                            <User className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-3 w-4 h-4 text-slate-400`} />
                            <input
                              id="input-name"
                              type="text"
                              required
                              placeholder={mt.placeholders.name}
                              value={formData.name}
                              onChange={e => setFormData({ ...formData, name: e.target.value })}
                              className={`w-full ${isRtl ? 'pr-9.5 pl-4 text-right' : 'pl-9.5 pr-4 text-left'} py-2.5 text-sm rounded-xl border border-slate-200 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none transition-colors placeholder:text-slate-400 text-slate-800 bg-white`}
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700">{mt.labels.emailAddress}</label>
                          <div className="relative">
                            <Mail className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-3 w-4 h-4 text-slate-400`} />
                            <input
                              id="input-email"
                              type="email"
                              required
                              placeholder={mt.placeholders.email}
                              value={formData.email}
                              onChange={e => setFormData({ ...formData, email: e.target.value })}
                              className={`w-full ${isRtl ? 'pr-9.5 pl-4 text-right' : 'pl-9.5 pr-4 text-left'} py-2.5 text-sm rounded-xl border border-slate-200 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none transition-colors placeholder:text-slate-400 text-slate-800 bg-white`}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700">{mt.labels.phoneNumber}</label>
                          <div className="relative">
                            <Phone className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-3 w-4 h-4 text-slate-400`} />
                            <input
                              id="input-phone"
                              type="tel"
                              required
                              placeholder={mt.placeholders.phone}
                              value={formData.phone}
                              onChange={e => setFormData({ ...formData, phone: e.target.value })}
                              className={`w-full ${isRtl ? 'pr-9.5 pl-4 text-right' : 'pl-9.5 pr-4 text-left'} py-2.5 text-sm rounded-xl border border-slate-200 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none transition-colors placeholder:text-slate-400 text-slate-800 bg-white`}
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700">{mt.labels.companyName}</label>
                          <div className="relative">
                            <Building className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-3 w-4 h-4 text-slate-400`} />
                            <input
                              id="input-company"
                              type="text"
                              required
                              placeholder={mt.placeholders.company}
                              value={formData.company}
                              onChange={e => setFormData({ ...formData, company: e.target.value })}
                              className={`w-full ${isRtl ? 'pr-9.5 pl-4 text-right' : 'pl-9.5 pr-4 text-left'} py-2.5 text-sm rounded-xl border border-slate-200 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none transition-colors placeholder:text-slate-400 text-slate-800 bg-white`}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">{mt.labels.companyWebsite}</label>
                        <div className="relative">
                          <Globe className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-3 w-4 h-4 text-slate-400`} />
                          <input
                            id="input-website"
                            type="text"
                            placeholder={mt.placeholders.website}
                            value={formData.website}
                            onChange={e => setFormData({ ...formData, website: e.target.value })}
                            className={`w-full ${isRtl ? 'pr-9.5 pl-4 text-right' : 'pl-9.5 pr-4 text-left'} py-2.5 text-sm rounded-xl border border-slate-200 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none transition-colors placeholder:text-slate-400 text-slate-800 bg-white`}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Project Scope */}
                  {step === 2 && (
                    <motion.div
                      initial={{ opacity: 0, x: isRtl ? -20 : 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: isRtl ? 20 : -20 }}
                      className="space-y-5"
                    >
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-700">{mt.labels.selectServices}</label>
                        <p className="text-xs text-slate-500 mb-2">{mt.labels.selectServicesSub}</p>
                        <div className="grid grid-cols-2 gap-2.5">
                          {servicesList.map(service => {
                            const isSelected = formData.services.includes(service);
                            return (
                              <button
                                type="button"
                                key={service}
                                onClick={() => toggleService(service)}
                                className={`flex items-center justify-between p-3.5 text-xs rounded-xl border transition-all ${isRtl ? 'text-right flex-row-reverse' : 'text-left'} ${
                                  isSelected
                                    ? 'border-rose-500 bg-rose-50/40 text-rose-950 font-medium'
                                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 text-slate-600'
                                }`}
                              >
                                <span>{service}</span>
                                {isSelected && (
                                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Project Brief */}
                  {step === 3 && (
                    <motion.div
                      initial={{ opacity: 0, x: isRtl ? -20 : 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: isRtl ? 20 : -20 }}
                      className="space-y-4"
                    >
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">{mt.labels.goalsDesc}</label>
                        <p className="text-xs text-slate-500 mb-2">{mt.labels.goalsSub}</p>
                        <div className="relative">
                          <MessageSquare className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-3 w-4 h-4 text-slate-400`} />
                          <textarea
                            id="textarea-brief"
                            rows={5}
                            placeholder={mt.placeholders.brief}
                            value={formData.message}
                            onChange={e => setFormData({ ...formData, message: e.target.value })}
                            className={`w-full ${isRtl ? 'pr-9.5 pl-4 text-right' : 'pl-9.5 pr-4 text-left'} py-3 text-sm rounded-xl border border-slate-200 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none transition-colors placeholder:text-slate-400 text-slate-800 bg-white resize-none`}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 4: Review & Submit */}
                  {step === 4 && (
                    <motion.div
                      initial={{ opacity: 0, x: isRtl ? -20 : 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: isRtl ? 20 : -20 }}
                      className="space-y-4"
                    >
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 md:p-5 space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">{mt.labels.summaryTitle}</h4>
                        <div className={`grid grid-cols-2 gap-4 text-xs ${isRtl ? 'text-right' : 'text-left'}`}>
                          <div>
                            <span className="text-slate-400 block mb-0.5">{mt.labels.fullName.replace(' *', '')}</span>
                            <span className="font-semibold text-slate-800">{formData.name || '—'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block mb-0.5">{mt.labels.phoneNumber.replace(' *', '')}</span>
                            <span className="font-semibold text-slate-800">{formData.phone || '—'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block mb-0.5">{mt.labels.emailAddress.replace(' *', '')}</span>
                            <span className="font-semibold text-slate-800">{formData.email || '—'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block mb-0.5">{mt.labels.companyName}</span>
                            <span className="font-semibold text-slate-800">{formData.company || '—'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block mb-0.5">{mt.labels.companyWebsite}</span>
                            <span className="font-semibold text-slate-800 truncate block">{formData.website || '—'}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-slate-400 block mb-0.5">{mt.labels.selectServices.replace(' *', '')}</span>
                            <div className={`flex flex-wrap gap-1 mt-1 ${isRtl ? 'flex-row-reverse' : ''}`}>
                              {formData.services.length > 0 ? (
                                formData.services.map(s => (
                                  <span key={s} className="px-2 py-0.5 bg-rose-50 text-rose-700 rounded text-[10px] font-medium border border-rose-100">{s}</span>
                                ))
                              ) : (
                                <span className="text-slate-500 italic">{isRtl ? 'لا يوجد (استفسار عام)' : 'None selected (General Inquiry)'}</span>
                              )}
                            </div>
                          </div>
                          {formData.message && (
                            <div className="col-span-2">
                              <span className="text-slate-400 block mb-0.5">{mt.labels.goalsDesc}</span>
                              <p className="font-normal text-slate-600 bg-white border border-slate-100 p-2.5 rounded-lg italic line-clamp-3 leading-relaxed">
                                "{formData.message}"
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <p className="text-[10px] text-slate-400 leading-normal text-center">
                        {mt.labels.agreeTerms}
                      </p>
                    </motion.div>
                  )}

                  {/* Buttons */}
                  <div className={`flex items-center justify-between pt-4 border-t border-slate-100 ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <div>
                      {step > 1 && (
                        <button
                          type="button"
                          id="modal-prev-step-btn"
                          onClick={prevStep}
                          className={`flex items-center gap-1 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all ${isRtl ? 'flex-row-reverse' : ''}`}
                        >
                          {isRtl ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
                          {mt.actions.back}
                        </button>
                      )}
                    </div>

                    <div>
                      {step < 4 ? (
                        <button
                          type="button"
                          id="modal-next-step-btn"
                          disabled={step === 1 && (!formData.name.trim() || !formData.phone.trim() || !formData.company.trim())}
                          onClick={nextStep}
                          className={`flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all disabled:opacity-50 disabled:pointer-events-none shadow-sm ${isRtl ? 'flex-row-reverse' : ''}`}
                        >
                          {mt.actions.continue}
                          {isRtl ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                        </button>
                      ) : (
                        <button
                          type="submit"
                          id="modal-submit-btn"
                          disabled={isSubmitting}
                          className={`flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-[#F20530] to-[#F20544] hover:from-[#5683FC] hover:to-[#5371C0] rounded-xl transition-all duration-300 shadow-md shadow-[#F20530]/20 hover:shadow-[#5683FC]/30 disabled:opacity-75 ${isRtl ? 'flex-row-reverse' : ''}`}
                        >
                          {isSubmitting ? (
                            <>
                              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              {mt.actions.scheduling}
                            </>
                          ) : (
                            <>
                              {mt.actions.bookFree}
                              <Calendar className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
