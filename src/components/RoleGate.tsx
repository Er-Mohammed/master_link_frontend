import React from 'react';
import { useAuth } from '../context/AuthContext';
import { AdminRole, AppSection, ResourceAction } from '../lib/permissions';

interface RoleGateProps {
  allowedRoles: AdminRole | AdminRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGate({ allowedRoles, children, fallback = null }: RoleGateProps) {
  const { isAuthorizedRole } = useAuth();
  if (isAuthorizedRole(allowedRoles)) {
    return <>{children}</>;
  }
  return <>{fallback}</>;
}

interface PermissionGateProps {
  section: AppSection;
  action: ResourceAction;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGate({ section, action, children, fallback = null }: PermissionGateProps) {
  const { canPerform } = useAuth();
  if (canPerform(section, action)) {
    return <>{children}</>;
  }
  return <>{fallback}</>;
}
