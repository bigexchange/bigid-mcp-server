import { DataCatalogClient } from '../client/DataCatalogClient';
import { CacheManager } from '../cache/CacheManager';
import { ErrorHandler } from '../utils/ErrorHandler';

// Simple interfaces for tool arguments


interface GetCatalogObjectsPostArgs {
  filter?: string;
  skip?: number;
  limit?: number;
  offset?: number;
  offsetKey?: string;
  ignoreLimit?: boolean;
  sample?: number;
  requireTotalCount?: boolean;
  respectHiddenTags?: string;
  getColumnOrFieldOccurrencesCounterFlag?: boolean;
  getNumIdentitiesFlag?: boolean;
}

interface GetObjectDetailsArgs {
  fullyQualifiedName: string;
}

interface GetTagsArgs {
  // No arguments needed
}

interface GetRulesArgs {
  // No arguments needed
}

interface GetCatalogCountArgs {
  filter?: string;
}

// Removed unused argument interfaces for tag/rule management, relations, export,
// distinct values, object summary, and catalog health

export class CatalogTools {
  private catalogClient: DataCatalogClient;
  private cache: CacheManager;

  constructor(catalogClient: DataCatalogClient, cache: CacheManager) {
    this.catalogClient = catalogClient;
    this.cache = cache;
  }



  /**
   * Get catalog objects using POST request with body parameters
   */
  async getCatalogObjectsPost(args: GetCatalogObjectsPostArgs): Promise<any> {
    try {
      const stableArgs = { ...args };
      const cacheKey = `catalog_objects_post_${JSON.stringify(stableArgs)}`;
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        return { success: true, data: cached };
      }

      const result = await this.catalogClient.getObjectsPost({
        filter: stableArgs.filter,
        skip: stableArgs.skip,
        limit: stableArgs.limit,
        offset: stableArgs.offset,
        offsetKey: stableArgs.offsetKey,
        ignoreLimit: stableArgs.ignoreLimit,
        sample: stableArgs.sample,
        requireTotalCount: stableArgs.requireTotalCount,
        respectHiddenTags: stableArgs.respectHiddenTags,
        getColumnOrFieldOccurrencesCounterFlag: stableArgs.getColumnOrFieldOccurrencesCounterFlag,
        getNumIdentitiesFlag: stableArgs.getNumIdentitiesFlag
      });
      
      await this.cache.set(cacheKey, result, 1800); // Cache for 30 minutes
      return { success: true, data: result };
    } catch (error) {
      const errorInfo = ErrorHandler.handleApiError(error as Error, 'get_catalog_objects_post');
      return { success: false, error: ErrorHandler.createUserFriendlyMessage(errorInfo) };
    }
  }

  /**
   * Get detailed information about a specific object
   */
  async getObjectDetails(args: GetObjectDetailsArgs): Promise<any> {
    try {
      const cacheKey = `object_details_${args.fullyQualifiedName}`;
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        return { success: true, data: cached };
      }

      const result = await this.catalogClient.getObjectDetails(args.fullyQualifiedName);
      
      await this.cache.set(cacheKey, result, 600); // Cache for 10 minutes
      return { success: true, data: result };
    } catch (error) {
      const errorInfo = ErrorHandler.handleApiError(error as Error, 'get_object_details');
      return { success: false, error: ErrorHandler.createUserFriendlyMessage(errorInfo) };
    }
  }

  /**
   * Get all tags
   */
  async getTags(_: GetTagsArgs): Promise<any> {
    try {
      const cacheKey = 'catalog_tags';
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        return { success: true, data: cached };
      }

      const result = await this.catalogClient.getTags();
      
      await this.cache.set(cacheKey, result, 1800); // Cache for 30 minutes
      return { success: true, data: result };
    } catch (error) {
      const errorInfo = ErrorHandler.handleApiError(error as Error, 'get_tags');
      return { success: false, error: ErrorHandler.createUserFriendlyMessage(errorInfo) };
    }
  }

  /**
   * Get all rules
   */
  async getRules(_: GetRulesArgs): Promise<any> {
    try {
      const cacheKey = 'catalog_rules';
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        return { success: true, data: cached };
      }

      const result = await this.catalogClient.getRules();
      
      await this.cache.set(cacheKey, result, 1800); // Cache for 30 minutes
      return { success: true, data: result };
    } catch (error) {
      const errorInfo = ErrorHandler.handleApiError(error as Error, 'get_rules');
      return { success: false, error: ErrorHandler.createUserFriendlyMessage(errorInfo) };
    }
  }

  /**
   * Get catalog count
   */
  async getCatalogCount(args: GetCatalogCountArgs): Promise<any> {
    try {
      const cacheKey = `catalog_count_${JSON.stringify(args)}`;
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        return { success: true, data: cached };
      }

      const result = await this.catalogClient.getCount({
        filter: args.filter
      });
      
      await this.cache.set(cacheKey, result, 300); // Cache for 5 minutes
      return { success: true, data: result };
    } catch (error) {
      const errorInfo = ErrorHandler.handleApiError(error as Error, 'get_catalog_count');
      return { success: false, error: ErrorHandler.createUserFriendlyMessage(errorInfo) };
    }
  }

  // Removed tag/rule mutations, relations, export, summary, health, and distinct values methods as dead code






} 