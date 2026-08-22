import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Briefcase, Sparkles, X, Bell, ChevronRight } from 'lucide-react';
import { Notification } from '../types';

interface Toast {
  id: string;
  notification: Notification;
}

interface NotificationToastProps {
  onOpenNotificationCenter: () => void;
}

export function NotificationToast({ onOpenNotificationCenter }: NotificationToastProps) {
  const { language, isRtl } = useLanguage();
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handleNewToast = (e: Event) => {
      const customEvent = e as CustomEvent<Notification>;
      const notification = customEvent.detail;
      
      const toastId = `${Date.now()}-${Math.random()}`;
      
      setToasts(prev => [...prev, { id: toastId, notification }]);

      // Auto dismiss after 5 seconds
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toastId));
      }, 5000);
    };

    window.addEventListener('masterlink_notification_toast', handleNewToast);
    return () => window.removeEventListener('masterlink_notification_toast', handleNewToast);
  }, []);

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div 
      className={`fixed bottom-6 ${
        isRtl ? 'left-6' : 'right-6'
      } z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none`}
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          const { notification } = toast;
          const isSystem = notification.category === 'system';
          const isConsult = notification.category === 'consultation';

          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
              className="bg-slate-900/95 border border-[#F20530]/30 shadow-2xl shadow-rose-950/20 backdrop-blur-md rounded-xl p-4 flex items-start gap-3 pointer-events-auto cursor-pointer group"
              onClick={() => {
                onOpenNotificationCenter();
                dismissToast(toast.id);
              }}
            >
              {/* Left category icon with indicator glow */}
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border relative ${
                isSystem ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' :
                isConsult ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                'bg-rose-500/10 border-rose-500/20 text-rose-400'
              }`}>
                {isSystem && <ShieldAlert className="w-4.5 h-4.5 animate-pulse" />}
                {isConsult && <Briefcase className="w-4.5 h-4.5" />}
                {!isSystem && !isConsult && <Sparkles className="w-4.5 h-4.5" />}
                
                {/* Ping ring for unread alert feel */}
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500" />
              </div>

              {/* Text content area */}
              <div className="flex-1 space-y-1 text-left min-w-0" dir={isRtl ? 'rtl' : 'ltr'}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[9px] font-black uppercase text-rose-500 tracking-wider">
                    {notification.category === 'system' ? (language === 'en' ? 'System Alert' : 'تنبيه نظام') :
                     notification.category === 'consultation' ? (language === 'en' ? 'Consultation' : 'طلب استشارة') :
                     (language === 'en' ? 'Core Update' : 'تحديث الأنظمة')}
                  </span>
                  
                  {/* Close button inside toast */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      dismissToast(toast.id);
                    }}
                    className="p-1 rounded text-slate-500 hover:text-white transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>

                <h4 className="text-xs font-bold text-white truncate pr-2">
                  {language === 'en' ? notification.titleEn : notification.titleAr}
                </h4>
                
                <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                  {language === 'en' ? notification.messageEn : notification.messageAr}
                </p>

                {/* View CTA link with animated arrow */}
                <div className="pt-1.5 flex items-center gap-1 text-[10px] font-black text-rose-500 hover:text-rose-400 uppercase tracking-widest transition-all">
                  <span>{language === 'en' ? 'View Details' : 'عرض التفاصيل'}</span>
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
