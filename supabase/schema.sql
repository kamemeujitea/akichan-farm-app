-- あきちゃんファーム Supabase Schema
-- Run this in Supabase Dashboard → SQL Editor

-- 栽培ステップ完了状況
CREATE TABLE step_completions (
  key TEXT PRIMARY KEY,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  note TEXT
);

-- カレンダータスク完了
CREATE TABLE task_completions (
  task_id TEXT PRIMARY KEY,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  note TEXT
);

-- ユーザー追加タスク
CREATE TABLE user_tasks (
  id TEXT PRIMARY KEY,
  date DATE NOT NULL,
  title TEXT NOT NULL,
  note TEXT,
  bed_ids INTEGER[]
);

-- メンバー
CREATE TABLE members (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '👨‍🌾',
  color TEXT NOT NULL DEFAULT '#6B8E23',
  assigned_bed_ids INTEGER[]
);

-- シフト
CREATE TABLE shifts (
  id TEXT PRIMARY KEY,
  member_id TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  weekday INTEGER NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  task TEXT
);

-- チェックイン
CREATE TABLE checkins (
  id TEXT PRIMARY KEY,
  member_id TEXT NOT NULL,
  date DATE NOT NULL,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  note TEXT,
  completed_task_ids TEXT[]
);

-- 集金
CREATE TABLE incomes (
  id TEXT PRIMARY KEY,
  date DATE NOT NULL,
  from_name TEXT NOT NULL,
  amount INTEGER NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 出費
CREATE TABLE expenses (
  id TEXT PRIMARY KEY,
  date DATE NOT NULL,
  category TEXT NOT NULL,
  item TEXT NOT NULL,
  amount INTEGER NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 収穫記録
CREATE TABLE harvests (
  id TEXT PRIMARY KEY,
  date DATE NOT NULL,
  bed_id INTEGER,
  crop TEXT NOT NULL,
  emoji TEXT,
  amount_kg REAL,
  amount_count INTEGER,
  photo_url TEXT,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS無効（認証なし、5人の家庭菜園）
ALTER TABLE step_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE incomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE harvests ENABLE ROW LEVEL SECURITY;

-- 全テーブルにanon読み書きポリシー
CREATE POLICY "anon_all" ON step_completions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON task_completions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON user_tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON shifts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON checkins FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON incomes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON harvests FOR ALL USING (true) WITH CHECK (true);

-- 収穫写真用ストレージバケット
INSERT INTO storage.buckets (id, name, public) VALUES ('harvest-photos', 'harvest-photos', true);
CREATE POLICY "anon_upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'harvest-photos');
CREATE POLICY "anon_select" ON storage.objects FOR SELECT USING (bucket_id = 'harvest-photos');
CREATE POLICY "anon_delete" ON storage.objects FOR DELETE USING (bucket_id = 'harvest-photos');
