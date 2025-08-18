import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { BigIDAuth } from '../auth/BigIDAuth';
import { ErrorHandler } from '../utils/ErrorHandler';

export interface PiiRecord {
  [key: string]: unknown;
}

export interface PiiRecordsResponse {
  pii_records: PiiRecord[];
}

export class PIIClient {
  private client: AxiosInstance;
  private auth: BigIDAuth;
  private baseUrl: string;

  constructor(auth: BigIDAuth, domain: string) {
    this.auth = auth;
    this.baseUrl = `https://${domain}/api/v1`;

    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use(async (config) => {
      const authHeader = await this.auth.getAuthHeader();
      if (authHeader) {
        config.headers.Authorization = authHeader;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        return Promise.reject(ErrorHandler.handleApiError(error, 'PIIClient'));
      }
    );
  }

  async getPiiRecords(): Promise<PiiRecordsResponse> {
    try {
      const response: AxiosResponse<PiiRecordsResponse> = await this.client.get('/piiRecords');
      return response.data;
    } catch (error) {
      throw ErrorHandler.handleApiError(error as Error, 'Failed to get PII records');
    }
  }
}


