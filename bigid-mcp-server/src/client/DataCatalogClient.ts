import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { BigIDAuth } from '../auth/BigIDAuth';
import { ErrorHandler } from '../utils/ErrorHandler';
import {
  CatalogRequestDTO,
  CatalogResponseDTO,
  ObjectDetailsDTO,
  TagDTO,
  RuleDTO,
  CatalogCountRequestDTO,
  CatalogCountResponseDTO,
} from '../types/catalogTypes';

export class DataCatalogClient {
  private client: AxiosInstance;
  private auth: BigIDAuth;
  private baseUrl: string;

  constructor(auth: BigIDAuth, domain: string) {
    this.auth = auth;
    this.baseUrl = `https://${domain}/api/v1/data-catalog`;
    
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
      (response) => response,
      (error) => {
        return Promise.reject(ErrorHandler.handleApiError(error, 'DataCatalogClient'));
      }
    );
  }

  /**
   * Get data catalog objects with filtering and pagination
   */
  async getObjects(params: CatalogRequestDTO): Promise<CatalogResponseDTO> {
    try {
      const response: AxiosResponse<CatalogResponseDTO> = await this.client.get('/objects', {
        params
      });
      return response.data;
    } catch (error) {
      throw ErrorHandler.handleApiError(error as Error, 'Failed to get catalog objects');
    }
  }

  /**
   * Get data catalog objects using POST request with body parameters
   */
  async getObjectsPost(params: {
    filter?: string;
    skip?: number;
    limit?: number;
    offset?: number;
    sort?: string;
    offsetKey?: string;
    ignoreLimit?: boolean;
    sample?: number;
    requireTotalCount?: boolean;
    respectHiddenTags?: string;
    getColumnOrFieldOccurrencesCounterFlag?: boolean;
    getNumIdentitiesFlag?: boolean;
  }): Promise<CatalogResponseDTO> {
    try {
      const response: AxiosResponse<CatalogResponseDTO> = await this.client.post('', params);
      return response.data;
    } catch (error) {
      throw ErrorHandler.handleApiError(error as Error, 'Failed to get catalog objects via POST');
    }
  }

  /**
   * Get detailed information about a specific object
   */
  async getObjectDetails(fullyQualifiedName: string): Promise<ObjectDetailsDTO> {
    try {
      const response: AxiosResponse<ObjectDetailsDTO> = await this.client.get(`/object-details`, {
        params: { object_name: fullyQualifiedName }
      });
      return response.data;
    } catch (error) {
      throw ErrorHandler.handleApiError(error as Error, `Failed to get object details for ${fullyQualifiedName}`);
    }
  }

  // Removed unused getObjectColumns

  /**
   * Get all tags
   */
  async getTags(): Promise<TagDTO[]> {
    try {
      const response: AxiosResponse<TagDTO[]> = await this.client.get('/tags');
      return response.data;
    } catch (error) {
      throw ErrorHandler.handleApiError(error as Error, 'Failed to get tags');
    }
  }

  // Removed unused tag mutations

  

  /**
   * Get all rules
   */
  async getRules(): Promise<RuleDTO[]> {
    try {
      const response: AxiosResponse<RuleDTO[]> = await this.client.get('/rules');
      return response.data;
    } catch (error) {
      throw ErrorHandler.handleApiError(error as Error, 'Failed to get rules');
    }
  }

  // Removed unused rule mutations

  

  // Removed unused rule operations

  // Removed unused getRelations

  // Removed unused getAllRelations

  // Removed unused exportCatalog

  /**
   * Get catalog count
   */
  async getCount(params: CatalogCountRequestDTO): Promise<CatalogCountResponseDTO> {
    try {
      const response: AxiosResponse<CatalogCountResponseDTO> = await this.client.get('/count', {
        params
      });
      return response.data;
    } catch (error) {
      throw ErrorHandler.handleApiError(error as Error, 'Failed to get catalog count');
    }
  }

  // Removed unused getDistinctValues

  // Removed unused getObjectSummary

  // Removed unused getHealth

  // Removed unused getVersionHistory

  // Removed unused getManualFields

  // Removed unused getManualFieldsBySource

  // Removed unused row-level findings methods

  // Removed unused getDataSourceRiskSummary

  // Removed unused getIntegrationSettings






} 