-- Enable UUID extension (usually enabled by default in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. SESSIONS TABLE (Tracks anonymous users and their premium status)
CREATE TABLE sessions (
    session_id VARCHAR(255) PRIMARY KEY,
    tier VARCHAR(50) DEFAULT 'free', -- 'free', 'accelerator', 'premium'
    tier_expires TIMESTAMP WITH TIME ZONE,
    ai_calls_used INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_sessions_tier ON sessions(tier);

-- 2. RESUMES TABLE (Stores parsed text and hash, NO raw binary files)
CREATE TABLE resumes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255) REFERENCES sessions(session_id) ON DELETE CASCADE,
    text_hash VARCHAR(64) UNIQUE NOT NULL, -- SHA-256 hash of the text
    raw_text TEXT,
    contact JSONB,
    summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_resumes_session ON resumes(session_id);
CREATE INDEX idx_resumes_hash ON resumes(text_hash);

-- 3. RESUME SKILLS (Normalized)
CREATE TABLE resume_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resume_id UUID REFERENCES resumes(id) ON DELETE CASCADE,
    skill_name VARCHAR(100) NOT NULL
);
CREATE INDEX idx_resume_skills_resume ON resume_skills(resume_id);

-- 4. RESUME EXPERIENCES
CREATE TABLE resume_experiences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resume_id UUID REFERENCES resumes(id) ON DELETE CASCADE,
    title VARCHAR(150),
    company VARCHAR(150),
    duration VARCHAR(50),
    description TEXT
);

-- 5. RESUME EDUCATIONS
CREATE TABLE resume_educations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resume_id UUID REFERENCES resumes(id) ON DELETE CASCADE,
    degree VARCHAR(150),
    institution VARCHAR(150),
    year VARCHAR(50)
);

-- 6. ATS SCORES (Deterministic calculation results)
CREATE TABLE ats_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resume_id UUID REFERENCES resumes(id) ON DELETE CASCADE,
    total_score INT, -- 0 to 100
    keywords_match INT, -- 30% weight
    experience_relevance INT, -- 25% weight
    skills_coverage INT, -- 20% weight
    resume_structure INT, -- 15% weight
    education_match INT, -- 10% weight
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_ats_scores_resume ON ats_scores(resume_id);

-- 7. SALARY ESTIMATES (Deterministic lookup results)
CREATE TABLE salary_estimates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resume_id UUID REFERENCES resumes(id) ON DELETE CASCADE,
    conservative INT,
    average INT,
    premium INT,
    currency VARCHAR(10) DEFAULT 'INR',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. JOBS TABLE (Aggregated every 6 hours from Adzuna, Greenhouse, Lever)
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source VARCHAR(50) NOT NULL, -- 'adzuna', 'greenhouse', 'lever'
    external_id VARCHAR(255) NOT NULL,
    title VARCHAR(200) NOT NULL,
    company VARCHAR(150) NOT NULL,
    location VARCHAR(150),
    description TEXT,
    url TEXT NOT NULL,
    posted_date TIMESTAMP WITH TIME ZONE,
    UNIQUE(source, external_id)
);
CREATE INDEX idx_jobs_source ON jobs(source);
CREATE INDEX idx_jobs_title ON jobs(title);

-- 9. JOB SKILLS (For deterministic matching with resume_skills)
CREATE TABLE job_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    skill_name VARCHAR(100) NOT NULL
);
CREATE INDEX idx_job_skills_job ON job_skills(job_id);

-- 10. AI RESULTS CACHE (Prevents duplicate AI charges for same resume + feature)
CREATE TABLE ai_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    text_hash VARCHAR(64) NOT NULL,
    feature_name VARCHAR(100) NOT NULL, -- e.g., 'resume_rewrite', 'roadmap', 'interview_prep'
    result_json JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(text_hash, feature_name)
);
CREATE INDEX idx_ai_results_hash ON ai_results(text_hash);

-- 11. PAYMENTS (Tracks Razorpay transactions linked to session_id)
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255) REFERENCES sessions(session_id) ON DELETE CASCADE,
    razorpay_order_id VARCHAR(100),
    razorpay_payment_id VARCHAR(100),
    plan VARCHAR(50) NOT NULL, -- 'accelerator' (₹99) or 'premium' (₹199/mo)
    amount INT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'success', 'failed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_payments_session ON payments(session_id);
CREATE INDEX idx_payments_status ON payments(status);

-- Trigger to auto-update 'updated_at' on sessions table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_sessions_updated_at
BEFORE UPDATE ON sessions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();