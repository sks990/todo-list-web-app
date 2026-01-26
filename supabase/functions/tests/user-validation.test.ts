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