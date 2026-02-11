/**
 * SmartInput 유효성 검사 메타데이터 타입 정의
 */

export type DataType = 'STRING' | 'NUMBER' | 'DATE' | 'BOOLEAN' | 'EMAIL' | 'URL';

export type CalculationMode = 'CHAR_COUNT' | 'BYTE_SIZE';

export interface ValidationConstraints {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  trim?: boolean;
  calculationMode?: CalculationMode;
}

export interface ValidationMessages {
  [key: string]: string;
}

export interface FieldMetadata {
  fieldId: string;
  dataType: DataType;
  constraints: ValidationConstraints;
  messages?: ValidationMessages;
}

export interface FormMetadataResponse {
  formId: string;
  fields: FieldMetadata[];
}