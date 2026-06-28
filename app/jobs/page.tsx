"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function JobsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("developer");
  const [location, setLocation] = useState("india");

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/jobs?title=${searchTerm}&location=${location}`);
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
      {/* Navigation Bar - NO LOGIN BUTTON */}
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

      {/* Hero Section */}
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
        {/* Search Card */}
        <div style={styles.searchCard}>
          <div style={styles.searchIcon}>🔍</div>
          <h2 style={styles.searchTitle}>Search Jobs</h2>
          <p style={styles.searchDesc}>Find jobs by title, skills, or location</p>
          
          <div style={styles.searchArea}>
            <input
              type="text"
              placeholder="Job title or skill (e.g., AML, React, Python)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
              onKeyDown={(e) => e.key === 'Enter' && fetchJobs()}
            />
            <input
              type="text"
              placeholder="Location (e.g., Mumbai, Bangalore, India)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={styles.locationInput}
              onKeyDown={(e) => e.key === 'Enter' && fetchJobs()}
            />
            <button onClick={fetchJobs} style={styles.searchBtn}>
              🔍 Search Jobs
            </button>
          </div>
        </div>

        {/* Results Header */}
        <div style={styles.resultsHeader}>
          <h3 style={styles.resultsTitle}>
            {loading ? "Searching..." : `Found ${jobs.length} jobs`}
          </h3>
          {!loading && jobs.length > 0 && (
            <p style={styles.resultsSubtitle}>Showing results for "{searchTerm}" in {location}</p>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div style={styles.loadingState}>
            <div style={styles.spinner}></div>
            <p>Fetching latest jobs...</p>
          </div>
        )}

        {/* Jobs Grid */}
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
  logoutBtn: {
    background: "none",
    border: "none",
    color: "#ef4444",
    cursor: "pointer",
    fontWeight: 500,
    padding: "8px 16px",
    borderRadius: 8,
  },
  hero: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "60px 24px",
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
  searchCard: {
    background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
    borderRadius: 24,
    padding: 40,
    textAlign: "center" as const,
    boxShadow: "0 20px 40px -12px rgba(0,0,0,0.15)",
    marginBottom: 40,
    border: "1px solid rgba(102, 126, 234, 0.1)",
  },
  searchIcon: {
    fontSize: 56,
    marginBottom: 16,
  },
  searchTitle: {
    fontSize: 24,
    marginBottom: 8,
    color: "#1f2937",
  },
  searchDesc: {
    color: "#6b7280",
    marginBottom: 32,
    fontSize: 16,
  },
  searchArea: {
    display: "flex",
    gap: 16,
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap" as const,
    marginBottom: 24,
  },
  searchInput: {
    flex: 1,
    padding: "12px 16px",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    fontSize: 14,
    outline: "none",
    minWidth: 200,
  },
  locationInput: {
    flex: 1,
    padding: "12px 16px",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    fontSize: 14,
    outline: "none",
    minWidth: 200,
  },
  searchBtn: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    padding: "14px 32px",
    borderRadius: 12,
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  resultsHeader: {
    marginBottom: 24,
  },
  resultsTitle: {
    fontSize: 20,
    color: "#1f2937",
    marginBottom: 4,
  },
  resultsSubtitle: {
    color: "#6b7280",
    fontSize: 14,
  },
  loadingState: {
    textAlign: "center" as const,
    padding: 60,
    background: "white",
    borderRadius: 16,
  },
  spinner: {
    width: 50,
    height: 50,
    border: "4px solid #e2e8f0",
    borderTop: "4px solid #2563eb",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto 16px",
  },
  emptyState: {
    textAlign: "center" as const,
    padding: 60,
    background: "white",
    borderRadius: 16,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    marginBottom: 8,
    color: "#1f2937",
  },
  emptyDesc: {
    color: "#6b7280",
    marginBottom: 20,
  },
  resetBtn: {
    background: "#6b7280",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: 8,
    cursor: "pointer",
  },
  jobsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
    gap: 24,
  },
  jobCard: {
    background: "white",
    borderRadius: 12,
    padding: 20,
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    transition: "transform 0.3s, box-shadow 0.3s",
  },
  jobHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: 600,
    marginBottom: 4,
    color: "#1f2937",
  },
  jobCompany: {
    color: "#6b7280",
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
    color: "#6b7280",
    fontSize: 14,
    marginBottom: 12,
  },
  jobDescription: {
    color: "#4b5563",
    fontSize: 13,
    lineHeight: 1.5,
    marginBottom: 16,
  },
  jobFooter: {
    borderTop: "1px solid #e2e8f0",
    paddingTop: 12,
    marginTop: 8,
  },
  applyLink: {
    display: "block",
    textAlign: "center" as const,
    background: "#2563eb",
    color: "white",
    textDecoration: "none",
    fontWeight: 600,
    fontSize: 14,
    padding: "10px 20px",
    borderRadius: 8,
    transition: "all 0.3s ease",
    cursor: "pointer",
    border: "none",
  },
};

// Add animation
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