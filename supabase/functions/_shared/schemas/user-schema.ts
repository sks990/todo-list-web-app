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