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