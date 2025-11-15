const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010';

export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  emailVerified?: Date | null;
  image?: string | null;
  roles: string[];
  isActive: boolean;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  name?: string;
  email: string;
  password?: string;
  roles?: string[];
  isActive?: boolean;
  image?: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
  roles?: string[];
  isActive?: boolean;
  image?: string;
}

export interface UpdateProfileDto {
  name?: string;
}

export interface AuthUserDto {
  email: string;
  password: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  domain?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  sortOrder: number;
}

export interface UserTenant {
  id: string;
  name: string;
  slug: string;
  role: string;
  isCurrentTenant: boolean;
}

export const apiClient = {
  // User authentication
  async validateUser(credentials: AuthUserDto) {
    const response = await fetch(`${API_URL}/users/auth/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  },

  async upsertUser(data: { email: string; name?: string; image?: string }) {
    const response = await fetch(`${API_URL}/users/auth/upsert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to upsert user');
    }

    return response.json();
  },

  async findUserByEmail(email: string) {
    const response = await fetch(`${API_URL}/users/email/${encodeURIComponent(email)}`);

    if (!response.ok) {
      return null;
    }

    return response.json();
  },

  // Current user profile management
  async getMyProfile(): Promise<User> {
    const { fetchWithAuth } = await import('./auth-utils');
    return fetchWithAuth<User>('/users/me');
  },

  async updateMyProfile(data: UpdateProfileDto): Promise<User> {
    const { fetchWithAuth } = await import('./auth-utils');
    return fetchWithAuth<User>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // User management (requires auth - using internal fetchWithAuth from auth-utils)
  async getUsers(): Promise<User[]> {
    // Import dynamically to avoid circular dependency
    const { fetchWithAuth } = await import('./auth-utils');
    return fetchWithAuth<User[]>('/users');
  },

  async getUser(id: string): Promise<User> {
    const { fetchWithAuth } = await import('./auth-utils');
    return fetchWithAuth<User>(`/users/${id}`);
  },

  async createUser(data: CreateUserDto): Promise<User> {
    const { fetchWithAuth } = await import('./auth-utils');
    return fetchWithAuth<User>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateUser(id: string, data: UpdateUserDto): Promise<User> {
    const { fetchWithAuth } = await import('./auth-utils');
    return fetchWithAuth<User>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async deleteUser(id: string): Promise<{ success: boolean }> {
    const { fetchWithAuth } = await import('./auth-utils');
    return fetchWithAuth<{ success: boolean }>(`/users/${id}`, {
      method: 'DELETE',
    });
  },

  // Tenant operations
  async getTenant(tenantId: string): Promise<Tenant> {
    const { fetchWithAuth } = await import('./auth-utils');
    return fetchWithAuth<Tenant>(`/tenants/${tenantId}`);
  },

  async getUserTenants(): Promise<UserTenant[]> {
    const { fetchWithAuth } = await import('./auth-utils');
    return fetchWithAuth<UserTenant[]>('/users/me/tenants');
  },

  async switchTenant(tenantId: string): Promise<User & { tenantRole: string }> {
    const { fetchWithAuth } = await import('./auth-utils');
    return fetchWithAuth<User & { tenantRole: string }>('/users/me/switch-tenant', {
      method: 'POST',
      body: JSON.stringify({ tenantId }),
    });
  },

  // Role operations
  async getRoles(): Promise<Role[]> {
    const response = await fetch(`${API_URL}/roles`);
    if (!response.ok) {
      throw new Error('Failed to fetch roles');
    }
    return response.json();
  },
};
