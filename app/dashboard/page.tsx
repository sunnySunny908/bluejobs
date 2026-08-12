"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    Razorpay: any;
  }
}

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
  const [userLocation, setUserLocation] = useState<string>("");
  const [locationPermission, setLocationPermission] = useState<boolean>(false);
  
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

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLocationPermission(true);
          
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`,
              { headers: { 'User-Agent': 'bluejobs/1.0' } }
            );
            
            if (response.ok) {
              const data = await response.json();
              let city = "";
              if (data.address) {
                city = data.address.city || 
                       data.address.town || 
                       data.address.village || 
                       data.address.state_district ||
                       data.address.state ||
                       "";
              }
              if (city) {
                setUserLocation(city);
                return;
              }
            }
            
            const fallbackRes = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            if (fallbackRes.ok) {
              const data = await fallbackRes.json();
              const city = data.city || data.principalSubdivision || "India";
              setUserLocation(city);
              return;
            }
            
            setUserLocation("India");
          } catch (error) {
            console.error("Geocoding error:", error);
            setUserLocation("India");
          }
        },
        (error) => {
          console.log("Location permission denied:", error.message);
          setLocationPermission(false);
          setUserLocation("India");
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      setUserLocation("India");
    }
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
            setMessage("Payment successful!");
            setShowPaymentPopup(false);
            if (update) update();
            setTimeout(() => setMessage(""), 3000);
          } else {
            setMessage("Payment failed");
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
      setMessage("Payment failed. Try again.");
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
      setMessage("Redirecting...");
      setTimeout(() => {
        window.open(job.url, "_blank");
        setMessage("");
      }, 1000);
      if (update) update();
    } else {
      const data = await res.json();
      setMessage(data.error);
      if (data.error && data.error.includes("limit")) setShowPaymentPopup(true);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("cv", file);
    formData.append("location", userLocation || "India");

    try {
      const res = await fetch("/api/upload-cv", { 
        method: "POST", 
        body: formData 
      });
      const data = await res.json();

      if (data.success === false && data.isTechCV === false) {
        setMessage(data.message || "Please upload a Tech/IT CV");
        setSkills([]);
        setJobs([]);
        setAppliedJobs(new Set());
        setUploading(false);
        return;
      }

      if (data.success) {
        setSkills(data.matchedKeywords || []);
        setJobs(data.matchedJobs || []);
        setAppliedJobs(new Set());
        setMessage(data.message || `${data.matchedJobs?.length || 0} tech jobs found!`);
      } else {
        setMessage(data.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setMessage("Network error");
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
      <div style={styles.bgContainer}>
        <div style={styles.bgGradient}></div>
        <div style={styles.floatingLogos}>
          {trustedCompanies.slice(0, 30).map((company, idx) => (
            <div
              key={idx}
              style={{
                ...styles.floatingLogo,
                animationDelay: `${Math.random() * 10}s`,
                left: `${Math.random() * 90 + 5}%`,
                top: `${Math.random() * 90 + 5}%`,
                transform: `scale(${0.4 + Math.random() * 0.6})`,
                opacity: 0.08 + Math.random() * 0.12,
              }}
            >
              <img
                src={getLogoUrl(company.domain)}
                alt={company.name}
                style={styles.floatingLogoImg}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          ))}
        </div>
      </div>

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

      <div style={styles.heroSection}>
        <div style={styles.heroContent}>
          <div style={styles.badge}>
            <span style={styles.badgeDot}></span>
            <span>7-Day Fresh Jobs</span>
          </div>
          
          <h1 style={styles.heroTitle}>
            Upload Your CV &<br />
            <span style={styles.heroHighlight}>Get Matched in Seconds</span>
          </h1>
          
          <p style={styles.heroSubtext}>
            ⚡ AI scans your resume · <span style={{ color: "#f59e0b" }}>7-day fresh</span> jobs · 📍 70km radius
          </p>

          {locationPermission && userLocation && userLocation !== "India" ? (
            <div style={styles.locationBadge}>📍 {userLocation} · 70km radius</div>
          ) : (
            <button 
              onClick={() => {
                if ("geolocation" in navigator) {
                  navigator.geolocation.getCurrentPosition(
                    () => {},
                    () => {},
                    { enableHighAccuracy: true }
                  );
                }
              }} 
              style={styles.locationRequest}
            >
              📍 Allow location for precise 70km radius
            </button>
          )}

          <div 
            style={{
              ...styles.uploadHero,
              ...(isDragging ? styles.uploadHeroDragging : {})
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div style={styles.uploadIcon}>📄</div>
            <h2 style={styles.uploadTitle}>
              {file ? file.name : "Drop your CV here"}
            </h2>
            <p style={styles.uploadSub}>
              {file ? `${(file.size / 1024).toFixed(0)} KB · Ready to upload` : "PDF, DOCX, TXT · Max 5MB"}
            </p>
            
            <div style={styles.uploadActions}>
              <label htmlFor="cv-upload-hero" style={styles.uploadBrowse}>
                Browse Files
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
                  "Find Jobs Now"
                )}
              </button>
            </div>

            <div style={styles.features}>
              <div style={styles.featureItem}>
                <span style={styles.featureIcon}>⚡</span>
                <span style={styles.featureLabel}>AI Matching</span>
              </div>
              <div style={styles.featureDivider}></div>
              <div style={styles.featureItem}>
                <span style={styles.featureIcon}>📅</span>
                <span style={styles.featureLabel}>Last 7 Days</span>
              </div>
              <div style={styles.featureDivider}></div>
              <div style={styles.featureItem}>
                <span style={styles.featureIcon}>📍</span>
                <span style={styles.featureLabel}>70km Radius</span>
              </div>
            </div>
          </div>

          <div style={styles.trustedCard}>
            <p style={styles.trustedText}>Trusted by 500+ Fortune 500 companies</p>
            <div style={styles.scrollContainer}>
              <button onClick={scrollLeft} style={styles.scrollBtn}>‹</button>
              <div ref={scrollRef} style={styles.companyGrid}>
                {trustedCompanies.slice(0, 20).map((company, idx) => (
                  <div key={idx} style={styles.companyLogo}>
                    {!logoErrors.has(company.name) ? (
                      <img 
                        src={getLogoUrl(company.domain)} 
                        alt={company.name}
                        style={styles.companyLogoImg}
                        onError={() => handleLogoError(company.name)}
                      />
                    ) : (
                      <span>{company.name.charAt(0)}</span>
                    )}
                    <div style={styles.companyTooltip}>{company.name}</div>
                  </div>
                ))}
              </div>
              <button onClick={scrollRight} style={styles.scrollBtn}>›</button>
            </div>
          </div>
        </div>
      </div>

      {message && (
        <div style={styles.messageToast}>
          {message}
        </div>
      )}

      {!canApply && (
        <div style={styles.limitWarning}>
          <span>Free applies used! </span>
          <button onClick={() => setShowPaymentPopup(true)} style={styles.upgradeLink}>
            Upgrade ₹99 →
          </button>
        </div>
      )}

      {showPaymentPopup && (
        <div style={styles.paymentOverlay}>
          <div style={styles.paymentCard}>
            <h3>Unlock More</h3>
            <p><strong>100 extra applies</strong> for <strong>₹99</strong></p>
            <button onClick={handlePayment} style={styles.payBtn}>Pay ₹99</button>
            <button onClick={() => setShowPaymentPopup(false)} style={styles.cancelBtn}>Later</button>
          </div>
        </div>
      )}

      {skills.length > 0 && (
        <div style={styles.skillsCard}>
          <h3 style={styles.sectionTitle}>Skills Detected</h3>
          <div style={styles.skillsContainer}>
            {skills.map((skill, idx) => (
              <span key={idx} style={styles.skillTag}>{skill}</span>
            ))}
          </div>
        </div>
      )}

      {jobs.length > 0 && (
        <div style={styles.jobsSection}>
          <h3 style={styles.sectionTitle}>Matching Jobs ({jobs.length})</h3>
          <div style={styles.jobsGrid}>
            {jobs.map((job, idx) => (
              <div key={idx} style={styles.jobCard}>
                <div style={styles.jobHeader}>
                  <div>
                    <h4 style={styles.jobTitle}>{job.title || "Unknown"}</h4>
                    <p style={styles.jobCompany}>{job.company || "Unknown"}</p>
                  </div>
                  <div style={styles.matchBadge}>
                    {job.matchPercentage || Math.floor(Math.random() * 30) + 60}%
                  </div>
                </div>
                {job.location && job.location !== "India" && (
                  <p style={styles.jobLocation}>📍 {job.location}</p>
                )}
                {job.distance && job.distance !== null && (
                  <p style={styles.jobDistance}>📏 {typeof job.distance === 'number' ? job.distance.toFixed(1) : job.distance} km</p>
                )}
                {job.matchingSkills && job.matchingSkills.length > 0 && (
                  <div style={styles.matchingSkills}>
                    {job.matchingSkills.slice(0, 4).map((skill: string, i: number) => (
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
                  {appliedJobs.has(job.id) ? "Applied" : "Apply Now"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {jobs.length === 0 && !uploading && (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📄</div>
          <h3 style={styles.emptyTitle}>Upload your CV to get started</h3>
          <p style={styles.emptyDesc}>
            AI scans your resume and finds <strong>7-day fresh</strong> tech jobs near you.
          </p>
          <div style={styles.emptyFeatures}>
            <span>AI Matching</span>
            <span>7 Days Fresh</span>
            <span>70km Radius</span>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: "100vh",
    background: "#0f172a",
    position: "relative" as const,
    overflow: "hidden",
  },
  bgContainer: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
    pointerEvents: "none",
    overflow: "hidden",
  },
  bgGradient: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      radial-gradient(ellipse at 20% 50%, rgba(37,99,235,0.08) 0%, transparent 60%),
      radial-gradient(ellipse at 80% 50%, rgba(124,58,237,0.06) 0%, transparent 60%),
      radial-gradient(ellipse at 50% 100%, rgba(245,158,11,0.04) 0%, transparent 50%)
    `,
    animation: "bgShift 20s ease-in-out infinite alternate",
  },
  floatingLogos: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: "none",
  },
  floatingLogo: {
    position: "absolute" as const,
    width: 60,
    height: 60,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.02)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.02)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    animation: "floatLogo 15s ease-in-out infinite alternate",
    pointerEvents: "none",
  },
  floatingLogoImg: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    opacity: 0.4,
    filter: "grayscale(0.5) brightness(1.5)",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
    color: "white",
  },
  spinner: {
    width: 40,
    height: 40,
    border: "3px solid rgba(255,255,255,0.1)",
    borderTop: "3px solid #f59e0b",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  spinnerSmall: {
    display: "inline-block",
    width: 16,
    height: 16,
    border: "2px solid rgba(255,255,255,0.2)",
    borderTop: "2px solid white",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginRight: 8,
  },
  navbar: {
  background: "rgba(15, 23, 42, 0.7)",
  backdropFilter: "blur(20px)",
  padding: "14px 24px",
  borderBottom: "1px solid rgba(255,255,255,0.04)",
  position: "sticky" as const,
  top: 0,
  zIndex: 100,
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
    color: "rgba(255,255,255,0.5)",
    fontWeight: 500,
    fontSize: 14,
    transition: "color 0.3s",
  },
  activeNavLink: {
    color: "#f59e0b",
    borderBottom: "2px solid #f59e0b",
    paddingBottom: 4,
  },
  logoutBtn: {
    background: "none",
    border: "none",
    color: "rgba(239, 68, 68, 0.5)",
    cursor: "pointer",
    fontWeight: 500,
    fontSize: 14,
    transition: "color 0.3s",
  },
  heroSection: {
    position: "relative" as const,
    zIndex: 5,
    padding: "50px 20px 60px",
  },
  heroContent: {
    maxWidth: 700,
    margin: "0 auto",
    textAlign: "center" as const,
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background: "linear-gradient(135deg, rgba(37,99,235,0.12), rgba(245,158,11,0.06))",
    border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: 50,
    padding: "6px 18px",
    color: "#f59e0b",
    fontSize: 11,
    fontWeight: 600,
    marginBottom: 20,
    textTransform: "uppercase" as const,
    letterSpacing: 0.8,
  },
  badgeDot: {
    width: 6,
    height: 6,
    background: "#f59e0b",
    borderRadius: "50%",
    animation: "pulse 1.5s infinite",
  },
  heroTitle: {
    fontSize: 44,
    color: "white",
    fontWeight: 700,
    lineHeight: 1.15,
    marginBottom: 16,
    letterSpacing: "-0.5px",
  },
  heroHighlight: {
    background: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 40%, #f59e0b 100%)",
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    color: "transparent",
  },
  heroSubtext: {
    fontSize: 16,
    color: "rgba(255,255,255,0.5)",
    marginBottom: 20,
    lineHeight: 1.6,
  },
  locationBadge: {
    color: "#34d399",
    fontSize: 13,
    fontWeight: 500,
    background: "rgba(52, 211, 153, 0.08)",
    border: "1px solid rgba(52, 211, 153, 0.12)",
    padding: "6px 20px",
    borderRadius: 20,
    display: "inline-block",
    marginBottom: 20,
  },
  locationRequest: {
    color: "#fbbf24",
    fontSize: 13,
    fontWeight: 500,
    background: "rgba(251, 191, 36, 0.06)",
    border: "1px solid rgba(251, 191, 36, 0.12)",
    padding: "6px 20px",
    borderRadius: 20,
    cursor: "pointer",
    display: "inline-block",
    marginBottom: 20,
    transition: "all 0.3s",
  },
  uploadHero: {
    background: "rgba(255,255,255,0.02)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: 24,
    padding: "32px 24px",
    textAlign: "center" as const,
    marginBottom: 24,
    transition: "all 0.4s",
  },
  uploadHeroDragging: {
    borderColor: "rgba(37,99,235,0.3)",
    background: "rgba(37,99,235,0.06)",
    boxShadow: "0 0 60px rgba(37,99,235,0.03)",
  },
  uploadIcon: {
    fontSize: 44,
    display: "block",
    marginBottom: 12,
  },
  uploadTitle: {
    fontSize: 20,
    fontWeight: 600,
    color: "white",
    marginBottom: 6,
  },
  uploadSub: {
    fontSize: 14,
    color: "rgba(255,255,255,0.35)",
    marginBottom: 20,
  },
  uploadActions: {
    display: "flex",
    gap: 12,
    justifyContent: "center",
    flexWrap: "wrap" as const,
  },
  uploadBrowse: {
    background: "rgba(255,255,255,0.04)",
    color: "rgba(255,255,255,0.7)",
    padding: "12px 24px",
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    border: "1px solid rgba(255,255,255,0.04)",
    transition: "all 0.3s",
  },
  uploadBtn: {
    background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
    color: "white",
    border: "none",
    padding: "12px 32px",
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    minWidth: 150,
    transition: "all 0.3s",
    boxShadow: "0 0 40px rgba(37,99,235,0.15), 0 4px 30px rgba(37,99,235,0.1)",
  },
  uploadBtnDisabled: {
    background: "rgba(255,255,255,0.06)",
    cursor: "not-allowed",
    boxShadow: "none",
  },
  features: {
    display: "flex",
    gap: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    paddingTop: 20,
    borderTop: "1px solid rgba(255,255,255,0.04)",
    flexWrap: "wrap" as const,
  },
  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  featureIcon: {
    fontSize: 16,
    opacity: 0.6,
  },
  featureLabel: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    fontWeight: 500,
    letterSpacing: "0.3px",
  },
  featureDivider: {
    width: 1,
    height: 18,
    background: "rgba(255,255,255,0.06)",
  },
  trustedCard: {
    background: "rgba(255,255,255,0.02)",
    backdropFilter: "blur(10px)",
    borderRadius: 16,
    padding: "16px 20px",
    border: "1px solid rgba(255,255,255,0.03)",
  },
  trustedText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.35)",
    marginBottom: 12,
    textAlign: "center" as const,
  },
  scrollContainer: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  scrollBtn: {
    width: 30,
    height: 30,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.04)",
    fontSize: 18,
    cursor: "pointer",
    color: "rgba(255,255,255,0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    transition: "all 0.3s",
  },
  companyGrid: {
    display: "flex",
    gap: 12,
    overflowX: "auto" as const,
    overflowY: "hidden" as const,
    scrollBehavior: "smooth",
    padding: "4px 2px",
    flex: 1,
    msOverflowStyle: "none",
    scrollbarWidth: "thin" as const,
  },
  companyLogo: {
    width: 42,
    height: 42,
    borderRadius: 10,
    background: "rgba(255,255,255,0.03)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative" as const,
    cursor: "pointer",
    border: "1px solid rgba(255,255,255,0.03)",
    padding: 6,
    flexShrink: 0,
    transition: "all 0.3s",
  },
  companyLogoImg: {
    width: "100%",
    height: "100%",
    objectFit: "contain" as const,
  },
  companyTooltip: {
    position: "absolute" as const,
    bottom: -28,
    left: "50%",
    transform: "translateX(-50%)",
    background: "rgba(30,41,59,0.95)",
    color: "white",
    padding: "2px 10px",
    borderRadius: 4,
    fontSize: 9,
    fontWeight: 500,
    whiteSpace: "nowrap" as const,
    opacity: 0,
    transition: "opacity 0.3s",
    pointerEvents: "none" as const,
    zIndex: 10,
  },
  messageToast: {
    position: "relative" as const,
    zIndex: 5,
    background: "rgba(30,41,59,0.8)",
    backdropFilter: "blur(10px)",
    color: "white",
    padding: "14px 24px",
    borderRadius: 12,
    margin: "20px auto 0",
    textAlign: "center" as const,
    fontSize: 14,
    maxWidth: 1200,
    border: "1px solid rgba(255,255,255,0.03)",
  },
  limitWarning: {
    position: "relative" as const,
    zIndex: 5,
    background: "rgba(254, 243, 199, 0.06)",
    backdropFilter: "blur(10px)",
    borderRadius: 12,
    padding: "12px 20px",
    margin: "16px auto 0",
    textAlign: "center" as const,
    color: "#fbbf24",
    fontSize: 13,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap" as const,
    maxWidth: 1200,
    border: "1px solid rgba(251, 191, 36, 0.08)",
  },
  upgradeLink: {
    background: "none",
    border: "none",
    color: "#f59e0b",
    fontWeight: 600,
    cursor: "pointer",
    textDecoration: "underline",
  },
  paymentOverlay: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.7)",
    backdropFilter: "blur(12px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: 20,
  },
  paymentCard: {
    background: "linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)",
    border: "1px solid rgba(255,255,255,0.04)",
    borderRadius: 24,
    padding: 36,
    textAlign: "center" as const,
    maxWidth: 380,
    width: "100%",
    boxShadow: "0 40px 80px rgba(0,0,0,0.4)",
  },
  payBtn: {
    background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
    color: "white",
    border: "none",
    padding: "14px 24px",
    borderRadius: 12,
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
    width: "100%",
    marginBottom: 12,
    boxShadow: "0 4px 30px rgba(37,99,235,0.2)",
    transition: "all 0.3s",
  },
  cancelBtn: {
    background: "rgba(255,255,255,0.04)",
    color: "rgba(255,255,255,0.5)",
    border: "1px solid rgba(255,255,255,0.04)",
    padding: "12px 20px",
    borderRadius: 12,
    fontSize: 14,
    cursor: "pointer",
    width: "100%",
    transition: "all 0.3s",
  },
  skillsCard: {
    position: "relative" as const,
    zIndex: 5,
    background: "rgba(255,255,255,0.02)",
    backdropFilter: "blur(10px)",
    borderRadius: 16,
    padding: 20,
    margin: "20px auto 0",
    maxWidth: 1200,
    border: "1px solid rgba(255,255,255,0.03)",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 600,
    marginBottom: 14,
    color: "white",
  },
  skillsContainer: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap" as const,
  },
  skillTag: {
    background: "linear-gradient(135deg, rgba(37,99,235,0.12), rgba(124,58,237,0.06))",
    color: "#93c5fd",
    padding: "6px 16px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 500,
    border: "1px solid rgba(37,99,235,0.06)",
  },
  jobsSection: {
    position: "relative" as const,
    zIndex: 5,
    maxWidth: 1200,
    margin: "20px auto 0",
    padding: "0 20px 40px",
  },
  jobsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
    gap: 16,
  },
  jobCard: {
    background: "rgba(255,255,255,0.02)",
    backdropFilter: "blur(10px)",
    borderRadius: 16,
    padding: 20,
    border: "1px solid rgba(255,255,255,0.03)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03), 0 8px 32px rgba(0,0,0,0.15)",
    transition: "all 0.3s",
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
    color: "white",
  },
  jobCompany: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 13,
  },
  matchBadge: {
    background: "linear-gradient(135deg, rgba(52,211,153,0.12), rgba(16,185,129,0.06))",
    color: "#34d399",
    padding: "4px 12px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    border: "1px solid rgba(52,211,153,0.06)",
  },
  jobLocation: {
    color: "rgba(255,255,255,0.35)",
    fontSize: 13,
    marginBottom: 4,
  },
  jobDistance: {
    color: "#6366f1",
    fontSize: 12,
    fontWeight: 500,
    marginBottom: 10,
  },
  matchingSkills: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap" as const,
    marginBottom: 14,
  },
  smallSkillTag: {
    background: "rgba(255,255,255,0.03)",
    color: "rgba(255,255,255,0.4)",
    padding: "2px 10px",
    borderRadius: 12,
    fontSize: 11,
    border: "1px solid rgba(255,255,255,0.02)",
  },
  applyBtn: {
    background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
    color: "white",
    border: "none",
    padding: "10px",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    width: "100%",
    transition: "all 0.3s",
    boxShadow: "0 2px 20px rgba(37,99,235,0.1)",
  },
  applyBtnDisabled: {
    background: "rgba(255,255,255,0.04)",
    cursor: "not-allowed",
    opacity: 0.5,
    boxShadow: "none",
  },
  emptyState: {
    position: "relative" as const,
    zIndex: 5,
    background: "rgba(255,255,255,0.02)",
    backdropFilter: "blur(10px)",
    borderRadius: 16,
    padding: 40,
    textAlign: "center" as const,
    maxWidth: 1200,
    margin: "20px auto 40px",
    border: "1px solid rgba(255,255,255,0.03)",
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    marginBottom: 8,
    color: "white",
  },
  emptyDesc: {
    color: "rgba(255,255,255,0.35)",
    marginBottom: 16,
    fontSize: 14,
  },
  emptyFeatures: {
    display: "flex",
    gap: 12,
    justifyContent: "center",
    flexWrap: "wrap" as const,
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
      0%, 100% { opacity: 0.5; }
      50% { opacity: 1; }
    }
    @keyframes floatLogo {
      0% { transform: translate(0, 0) rotate(0deg) scale(1); }
      25% { transform: translate(30px, -20px) rotate(5deg) scale(1.1); }
      50% { transform: translate(-20px, 30px) rotate(-3deg) scale(0.9); }
      75% { transform: translate(40px, 10px) rotate(4deg) scale(1.05); }
      100% { transform: translate(-30px, -30px) rotate(-5deg) scale(0.95); }
    }
    @keyframes bgShift {
      0% { transform: scale(1) rotate(0deg); }
      100% { transform: scale(1.1) rotate(5deg); }
    }
    [class*="companyLogo"]:hover {
      transform: translateY(-2px);
      background: rgba(255,255,255,0.05);
    }
    [class*="companyLogo"]:hover [class*="companyTooltip"] {
      opacity: 1;
    }
    [class*="jobCard"]:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 40px rgba(0,0,0,0.2);
      border-color: rgba(37,99,235,0.06);
    }
    [class*="uploadBrowse"]:hover {
      background: rgba(255,255,255,0.06);
    }
    [class*="uploadBtn"]:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 40px rgba(37,99,235,0.2);
    }
    [class*="companyGrid"]::-webkit-scrollbar {
      height: 3px;
    }
    [class*="companyGrid"]::-webkit-scrollbar-track {
      background: rgba(255,255,255,0.02);
      border-radius: 10px;
    }
    [class*="companyGrid"]::-webkit-scrollbar-thumb {
      background: rgba(255,255,255,0.06);
      border-radius: 10px;
    }
    input:focus {
      border-color: #2563eb !important;
      outline: none;
    }
    [class*="locationRequest"]:hover {
      background: rgba(251, 191, 36, 0.1);
    }
    [class*="logoutBtn"]:hover {
      color: rgba(239, 68, 68, 0.8);
    }
    [class*="navLink"]:hover {
      color: rgba(255,255,255,0.7);
    }
    [class*="scrollBtn"]:hover {
      background: rgba(255,255,255,0.06);
    }
    [class*="payBtn"]:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 40px rgba(37,99,235,0.25);
    }
    [class*="cancelBtn"]:hover {
      background: rgba(255,255,255,0.08);
    }
    [class*="applyBtn"]:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(37,99,235,0.2);
    }
    [class*="floatingLogo"]:nth-child(odd) {
      animation-duration: 12s;
    }
    [class*="floatingLogo"]:nth-child(even) {
      animation-duration: 18s;
    }
  `;
  document.head.appendChild(style);
}