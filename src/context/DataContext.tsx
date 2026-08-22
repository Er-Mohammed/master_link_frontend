import React, { createContext, useContext, useState, useEffect } from 'react';
import { ClientLogo, MediaLibraryItem, TestimonialModel, ServiceMediaItem } from '../types';

export interface ServiceItem {
  id: string;
  nameEn: string;
  nameAr: string;
  title?: string;
  descriptionEn: string;
  descriptionAr: string;
  shortDescription?: string;
  fullDescription?: string;
  slug: string;
  displayOrder: number;
  sortOrder?: number;
  status: 'active' | 'hidden' | 'deleted';
  isActive?: boolean;
  iconName: string;
  coverImage: string;
  videoUrl?: string;
  videoType?: 'direct' | 'youtube' | 'vimeo';
  createdAt: string;
  featuresEn: string[];
  featuresAr: string[];
  serviceMedia?: ServiceMediaItem[];
}

export interface ProjectItem {
  id: string;
  titleEn: string;
  titleAr: string;
  nameEn?: string;
  nameAr?: string;
  categoryEn: string;
  categoryAr: string;
  descriptionEn: string;
  descriptionAr: string;
  fullDescriptionEn?: string;
  fullDescriptionAr?: string;
  image: string;
  img?: string;
  clientEn: string;
  clientAr: string;
  year?: string;
  date?: string;
  statsEn?: string;
  statsAr?: string;
  tags?: string[];
  services?: string[];
  featured?: boolean;
  status: 'published' | 'draft' | 'archived' | 'hidden';
  displayOrder?: number;
  images?: string[];
  metaTitleEn?: string;
  metaTitleAr?: string;
  metaDescEn?: string;
  metaDescAr?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PostItem {
  id: string;
  titleEn: string;
  titleAr: string;
  slug?: string;
  excerptEn: string;
  excerptAr: string;
  categoryEn: string;
  categoryAr: string;
  readTimeEn: string;
  readTimeAr: string;
  publishDate?: string;
  date?: string;
  img?: string;
  image?: string;
  authorEn?: string;
  authorAr?: string;
  authorNameEn?: string;
  authorNameAr?: string;
  authorAvatar?: string;
  views?: number;
  contentEn?: string;
  contentAr?: string;
  status: 'published' | 'draft' | 'archived';
}

export interface SocialLinkItem {
  id: string;
  platform: 'facebook' | 'twitter' | 'linkedin' | 'instagram' | 'youtube' | 'github' | 'other';
  url: string;
}

export interface SettingsState {
  companyNameEn: string;
  companyNameAr: string;
  companyLogo: string;
  companyEmail: string;
  companyPhone: string;
  companyAddressEn: string;
  companyAddressAr: string;
  workingHoursEn: string;
  workingHoursAr: string;
  aboutCompanyEn: string;
  aboutCompanyAr: string;
  socials: SocialLinkItem[];
  seoTitleEn: string;
  seoTitleAr: string;
  seoDescriptionEn: string;
  seoDescriptionAr: string;
  seoKeywordsEn: string;
  seoKeywordsAr: string;
  ogImage: string;
  defaultLanguage: 'en' | 'ar';
  timezone: string;
  dateFormat: string;
  enableMaintenance: boolean;
  enableCdnCache: boolean;
}

export interface ConsultationItem {
  id: string;
  nameEn: string;
  nameAr: string;
  email: string;
  phone: string;
  companyEn: string;
  companyAr: string;
  subjectEn: string;
  subjectAr: string;
  budget: string;
  timeline: string;
  message: string;
  date: string;
  status: 'new' | 'reviewed' | 'contacted' | 'archived';
  services: string[];
}

// Initial Default Seed Data
const DEFAULT_SERVICES: ServiceItem[] = [
  {
    id: 'tech-services',
    nameEn: 'Technical Services',
    nameAr: 'خدماتنا التقنية',
    descriptionEn: 'Design and development of websites, e-commerce stores, mobile apps, and micro systems using cutting-edge technologies.',
    descriptionAr: 'تصميم وبناء المواقع الإلكترونية، المتاجر الإلكترونية، تطبيقات الهواتف الذكية والأنظمة المصغرة بأعلى جودة وكفاءة.',
    slug: 'technical-services',
    displayOrder: 1,
    status: 'active',
    iconName: 'Code2',
    coverImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80',
    createdAt: '2026-03-10',
    featuresEn: ['Website Design & Development', 'E-Commerce Store Development', 'Mobile App Development', 'Micro Systems'],
    featuresAr: ['تصميم وبرمجة المواقع الإلكترونية', 'تصميم وبرمجة المتاجر الإلكترونية', 'تصميم وبرمجة التطبيقات', 'الأنظمة المصغرة']
  },
  {
    id: 'marketing-services',
    nameEn: 'Marketing Services',
    nameAr: 'خدماتنا التسويقية',
    descriptionEn: 'Comprehensive marketing solutions including campaign management, social media administration, motion graphics, graphic design, SEO, and influencer marketing.',
    descriptionAr: 'حلول تسويقية متكاملة تشمل إدارة الحملات، الصفحات، فيديوهات الموشن، التصميم الجرافيكي، SEO، والتسويق عبر المؤثرين.',
    slug: 'marketing-services',
    displayOrder: 2,
    status: 'active',
    iconName: 'TrendingUp',
    coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
    createdAt: '2026-03-15',
    featuresEn: ['Marketing Campaign Management', 'Social Media Page Management', 'Motion Video Design & Editing', 'Graphic Design', 'Search Engine Optimization (SEO)', 'Influencer Marketing'],
    featuresAr: ['إدارة الحملات التسويقية', 'إدارة الصفحات', 'تصميم ومونتاج فيديوهات الموشن', 'التصميم الجرافيكي', 'تحسين محركات البحث (SEO)', 'التسويق عبر المؤثرين']
  },
  {
    id: 'ads-media-services',
    nameEn: 'Advertising & Photography Services',
    nameAr: 'خدماتنا الإعلانية والتصوير',
    descriptionEn: 'High-production commercial video shooting and professional product photography that elevate your brand.',
    descriptionAr: 'إنتاج إعلاني مرئي وتصوير احترافي للمنتجات والفيديوهات الإعلانية لتعزيز القوة التنافسية لعلامتك.',
    slug: 'advertising-media-services',
    displayOrder: 3,
    status: 'active',
    iconName: 'Camera',
    coverImage: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=600&q=80',
    createdAt: '2026-03-20',
    featuresEn: ['Commercial Video Shooting', 'Product Photography'],
    featuresAr: ['تصوير الفيديوهات الإعلانية', 'تصوير المنتجات']
  },
  {
    id: 'consulting-studies',
    nameEn: 'Digital Consulting & Studies',
    nameAr: 'استشارات ودراسات رقمية',
    descriptionEn: 'In-depth digital studies, project analysis, and strategic marketing and tech consulting.',
    descriptionAr: 'دراسات رقمية شاملة وتحليل دقيق للمشاريع مع تقديم استشارات تسويقية ورقمية مخصصة للنهوض بالأعمال.',
    slug: 'digital-consulting-studies',
    displayOrder: 4,
    status: 'active',
    iconName: 'Briefcase',
    coverImage: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80',
    createdAt: '2026-04-02',
    featuresEn: ['Marketing & Digital Project Consulting', 'Digital Project Analysis & Studies'],
    featuresAr: ['استشارات تسويقية ورقمية للمشاريع', 'الدراسات والتحليل الرقمي للمشاريع']
  },
  {
    id: 'visual-identity-branding',
    nameEn: 'Branding & Visual Identity',
    nameAr: 'الشعارات والهويات البصرية',
    descriptionEn: 'Identity strategy, logo design, visual elements, identity applications, and comprehensive brand guidelines.',
    descriptionAr: 'صياغة استراتيجية الهوية وتصميم الشعارات والعناصر البصرية وتطبيقات الهوية ودليل الهوية المتكامل.',
    slug: 'visual-identity-branding',
    displayOrder: 5,
    status: 'active',
    iconName: 'Palette',
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    createdAt: '2026-04-10',
    featuresEn: ['Identity Strategy', 'Logo Design', 'Visual Elements', 'Identity Applications', 'Brand Guidelines'],
    featuresAr: ['استراتيجية الهوية', 'تصميم الشعار', 'العناصر البصرية', 'تطبيقات الهوية', 'دليل الهوية']
  },
  {
    id: 'ai-production',
    nameEn: 'AI Marketing & Digital Production',
    nameAr: 'الإنتاج التسويقي والرقمي بالذكاء الاصطناعي',
    descriptionEn: 'Marketing content creation, AI image and room generation, and high-quality cinematic video production.',
    descriptionAr: 'صناعة وكتابة المحتوى التسويقي، وتوليد الصور والرومات، وإنتاج الفيديوهات بأعلى جودة واحترافية باستخدام الذكاء الاصطناعي.',
    slug: 'ai-marketing-production',
    displayOrder: 6,
    status: 'active',
    iconName: 'Bot',
    coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
    createdAt: '2026-05-01',
    featuresEn: ['Marketing Content Creation', 'AI Image & Room Generation', 'High-Quality Video Production'],
    featuresAr: ['كتابة المحتوى التسويقي', 'توليد وإنتاج الصور والرومات', 'إنتاج الفيديوهات بأعلى جودة واحترافية']
  }
];

const DEFAULT_PROJECTS: ProjectItem[] = [
  {
    id: 'proj-1',
    titleEn: 'Enterprise E-Commerce Store & Mobile App Platform',
    titleAr: 'منصة المتجر والتطبيق الإلكتروني التجاري الشامل',
    nameEn: 'Enterprise E-Commerce Store & Mobile App Platform',
    nameAr: 'منصة المتجر والتطبيق الإلكتروني التجاري الشامل',
    categoryEn: 'Technical Services',
    categoryAr: 'خدماتنا التقنية',
    descriptionEn: 'High-speed custom e-commerce web platform, mobile applications, and micro systems integration.',
    descriptionAr: 'تصميم وبناء موقع وتطبيق متجر إلكتروني متكامل وأنظمة مصغرة للحلول التجارية عالية الكفاءة.',
    image: 'https://images.unsplash.com/photo-1556742049-0a67e517a461?auto=format&fit=crop&w=1200&q=80',
    img: 'https://images.unsplash.com/photo-1556742049-0a67e517a461?auto=format&fit=crop&w=1200&q=80',
    clientEn: 'Saudi Retail Group',
    clientAr: 'مجموعة التجزئة السعودية',
    year: '2026',
    date: '2026-05-12',
    statsEn: '+280% Sales & Orders Growth',
    statsAr: '+280% نمو في المبيعات والطلبات',
    tags: ['المواقع والمتاجر', 'تطبيقات الجوال', 'الأنظمة المصغرة', 'E-Commerce'],
    services: ['المواقع والمتاجر', 'تطبيقات الجوال', 'الأنظمة المصغرة', 'E-Commerce'],
    featured: true,
    status: 'published'
  },
  {
    id: 'proj-2',
    titleEn: 'Omni-Channel Marketing Campaign & SEO Scaling',
    titleAr: 'إدارة الحملات التسويقية المتكاملة وتصدر الـ SEO',
    nameEn: 'Omni-Channel Marketing Campaign & SEO Scaling',
    nameAr: 'إدارة الحملات التسويقية المتكاملة وتصدر الـ SEO',
    categoryEn: 'Marketing Services',
    categoryAr: 'خدماتنا التسويقية',
    descriptionEn: 'Multi-platform marketing campaign management, motion graphics, graphic design, SEO, and influencer campaigns.',
    descriptionAr: 'إدارة شاملة للحملات والصفحات وفيديوهات الموشن والتصميم الجرافيكي مع تصدر نتائج البحث وتسويق المؤثرين.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    clientEn: 'Riyadh Growth Holdings',
    clientAr: 'مؤسسة نمو الرياض',
    year: '2026',
    date: '2026-04-18',
    statsEn: '+340% Organic Traffic & Leads',
    statsAr: '+340% زيارات وتفاعلات عضوية',
    tags: ['إدارة الحملات', 'SEO', 'موشن جرافيك', 'المؤثرين'],
    services: ['إدارة الحملات', 'SEO', 'موشن جرافيك', 'المؤثرين'],
    featured: true,
    status: 'published'
  },
  {
    id: 'proj-3',
    titleEn: 'Commercial Video Shooting & Product Photography',
    titleAr: 'تصوير الفيديوهات الإعلانية وتصوير المنتجات',
    nameEn: 'Commercial Video Shooting & Product Photography',
    nameAr: 'تصوير الفيديوهات الإعلانية وتصوير المنتجات',
    categoryEn: 'Advertising & Media',
    categoryAr: 'خدماتنا الإعلانية والتصوير',
    descriptionEn: 'High-end commercial video production and studio product photography showcasing luxury product lines.',
    descriptionAr: 'إنتاج سينمائي احترافي للإعلانات التجارية وتصوير استوديوهاتي عالي الدقة للمنتجات.',
    image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80',
    img: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80',
    clientEn: 'Aura Luxury Products',
    clientAr: 'منتجات أورا الفاخرة',
    year: '2025',
    date: '2025-11-20',
    statsEn: '5.2M Campaign Video Views',
    statsAr: '5.2 مليون مشاهدة للإعلان',
    tags: ['تصوير إعلاني', 'تصوير منتجات', 'إنتاج مرئي'],
    services: ['تصوير إعلاني', 'تصوير منتجات', 'إنتاج مرئي'],
    featured: true,
    status: 'published'
  },
  {
    id: 'proj-4',
    titleEn: 'Digital Project Analysis & Marketing Strategy Study',
    titleAr: 'الدراسات والتحليل الرقمي والاستشارات الاستراتيجية',
    nameEn: 'Digital Project Analysis & Marketing Strategy Study',
    nameAr: 'الدراسات والتحليل الرقمي والاستشارات الاستراتيجية',
    categoryEn: 'Digital Consulting',
    categoryAr: 'استشارات ودراسات رقمية',
    descriptionEn: 'In-depth digital studies, market opportunity analysis, and tailored strategic tech consulting.',
    descriptionAr: 'دراسة رقمية استراتيجية شملت تحليل السوق والفرص وتوجيه المسار التقني والتسويقي للمشروع.',
    image: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&q=80',
    img: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&q=80',
    clientEn: 'Vanguard Ventures',
    clientAr: 'فانغارد للاستثمار',
    year: '2025',
    date: '2025-10-15',
    statsEn: '100% Roadmap Feasibility',
    statsAr: '100% دقة وجدوى الخطة الرقمية',
    tags: ['استشارات تسويقية', 'تحليل رقمي', 'دراسات جدوى'],
    services: ['استشارات تسويقية', 'تحليل رقمي', 'دراسات جدوى'],
    featured: false,
    status: 'published'
  },
  {
    id: 'proj-5',
    titleEn: 'Complete Brand Identity & Visual Guidelines',
    titleAr: 'استراتيجية وتصميم الهوية البصرية ودليل الهوية',
    nameEn: 'Complete Brand Identity & Visual Guidelines',
    nameAr: 'استراتيجية وتصميم الهوية البصرية ودليل الهوية',
    categoryEn: 'Branding & Identity',
    categoryAr: 'الشعارات والهويات البصرية',
    descriptionEn: 'Full identity strategy, logo design, visual elements, applications, and comprehensive brand guideline book.',
    descriptionAr: 'بناء استراتيجية الهوية وتصميم الشعار والعناصر البصرية وتطبيقاتها مع إعداد دليل الهوية المتكامل.',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    clientEn: 'Horizon Group',
    clientAr: 'مجموعة الأفق القابضة',
    year: '2025',
    date: '2025-08-10',
    statsEn: '+190% Brand Recognition',
    statsAr: '+190% ارتفاع تميز العلامة البصرية',
    tags: ['تصميم الشعار', 'دليل الهوية', 'العناصر البصرية'],
    services: ['تصميم الشعار', 'دليل الهوية', 'العناصر البصرية'],
    featured: true,
    status: 'published'
  },
  {
    id: 'proj-6',
    titleEn: 'AI Marketing Content & Cinematic Generation',
    titleAr: 'صناعة المحتوى وتوليد الصور والفيديوهات بالذكاء الاصطناعي',
    nameEn: 'AI Marketing Content & Cinematic Generation',
    nameAr: 'صناعة المحتوى وتوليد الصور والفيديوهات بالذكاء الاصطناعي',
    categoryEn: 'AI Production',
    categoryAr: 'الإنتاج بالذكاء الاصطناعي',
    descriptionEn: 'Marketing copy creation, AI image and room generation, and high-quality cinematic AI video creation.',
    descriptionAr: 'صياغة المحتوى التسويقي الذكي، وتوليد صور ورومات بالذكاء الاصطناعي، وإنتاج فيديوهات فائقة الجودة.',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    img: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    clientEn: 'Future Tech Hub',
    clientAr: 'مركز تقنيات المستقبل',
    year: '2026',
    date: '2026-03-01',
    statsEn: '10x Faster Content Creation',
    statsAr: '10x سرعة أسرع في إنتاج المحتوى',
    tags: ['الذكاء الاصطناعي', 'كتابة المحتوى', 'توليد الصور والفيديو'],
    services: ['الذكاء الاصطناعي', 'كتابة المحتوى', 'توليد الصور والفيديو'],
    featured: true,
    status: 'published'
  }
];

const DEFAULT_POSTS: PostItem[] = [
  {
    id: 'post-1',
    titleEn: 'Scaling Microservices with MasterLink Engine',
    titleAr: 'توسيع الخدمات المصغرة باستخدام محرك ماستر لينك',
    slug: 'scaling-microservices-masterlink',
    authorEn: "Eng. Ala'a Al-Harbi",
    authorAr: 'م. علاء الحربي',
    authorNameEn: "Eng. Ala'a Al-Harbi",
    authorNameAr: 'م. علاء الحربي',
    publishDate: '2026-07-15',
    date: '2026-07-15',
    status: 'published',
    views: 1420,
    readTimeEn: '5 min read',
    readTimeAr: 'قراءة ٥ دقائق',
    img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
    categoryEn: 'Cloud Architecture',
    categoryAr: 'البنية التحتية السحابية',
    excerptEn: 'Learn how MasterLink Engine handles dynamic API routing, multi-region database failovers, and low latency caching at scale.',
    excerptAr: 'تعرف على كيفية معالجة محرك ماستر لينك للتوجيه الديناميكي لبوابات الربط، وفشل قواعد البيانات عبر أقاليم متعددة، وتخزين الذاكرة المؤقتة.',
    contentEn: 'Scaling complex microservices demands dynamic API load balancing, high fault-tolerance topologies, and automated failover mechanics built into the application core.\n\nBy leveraging MasterLink Core technologies, organizations can eliminate single points of failure while driving response latencies down to single-digit milliseconds.\n\n### Key Strategies Implemented\n- **Edge Token Verification**: Decentralizing authorization routines.\n- **Read-Heavy Query Routing**: Intelligent replication parsing.\n- **Automated Graceful Degradation**: Protecting the critical write-path under extreme traffic spikes.',
    contentAr: 'تطلب حوسبة وتوسيع الخدمات المصغرة المعقدة موازنة حيوية لأحمال بوابات الربط، وبنى تحتية عالية المرونة لتلافي الأخطاء، وحلول فشل تشغيلي تلقائية مدمجة.\n\nمن خلال استخدام تقنيات ماستر لينك الأساسية، يمكن للمؤسسات القضاء على نقاط الفشل الفردية مع تقليل زمن الاستجابة إلى أرقام أحادية بالملي ثانية.\n\n### الاستراتيجيات الرئيسية المطبقة\n- **التحقق من الرموز المميزة عند الأطراف**: لا مركزية إجراءات التفويض.\n- **توجيه استعلامات القراءة المكثفة**: تحليل ذكي لنسخ البيانات المكررة.\n- **التراجع التدريجي التلقائي**: حماية مسار الكتابة الحرج تحت طفرات الزوار الهائلة.'
  },
  {
    id: 'post-2',
    titleEn: 'Optimizing Firestore Queries for Enterprise Scale',
    titleAr: 'تحسين استعلامات فايرستور للمؤسسات الكبرى وحلول الأداء',
    slug: 'optimizing-firestore-enterprise-queries',
    authorEn: 'Eng. Khaled Mansoor',
    authorAr: 'م. خالد منصور',
    authorNameEn: 'Eng. Khaled Mansoor',
    authorNameAr: 'م. خالد منصور',
    publishDate: '2026-06-28',
    date: '2026-06-28',
    status: 'published',
    views: 3280,
    readTimeEn: '6 min read',
    readTimeAr: 'قراءة ٦ دقائق',
    img: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=600&q=80',
    image: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=600&q=80',
    categoryEn: 'Database Engineering',
    categoryAr: 'هندسة قواعد البيانات',
    excerptEn: 'Discover optimal indexing strategies, composite constraints, and client-side caching tricks to keep Firestore query prices low and response times steady.',
    excerptAr: 'اكتشف أفضل استراتيجيات الفهرسة، والقيود المركبة، وحيل التخزين المؤقت لجانب العميل لإبقاء فواتير استعلامات فايرستور منخفضة ومستقرة.',
    contentEn: 'To prevent reading spikes and maintain flat millisecond latencies, utilizing index composition, query batching, and clever local state caches are mandatory strategies.\n\nMany developers make the mistake of polling collections continuously, driving up operational costs on Google Cloud Platform. By organizing indexes, employing cursor-based pagination, and caching lookup-heavy metadata client-side, we regularly achieve over a 70% decrease in overall Firestore read charges.\n\n### Implementation Recommendations\n1. Use composite indexes to satisfy complex multi-field filtering queries.\n2. Leverage local React contexts to avoid unnecessary refetching of static resource pools.\n3. Keep document sizes minimal to prevent excessive document serialization overhead.',
    contentAr: 'لتجنب ارتفاع فواتير القراءة وللحفاظ على زمن استجابة مسطح بالملي ثانية، يعد استخدام الفهارس المركبة، وتجميع الاستعلامات، والتخزين المؤقت المحلي استراتيجية حتمية.\n\nيقع العديد من المطورين في خطأ الاستعلام المستمر من المجموعات، مما يؤدي لارتفاع التكلفة التشغيلية على منصة جوجل السحابية. من خلال موازنة الفهارس، وتطبيق الفرز المعتمد على المؤشرات الدورية، حققنا انخفاضاً يزيد عن ٧٠٪ في تكلفة القراءة.\n\n### توصيات التنفيذ والمزامنة\n١. استخدم الفهارس المركبة للاستجابة السريعة لاستعلامات التصفية المعقدة متعددة الحقول.\n٢. استفد من سياق رياكت المحلي لتفادي تكرار جلب موارد البيانات الساكنة.\n٣. حافظ على حجم الملفات صغيراً لتلافي أعباء معالجة وتجزئة المستندات الكبيرة.'
  },
  {
    id: 'post-3',
    titleEn: 'Integrating Large Language Models inside Custom ERP Core',
    titleAr: 'دمج النماذج اللغوية الكبيرة في نواة أنظمة تخطيط الموارد الكبرى',
    slug: 'llm-custom-erp-core-integration',
    authorEn: 'Dr. Sarah Al-Otaibi',
    authorAr: 'د. سارة العتيبي',
    authorNameEn: 'Dr. Sarah Al-Otaibi',
    authorNameAr: 'د. سارة العتيبي',
    publishDate: '2026-06-12',
    date: '2026-06-12',
    status: 'published',
    views: 1890,
    readTimeEn: '10 min read',
    readTimeAr: 'قراءة ١٠ دقائق',
    img: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
    categoryEn: 'AI & Machine Learning',
    categoryAr: 'الذكاء الاصطناعي',
    excerptEn: 'Embedding generative AI workflows inside ERP modules allows automatic purchase order synthesis and semantic search over invoices.',
    excerptAr: 'يتيح دمج تدفقات الذكاء الاصطناعي التوليدي في أنظمة تخطيط الموارد توليداً تلقائياً لأوامر الشراء، وبحثاً دلالياً للفواتير.',
    contentEn: 'Embedding generative AI workflows inside ERP modules allows automatic purchase order synthesis, semantic search over invoice PDFs, and intelligent risk forecasting.\n\nOur custom AI layers operate server-side utilizing high-efficiency vector databases that convert standard operational spreadsheets into structured vectors. Site managers can now chat directly with corporate catalogs, generate custom analytics summaries on-the-fly, and automate invoice reconciliation safely without exposing internal database structures.\n\n### Safety Guidelines\n- Always wrap LLM prompts in system-defined schemas.\n- Enforce strict role-based access before feeding client files to context loaders.\n- Use caching layers to keep operational overhead and model token fees predictable.',
    contentAr: 'يتيح دمج تدفقات الذكاء الاصطناعي التوليدي في أنظمة تخطيط الموارد توليداً تلقائياً لأوامر الشراء، وبحثاً دلالياً للفواتير، وتنبؤاً ذكياً بالمخاطر التشغيلية.\n\nتعمل طبقات الذكاء الاصطناعي الخاصة بنا في جانب الخادم باستخدام قواعد بيانات المتجهات عالية الكفاءة التي تحول البيانات التشغيلية لمتجهات مهيكلة. يستطيع المديرون الآن التحدث مباشرة لكتالوجات النظام لتوليد تقارير الأداء المخصصة ومطابقة الفواتير بأمان تامة.\n\n### إرشادات الأمان والسلامة\n- احرص دائماً على تغليف مدخلات النماذج اللغوية داخل هياكل وقوالب برمجية محددة النظام.\n- طبق جدار صلاحيات صارم قبل إمداد النماذج ببيانات العملاء الحساسة.\n- استغل طبقات التخزين المؤقت لإبقاء التكلفة واستهلاك الرموز في نطاق متوقع.'
  }
];

const DEFAULT_SETTINGS: SettingsState = {
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
  seoDescriptionEn: 'Leader in high-performance web development, mobile applications, AI integration, and visual branding in Saudi Arabia.',
  seoDescriptionAr: 'الشركة الرائدة في تطوير مواقع الويب، تطبيقات الهواتف الذكية، الذكاء الاصطناعي والهويات البصرية في المملكة العربية السعودية.',
  seoKeywordsEn: 'software, web development, mobile apps, riyadh, Saudi Vision 2030, branding',
  seoKeywordsAr: 'برمجيات, تطوير مواقع, تطبيقات هواتف, الرياض, رؤية 2030, تصميم هويات',
  ogImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
  defaultLanguage: 'ar',
  timezone: 'Asia/Riyadh',
  dateFormat: 'YYYY-MM-DD',
  enableMaintenance: false,
  enableCdnCache: true
};

const DEFAULT_CONSULTATIONS: ConsultationItem[] = [
  {
    id: 'CON-2026-01',
    nameEn: 'Ahmad Al-Harbi',
    nameAr: 'أحمد الحربي',
    email: 'ahmad@harbi-logistics.sa',
    phone: '+966 55 987 6543',
    companyEn: 'Harbi Logistics',
    companyAr: 'الحربي للخدمات اللوجستية',
    subjectEn: 'SaaS Platform Development',
    subjectAr: 'تطوير منصة سحابية مخصصة',
    budget: '$25,000 - $50,000',
    timeline: '1 - 3 months',
    message: 'We need an automated warehouse management platform with mobile integration.',
    date: '2026-07-21',
    status: 'new',
    services: ['Website Development', 'Mobile App Development']
  }
];

export const DEFAULT_TESTIMONIALS: TestimonialModel[] = [
  {
    id: 'testi-1',
    media_id: 'med-avatar-1',
    display_name: 'Eng. Khalid Al-Mansoor',
    display_name_ar: 'م. خالد المنصور',
    message: 'MasterLink transformed our digital infrastructure with unmatched speed and engineering excellence. Their team delivered a seamless cloud architecture.',
    message_ar: 'قامت ماستر لينك بتطوير بنيتنا التحتية الرقمية بسرعة استثنائية وجودة هندسية فائقة. قدم فريقهم حلولاً سحابية متكاملة ومستقرة.',
    sort_order: 1,
    is_active: true,
    created_at: '2026-02-15 10:30:00',
    updated_at: '2026-07-01 14:20:00',
    deleted_at: null,
    media: {
      id: 'med-avatar-1',
      file_path: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      file_name: 'khalid-mansoor.jpg',
      alt_text: 'Eng. Khalid Al-Mansoor'
    }
  },
  {
    id: 'testi-2',
    media_id: 'med-avatar-2',
    display_name: 'Sara Al-Otaibi',
    display_name_ar: 'سارة العتيبي',
    message: 'Working with MasterLink on our e-commerce platform and mobile apps exceeded our growth targets by 280%. Professionalism at its finest.',
    message_ar: 'العمل مع ماستر لينك في منصتنا للتجارة الإلكترونية والتطبيقات تجاوز أهداف النمو لدينا بنسبة 280٪. احترافية المطلقة وأداء مذهل.',
    sort_order: 2,
    is_active: true,
    created_at: '2026-03-10 11:15:00',
    updated_at: '2026-07-05 09:45:00',
    deleted_at: null,
    media: {
      id: 'med-avatar-2',
      file_path: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
      file_name: 'sara-otaibi.jpg',
      alt_text: 'Sara Al-Otaibi'
    }
  },
  {
    id: 'testi-3',
    media_id: 'med-avatar-3',
    display_name: 'Fahad Al-Dossary',
    display_name_ar: 'فهد الدوسري',
    message: 'The marketing campaigns and high-production commercial videos created by MasterLink elevated our brand position across the Gulf region.',
    message_ar: 'الحملات التسويقية ومقاطع الفيديو الإعلانية الاحترافية التي أنتجتها ماستر لينك رفعت من مكانة علامتنا التجارية في جميع دول الخليج.',
    sort_order: 3,
    is_active: true,
    created_at: '2026-04-01 16:00:00',
    updated_at: '2026-07-10 12:10:00',
    deleted_at: null,
    media: {
      id: 'med-avatar-3',
      file_path: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      file_name: 'fahad-dossary.jpg',
      alt_text: 'Fahad Al-Dossary'
    }
  }
];

export const DEFAULT_CLIENT_LOGOS: ClientLogo[] = [
  {
    id: 'logo-1',
    media_id: 'med-aramco',
    company_name: 'Saudi Aramco Digital',
    website_url: 'https://aramco.com',
    sort_order: 1,
    is_active: true,
    created_at: '2026-01-15',
    updated_at: '2026-07-01',
    deleted_at: null,
    media: {
      id: 'med-aramco',
      file_path: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" fill="none"><rect width="200" height="60" rx="12" fill="%23003366"/><circle cx="32" cy="30" r="16" fill="%2300A3E0"/><path d="M32 18 L36 28 L46 30 L37 36 L40 46 L32 39 L24 46 L27 36 L18 30 L28 28 Z" fill="%2378BE20"/><text x="58" y="32" font-family="system-ui, sans-serif" font-weight="800" font-size="14" fill="%23FFFFFF">Aramco Digital</text><text x="58" y="44" font-family="system-ui, sans-serif" font-weight="600" font-size="9" fill="%2378BE20">أرامكو الرقمية</text></svg>',
      file_name: 'aramco-digital-logo.svg'
    }
  },
  {
    id: 'logo-2',
    media_id: 'med-stc',
    company_name: 'STC Solutions',
    website_url: 'https://stc.com.sa',
    sort_order: 2,
    is_active: true,
    created_at: '2026-02-10',
    updated_at: '2026-07-02',
    deleted_at: null,
    media: {
      id: 'med-stc',
      file_path: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" fill="none"><rect width="200" height="60" rx="12" fill="%234F008C"/><path d="M22 20 Q32 10 42 20 T62 20" stroke="%23FF007A" stroke-width="4" stroke-linecap="round"/><path d="M22 30 Q32 20 42 30 T62 30" stroke="%23FF007A" stroke-width="4" stroke-linecap="round"/><path d="M22 40 Q32 30 42 40 T62 40" stroke="%23FF007A" stroke-width="4" stroke-linecap="round"/><text x="70" y="33" font-family="system-ui, sans-serif" font-weight="900" font-size="18" fill="%23FFFFFF">stc</text><text x="70" y="46" font-family="system-ui, sans-serif" font-weight="600" font-size="9" fill="%23FF007A">solutions</text></svg>',
      file_name: 'stc-solutions-logo.svg'
    }
  },
  {
    id: 'logo-3',
    media_id: 'med-neom',
    company_name: 'NEOM Tech & Digital',
    website_url: 'https://neom.com',
    sort_order: 3,
    is_active: true,
    created_at: '2026-03-05',
    updated_at: '2026-07-05',
    deleted_at: null,
    media: {
      id: 'med-neom',
      file_path: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" fill="none"><rect width="200" height="60" rx="12" fill="%23111827"/><polygon points="32,14 46,22 46,38 32,46 18,38 18,22" fill="none" stroke="%23D4AF37" stroke-width="3"/><circle cx="32" cy="30" r="5" fill="%23D4AF37"/><text x="56" y="32" font-family="system-ui, sans-serif" font-weight="900" font-size="16" fill="%23FFFFFF" letter-spacing="2">NEOM</text><text x="56" y="44" font-family="system-ui, sans-serif" font-weight="600" font-size="9" fill="%23D4AF37" letter-spacing="1">TECH %26 DIGITAL</text></svg>',
      file_name: 'neom-tech-logo.svg'
    }
  },
  {
    id: 'logo-4',
    media_id: 'med-elm',
    company_name: 'Elm Information Security',
    website_url: 'https://elm.sa',
    sort_order: 4,
    is_active: true,
    created_at: '2026-03-12',
    updated_at: '2026-07-10',
    deleted_at: null,
    media: {
      id: 'med-elm',
      file_path: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" fill="none"><rect width="200" height="60" rx="12" fill="%23044E43"/><path d="M30 16 L44 22 V34 C44 42 30 48 30 48 C30 48 16 42 16 34 V22 L30 16 Z" fill="%2300B894"/><path d="M26 30 L29 34 L35 26" stroke="%23FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><text x="54" y="32" font-family="system-ui, sans-serif" font-weight="900" font-size="18" fill="%23FFFFFF">ELM</text><text x="54" y="44" font-family="system-ui, sans-serif" font-weight="600" font-size="9" fill="%2300B894">علم للأمن الرقمي</text></svg>',
      file_name: 'elm-security-logo.svg'
    }
  },
  {
    id: 'logo-5',
    media_id: 'med-rajhi',
    company_name: 'Al Rajhi Financial',
    website_url: 'https://alrajhi-capital.com',
    sort_order: 5,
    is_active: true,
    created_at: '2026-04-01',
    updated_at: '2026-07-12',
    deleted_at: null,
    media: {
      id: 'med-rajhi',
      file_path: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" fill="none"><rect width="200" height="60" rx="12" fill="%23004A98"/><rect x="20" y="18" width="22" height="24" rx="3" fill="%23FFFFFF"/><path d="M25 24 H37 M25 30 H37 M25 36 H33" stroke="%23004A98" stroke-width="2.5" stroke-linecap="round"/><text x="50" y="31" font-family="system-ui, sans-serif" font-weight="800" font-size="14" fill="%23FFFFFF">Al Rajhi Capital</text><text x="50" y="44" font-family="system-ui, sans-serif" font-weight="600" font-size="9" fill="%2366B2FF">الراجحي المالية</text></svg>',
      file_name: 'alrajhi-financial-logo.svg'
    }
  },
  {
    id: 'logo-6',
    media_id: 'med-lean',
    company_name: 'Lean Business Services',
    website_url: 'https://lean.sa',
    sort_order: 6,
    is_active: true,
    created_at: '2026-04-18',
    updated_at: '2026-07-15',
    deleted_at: null,
    media: {
      id: 'med-lean',
      file_path: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" fill="none"><rect width="200" height="60" rx="12" fill="%230F172A"/><circle cx="30" cy="30" r="14" fill="%230284C7"/><path d="M24 30 L28 34 L36 24" stroke="%23FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><text x="52" y="32" font-family="system-ui, sans-serif" font-weight="900" font-size="16" fill="%23FFFFFF">LEAN</text><text x="52" y="44" font-family="system-ui, sans-serif" font-weight="600" font-size="9" fill="%2338BDF8">لين لخدمات الأعمال</text></svg>',
      file_name: 'lean-business-logo.svg'
    }
  },
  {
    id: 'logo-7',
    media_id: 'med-tamkeen',
    company_name: 'Tamkeen Technologies',
    website_url: 'https://tamkeentech.sa',
    sort_order: 7,
    is_active: true,
    created_at: '2026-05-02',
    updated_at: '2026-07-18',
    deleted_at: null,
    media: {
      id: 'med-tamkeen',
      file_path: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" fill="none"><rect width="200" height="60" rx="12" fill="%231E1B4B"/><path d="M20 38 L30 20 L40 38 M25 31 H35" stroke="%236366F1" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/><text x="48" y="32" font-family="system-ui, sans-serif" font-weight="800" font-size="14" fill="%23FFFFFF">TAMKEEN</text><text x="48" y="44" font-family="system-ui, sans-serif" font-weight="600" font-size="9" fill="%23818CF8">تمكين التقنية</text></svg>',
      file_name: 'tamkeen-tech-logo.svg'
    }
  },
  {
    id: 'logo-8',
    media_id: 'med-sdaia',
    company_name: 'SDAIA AI Authority',
    website_url: 'https://sdaia.gov.sa',
    sort_order: 8,
    is_active: true,
    created_at: '2026-05-15',
    updated_at: '2026-07-20',
    deleted_at: null,
    media: {
      id: 'med-sdaia',
      file_path: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" fill="none"><rect width="200" height="60" rx="12" fill="%23064E3B"/><circle cx="24" cy="24" r="4" fill="%2334D399"/><circle cx="38" cy="24" r="4" fill="%2334D399"/><circle cx="31" cy="36" r="5" fill="%2310B981"/><line x1="24" y1="24" x2="31" y2="36" stroke="%2334D399" stroke-width="2"/><line x1="38" y1="24" x2="31" y2="36" stroke="%2334D399" stroke-width="2"/><text x="50" y="32" font-family="system-ui, sans-serif" font-weight="900" font-size="16" fill="%23FFFFFF">SDAIA AI</text><text x="50" y="44" font-family="system-ui, sans-serif" font-weight="600" font-size="9" fill="%2334D399">سدايا للذكاء الاصطناعي</text></svg>',
      file_name: 'sdaia-ai-logo.svg'
    }
  }
];

export const DEFAULT_MEDIA_ITEMS: MediaLibraryItem[] = [
  {
    id: 'med-aramco',
    name: 'aramco-digital-logo.png',
    type: 'image',
    mimeType: 'image/png',
    sizeBytes: 185000,
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
    date: '2026-07-01',
    dimensions: '400 x 400',
    downloadsCount: 142
  },
  {
    id: 'med-stc',
    name: 'stc-solutions-logo.png',
    type: 'image',
    mimeType: 'image/png',
    sizeBytes: 210000,
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&q=80',
    date: '2026-07-02',
    dimensions: '400 x 400',
    downloadsCount: 98
  },
  {
    id: 'med-neom',
    name: 'neom-tech-logo.png',
    type: 'image',
    mimeType: 'image/png',
    sizeBytes: 195000,
    url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=400&q=80',
    date: '2026-07-05',
    dimensions: '400 x 400',
    downloadsCount: 115
  },
  {
    id: 'med-elm',
    name: 'elm-security-logo.png',
    type: 'image',
    mimeType: 'image/png',
    sizeBytes: 220000,
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=400&q=80',
    date: '2026-07-10',
    dimensions: '400 x 400',
    downloadsCount: 88
  },
  {
    id: 'med-rajhi',
    name: 'alrajhi-financial-logo.png',
    type: 'image',
    mimeType: 'image/png',
    sizeBytes: 175000,
    url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&q=80',
    date: '2026-07-12',
    dimensions: '400 x 400',
    downloadsCount: 76
  },
  {
    id: 'med-lean',
    name: 'lean-business-logo.png',
    type: 'image',
    mimeType: 'image/png',
    sizeBytes: 165000,
    url: 'https://images.unsplash.com/photo-1556742049-0a67e517a461?auto=format&fit=crop&w=400&q=80',
    date: '2026-07-15',
    dimensions: '400 x 400',
    downloadsCount: 64
  },
  {
    id: 'med-tamkeen',
    name: 'tamkeen-tech-logo.png',
    type: 'image',
    mimeType: 'image/png',
    sizeBytes: 190000,
    url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=400&q=80',
    date: '2026-07-18',
    dimensions: '400 x 400',
    downloadsCount: 52
  },
  {
    id: 'MED-2026-01',
    name: 'agency-hero-background-dark.jpg',
    type: 'image',
    mimeType: 'image/jpeg',
    sizeBytes: 2450000,
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    date: '2026-07-15',
    dimensions: '3840 x 2160',
    downloadsCount: 42
  },
  {
    id: 'MED-2026-05',
    name: 'riyadh-office-key-assets.jpg',
    type: 'image',
    mimeType: 'image/jpeg',
    sizeBytes: 1820000,
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    date: '2026-07-11',
    dimensions: '2400 x 1600',
    downloadsCount: 23
  },
  {
    id: 'MED-2026-07',
    name: 'cybersecurity-scaffolding-protocols.jpg',
    type: 'image',
    mimeType: 'image/jpeg',
    sizeBytes: 3110000,
    url: 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=1200&q=80',
    date: '2026-07-14',
    dimensions: '3000 x 2000',
    downloadsCount: 75
  }
];

interface DataContextType {
  services: ServiceItem[];
  projects: ProjectItem[];
  posts: PostItem[];
  settings: SettingsState;
  consultations: ConsultationItem[];
  clientLogos: ClientLogo[];
  testimonials: TestimonialModel[];
  mediaItems: MediaLibraryItem[];

  // Handlers for Testimonials
  setTestimonials: React.Dispatch<React.SetStateAction<TestimonialModel[]>>;
  addTestimonial: (testimonial: TestimonialModel) => void;
  updateTestimonial: (id: string, updated: Partial<TestimonialModel>) => void;
  deleteTestimonial: (id: string) => void;
  restoreTestimonial: (id: string) => void;
  
  // Handlers for Services
  setServices: React.Dispatch<React.SetStateAction<ServiceItem[]>>;
  addService: (service: ServiceItem) => void;
  updateService: (id: string, updated: Partial<ServiceItem>) => void;
  deleteService: (id: string) => void;

  // Handlers for Projects
  setProjects: React.Dispatch<React.SetStateAction<ProjectItem[]>>;
  addProject: (project: ProjectItem) => void;
  updateProject: (id: string, updated: Partial<ProjectItem>) => void;
  deleteProject: (id: string) => void;

  // Handlers for Posts
  setPosts: React.Dispatch<React.SetStateAction<PostItem[]>>;
  addPost: (post: PostItem) => void;
  updatePost: (id: string, updated: Partial<PostItem>) => void;
  deletePost: (id: string) => void;

  // Handlers for Settings
  setSettings: React.Dispatch<React.SetStateAction<SettingsState>>;
  updateSettings: (updated: Partial<SettingsState>) => void;

  // Handlers for Consultations
  setConsultations: React.Dispatch<React.SetStateAction<ConsultationItem[]>>;
  addConsultation: (consultation: Omit<ConsultationItem, 'id' | 'date' | 'status'>) => void;
  updateConsultationStatus: (id: string, status: ConsultationItem['status']) => void;
  deleteConsultation: (id: string) => void;

  // Handlers for Client Logos
  setClientLogos: React.Dispatch<React.SetStateAction<ClientLogo[]>>;
  addClientLogo: (logo: ClientLogo) => void;
  updateClientLogo: (id: string, updated: Partial<ClientLogo>) => void;
  deleteClientLogo: (id: string) => void;
  restoreClientLogo: (id: string) => void;

  // Handlers for Media Library
  setMediaItems: React.Dispatch<React.SetStateAction<MediaLibraryItem[]>>;
  addMediaItem: (item: MediaLibraryItem) => void;
  deleteMediaItem: (id: string) => void;

  triggerToast?: (message: string, type?: 'success' | 'danger' | 'warning' | 'info') => void;
}


// Helper to safely write to localStorage, cleaning legacy duplicate keys on quota error
const LEGACY_STORAGE_KEYS = [
  'masterlink_services',
  'masterlink_projects',
  'masterlink_client_logos',
  'masterlink_client_logos_v2',
  'masterlink_client_logos_v3',
  'masterlink_settings',
  'masterlink_media_library',
  'masterlink_testimonials'
];

function sanitizeDeepDataUrls(obj: any): any {
  if (!obj) return obj;
  if (typeof obj === 'string') {
    if (obj.startsWith('data:image/') && obj.length > 50000) {
      return 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80';
    }
    if (obj.startsWith('data:video/') && obj.length > 10000) {
      return 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80';
    }
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeDeepDataUrls);
  }
  if (typeof obj === 'object') {
    const copy: any = {};
    for (const k in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, k)) {
        copy[k] = sanitizeDeepDataUrls(obj[k]);
      }
    }
    return copy;
  }
  return obj;
}

export function safeSetLocalStorage(key: string, value: any) {
  try {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, serialized);
  } catch {
    // 1. Clean legacy key duplicates
    LEGACY_STORAGE_KEYS.forEach(k => {
      try { localStorage.removeItem(k); } catch {}
    });

    try {
      // 2. Deep sanitize large base64 data URLs
      const sanitized = sanitizeDeepDataUrls(value);
      const serialized = typeof sanitized === 'string' ? sanitized : JSON.stringify(sanitized);
      localStorage.setItem(key, serialized);
    } catch {
      // 3. Fallback: if still failing, try to write pruned shallow payload or silently handle
      try {
        if (Array.isArray(value)) {
          const minimal = value.slice(0, 10).map((item: any) => {
            if (item && typeof item === 'object') {
              const { serviceMedia, ...rest } = item;
              return sanitizeDeepDataUrls(rest);
            }
            return item;
          });
          localStorage.setItem(key, JSON.stringify(minimal));
        }
      } catch {
        // Suppress browser quota error gracefully to avoid crashing React render loop
      }
    }
  }
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Services state
  const [services, setServices] = useState<ServiceItem[]>(() => {
    try {
      const saved = localStorage.getItem('masterlink_services_v3');
      if (saved) return JSON.parse(saved);
      // Check if old storage has new items
      const legacy = localStorage.getItem('masterlink_services');
      if (legacy) {
        const parsed = JSON.parse(legacy);
        if (Array.isArray(parsed) && parsed.some((s: ServiceItem) => s.id === 'tech-services')) {
          return parsed;
        }
      }
      return DEFAULT_SERVICES;
    } catch {
      return DEFAULT_SERVICES;
    }
  });

  // Projects state
  const [projects, setProjects] = useState<ProjectItem[]>(() => {
    try {
      const saved = localStorage.getItem('masterlink_projects_v3');
      if (saved) return JSON.parse(saved);
      const legacy = localStorage.getItem('masterlink_projects');
      if (legacy) {
        const parsed = JSON.parse(legacy);
        if (Array.isArray(parsed) && parsed.some((p: ProjectItem) => p.categoryAr === 'خدماتنا التقنية' || p.categoryEn === 'Technical Services')) {
          return parsed;
        }
      }
      return DEFAULT_PROJECTS;
    } catch {
      return DEFAULT_PROJECTS;
    }
  });

  // Posts state
  const [posts, setPosts] = useState<PostItem[]>(() => {
    try {
      const saved = localStorage.getItem('masterlink_posts');
      return saved ? JSON.parse(saved) : DEFAULT_POSTS;
    } catch {
      return DEFAULT_POSTS;
    }
  });

  // Settings state
  const [settings, setSettings] = useState<SettingsState>(() => {
    try {
      const saved = localStorage.getItem('masterlink_settings_v3');
      if (saved) return JSON.parse(saved);
      const legacy = localStorage.getItem('masterlink_settings');
      if (legacy) {
        const parsed = JSON.parse(legacy);
        if (parsed && parsed.companyEmail === 'info@mastrlink.com') {
          return parsed;
        }
      }
      return DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Consultations state
  const [consultations, setConsultations] = useState<ConsultationItem[]>(() => {
    try {
      const saved = localStorage.getItem('masterlink_consultations');
      return saved ? JSON.parse(saved) : DEFAULT_CONSULTATIONS;
    } catch {
      return DEFAULT_CONSULTATIONS;
    }
  });

  // Client Logos state
  const [clientLogos, setClientLogos] = useState<ClientLogo[]>(() => {
    try {
      const savedV4 = localStorage.getItem('masterlink_client_logos_v4');
      if (savedV4) {
        const parsed = JSON.parse(savedV4);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return DEFAULT_CLIENT_LOGOS;
    } catch {
      return DEFAULT_CLIENT_LOGOS;
    }
  });

  // Testimonials state
  const [testimonials, setTestimonials] = useState<TestimonialModel[]>(() => {
    try {
      const saved = localStorage.getItem('masterlink_testimonials_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return DEFAULT_TESTIMONIALS;
    } catch {
      return DEFAULT_TESTIMONIALS;
    }
  });

  // Media Library state
  const [mediaItems, setMediaItems] = useState<MediaLibraryItem[]>(() => {
    try {
      const saved = localStorage.getItem('masterlink_media_library_v1');
      return saved ? JSON.parse(saved) : DEFAULT_MEDIA_ITEMS;
    } catch {
      return DEFAULT_MEDIA_ITEMS;
    }
  });

  // Auto-save to localStorage whenever state changes
  useEffect(() => {
    safeSetLocalStorage('masterlink_services_v3', services);
  }, [services]);

  useEffect(() => {
    safeSetLocalStorage('masterlink_projects_v3', projects);
  }, [projects]);

  useEffect(() => {
    safeSetLocalStorage('masterlink_posts', posts);
  }, [posts]);

  useEffect(() => {
    safeSetLocalStorage('masterlink_settings_v3', settings);
  }, [settings]);

  useEffect(() => {
    safeSetLocalStorage('masterlink_consultations', consultations);
  }, [consultations]);

  useEffect(() => {
    safeSetLocalStorage('masterlink_client_logos_v4', clientLogos);
  }, [clientLogos]);

  useEffect(() => {
    safeSetLocalStorage('masterlink_testimonials_v2', testimonials);
  }, [testimonials]);

  useEffect(() => {
    safeSetLocalStorage('masterlink_media_library_v1', mediaItems);
  }, [mediaItems]);

  // Service operations
  const addService = (service: ServiceItem) => {
    setServices(prev => [service, ...prev]);
  };

  const updateService = (id: string, updated: Partial<ServiceItem>) => {
    setServices(prev => prev.map(s => (s.id === id ? { ...s, ...updated } : s)));
  };

  const deleteService = (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
  };

  // Project operations
  const addProject = (project: ProjectItem) => {
    setProjects(prev => [project, ...prev]);
  };

  const updateProject = (id: string, updated: Partial<ProjectItem>) => {
    setProjects(prev => prev.map(p => (p.id === id ? { ...p, ...updated } : p)));
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  // Post operations
  const addPost = (post: PostItem) => {
    setPosts(prev => [post, ...prev]);
  };

  const updatePost = (id: string, updated: Partial<PostItem>) => {
    setPosts(prev => prev.map(p => (p.id === id ? { ...p, ...updated } : p)));
  };

  const deletePost = (id: string) => {
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  // Settings operations
  const updateSettings = (updated: Partial<SettingsState>) => {
    setSettings(prev => ({ ...prev, ...updated }));
  };

  // Consultation operations
  const addConsultation = (item: Omit<ConsultationItem, 'id' | 'date' | 'status'>) => {
    const newItem: ConsultationItem = {
      ...item,
      id: `CON-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString().split('T')[0],
      status: 'new'
    };
    setConsultations(prev => [newItem, ...prev]);
  };

  const updateConsultationStatus = (id: string, status: ConsultationItem['status']) => {
    setConsultations(prev => prev.map(c => (c.id === id ? { ...c, status } : c)));
  };

  const deleteConsultation = (id: string) => {
    setConsultations(prev => prev.filter(c => c.id !== id));
  };

  // Client Logos operations
  const addClientLogo = (logo: ClientLogo) => {
    setClientLogos(prev => [logo, ...prev]);
  };

  const updateClientLogo = (id: string, updated: Partial<ClientLogo>) => {
    setClientLogos(prev => prev.map(l => (l.id === id ? { ...l, ...updated } : l)));
  };

  const deleteClientLogo = (id: string) => {
    setClientLogos(prev => prev.filter(l => l.id !== id));
  };

  const restoreClientLogo = (id: string) => {
    setClientLogos(prev => prev.map(l => (l.id === id ? { ...l, deleted_at: null, is_active: true } : l)));
  };

  // Testimonials operations
  const addTestimonial = (item: TestimonialModel) => {
    setTestimonials(prev => [item, ...prev]);
  };

  const updateTestimonial = (id: string, updated: Partial<TestimonialModel>) => {
    setTestimonials(prev => prev.map(t => (t.id === id ? { ...t, ...updated, updated_at: new Date().toISOString() } : t)));
  };

  const deleteTestimonial = (id: string) => {
    setTestimonials(prev => prev.filter(t => t.id !== id));
  };

  const restoreTestimonial = (id: string) => {
    setTestimonials(prev => prev.map(t => (t.id === id ? { ...t, deleted_at: null, is_active: true } : t)));
  };

  // Media operations
  const addMediaItem = (item: MediaLibraryItem) => {
    setMediaItems(prev => [item, ...prev]);
  };

  const deleteMediaItem = (id: string) => {
    setMediaItems(prev => prev.filter(m => m.id !== id));
  };

  return (
    <DataContext.Provider
      value={{
        services,
        projects,
        posts,
        settings,
        consultations,
        clientLogos,
        testimonials,
        mediaItems,
        setServices,
        addService,
        updateService,
        deleteService,
        setProjects,
        addProject,
        updateProject,
        deleteProject,
        setPosts,
        addPost,
        updatePost,
        deletePost,
        setSettings,
        updateSettings,
        setConsultations,
        addConsultation,
        updateConsultationStatus,
        deleteConsultation,
        setClientLogos,
        addClientLogo,
        updateClientLogo,
        deleteClientLogo,
        restoreClientLogo,
        setTestimonials,
        addTestimonial,
        updateTestimonial,
        deleteTestimonial,
        restoreTestimonial,
        setMediaItems,
        addMediaItem,
        deleteMediaItem
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
