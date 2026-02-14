import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Redis } from "https://esm.sh/@upstash/redis";

const redis = new Redis({
  url: Deno.env.get("UPSTASH_REDIS_REST_URL") || "",
  token: Deno.env.get("UPSTASH_REDIS_REST_TOKEN") || "",
});

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") || "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
);

serve(async (req) => {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response("Unauthorized", { status: 401 });

    const token = authHeader.replace("Bearer ", "");
    // JWTのデコード (実際のプロジェクトではjose等のライブラリを使用)
    const payload = JSON.parse(atob(token.split(".")[1]));
    const userId = payload.sub;
    const tokenIssuedAt = payload.iat; // 秒単位

    // 1. Redis DenyList チェック (即時ログアウト対応)
    const isRevoked = await redis.get(`denylist:${token}`);
    if (isRevoked) {
      return new Response(JSON.stringify({ error: "Token revoked" }), { status: 401 });
    }

    // 2. パスワード変更チェック (DB照合)
    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("password_changed_at")
      .eq("id", userId)
      .single();

    if (user?.password_changed_at) {
      const changedAtUnix = Math.floor(new Date(user.password_changed_at).getTime() / 1000);
      if (tokenIssuedAt < changedAtUnix) {
        return new Response(JSON.stringify({ error: "Password changed. Please login again." }), { status: 401 });
      }
    }

    return new Response(JSON.stringify({ status: "ok", userId }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});