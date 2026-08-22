import React, { useState } from 'react';
import { 
  Sliders, 
  Trash2, 
  Archive, 
  EyeOff, 
  UserX, 
  Settings2, 
  HelpCircle, 
  Sparkles, 
  AlertTriangle, 
  Terminal, 
  RefreshCw, 
  Layers, 
  FileText, 
  Users, 
  ArrowRight,
  Info,
  LayoutTemplate,
  MessageSquare,
  Image as ImageIcon,
  Compass,
  Calendar as CalendarIcon,
  MousePointerClick
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { PremiumConfirmationDialog, ConfirmationVariant } from './ui/PremiumConfirmationDialog';
import { PremiumEmptyState, EmptyStateVariant } from './ui/PremiumEmptyState';

interface LogEntry {
  id: string;
  timestamp: string;
  variant: ConfirmationVariant;
  itemName: string;
  status: 'triggered' | 'canceled' | 'confirmed';
}

export function ConfirmationSandbox() {
  const { language, isRtl } = useLanguage();
  
  // Dialog Trigger States
  const [isOpen, setIsOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ConfirmationVariant>('delete');
  const [targetItem, setTargetItem] = useState('Production Core Cluster #12');
  
  // Sandbox Configuration Controls
  const [challengeRequired, setChallengeRequired] = useState(true);
  const [customTitleEn, setCustomTitleEn] = useState('');
  const [customTitleAr, setCustomTitleAr] = useState('');
  const [customDescEn, setCustomDescEn] = useState('');
  const [customDescAr, setCustomDescAr] = useState('');

  // Sandbox Tab Navigation
  const [sandboxTab, setSandboxTab] = useState<'dialogs' | 'emptyStates'>('dialogs');

  // Empty State Playground States
  const [emptyStateVariant, setEmptyStateVariant] = useState<EmptyStateVariant>('services');
  const [emptyTitleEn, setEmptyTitleEn] = useState('');
  const [emptyTitleAr, setEmptyTitleAr] = useState('');
  const [emptyDescEn, setEmptyDescEn] = useState('');
  const [emptyDescAr, setEmptyDescAr] = useState('');
  const [emptyPrimaryEn, setEmptyPrimaryEn] = useState('');
  const [emptyPrimaryAr, setEmptyPrimaryAr] = useState('');
  const [emptySecondaryEn, setEmptySecondaryEn] = useState('');
  const [emptySecondaryAr, setEmptySecondaryAr] = useState('');

  // Interactive Live States
  const [demoServices, setDemoServices] = useState([
    { id: 'SRV-801', titleEn: 'E-Commerce CDN Proxy Gateway', titleAr: 'بوابة وكيل شبكة توصيل المحتوى', status: 'active', speed: '4ms Latency' },
    { id: 'SRV-802', titleEn: 'Real-time Analytics Socket Node', titleAr: 'عقدة برمجية للتحليلات الفورية', status: 'active', speed: '12ms Latency' }
  ]);

  const [demoProjects, setDemoProjects] = useState([
    { id: 'PRJ-401', nameEn: 'Aramco Smart Telemetry Hub', nameAr: 'منصة أرامكو للقياس عن بعد', category: 'IoT Pipeline', archived: false },
    { id: 'PRJ-402', nameEn: 'Riyadh Metro Ticketing Engine', nameAr: 'نظام حجز تذاكر مترو الرياض', category: 'Core App', archived: false }
  ]);

  const [demoCategories, setDemoCategories] = useState([
    { id: 'CAT-11', nameEn: 'Financial Technologies', nameAr: 'التكنولوجيا المالية والمدفوعات', hidden: false },
    { id: 'CAT-12', nameEn: 'Aerospace Flight Guidance Systems', nameAr: 'أنظمة توجيه الطيران والفضاء', hidden: false }
  ]);

  const [demoAdmins, setDemoAdmins] = useState([
    { id: 'ADM-004', nameEn: 'Eng. Fahad Al-Mutairi', nameAr: 'م. فهد المطيري', role: 'Security Ops', active: true },
    { id: 'ADM-005', nameEn: 'Sarah Al-Ghamdi', nameAr: 'سارة الغامدي', role: 'DB Admin', active: true }
  ]);

  // System audit log
  const [systemLogs, setSystemLogs] = useState<LogEntry[]>([
    { id: 'LOG-001', timestamp: '02:14:05', variant: 'delete', itemName: 'Temporary Cache Node', status: 'confirmed' },
    { id: 'LOG-002', timestamp: '02:15:30', variant: 'archive', itemName: '2025 Audit Logs Folder', status: 'confirmed' }
  ]);

  const pushLog = (variant: ConfirmationVariant, itemName: string, status: 'triggered' | 'canceled' | 'confirmed') => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const newLog: LogEntry = {
      id: `LOG-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: timeStr,
      variant,
      itemName,
      status
    };
    setSystemLogs(prev => [newLog, ...prev]);
  };

  // Launch handlers
  const triggerDialog = (variant: ConfirmationVariant, itemName: string) => {
    setSelectedVariant(variant);
    setTargetItem(itemName);
    setIsOpen(true);
    pushLog(variant, itemName, 'triggered');
  };

  // Handle final confirmations
  const handleConfirmAction = async () => {
    // Simulate real database action inside our local sandbox states
    await new Promise(resolve => setTimeout(resolve, 800)); // smooth loader
    
    if (selectedVariant === 'delete') {
      setDemoServices(prev => prev.filter(s => s.titleEn !== targetItem && s.titleAr !== targetItem));
    } else if (selectedVariant === 'archive') {
      setDemoProjects(prev => prev.map(p => p.nameEn === targetItem || p.nameAr === targetItem ? { ...p, archived: true } : p));
    } else if (selectedVariant === 'hide') {
      setDemoCategories(prev => prev.map(c => c.nameEn === targetItem || c.nameAr === targetItem ? { ...c, hidden: true } : c));
    } else if (selectedVariant === 'deactivate') {
      setDemoAdmins(prev => prev.map(a => a.nameEn === targetItem || a.nameAr === targetItem ? { ...a, active: false } : a));
    }

    pushLog(selectedVariant, targetItem, 'confirmed');
  };

  const handleCancelAction = () => {
    pushLog(selectedVariant, targetItem, 'canceled');
    setIsOpen(false);
  };

  return (
    <div className="space-y-8">
      
      {/* HEADER BAR */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-indigo-500/5 to-transparent pointer-events-none" />
        <div className={`flex flex-col md:flex-row items-center justify-between gap-6 ${isRtl ? 'md:flex-row-reverse text-right' : 'text-left'}`}>
          <div className="space-y-1.5 flex-1">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block flex items-center gap-1.5 justify-start">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isRtl ? 'مختبر المكونات البرمجية الفاخرة' : 'PREMIUM UI SANDBOX'}</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-none">
              {sandboxTab === 'dialogs' 
                ? (language === 'en' ? 'Confirmation Dialog Sandbox' : 'منصة تجربة واجهات التأكيد الفاخرة')
                : (language === 'en' ? 'Premium Empty States Sandbox' : 'منصة تجربة شاشات الحالات الفارغة')
              }
            </h1>
            <p className="text-slate-500 text-sm font-semibold leading-relaxed max-w-3xl">
              {sandboxTab === 'dialogs'
                ? (language === 'en' 
                    ? 'An interactive blueprint showcasing four functional confirmation variants styled with custom micro-animations, bilingual Arabic/English strings, safety-locking checkboxes, and fluid responsive frames.' 
                    : 'مختبر تفاعلي متكامل يعرض أربعة أنواع من نوافذ التأكيد المصممة بعناية فائقة، مع دعم كامل للغتين العربية والإنكليزية، وخيارات التحقق الأمني المزدوج، والرسوم المتحركة الانسيابية.')
                : (language === 'en'
                    ? 'Explore and customize five premium SaaS empty state templates. Features customized high-fidelity animated vector illustrations, full bilingual copy support, and mock CMS event logging hooks.'
                    : 'استكشف وخصخص خمسة قوالب لشاشات الحالات الفارغة المناسبة للمنصات الرقمية الحديثة. تتميز برسومات متجهة متحركة وتفاعلية عالية الدقة مع دعم لغوي متكامل.')
              }
            </p>
          </div>
        </div>
      </section>

      {/* COMPONENT TAB SELECTOR */}
      <div className={`flex border-b border-slate-200 gap-6 ${isRtl ? 'flex-row-reverse' : ''}`}>
        <button
          onClick={() => setSandboxTab('dialogs')}
          className={`pb-4 text-xs font-extrabold transition-all border-b-2 cursor-pointer flex items-center gap-2 outline-none ${
            sandboxTab === 'dialogs'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>{language === 'en' ? 'Confirmation Dialogs' : 'نوافذ تأكيد المعاملات'}</span>
        </button>

        <button
          onClick={() => setSandboxTab('emptyStates')}
          className={`pb-4 text-xs font-extrabold transition-all border-b-2 cursor-pointer flex items-center gap-2 outline-none ${
            sandboxTab === 'emptyStates'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <LayoutTemplate className="w-4 h-4" />
          <span>{language === 'en' ? 'Premium Empty States' : 'شاشات الحالات الفارغة'}</span>
        </button>
      </div>

      {/* CORE WORKSPACE: CONTROLS & TEST BENCH */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: LIVE COMPONENT TEST CASES (8-COLS) */}
        <div className="lg:col-span-8 space-y-6">
          
          {sandboxTab === 'dialogs' && (
            <div className="space-y-6">
          
          <div className="px-1 flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
              {language === 'en' ? 'Active Production Cards' : 'بطاقات العمليات الفورية المشتركة'}
            </h3>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 font-extrabold border border-indigo-150 px-2.5 py-1 rounded-full">
              {language === 'en' ? 'Interact to trigger dialogs' : 'اضغط على الأزرار لاختبار النوافذ'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            
            {/* CARD 1: DELETE VARIANT DEMO */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-all relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-red-600" />
              <div className="flex items-center justify-between mb-4">
                <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-100">
                  {language === 'en' ? 'Danger Action' : 'إجراء خطر'}
                </span>
                <span className="text-[10px] text-slate-400 font-mono font-bold">DELETE</span>
              </div>
              
              <div className={`space-y-1.5 ${isRtl ? 'text-right' : 'text-left'}`}>
                <h4 className="text-sm font-extrabold text-slate-900">
                  {language === 'en' ? 'Gateway Micro-Proxy Cluster' : 'بوابة ترحيل الخوادم المؤقتة'}
                </h4>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                  {language === 'en' ? 'Handles API routing limits. Deleting this will completely drop live traffic networks.' : 'مسؤول عن توجيه استدعاءات API. الحذف سيقطع الاتصال الفوري.'}
                </p>
              </div>

              {/* Action Area */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 font-mono">ID: CLUSTER-77</span>
                <button
                  onClick={() => triggerDialog('delete', language === 'en' ? 'Gateway Micro-Proxy Cluster' : 'بوابة ترحيل الخوادم المؤقتة')}
                  className="px-3.5 py-2 rounded-xl text-xs font-extrabold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'Delete Permanently' : 'حذف السجل نهائياً'}</span>
                </button>
              </div>
            </div>

            {/* CARD 2: ARCHIVE VARIANT DEMO */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-all relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-indigo-600" />
              <div className="flex items-center justify-between mb-4">
                <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {language === 'en' ? 'Data Pipeline' : 'أرشفة البيانات'}
                </span>
                <span className="text-[10px] text-slate-400 font-mono font-bold">ARCHIVE</span>
              </div>
              
              <div className={`space-y-1.5 ${isRtl ? 'text-right' : 'text-left'}`}>
                <h4 className="text-sm font-extrabold text-slate-900">
                  {language === 'en' ? 'Corporate Financial Audit 2025' : 'التدقيق المالي السنوي ٢٠٢٥'}
                </h4>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                  {language === 'en' ? 'Verified fiscal spreadsheet logs. Recommended to archive rather than delete.' : 'ملفات الفواتير المالية الموثقة. يوصى بالأرشفة لتوفير مساحات العمل.'}
                </p>
              </div>

              {/* Action Area */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 font-mono">SIZE: 34.2 MB</span>
                <button
                  onClick={() => triggerDialog('archive', language === 'en' ? 'Corporate Financial Audit 2025' : 'التدقيق المالي السنوي ٢٠٢٥')}
                  className="px-3.5 py-2 rounded-xl text-xs font-extrabold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Archive className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'Archive Log Asset' : 'أرشفة السجل المالي'}</span>
                </button>
              </div>
            </div>

            {/* CARD 3: HIDE VARIANT DEMO */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-all relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-slate-600 to-slate-700" />
              <div className="flex items-center justify-between mb-4">
                <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-md bg-slate-50 text-slate-700 border border-slate-100">
                  {language === 'en' ? 'Visibility Status' : 'مستوى الرؤية'}
                </span>
                <span className="text-[10px] text-slate-400 font-mono font-bold">HIDE</span>
              </div>
              
              <div className={`space-y-1.5 ${isRtl ? 'text-right' : 'text-left'}`}>
                <h4 className="text-sm font-extrabold text-slate-900">
                  {language === 'en' ? 'Financial Advisory Services' : 'قسم الاستشارات والحلول المالية'}
                </h4>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                  {language === 'en' ? 'Active consultancy module. Hiding hides it from prospective customers.' : 'الخدمة معروضة على الموقع حالياً. إخفاؤها سيمنع ظهورها للزوار.'}
                </p>
              </div>

              {/* Action Area */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 font-mono">PUBLIC: SHOWN</span>
                <button
                  onClick={() => triggerDialog('hide', language === 'en' ? 'Financial Advisory Services' : 'قسم الاستشارات والحلول المالية')}
                  className="px-3.5 py-2 rounded-xl text-xs font-extrabold text-slate-600 bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'Hide Public View' : 'إخفاء من العرض'}</span>
                </button>
              </div>
            </div>

            {/* CARD 4: DEACTIVATE VARIANT DEMO */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-all relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-amber-600" />
              <div className="flex items-center justify-between mb-4">
                <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-100">
                  {language === 'en' ? 'Security Shield' : 'حماية الهوية'}
                </span>
                <span className="text-[10px] text-slate-400 font-mono font-bold">SUSPEND</span>
              </div>
              
              <div className={`space-y-1.5 ${isRtl ? 'text-right' : 'text-left'}`}>
                <h4 className="text-sm font-extrabold text-slate-900">
                  {language === 'en' ? 'Admin Credential (Sarah)' : 'حساب المسؤول سارة الغامدي'}
                </h4>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                  {language === 'en' ? 'Primary DB maintenance operator keys. Suspends access codes temporarily.' : 'صلاحيات المشرف على قواعد البيانات. التعليق يسحب مفاتيح الوصول.'}
                </p>
              </div>

              {/* Action Area */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-600 font-mono">STATUS: ACTIVE</span>
                <button
                  onClick={() => triggerDialog('deactivate', language === 'en' ? 'Sarah Al-Ghamdi' : 'سارة الغامدي')}
                  className="px-3.5 py-2 rounded-xl text-xs font-extrabold text-amber-700 bg-amber-50 hover:bg-amber-100 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <UserX className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'Suspend Session' : 'تعليق حساب المسؤول'}</span>
                </button>
              </div>
            </div>

          </div>

          {/* SANDBOX CONTROLS PANEL */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className={`flex items-center gap-2 border-b border-slate-100 pb-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <Settings2 className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-extrabold text-slate-900">
                {language === 'en' ? 'Dynamic Component Settings Adjuster' : 'تخصيص متغيرات ونصوص النوافذ المخصصة'}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Option 1: Double verification challenge trigger */}
              <div className={`space-y-2 p-4 rounded-xl border border-slate-100 bg-slate-50/50 ${isRtl ? 'text-right' : 'text-left'}`}>
                <span className="text-xs font-extrabold text-slate-800 block">{language === 'en' ? 'Double-Verification Safeguard' : 'ميزة التأكيد والتحقق المزدوج'}</span>
                <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                  {language === 'en' ? 'Enforces a manual security barrier where the user has to type "confirm" and check a system authorization checkmark.' : 'تفرض حاجز أمان إضافي حيث يتعين على المستخدم كتابة كلمة "confirm" وتفعيل مربع الاختيار للتأكيد.'}
                </p>
                <div className={`flex items-center gap-2 pt-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <input
                    type="checkbox"
                    id="require-challenge-checkbox"
                    checked={challengeRequired}
                    onChange={(e) => setChallengeRequired(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-0 border-slate-200 cursor-pointer"
                  />
                  <label htmlFor="require-challenge-checkbox" className="text-xs font-bold text-slate-600 cursor-pointer select-none">
                    {language === 'en' ? 'Require "confirm" key typing' : 'طلب كتابة رمز التحقق وتوقيع الأمان'}
                  </label>
                </div>
              </div>

              {/* Option 2: Target Custom Name */}
              <div className={`space-y-2 ${isRtl ? 'text-right' : 'text-left'}`}>
                <span className="text-xs font-extrabold text-slate-800 block">{language === 'en' ? 'Dynamic Target Resource Name' : 'اسم المورد المستهدف الفوري'}</span>
                <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                  {language === 'en' ? 'Provide a placeholder targeted entity value to embed within the dialog warning message.' : 'أدخل اسماً مخصصاً للمورد ليتم وضعه وتتبعه في نافذة التحذير.'}
                </p>
                <input
                  type="text"
                  value={targetItem}
                  onChange={(e) => setTargetItem(e.target.value)}
                  placeholder="e.g. MasterLink Cluster Node"
                  className="block w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-indigo-500 font-mono"
                />
              </div>

            </div>

            {/* Custom bilingual text inputs */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                {language === 'en' ? 'Bilingual Header & Body Overrides (Optional)' : 'استبدال النصوص والعناوين باللغتين (اختياري)'}
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold text-slate-700">{language === 'en' ? 'Custom Title (English)' : 'العنوان المخصص بالإنكليزية'}</label>
                  <input
                    type="text"
                    value={customTitleEn}
                    onChange={(e) => setCustomTitleEn(e.target.value)}
                    placeholder="e.g. Danger! Terminate Live Cluster Link?"
                    className="block w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold text-slate-700 text-right">{language === 'en' ? 'Custom Title (Arabic)' : 'العنوان المخصص بالعربية'}</label>
                  <input
                    type="text"
                    value={customTitleAr}
                    onChange={(e) => setCustomTitleAr(e.target.value)}
                    placeholder="مثال: تحذير! هل ترغب بقطع خادم السحاب؟"
                    className="block w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500 text-right"
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold text-slate-700">{language === 'en' ? 'Custom Warning (English)' : 'الوصف والتحذير بالإنكليزية'}</label>
                  <textarea
                    rows={2}
                    value={customDescEn}
                    onChange={(e) => setCustomDescEn(e.target.value)}
                    placeholder="Provide bespoke warning rules to display to the administrator..."
                    className="block w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500 leading-relaxed resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold text-slate-700 text-right">{language === 'en' ? 'Custom Warning (Arabic)' : 'الوصف والتحذير بالعربية'}</label>
                  <textarea
                    rows={2}
                    value={customDescAr}
                    onChange={(e) => setCustomDescAr(e.target.value)}
                    placeholder="أدخل رسالة مخصصة لتحذير مدراء لوحة التحكم من هذا الإجراء..."
                    className="block w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500 leading-relaxed text-right resize-none"
                    dir="rtl"
                  />
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

          {sandboxTab === 'emptyStates' && (
            <div className="space-y-6">
              
              {/* SUB-HEADER & QUICK INFO */}
              <div className="px-1 flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                  {language === 'en' ? 'Interactive Empty State Canvas' : 'لوحة معاينة الحالات الفارغة الفورية'}
                </h3>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-extrabold border border-emerald-150 px-2.5 py-1 rounded-full animate-pulse">
                  {language === 'en' ? 'Live Component Render' : 'عرض مباشر للمكون'}
                </span>
              </div>

              {/* LIVE COMPONENT MOUNT */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 flex items-center justify-center min-h-[380px]">
                <PremiumEmptyState
                  variant={emptyStateVariant}
                  onPrimaryAction={() => {
                    pushLog('archive', (language === 'en' ? 'Primary Triggered: ' : 'تفعيل الإجراء الرئيسي لـ: ') + emptyStateVariant.toUpperCase(), 'confirmed');
                  }}
                  onSecondaryAction={() => {
                    pushLog('hide', (language === 'en' ? 'Secondary Triggered: ' : 'تفعيل الإجراء الثانوي لـ: ') + emptyStateVariant.toUpperCase(), 'confirmed');
                  }}
                  primaryActionTextEn={emptyPrimaryEn || undefined}
                  primaryActionTextAr={emptyPrimaryAr || undefined}
                  secondaryActionTextEn={emptySecondaryEn || undefined}
                  secondaryActionTextAr={emptySecondaryAr || undefined}
                  customTitleEn={emptyTitleEn || undefined}
                  customTitleAr={emptyTitleAr || undefined}
                  customDescEn={emptyDescEn || undefined}
                  customDescAr={emptyDescAr || undefined}
                />
              </div>

              {/* SECTOR 2: DETAILED CONTROLS PANEL */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
                <div className={`flex items-center gap-2 border-b border-slate-100 pb-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <Settings2 className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-extrabold text-slate-900">
                    {language === 'en' ? 'Customize Empty State Parameters' : 'تخصيص شاشات الحالات الفارغة'}
                  </h3>
                </div>

                {/* Variant selection cards */}
                <div className="space-y-3">
                  <span className="block text-xs font-extrabold text-slate-700">
                    {language === 'en' ? 'Select Pre-configured Variant Theme' : 'اختر قالب السمة مسبق الإعداد'}
                  </span>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {[
                      { id: 'services', icon: Layers, labelEn: 'Services', labelAr: 'الخدمات' },
                      { id: 'projects', icon: Compass, labelEn: 'Projects', labelAr: 'المشاريع' },
                      { id: 'posts', icon: FileText, labelEn: 'Posts', labelAr: 'المقالات' },
                      { id: 'media', icon: ImageIcon, labelEn: 'Media', labelAr: 'الوسائط' },
                      { id: 'consultations', icon: CalendarIcon, labelEn: 'Consults', labelAr: 'الاستشارات' }
                    ].map((v) => {
                      const Icon = v.icon;
                      const isActive = emptyStateVariant === v.id;
                      return (
                        <button
                          key={v.id}
                          onClick={() => {
                            setEmptyStateVariant(v.id as EmptyStateVariant);
                          }}
                          className={`p-3 rounded-xl border flex flex-col items-center gap-2 text-center transition-all cursor-pointer outline-none ${
                            isActive 
                              ? 'border-indigo-600 ring-4 ring-indigo-50 bg-indigo-50/40 text-indigo-700' 
                              : 'border-slate-200 hover:border-slate-300 text-slate-500 bg-white'
                          }`}
                        >
                          <Icon className="w-5 h-5 shrink-0" />
                          <span className="text-[11px] font-extrabold block">
                            {language === 'en' ? v.labelEn : v.labelAr}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Overrides block */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    {language === 'en' ? 'Bilingual Text Overrides (Optional)' : 'استبدال النصوص والعناوين بالكامل (اختياري)'}
                  </span>

                  {/* Title Overrides */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold text-slate-700">{language === 'en' ? 'Custom Title (English)' : 'العنوان المخصص بالإنكليزية'}</label>
                      <input
                        type="text"
                        value={emptyTitleEn}
                        onChange={(e) => setEmptyTitleEn(e.target.value)}
                        placeholder="e.g. Workspace holds no active modules"
                        className="block w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold text-slate-700 text-right">{language === 'en' ? 'Custom Title (Arabic)' : 'العنوان المخصص بالعربية'}</label>
                      <input
                        type="text"
                        value={emptyTitleAr}
                        onChange={(e) => setEmptyTitleAr(e.target.value)}
                        placeholder="مثال: مساحة العمل لا تحتوي على باقات مفعلة"
                        className="block w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500 text-right"
                        dir="rtl"
                      />
                    </div>
                  </div>

                  {/* Description Overrides */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold text-slate-700">{language === 'en' ? 'Custom Description (English)' : 'الوصف المخصص بالإنكليزية'}</label>
                      <textarea
                        rows={2}
                        value={emptyDescEn}
                        onChange={(e) => setEmptyDescEn(e.target.value)}
                        placeholder="Provide customized directions to your administrator..."
                        className="block w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500 leading-relaxed resize-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold text-slate-700 text-right">{language === 'en' ? 'Custom Description (Arabic)' : 'الوصف المخصص بالعربية'}</label>
                      <textarea
                        rows={2}
                        value={emptyDescAr}
                        onChange={(e) => setEmptyDescAr(e.target.value)}
                        placeholder="أدخل إرشادات مخصصة وموجهة لمدراء لوحة التحكم لتوجيههم..."
                        className="block w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500 leading-relaxed text-right resize-none"
                        dir="rtl"
                      />
                    </div>
                  </div>

                  {/* Primary & Secondary Action Button Text Overrides */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-dashed border-slate-100">
                    <div className="space-y-3">
                      <span className="block text-[11px] font-extrabold text-slate-800">{language === 'en' ? 'Primary Button Text' : 'تعديل نص زر الإجراء الأساسي'}</span>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={emptyPrimaryEn}
                          onChange={(e) => setEmptyPrimaryEn(e.target.value)}
                          placeholder="English text"
                          className="block w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500"
                        />
                        <input
                          type="text"
                          value={emptyPrimaryAr}
                          onChange={(e) => setEmptyPrimaryAr(e.target.value)}
                          placeholder="النص بالعربية"
                          className="block w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500 text-right"
                          dir="rtl"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <span className="block text-[11px] font-extrabold text-slate-800">{language === 'en' ? 'Secondary Button Text' : 'تعديل نص زر الإجراء الثانوي'}</span>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={emptySecondaryEn}
                          onChange={(e) => setEmptySecondaryEn(e.target.value)}
                          placeholder="English text"
                          className="block w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500"
                        />
                        <input
                          type="text"
                          value={emptySecondaryAr}
                          onChange={(e) => setEmptySecondaryAr(e.target.value)}
                          placeholder="النص بالعربية"
                          className="block w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500 text-right"
                          dir="rtl"
                        />
                      </div>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

        </div>

        {/* RIGHT COLUMN: REALTIME CONSOLE TELEMETRY & LOG FEED (4-COLS) */}
        <div className="lg:col-span-4 bg-slate-950 text-white rounded-2xl border border-slate-900 p-5 shadow-lg space-y-6 self-stretch">
          
          <div className="flex items-center justify-between border-b border-slate-900 pb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#F20530]" />
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest font-mono">
                {language === 'en' ? 'SYSTEM EVENT LOG' : 'سجل نظام العمليات'}
              </h3>
            </div>
            <button
              onClick={() => {
                setSystemLogs([
                  { id: 'LOG-000', timestamp: '02:16:00', variant: 'delete', itemName: 'Buffer Sandbox Cleaned', status: 'confirmed' }
                ]);
              }}
              className="p-1 rounded text-slate-500 hover:text-slate-300 transition-colors"
              title="Clear Console"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Log lists */}
          <div className="space-y-3.5 h-[340px] overflow-y-auto font-mono text-[10px] leading-relaxed scrollbar-thin">
            {systemLogs.map((log) => (
              <div 
                key={log.id} 
                className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-900 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-bold">{log.timestamp}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                    log.variant === 'delete' ? 'bg-rose-950 text-rose-300' :
                    log.variant === 'archive' ? 'bg-indigo-950 text-indigo-300' :
                    log.variant === 'deactivate' ? 'bg-amber-950 text-amber-300' :
                    'bg-slate-800 text-slate-300'
                  }`}>
                    {log.variant.toUpperCase()}
                  </span>
                </div>

                <div className="text-slate-300 font-medium">
                  {language === 'en' ? 'Target resource: ' : 'المورد المالي: '}
                  <span className="text-white font-extrabold">{log.itemName}</span>
                </div>

                <div className="flex items-center gap-1.5 pt-0.5 text-slate-400">
                  <span>&bull;</span>
                  <span>{language === 'en' ? 'Status: ' : 'الحالة: '}</span>
                  <span className={`font-extrabold ${
                    log.status === 'confirmed' ? 'text-emerald-400' :
                    log.status === 'canceled' ? 'text-rose-400' :
                    'text-amber-400 animate-pulse'
                  }`}>
                    {log.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}

            {systemLogs.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-1 text-center py-10">
                <Info className="w-5 h-5 text-slate-700" />
                <span>{language === 'en' ? 'No operational events' : 'لا توجد سجلات حالية'}</span>
              </div>
            )}
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-900 text-[10px] text-slate-400 space-y-1">
            <span className="text-indigo-400 uppercase font-extrabold block">{language === 'en' ? 'Verification Integrity' : 'تأكيد المعايير البرمجية'}</span>
            <p className="leading-normal">
              {language === 'en' 
                ? 'These verification dialogues run with absolute isolation. No unrequested secondary server routes are generated.' 
                : 'يتم تشغيل بروتوكولات الأمان والمعاينة بنظام مستقل تماماً دون الحاجة لاستدعاء خطوط ربط غير مصرح بها.'}
            </p>
          </div>

        </div>

      </div>

      {/* REUSABLE PREMIUM CONFIRMATION DIALOG PORTAL */}
      <PremiumConfirmationDialog
        isOpen={isOpen}
        onClose={handleCancelAction}
        onConfirm={handleConfirmAction}
        variant={selectedVariant}
        itemName={targetItem}
        requireChallenge={challengeRequired}
        titleEn={customTitleEn || undefined}
        titleAr={customTitleAr || undefined}
        descEn={customDescEn || undefined}
        descAr={customDescAr || undefined}
      />

    </div>
  );
}
