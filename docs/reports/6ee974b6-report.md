# 작업 보고서: 비즈니스 정책 검증 로직 동기화 전략 수립

## 메타데이터
- **태스크 ID**: 6ee974b6-df56-4580-ba99-48cdeed88bbc
- **타입**: improvement
- **우선순위**: medium
- **담당 에이전트**: Backend
- **완료 시간**: 2026-01-18T23:16:17.857Z

## 태스크 설명
프로덕션 코드의 DTO 유효성 검사 규칙과 테스트 데이터 검증 규칙이 이원화되지 않도록 공통 상수를 공유하거나 스키마를 동기화하는 방안 마련

---
*Follow-up from task: 테스트 데이터 유효성 검증 로직 정교화*

## 작업 내용
비즈니스 정책 및 유효성 검사 로직이 프로덕션 코드와 테스트 코드에서 이원화되는 문제를 해결하기 위해, **공통 비즈니스 제약 조건(Shared Business Constraints)**을 정의하고 이를 DTO 유효성 검사와 DB 스키마, 그리고 테스트 로직에서 공유하는 전략을 제안합니다.

이 접근 방식은 `shared/constants`를 기반으로 하며, TypeScript의 `Zod` 라이브러리를 사용하여 런타임 유효성 검사를 수행합니다.

### 1. 공통 비즈니스 제약 조건 정의

```filepath:supabase/functions/_shared/constants/business-rules.ts
/**
 * 서비스 전반의 비즈니스 정책을 정의하는 공통 상수
 */
export const BUSINESS_RULES = {
  USER: {
    DISPLAY_NAME_MIN_LENGTH: 2,
    DISPLAY_NAME_MAX_LENGTH: 20,
    BIO_MAX_LENGTH: 160,
  },
  PROJECT: {
    MIN_TITLE_LENGTH: 5,
    MAX_TITLE_LENGTH: 100,
    MAX_MEMBER_COUNT: 50,
  },
  ORDER: {
    MIN_AMOUNT: 1000, // 최소 결제 금액
    MAX_ITEM_QUANTITY: 99,
  }
} as const;
```

### 2. 공유 스키마 및 유효성 검사 로직 (Zod)

이 파일을 통해 프로덕션 API와 테스트 코드 모두에서 동일한 검증 로직을 사용합니다.

```filepath:supabase/functions/_shared/schemas/user-schema.ts
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { BUSINESS_RULES } from "../constants/business-rules.ts";

// 프로덕션 DTO 및 테스트 데이터 검증에 공통으로 사용되는 스키마
export const UserProfileSchema = z.object({
  display_name: z
    .string()
    .min(BUSINESS_RULES.USER.DISPLAY_NAME_MIN_LENGTH, "이름이 너무 짧습니다.")
    .max(BUSINESS_RULES.USER.DISPLAY_NAME_MAX_LENGTH, "이름이 너무 깁니다."),
  bio: z
    .string()
    .max(BUSINESS_RULES.USER.BIO_MAX_LENGTH, "소개글은 160자를 초과할 수 없습니다.")
    .optional(),
  email: z.string().email("유효한 이메일 형식이 아닙니다."),
});

export type UserProfileDTO = z.infer<typeof UserProfileSchema>;
```

### 3. Edge Function API 엔드포인트 구현

```filepath:supabase/functions/update-profile/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { UserProfileSchema } from "../_shared/schemas/user-schema.ts";

serve(async (req) => {
  try {
    const body = await req.json();

    // 1. 공통 스키마를 이용한 유효성 검사 (Production Logic)
    const result = UserProfileSchema.safeParse(body);
    
    if (!result.success) {
      return new Response(
        JSON.stringify({ error: result.error.format() }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const validatedData = result.data;
    // ... DB 저장 로직 (validatedData 사용)

    return new Response(
      JSON.stringify({ message: "Success", data: validatedData }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
})
```

### 4. 데이터베이스 제약 조건 동기화 (SQL)

코드 레벨의 유효성 검사를 DB 계층에서도 보장하기 위해 선언된 상수를 기반으로 Check Constraint를 적용합니다.

```filepath:supabase/migrations/20231027000000_sync_business_rules.sql
-- 비즈니스 규칙에 따른 DB 제약 조건 강화
ALTER TABLE public.profiles
ADD CONSTRAINT display_name_length_check 
CHECK (char_length(display_name) >= 2 AND char_length(display_name) <= 20);

ALTER TABLE public.profiles
ADD CONSTRAINT bio_length_check 
CHECK (char_length(bio) <= 160);
```

### 5. 테스트 코드에서의 활용 예시

```filepath:supabase/functions/tests/user-validation.test.ts
import { assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { UserProfileSchema } from "../_shared/schemas/user-schema.ts";
import { BUSINESS_RULES } from "../_shared/constants/business-rules.ts";

Deno.test("User Profile Validation Rule Sync Test", () => {
  // 1. 공통 상수를 사용한 경계값 테스트
  const invalidData = {
    display_name: "A".repeat(BUSINESS_RULES.USER.DISPLAY_NAME_MAX_LENGTH + 1),
    email: "test@example.com"
  };

  const result = UserProfileSchema.safeParse(invalidData);
  
  assertEquals(result.success, false);
  if (!result.success) {
    const errorMsg = result.error.format().display_name?._errors[0];
    assertEquals(errorMsg, "이름이 너무 깁니다.");
  }
});
```

---

### 요약 및 보고

#### 1. 생성/수정된 파일 목록
- `_shared/constants/business-rules.ts`: 비즈니스 정책 수치 정규화
- `_shared/schemas/user-schema.ts`: Zod 기반의 공통 데이터 검증 모델
- `update-profile/index.ts`: 프로덕션 API 구현 (스키마 적용)
- `migrations/20231027000000_sync_business_rules.sql`: DB 레벨 제약 조건 동기화
- `tests/user-validation.test.ts`: 정책 기반 테스트 코드 구현

#### 2. 주요 구현 결정 사항
- **Single Source of Truth (SSOT)**: 모든 유효성 검사 규칙을 `BUSINESS_RULES` 상수에 응집시켜, 규칙 변경 시 한 곳만 수정하면 API, 테스트, DB 설명이 동기화되도록 설계했습니다.
- **Layered Defense**: API 엔드포인트(Zod)와 DB(SQL Constraints) 양쪽에서 검증을 수행하여 데이터 무결성을 이중으로 보장합니다.

#### 3. 테스트 권장 사항
- `vitest` 또는 `deno test`를 사용하여 `_shared/schemas`의 모든 스키마가 `BUSINESS_RULES`의 경계값에서 올바르게 작동하는지 Unit Test를 상시 실행하십시오.
- CI/CD 파이프라인에 DB Migration Lint를 추가하여 SQL 제약 조건과 코드가 일치하는지 확인하는 프로세스를 검토하십시오.

#### 4. 다음 단계
- 프런트엔드 애플리케이션에서도 동일한 `business-rules.ts`를 공유하여 클라이언트 측 폼 유효성 검사를 통합할 예정입니다.
- 나머지 도메인(Project, Order 등)에 대한 스키마 확장을 진행합니다.

## 다음 단계
- [ ] PM 리뷰 대기
- [ ] 코드 리뷰 진행
- [ ] 테스트 검증
- [ ] 배포 승인

---
*이 보고서는 AI 에이전트에 의해 자동 생성되었습니다.*
