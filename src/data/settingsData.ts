import { SettingsState } from '../types';

export const settingsData: SettingsState = {
  companyNameEn: 'Master Link Agency',
  companyNameAr: 'شركة ماستر لينك',
  companyLogo: '',
  companyEmail: 'info@mastrlink.com',
  companyPhone: '771039883 - 543059985',
  companyAddressEn: "Sana'a - Yemen | Saudi Arabia - Jeddah",
  companyAddressAr: 'صنعاء - اليمن | السعودية - جدة',
  workingHoursEn: 'Sun - Thu: 8:00 AM - 5:00 PM',
  workingHoursAr: 'الأحد - الخميس: 8:00 صباحاً - 5:00 مساءً',
  aboutCompanyEn: 'Master Link is a technology and marketing agency established from an innovative and creative vision. We are a team of experts and creatives bridging the link between organizations and their clients, transforming client visions into tangible reality. Master Link combines professionalism and technology to deliver unique services that meet digital business ambitions.',
  aboutCompanyAr: 'شركة ماستر لينك، شركة تقنية وتسويقية أُنشئت من رؤية إبداعية ومبتكرة نحن فريق من الخبراء والمبدعين لعمل حلقة ربط بين الجهة وعملائها وتحويل رؤى العملاء إلى واقع ملموس، تجمع ماستر لينك بين الاحتراف والتكنولوجيا لتقديم خدمات فريدة تلبي تطلعات الأعمال الرقمية.',
  socials: [
    { id: 'soc-1', platform: 'twitter', url: 'https://x.com/masterlink' },
    { id: 'soc-2', platform: 'linkedin', url: 'https://linkedin.com/company/masterlink' },
    { id: 'soc-3', platform: 'instagram', url: 'https://instagram.com/masterlink' },
    { id: 'soc-4', platform: 'github', url: 'https://github.com/masterlink' }
  ],
  seoTitleEn: 'MasterLink | Next-Gen Software & Digital Solutions',
  seoTitleAr: 'ماستر لينك | حلول البرمجة والتحول الرقمي المتكاملة',
  seoDescriptionEn: 'Leader in high-performance web development, mobile applications, AI integration, and visual branding.',
  seoDescriptionAr: 'الشركة الرائدة في تطوير مواقع الويب، تطبيقات الهواتف الذكية، الذكاء الاصطناعي والهويات البصرية.',
  seoKeywordsEn: 'software, web development, mobile apps, Saudi Arabia, branding, digital marketing',
  seoKeywordsAr: 'برمجيات, تطوير مواقع, تطبيقات هواتف, تصميم هويات, تسويق رقمي',
  ogImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
  defaultLanguage: 'ar',
  timezone: 'Asia/Riyadh',
  dateFormat: 'YYYY-MM-DD',
  enableMaintenance: false,
  enableCdnCache: true
};
