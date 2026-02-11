# 데이터 타입 및 문자열 계산 방식 기술 명세서

## 1. 개요
본 문서는 데이터베이스 저장 시 Multi-byte 문자 처리 방식과 공백 문자 유효성 검사에 대한 표준 정책을 정의합니다. 시스템 간 데이터 전송 및 저장 시 발생할 수 있는 데이터 잘림(Truncation) 및 정합성 오류를 방지하는 것을 목적으로 합니다.

## 2. 문자열 길이 계산 표준 (Length Semantics)

### 2.1 DB 설정 및 선언 방식
*   **표준 방식**: `CHAR` 기반 길이 산정 (Character Semantics)
*   **이유**: 다국어(한글 등) 환경에서 바이트 수 계산으로 인한 비즈니스 로직의 복잡성을 제거하고, 사용자 입장에서의 글자 수를 기준으로 데이터 모델을 설계함.
*   **DB 설정 예시 (Oracle)**: `NLS_LENGTH_SEMANTICS = CHAR`
*   **컬럼 선언**: `VARCHAR2(100 CHAR)`

### 2.2 Multi-byte 처리 규칙
*   UTF-8 인코딩을 기준으로 하며, 한글은 3바이트를 차지하지만 논리적 길이는 1로 처리함.
*   외부 시스템 연동(Legacy, 대외기관) 시 Byte 기반 통신이 필요할 경우 별도의 `ByteLengthValidator`를 거쳐야 함.

## 3. 공백 문자 유효성 검사 정책 (Whitespace Policy)

### 3.1 Trim 정책
*   **Input Stage**: 모든 문자열 입력 값은 Leading/Trailing 공백을 제거(Trim)하는 것을 원칙으로 함.
*   **Exception**: 주소, 상세 설명 등 공백이 의미를 가지는 필드는 예외로 두되, 관리자가 승인한 필드에 한함.

### 3.2 빈 문자열 vs NULL
*   **표준**: 빈 문자열(`""`)은 내부적으로 `NULL`로 처리하거나, 엄격하게 구분해야 하는 경우 DB 제약 조건을 통해 관리함. (Oracle의 경우 빈 문자열은 NULL과 동일함)

---

## 4. 아키텍처 가이드라인

1.  **Presentation Layer**: UI 단에서 `maxlength` 속성을 통해 1차 검증.
2.  **Application Layer**: 엔티티 매핑 시 커스텀 어노테이션을 통한 유효성 검사 수행.
3.  **Persistence Layer**: DB 컬럼 정의 시 반드시 `CHAR` 세만틱 명시.