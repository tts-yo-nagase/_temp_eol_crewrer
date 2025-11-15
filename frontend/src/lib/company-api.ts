import { fetchWithAuth, fetchWithoutAuth } from "./auth-utils";
import { getApiUrl } from "./config-client";

// API URL will be fetched dynamically from server
let API_BASE_URL: string | null = null;

export interface Company {
  id: string;
  name: string;
  code: string;
  address?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCompanyDto {
  name: string;
  code: string;
  address?: string;
  phone?: string;
}

export interface UpdateCompanyDto {
  name?: string;
  code?: string;
  address?: string;
  phone?: string;
}

class CompanyApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Get API URL dynamically
    if (!API_BASE_URL) {
      API_BASE_URL = await getApiUrl();
    }

    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API Error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  async getAllCompanies(search?: string): Promise<Company[]> {
    try {
      // Build URL with search query parameter if provided
      let url = "/companies";
      if (search && search.trim()) {
        url += `?search=${encodeURIComponent(search)}`;
      }

      // Use fetchWithAuth now that backend JWT validation supports NextAuth tokens
      const companies = await fetchWithAuth<Company[]>(url, {
        method: "GET",
      });

      return companies;
    } catch (error) {
      console.error("❌ getAllCompanies error:", error);
      throw error;
    }
  }

  async getCompanyById(id: string): Promise<Company> {
    return await fetchWithAuth<Company>(`/companies/${id}`, {
      method: "GET",
    });
  }

  async createCompany(company: CreateCompanyDto): Promise<Company> {
    return await fetchWithAuth<Company>("/companies", {
      method: "POST",
      body: JSON.stringify(company),
    });
  }

  async updateCompany(id: string, company: UpdateCompanyDto): Promise<Company> {
    return await fetchWithAuth<Company>(`/companies/${id}`, {
      method: "PUT",
      body: JSON.stringify(company),
    });
  }

  async deleteCompany(id: string): Promise<void> {
    await fetchWithAuth<void>(`/companies/${id}`, {
      method: "DELETE",
    });
  }
}

export const companyApi = new CompanyApiClient();
