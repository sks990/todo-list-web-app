# 데이터 검사 메타데이터 API 규격 정의

## 개요
- **타입**: improvement
- **우선순위**: high
- **담당 에이전트**: Tech Lead
- **완료일**: 2026-02-11

## 태스크 설명
SmartInput 컴포넌트가 서버의 데이터 정책(Type, Max, Trim 등)을 동적으로 수신할 수 있도록 공통 API 메타데이터 규격 설계

---
*멘션 논의에서 생성된 후속 태스크: 데이터 타입 및 문자열 계산 방식 기술 명세서 작성*

## 작업 보고서
안녕하십니까, Tech Lead AI Agent입니다.

SmartInput 컴포넌트가 서버의 데이터 정책을 동적으로 반영할 수 있도록 하는 **데이터 검사 메타데이터 API 규격** 설계를 완료하였습니다. 이 설계는 프론트엔드와 백엔드 간의 강결합을 해제하고, 정책 변경 시 클라이언트 코드 수정 없이 즉각적인 대응이 가능하도록 설계되었습니다.

제안하는 아키텍처와 기술 명세서, 그리고 샘플 구현 코드는 다음과 같습니다.

```filepath:docs/architecture/data-validation-metadata-spec.md
# 데이터 검사 메타데이터 API 기술 명세서

## 1. 개요
본 문서는 SmartInput 컴포넌트가 서버로부터 데이터 유효성 검사 규칙을 동적으로 수신하기 위한 공통 API 메타데이터 규격을 정의한다.

## 2. 기본 원칙
- **언어 중립성**: 특정 프로그래밍 언어에 종속되지 않는 JSON 스키마 기반 규격.
- **확장성**: 기본 제약 조건 외에 사용자 정의(Custom) 검증 로직을 추가할 수 있는 구조.
- **성능**: 대량의 폼 필드 조회 시 오버헤드를 줄이기 위한 경량화된 구조.

## 3. 메타데이터 필드 정의

| 필드명 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :---: | :--- |
| `fieldId` | string | Y | 입력 필드의 고유 식별자 |
| `dataType` | enum | Y | `STRING`, `NUMBER`, `DATE`, `BOOLEAN`, `EMAIL`, `URL` |
| `constraints` | object | Y | 상세 제약 조건 (상세 하단 참고) |
| `messages` | object | N | 유효성 실패 시 표시할 커스텀 메시지 |

### 3.1 Constraints 상세
- `required`: boolean (필수 여부)
- `maxLength`: number (문자열 최대 길이)
- `minLength`: number (문자열 최소 길이)
- `min`: number (숫자 최솟값)
- `max`: number (숫자 최댓값)
- `pattern`: string (정규표현식)
- `trim`: boolean (공백 제거 여부)
- `calculationMode`: `CHAR_COUNT` | `BYTE_SIZE` (문자열 길이 계산 방식)

## 4. 데이터 타입별 문자열 계산 방식
특히 `STRING` 타입의 경우, DB 컬럼 크기 제한과 UI 입력 제한을 일치시키기 위해 다음 방식을 기술한다.
- **CHAR_COUNT**: 단순 유니코드 문자 수 기반 (JavaScript의 `.length`)
- **BYTE_SIZE**: UTF-8 기준 바이트 크기 기반

---

## 5. API Response Sample
```json
{
  "formId": "USER_REGISTRATION",
  "fields": [
    {
      "fieldId": "username",
      "dataType": "STRING",
      "constraints": {
        "required": true,
        "minLength": 4,
        "maxLength": 20,
        "trim": true,
        "calculationMode": "CHAR_COUNT"
      },
      "messages": {
        "required": "사용자 아이디는 필수 입력 항목입니다.",
        "minLength": "아이디는 최소 4자 이상이어야 합니다."
      }
    },
    {
      "fieldId": "bio",
      "dataType": "STRING",
      "constraints": {
        "maxLength": 2000,
        "calculationMode": "BYTE_SIZE"
      }
    }
  ]
}
```
```

```filepath:src/types/validation-metadata.ts
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
```

```filepath:src/utils/validation-engine.ts
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
```

---

### 리포트 요약

#### 1. 생성된 파일 목록
- `docs/architecture/spec.md`: 데이터 정책 연동을 위한 상세 기술 명세서
- `src/types/validation-metadata.ts`: TypeScript 인터페이스 정의 (Front/Back 공유 가능)
- `src/utils/validation-engine.ts`: 메타데이터를 해석하여 실제 검증을 수행하는 유틸리티 클래스

#### 2. 핵심 설계 결정 사항
- **Dynamic Policy Injection**: SmartInput은 특정 규칙을 하드코딩하지 않고 본 규격의 JSON을 수신하여 런타임에 유효성을 결정합니다.
- **Calculation Mode 도입**: 한글/영문 바이트 계산 차이로 인한 DB 에러를 방지하기 위해 `CHAR_COUNT`와 `BYTE_SIZE` 모드를 명시적으로 구분했습니다.
- **Separation of Concerns**: 유효성 검증 로직을 `ValidationEngine`으로 분리하여 SmartInput 외의 다른 컴포넌트나 API 호출 전 가공 단계에서도 재사용 가능하게 했습니다.

#### 3. 기술적 위험 및 의존성
- **Regex Security**: 서버에서 내려주는 `pattern`(정규표현식)이 악의적일 경우(ReDoS 등) 클라이언트 브라우저가 프리징될 수 있으므로, 서버 측에서 정규표현식 라이브러리를 통해 검증된 패턴만 전달해야 합니다.
- **Consistency**: 백엔드의 Hibernate/JPA 어노테이션(Size, Max 등) 혹은 DB Schema와 본 메타데이터 API의 매핑 자동화가 필요합니다(Manual 관리 시 싱크 오류 위험).

#### 4. 향후 단계
- SmartInput 컴포넌트 내부에 `ValidationEngine`을 통합하여 실시간 UI 피드백 구현.
- 공통 API 컨트롤러를 통해 비즈니스 단의 엔티티 제약 조건을 JSON으로 파싱하여 전달하는 어댑터 개발.

검토 부탁드립니다. 추가 요구사항이 있으시면 말씀해 주십시오.

---
*이 문서는 AI 에이전트에 의해 자동 생성되었습니다.*
