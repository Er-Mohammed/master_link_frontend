export interface GalleryImageItem {
  url: string;
  titleAr: string;
  titleEn: string;
}

export const CATEGORY_GALLERIES: Record<string, GalleryImageItem[]> = {
  'tech-services': [
    { url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1000&q=80', titleAr: 'بيئة عمل تطوير الأنظمة البرمجية', titleEn: 'Software System Architecture Workspace' },
    { url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80', titleAr: 'لوحات تحكم وتحليل البيانات الضخمة', titleEn: 'Enterprise Data & Analytics Dashboards' },
    { url: 'https://images.unsplash.com/photo-1556742049-0a67e517a461?auto=format&fit=crop&w=1000&q=80', titleAr: 'منصات ومتاجر إلكترونية متكاملة', titleEn: 'E-Commerce Store & Web Applications' },
    { url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1000&q=80', titleAr: 'تطبيقات واجهات الهواتف الذكية', titleEn: 'Mobile App User Experience' }
  ],
  'marketing-services': [
    { url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80', titleAr: 'تحليل نمو الحملات التسويقية', titleEn: 'Marketing Growth & Campaign Analytics' },
    { url: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?auto=format&fit=crop&w=1000&q=80', titleAr: 'استراتيجيات وإدارة المحتوى الإعلاني', titleEn: 'Advertising & Content Strategy' },
    { url: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=1000&q=80', titleAr: 'إدارة شبكات التواصل الاجتماعي', titleEn: 'Social Media Management Hub' },
    { url: 'https://images.unsplash.com/photo-1542744094-3a3172720188?auto=format&fit=crop&w=1000&q=80', titleAr: 'تحسين نتائج محركات البحث SEO', titleEn: 'SEO Optimization & Keywords' }
  ],
  'ads-media-services': [
    { url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1000&q=80', titleAr: 'معدات التصوير السينمائي والإعلاني', titleEn: 'Cinematic Production & Camera Rigs' },
    { url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=80', titleAr: 'إنتاج إعلانات تجارية فائقة الدقة', titleEn: 'Commercial Video Shooting Production' },
    { url: 'https://images.unsplash.com/photo-1520390138845-fd2d229dd553?auto=format&fit=crop&w=1000&q=80', titleAr: 'تصوير المنتجات في الاستوديو', titleEn: 'Studio Product Photography Setup' },
    { url: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1000&q=80', titleAr: 'مونتاج ومعالجة الألوان الإعلانية', titleEn: 'Color Grading & Post-Production' }
  ],
  'consulting-studies': [
    { url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1000&q=80', titleAr: 'دراسات الجدوى والمخططات الرقمية', titleEn: 'Digital Blueprint & Feasibility Studies' },
    { url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1000&q=80', titleAr: 'تحليل أداء المشاريع والاستراتيجيات', titleEn: 'Strategic Performance & Project Analysis' },
    { url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1000&q=80', titleAr: 'ورش عمل الاستشارات الرقمية', titleEn: 'Digital Transformation Consultation' },
    { url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=80', titleAr: 'تخطيط التوسع المستقبلي للأعمال', titleEn: 'Corporate Scaling & Advisory' }
  ],
  'visual-identity-branding': [
    { url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80', titleAr: 'تصميم عناصر وجوهر الهوية البصرية', titleEn: 'Visual Identity & Brand Essence' },
    { url: 'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?auto=format&fit=crop&w=1000&q=80', titleAr: 'دليل استخدام العلامة التجارية والتطبيقات', titleEn: 'Comprehensive Brand Guidelines Manual' },
    { url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=1000&q=80', titleAr: 'صياغة الشعارات ونظم الألوان', titleEn: 'Logo Conception & Color Harmonies' },
    { url: 'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?auto=format&fit=crop&w=1000&q=80', titleAr: 'مطبوعات وتطبيقات الهوية المؤسسية', titleEn: 'Corporate Identity Applications' }
  ],
  'ai-production': [
    { url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1000&q=80', titleAr: 'خوارزميات توليد المحتوى الذكي', titleEn: 'Generative AI Neural Processing' },
    { url: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=1000&q=80', titleAr: 'توليد الصور الفنية والرومات بالذكاء الاصطناعي', titleEn: 'AI Art & Spatial Room Generation' },
    { url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1000&q=80', titleAr: 'إنتاج المرئيات ثلاثية الأبعاد التوليدية', titleEn: '3D Generative Visual Production' },
    { url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80', titleAr: 'تصميم المشاهد السينمائية التوليدية', titleEn: 'AI Synthetic Media Creation' }
  ]
};
