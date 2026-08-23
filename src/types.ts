export interface ServiceMediaItem {
  id: string;
  service_id?: string;
  media_id: string;
  file_path: string;
  file_name?: string;
  alt_text?: string;
  sort_order: number;
  is_primary: boolean;
  file_size?: number;
  file_type?: string; // 'image' | 'video'
  media_type?: 'image' | 'video';
  video_url?: string;
  video_type?: 'direct' | 'youtube' | 'vimeo';
}

export interface Service {
  id: string;
  title: string;
  description: string;
  iconName: string;
  features: string[];
}

export interface ServiceModel {
  id: string;
  title: string;
  title_ar?: string;
  title_en?: string;
  slug: string;
  short_description?: string;
  short_description_ar?: string;
  short_description_en?: string;
  full_description?: string;
  full_description_ar?: string;
  full_description_en?: string;
  sort_order: number;
  is_active: boolean;
  icon_name?: string;
  created_at: string;
  updated_at?: string;
  deleted_at?: string | null;
  service_media?: ServiceMediaItem[];
}

export interface Advantage {
  id: string;
  title: string;
  description: string;
  iconName: string;
}

export interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  stats: { label: string; value: string };
  tags: string[];
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  quote: string;
  avatarUrl: string;
  rating: number;
}

export interface ProcessStep {
  number: string;
  title: string;
  description: string;
  details: string[];
}

export interface BlogPost {
  id: string;
  titleEn: string;
  titleAr: string;
  slug: string;
  authorEn: string;
  authorAr: string;
  publishDate: string;
  status: 'published' | 'draft';
  views: number;
  readTimeEn: string;
  readTimeAr: string;
  img: string;
  categoryEn: string;
  categoryAr: string;
  contentEn: string;
  contentAr: string;
  excerptEn: string;
  excerptAr: string;
}

export interface Notification {
  id: string;
  titleEn: string;
  titleAr: string;
  messageEn: string;
  messageAr: string;
  timestamp: string;
  category: 'system' | 'consultation' | 'update';
  read: boolean;
  link?: string;
  metadata?: {
    name?: string;
    email?: string;
    services?: string[];
    bulletCount?: number;
    severity?: 'info' | 'warning' | 'critical' | 'success';
  };
}

export interface MediaRelation {
  id: string;
  file_path: string;
  file_name?: string;
  alt_text?: string;
  file_type?: string;
  file_size?: number;
}

export interface MediaLibraryItem {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document' | 'audio';
  mimeType: string;
  sizeBytes: number;
  url: string;
  date: string;
  dimensions?: string;
  downloadsCount?: number;
}

export interface TestimonialModel {
  id: string;
  media_id?: string | null;
  display_name: string;
  display_name_ar?: string;
  message: string;
  message_ar?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  media?: MediaRelation | null;
}

export interface ClientLogo {
  id: string;
  media_id: string;
  company_name: string;
  website_url?: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  media?: MediaRelation | null;
}

export interface ServiceItem {
  id: string;
  nameEn?: string;
  nameAr?: string;
  title?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  shortDescription?: string;
  fullDescription?: string;
  slug: string;
  displayOrder?: number;
  sortOrder?: number;
  status?: 'active' | 'hidden' | 'deleted';
  isActive?: boolean;
  iconName?: string;
  coverImage?: string;
  videoUrl?: string;
  videoType?: 'direct' | 'youtube' | 'vimeo';
  createdAt?: string;
  featuresEn?: string[];
  featuresAr?: string[];
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
  media?: any[];
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
  platform: 'twitter' | 'linkedin' | 'instagram' | 'github' | 'youtube' | 'facebook' | 'other';
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
  seoTitleEn?: string;
  seoTitleAr?: string;
  seoDescriptionEn?: string;
  seoDescriptionAr?: string;
  seoKeywordsEn?: string;
  seoKeywordsAr?: string;
  ogImage?: string;
  defaultLanguage: 'en' | 'ar';
  timezone: string;
  dateFormat: string;
  enableMaintenance: boolean;
  enableCdnCache?: boolean;
  siteName?: string;
  siteLogo?: string | null;
  site_logo?: string | null;
}

export interface ProjectCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  projects_count?: number;
  created_at?: string;
  updated_at?: string;
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



