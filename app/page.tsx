"use client";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [showJobs, setShowJobs] = useState(false);

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("cv", file);

    try {
      const res = await fetch("/api/upload-cv", { method: "POST", body: formData });
      const data = await res.json();

      if (data.success) {
        setSkills(data.extractedSkills);
        setJobs(data.matchedJobs);
        setShowJobs(true);
      }
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={styles.container}>
      <nav style={styles.navbar}>
        <div style={styles.navContent}>
          <div style={styles.logo}>
            <span style={{ color: "#2563eb" }}>blue</span>
            <span style={{ color: "#f59e0b" }}>jobs</span>
          </div>
          <div style={styles.navLinks}>
            <a href="/" style={{ ...styles.navLink, ...styles.activeNavLink }}>Home</a>
            <a href="/jobs" style={styles.navLink}>Browse Jobs</a>
            {session ? (
              <a href="/dashboard" style={styles.navLink}>Dashboard</a>
            ) : (
              <a href="/login" style={styles.loginBtn}>Login</a>
            )}
          </div>
        </div>
      </nav>

      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.title}>
            Find Your <span style={{ color: "#f59e0b" }}>Dream Job</span> with AI
          </h1>
          <p style={styles.subtitle}>
            Upload your CV and let our AI match you with the perfect job opportunities
          </p>
        </div>
      </div>

      <div style={styles.mainContent}>
        <div style={styles.uploadCard}>
          <div style={styles.uploadIcon}>📄</div>
          <h2 style={styles.uploadTitle}>Upload Your CV</h2>
          <p style={styles.uploadDesc}>Get personalized job matches based on your skills</p>
          
          <div style={styles.uploadArea}>
            <input
              type="file"
              id="home-cv-upload"
              accept=".pdf,.docx,.txt"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              style={{ display: "none" }}
            />
            <label htmlFor="home-cv-upload" style={styles.fileLabel}>
              📁 {file ? file.name : "Choose File (PDF, DOCX, TXT)"}
            </label>
            
            <button
              onClick={handleUpload}
              disabled={uploading || !file}
              style={{
                ...styles.uploadBtn,
                ...((uploading || !file) ? styles.uploadBtnDisabled : {})
              }}
            >
              {uploading ? "Analyzing..." : "🎯 Find Matching Jobs"}
            </button>
          </div>

          {!session && (
            <p style={styles.loginPrompt}>
              👋 <a href="/login" style={{ color: "#2563eb" }}>Login</a> to save your matches and apply directly
            </p>
          )}
        </div>

        {skills.length > 0 && (
          <div style={styles.skillsCard}>
            <h3 style={styles.sectionTitle}>🎯 Skills We Found in Your CV</h3>
            <div style={styles.skillsContainer}>
              {skills.map((skill, idx) => (
                <span key={idx} style={styles.skillTag}>{skill}</span>
              ))}
            </div>
          </div>
        )}

        {showJobs && jobs.length > 0 && (
          <div>
            <div style={styles.jobsHeader}>
              <h3 style={styles.sectionTitle}>💼 Top Matches For You ({jobs.length})</h3>
              <button 
                onClick={() => router.push(session ? "/dashboard" : "/login")}
                style={styles.viewAllBtn}
              >
                View All Matches →
              </button>
            </div>
            <div style={styles.jobsGrid}>
              {jobs.slice(0, 3).map((job, idx) => (
                <div key={idx} style={styles.jobCard}>
                  <div style={styles.jobHeader}>
                    <div>
                      <h4 style={styles.jobTitle}>{job.title}</h4>
                      <p style={styles.jobCompany}>{job.company}</p>
                    </div>
                    <div style={styles.matchBadge}>{job.matchPercentage}% Match</div>
                  </div>
                  <button
                    onClick={() => window.open(job.url, "_blank")}
                    style={styles.applyBtn}
                  >
                    View & Apply →
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {!session && (
          <div style={styles.ctaCard}>
            <h3 style={styles.ctaTitle}>Ready to find your dream job?</h3>
            <p style={styles.ctaDesc}>Create an account to save jobs, track applications, and get personalized recommendations</p>
            <button onClick={() => router.push("/signup")} style={styles.ctaBtn}>
              Get Started Free →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: "100vh",
    background: "#f9fafb",
  },
  navbar: {
    background: "white",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    position: "sticky" as const,
    top: 0,
    zIndex: 100,
  },
  navContent: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "16px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    fontSize: 28,
    fontWeight: "bold",
  },
  navLinks: {
    display: "flex",
    gap: 24,
    alignItems: "center",
  },
  navLink: {
    textDecoration: "none",
    color: "#4b5563",
    fontWeight: 500,
  },
  activeNavLink: {
    color: "#2563eb",
    borderBottom: "2px solid #2563eb",
    paddingBottom: 4,
  },
  loginBtn: {
    background: "#2563eb",
    color: "white",
    padding: "8px 20px",
    borderRadius: 8,
    textDecoration: "none",
    fontWeight: 500,
  },
  hero: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "80px 24px",
    textAlign: "center" as const,
  },
  heroContent: {
    maxWidth: 800,
    margin: "0 auto",
  },
  title: {
    fontSize: 48,
    color: "white",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: "rgba(255,255,255,0.9)",
  },
  mainContent: {
    maxWidth: 1200,
    margin: "-40px auto 0",
    padding: "0 24px 60px",
  },
  uploadCard: {
    background: "white",
    borderRadius: 16,
    padding: 40,
    textAlign: "center" as const,
    boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
    marginBottom: 30,
  },
  uploadIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  uploadTitle: {
    fontSize: 24,
    marginBottom: 8,
    color: "#1f2937",
  },
  uploadDesc: {
    color: "#6b7280",
    marginBottom: 24,
  },
  uploadArea: {
    display: "flex",
    gap: 16,
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap" as const,
  },
  fileLabel: {
    background: "#f3f4f6",
    padding: "12px 24px",
    borderRadius: 8,
    cursor: "pointer",
    color: "#374151",
    fontWeight: 500,
  },
  uploadBtn: {
    background: "#2563eb",
    color: "white",
    border: "none",
    padding: "12px 32px",
    borderRadius: 8,
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
  },
  uploadBtnDisabled: {
    background: "#9ca3af",
    cursor: "not-allowed",
  },
  loginPrompt: {
    marginTop: 20,
    color: "#6b7280",
    fontSize: 14,
  },
  skillsCard: {
    background: "white",
    borderRadius: 16,
    padding: 24,
    marginBottom: 30,
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  sectionTitle: {
    fontSize: 20,
    marginBottom: 16,
    color: "#1f2937",
  },
  skillsContainer: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap" as const,
  },
  skillTag: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    padding: "8px 20px",
    borderRadius: 25,
    fontSize: 14,
    fontWeight: 500,
  },
  jobsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    flexWrap: "wrap" as const,
  },
  viewAllBtn: {
    background: "none",
    border: "none",
    color: "#2563eb",
    cursor: "pointer",
    fontWeight: 500,
  },
  jobsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: 24,
  },
  jobCard: {
    background: "white",
    borderRadius: 12,
    padding: 20,
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  jobHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 4,
    color: "#1f2937",
  },
  jobCompany: {
    color: "#6b7280",
    fontSize: 14,
  },
  matchBadge: {
    background: "#dcfce7",
    color: "#166534",
    padding: "4px 12px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
  },
  applyBtn: {
    background: "#2563eb",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    width: "100%",
  },
  ctaCard: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    borderRadius: 16,
    padding: 48,
    textAlign: "center" as const,
    marginTop: 48,
  },
  ctaTitle: {
    fontSize: 28,
    color: "white",
    marginBottom: 12,
  },
  ctaDesc: {
    color: "rgba(255,255,255,0.9)",
    marginBottom: 24,
  },
  ctaBtn: {
    background: "white",
    color: "#667eea",
    border: "none",
    padding: "14px 32px",
    borderRadius: 10,
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
  },
};