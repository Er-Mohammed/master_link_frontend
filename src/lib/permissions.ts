/**
 * MasterLink Centralized Role-Based Access Control (RBAC) System
 * Defines roles, resource permissions, and authorization gates matching Laravel Backend specifications.
 */

export type AdminRole = 'super_admin' | 'admin' | 'content_manager' | 'marketing';

export type AppSection = 
  | 'dashboard' 
  | 'services' 
  | 'projects' 
  | 'categories' 
  | 'posts' 
  | 'media' 
  | 'testimonials' 
  | 'client_logos' 
  | 'consultations' 
  | 'settings' 
  | 'admins' 
  | 'profile';

export type ResourceAction = 
  | 'view' 
  | 'create' 
  | 'edit' 
  | 'delete' 
  | 'toggle' 
  | 'manage_roles'
  | 'manage_employees';

export interface AdminUser {
  id: string;
  nameEn: string;
  nameAr: string;
  email: string;
  phone?: string;
  role: AdminRole;
  status: 'active' | 'suspended';
  lastActive: string;
  avatar?: string;
  profile_media_id?: number | null;
  profile_media?: {
    id: number;
    url: string;
    file_name: string;
    media_type: string;
  } | null;
}

/**
 * STRICT Role-to-Section matrix based on specifications:
 * 
 * 1. Super Admin:
 *    All sections: dashboard, services, projects, categories, posts, media, testimonials, client_logos, consultations, settings, admins, profile
 * 
 * 2. Admin:
 *    dashboard, services, projects, categories, posts, media, testimonials, client_logos, consultations, profile
 *    (NO admins, NO settings)
 * 
 * 3. Content Manager:
 *    dashboard, posts, media, testimonials, profile
 *    (NO services, projects, categories, client_logos, consultations, settings, admins)
 * 
 * 4. Marketing:
 *    dashboard, projects, client_logos, consultations, profile
 *    (NO services, categories, posts, media, testimonials, settings, admins)
 */
export const ROLE_SECTION_PERMISSIONS: Record<AdminRole, readonly AppSection[]> = {
  super_admin: [
    'dashboard',
    'services',
    'projects',
    'categories',
    'posts',
    'media',
    'testimonials',
    'client_logos',
    'consultations',
    'settings',
    'admins',
    'profile'
  ],
  admin: [
    'dashboard',
    'services',
    'projects',
    'categories',
    'posts',
    'media',
    'testimonials',
    'client_logos',
    'consultations',
    'profile'
  ],
  content_manager: [
    'dashboard',
    'posts',
    'media',
    'testimonials',
    'profile'
  ],
  marketing: [
    'dashboard',
    'projects',
    'client_logos',
    'consultations',
    'profile'
  ]
} as const;

/**
 * Action-level permissions matrix for fine-grained operations
 */
export const ROLE_ACTION_PERMISSIONS: Record<AdminRole, Partial<Record<AppSection, readonly ResourceAction[]>>> = {
  super_admin: {
    dashboard: ['view'],
    services: ['view', 'create', 'edit', 'delete', 'toggle'],
    projects: ['view', 'create', 'edit', 'delete', 'toggle'],
    categories: ['view', 'create', 'edit', 'delete', 'toggle'],
    posts: ['view', 'create', 'edit', 'delete', 'toggle'],
    media: ['view', 'create', 'edit', 'delete'],
    testimonials: ['view', 'create', 'edit', 'delete', 'toggle'],
    client_logos: ['view', 'create', 'edit', 'delete', 'toggle'],
    consultations: ['view', 'edit', 'delete', 'toggle'],
    settings: ['view', 'edit'],
    admins: ['view', 'create', 'edit', 'delete', 'toggle', 'manage_roles', 'manage_employees'],
    profile: ['view', 'edit']
  },
  admin: {
    dashboard: ['view'],
    services: ['view', 'create', 'edit', 'delete', 'toggle'],
    projects: ['view', 'create', 'edit', 'delete', 'toggle'],
    categories: ['view', 'create', 'edit', 'delete', 'toggle'],
    posts: ['view', 'create', 'edit', 'delete', 'toggle'],
    media: ['view', 'create', 'edit', 'delete'],
    testimonials: ['view', 'create', 'edit', 'delete', 'toggle'],
    client_logos: ['view', 'create', 'edit', 'delete', 'toggle'],
    consultations: ['view', 'edit', 'delete', 'toggle'],
    profile: ['view', 'edit']
  },
  content_manager: {
    dashboard: ['view'],
    posts: ['view', 'create', 'edit', 'delete', 'toggle'],
    media: ['view', 'create', 'edit', 'delete'],
    testimonials: ['view', 'create', 'edit', 'delete', 'toggle'],
    profile: ['view', 'edit']
  },
  marketing: {
    dashboard: ['view'],
    projects: ['view', 'create', 'edit', 'delete', 'toggle'],
    client_logos: ['view', 'create', 'edit', 'delete', 'toggle'],
    consultations: ['view', 'edit', 'delete', 'toggle'],
    profile: ['view', 'edit']
  }
};

/**
 * Checks if a given role is authorized to access a section.
 */
export function canAccessSection(role: AdminRole, section: AppSection): boolean {
  const allowedSections = ROLE_SECTION_PERMISSIONS[role] || [];
  return allowedSections.includes(section);
}

/**
 * Checks if a given role can perform a specific action on a section/resource.
 */
export function canPerformAction(role: AdminRole, section: AppSection, action: ResourceAction): boolean {
  if (!canAccessSection(role, section)) return false;
  const actions = ROLE_ACTION_PERMISSIONS[role]?.[section] || [];
  return actions.includes(action);
}

/**
 * Checks if current role matches any of the required roles.
 */
export function hasRole(role: AdminRole, allowedRoles: AdminRole | AdminRole[]): boolean {
  if (Array.isArray(allowedRoles)) {
    return allowedRoles.includes(role);
  }
  return role === allowedRoles;
}

/**
 * Helper to get user-friendly role names
 */
export function getRoleDisplay(role: AdminRole, language: 'ar' | 'en'): { name: string; desc: string; badgeClass: string } {
  switch (role) {
    case 'super_admin':
      return {
        name: language === 'ar' ? 'المدير العام (Super Admin)' : 'Super Admin',
        desc: language === 'ar' ? 'صلاحيات كاملة وغير مقيدة على كافة أجزاء النظام والموظفين' : 'Full unrestricted system & employee governance privileges',
        badgeClass: 'bg-rose-50 text-[#F20530] border-rose-200/80 ring-rose-500/10'
      };
    case 'admin':
      return {
        name: language === 'ar' ? 'مدير تنفيذي (Admin)' : 'Admin',
        desc: language === 'ar' ? 'صلاحيات إدارة المحتوى والعمليات التشغيلية دون إدارة الموظفين' : 'Operational & content governance without user administration',
        badgeClass: 'bg-blue-50 text-[#5683FC] border-blue-200/80 ring-blue-500/10'
      };
    case 'content_manager':
      return {
        name: language === 'ar' ? 'مدير المحتوى (Content Manager)' : 'Content Manager',
        desc: language === 'ar' ? 'مختص بإدارة المقالات والمنشورات، الوسائط، وآراء العملاء' : 'Specialized in Posts, Media CDN assets & Testimonials',
        badgeClass: 'bg-purple-50 text-purple-700 border-purple-200/80 ring-purple-500/10'
      };
    case 'marketing':
      return {
        name: language === 'ar' ? 'مسؤول التسويق (Marketing)' : 'Marketing',
        desc: language === 'ar' ? 'مختص بإدارة المشاريع، شعارات العملاء، وطلبات الاستشارات' : 'Specialized in Case Studies, Client Logos & Consultations',
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200/80 ring-amber-500/10'
      };
    default:
      return {
        name: role,
        desc: '',
        badgeClass: 'bg-slate-50 text-slate-700 border-slate-200'
      };
  }
}

/**
 * Predefined demo accounts for live testing of all 4 roles
 * @deprecated Kept for backward compatibility — real auth uses Laravel Sanctum
 */
export const PRESET_ADMIN_ACCOUNTS: Record<AdminRole, AdminUser> = {
  super_admin: {
    id: 'ADM-001',
    nameEn: 'Al-Salmi (Executive Owner)',
    nameAr: 'السالمي (المالك التنفيذي)',
    email: 'alslwym053@gmail.com',
    role: 'super_admin',
    status: 'active',
    lastActive: 'الآن (متصل)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
  },
  admin: {
    id: 'ADM-002',
    nameEn: 'Mohammed Al-Ghamdi (Director)',
    nameAr: 'محمد الغامدي (مشرف تنفيذي)',
    email: 'mohammed@masterlink.tech',
    role: 'admin',
    status: 'active',
    lastActive: 'الآن (متصل)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
  },
  content_manager: {
    id: 'ADM-003',
    nameEn: 'Sara Al-Mansoor (Editor)',
    nameAr: 'سارة المنصور (مديرة المحتوى)',
    email: 'sara.m@masterlink.tech',
    role: 'content_manager',
    status: 'active',
    lastActive: 'الآن (متصل)',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80'
  },
  marketing: {
    id: 'ADM-004',
    nameEn: 'Tariq Al-Harbi (Marketing)',
    nameAr: 'طارق الحربي (مسؤول التسويق)',
    email: 'tariq.h@masterlink.tech',
    role: 'marketing',
    status: 'active',
    lastActive: 'الآن (متصل)',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'
  }
};

/**
 * Valid admin roles recognized by the system
 */
export const VALID_ADMIN_ROLES: readonly AdminRole[] = ['super_admin', 'admin', 'content_manager', 'marketing'] as const;

/**
 * Maps a Laravel admin API response to the frontend AdminUser interface.
 * The role comes exclusively from Laravel — never trust the frontend to set it.
 */
export function mapLaravelAdminToUser(admin: {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  profile_media_id?: number | null;
  profile_media?: {
    id: number;
    url: string;
    file_name: string;
    media_type: string;
  } | null;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}): AdminUser {
  // Validate role — default to most restricted if unknown
  const role: AdminRole = VALID_ADMIN_ROLES.includes(admin.role as AdminRole)
    ? (admin.role as AdminRole)
    : 'marketing';

  const avatar = admin.avatar_url || admin.profile_media?.url || undefined;

  return {
    id: String(admin.id),
    nameEn: admin.name,
    nameAr: admin.name,
    email: admin.email,
    role,
    status: admin.is_active ? 'active' : 'suspended',
    lastActive: new Date(admin.updated_at).toLocaleString('ar-SA'),
    avatar,
    profile_media_id: admin.profile_media_id ?? null,
    profile_media: admin.profile_media ?? null
  };
}

