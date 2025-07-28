import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { BigIDAuth } from '../auth/BigIDAuth';
import { ErrorHandler } from '../utils/ErrorHandler';
import { 
  ACIDataManagerResponse, 
  ACIDataManagerParams,
  ACIGroupsResponse,
  ACIGroupsParams,
  ACIUsersResponse,
  ACIUsersParams,
  ACIPermission
} from '../types/aciTypes';

export class ACIClient {
  private client: AxiosInstance;
  private auth: BigIDAuth;
  private baseUrl: string;
  private domain: string;

  constructor(auth: BigIDAuth, domain: string) {
    this.auth = auth;
    this.domain = domain;
    this.baseUrl = `https://${domain}/api/v1/aci`;
    
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for authentication
    this.client.interceptors.request.use(async (config) => {
      const authHeader = await this.auth.getAuthHeader();
      if (authHeader) {
        config.headers.Authorization = authHeader;
      }
      return config;
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        // Log the error for debugging
        console.error('ACI Client Error:', error);
        return Promise.reject(ErrorHandler.handleApiError(error, 'ACIClient'));
      }
    );
  }

  /**
   * Get data manager items with optional filtering and pagination
   */
  async getDataManager(params: ACIDataManagerParams = {}): Promise<ACIDataManagerResponse> {
    const queryParams = new URLSearchParams();
    
    if (params.requireTotalCount !== undefined) {
      queryParams.append('requireTotalCount', params.requireTotalCount.toString());
    }
    if (params.limit !== undefined) {
      queryParams.append('limit', params.limit.toString());
    }
    if (params.sort !== undefined) {
      queryParams.append('sort', params.sort);
    }
    if (params.grouping !== undefined) {
      queryParams.append('grouping', params.grouping);
    }
    if (params.app_id !== undefined) {
      queryParams.append('app_id', params.app_id);
    }
    if (params.skip !== undefined) {
      queryParams.append('skip', params.skip.toString());
    }

    const response: AxiosResponse<ACIDataManagerResponse> = await this.client.get(`/data-manager?${queryParams.toString()}`);
    return response.data;
  }

  /**
   * Get permissions for a specific data manager item
   */
  async getDataManagerPermissions(itemPath: string, params: { skip?: number; limit?: number; requireTotalCount?: boolean } = {}): Promise<{ permissions: ACIPermission[] }> {
    const queryParams = new URLSearchParams();
    
    if (params.skip !== undefined) {
      queryParams.append('skip', params.skip.toString());
    }
    if (params.limit !== undefined) {
      queryParams.append('limit', params.limit.toString());
    }
    if (params.requireTotalCount !== undefined) {
      queryParams.append('requireTotalCount', params.requireTotalCount.toString());
    }

    const encodedPath = encodeURIComponent(itemPath);
    const response: AxiosResponse<{ permissions: ACIPermission[] }> = await this.client.get(`/data-manager/${encodedPath}/permissions?${queryParams.toString()}`);
    return response.data;
  }

  /**
   * Get groups with optional filtering and pagination
   */
  async getGroups(params: ACIGroupsParams = {}): Promise<ACIGroupsResponse> {
    const queryParams = new URLSearchParams();
    
    if (params.skip !== undefined) {
      queryParams.append('skip', params.skip.toString());
    }
    if (params.limit !== undefined) {
      queryParams.append('limit', params.limit.toString());
    }
    if (params.requireTotalCount !== undefined) {
      queryParams.append('requireTotalCount', params.requireTotalCount.toString());
    }
    if (params.sort !== undefined) {
      queryParams.append('sort', params.sort);
    }

    const response: AxiosResponse<ACIGroupsResponse> = await this.client.get(`/groups/?${queryParams.toString()}`);
    return response.data;
  }

  /**
   * Get users with optional filtering and pagination
   */
  async getUsers(params: ACIUsersParams = {}): Promise<ACIUsersResponse> {
    const queryParams = new URLSearchParams();
    
    if (params.skip !== undefined) {
      queryParams.append('skip', params.skip.toString());
    }
    if (params.limit !== undefined) {
      queryParams.append('limit', params.limit.toString());
    }
    if (params.requireTotalCount !== undefined) {
      queryParams.append('requireTotalCount', params.requireTotalCount.toString());
    }
    if (params.sort !== undefined) {
      queryParams.append('sort', params.sort);
    }

    const response: AxiosResponse<ACIUsersResponse> = await this.client.get(`/users?${queryParams.toString()}`);
    return response.data;
  }

  /**
   * Get the domain for cache key generation
   */
  getDomain(): string {
    return this.domain;
  }
} 