import { PagingHelper } from '../src/utils/PagingHelper';

describe('PagingHelper', () => {
  describe('normalizePaging', () => {
    test('should return undefined when no paging is specified', () => {
      const result = PagingHelper.normalizePaging({});
      expect(result).toBeUndefined();
    });

    test('should normalize paging object with both skip and limit', () => {
      const result = PagingHelper.normalizePaging({
        paging: { skip: 10, limit: 50 }
      });
      expect(result).toEqual({ skip: 10, limit: 50 });
    });

    test('should provide defaults when only skip is provided in paging object', () => {
      const result = PagingHelper.normalizePaging({
        paging: { skip: 10 }
      });
      expect(result).toEqual({ skip: 10, limit: 20 });
    });

    test('should provide defaults when only limit is provided in paging object', () => {
      const result = PagingHelper.normalizePaging({
        paging: { limit: 50 }
      });
      expect(result).toEqual({ skip: 0, limit: 50 });
    });

    test('should handle skip and limit provided directly', () => {
      const result = PagingHelper.normalizePaging({
        skip: 10,
        limit: 50
      });
      expect(result).toEqual({ skip: 10, limit: 50 });
    });

    test('should provide defaults when only skip is provided directly', () => {
      const result = PagingHelper.normalizePaging({
        skip: 10
      });
      expect(result).toEqual({ skip: 10, limit: 20 });
    });

    test('should provide defaults when only limit is provided directly', () => {
      const result = PagingHelper.normalizePaging({
        limit: 50
      });
      expect(result).toEqual({ skip: 0, limit: 50 });
    });

    test('should use custom defaults', () => {
      const result = PagingHelper.normalizePaging({
        paging: { skip: 10 }
      }, 5, 100);
      expect(result).toEqual({ skip: 10, limit: 100 });
    });
  });

  describe('createPaging', () => {
    test('should create paging with defaults when no paging specified', () => {
      const result = PagingHelper.createPaging({});
      expect(result).toEqual({ skip: 0, limit: 20 });
    });

    test('should create paging with custom defaults', () => {
      const result = PagingHelper.createPaging({}, 5, 100);
      expect(result).toEqual({ skip: 5, limit: 100 });
    });

    test('should use provided paging values', () => {
      const result = PagingHelper.createPaging({
        paging: { skip: 10, limit: 50 }
      });
      expect(result).toEqual({ skip: 10, limit: 50 });
    });

    test('should handle partial paging with defaults', () => {
      const result = PagingHelper.createPaging({
        paging: { skip: 10 }
      });
      expect(result).toEqual({ skip: 10, limit: 20 });
    });
  });

  describe('createPagingOptional', () => {
    test('should return undefined when no paging is specified', () => {
      const result = PagingHelper.createPagingOptional({});
      expect(result).toBeUndefined();
    });

    test('should return paging object when paging is specified', () => {
      const result = PagingHelper.createPagingOptional({
        paging: { skip: 10, limit: 50 }
      });
      expect(result).toEqual({ skip: 10, limit: 50 });
    });

    test('should return paging object when skip is provided directly', () => {
      const result = PagingHelper.createPagingOptional({
        skip: 10
      });
      expect(result).toEqual({ skip: 10, limit: 20 });
    });

    test('should return paging object when limit is provided directly', () => {
      const result = PagingHelper.createPagingOptional({
        limit: 50
      });
      expect(result).toEqual({ skip: 0, limit: 50 });
    });

    test('should return undefined when no paging parameters are provided', () => {
      const result = PagingHelper.createPagingOptional({
        text: 'search term'
      });
      expect(result).toBeUndefined();
    });
  });
}); 