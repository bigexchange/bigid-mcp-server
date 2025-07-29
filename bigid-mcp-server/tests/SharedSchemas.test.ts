import { errorSchema, messageSchema, statusSchema, statusCodeSchema, successResponseSchema } from '../src/schemas/sharedSchemas';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

describe('Shared Schemas', () => {
  describe('errorSchema', () => {
    test('should validate string error', () => {
      const validate = ajv.compile(errorSchema);
      const result = validate('API Error: Request failed');
      expect(result).toBe(true);
    });

    test('should validate null error', () => {
      const validate = ajv.compile(errorSchema);
      const result = validate(null);
      expect(result).toBe(true);
    });

    test('should validate object error', () => {
      const validate = ajv.compile(errorSchema);
      const result = validate({
        code: 'UNKNOWN_ERROR',
        message: 'Request failed with status code 500',
        retryable: false
      });
      expect(result).toBe(true);
    });

    test('should reject invalid error types', () => {
      const validate = ajv.compile(errorSchema);
      const result = validate(123);
      expect(result).toBe(false);
    });
  });

  describe('messageSchema', () => {
    test('should validate string message', () => {
      const validate = ajv.compile(messageSchema);
      const result = validate('Success');
      expect(result).toBe(true);
    });

    test('should validate null message', () => {
      const validate = ajv.compile(messageSchema);
      const result = validate(null);
      expect(result).toBe(true);
    });

    test('should reject invalid message types', () => {
      const validate = ajv.compile(messageSchema);
      const result = validate(123);
      expect(result).toBe(false);
    });
  });

  describe('statusSchema', () => {
    test('should validate string status', () => {
      const validate = ajv.compile(statusSchema);
      const result = validate('success');
      expect(result).toBe(true);
    });

    test('should reject non-string status', () => {
      const validate = ajv.compile(statusSchema);
      const result = validate(123);
      expect(result).toBe(false);
    });
  });

  describe('statusCodeSchema', () => {
    test('should validate number status code', () => {
      const validate = ajv.compile(statusCodeSchema);
      const result = validate(200);
      expect(result).toBe(true);
    });

    test('should reject non-number status code', () => {
      const validate = ajv.compile(statusCodeSchema);
      const result = validate('200');
      expect(result).toBe(false);
    });
  });

  describe('successResponseSchema', () => {
    test('should validate successful response', () => {
      const validate = ajv.compile(successResponseSchema);
      const result = validate({
        success: true,
        data: { results: [] },
        error: null
      });
      expect(result).toBe(true);
    });

    test('should validate error response', () => {
      const validate = ajv.compile(successResponseSchema);
      const result = validate({
        success: false,
        data: null,
        error: {
          code: 'UNKNOWN_ERROR',
          message: 'Request failed',
          retryable: false
        }
      });
      expect(result).toBe(true);
    });
  });
}); 