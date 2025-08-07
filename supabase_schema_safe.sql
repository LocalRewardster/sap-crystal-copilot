-- Crystal Copilot Database Schema for Supabase (Safe Version)
-- This version handles existing objects gracefully

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'uploading',
    error_message TEXT,
    metadata_json JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Change log table for audit trail
CREATE TABLE IF NOT EXISTS change_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    operation VARCHAR(100) NOT NULL,
    field_name VARCHAR(255),
    old_value TEXT,
    new_value TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for better performance (safe)
DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
EXCEPTION
    WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);
EXCEPTION
    WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS idx_change_log_report_id ON change_log(report_id);
EXCEPTION
    WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS idx_change_log_timestamp ON change_log(timestamp DESC);
EXCEPTION
    WHEN duplicate_table THEN NULL;
END $$;

-- Enable Row Level Security (safe)
DO $$ BEGIN
    ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
EXCEPTION
    WHEN others THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE change_log ENABLE ROW LEVEL SECURITY;
EXCEPTION
    WHEN others THEN NULL;
END $$;

-- Drop existing policies if they exist, then recreate
DROP POLICY IF EXISTS "Allow all operations on reports" ON reports;
DROP POLICY IF EXISTS "Allow all operations on change_log" ON change_log;

-- Create policies for public access
CREATE POLICY "Allow all operations on reports" ON reports
    FOR ALL USING (true);

CREATE POLICY "Allow all operations on change_log" ON change_log
    FOR ALL USING (true);

-- Create or replace view for report summaries
CREATE OR REPLACE VIEW report_summaries AS
SELECT 
    r.id,
    r.filename,
    r.file_size,
    r.status,
    r.created_at,
    r.updated_at,
    COALESCE(
        (r.metadata_json->>'title')::text,
        split_part(r.filename, '.', 1)
    ) as title,
    (r.metadata_json->>'author')::text as author,
    (r.metadata_json->'sections')::jsonb as sections_count
FROM reports r;

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists, then recreate
DROP TRIGGER IF EXISTS update_reports_updated_at ON reports;
CREATE TRIGGER update_reports_updated_at 
    BEFORE UPDATE ON reports 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE reports IS 'Crystal Reports metadata and file information';
COMMENT ON TABLE change_log IS 'Audit trail for all report modifications';
COMMENT ON VIEW report_summaries IS 'Simplified view of reports with extracted metadata';

-- Verify setup
SELECT 'Database schema setup complete!' as status;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('reports', 'change_log');