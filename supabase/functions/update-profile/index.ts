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