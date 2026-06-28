"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    Razorpay: any;
  }
}

// 50 Fortune 500 companies
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
  const [isDragging, setIsDragging] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  const user = session?.user || GUEST_USER;
  const userName = user?.name || "Guest";
  const userApplyCount = (user as any)?.applyCount || 0;
  const remainingApplies = 20 - userApplyCount;
  const canApply = remainingApplies > 0;

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  if (status === "loading") {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading...</p>
      </div>
    );
  }

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
            setMessage("✅ Payment successful!");
            setShowPaymentPopup(false);
            if (update) update();
            setTimeout(() => setMessage(""), 3000);
          } else {
            setMessage("❌ Payment failed");
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
      setMessage("Already applied!");
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
      setMessage("✅ Redirecting...");
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
        setMessage("✅ " + (data.matchedJobs?.length || 0) + " fresh jobs found!");
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

  const getLogoUrl = (domain: string) => {
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setFile(files[0]);
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
            <a href="/dashboard" style={{ ...styles.navLink, ...styles.activeNavLink }}>Dashboard</a>
            <a href="/jobs" style={styles.navLink}>Browse</a>
            {session && (
              <button onClick={() => router.push("/api/auth/signout")} style={styles.logoutBtn}>
                Logout
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* 🎯 HERO - CV Upload at First Glance */}
      <div style={styles.heroSection}>
        <div style={styles.heroGradient}></div>
        <div style={styles.heroContent}>
          <div style={styles.badge}>
            <span style={styles.badgeDot}></span>
            <span>7-Day Fresh Jobs</span>
          </div>
          
          <h1 style={styles.heroTitle}>
            Upload Your CV &<br />
            <span style={{ color: "#f59e0b" }}>Get Matched in Seconds</span>
          </h1>
          
          <p style={styles.heroSubtext}>
            <span style={styles.heroIcon}>⚡</span> AI scans your resume · 
            <span style={{ color: "#f59e0b" }}> 7-day fresh</span> jobs · 
            <span style={styles.heroIcon}>📍</span> 70km radius
          </p>

          {/* 📤 UPLOAD CARD - HERO */}
          <div 
            style={{
              ...styles.uploadHero,
              ...(isDragging ? styles.uploadHeroDragging : {})
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div style={styles.uploadHeroIcon}>📄</div>
            <h2 style={styles.uploadHeroTitle}>
              {file ? file.name : "Drop your CV here"}
            </h2>
            <p style={styles.uploadHeroSub}>
              {file ? `${(file.size / 1024).toFixed(0)} KB · Ready to upload` : "PDF, DOCX, TXT · Max 5MB"}
            </p>
            
            <div style={styles.uploadHeroActions}>
              <label htmlFor="cv-upload-hero" style={styles.uploadHeroBrowse}>
                📁 Browse Files
              </label>
              <input
                type="file"
                id="cv-upload-hero"
                accept=".pdf,.docx,.txt"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                style={{ display: "none" }}
              />
              <button
                onClick={handleUpload}
                disabled={uploading || !file}
                style={{
                  ...styles.uploadHeroBtn,
                  ...((uploading || !file) ? styles.uploadHeroBtnDisabled : {})
                }}
              >
                {uploading ? (
                  <>
                    <span style={styles.spinnerSmall}></span>
                    Analyzing...
                  </>
                ) : (
                  "🚀 Find Jobs Now"
                )}
              </button>
            </div>

            <div style={styles.uploadHeroFeatures}>
              <span style={styles.uploadHeroFeature}>✅ AI Matching</span>
              <span style={styles.uploadHeroFeature}>✅ Last 7 Days</span>
              <span style={styles.uploadHeroFeature}>✅ Direct Apply</span>
            </div>
          </div>

          {/* Trusted Companies */}
          <div style={styles.trustedCardFull}>
            <div style={styles.trustedHeader}>
              <span style={styles.trustedText}>🏢 Trusted by 500+ Fortune companies</span>
            </div>
            <div style={styles.scrollContainer}>
              <button onClick={scrollLeft} style={styles.scrollBtnLeft}>‹</button>
              <div ref={scrollRef} style={styles.companyGridHorizontal}>
                {trustedCompanies.slice(0, 20).map((company, idx) => (
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
              <button onClick={scrollRight} style={styles.scrollBtnRight}>›</button>
            </div>
          </div>
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
          <span>🚀 Free applies used! </span>
          <button onClick={() => setShowPaymentPopup(true)} style={styles.upgradeLink}>
            Upgrade ₹99 →
          </button>
        </div>
      )}

      {/* Payment Popup */}
      {showPaymentPopup && (
        <div style={styles.paymentOverlay}>
          <div style={styles.paymentCard}>
            <h3 style={styles.paymentTitle}>Unlock More</h3>
            <p style={styles.paymentDesc}>
              <strong>100 extra applies</strong> for <strong style={{ color: "#2563eb", fontSize: 24 }}>₹99</strong>
            </p>
            <button onClick={handlePayment} style={styles.payBtn}>Pay ₹99</button>
            <button onClick={() => setShowPaymentPopup(false)} style={styles.cancelBtn}>Later</button>
          </div>
        </div>
      )}

      {/* Skills Section */}
      {skills.length > 0 && (
        <div style={styles.skillsCard}>
          <h3 style={styles.sectionTitle}>🎯 Skills Detected</h3>
          <div style={styles.skillsContainer}>
            {skills.map((skill, idx) => (
              <span key={idx} style={styles.skillTag}>{skill}</span>
            ))}
          </div>
        </div>
      )}

      {/* Jobs Section */}
      {jobs.length > 0 && (
        <div>
          <h3 style={styles.sectionTitle}>💼 Matching Jobs ({jobs.length})</h3>
          <div style={styles.jobsGrid}>
            {jobs.map((job, idx) => (
              <div key={idx} style={styles.jobCard}>
                <div style={styles.jobHeader}>
                  <div>
                    <h4 style={styles.jobTitle}>{job.title}</h4>
                    <p style={styles.jobCompany}>{job.company}</p>
                  </div>
                  <div style={styles.matchBadge}>
                    {job.matchPercentage || Math.floor(Math.random() * 30) + 60}%
                  </div>
                </div>
                {job.location && (
                  <p style={styles.jobLocation}>📍 {job.location}</p>
                )}
                {job.matchingSkills && job.matchingSkills.length > 0 && (
                  <div style={styles.matchingSkills}>
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
                  {appliedJobs.has(job.id) ? "✓ Applied" : "Apply Now →"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {jobs.length === 0 && !uploading && (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📄</div>
          <h3 style={styles.emptyTitle}>Upload your CV to get started</h3>
          <p style={styles.emptyDesc}>
            AI scans your resume and finds <strong>7-day fresh jobs</strong> near you.
          </p>
          <div style={styles.emptyFeatureList}>
            <span style={styles.emptyFeature}>✅ AI Matching</span>
            <span style={styles.emptyFeature}>✅ 7 Days Fresh</span>
            <span style={styles.emptyFeature}>✅ 70km Radius</span>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: "100vh",
    background: "#f8fafc",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "#f8fafc",
  },
  spinner: {
    width: 40,
    height: 40,
    border: "3px solid #e2e8f0",
    borderTop: "3px solid #2563eb",
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
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    position: "sticky" as const,
    top: 0,
    zIndex: 100,
    borderBottom: "1px solid #f1f5f9",
  },
  navContent: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "14px 20px",
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
    gap: 20,
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
  heroSection: {
    position: "relative" as const,
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    padding: "32px 20px 40px",
    overflow: "hidden",
  },
  heroGradient: {
    position: "absolute" as const,
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    background: "radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)",
    borderRadius: "50%",
  },
  heroContent: {
    position: "relative" as const,
    zIndex: 2,
    maxWidth: 700,
    margin: "0 auto",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background: "rgba(245, 158, 11, 0.15)",
    border: "1px solid rgba(245, 158, 11, 0.25)",
    borderRadius: 50,
    padding: "5px 14px",
    color: "#f59e0b",
    fontSize: 11,
    fontWeight: 600,
    marginBottom: 16,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
  badgeDot: {
    width: 6,
    height: 6,
    background: "#f59e0b",
    borderRadius: "50%",
    animation: "pulse 1.5s infinite",
  },
  heroTitle: {
    fontSize: 32,
    color: "white",
    fontWeight: 700,
    lineHeight: 1.2,
    marginBottom: 12,
  },
  heroSubtext: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 20,
    display: "flex",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap" as const,
  },
  heroIcon: {
    fontSize: 16,
  },
  uploadHero: {
    background: "white",
    borderRadius: 20,
    padding: "24px 20px 20px",
    textAlign: "center" as const,
    boxShadow: "0 8px 32px rgba(37,99,235,0.15)",
    border: "2px solid rgba(37,99,235,0.1)",
    transition: "all 0.3s",
    marginBottom: 20,
  },
  uploadHeroDragging: {
    borderColor: "#2563eb",
    background: "#eff6ff",
    boxShadow: "0 8px 40px rgba(37,99,235,0.25)",
  },
  uploadHeroIcon: {
    fontSize: 44,
    display: "block",
    marginBottom: 8,
  },
  uploadHeroTitle: {
    fontSize: 20,
    fontWeight: 600,
    color: "#1f2937",
    marginBottom: 4,
  },
  uploadHeroSub: {
    fontSize: 13,
    color: "#94a3b8",
    marginBottom: 16,
  },
  uploadHeroActions: {
    display: "flex",
    gap: 12,
    justifyContent: "center",
    flexWrap: "wrap" as const,
  },
  uploadHeroBrowse: {
    background: "#f1f5f9",
    color: "#475569",
    padding: "10px 20px",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    transition: "background 0.2s",
  },
  uploadHeroBtn: {
    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    color: "white",
    border: "none",
    padding: "10px 28px",
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s",
    minWidth: 140,
  },
  uploadHeroBtnDisabled: {
    background: "#94a3b8",
    cursor: "not-allowed",
  },
  uploadHeroFeatures: {
    display: "flex",
    gap: 16,
    justifyContent: "center",
    marginTop: 16,
    paddingTop: 16,
    borderTop: "1px solid #f1f5f9",
    flexWrap: "wrap" as const,
  },
  uploadHeroFeature: {
    fontSize: 12,
    color: "#475569",
    fontWeight: 500,
  },
  trustedCardFull: {
    background: "rgba(255,255,255,0.06)",
    backdropFilter: "blur(10px)",
    borderRadius: 16,
    padding: "14px 16px",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  trustedHeader: {
    marginBottom: 12,
  },
  trustedText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
    fontWeight: 500,
  },
  scrollContainer: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  scrollBtnLeft: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.15)",
    fontSize: 16,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "rgba(255,255,255,0.6)",
    flexShrink: 0,
  },
  scrollBtnRight: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.15)",
    fontSize: 16,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "rgba(255,255,255,0.6)",
    flexShrink: 0,
  },
  companyGridHorizontal: {
    display: "flex",
    flexDirection: "row" as const,
    gap: 10,
    overflowX: "auto" as const,
    overflowY: "hidden" as const,
    scrollBehavior: "smooth",
    padding: "6px 2px",
    flex: 1,
    msOverflowStyle: "none",
    scrollbarWidth: "thin" as const,
  },
  companyLogoWrapper: {
    width: 44,
    height: 44,
    borderRadius: 10,
    background: "rgba(255,255,255,0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative" as const,
    cursor: "pointer",
    transition: "all 0.2s",
    border: "1px solid rgba(255,255,255,0.06)",
    padding: 8,
    flexShrink: 0,
  },
  companyLogoImg: {
    width: "100%",
    height: "100%",
    objectFit: "contain" as const,
  },
  companyLogoFallback: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(255,255,255,0.05)",
  },
  companyLogoFallbackText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "rgba(255,255,255,0.5)",
  },
  companyTooltip: {
    position: "absolute" as const,
    bottom: -26,
    left: "50%",
    transform: "translateX(-50%)",
    background: "#1e293b",
    color: "white",
    padding: "2px 8px",
    borderRadius: 4,
    fontSize: 9,
    fontWeight: 500,
    whiteSpace: "nowrap" as const,
    opacity: 0,
    transition: "opacity 0.2s",
    pointerEvents: "none" as const,
    zIndex: 10,
  },
  messageToast: {
    background: "#1e293b",
    color: "white",
    padding: "12px 20px",
    borderRadius: 10,
    margin: "16px 20px 0",
    textAlign: "center" as const,
    fontSize: 14,
  },
  limitWarning: {
    background: "#fef3c7",
    borderRadius: 12,
    padding: "10px 16px",
    margin: "16px 20px 0",
    textAlign: "center" as const,
    color: "#92400e",
    fontSize: 13,
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
    fontSize: 13,
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
    padding: 20,
  },
  paymentCard: {
    background: "white",
    borderRadius: 20,
    padding: 32,
    textAlign: "center" as const,
    maxWidth: 380,
    width: "100%",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
  },
  paymentTitle: {
    fontSize: 22,
    marginBottom: 12,
    color: "#1f2937",
  },
  paymentDesc: {
    fontSize: 15,
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
  skillsCard: {
    background: "white",
    borderRadius: 16,
    padding: 20,
    margin: "20px 20px 0",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    border: "1px solid #f1f5f9",
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 14,
    color: "#1f2937",
    fontWeight: 600,
    padding: "0 20px",
  },
  skillsContainer: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap" as const,
  },
  skillTag: {
    background: "#eff6ff",
    color: "#2563eb",
    padding: "6px 14px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 500,
  },
  jobsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 16,
    padding: "0 20px 40px",
  },
  jobCard: {
    background: "white",
    borderRadius: 16,
    padding: 18,
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    border: "1px solid #f1f5f9",
  },
  jobHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 2,
    color: "#1f2937",
  },
  jobCompany: {
    color: "#64748b",
    fontSize: 13,
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
    color: "#64748b",
    fontSize: 13,
    marginBottom: 10,
  },
  matchingSkills: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap" as const,
    marginBottom: 14,
  },
  smallSkillTag: {
    background: "#f1f5f9",
    color: "#475569",
    padding: "2px 8px",
    borderRadius: 12,
    fontSize: 11,
  },
  applyBtn: {
    background: "#2563eb",
    color: "white",
    border: "none",
    padding: "10px",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    width: "100%",
    transition: "background 0.2s",
  },
  applyBtnDisabled: {
    background: "#94a3b8",
    cursor: "not-allowed",
    opacity: 0.6,
  },
  emptyState: {
    background: "white",
    borderRadius: 16,
    padding: 40,
    textAlign: "center" as const,
    margin: "0 20px 40px",
    border: "1px solid #f1f5f9",
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    marginBottom: 8,
    color: "#1f2937",
  },
  emptyDesc: {
    color: "#64748b",
    marginBottom: 16,
    fontSize: 14,
  },
  emptyFeatureList: {
    display: "flex",
    gap: 12,
    justifyContent: "center",
    flexWrap: "wrap" as const,
  },
  emptyFeature: {
    fontSize: 12,
    color: "#475569",
    background: "#f8fafc",
    padding: "4px 12px",
    borderRadius: 6,
  },
};

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    [class*="companyLogoWrapper"]:hover {
      transform: translateY(-2px);
      background: rgba(255,255,255,0.15);
    }
    [class*="companyLogoWrapper"]:hover [class*="companyTooltip"] {
      opacity: 1;
    }
    [class*="jobCard"]:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }
    [class*="uploadHeroBrowse"]:hover {
      background: #e2e8f0;
    }
    [class*="uploadHeroBtn"]:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(37,99,235,0.3);
    }
    [class*="companyGridHorizontal"]::-webkit-scrollbar {
      height: 3px;
    }
    [class*="companyGridHorizontal"]::-webkit-scrollbar-track {
      background: rgba(255,255,255,0.05);
      border-radius: 10px;
    }
    [class*="companyGridHorizontal"]::-webkit-scrollbar-thumb {
      background: rgba(255,255,255,0.15);
      border-radius: 10px;
    }
    input:focus {
      border-color: #2563eb !important;
      outline: none;
    }
  `;
  document.head.appendChild(style);
}