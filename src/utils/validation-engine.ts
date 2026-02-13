import { FieldMetadata, CalculationMode } from '../types/validation-metadata';

/**
 * 서버 메타데이터를 기반으로 한 클라이언트 사이드 검증 엔진
 */
export class ValidationEngine {
  
  static getByteSize(str: string): number {
    return new TextEncoder().encode(str).length;
  }

  static validate(value: any, metadata: FieldMetadata): { isValid: boolean; message?: string } {
    const { constraints, messages, dataType } = metadata;
    const val = (constraints.trim && typeof value === 'string') ? value.trim() : value;

    // 1. Required Check
    if (constraints.required && (val === undefined || val === null || val === '')) {
      return { isValid: false, message: messages?.required || 'This field is required.' };
    }

    // 2. String Specific Validation
    if (dataType === 'STRING' && typeof val === 'string') {
      const mode: CalculationMode = constraints.calculationMode || 'CHAR_COUNT';
      const length = mode === 'BYTE_SIZE' ? this.getByteSize(val) : val.length;

      if (constraints.maxLength && length > constraints.maxLength) {
        return { 
          isValid: false, 
          message: messages?.maxLength || `Maximum length exceeded (${length}/${constraints.maxLength} ${mode})` 
        };
      }
      
      if (constraints.minLength && length < constraints.minLength) {
        return { 
          isValid: false, 
          message: messages?.minLength || `Minimum length not met (${length}/${constraints.minLength})` 
        };
      }
    }

    // 3. Pattern Matching
    if (constraints.pattern && typeof val === 'string') {
      const regex = new RegExp(constraints.pattern);
      if (!regex.test(val)) {
        return { isValid: false, message: messages?.pattern || 'Invalid format.' };
      }
    }

    return { isValid: true };
  }
}