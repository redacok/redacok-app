import { UserRole } from "@prisma/client";

export const roleRedirectMap = {
  [UserRole.ADMIN]: "/admin/dashboard",
  [UserRole.COMMERCIAL]: "/commercial/dashboard",
  [UserRole.BUSINESS]: "/business/dashboard",
  [UserRole.PERSONAL]: "/dashboard",
  [UserRole.USER]: "/dashboard",
} as const;

export const getRoleBasedRedirectPath = (role: UserRole): string => {
  return roleRedirectMap[role] || "/dashboard";
};
