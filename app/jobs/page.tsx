"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function JobsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [jobs, setJobs] = useState([]);
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
      console.error("Error fetching jobs:", error);
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
            <a href="/dashboard" style={styles.navLink}>Dashboard</a>
            <a href="/jobs" style={{ ...styles.navLink, ...styles.activeNavLink }}>Browse Jobs</a>
            {session && (
              <button onClick={() => router.push("/api/auth/signout")} style={styles.logoutBtn}>
                Logout
              </button>
            )}
          </div>
        </div>
      </nav>

      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.title}>
            Browse <span style={{ color: "#f59e0b" }}>Thousands</span> of Jobs
          </h1>
          <p style={styles.subtitle}>
            Find your next career opportunity from top companies
          </p>
        </div>
      </div>

      <div style={styles.mainContent}>
        <div style={styles.searchCard}>
          <div style={styles.searchHeader}>
            <h2 style={styles.searchTitle}>🔍 Search Jobs</h2>
            <p style={styles.searchDesc}>Find jobs by title, skills, or location</p>
          </div>
          
          <div style={styles.searchArea}>
            <input
              type="text"
              placeholder="Job title or skill (e.g., React, Python)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
              onKeyDown={(e) => e.key === 'Enter' && fetchJobs()}
            />
            <input
              type="text"
              placeholder="Location (e.g., Mumbai, Bangalore)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={styles.locationInput}
              onKeyDown={(e) => e.key === 'Enter' && fetchJobs()}
            />
            <button onClick={fetchJobs} style={styles.searchBtn}>
              Search Jobs
            </button>
          </div>
        </div>

        <div style={styles.resultsHeader}>
          <h3 style={styles.resultsTitle}>
            {loading ? "Searching..." : `Found ${jobs.length} jobs`}
          </h3>
          {!loading && jobs.length > 0 && (
            <p style={styles.resultsSubtitle}>
              Showing results for "{searchTerm || "developer"}" in {location || "india"}
            </p>
          )}
        </div>

        {loading && (
          <div style={styles.loadingState}>
            <div style={styles.spinner}></div>
            <p>Fetching latest jobs...</p>
          </div>
        )}

        {!loading && jobs.length === 0 && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📭</div>
            <h3 style={styles.emptyTitle}>No jobs found</h3>
            <p style={styles.emptyDesc}>Try a different search term or location</p>
            <button onClick={() => {
              setSearchTerm("developer");
              setLocation("india");
              fetchJobs();
            }} style={styles.resetBtn}>
              Reset Search
            </button>
          </div>
        )}

        {!loading && jobs.length > 0 && (
          <div style={styles.jobsGrid}>
            {jobs.map((job: any, idx: number) => (
              <div key={idx} style={styles.jobCard}>
                <div style={styles.jobHeader}>
                  <div>
                    <h4 style={styles.jobTitle}>{job.title}</h4>
                    <p style={styles.jobCompany}>{job.company}</p>
                  </div>
                  <div style={styles.jobBadge}>
                    {job.salaryMin && job.salaryMax ? (
                      <span style={styles.salaryBadge}>
                        ₹{Math.round(job.salaryMin * 80).toLocaleString()} - {Math.round(job.salaryMax * 80).toLocaleString()}
                      </span>
                    ) : (
                      <span style={styles.fulltimeBadge}>Full Time</span>
                    )}
                  </div>
                </div>
                
                {job.location && (
                  <p style={styles.jobLocation}>📍 {job.location}</p>
                )}
                
                {job.description && (
                  <p style={styles.jobDescription}>
                    {job.description.substring(0, 150)}...
                  </p>
                )}
                
                <div style={styles.jobFooter}>
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.applyLink}
                  >
                    View & Apply →
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
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
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    position: "sticky" as const,
    top: 0,
    zIndex: 100,
    borderBottom: "1px solid #f1f5f9",
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
    fontSize: 26,
    fontWeight: "bold",
  },
  navLinks: {
    display: "flex",
    gap: 28,
    alignItems: "center",
  },
  navLink: {
    textDecoration: "none",
    color: "#64748b",
    fontWeight: 500,
    fontSize: 14,
    transition: "color 0.2s",
  },
  activeNavLink: {
    color: "#2563eb",
    borderBottom: "2px solid #2563eb",
    paddingBottom: 4,
  },
  logoutBtn: {
    background: "none",
    border: "none",
    color: "#ef4444",
    cursor: "pointer",
    fontWeight: 500,
    fontSize: 14,
    padding: "6px 14px",
    borderRadius: 6,
  },
  hero: {
    background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
    padding: "56px 24px 48px",
    textAlign: "center" as const,
    borderBottom: "4px solid #f59e0b",
  },
  heroContent: {
    maxWidth: 800,
    margin: "0 auto",
  },
  title: {
    fontSize: 44,
    color: "white",
    marginBottom: 12,
    fontWeight: 700,
  },
  subtitle: {
    fontSize: 18,
    color: "rgba(255,255,255,0.8)",
  },
  mainContent: {
    maxWidth: 1200,
    margin: "-32px auto 0",
    padding: "0 24px 60px",
  },
  searchCard: {
    background: "white",
    borderRadius: 16,
    padding: 32,
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    marginBottom: 32,
    border: "1px solid #f1f5f9",
  },
  searchHeader: {
    marginBottom: 20,
  },
  searchTitle: {
    fontSize: 20,
    fontWeight: 600,
    color: "#1f2937",
    marginBottom: 4,
  },
  searchDesc: {
    fontSize: 14,
    color: "#64748b",
  },
  searchArea: {
    display: "flex",
    gap: 16,
    flexWrap: "wrap" as const,
  },
  searchInput: {
  flex: 1,
  padding: "12px 16px",
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  fontSize: 14,
  outline: "none",
  minWidth: 180,
  transition: "border-color 0.2s",
  color: "#1f2937",        // ← ADD THIS (Dark text)
  backgroundColor: "#ffffff", // ← ADD THIS
  fontWeight: 500,          // ← ADD THIS (Optional)
},
  locationInput: {
  flex: 1,
  padding: "12px 16px",
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  fontSize: 14,
  outline: "none",
  minWidth: 180,
  transition: "border-color 0.2s",
  color: "#1f2937",        // ← ADD THIS (Dark text)
  backgroundColor: "#ffffff", // ← ADD THIS
  fontWeight: 500,          // ← ADD THIS (Optional)
},
  searchBtn: {
    background: "#2563eb",
    color: "white",
    border: "none",
    padding: "12px 32px",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.2s",
  },
  resultsHeader: {
    marginBottom: 24,
  },
  resultsTitle: {
    fontSize: 18,
    color: "#1f2937",
    marginBottom: 4,
    fontWeight: 600,
  },
  resultsSubtitle: {
    color: "#64748b",
    fontSize: 14,
  },
  loadingState: {
    textAlign: "center" as const,
    padding: 60,
    background: "white",
    borderRadius: 16,
    border: "1px solid #f1f5f9",
  },
  spinner: {
    width: 40,
    height: 40,
    border: "3px solid #e2e8f0",
    borderTop: "3px solid #2563eb",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto 16px",
  },
  emptyState: {
    textAlign: "center" as const,
    padding: 60,
    background: "white",
    borderRadius: 16,
    border: "1px solid #f1f5f9",
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    marginBottom: 8,
    color: "#1f2937",
  },
  emptyDesc: {
    color: "#64748b",
    marginBottom: 20,
  },
  resetBtn: {
    background: "#f1f5f9",
    color: "#475569",
    border: "none",
    padding: "10px 20px",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 14,
  },
  jobsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
    gap: 24,
  },
  jobCard: {
    background: "white",
    borderRadius: 16,
    padding: 20,
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    border: "1px solid #f1f5f9",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  jobHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  jobTitle: {
    fontSize: 17,
    fontWeight: 600,
    marginBottom: 4,
    color: "#1f2937",
  },
  jobCompany: {
    color: "#64748b",
    fontSize: 14,
  },
  jobBadge: {
    display: "flex",
    gap: 8,
  },
  salaryBadge: {
    background: "#dcfce7",
    color: "#166534",
    padding: "4px 12px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
  },
  fulltimeBadge: {
    background: "#dbeafe",
    color: "#1e40af",
    padding: "4px 12px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
  },
  jobLocation: {
    color: "#64748b",
    fontSize: 14,
    marginBottom: 12,
  },
  jobDescription: {
    color: "#475569",
    fontSize: 13,
    lineHeight: 1.6,
    marginBottom: 16,
  },
  jobFooter: {
    borderTop: "1px solid #f1f5f9",
    paddingTop: 12,
  },
  applyLink: {
    display: "block",
    textAlign: "center" as const,
    background: "#2563eb",
    color: "white",
    textDecoration: "none",
    fontWeight: 500,
    fontSize: 14,
    padding: "10px 20px",
    borderRadius: 8,
    transition: "background 0.2s",
  },
};

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    [class*="jobCard"]:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.08);
    }
    input:focus {
      border-color: #2563eb !important;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }
  `;
  document.head.appendChild(style);
}