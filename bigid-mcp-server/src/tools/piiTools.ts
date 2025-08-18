import { CacheManager } from '../cache/CacheManager';
import { ErrorHandler } from '../utils/ErrorHandler';
import { PIIClient } from '../client/PIIClient';

export class PIITools {
  private piiClient: PIIClient;
  private cache: CacheManager;

  constructor(piiClient: PIIClient, cache: CacheManager) {
    this.piiClient = piiClient;
    this.cache = cache;
  }

  async getPiiRecords(): Promise<any> {
    try {
      const cacheKey = 'pii_records';
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        return { success: true, data: cached };
      }

      const result = await this.piiClient.getPiiRecords();
      await this.cache.set(cacheKey, result, 300);
      return { success: true, data: result };
    } catch (error) {
      const errorInfo = ErrorHandler.handleApiError(error as Error, 'get_pii_records');
      return { success: false, error: ErrorHandler.createUserFriendlyMessage(errorInfo) };
    }
  }
}


