-- filepath:supabase/migrations/20240522000000_create_initial_schema.sql

-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'TODO' CHECK (status IN ('TODO', 'IN_PROGRESS', 'DONE')),
  priority TEXT DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),
  assignee TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mock Data Injection
INSERT INTO projects (id, name, description) VALUES
('p1-uuid', 'NextGen AI Platform', 'AI 기반 비즈니스 자동화 솔루션 구축 프로젝트'),
('p2-uuid', 'Global Expansion', '동남아시아 시장 진출을 위한 로컬라이징 프로젝트');

INSERT INTO tasks (project_id, title, status, priority, assignee) VALUES
('p1-uuid', 'Backend Architecture Design', 'IN_PROGRESS', 'HIGH', 'John Doe'),
('p1-uuid', 'API Documentation', 'TODO', 'MEDIUM', 'Jane Smith'),
('p2-uuid', 'Market Research - Vietnam', 'DONE', 'HIGH', 'Alice Wong');