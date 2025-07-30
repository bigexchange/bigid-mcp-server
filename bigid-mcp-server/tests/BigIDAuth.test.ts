import { BigIDAuth } from '../src/auth/BigIDAuth';
import { BigIDConfig } from '../src/config/types';

// Mock axios
jest.mock('axios');
const axios = require('axios');

describe('BigIDAuth', () => {
  let auth: BigIDAuth;
  let mockConfig: BigIDConfig;
  let mockAxiosInstance: any;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Create mock axios instance
    mockAxiosInstance = {
      post: jest.fn(),
      get: jest.fn()
    };
    
    (axios.create as jest.Mock).mockReturnValue(mockAxiosInstance);
    
    mockConfig = {
      domain: 'test.bigid.com',
      auth: {
        type: 'user_token' as const,
        user_token: 'test-user-token'
      },
      timeout: 30000,
      retry_attempts: 3
    };
    
    auth = new BigIDAuth(mockConfig);
  });

  describe('User Token Authentication', () => {
    test('should exchange user token for system token', async () => {
      const mockResponse = {
        data: {
          success: true,
          systemToken: 'mock-system-token'
        }
      };
      
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await auth.authenticateWithUserToken('test-user-token');
      
      expect(result).toBe('mock-system-token');
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/refresh-access-token', {}, {
        headers: {
          'Authorization': 'Bearer test-user-token',
        },
      });
    });

    test('should handle refresh API errors', async () => {
      const mockError = {
        isAxiosError: true,
        response: {
          data: {
            message: 'Invalid refresh token'
          }
        }
      };
      
      // Mock axios.isAxiosError to return true for our mock error
      (axios.isAxiosError as jest.Mock).mockReturnValue(true);
      mockAxiosInstance.post.mockRejectedValue(mockError);

      await expect(auth.authenticateWithUserToken('invalid-token'))
        .rejects.toThrow('User token authentication failed: Invalid refresh token');
    });

    test('should cache system token and reuse it', async () => {
      const mockResponse = {
        data: {
          success: true,
          systemToken: 'mock-system-token'
        }
      };
      
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      // First call should make API request
      const result1 = await auth.getToken();
      expect(result1).toBe('mock-system-token');

      // Second call should use cached token
      const result2 = await auth.getToken();
      expect(result2).toBe('mock-system-token');

      // Should only make one API call
      expect(mockAxiosInstance.post).toHaveBeenCalledTimes(1);
    });

    test('should refresh system token when expired', async () => {
      const mockResponse = {
        data: {
          success: true,
          systemToken: 'mock-system-token'
        }
      };
      
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      // First call
      await auth.getToken();
      
      // Manually expire the token by setting expiry to past
      (auth as any).systemTokenExpiry = new Date(Date.now() - 1000);
      
      // Second call should refresh
      await auth.getToken();
      
      // Should make two API calls
      expect(mockAxiosInstance.post).toHaveBeenCalledTimes(2);
    });
  });

  describe('Configuration', () => {
    test('should validate user token configuration', () => {
      const validConfig = {
        ...mockConfig,
        auth: {
          type: 'user_token' as const,
          user_token: 'valid-token'
        }
      };
      
      const auth = new BigIDAuth(validConfig);
      expect(auth.isConfigured()).toBe(true);
    });

    test('should reject invalid user token configuration', () => {
      const invalidConfig = {
        ...mockConfig,
        auth: {
          type: 'user_token' as const,
          user_token: undefined
        }
      };
      
      const auth = new BigIDAuth(invalidConfig);
      expect(auth.isConfigured()).toBe(false);
    });
  });

  describe('Token Management', () => {
    test('should clear tokens correctly', () => {
      auth.clearToken();
      
      // Access private properties for testing
      expect((auth as any).currentToken).toBeNull();
      expect((auth as any).tokenExpiry).toBeNull();
      expect((auth as any).systemToken).toBeNull();
      expect((auth as any).systemTokenExpiry).toBeNull();
    });

    test('should get auth header correctly', async () => {
      const mockResponse = {
        data: {
          success: true,
          systemToken: 'mock-system-token'
        }
      };
      
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const authHeader = await auth.getAuthHeader();
      expect(authHeader).toBe('mock-system-token');
    });
  });

  describe('Error Handling', () => {
    test('should handle missing user token', async () => {
      const configWithoutToken = {
        ...mockConfig,
        auth: {
          type: 'user_token' as const,
          user_token: undefined
        }
      };
      
      const auth = new BigIDAuth(configWithoutToken);
      
      await expect(auth.getToken()).rejects.toThrow('User token is required for user token authentication');
    });

    test('should handle invalid auth type', async () => {
      const invalidConfig = {
        ...mockConfig,
        auth: {
          type: 'invalid' as any
        }
      };
      
      const auth = new BigIDAuth(invalidConfig);
      
      await expect(auth.getToken()).rejects.toThrow('Invalid authentication type');
    });
  });
}); 