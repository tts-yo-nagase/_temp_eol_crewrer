export interface AuthenticatedUser {
  id: string;
  email?: string;
  name?: string;
  roles: string[];
  company?: string;
  customField?: string;
  tenantId?: string;
}

export interface AuthenticatedRequest {
  user: AuthenticatedUser;
}
