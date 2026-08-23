import { SettingsState } from '../types';

export const settingsData: SettingsState = {
  siteName: 'شركة ماستر لينك',
  siteLogo: '',
  companyNameEn: 'Master Link Agency',
  companyNameAr: 'شركة ماستر لينك',
  companyLogo: '',
  companyEmail: 'info@mastrlink.com',
  companyPhone: '771039883 - 543059985',
  companyAddressEn: "Sana'a - Yemen | Saudi Arabia - Jeddah",
  companyAddressAr: 'صنعاء - اليمن | السعودية - جدة',
  workingHoursEn: 'Sun - Thu: 8:00 AM - 5:00 PM',
  workingHoursAr: 'الأحد - الخميس: 8:00 صباحاً - 5:00 مساءً',
  aboutCompanyEn: 'Master Link is a technology and marketing agency established from an innovative and creative vision.',
  aboutCompanyAr: 'شركة ماستر لينك، شركة تقنية وتسويقية أُنشئت من رؤية إبداعية ومبتكرة نحن فريق من الخبراء والمبدعين لعمل حلقة ربط بين الجهة وعملائها وتحويل رؤى العملاء إلى واقع ملموس.',
  socials: [
    { id: 'soc-1', platform: 'twitter', url: 'https://x.com/masterlink' },
    { id: 'soc-2', platform: 'linkedin', url: 'https://linkedin.com/company/masterlink' },
    { id: 'soc-3', platform: 'instagram', url: 'https://instagram.com/masterlink' },
    { id: 'soc-4', platform: 'github', url: 'https://github.com/masterlink' }
  ],
  defaultLanguage: 'ar',
  timezone: 'Asia/Riyadh',
  dateFormat: 'YYYY-MM-DD',
  enableMaintenance: false
};
