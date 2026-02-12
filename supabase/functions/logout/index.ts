import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Redis } from "https://esm.sh/@upstash/redis";

const redis = new Redis({
  url: Deno.env.get("UPSTASH_REDIS_REST_URL") || "",
  token: Deno.env.get("UPSTASH_REDIS_REST_TOKEN") || "",
});

serve(async (req) => {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return new Response("Missing token", { status: 400 });

  const token = authHeader.replace("Bearer ", "");
  const payload = JSON.parse(atob(token.split(".")[1]));
  const exp = payload.exp;
  const now = Math.floor(Date.now() / 1000);
  const ttl = exp - now;

  if (ttl > 0) {
    // トークンの有効期限が切れるまでDenyListに保持
    await redis.set(`denylist:${token}`, "true", { ex: ttl });
  }

  return new Response(JSON.stringify({ message: "Logged out successfully" }), { status: 200 });
});