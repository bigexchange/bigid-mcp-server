import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { BigIDConfig } from '../config/types';

export interface AuthResponse {
  success?: boolean;
  message?: string;
  auth_token?: string;
  username?: string;
  firstName?: string;
  permissions?: string[];
  license?: any;
  systemToken?: string;
  token?: string;
}

export class BigIDAuth {
  private client: AxiosInstance;
  private config: BigIDConfig;
  private currentToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor(config: BigIDConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: `https://${config.domain}/api/v1`,
      timeout: config.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Authenticate using session token (username/password)
   */
  async authenticateWithSession(username: string, password: string): Promise<string> {
    try {
      const response: AxiosResponse<AuthResponse> = await this.client.post('/sessions', {
        username,
        password,
      });

      if (response.data.auth_token) {
        this.currentToken = response.data.auth_token;
        this.tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        return this.currentToken;
      }

      throw new Error('No auth_token received from BigID API');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message;
        throw new Error(`Authentication failed: ${errorMessage}`);
      }
      throw error;
    }
  }

  /**
   * Authenticate using user token
   */
  async authenticateWithUserToken(userToken: string): Promise<string> {
    // For user token authentication, we use the token directly
    // No need to refresh or exchange it
    this.currentToken = userToken;
    // Set a long expiry since user tokens are typically long-lived
    this.tokenExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    return this.currentToken;
  }

  /**
   * Get current authentication token, refreshing if necessary
   */
  async getToken(): Promise<string> {
    const auth = this.config.auth;
    
    if (auth.type === 'user_token') {
      // For user tokens, we use them directly without caching/refreshing
      if (!auth.user_token) {
        throw new Error('User token is required for user token authentication');
      }
      return auth.user_token;
    } else if (auth.type === 'session') {
      // For session authentication, check if we have a valid cached token
      if (this.currentToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
        return this.currentToken;
      }

      if (!auth.username || !auth.password) {
        throw new Error('Username and password are required for session authentication');
      }
      return await this.authenticateWithSession(auth.username, auth.password);
    } else {
      throw new Error('Invalid authentication type');
    }
  }

  /**
   * Validate if the current token is still valid
   */
  async validateToken(token: string): Promise<boolean> {
    try {
      await this.client.get('/metadata-search/health-check', {
        headers: {
          'Authorization': token,
        },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Clear the current token (useful for testing or re-authentication)
   */
  clearToken(): void {
    this.currentToken = null;
    this.tokenExpiry = null;
  }

  /**
   * Get the authorization header for API requests
   */
  async getAuthHeader(): Promise<string> {
    const token = await this.getToken();
    
    // Both session tokens and user tokens are used directly without Bearer prefix
    return token;
  }

  /**
   * Check if authentication is configured properly
   */
  isConfigured(): boolean {
    const auth = this.config.auth;
    
    if (auth.type === 'session') {
      return !!(auth.username && auth.password);
    } else if (auth.type === 'user_token') {
      return !!auth.user_token;
    }
    
    return false;
  }
} 