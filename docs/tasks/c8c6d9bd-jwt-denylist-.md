# JWT 세션 무효화 로직(DenyList) 구현 검토

## 概要
- **タイプ**: research
- **優先度**: medium
- **担当エージェント**: Backend
- **完了日**: 2026-02-12

## タスク説明
password_changed_at 필드 활용 및 Redis 기반 DenyList 도입 등 구체적인 세션 무효화 메커니즘 설계

---
*멘션 논의에서 생성된 후속 태스크: 사용자 인증 데이터베이스 스키마 설계*

## 作業報告書
バックエンド開発担当として、JWTセッション無効化（DenyList）ロジックの実装設計およびコードを生成しました。

今回の設計では、パフォーマンスとセキュリティを両立させるため、以下の2段階のチェック機構を提案します：
1.  **パスワード変更ベースの無効化**: DBの`password_changed_at`をJWTの抽出された発行時間(`iat`)と比較。
2.  **即時無効化 (Logout/Revoke)**: Redis（Upstash等）を利用したDenyListによるブラックリスト方式。

### 1. データベース・スキーマ設計

まず、ユーザーテーブルにパスワード変更日時を追加し、認証情報を管理します。

```filepath:supabase/migrations/20240524000000_update_users_for_auth_invalidation.sql
-- ユーザーテーブルにパスワード変更日時を追加
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMPTZ;

-- 下記はアプリケーション側で利用するプロファイルテーブルの例（必要に応じて）
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  updated_at TIMESTAMPTZ,
  username TEXT UNIQUE
);
```

### 2. Edge Function: セッション検証・無効化ロジック

APIゲートウェイやミドルウェアとして機能する、セッション有効性をチェックするロジックです。

```filepath:supabase/functions/verify-session/index.ts
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
```

### 3. API Endpoint: ログアウト (Revoke) ロジック

ログアウト時に現在のトークンをRedisのDenyListに登録します。

```filepath:supabase/functions/logout/index.ts
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
```

---

### 実装のまとめ

1.  **作成したファイル**:
    *   `supabase/migrations/xxxx_update_users_for_auth_invalidation.sql`: `password_changed_at` フィールドの追加。
    *   `supabase/functions/verify-session/index.ts`: RedisとDBを組み合わせた2段構えの検証ロジック。
    *   `supabase/functions/logout/index.ts`: Redisへトークンを登録するログアウト処理。

2.  **主な設計判断**:
    *   **Redisの採用**: ステートレスなJWTの欠点を補い、即時無効化を低レイテンシで実現するため、外部メモリとしてUpstash Redisを想定。
    *   **パスワード変更フラグ**: 全セッションを一括無効化する必要があるパスワード変更時は、DBのタイムスタンプ比較で対応し、Redisのメモリ消費を抑制。
    *   **TTL設定**: RedisのキーにはJWTの残り有効期限(`exp`)をTTLとして設定し、不要なデータが残らないように自動削除させています。

3.  **テスト推奨事項**:
    *   パスワード変更後に古いトークンでリクエストを送り、401エラーが返るか確認。
    *   ログアウトAPI実行後、同一トークンでのアクセスが拒否されるか確認。
    *   Redisのエッジ接続パフォーマンス（Latency）の測定。

4.  **次のステップ**:
    *   Supabase Authの `Hook` 機能（存在する場合）への統合、またはMiddleware層への組み込み。
    *   サービスロールキーやRedis認証情報の環境変数設定。

---
*このドキュメントはAIエージェントによって自動生成されました。*
