-- Crystal Copilot Database Schema for Supabase
-- Run this in your Supabase SQL Editor

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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_change_log_report_id ON change_log(report_id);
CREATE INDEX IF NOT EXISTS idx_change_log_timestamp ON change_log(timestamp DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE change_log ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed for your security requirements)
CREATE POLICY "Allow all operations on reports" ON reports
    FOR ALL USING (true);

CREATE POLICY "Allow all operations on change_log" ON change_log
    FOR ALL USING (true);

-- Optional: Create a view for report summaries
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

-- Trigger to automatically update updated_at
CREATE TRIGGER update_reports_updated_at 
    BEFORE UPDATE ON reports 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data (optional - for testing)
-- INSERT INTO reports (id, filename, file_path, file_size, status) VALUES
-- ('123e4567-e89b-12d3-a456-426614174000', 'sample_report.rpt', '/uploads/sample_report.rpt', 1024000, 'ready');

COMMENT ON TABLE reports IS 'Crystal Reports metadata and file information';
COMMENT ON TABLE change_log IS 'Audit trail for all report modifications';
COMMENT ON VIEW report_summaries IS 'Simplified view of reports with extracted metadata';