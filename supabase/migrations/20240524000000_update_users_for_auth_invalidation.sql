-- ユーザーテーブルにパスワード変更日時を追加
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMPTZ;

-- 下記はアプリケーション側で利用するプロファイルテーブルの例（必要に応じて）
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  updated_at TIMESTAMPTZ,
  username TEXT UNIQUE
);