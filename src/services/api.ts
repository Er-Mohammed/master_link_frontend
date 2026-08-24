/**
 * MasterLink API Client Service Layer
 * 
 * Provides:
 * 1. authApi — Laravel Sanctum authentication endpoints
 * 2. adminApi — Reusable admin API helpers with auto-auth
 * 3. apiService — Public data fetching with local fallback
 */

import {
  projectsData,
  testimonialsData,
  clientLogosData,
  advantagesData,
  processData,
  settingsData
} from '../data';
import {
  ServiceItem,
  ProjectItem,
  TestimonialModel,
  ClientLogo,
  Advantage,
  ProcessStep,
  SettingsState,
  ConsultationItem
} from '../types';
import type { AdminRole } from '../lib/permissions';

// ─── Base URL ────────────────────────────────────────────────────────
const RAW_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const API_BASE_URL = RAW_BASE.replace(/\/+$/, '');

// ─── Token Storage ───────────────────────────────────────────────────
const TOKEN_KEY = 'masterlink_admin_token';

function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function setStoredToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // storage full or unavailable
  }
}

function clearStoredToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore
  }
}

// ─── API Error Type ──────────────────────────────────────────────────
export interface ApiError {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
}

// ─── Admin User Response Type ────────────────────────────────────────
export interface AdminUserResponse {
  id: number;
  name: string;
  email: string;
  role: AdminRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    admin: AdminUserResponse;
  };
}

export interface MeResponse {
  success: boolean;
  data: AdminUserResponse;
}

// ─── Generic Fetch Helper ────────────────────────────────────────────
async function apiFetch<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  // Attach token if available
  const token = getStoredToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Attach Content-Type for JSON body
  if (options.body && typeof options.body === 'string') {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers
  });

  // Handle non-2xx responses
  if (!response.ok) {
    let errorData: { message?: string; errors?: Record<string, string[]> } = {};
    try {
      errorData = await response.json();
    } catch {
      // response body not valid JSON
    }

    const apiError: ApiError = {
      status: response.status,
      message: errorData.message || `Request failed with status ${response.status}`,
      errors: errorData.errors
    };
    throw apiError;
  }

  // Parse JSON safely
  try {
    return await response.json() as T;
  } catch {
    return {} as T;
  }
}

// ─── Auth API ────────────────────────────────────────────────────────
export const authApi = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await apiFetch<LoginResponse>('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    // Store token on successful login
    if (response.data?.token) {
      setStoredToken(response.data.token);
    }

    return response;
  },

  async me(): Promise<MeResponse> {
    return apiFetch<MeResponse>('/api/admin/me');
  },

  async updateProfile(data: { name?: string; email?: string; profile_media_id?: number | null }): Promise<MeResponse> {
    try {
      return await apiFetch<MeResponse>('/api/admin/me', {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      if (apiErr?.status === 404) {
        return await apiFetch<MeResponse>('/api/admin/profile', {
          method: 'PUT',
          body: JSON.stringify(data)
        });
      }
      throw err;
    }
  },

  async logout(): Promise<void> {
    try {
      await apiFetch<{ success: boolean }>('/api/admin/logout', {
        method: 'POST'
      });
    } finally {
      clearStoredToken();
    }
  },

  async changePassword(currentPassword: string, newPassword: string, confirmPassword: string): Promise<{ success: boolean; message: string; data?: { token: string } }> {
    const response = await apiFetch<{ success: boolean; message: string; data?: { token: string } }>('/api/admin/change-password', {
      method: 'POST',
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword
      })
    });

    if (response.data?.token) {
      setStoredToken(response.data.token);
    }

    return response;
  },

  getToken(): string | null {
    return getStoredToken();
  },

  clearToken(): void {
    clearStoredToken();
  }
};

// ─── Admin API (Reusable CRUD Helper) ────────────────────────────────
export const adminApi = {
  async get<T = unknown>(url: string): Promise<T> {
    return apiFetch<T>(url);
  },

  async post<T = unknown>(url: string, data?: unknown): Promise<T> {
    return apiFetch<T>(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    });
  },

  async put<T = unknown>(url: string, data?: unknown): Promise<T> {
    return apiFetch<T>(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    });
  },

  async delete<T = unknown>(url: string): Promise<T> {
    return apiFetch<T>(url, {
      method: 'DELETE'
    });
  },

  async getBlob(url: string): Promise<Blob> {
    const token = getStoredToken();
    const headers: Record<string, string> = {
      'Accept': '*/*',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(`${API_BASE_URL}${url}`, { headers });
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }
    return await res.blob();
  }
};

// ─── Laravel Admin Services API Contract ─────────────────────────────
export interface LaravelMedia {
  id: number;
  file_name: string;
  url: string;
  extension: string;
  media_type: string;
  mime_type: string;
  file_size: number;
  alt_text: string | null;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface LaravelService {
  id: number;
  title: string;
  slug: string;
  short_description: string | null;
  full_description: string | null;
  sort_order: number;
  is_active: boolean;
  media?: LaravelMedia[];
  media_count?: number;
  projects_count?: number;
  consultations_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface LaravelServicePayload {
  title: string;
  slug: string;
  short_description?: string | null;
  full_description?: string | null;
  sort_order?: number;
  is_active?: boolean;
}

export interface LaravelPaginatedResponse<T> {
  data: T[];
  links?: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta?: {
    current_page: number;
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
  };
}

export interface LaravelApiResponse<T> {
  success?: boolean;
  message?: string;
  data: T;
}

export function mapLaravelServiceToItem(service: LaravelService): ServiceItem {
  const primaryMedia = service.media && service.media.length > 0 ? service.media[0] : null;
  const coverImage = primaryMedia?.url || '';

  return {
    id: String(service.id),
    nameEn: service.title,
    nameAr: service.title,
    title: service.title,
    descriptionEn: service.short_description || '',
    descriptionAr: service.short_description || '',
    shortDescription: service.short_description || '',
    fullDescription: service.full_description || '',
    slug: service.slug,
    displayOrder: service.sort_order ?? 1,
    sortOrder: service.sort_order ?? 1,
    status: service.is_active ? 'active' : 'hidden',
    isActive: service.is_active,
    iconName: 'Code2',
    coverImage,
    createdAt: service.created_at ? service.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
    featuresEn: [],
    featuresAr: [],
    serviceMedia: service.media ? service.media.map(m => ({
      id: `sm-${m.id}`,
      media_id: String(m.id),
      file_path: m.url,
      file_name: m.file_name,
      alt_text: m.alt_text || '',
      sort_order: m.sort_order ?? 1,
      is_primary: m.id === primaryMedia?.id,
      file_size: m.file_size,
      file_type: m.media_type === 'video' ? 'video' : 'image'
    })) : []
  };
}

export function mapServiceItemToLaravelPayload(item: Partial<ServiceItem> & { title?: string }): LaravelServicePayload {
  const title = item.title || item.nameAr || item.nameEn || '';
  const slug = item.slug || title.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  return {
    title,
    slug,
    short_description: item.shortDescription || item.descriptionAr || item.descriptionEn || null,
    full_description: item.fullDescription || null,
    sort_order: item.sortOrder ?? item.displayOrder ?? 1,
    is_active: item.isActive !== undefined ? item.isActive : (item.status === 'active')
  };
}

export const adminServicesApi = {
  async getAll(params?: {
    search?: string;
    is_active?: boolean;
    sort?: string;
    direction?: string;
    per_page?: number;
    page?: number;
  }): Promise<LaravelPaginatedResponse<LaravelService>> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.is_active !== undefined) query.append('is_active', String(params.is_active));
    if (params?.sort) query.append('sort', params.sort);
    if (params?.direction) query.append('direction', params.direction);
    if (params?.per_page) query.append('per_page', String(params.per_page));
    if (params?.page) query.append('page', String(params.page));

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return adminApi.get<LaravelPaginatedResponse<LaravelService>>(`/api/admin/services${queryString}`);
  },

  async getById(id: string | number): Promise<LaravelApiResponse<LaravelService>> {
    return adminApi.get<LaravelApiResponse<LaravelService>>(`/api/admin/services/${id}`);
  },

  async create(payload: LaravelServicePayload): Promise<LaravelApiResponse<LaravelService>> {
    return adminApi.post<LaravelApiResponse<LaravelService>>('/api/admin/services', payload);
  },

  async update(id: string | number, payload: Partial<LaravelServicePayload>): Promise<LaravelApiResponse<LaravelService>> {
    return adminApi.put<LaravelApiResponse<LaravelService>>(`/api/admin/services/${id}`, payload);
  },

  async delete(id: string | number): Promise<{ success: boolean; message: string }> {
    return adminApi.delete<{ success: boolean; message: string }>(`/api/admin/services/${id}`);
  },

  async attachMedia(serviceId: string | number, mediaId: number, sortOrder?: number): Promise<LaravelApiResponse<LaravelService>> {
    return adminApi.post<LaravelApiResponse<LaravelService>>(`/api/admin/services/${serviceId}/media`, {
      media_id: mediaId,
      sort_order: sortOrder ?? 0
    });
  },

  async detachMedia(serviceId: string | number, mediaId: number): Promise<LaravelApiResponse<LaravelService>> {
    return adminApi.delete<LaravelApiResponse<LaravelService>>(`/api/admin/services/${serviceId}/media/${mediaId}`);
  }
};

// ─── Laravel Admin Projects & Categories API Contract ────────────────
export interface LaravelProjectCategory {
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

export interface LaravelProject {
  id: number;
  category_id: number;
  title: string;
  slug: string;
  client_name: string | null;
  short_description: string | null;
  full_description: string | null;
  project_url: string | null;
  completion_date: string | null;
  is_featured: boolean;
  sort_order: number;
  is_active: boolean;
  category?: LaravelProjectCategory;
  media?: LaravelMedia[];
  services?: LaravelService[];
  media_count?: number;
  services_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface LaravelProjectPayload {
  category_id: number;
  title: string;
  slug: string;
  client_name?: string | null;
  short_description?: string | null;
  full_description?: string | null;
  project_url?: string | null;
  completion_date?: string | null;
  is_featured?: boolean;
  sort_order?: number;
  is_active?: boolean;
}

export interface LaravelProjectCategoryPayload {
  name: string;
  slug: string;
  description?: string | null;
  sort_order?: number;
  is_active?: boolean;
}

export const adminProjectCategoriesApi = {
  async getAll(params?: {
    search?: string;
    is_active?: boolean;
    sort?: string;
    direction?: string;
    per_page?: number;
    page?: number;
  }): Promise<LaravelPaginatedResponse<LaravelProjectCategory>> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.is_active !== undefined) query.append('is_active', String(params.is_active));
    if (params?.sort) query.append('sort', params.sort);
    if (params?.direction) query.append('direction', params.direction);
    if (params?.per_page) query.append('per_page', String(params.per_page));
    if (params?.page) query.append('page', String(params.page));

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return adminApi.get<LaravelPaginatedResponse<LaravelProjectCategory>>(`/api/admin/project-categories${queryString}`);
  },

  async getById(id: number | string): Promise<LaravelApiResponse<LaravelProjectCategory>> {
    return adminApi.get<LaravelApiResponse<LaravelProjectCategory>>(`/api/admin/project-categories/${id}`);
  },

  async create(payload: LaravelProjectCategoryPayload): Promise<LaravelApiResponse<LaravelProjectCategory>> {
    return adminApi.post<LaravelApiResponse<LaravelProjectCategory>>('/api/admin/project-categories', payload);
  },

  async update(id: number | string, payload: Partial<LaravelProjectCategoryPayload>): Promise<LaravelApiResponse<LaravelProjectCategory>> {
    return adminApi.put<LaravelApiResponse<LaravelProjectCategory>>(`/api/admin/project-categories/${id}`, payload);
  },

  async delete(id: number | string): Promise<{ success: boolean; message: string }> {
    return adminApi.delete<{ success: boolean; message: string }>(`/api/admin/project-categories/${id}`);
  }
};

export const adminProjectsApi = {
  async getAll(params?: {
    search?: string;
    category_id?: number | string;
    is_active?: boolean;
    is_featured?: boolean;
    sort?: string;
    direction?: string;
    per_page?: number;
    page?: number;
  }): Promise<LaravelPaginatedResponse<LaravelProject>> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.category_id) query.append('category_id', String(params.category_id));
    if (params?.is_active !== undefined) query.append('is_active', String(params.is_active));
    if (params?.is_featured !== undefined) query.append('is_featured', String(params.is_featured));
    if (params?.sort) query.append('sort', params.sort);
    if (params?.direction) query.append('direction', params.direction);
    if (params?.per_page) query.append('per_page', String(params.per_page));
    if (params?.page) query.append('page', String(params.page));

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return adminApi.get<LaravelPaginatedResponse<LaravelProject>>(`/api/admin/projects${queryString}`);
  },

  async getById(id: string | number): Promise<LaravelApiResponse<LaravelProject>> {
    return adminApi.get<LaravelApiResponse<LaravelProject>>(`/api/admin/projects/${id}`);
  },

  async create(payload: LaravelProjectPayload): Promise<LaravelApiResponse<LaravelProject>> {
    return adminApi.post<LaravelApiResponse<LaravelProject>>('/api/admin/projects', payload);
  },

  async update(id: string | number, payload: Partial<LaravelProjectPayload>): Promise<LaravelApiResponse<LaravelProject>> {
    return adminApi.put<LaravelApiResponse<LaravelProject>>(`/api/admin/projects/${id}`, payload);
  },

  async delete(id: string | number): Promise<{ success: boolean; message: string }> {
    return adminApi.delete<{ success: boolean; message: string }>(`/api/admin/projects/${id}`);
  },

  async syncMedia(id: string | number, mediaIds: number[]): Promise<LaravelApiResponse<LaravelProject>> {
    return adminApi.put<LaravelApiResponse<LaravelProject>>(`/api/admin/projects/${id}/media`, { media: mediaIds });
  },

  async syncServices(id: string | number, serviceIds: number[]): Promise<LaravelApiResponse<LaravelProject>> {
    return adminApi.put<LaravelApiResponse<LaravelProject>>(`/api/admin/projects/${id}/services`, { services: serviceIds });
  }
};

export const adminMediaApi = {
  async getAll(params?: {
    search?: string;
    media_type?: string;
    sort?: string;
    direction?: string;
    per_page?: number;
    page?: number;
  }): Promise<LaravelPaginatedResponse<LaravelMedia>> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.media_type && params.media_type !== 'all') query.append('media_type', params.media_type);
    if (params?.sort) query.append('sort', params.sort);
    if (params?.direction) query.append('direction', params.direction);
    if (params?.per_page) query.append('per_page', String(params.per_page));
    if (params?.page) query.append('page', String(params.page));

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return adminApi.get<LaravelPaginatedResponse<LaravelMedia>>(`/api/admin/media${queryString}`);
  },

  async getById(id: string | number): Promise<LaravelApiResponse<LaravelMedia>> {
    return adminApi.get<LaravelApiResponse<LaravelMedia>>(`/api/admin/media/${id}`);
  },

  async upload(file: File, altText?: string): Promise<LaravelApiResponse<LaravelMedia>> {
    const token = getStoredToken();
    const formData = new FormData();
    formData.append('file', file);
    if (altText) {
      formData.append('alt_text', altText);
    }

    const response = await fetch(`${API_BASE_URL}/api/admin/media`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Accept': 'application/json',
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errObj: ApiError = {
        message: errorData.message || 'فشل رفع الملف إلى السيرفر',
        status: response.status,
        errors: errorData.errors
      };
      throw errObj;
    }

    return await response.json();
  },

  async update(id: string | number, altText: string): Promise<LaravelApiResponse<LaravelMedia>> {
    return adminApi.put<LaravelApiResponse<LaravelMedia>>(`/api/admin/media/${id}`, {
      alt_text: altText
    });
  },

  async delete(id: string | number): Promise<{ success: boolean; message: string }> {
    return adminApi.delete<{ success: boolean; message: string }>(`/api/admin/media/${id}`);
  }
};

export interface LaravelTestimonial {
  id: number;
  media_id: number | null;
  display_name: string;
  message: string;
  sort_order: number;
  is_active: boolean;
  media?: LaravelMedia | null;
  created_at: string;
  updated_at: string;
}

export interface LaravelTestimonialPayload {
  media_id?: number | null;
  display_name: string;
  message: string;
  sort_order?: number;
  is_active?: boolean;
}

export const adminTestimonialsApi = {
  async getAll(): Promise<LaravelApiResponse<LaravelTestimonial[]>> {
    return adminApi.get<LaravelApiResponse<LaravelTestimonial[]>>('/api/admin/testimonials');
  },

  async getById(id: number | string): Promise<LaravelApiResponse<LaravelTestimonial>> {
    return adminApi.get<LaravelApiResponse<LaravelTestimonial>>(`/api/admin/testimonials/${id}`);
  },

  async create(payload: LaravelTestimonialPayload): Promise<LaravelApiResponse<LaravelTestimonial>> {
    return adminApi.post<LaravelApiResponse<LaravelTestimonial>>('/api/admin/testimonials', payload);
  },

  async update(id: number | string, payload: Partial<LaravelTestimonialPayload>): Promise<LaravelApiResponse<LaravelTestimonial>> {
    return adminApi.put<LaravelApiResponse<LaravelTestimonial>>(`/api/admin/testimonials/${id}`, payload);
  },

  async delete(id: number | string): Promise<{ success: boolean; message: string }> {
    return adminApi.delete<{ success: boolean; message: string }>(`/api/admin/testimonials/${id}`);
  }
};

export interface LaravelClientLogo {
  id: number;
  media_id: number;
  company_name: string;
  website_url: string | null;
  sort_order: number;
  is_active: boolean;
  media?: LaravelMedia | null;
  created_at: string;
  updated_at: string;
}

export interface LaravelClientLogoPayload {
  media_id: number;
  company_name: string;
  website_url?: string | null;
  sort_order?: number;
  is_active?: boolean;
}

export const adminClientLogosApi = {
  async getAll(): Promise<LaravelApiResponse<LaravelClientLogo[]>> {
    return adminApi.get<LaravelApiResponse<LaravelClientLogo[]>>('/api/admin/client-logos');
  },

  async getById(id: number | string): Promise<LaravelApiResponse<LaravelClientLogo>> {
    return adminApi.get<LaravelApiResponse<LaravelClientLogo>>(`/api/admin/client-logos/${id}`);
  },

  async create(payload: LaravelClientLogoPayload): Promise<LaravelApiResponse<LaravelClientLogo>> {
    return adminApi.post<LaravelApiResponse<LaravelClientLogo>>('/api/admin/client-logos', payload);
  },

  async update(id: number | string, payload: Partial<LaravelClientLogoPayload>): Promise<LaravelApiResponse<LaravelClientLogo>> {
    return adminApi.put<LaravelApiResponse<LaravelClientLogo>>(`/api/admin/client-logos/${id}`, payload);
  },

  async delete(id: number | string): Promise<{ success: boolean; message: string }> {
    return adminApi.delete<{ success: boolean; message: string }>(`/api/admin/client-logos/${id}`);
  }
};

// ─── Laravel Admin Posts API Contract ────────────────────────────────
export interface LaravelPost {
  id: number;
  admin_id: number;
  media_id: number | null;
  title: string;
  slug: string;
  short_description: string | null;
  content: string;
  published_at: string | null;
  is_featured: boolean;
  is_active: boolean;
  admin?: {
    id: number;
    name: string;
    email: string;
    role?: string;
  } | null;
  media?: LaravelMedia | null;
  created_at: string;
  updated_at: string;
}

export interface LaravelPostPayload {
  title?: string;
  slug?: string;
  short_description?: string | null;
  content?: string;
  media_id?: number | null;
  published_at?: string | null;
  is_featured?: boolean;
  is_active?: boolean;
}

export const adminPostsApi = {
  async getAll(params?: {
    search?: string;
    is_active?: boolean;
    is_featured?: boolean;
    status?: 'published' | 'draft';
    sort?: string;
    direction?: string;
    per_page?: number;
    page?: number;
  }): Promise<LaravelPaginatedResponse<LaravelPost>> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.is_active !== undefined) query.append('is_active', String(params.is_active));
    if (params?.is_featured !== undefined) query.append('is_featured', String(params.is_featured));
    if (params?.status) query.append('status', params.status);
    if (params?.sort) query.append('sort', params.sort);
    if (params?.direction) query.append('direction', params.direction);
    if (params?.per_page) query.append('per_page', String(params.per_page));
    if (params?.page) query.append('page', String(params.page));

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return adminApi.get<LaravelPaginatedResponse<LaravelPost>>(`/api/admin/posts${queryString}`);
  },

  async getById(id: number | string): Promise<LaravelApiResponse<LaravelPost>> {
    return adminApi.get<LaravelApiResponse<LaravelPost>>(`/api/admin/posts/${id}`);
  },

  async create(payload: LaravelPostPayload): Promise<LaravelApiResponse<LaravelPost>> {
    return adminApi.post<LaravelApiResponse<LaravelPost>>('/api/admin/posts', payload);
  },

  async update(id: number | string, payload: Partial<LaravelPostPayload>): Promise<LaravelApiResponse<LaravelPost>> {
    return adminApi.put<LaravelApiResponse<LaravelPost>>(`/api/admin/posts/${id}`, payload);
  },

  async delete(id: number | string): Promise<{ success: boolean; message: string }> {
    return adminApi.delete<{ success: boolean; message: string }>(`/api/admin/posts/${id}`);
  }
};

// ─── Admin Consultations API Types & Endpoints ─────────────────────────
export interface LaravelConsultation {
  id: number;
  name: string;
  email: string;
  phone: string;
  company_name: string | null;
  service_id: number | null;
  message: string;
  status: 'new' | 'contacted' | 'in_progress' | 'completed' | 'cancelled';
  service?: LaravelService | null;
  created_at: string;
  updated_at: string;
}

export interface LaravelConsultationPayload {
  status: 'new' | 'contacted' | 'in_progress' | 'completed' | 'cancelled';
}

export const adminConsultationsApi = {
  async getAll(params?: {
    page?: number;
    per_page?: number;
    search?: string;
    status?: string;
    service_id?: number | string;
    sort?: string;
    direction?: 'asc' | 'desc';
  }): Promise<LaravelPaginatedResponse<LaravelConsultation>> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.status) query.append('status', params.status);
    if (params?.service_id) query.append('service_id', String(params.service_id));
    if (params?.sort) query.append('sort', params.sort);
    if (params?.direction) query.append('direction', params.direction);
    if (params?.per_page) query.append('per_page', String(params.per_page));
    if (params?.page) query.append('page', String(params.page));

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return adminApi.get<LaravelPaginatedResponse<LaravelConsultation>>(`/api/admin/consultations${queryString}`);
  },

  async getById(id: number | string): Promise<{ success: boolean; data: LaravelConsultation }> {
    return adminApi.get<{ success: boolean; data: LaravelConsultation }>(`/api/admin/consultations/${id}`);
  },

  async update(id: number | string, payload: LaravelConsultationPayload): Promise<{ success: boolean; message: string; data: LaravelConsultation }> {
    return adminApi.put<{ success: boolean; message: string; data: LaravelConsultation }>(`/api/admin/consultations/${id}`, payload);
  },

  async delete(id: number | string): Promise<{ success: boolean; message: string }> {
    return adminApi.delete<{ success: boolean; message: string }>(`/api/admin/consultations/${id}`);
  },

  async exportExcel(params?: Record<string, any>): Promise<Blob> {
    const query = new URLSearchParams(params).toString();
    const queryString = query ? `?${query}` : '';
    return adminApi.getBlob(`/api/admin/consultations/export/excel${queryString}`);
  },

  async exportPdf(params?: Record<string, any>): Promise<Blob> {
    const query = new URLSearchParams(params).toString();
    const queryString = query ? `?${query}` : '';
    return adminApi.getBlob(`/api/admin/consultations/export/pdf${queryString}`);
  }
};

// ─── Admin Site Settings API Types & Endpoints ────────────────────────
export interface LaravelSiteSetting {
  id: number;
  key: string;
  value: string | null;
  type: 'text' | 'textarea' | 'email' | 'phone' | 'url' | 'image';
  group_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface LaravelSiteSettingPayload {
  key?: string;
  value?: string | null;
  type?: 'text' | 'textarea' | 'email' | 'phone' | 'url' | 'image';
  group_name?: string | null;
}

export const adminSiteSettingsApi = {
  async getAll(): Promise<{ data: LaravelSiteSetting[] }> {
    return adminApi.get<{ data: LaravelSiteSetting[] }>('/api/admin/site-settings');
  },

  async getById(id: number | string): Promise<{ success: boolean; data: LaravelSiteSetting }> {
    return adminApi.get<{ success: boolean; data: LaravelSiteSetting }>(`/api/admin/site-settings/${id}`);
  },

  async create(payload: LaravelSiteSettingPayload): Promise<{ success: boolean; message: string; data: LaravelSiteSetting }> {
    return adminApi.post<{ success: boolean; message: string; data: LaravelSiteSetting }>('/api/admin/site-settings', payload);
  },

  async update(id: number | string, payload: LaravelSiteSettingPayload): Promise<{ success: boolean; message: string; data: LaravelSiteSetting }> {
    return adminApi.put<{ success: boolean; message: string; data: LaravelSiteSetting }>(`/api/admin/site-settings/${id}`, payload);
  },

  async delete(id: number | string): Promise<{ success: boolean; message: string }> {
    return adminApi.delete<{ success: boolean; message: string }>(`/api/admin/site-settings/${id}`);
  }
};

// ─── Admin Admins Management API Types & Endpoints ────────────────────
export interface LaravelAdminRecord {
  id: number;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'content_manager' | 'marketing';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LaravelAdminPayload {
  name: string;
  email: string;
  password?: string;
  role: 'super_admin' | 'admin' | 'content_manager' | 'marketing';
  is_active?: boolean;
}

export const adminAdminsApi = {
  async getAll(): Promise<{ success: boolean; data: LaravelAdminRecord[] }> {
    return adminApi.get<{ success: boolean; data: LaravelAdminRecord[] }>('/api/admin/admins');
  },

  async getById(id: number | string): Promise<{ success: boolean; data: LaravelAdminRecord }> {
    return adminApi.get<{ success: boolean; data: LaravelAdminRecord }>(`/api/admin/admins/${id}`);
  },

  async create(payload: LaravelAdminPayload): Promise<{ success: boolean; message: string; data: LaravelAdminRecord }> {
    return adminApi.post<{ success: boolean; message: string; data: LaravelAdminRecord }>('/api/admin/admins', payload);
  },

  async update(id: number | string, payload: Partial<LaravelAdminPayload>): Promise<{ success: boolean; message: string; data: LaravelAdminRecord }> {
    return adminApi.put<{ success: boolean; message: string; data: LaravelAdminRecord }>(`/api/admin/admins/${id}`, payload);
  },

  async delete(id: number | string): Promise<{ success: boolean; message: string }> {
    return adminApi.delete<{ success: boolean; message: string }>(`/api/admin/admins/${id}`);
  }
};





export interface ProjectItemMapped {
  id: string | number;
  categoryId: number;
  title: string;
  slug: string;
  clientName: string;
  shortDescription: string;
  fullDescription: string;
  projectUrl: string;
  completionDate: string;
  isFeatured: boolean;
  sortOrder: number;
  isActive: boolean;
  category?: LaravelProjectCategory;
  media?: LaravelMedia[];
  services?: LaravelService[];
  createdAt?: string;
  updatedAt?: string;
}

export function mapLaravelProjectToItem(project: LaravelProject): ProjectItemMapped {
  return {
    id: project.id,
    categoryId: project.category_id,
    title: project.title || '',
    slug: project.slug || '',
    clientName: project.client_name || '',
    shortDescription: project.short_description || '',
    fullDescription: project.full_description || '',
    projectUrl: project.project_url || '',
    completionDate: project.completion_date || '',
    isFeatured: Boolean(project.is_featured),
    sortOrder: Number(project.sort_order ?? 0),
    isActive: Boolean(project.is_active),
    category: project.category,
    media: project.media || [],
    services: project.services || [],
    createdAt: project.created_at,
    updatedAt: project.updated_at,
  };
}

export function mapLaravelProjectToProjectItem(project: any): ProjectItem {
  const rawMedia = Array.isArray(project.media) ? project.media : [];
  const mediaList = rawMedia.map((m: any) => {
    if (typeof m === 'string') return m;
    let url = m.url || m.file_path || '';
    if (url && !url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('data:')) {
      const cleanPath = url.startsWith('/') ? url : `/${url}`;
      url = API_BASE_URL ? `${API_BASE_URL}${cleanPath}` : cleanPath;
    }
    return {
      ...m,
      url
    };
  });

  const images = mediaList
    .map((m: any) => (typeof m === 'string' ? m : (m?.url || m?.file_path || '')))
    .filter(Boolean);

  const primaryImage = images.length > 0 ? images[0] : '';

  return {
    id: String(project.id),
    titleEn: project.title || '',
    titleAr: project.title || '',
    nameEn: project.title || '',
    nameAr: project.title || '',
    categoryEn: project.category?.name || 'Technical Services',
    categoryAr: project.category?.name || 'خدماتنا التقنية',
    descriptionEn: project.short_description || project.full_description || '',
    descriptionAr: project.short_description || project.full_description || '',
    fullDescriptionEn: project.full_description || '',
    fullDescriptionAr: project.full_description || '',
    image: primaryImage,
    img: primaryImage,
    images: images,
    media: mediaList,
    clientEn: project.client_name || '',
    clientAr: project.client_name || '',
    status: project.is_active ? 'published' : 'hidden',
    featured: Boolean(project.is_featured),
    displayOrder: project.sort_order || 0,
    statsEn: 'High Performance',
    statsAr: 'أداء ممتاز',
    tags: Array.isArray(project.services) ? project.services.map((s: any) => s.title || s) : [],
    services: Array.isArray(project.services) ? project.services.map((s: any) => s.title || s) : [],
    createdAt: project.created_at,
    updatedAt: project.updated_at
  };
}

export function mapProjectItemToLaravelPayload(item: Partial<ProjectItemMapped>): LaravelProjectPayload {
  return {
    category_id: Number(item.categoryId),
    title: item.title || '',
    slug: item.slug || '',
    client_name: item.clientName || null,
    short_description: item.shortDescription || null,
    full_description: item.fullDescription || null,
    project_url: item.projectUrl || null,
    completion_date: item.completionDate || null,
    is_featured: Boolean(item.isFeatured),
    sort_order: Number(item.sortOrder ?? 0),
    is_active: item.isActive !== undefined ? Boolean(item.isActive) : true,
  };
}



// ─── Public API Service (Laravel Single Source of Truth) ────────
export const apiService = {
  // 1. Services
  async getServices(): Promise<ServiceItem[]> {
    if (API_BASE_URL) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/services`);
        if (res.ok) {
          const json = await res.json();
          const rawItems = json.data || json;
          if (Array.isArray(rawItems)) {
            return rawItems.map(mapLaravelServiceToItem);
          }
        }
      } catch (err) {
        console.warn('Failed to load public services from API:', err);
      }
    }
    return [];
  },

  // 2. Projects & Portfolio
  async getProjects(): Promise<ProjectItem[]> {
    if (API_BASE_URL) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/projects`);
        if (res.ok) {
          const json = await res.json();
          const rawItems = json.data || json;
          if (Array.isArray(rawItems)) {
            return rawItems.map(mapLaravelProjectToProjectItem);
          }
        }
      } catch (err) {
        console.warn('Failed to load public projects from API:', err);
      }
    }
    return [];
  },

  // 3. Testimonials & Reviews
  async getTestimonials(): Promise<TestimonialModel[]> {
    if (API_BASE_URL) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/testimonials`);
        if (res.ok) {
          const json = await res.json();
          return json.data || json;
        }
      } catch (err) {
        console.warn('Fallback to local testimonials data:', err);
      }
    }
    return testimonialsData;
  },

  // 4. Client / Partner Logos
  async getClientLogos(): Promise<ClientLogo[]> {
    if (API_BASE_URL) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/client-logos`);
        if (res.ok) {
          const json = await res.json();
          const rawItems = json.data || json;
          if (Array.isArray(rawItems)) {
            return rawItems.map((logo: any) => ({
              id: String(logo.id),
              media_id: String(logo.media_id || (logo.media ? logo.media.id : '')),
              company_name: logo.company_name || '',
              website_url: logo.website_url || null,
              sort_order: logo.sort_order ?? 0,
              is_active: logo.is_active !== undefined ? Boolean(logo.is_active) : true,
              created_at: logo.created_at || new Date().toISOString(),
              updated_at: logo.updated_at || new Date().toISOString(),
              media: logo.media ? {
                id: String(logo.media.id),
                file_path: logo.media.url || logo.media.file_path || '',
                url: logo.media.url || logo.media.file_path || ''
              } : null
            }));
          }
        }
      } catch (err) {
        console.warn('Failed to load public client logos from API:', err);
      }
    }
    return clientLogosData;
  },

  // 5. Advantages & Process Steps
  async getAdvantages(): Promise<Advantage[]> {
    return advantagesData;
  },

  async getProcessSteps(): Promise<ProcessStep[]> {
    return processData;
  },

  // 6. Global Site Settings
  async getSettings(): Promise<SettingsState> {
    if (API_BASE_URL) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/settings`);
        if (res.ok) {
          const json = await res.json();
          return json.data || json;
        }
      } catch (err) {
        console.warn('Fallback to local settings data:', err);
      }
    }
    return settingsData;
  },

  // 7. Submit Consultation Booking Request
  async submitConsultation(payload: any): Promise<{ success: boolean; id?: string }> {
    if (API_BASE_URL) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/consultations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const json = await res.json();
          return { success: true, id: json.id || json.data?.id };
        }
      } catch (err) {
        console.warn('Failed to post consultation to backend API:', err);
      }
    }
    // Success fallback locally
    return { success: true, id: `CON-${Date.now()}` };
  }
};
