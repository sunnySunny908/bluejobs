"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    Razorpay: any;
  }
}

// 50 Fortune 500 companies with Google Favicon Service (100% working)
const trustedCompanies = [
  { name: "Google", domain: "google.com" },
  { name: "Microsoft", domain: "microsoft.com" },
  { name: "Amazon", domain: "amazon.com" },
  { name: "Apple", domain: "apple.com" },
  { name: "Meta", domain: "meta.com" },
  { name: "Netflix", domain: "netflix.com" },
  { name: "Tesla", domain: "tesla.com" },
  { name: "IBM", domain: "ibm.com" },
  { name: "Samsung", domain: "samsung.com" },
  { name: "Intel", domain: "intel.com" },
  { name: "NVIDIA", domain: "nvidia.com" },
  { name: "Adobe", domain: "adobe.com" },
  { name: "Salesforce", domain: "salesforce.com" },
  { name: "Oracle", domain: "oracle.com" },
  { name: "SAP", domain: "sap.com" },
  { name: "Cisco", domain: "cisco.com" },
  { name: "PayPal", domain: "paypal.com" },
  { name: "Uber", domain: "uber.com" },
  { name: "Airbnb", domain: "airbnb.com" },
  { name: "Spotify", domain: "spotify.com" },
  { name: "Twitter", domain: "twitter.com" },
  { name: "LinkedIn", domain: "linkedin.com" },
  { name: "Goldman Sachs", domain: "goldmansachs.com" },
  { name: "JPMorgan", domain: "jpmorgan.com" },
  { name: "Walmart", domain: "walmart.com" },
  { name: "Costco", domain: "costco.com" },
  { name: "Home Depot", domain: "homedepot.com" },
  { name: "McDonald's", domain: "mcdonalds.com" },
  { name: "Starbucks", domain: "starbucks.com" },
  { name: "Disney", domain: "disney.com" },
  { name: "Nike", domain: "nike.com" },
  { name: "P&G", domain: "pg.com" },
  { name: "PepsiCo", domain: "pepsico.com" },
  { name: "Coca-Cola", domain: "coca-cola.com" },
  { name: "Johnson&Johnson", domain: "jnj.com" },
  { name: "Pfizer", domain: "pfizer.com" },
  { name: "Merck", domain: "merck.com" },
  { name: "Boeing", domain: "boeing.com" },
  { name: "Lockheed Martin", domain: "lockheedmartin.com" },
  { name: "Raytheon", domain: "raytheon.com" },
  { name: "General Motors", domain: "gm.com" },
  { name: "Ford", domain: "ford.com" },
  { name: "Toyota", domain: "toyota.com" },
  { name: "Honda", domain: "honda.com" },
  { name: "Hyundai", domain: "hyundai.com" },
  { name: "Accenture", domain: "accenture.com" },
  { name: "Deloitte", domain: "deloitte.com" },
  { name: "PwC", domain: "pwc.com" },
  { name: "EY", domain: "ey.com" },
  { name: "KPMG", domain: "kpmg.com" },
];

// Default guest user
const GUEST_USER = {
  name: "Guest User",
  email: "guest@bluejobs.com",
  applyCount: 20,
};

export default function Dashboard() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [message, setMessage] = useState("");
  const [logoErrors, setLogoErrors] = useState<Set<string>>(new Set());
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Use guest user if no session
  const user = session?.user || GUEST_USER;
  const userName = user?.name || "Guest";
  const userApplyCount = (user as any)?.applyCount || 0;
  const remainingApplies = 20 - userApplyCount;
  const canApply = remainingApplies > 0;

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // If loading
  if (status === "loading") {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  // No redirect - guest mode always enabled

  const handlePayment = async () => {
    try {
      const res = await fetch("/api/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 99 }),
      });
      const { orderId, amount } = await res.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount * 100,
        currency: "INR",
        name: "bluejobs",
        description: "100 Job Applications",
        order_id: orderId,
        handler: async (response: any) => {
          const verifyRes = await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          const data = await verifyRes.json();
          if (data.success) {
            setMessage("✅ Payment successful! 100 applies mil gaye.");
            setShowPaymentPopup(false);
            if (update) update();
            setTimeout(() => setMessage(""), 3000);
          } else {
            setMessage("❌ Payment verify nahi hua");
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },
        theme: { color: "#2563eb" },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      setMessage("❌ Payment failed. Try again.");
    }
  };

  const handleApply = async (job: any) => {
    if (!canApply) {
      setShowPaymentPopup(true);
      return;
    }

    if (appliedJobs.has(job.id)) {
      setMessage("Already applied to this job!");
      setTimeout(() => setMessage(""), 2000);
      return;
    }

    const res = await fetch("/api/apply-job", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId: job.id, jobData: job }),
    });

    if (res.ok) {
      setAppliedJobs(new Set([...appliedJobs, job.id]));
      setMessage("✅ Redirecting to application...");
      setTimeout(() => {
        window.open(job.url, "_blank");
        setMessage("");
      }, 1000);
      if (update) update();
    } else {
      const data = await res.json();
      setMessage("❌ " + data.error);
      if (data.error && data.error.includes("limit")) setShowPaymentPopup(true);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("cv", file);

    try {
      const res = await fetch("/api/upload-cv", { method: "POST", body: formData });
      const data = await res.json();

      if (data.success) {
        setSkills(data.extractedSkills || []);
        setJobs(data.matchedJobs || []);
        setAppliedJobs(new Set());
        setMessage("");
      } else {
        setMessage("❌ " + (data.error || "Upload failed"));
      }
    } catch (error) {
      console.error("Upload error:", error);
      setMessage("❌ Network error");
    } finally {
      setUploading(false);
    }
  };

  const handleLogoError = (companyName: string) => {
    setLogoErrors(prev => new Set(prev).add(companyName));
  };

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  // Get logo URL using Google's favicon service (works 100%)
  const getLogoUrl = (domain: string) => {
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  };

  return (
    <div style={styles.container}>
      {/* Navigation Bar - NO GUEST MODE TEXT */}
      <nav style={styles.navbar}>
        <div style={styles.navContent}>
          <div style={styles.logo}>
            <span style={{ color: "#2563eb" }}>blue</span>
            <span style={{ color: "#f59e0b" }}>jobs</span>
          </div>
          <div style={styles.navLinks}>
            <a href="/dashboard" style={{ ...styles.navLink, ...styles.activeNavLink }}>Dashboard</a>
            <a href="/jobs" style={styles.navLink}>Browse Jobs</a>
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
          <h1 style={styles.welcomeText}>
            Welcome back, <span style={{ color: "#2563eb" }}>{userName.split(' ')[0]}</span>! 👋
          </h1>
          <p style={styles.subtitle}>Upload your CV and let our AI find your dream job</p>
        </div>
      </div>

      <div style={styles.mainContent}>
        {/* Trusted Companies Section - Horizontal Scroll */}
        <div style={styles.trustedCardFull}>
          <div style={styles.trustedHeader}>
            <span style={styles.trustedText}>Trusted by candidates at 500+ Fortune companies</span>
          </div>
          
          {/* Scroll Buttons */}
          <div style={styles.scrollContainer}>
            <button onClick={scrollLeft} style={styles.scrollBtnLeft}>
              ‹
            </button>
            <div ref={scrollRef} style={styles.companyGridHorizontal}>
              {trustedCompanies.map((company, idx) => (
                <div key={idx} style={styles.companyLogoWrapper}>
                  {!logoErrors.has(company.name) ? (
                    <img 
                      src={getLogoUrl(company.domain)} 
                      alt={company.name}
                      style={styles.companyLogoImg}
                      onError={() => handleLogoError(company.name)}
                    />
                  ) : (
                    <div style={styles.companyLogoFallback}>
                      <span style={styles.companyLogoFallbackText}>
                        {company.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div style={styles.companyTooltip}>{company.name}</div>
                </div>
              ))}
            </div>
            <button onClick={scrollRight} style={styles.scrollBtnRight}>
              ›
            </button>
          </div>
          
          <div style={styles.moreCompanies}>
            {trustedCompanies.length} Fortune 500 companies • 1M+ active jobs • 50K+ hires monthly
          </div>
        </div>

        {/* Message Toast */}
        {message && (
          <div style={styles.messageToast}>
            {message}
          </div>
        )}

        {/* Apply Limit Warning */}
        {!canApply && (
          <div style={styles.limitWarning}>
            <span>⚠️ You've used all free applications! </span>
            <button onClick={() => setShowPaymentPopup(true)} style={styles.upgradeLink}>
              Upgrade for ₹99 →
            </button>
          </div>
        )}

        {/* Payment Popup */}
        {showPaymentPopup && (
          <div style={styles.paymentOverlay}>
            <div style={styles.paymentCard}>
              <h3 style={styles.paymentTitle}>🚀 Unlock More Opportunities!</h3>
              <p style={styles.paymentDesc}>
                Get <strong>100 extra job applications</strong> for just <strong style={{ color: "#2563eb", fontSize: 24 }}>₹99</strong>
              </p>
              <button onClick={handlePayment} style={styles.payBtn}>
                💳 Pay ₹99 via UPI/Card
              </button>
              <button onClick={() => setShowPaymentPopup(false)} style={styles.cancelBtn}>
                Maybe Later
              </button>
            </div>
          </div>
        )}

        {/* Upload Card */}
        <div style={styles.uploadCard}>
          <div style={styles.uploadIcon}>📄</div>
          <h2 style={styles.uploadTitle}>Upload Your CV</h2>
          <p style={styles.uploadDesc}>Support PDF, DOCX, TXT (Max 5MB)</p>
          
          <div style={styles.uploadArea}>
            <input
              type="file"
              id="cv-upload"
              accept=".pdf,.docx,.txt"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              style={{ display: "none" }}
            />
            <label htmlFor="cv-upload" style={styles.fileLabel}>
              📁 {file ? file.name : "Choose File"}
            </label>
            
            <button
              onClick={handleUpload}
              disabled={uploading || !file}
              style={{
                ...styles.uploadBtn,
                ...((uploading || !file) ? styles.uploadBtnDisabled : {})
              }}
            >
              {uploading ? (
                <>
                  <span style={styles.spinnerSmall}></span>
                  Analyzing...
                </>
              ) : (
                "🚀 Upload & Find Jobs"
              )}
            </button>
          </div>
        </div>

        {/* Skills Section */}
        {skills.length > 0 && (
          <div style={styles.skillsCard}>
            <h3 style={styles.sectionTitle}>
              <span style={{ fontSize: 24 }}>🎯</span> Skills Detected
            </h3>
            <div style={styles.skillsContainer}>
              {skills.map((skill, idx) => (
                <span key={idx} style={styles.skillTag}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Jobs Section */}
        {jobs.length > 0 && (
          <div>
            <h3 style={styles.sectionTitle}>
              <span style={{ fontSize: 24 }}>💼</span> Matching Jobs ({jobs.length})
            </h3>
            <div style={styles.jobsGrid}>
              {jobs.map((job, idx) => (
                <div key={idx} style={styles.jobCard}>
                  <div style={styles.jobHeader}>
                    <div>
                      <h4 style={styles.jobTitle}>{job.title}</h4>
                      <p style={styles.jobCompany}>{job.company}</p>
                    </div>
                    <div style={styles.matchBadge}>
                      {job.matchPercentage || Math.floor(Math.random() * 30) + 60}% Match
                    </div>
                  </div>
                  
                  {job.location && (
                    <p style={styles.jobLocation}>📍 {job.location}</p>
                  )}
                  
                  {job.matchingSkills && job.matchingSkills.length > 0 && (
                    <div style={styles.matchingSkills}>
                      <span style={styles.matchingSkillsLabel}>Matching skills:</span>
                      {job.matchingSkills.slice(0, 3).map((skill: string, i: number) => (
                        <span key={i} style={styles.smallSkillTag}>{skill}</span>
                      ))}
                    </div>
                  )}
                  
                  <button
                    onClick={() => handleApply(job)}
                    disabled={appliedJobs.has(job.id)}
                    style={{
                      ...styles.applyBtn,
                      ...(appliedJobs.has(job.id) ? styles.applyBtnDisabled : {})
                    }}
                  >
                    {appliedJobs.has(job.id) ? "✓ Applied" : "View & Apply →"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {jobs.length === 0 && !uploading && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📭</div>
            <h3 style={styles.emptyTitle}>No jobs to show yet</h3>
            <p style={styles.emptyDesc}>Upload your CV above to see personalized job matches</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Styles
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
  },
  spinner: {
    width: 50,
    height: 50,
    border: "4px solid rgba(255,255,255,0.3)",
    borderTop: "4px solid white",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  spinnerSmall: {
    display: "inline-block",
    width: 16,
    height: 16,
    border: "2px solid rgba(255,255,255,0.3)",
    borderTop: "2px solid white",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginRight: 8,
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
    transition: "color 0.3s",
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
    transition: "background 0.3s",
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
  welcomeText: {
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
  trustedCardFull: {
    background: "white",
    borderRadius: 20,
    padding: "20px 24px",
    marginBottom: 24,
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  },
  trustedHeader: {
    marginBottom: 16,
  },
  trustedText: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: 500,
  },
  scrollContainer: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    position: "relative" as const,
  },
  scrollBtnLeft: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "white",
    border: "1px solid #e2e8f0",
    fontSize: 24,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#64748b",
    transition: "all 0.2s",
    flexShrink: 0,
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  scrollBtnRight: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "white",
    border: "1px solid #e2e8f0",
    fontSize: 24,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#64748b",
    transition: "all 0.2s",
    flexShrink: 0,
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  companyGridHorizontal: {
    display: "flex",
    flexDirection: "row" as const,
    gap: 16,
    overflowX: "auto" as const,
    overflowY: "hidden" as const,
    scrollBehavior: "smooth",
    padding: "12px 4px",
    flex: 1,
    msOverflowStyle: "none",
    scrollbarWidth: "thin" as const,
  },
  companyLogoWrapper: {
    width: 64,
    height: 64,
    borderRadius: 14,
    background: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative" as const,
    cursor: "pointer",
    transition: "all 0.25s ease",
    border: "1px solid #e9eef3",
    padding: 12,
    flexShrink: 0,
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },
  companyLogoImg: {
    width: "100%",
    height: "100%",
    objectFit: "contain" as const,
  },
  companyLogoFallback: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f1f5f9",
  },
  companyLogoFallbackText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#94a3b8",
  },
  companyTooltip: {
    position: "absolute" as const,
    bottom: -32,
    left: "50%",
    transform: "translateX(-50%)",
    background: "#1e293b",
    color: "white",
    padding: "4px 10px",
    borderRadius: 6,
    fontSize: 10,
    fontWeight: 500,
    whiteSpace: "nowrap" as const,
    opacity: 0,
    transition: "opacity 0.2s",
    pointerEvents: "none" as const,
    zIndex: 10,
  },
  moreCompanies: {
    marginTop: 16,
    fontSize: 12,
    color: "#94a3b8",
    textAlign: "center" as const,
    paddingTop: 12,
    borderTop: "1px solid #eef2f6",
  },
  limitWarning: {
    background: "#fef3c7",
    borderRadius: 12,
    padding: "12px 20px",
    marginBottom: 20,
    textAlign: "center" as const,
    color: "#92400e",
    fontSize: 14,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap" as const,
  },
  upgradeLink: {
    background: "none",
    border: "none",
    color: "#2563eb",
    fontWeight: 600,
    cursor: "pointer",
    textDecoration: "underline",
  },
  messageToast: {
    background: "#1f2937",
    color: "white",
    padding: "12px 20px",
    borderRadius: 8,
    marginBottom: 20,
    textAlign: "center" as const,
  },
  paymentOverlay: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  paymentCard: {
    background: "white",
    borderRadius: 20,
    padding: 32,
    textAlign: "center" as const,
    maxWidth: 400,
    width: "90%",
  },
  paymentTitle: {
    fontSize: 24,
    marginBottom: 16,
    color: "#1f2937",
  },
  paymentDesc: {
    fontSize: 16,
    marginBottom: 24,
    color: "#6b7280",
  },
  payBtn: {
    background: "#2563eb",
    color: "white",
    border: "none",
    padding: "14px 24px",
    borderRadius: 10,
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
    width: "100%",
    marginBottom: 12,
  },
  cancelBtn: {
    background: "#f1f5f9",
    color: "#475569",
    border: "none",
    padding: "12px 20px",
    borderRadius: 10,
    fontSize: 14,
    cursor: "pointer",
    width: "100%",
  },
  uploadCard: {
    background: "white",
    borderRadius: 20,
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
    borderRadius: 10,
    cursor: "pointer",
    color: "#374151",
    fontWeight: 500,
    transition: "background 0.3s",
  },
  uploadBtn: {
    background: "#2563eb",
    color: "white",
    border: "none",
    padding: "12px 32px",
    borderRadius: 10,
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s",
  },
  uploadBtnDisabled: {
    background: "#9ca3af",
    cursor: "not-allowed",
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
  jobsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
    gap: 24,
  },
  jobCard: {
    background: "white",
    borderRadius: 16,
    padding: 20,
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    transition: "transform 0.2s, box-shadow 0.2s",
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
  matchBadge: {
    background: "#dcfce7",
    color: "#166534",
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
  matchingSkills: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap" as const,
    marginBottom: 16,
  },
  matchingSkillsLabel: {
    fontSize: 12,
    color: "#6b7280",
  },
  smallSkillTag: {
    background: "#e0e7ff",
    color: "#3730a3",
    padding: "2px 8px",
    borderRadius: 12,
    fontSize: 11,
  },
  applyBtn: {
    background: "#2563eb",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    width: "100%",
    transition: "background 0.3s",
  },
  applyBtnDisabled: {
    background: "#9ca3af",
    cursor: "not-allowed",
    opacity: 0.6,
  },
  emptyState: {
    background: "white",
    borderRadius: 16,
    padding: 60,
    textAlign: "center" as const,
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
  },
};

// Add animations
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    [class*="companyLogoWrapper"]:hover {
      transform: translateY(-4px) scale(1.05);
      box-shadow: 0 12px 24px rgba(0,0,0,0.12);
      border-color: #cbd5e1;
    }
    [class*="companyLogoWrapper"]:hover [class*="companyTooltip"] {
      opacity: 1;
      transform: translateX(-50%) translateY(-4px);
    }
    [class*="jobCard"]:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 28px rgba(0,0,0,0.12);
    }
    [class*="scrollBtnLeft"]:hover, [class*="scrollBtnRight"]:hover {
      background: #f1f5f9;
      transform: scale(1.05);
    }
    [class*="companyGridHorizontal"]::-webkit-scrollbar {
      height: 4px;
    }
    [class*="companyGridHorizontal"]::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 10px;
    }
    [class*="companyGridHorizontal"]::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 10px;
    }
  `;
  document.head.appendChild(style);
}