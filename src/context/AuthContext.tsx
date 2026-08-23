import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  AdminRole, 
  AdminUser, 
  AppSection, 
  ResourceAction, 
  canAccessSection, 
  canPerformAction, 
  hasRole, 
  getRoleDisplay,
  mapLaravelAdminToUser
} from '../lib/permissions';
import { authApi } from '../services/api';
import type { ApiError } from '../services/api';

interface AuthContextType {
  currentUser: AdminUser | null;
  currentRole: AdminRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateCurrentUser: (user: AdminUser) => void;
  canAccess: (section: AppSection) => boolean;
  canPerform: (section: AppSection, action: ResourceAction) => boolean;
  isAuthorizedRole: (allowedRoles: AdminRole | AdminRole[]) => boolean;
  roleInfo: { name: string; desc: string; badgeClass: string };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: check for existing token and verify with /api/admin/me
  useEffect(() => {
    let cancelled = false;

    async function verifyToken() {
      const token = authApi.getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await authApi.me();
        if (!cancelled && response.data) {
          setCurrentUser(mapLaravelAdminToUser(response.data));
        }
      } catch {
        // Token invalid or expired — clear it
        authApi.clearToken();
        if (!cancelled) {
          setCurrentUser(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    verifyToken();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await authApi.login(email, password);
      if (response.data?.admin) {
        setCurrentUser(mapLaravelAdminToUser(response.data.admin));
        return { success: true };
      }
      return { success: false, error: 'Unexpected response from server' };
    } catch (err: unknown) {
      const apiError = err as ApiError;
      let errorMessage = 'Authentication failed';

      if (apiError.status === 401) {
        errorMessage = apiError.message || 'Invalid email or password';
      } else if (apiError.status === 422) {
        // Validation errors
        if (apiError.errors) {
          const firstError = Object.values(apiError.errors)[0];
          errorMessage = firstError?.[0] || 'Please check your input';
        } else {
          errorMessage = apiError.message || 'Validation failed';
        }
      } else if (apiError.status === 403) {
        errorMessage = apiError.message || 'Account is inactive or access is forbidden';
      } else if (apiError.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (apiError.message) {
        errorMessage = apiError.message;
      }

      return { success: false, error: errorMessage };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Even if server logout fails, clear local state
      authApi.clearToken();
    }
    setCurrentUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const response = await authApi.me();
      if (response.data) {
        setCurrentUser(mapLaravelAdminToUser(response.data));
      }
    } catch {
      // ignore
    }
  }, []);

  const updateCurrentUser = useCallback((user: AdminUser) => {
    setCurrentUser(user);
  }, []);

  const isAuthenticated = currentUser !== null;
  const currentRole = currentUser?.role ?? null;

  const canAccess = useCallback((section: AppSection): boolean => {
    if (!currentRole) return false;
    return canAccessSection(currentRole, section);
  }, [currentRole]);

  const canPerform = useCallback((section: AppSection, action: ResourceAction): boolean => {
    if (!currentRole) return false;
    return canPerformAction(currentRole, section, action);
  }, [currentRole]);

  const isAuthorizedRole = useCallback((allowedRoles: AdminRole | AdminRole[]): boolean => {
    if (!currentRole) return false;
    return hasRole(currentRole, allowedRoles);
  }, [currentRole]);

  const roleInfo = currentRole
    ? getRoleDisplay(currentRole, 'ar')
    : { name: '', desc: '', badgeClass: 'bg-slate-50 text-slate-700 border-slate-200' };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole,
        isAuthenticated,
        isLoading,
        login,
        logout,
        refreshUser,
        updateCurrentUser,
        canAccess,
        canPerform,
        isAuthorizedRole,
        roleInfo
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
