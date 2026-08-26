"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function JobsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/jobs?title=${searchTerm || "developer"}&location=${location || "india"}`);
      const data = await res.json();
      setJobs(data.jobs || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  return (
    <div style={styles.container}>
      <nav style={styles.navbar}>
        <div style={styles.navContent}>
          <div style={styles.logo}>
            <span style={{ color: "#2563eb" }}>blue</span>
            <span style={{ color: "#f59e0b" }}>jobs</span>
          </div>
          <div style={styles.navLinks}>
            <a href="/" style={styles.navLink}>Home</a>
            <a href="/jobs" style={{ ...styles.navLink, ...styles.activeNavLink }}>Browse Jobs</a>
            {session ? (
              <a href="/dashboard" style={styles.loginBtn}>Dashboard</a>
            ) : (
              <a href="/login" style={styles.loginBtn}>Login</a>
            )}
          </div>
        </div>
      </nav>

      <div style={styles.hero}>
        <h1 style={styles.title}>Browse <span style={{ color: "#f59e0b" }}>Thousands</span> of Jobs</h1>
        <p style={styles.subtitle}>Find your next career opportunity from top companies</p>
      </div>

      <div style={styles.mainContent}>
        <div style={styles.searchCard}>
          <div style={styles.searchArea}>
            <input
              type="text"
              placeholder="Job title or skill"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
              onKeyDown={(e) => e.key === "Enter" && fetchJobs()}
            />
            <input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={styles.locationInput}
              onKeyDown={(e) => e.key === "Enter" && fetchJobs()}
            />
            <button onClick={fetchJobs} style={styles.searchBtn}>Search</button>
          </div>
        </div>

        {loading && (
          <div style={styles.loadingState}>
            <div style={styles.spinner}></div>
            <p>Loading jobs...</p>
          </div>
        )}

        {!loading && jobs.length === 0 && (
          <div style={styles.emptyState}>
            <h3>No jobs found</h3>
            <p>Try a different search term</p>
          </div>
        )}

        {!loading && jobs.length > 0 && (
          <div style={styles.jobsGrid}>
            {jobs.map((job: any, idx: number) => (
              <div key={idx} style={styles.jobCard}>
                <h4 style={styles.jobTitle}>{job.title}</h4>
                <p style={styles.jobCompany}>{job.company}</p>
                {job.location && (
                  <p style={styles.jobLocation}>📍 {job.location}</p>
                )}
                <a href={job.url} target="_blank" rel="noopener" style={styles.applyLink}>
                  View & Apply →
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer style={styles.footer}>
        <p style={styles.footerText}>© 2024 bluejobs — AI-powered job matching</p>
      </footer>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: "100vh",
    background: "#f8fafc",
  },
  navbar: {
    background: "white",
    padding: "16px 24px",
    borderBottom: "1px solid #e2e8f0",
  },
  navContent: {
    maxWidth: 1200,
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    fontSize: 24,
    fontWeight: "bold",
  },
  navLinks: {
    display: "flex",
    gap: 24,
    alignItems: "center",
  },
  navLink: {
    textDecoration: "none",
    color: "#64748b",
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
    padding: "60px 24px",
    textAlign: "center" as const,
  },
  title: {
    fontSize: 36,
    color: "white",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "rgba(255,255,255,0.9)",
  },
  mainContent: {
    maxWidth: 1200,
    margin: "-30px auto 0",
    padding: "0 24px 40px",
  },
  searchCard: {
    background: "white",
    borderRadius: 12,
    padding: 24,
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
    marginBottom: 30,
  },
  searchArea: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap" as const,
  },
  searchInput: {
    flex: 2,
    padding: "12px 16px",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    fontSize: 14,
    minWidth: 180,
  },
  locationInput: {
    flex: 1,
    padding: "12px 16px",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    fontSize: 14,
    minWidth: 150,
  },
  searchBtn: {
    background: "#2563eb",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: 8,
    fontWeight: 600,
    cursor: "pointer",
  },
  loadingState: {
    textAlign: "center" as const,
    padding: 40,
  },
  spinner: {
    width: 40,
    height: 40,
    border: "4px solid #e2e8f0",
    borderTop: "4px solid #2563eb",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto 16px",
  },
  emptyState: {
    textAlign: "center" as const,
    padding: 40,
    background: "white",
    borderRadius: 12,
  },
  jobsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: 20,
  },
  jobCard: {
    background: "white",
    borderRadius: 12,
    padding: 20,
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 4,
    color: "#1f2937",
  },
  jobCompany: {
    color: "#64748b",
    fontSize: 14,
    marginBottom: 8,
  },
  jobLocation: {
    color: "#64748b",
    fontSize: 13,
    marginBottom: 12,
  },
  applyLink: {
    display: "inline-block",
    background: "#2563eb",
    color: "white",
    padding: "8px 16px",
    borderRadius: 6,
    textDecoration: "none",
    fontSize: 14,
    fontWeight: 500,
  },
  footer: {
    textAlign: "center" as const,
    padding: "20px 24px",
    borderTop: "1px solid #e2e8f0",
    background: "white",
  },
  footerText: {
    color: "#94a3b8",
    fontSize: 12,
  },
};

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}