export interface TranslationDictionary {
  navHome: string;
  navServices: string;
  navWhyUs: string;
  navPortfolio: string;
  navProcess: string;
  navTestimonials: string;
  navCTA: string;
  
  heroBadge: string;
  heroTitle1: string;
  heroTitleHighlight: string;
  heroTitle2: string;
  heroSubtitle: string;
  heroCTA1: string;
  heroCTA2: string;
  
  stat1Value: string;
  stat1Label: string;
  stat2Value: string;
  stat2Label: string;
  stat3Value: string;
  stat3Label: string;
  
  simTitle: string;
  simBadge: string;
  simMetrics: string;
  simPageviews: string;
  simRevenue: string;
  simSlider: string;
  simSliderBoost: string;
  simSliderLeft: string;
  simSliderRight: string;
  simCaption: string;
  simFloatTag1: string;
  simFloatTag2: string;
  
  trustedTitle: string;
  
  servicesBadge: string;
  servicesTitle: string;
  servicesSubtitle: string;
  servicesExpand: string;
  servicesCollapse: string;
  servicesCloseDeck: string;
  servicesCapabilities: string;
  
  whyUsBadge: string;
  whyUsTitle: string;
  whyUsSubtitle: string;
  whyUsTag: string;
  
  portfolioBadge: string;
  portfolioTitle: string;
  portfolioSubtitle: string;
  portfolioViewCase: string;
  portfolioStatsLabel: string;
  portfolioAll: string;
  
  caseStudyChallenge: string;
  caseStudyStrategy: string;
  caseStudyResults: string;
  caseStudyClose: string;
  
  processBadge: string;
  processTitle: string;
  processSubtitle: string;
  processPhase: string;
  processDeliverables: string;
  processCaption: string;
  
  testimonialsBadge: string;
  testimonialsTitle: string;
  testimonialsSubtitle: string;
  testimonialsVerified: string;
  
  ctaBadge: string;
  ctaTitle: string;
  ctaTitleHighlight: string;
  ctaSubtitle: string;
  ctaBtn: string;
  ctaFoot1: string;
  ctaFoot2: string;
  ctaFoot3: string;
  
  footerDesc: string;
  footerCore: string;
  footerQuick: string;
  footerHq: string;
  footerEmail: string;
  footerPhone: string;
  footerAddr: string;
  footerRights: string;
  footerCrafted: string;
  
  modalTitle: string;
  modalStep: string;
  modalStep1: string;
  modalStep2: string;
  modalStep3: string;
  modalStep4: string;
  modalSuccessTitle: string;
  modalSuccessDesc1: string;
  modalSuccessDesc2: string;
  modalAssigned: string;
  modalSchedule: string;
  modalScheduleTime: string;
  modalRequested: string;
  modalBackHome: string;
  
  formName: string;
  formEmail: string;
  formPhone: string;
  formCompany: string;
  formWebsite: string;
  formServices: string;
  formServicesSubtitle: string;
  formBudget: string;
  formTimeline: string;
  formBudgetPlaceholder: string;
  formTimelinePlaceholder: string;
  formBriefTitle: string;
  formBriefSubtitle: string;
  formBriefPlaceholder: string;
  formAiBadge: string;
  formReviewTitle: string;
  formPrivacyDisclaimer: string;
  formBack: string;
  formContinue: string;
  formSubmitLoading: string;
  formSubmitBtn: string;

  // Localized Collections
  services: Array<{
    id: string;
    title: string;
    description: string;
    features: string[];
  }>;
  
  advantages: Array<{
    id: string;
    title: string;
    description: string;
  }>;
  
  projects: Array<{
    id: string;
    title: string;
    category: string;
    description: string;
    stats: { label: string; value: string };
    tags: string[];
    challenge?: string;
    strategy?: string;
    results?: string;
  }>;
  
  testimonials: Array<{
    id: string;
    name: string;
    role: string;
    company: string;
    quote: string;
  }>;
  
  processSteps: Array<{
    number: string;
    title: string;
    description: string;
    details: string[];
  }>;
}

export const translations: Record<'en' | 'ar', TranslationDictionary> = {
  en: {
    navHome: 'Home',
    navServices: 'Services',
    navWhyUs: 'Why Us',
    navPortfolio: 'Portfolio',
    navProcess: 'Process',
    navTestimonials: 'Testimonials',
    navCTA: 'Free Consultation',
    
    heroBadge: 'Awwwards-Inspired Premium Strategy',
    heroTitle1: 'Where ',
    heroTitleHighlight: 'Premium Branding',
    heroTitle2: ' Meets High-Performance Tech.',
    heroSubtitle: 'We construct elite digital architectures, immersive brand ecosystems, and targeted growth marketing models for companies that refuse to look ordinary.',
    heroCTA1: 'Book Consultation',
    heroCTA2: 'Explore Our Work',
    
    stat1Value: '15+',
    stat1Label: 'Years Design & Dev Experience',
    stat2Value: '500+',
    stat2Label: 'Elite Projects Completed',
    stat3Value: '99.4%',
    stat3Label: 'Long-Term Client Retention',
    
    simTitle: 'Live Conversion Blueprint',
    simBadge: 'Interactive Simulation',
    simMetrics: 'Projected Growth Metrics',
    simPageviews: 'Monthly Pageviews',
    simRevenue: 'Projected Revenue',
    simSlider: 'Digital Marketing & Tech Scale',
    simSliderBoost: 'Boost',
    simSliderLeft: 'Baseline (100% standard)',
    simSliderRight: 'Optimized (250% scale)',
    simCaption: 'This interactive chart projects standard conversion optimization boosts when matching our <strong>Website Engineering</strong> with <strong>Strategic Branding</strong>.',
    simFloatTag1: 'LCP Speed: 0.8s',
    simFloatTag2: 'Visual Integrity: Verified',
    
    trustedTitle: 'Trusted by Forward-Thinking Enterprise Brands & Capital Firms',
    
    servicesBadge: 'Uncompromising Scope of Service',
    servicesTitle: 'High-Performance Digital Capabilities',
    servicesSubtitle: 'We deliver end-to-end strategy, brand architecture, and cutting-edge software systems, discarding bloated frameworks for swift, custom executions.',
    servicesExpand: 'Expand Capabilities',
    servicesCollapse: 'Collapse',
    servicesCloseDeck: 'Close Deck',
    servicesCapabilities: 'Capabilities Deck',
    
    whyUsBadge: 'Structured Advantages',
    whyUsTitle: 'Why Discerning Leaders Choose Master Link',
    whyUsSubtitle: 'We operate at the convergence of meticulous design and uncompromising engineering, crafting platforms that yield tangible corporate value.',
    whyUsTag: 'PRO',
    
    portfolioBadge: 'Crystalline Execution',
    portfolioTitle: 'Case Studies of Proven Digital Influence',
    portfolioSubtitle: 'Explore how we solve systemic challenges for global organizations, delivering polished designs backed by high-velocity software engineering.',
    portfolioViewCase: 'View Case Study',
    portfolioStatsLabel: 'Improvement',
    portfolioAll: 'All',
    
    caseStudyChallenge: 'The Challenge',
    caseStudyStrategy: 'The Execution Strategy',
    caseStudyResults: 'Verifiable Key Results',
    caseStudyClose: 'Close Case Study',
    
    processBadge: 'Structured Process',
    processTitle: 'How We Partner: The Battle-Tested Blueprint',
    processSubtitle: 'From the initial strategic align to launching a high-performance web system, our workflow prioritizes speed, clarity, and feedback.',
    processPhase: 'Workflow Phase',
    processDeliverables: 'Core Deliverables & Actions',
    processCaption: 'Every task inside this process phase is tracked in real-time on our interactive client portal. You receive automatic progress briefs at the end of each sprint cycle.',
    
    testimonialsBadge: 'Social Validation',
    testimonialsTitle: 'Endorsements from Strategic Partners',
    testimonialsSubtitle: 'Read first-hand accounts from CTOs, Founders, and VP of Marketing leaders who have scaled their operations using Master Link blueprints.',
    testimonialsVerified: 'Verified Client',
    
    ctaBadge: 'Complimentary Strategic Assessment',
    ctaTitle: 'Ready to Build Something ',
    ctaTitleHighlight: 'Uncompromisingly Premium',
    ctaSubtitle: 'Schedule a 30-minute high-fidelity digital blueprint consultation session. No sales pitches, just pure strategy, audits, and feasibility reviews.',
    ctaBtn: 'Claim Free Consultation Session',
    ctaFoot1: '✓ No Obligations',
    ctaFoot2: '✓ 2-Hour SLA Response',
    ctaFoot3: '✓ Tailored Proposal Included',
    
    footerDesc: 'We engineer world-class digital systems, luxury brand frameworks, and custom market acquisition blueprints for organizations seeking uncompromising excellence.',
    footerCore: 'Core Capabilities',
    footerQuick: 'Quick Links',
    footerHq: 'HQ Contact',
    footerEmail: 'info@mastrlink.com',
    footerPhone: '771039883 - 543059985',
    footerAddr: "Sana'a - Yemen | Saudi Arabia - Jeddah",
    footerRights: 'Master Link Inc. All rights reserved.',
    footerCrafted: 'Crafted by',
    
    modalTitle: 'Request Free Consultation',
    modalStep: 'Step',
    modalStep1: 'Contact Details',
    modalStep2: 'Project Scope',
    modalStep3: 'Project Brief',
    modalStep4: 'Review & Submit',
    modalSuccessTitle: 'Consultation Request Received!',
    modalSuccessDesc1: 'Thank you',
    modalSuccessDesc2: 'Our strategic partnership team is reviewing your details and will contact you within 2 hours.',
    modalAssigned: 'Representative Assigned',
    modalSchedule: 'Target Schedule',
    modalScheduleTime: 'Today, within 2 Hours',
    modalRequested: 'Services Requested',
    modalBackHome: 'Back to Homepage',
    
    formName: 'Full Name *',
    formEmail: 'Email Address *',
    formPhone: 'Phone Number',
    formCompany: 'Company Name',
    formWebsite: 'Company Website',
    formServices: 'Select Services Needed *',
    formServicesSubtitle: 'Select as many as apply to your requirements',
    formBudget: 'Project Budget Range',
    formTimeline: 'Desired Timeline',
    formBudgetPlaceholder: 'Select a budget range...',
    formTimelinePlaceholder: 'Select desired timeline...',
    formBriefTitle: 'Project Goals & Description',
    formBriefSubtitle: 'Briefly describe what you are looking to achieve, major challenges, or specific parameters',
    formBriefPlaceholder: 'Tell us about your brand, technology targets, marketing goals, or current bottlenecks...',
    formAiBadge: 'AI-Assisted Processing: Our backend matches your brief with relevant past project blueprints from Master Link to fast-track your tailored proposal deck.',
    formReviewTitle: 'Information Summary',
    formPrivacyDisclaimer: 'By submitting this form, you agree to receive a diagnostic brief and follow-up emails from Master Link in compliance with our Privacy Policy.',
    formBack: 'Back',
    formContinue: 'Continue',
    formSubmitLoading: 'Scheduling...',
    formSubmitBtn: 'Book Free Session',

    services: [
      {
        id: 'tech-services',
        title: 'Technical Services',
        description: 'Design and development of websites, e-commerce stores, mobile apps, and micro systems using cutting-edge technologies.',
        features: ['Website Design & Development', 'E-Commerce Store Development', 'Mobile App Development', 'Micro Systems']
      },
      {
        id: 'marketing-services',
        title: 'Marketing Services',
        description: 'Comprehensive marketing solutions including campaign management, social media administration, motion graphics, graphic design, SEO, and influencer marketing.',
        features: ['Marketing Campaign Management', 'Social Media Page Management', 'Motion Video Design & Editing', 'Graphic Design', 'Search Engine Optimization (SEO)', 'Influencer Marketing']
      },
      {
        id: 'ads-media-services',
        title: 'Advertising & Photography Services',
        description: 'High-production commercial video shooting and professional product photography that elevate your brand.',
        features: ['Commercial Video Shooting', 'Product Photography']
      },
      {
        id: 'consulting-studies',
        title: 'Digital Consulting & Studies',
        description: 'In-depth digital studies, project analysis, and strategic marketing and tech consulting.',
        features: ['Marketing & Digital Project Consulting', 'Digital Project Analysis & Studies']
      },
      {
        id: 'visual-identity-branding',
        title: 'Branding & Visual Identity',
        description: 'Identity strategy, logo design, visual elements, identity applications, and comprehensive brand guidelines.',
        features: ['Identity Strategy', 'Logo Design', 'Visual Elements', 'Identity Applications', 'Brand Guidelines']
      },
      {
        id: 'ai-production',
        title: 'AI Marketing & Digital Production',
        description: 'Marketing content creation, AI image and room generation, and high-quality cinematic video production.',
        features: ['Marketing Content Creation', 'AI Image & Room Generation', 'High-Quality Video Production']
      }
    ],

    advantages: [
      {
        id: 'tech-tools',
        title: 'Advanced Technology',
        description: 'We use the latest tools and technologies to achieve optimal results and effective performance.'
      },
      {
        id: 'full-experience',
        title: 'Integrated Experience',
        description: 'We offer an end-to-end experience by providing comprehensive tech & marketing services, from logo and identity design to post-sales support.'
      },
      {
        id: 'communication',
        title: 'Communication & Transparency',
        description: 'Building an effective relationship with clients to understand their needs and achieve their goals.'
      },
      {
        id: 'customization',
        title: 'Tailored Customization',
        description: 'We treat our clients uniquely, assigning a dedicated team for each client to provide professional services and reach superior outcomes.'
      },
      {
        id: 'quality',
        title: 'Uncompromising Quality',
        description: 'We deliver high-quality professional services that guarantee our clients reach their objectives.'
      },
      {
        id: 'vision-mission',
        title: 'Vision & Mission',
        description: 'Empowering continuous client success through professional technical and marketing solutions with high efficiency.'
      }
    ],

    projects: [
      {
        id: 'apex-identity',
        title: 'Apex Capital Brand Ecosystem',
        category: 'Branding',
        description: 'A complete typographic, visual, and strategic brand overhaul for a multi-billion dollar alternative asset manager.',
        stats: { label: 'Brand Recognition', value: '+140%' },
        tags: ['Brand Strategy', 'Visual Identity', 'Design Systems'],
        challenge: 'Apex Capital required a sovereign digital presence that reflected their position managing over $4B in capital, moving away from fragmented, outdated websites to a unified modern design.',
        strategy: 'We established an immersive brand design language, structured modular content components, and built a custom static platform using highly optimized web technologies.',
        results: 'Brand consistency improved significantly across all departments. The new platform drove a massive lift in high-profile client inquiries and stakeholder confidence.'
      },
      {
        id: 'nova-platform',
        title: 'Nova Next-Gen FinTech Web App',
        category: 'Website Development',
        description: 'An interactive, secure, and blazing-fast financial planning portal built with high-fidelity real-time charting interfaces.',
        stats: { label: 'Load Speed Improved', value: '4.2x' },
        tags: ['React', 'NextJS', 'Data Visualization'],
        challenge: 'Nova Finance wanted to lower onboarding friction and replace slow-rendering chart components with lightning-quick visual interfaces.',
        strategy: 'Our engineers constructed a custom lightweight charting engine and implemented rigorous client-side performance optimizations.',
        results: 'Chart loading times dropped from seconds to fractions of a second. User engagement metrics and complete profile completions rose dramatically.'
      },
      {
        id: 'aurora-wellness',
        title: 'Aurora Mental Wellness App',
        category: 'Mobile App Development',
        description: 'A calming, beautifully designed mobile application that simplifies daily reflection with local caching and offline sync.',
        stats: { label: 'Active Users', value: '500K+' },
        tags: ['iOS App', 'Android App', 'UI/UX Design'],
        challenge: 'Aurora needed an offline-first experience that loaded fluidly across old and new devices, maintaining high-fidelity visuals under spotty networks.',
        strategy: 'We integrated local database layers, built fluid motion timelines, and refined micro-interaction curves.',
        results: 'The app achieved an elite rating on the App Store, maintaining stable synchronization and zero critical crashes since deployment.'
      },
      {
        id: 'vanguard-campaign',
        title: 'Vanguard Global Launch Strategy',
        category: 'Digital Marketing',
        description: 'An omni-channel acquisition campaign integrating high-yield search intent capture and interactive educational modules.',
        stats: { label: 'Marketing ROI', value: '380%' },
        tags: ['SEO', 'Performance Ads', 'Content Strategy'],
        challenge: 'Vanguard needed a strategic campaign to acquire qualified high-net-worth subscribers for their premium market briefings.',
        strategy: 'We deployed optimized landing systems matching custom SEO keyword structures with premium targeted PPC campaigns.',
        results: 'Conversion rates jumped to historical highs, securing client acquisition costs far below the industry average.'
      }
    ],

    testimonials: [
      {
        id: 'marcus-vance',
        name: 'Marcus Vance',
        role: 'Chief Technology Officer',
        company: 'Apex Capital',
        quote: 'Master Link completely transformed our digital footprint. Their technical precision coupled with a stunning sense of visual design delivered a platform that has redefined our company profile and investor relations.'
      },
      {
        id: 'elena-rostova',
        name: 'Elena Rostova',
        role: 'VP of Marketing',
        company: 'Nova Finance',
        quote: 'The level of craftsmanship is exceptional. Their engineers understood our complex charting requirements, and their branding team gave us an identity that truly stands out in a crowded marketplace.'
      },
      {
        id: 'devon-lane',
        name: 'Devon Lane',
        role: 'Founder & CEO',
        company: 'Aurora Labs',
        quote: 'An absolute game changer for our mobile product launch. From discovery workshops to launch day, Master Link acted as an extension of our core team. Their commitment to flawless execution is rare.'
      }
    ],

    processSteps: [
      {
        number: '01',
        title: 'Discover & Align',
        description: 'We dive deep into your company operations, objectives, competitive landscape, and user psychology to establish a rock-solid project foundation.',
        details: ['Interactive Stakeholder Workshops', 'Market & Competitor Audits', 'User Persona Definition', 'Technical Feasibility Auditing']
      },
      {
        number: '02',
        title: 'Formulate Strategy',
        description: 'We construct a bulletproof roadmap, defining exact project milestones, feature sets, communication structures, and KPI targets.',
        details: ['Product Feature Matrix', 'Information Architecture Planning', 'Tech Stack Selection', 'ROI & Growth Projections']
      },
      {
        number: '03',
        title: 'Crystalline Design',
        description: 'We draft breathtaking wireframes and interactive high-fidelity prototypes, fine-tuning visual rhythm, typography pairings, and tactile motion.',
        details: ['Comprehensive Design Systems', 'Interactive Prototypes', 'Micro-interaction Definition', 'UX Flow Optimization']
      },
      {
        number: '04',
        title: 'Precision Development',
        description: 'Our battle-hardened engineers bring designs to life with robust, standards-compliant, secure, and blazing-fast performance code.',
        details: ['High-Performance Implementations', 'Strict Responsive Layouts', 'SEO & Accessibility Setup', 'Multi-tier Quality Testing']
      },
      {
        number: '05',
        title: 'Sovereign Launch',
        description: 'We deliver your digital platform to the world with automated pipelines, seamless cutovers, analytics tracking, and continuous scaling support.',
        details: ['Production Environment Setup', 'Data Migration & Verification', 'Team Handover & Training', 'Proactive SLA & Optimization']
      }
    ]
  },
  ar: {
    navHome: 'الرئيسية',
    navServices: 'خدماتنا',
    navWhyUs: 'لماذا نحن',
    navPortfolio: 'أعمالنا',
    navProcess: 'آلية العمل',
    navTestimonials: 'قالوا عنا',
    navCTA: 'استشارة مجانية',
    
    heroBadge: 'استراتيجية متميزة مستوحاة من جوائز Awwwards',
    heroTitle1: 'حيث تلتقي ',
    heroTitleHighlight: 'الهوية البصرية الفاخرة',
    heroTitle2: ' بالتقنيات عالية الأداء.',
    heroSubtitle: 'شركة ماستر لينك، شركة تقنية وتسويقية أُنشئت من رؤية إبداعية ومبتكرة. نحن فريق من الخبراء والمبدعين لعمل حلقة ربط بين الجهة وعملائها وتحويل رؤى العملاء إلى واقع ملموس.',
    heroCTA1: 'احجز استشارة',
    heroCTA2: 'استكشف أعمالنا',
    
    stat1Value: '+١٥',
    stat1Label: 'عاماً من الخبرة في التصميم والتطوير',
    stat2Value: '+٥٠٠',
    stat2Label: 'مشروع متميز تم إنجازه بنجاح',
    stat3Value: '٪٩٩.٤',
    stat3Label: 'معدل الحفاظ على الشراكات طويلة الأجل',
    
    simTitle: 'مخطط التحويل المباشر لنسب النمو',
    simBadge: 'محاكاة تفاعلية وبث حي',
    simMetrics: 'مقاييس النمو المتوقعة بعد التحسين',
    simPageviews: 'عدد مشاهدات الصفحة شهرياً',
    simRevenue: 'الإيرادات المتوقعة المقدرة',
    simSlider: 'مقياس التسويق الرقمي والتكنولوجيا',
    simSliderBoost: 'نسبة الزيادة',
    simSliderLeft: 'الخط الأساسي (مستوى قياسي ١٠٠٪)',
    simSliderRight: 'المستوى المحسن (أداء ٢٥٠٪)',
    simCaption: 'يعرض هذا المخطط التفاعلي الزيادات القياسية في تحسين معدل التحويل عند دمج هندسة المواقع الراقية مع الهوية البصرية الاستراتيجية لدينا.',
    simFloatTag1: 'سرعة التحميل اللحظي: ٠.٨ ثانية',
    simFloatTag2: 'سلامة الهيكل البصري: معتمد ومفحوص',
    
    trustedTitle: 'محل ثقة من قبل أبرز العلامات التجارية للمؤسسات الاستشرافية وصناديق رأس المال',
    
    servicesBadge: 'خدمات ماستر لينك الشاملة',
    servicesTitle: 'حلولنا التقنية والتسويقية والإعلانية',
    servicesSubtitle: 'تجمع ماستر لينك بين الاحتراف والتكنولوجيا لتقديم خدمات فريدة تلبي تطلعات الأعمال الرقمية من التخطيط وحتى التنفيذ والمتابعة.',
    servicesExpand: 'عرض القدرات التفصيلية',
    servicesCollapse: 'طي التفاصيل',
    servicesCloseDeck: 'إغلاق عرض القدرات',
    servicesCapabilities: 'ملف القدرات والخدمات والحلول المتاحة',
    
    whyUsBadge: 'ما نتميز به في ماستر لينك',
    whyUsTitle: 'رؤيتنا، رسالتنا، ومزايانا التنافسية',
    whyUsSubtitle: 'نطمح أن نكون الرابط الرئيسي الذي يعتمد عليه عملاؤنا للوصول إلى أهدافهم التقنية والتسويقية، وتحقيق النجاح الدائم لعملائنا بكفاءة عالية.',
    whyUsTag: 'إصدار',
    
    portfolioBadge: 'تنفيذ بلوري بأعلى معايير الدقة',
    portfolioTitle: 'دراسات حالة ذات تأثير رقمي وقيمة مثبتة',
    portfolioSubtitle: 'اكتشف كيف نحل التحديات الهيكلية للمنظمات العالمية، ونقدم تصميمات مصقولة مدعومة بهندسة برمجيات عالية السرعة.',
    portfolioViewCase: 'عرض دراسة الحالة كاملة',
    portfolioStatsLabel: 'التحسن المكتسب',
    portfolioAll: 'الكل',
    
    caseStudyChallenge: 'التحدي الرئيسي القائم',
    caseStudyStrategy: 'استراتيجية التنفيذ والتطوير',
    caseStudyResults: 'النتائج والمخرجات القابلة للقياس',
    caseStudyClose: 'إغلاق نافذة دراسة الحالة',
    
    processBadge: 'المنهجية الإبداعية في ماستر لينك',
    processTitle: 'خطوات سير العمل والمنهجية المتبعة',
    processSubtitle: 'منهجية علمية وإبداعية متكاملة تبدأ من دراسة العلامة التجارية وتحليلها وحتى التطوير والتطوير المستمر.',
    processPhase: 'المرحلة',
    processDeliverables: 'المخرجات والخطوات والمهام الرئيسية',
    processCaption: 'يتم تتبع كل مهمة داخل هذه المرحلة من مراحل العمل في وقتها الفعلي عبر بوابة العميل التفاعلية.',
    
    testimonialsBadge: 'التحقق الاجتماعي ورضا العملاء',
    testimonialsTitle: 'شهادات نعتز بها من شركائنا الاستراتيجيين',
    testimonialsSubtitle: 'اقرأ شهادات مباشرة من مدراء التقنية التنفيذيين، والمؤسسين، وقادة التسويق الذين قاموا بتوسيع نطاق عملياتهم باستخدام مخططات ماستر لينك.',
    testimonialsVerified: 'عميل موثق ومعتمد',
    
    ctaBadge: 'تقييم استراتيجي شامل مجاني ومباشر',
    ctaTitle: 'هل أنت مستعد لبناء شيء متميز ومثالي ',
    ctaTitleHighlight: 'بأعلى معايير الجودة؟',
    ctaSubtitle: 'احجز جلسة استشارة مجانية مدتها ٣٠ دقيقة لمخططك الرقمي عالي الدقة. لا عروض ترويجية، فقط استراتيجية بحتة ومراجعة لجدوى المشروع وسرعته.',
    ctaBtn: 'احصل على استشارتك الاستراتيجية المجانية الآن',
    ctaFoot1: '✓ بدون التزامات مسبقة',
    ctaFoot2: '✓ استجابة سريعة خلال ساعتين',
    ctaFoot3: '✓ يتضمن مقترحاً مخصصاً بالكامل',
    
    footerDesc: 'شركة ماستر لينك، شركة تقنية وتسويقية أُنشئت من رؤية إبداعية ومبتكرة. نحن فريق من الخبراء والمبدعين لعمل حلقة ربط بين الجهة وعملائها وتحويل رؤى العملاء إلى واقع ملموس.',
    footerCore: 'القدرات الأساسية',
    footerQuick: 'روابط سريعة',
    footerHq: 'المكتب الرئيسي والاتصال',
    footerEmail: 'info@mastrlink.com',
    footerPhone: '771039883 - 543059985',
    footerAddr: 'صنعاء - اليمن | السعودية - جدة',
    footerRights: 'جميع الحقوق محفوظة لشركة ماستر لينك.',
    footerCrafted: 'صُنع بكل فخر بواسطة',
    
    modalTitle: 'طلب حجز استشارة استراتيجية مجانية',
    modalStep: 'الخطوة',
    modalStep1: 'معلومات الاتصال بالعميل',
    modalStep2: 'نطاق وأبعاد المشروع',
    modalStep3: 'موجز أهداف العمل',
    modalStep4: 'مراجعة وتأكيد الطلب',
    modalSuccessTitle: 'تم استلام طلب الاستشارة بنجاح!',
    modalSuccessDesc1: 'شكراً لك يا',
    modalSuccessDesc2: 'يقوم فريق الشراكات الاستراتيجية بمراجعة تفاصيل طلبك الآن، وسنتصل بك في غضون ساعتين.',
    modalAssigned: 'المستشار الاستراتيجي المعين لك',
    modalSchedule: 'الجدول الزمني المخطط للرد',
    modalScheduleTime: 'اليوم، خلال ساعتين بحد أقصى',
    modalRequested: 'الخدمات التي تم تحديدها',
    modalBackHome: 'العودة إلى الصفحة الرئيسية',
    
    formName: 'الاسم الكامل للعميل *',
    formEmail: 'عنوان البريد الإلكتروني *',
    formPhone: 'رقم الهاتف للتواصل المباشر',
    formCompany: 'اسم الشركة أو المؤسسة',
    formWebsite: 'الموقع الإلكتروني الحالي (إن وجد)',
    formServices: 'اختر الخدمات المطلوبة لمشروعك *',
    formServicesSubtitle: 'يمكنك اختيار عدة خدمات بناءً على احتياجاتك الفنية والتسويقية',
    formBudget: 'النطاق التقديري للميزانية المقترحة',
    formTimeline: 'الجدول الزمني المتوقع لبدء العمل',
    formBudgetPlaceholder: 'الرجاء اختيار نطاق الميزانية...',
    formTimelinePlaceholder: 'الرجاء اختيار الجدول الزمني المفضل...',
    formBriefTitle: 'وصف وموجز أهداف وطموحات المشروع',
    formBriefSubtitle: 'يرجى تقديم وصف موجز عما تهدف لتحقيقه، وأبرز التحديات التي تواجهك، أو معايير محددة',
    formBriefPlaceholder: 'أخبرنا عن علامتك التجارية، وأهدافك التكنولوجية، وتطلعاتك التسويقية، أو العقبات الحالية...',
    formAiBadge: 'معالجة مدعومة بالذكاء الاصطناعي الفوري: يطابق نظامنا موجز مشروعك مع نماذج ومخططات سابقة ناجحة لتسريع إعداد مقترحك الاستراتيجي المخصص.',
    formReviewTitle: 'ملخص ومراجعة تفاصيل البيانات المُدخلة',
    formPrivacyDisclaimer: 'بتقديم هذا النموذج، فإنك توافق على استلام مراجعة تشخيصية ورسائل متابعة بريدية من ماستر لينك بما يتوافق مع سياسة الخصوصية الخاصة بنا.',
    formBack: 'رجوع للخطوة السابقة',
    formContinue: 'متابعة الخطوة التالية',
    formSubmitLoading: 'جاري حجز موعدك وجدولة الجلسة...',
    formSubmitBtn: 'احجز جلسة الاستشارة الآن',

    services: [
      {
        id: 'tech-services',
        title: 'خدماتنا التقنية',
        description: 'تصميم وبناء المواقع الإلكترونية، المتاجر الإلكترونية، تطبيقات الهواتف الذكية والأنظمة المصغرة بأعلى جودة وكفاءة.',
        features: ['تصميم وبرمجة المواقع الإلكترونية', 'تصميم وبرمجة المتاجر الإلكترونية', 'تصميم وبرمجة التطبيقات', 'الأنظمة المصغرة']
      },
      {
        id: 'marketing-services',
        title: 'خدماتنا التسويقية',
        description: 'حلول تسويقية متكاملة تشمل إدارة الحملات، الصفحات، فيديوهات الموشن، التصميم الجرافيكي، SEO، والتسويق عبر المؤثرين.',
        features: ['إدارة الحملات التسويقية', 'إدارة الصفحات', 'تصميم ومونتاج فيديوهات الموشن', 'التصميم الجرافيكي', 'تحسين محركات البحث (SEO)', 'التسويق عبر المؤثرين']
      },
      {
        id: 'ads-media-services',
        title: 'خدماتنا الإعلانية والتصوير',
        description: 'إنتاج إعلاني مرئي وتصوير احترافي للمنتجات والفيديوهات الإعلانية لتعزيز القوة التنافسية لعلامتك.',
        features: ['تصوير الفيديوهات الإعلانية', 'تصوير المنتجات']
      },
      {
        id: 'consulting-studies',
        title: 'استشارات ودراسات رقمية',
        description: 'دراسات رقمية شاملة وتحليل دقيق للمشاريع مع تقديم استشارات تسويقية ورقمية مخصصة للنهوض بالأعمال.',
        features: ['استشارات تسويقية ورقمية للمشاريع', 'الدراسات والتحليل الرقمي للمشاريع']
      },
      {
        id: 'visual-identity-branding',
        title: 'الشعارات والهويات البصرية',
        description: 'صياغة استراتيجية الهوية وتصميم الشعارات والعناصر البصرية وتطبيقات الهوية ودليل الهوية المتكامل.',
        features: ['استراتيجية الهوية', 'تصميم الشعار', 'العناصر البصرية', 'تطبيقات الهوية', 'دليل الهوية']
      },
      {
        id: 'ai-production',
        title: 'الإنتاج التسويقي والرقمي بالذكاء الاصطناعي',
        description: 'صناعة وكتابة المحتوى التسويقي، وتوليد الصور والرومات، وإنتاج الفيديوهات بأعلى جودة واحترافية باستخدام الذكاء الاصطناعي.',
        features: ['كتابة المحتوى التسويقي', 'توليد وإنتاج الصور والرومات', 'إنتاج الفيديوهات بأعلى جودة واحترافية']
      }
    ],

    advantages: [
      {
        id: 'tech-tools',
        title: 'تكنولوجيا متقدمة',
        description: 'نستخدم أحدث الأدوات والتقنيات لتحقيق أفضل النتائج ولأداء فعّال.'
      },
      {
        id: 'full-experience',
        title: 'تجربة متكاملة',
        description: 'نقدم تجربة متكاملة من خلال تقديم خدمات تقنية وتسويقية شاملة، بدءًا من تصميم الشعار والهوية وحتى خدمة ما بعد البيع لتحقيق نجاح شامل.'
      },
      {
        id: 'communication',
        title: 'التواصل والشفافية',
        description: 'بناء علاقة فعالة مع العملاء لفهم احتياجاتهم وتحقيق أهدافهم.'
      },
      {
        id: 'customization',
        title: 'التخصيص',
        description: 'نتعامل مع عملائنا بشكل خاص ومتفرد، مع تخصيص فريق خاص لكل عميل لتقديم خدمات احترافية والوصول إلى نتائج عالية.'
      },
      {
        id: 'quality',
        title: 'الجودة',
        description: 'نقدم خدمات احترافية ذات جودة عالية تضمن لعملائنا تحقيق أهدافهم.'
      },
      {
        id: 'vision-mission',
        title: 'رؤيتنا ورسالتنا',
        description: 'نطمح أن نكون الرابط الرئيسي الذي يعتمد عليه عملاؤنا للوصول إلى أهدافهم، والنجاح الدائم من خلال تقديم حلول احترافية بكفاءة عالية.'
      }
    ],

    projects: [
      {
        id: 'tech-platform',
        title: 'منصة المتجر والتطبيق الإلكتروني التجاري الشامل',
        category: 'خدماتنا التقنية',
        description: 'تصميم وبناء موقع وتطبيق متجر إلكتروني متكامل وأنظمة مصغرة للحلول التجارية عالية الكفاءة.',
        stats: { label: 'نمو المبيعات والطلبات', value: '+٢٨٠٪' },
        tags: ['المواقع والمتاجر', 'تطبيقات الجوال', 'الأنظمة المصغرة'],
        challenge: 'احتاج العميل إلى منصة مبيعات موحدة تجمع بين الموقع والتطبيق مع ربط أنظمة مصغرة مخصصة لإدارة المخزون والتوصيل.',
        strategy: 'قمنا بهندسة متجر إلكتروني سريع وتطبيق هاتف سلس مع ربط واجهات أنظمة مصغرة ذكية.',
        results: 'شهدت المنصة قفزة قياسية في معدل المبيعات والطلبات مع تجربة استخدام متكاملة.'
      },
      {
        id: 'marketing-campaign',
        title: 'إدارة الحملات التسويقية المتكاملة وتصدر الـ SEO',
        category: 'خدماتنا التسويقية',
        description: 'إدارة شاملة للحملات والصفحات وفيديوهات الموشن والتصميم الجرافيكي مع تصدر نتائج البحث وتسويق المؤثرين.',
        stats: { label: 'نمو الزيارات والتفاعلات', value: '+٣٤٠٪' },
        tags: ['إدارة الحملات', 'SEO', 'موشن جرافيك', 'المؤثرين'],
        challenge: 'احتاجت العلامة إلى زيادة الوعي التجاري، وتصدر محركات البحث، وإنتاج فيديوهات موشن جذابة مع إدارة المحتوى والتسويق عبر المؤثرين.',
        strategy: 'أطلقنا استراتيجية تسويقية متكاملة تشمل إدارة الصفحات، تحسين الـ SEO، إنتاج فيديوهات موشن، وإدارة حملات المؤثرين.',
        results: 'تصدر الموقع نتائج البحث الأولى وتضاعفت التفاعلات والوصول العضوي بشكل غير مسبوق.'
      },
      {
        id: 'ads-media-shooting',
        title: 'تصوير الفيديوهات الإعلانية وتصوير المنتجات',
        category: 'خدماتنا الإعلانية والتصوير',
        description: 'إنتاج سينمائي احترافي للإعلانات التجارية وتصوير استوديوهاتي عالي الدقة للمنتجات.',
        stats: { label: 'مشاهدات الحملة الإعلانية', value: '٥.٢ مليون' },
        tags: ['تصوير إعلاني', 'تصوير منتجات', 'إنتاج مرئي'],
        challenge: 'إبراز تفاصيل وفخامة المنتجات عبر تصوير إعلاني واستوديو احترافي لتعزيز القوة التنافسية للعلامة التجارية.',
        strategy: 'قمنا بإخراج وتصوير فيديوهات إعلانية سينمائية وتصوير فوتوغرافي عالي الدقة للمنتجات.',
        results: 'أثمرت الحملة عن انتشار واسع ومعدلات تفاعل استثنائية من العملاء.'
      },
      {
        id: 'consulting-studies-case',
        title: 'الدراسات والتحليل الرقمي والاستشارات الاستراتيجية',
        category: 'استشارات ودراسات رقمية',
        description: 'دراسة رقمية استراتيجية شملت تحليل السوق والفرص وتوجيه المسار التقني والتسويقي للمشروع.',
        stats: { label: 'دقة وجدوى الخطة الرقمية', value: '١٠٠٪' },
        tags: ['استشارات تسويقية', 'تحليل رقمي', 'دراسات مشروع'],
        challenge: 'تحليل مشروع رقمي استثماري لتفادي المخاطر ورسم خريطة طريق واضحة للمسار التقني والتسويقي.',
        strategy: 'أجرينا دراسة تحليليلة شاملة للمنافسين والجمهور ورسمنا خارطة طريق فنية وتسويقية.',
        results: 'تقديم دراسة رقمية استراتيجية مكنت المشروع من الانطلاق بقوة وأمان.'
      },
      {
        id: 'branding-guidelines',
        title: 'استراتيجية وتصميم الهوية البصرية ودليل الهوية',
        category: 'الشعارات والهويات البصرية',
        description: 'بناء استراتيجية الهوية وتصميم الشعار والعناصر البصرية وتطبيقاتها مع إعداد دليل الهوية المتكامل.',
        stats: { label: 'ارتفاع تميز العلامة', value: '+١٩٠٪' },
        tags: ['تصميم الشعار', 'دليل الهوية', 'العناصر البصرية'],
        challenge: 'بناء هوية بصرية مميزة تعبر عن القوة المؤسسية وتضمن الاتساق عبر كافة التطبيقات.',
        strategy: 'صغنا استراتيجية الهوية وشعار مبتكر وعناصر بصرية فريدة وأصدرنا دليل هوية شامل.',
        results: 'تحقيق انطباع بصري احترافي عزز من مكانة الشركة في السوق.'
      },
      {
        id: 'ai-content-video',
        title: 'صناعة المحتوى وتوليد الصور والفيديوهات بالذكاء الاصطناعي',
        category: 'الإنتاج بالذكاء الاصطناعي',
        description: 'صياغة المحتوى التسويقي الذكي، وتوليد صور ورومات بالذكاء الاصطناعي، وإنتاج فيديوهات فائقة الجودة.',
        stats: { label: 'سرعة إنتاج المحتوى', value: '١٠ أضعاف' },
        tags: ['كتابة محتوى AI', 'توليد صور ورومات', 'إنتاج فيديو AI'],
        challenge: 'إنتاج كميات كبيرة من المحتوى التسويقي والصور والفيديوهات السينمائية بسرعة وكفاءة عالية.',
        strategy: 'استخدام أحدث تقنيات الذكاء الاصطناعي لكتابة المحتوى وتوليد الصور والرومات وإنتاج الفيديوهات.',
        results: 'توفير الوقت والتكلفة بنسبة ٩٠٪ مع الحفاظ على أعلى مستويات الاحترافية والجودة.'
      }
    ],

    testimonials: [
      {
        id: 'marcus-vance',
        name: 'ماركوس فانس',
        role: 'مدير قطاع التقنية CTO',
        company: 'أبيكس كابيتال',
        quote: 'أحدثت ماستر لينك تحولاً جذرياً في بصمتنا الرقمية بالكامل. إن دقتهم التقنية العالية المقترنة بحس التصميم البصري المذهل أثمرت عن منصة متكاملة أعادت تعريف صورتنا المؤسسية وعلاقاتنا مع كبار المستثمرين.'
      },
      {
        id: 'elena-rostova',
        name: 'إيلينا روستوفا',
        role: 'نائب رئيس قسم التسويق',
        company: 'نوفا فاينانس',
        quote: 'مستوى الاحترافية والاتقان استثنائي بكل المقاييس. لقد فهم مهندسوهم متطلباتنا المعقدة للرسوم البيانية بدقة واضحة، ووهبنا فريق الهوية البصرية لديهم حضوراً مميزاً يتألق بقوة في السوق المزدحم.'
      },
      {
        id: 'devon-lane',
        name: 'ديفون لين',
        role: 'المؤسس والمدير التنفيذي',
        company: 'أورورا لابس',
        quote: 'نقطة تحول تاريخية لإطلاق تطبيقنا المحمول. بدءاً من ورش العمل التمهيدية والتحليلية وحتى يوم التدشين، عمل فريق ماستر لينك كامتداد لفريقنا الأساسي. إن التزامهم بالتنفيذ المثالي الخالي من الثغرات نادر جداً.'
      }
    ],

    processSteps: [
      {
        number: '٠١',
        title: 'دراسة العلامة التجارية وتحليلها',
        description: 'الخطوة الأولى في المنهجية الإبداعية: دراسة العلامة التجارية وتحليلها بعمق لفهم نقاط القوة والفرص والسوق المستهدف.',
        details: ['تحليل الحضور الحالي للعلامة', 'دراسة المنافسين في السوق', 'تحديد الجمهور المستهدف', 'تشخيص الفرص ونقاط القوة']
      },
      {
        number: '٠٢',
        title: 'بناء الخطة وفق التحليل لضمان النتائج',
        description: 'بناء الخطة الاستراتيجية المحكمة وفق التحليل الدقيق لضمان الوصول إلى أفضل النتائج القابلة للقياس.',
        details: ['تحديد الأهداف والـ KPIs', 'رسم المسارات التقنية والتسويقية', 'جدولة المراحل والمخرجات', 'تخصيص الموارد']
      },
      {
        number: '٠٣',
        title: 'تخصيص فريق خاص لكل جهة لضمان الجودة',
        description: 'تخصيص فريق خاص لكل جهة لكل جوانب العمل لضمان أعلى معايير الجودة والاهتمام بكل التفاصيل.',
        details: ['فريق تقني وتسويقي مخصص', 'مدير حساب مباشر للمشروع', 'تنفيذ دقيق ومتخصص', 'متابعة يومية ومباشرة']
      },
      {
        number: '٠٤',
        title: 'تقارير واضحة وشفافة لقياس النتائج وتقييمها',
        description: 'تقديم تقارير دورية واضحة وشفافة لقياس النتائج وتقييم كفاءة الحملات والحلول الفنية بشكل مستمر.',
        details: ['تقارير دورية قياسية', 'مؤشرات الأداء اللحظية', 'شفافية كاملة مع العميل', 'قياس العائد على الاستثمار']
      },
      {
        number: '٠٥',
        title: 'التحليل والتطوير المستمر',
        description: 'متابعة عمليات التحليل والتطوير المستمر لضمان استدامة النجاح ومواكبة كل جديد في عالم التكنولوجيا والتسويق.',
        details: ['تحليل بيانات الأداء والتفاعل', 'التطوير والتحسين المستمر', 'مواكبة التقنيات الحديثة', 'تحقيق النجاح الدائم للعميل']
      }
    ]
  }
};
