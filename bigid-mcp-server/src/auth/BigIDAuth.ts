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

export interface RefreshResponse {
  success: boolean;
  systemToken: string;
}

interface JWTPayload {
  user_name?: string;
  type?: string;
  roleIds?: string[];
  isAdmin?: boolean;
  iat?: number;
  exp?: number;
}

export class BigIDAuth {
  private client: AxiosInstance;
  private config: BigIDConfig;
  private currentToken: string | null = null;
  private tokenExpiry: Date | null = null;
  private systemToken: string | null = null;
  private systemTokenExpiry: Date | null = null;

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
   * Decode JWT token to get payload
   */
  private decodeJWT(token: string): JWTPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }
      
      const payload = parts[1];
      const decoded = Buffer.from(payload, 'base64').toString('utf8');
      return JSON.parse(decoded);
    } catch (error) {
      return null;
    }
  }

  /**
   * Determine token type from JWT payload
   */
  private getTokenType(token: string): 'access-token' | 'refresh-token' | 'unknown' {
    const payload = this.decodeJWT(token);
    if (!payload || !payload.type) {
      return 'unknown';
    }
    
    return payload.type as 'access-token' | 'refresh-token';
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
   * Authenticate using user token - handles both access tokens and refresh tokens
   */
  async authenticateWithUserToken(userToken: string): Promise<string> {
    const tokenType = this.getTokenType(userToken);
    console.error(`Token type detected: ${tokenType}`);

    if (tokenType === 'access-token') {
      // Access tokens can be used directly
      console.error('Using access token directly');
      this.currentToken = userToken;
      // Set expiry based on JWT exp claim
      const payload = this.decodeJWT(userToken);
      if (payload && payload.exp) {
        this.tokenExpiry = new Date(payload.exp * 1000);
      } else {
        // Default to 1 hour if no exp claim
        this.tokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
      }
      return userToken;
    } else if (tokenType === 'refresh-token') {
      // Refresh tokens need to be exchanged for system tokens
      console.error('Exchanging refresh token for system token');
      try {
        const response: AxiosResponse<any> = await this.client.get('/refresh-access-token', {
          headers: {
            'Authorization': userToken, // No Bearer prefix
          },
        });

        // Debug: Log the response (without sensitive data)
        console.error('Refresh API Response:', {
          status: response.status,
          success: response.data.success,
          hasSystemToken: !!response.data.systemToken,
          responseKeys: Object.keys(response.data)
        });

        if (response.data.success && response.data.systemToken && typeof response.data.systemToken === 'string') {
          this.systemToken = response.data.systemToken as string;
          // System tokens typically have a shorter lifespan, set to 1 hour
          this.systemTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
          return this.systemToken;
        }

        throw new Error('No systemToken received from BigID refresh API');
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message;
          throw new Error(`User token authentication failed: ${errorMessage}`);
        }
        throw error;
      }
    } else {
      // Unknown token type - try to use it directly as a fallback
      console.error('Unknown token type, trying to use directly');
      this.currentToken = userToken;
      this.tokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour default
      return userToken;
    }
  }

  /**
   * Get current authentication token, refreshing if necessary
   */
  async getToken(): Promise<string> {
    const auth = this.config.auth;
    
    if (auth.type === 'user_token') {
      // Check if we have a valid cached token (either system token or access token)
      if (this.systemToken && this.systemTokenExpiry && this.systemTokenExpiry > new Date()) {
        return this.systemToken;
      }
      
      if (this.currentToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
        return this.currentToken;
      }

      // If no valid cached token, authenticate with user token
      if (!auth.user_token) {
        throw new Error('User token is required for user token authentication');
      }
      
      return await this.authenticateWithUserToken(auth.user_token);
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
    this.systemToken = null;
    this.systemTokenExpiry = null;
  }

  /**
   * Get the authorization header for API requests
   */
  async getAuthHeader(): Promise<string> {
    const token = await this.getToken();
    
    // Both session tokens and system tokens are used directly without Bearer prefix
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