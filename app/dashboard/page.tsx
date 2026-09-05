"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import AdUnit from "../components/AdUnit";

// ✅ Adsterra Banner Helper Component
function AdsterraBanner({ width, height, keyId }: { width: number; height: number; keyId: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    (window as any).atOptions = {
      'key': keyId,
      'format': 'iframe',
      'height': height,
      'width': width,
      'params': {}
    };

    const script = document.createElement('script');
    script.src = `https://www.highrevenueformat.com/${keyId}/invoke.js`;
    script.async = true;
    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [keyId, width, height]);

  return <div ref={containerRef} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '10px 0', overflow: 'hidden' }} />;
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
  email: "guest@jobswitchers.com",
};

export default function Dashboard() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState("");
  const [logoErrors, setLogoErrors] = useState<Set<string>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  
  const [userLocation, setUserLocation] = useState<string>("");
  const [locationPermission, setLocationPermission] = useState<boolean>(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [manualLocation, setManualLocation] = useState<string>("");
  
  const scrollRef = useRef<HTMLDivElement>(null);

  const user = session?.user || GUEST_USER;
  const userName = user?.name || "Guest";

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLocationPermission(true);
          setUserCoords({ lat: latitude, lng: longitude });
          
          try {
            const fallbackRes = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            
            if (fallbackRes.ok) {
              const data = await fallbackRes.json();
              const city = data.city || data.principalSubdivision || "India";
              setUserLocation(city);
              console.log("User Location:", city);
              return;
            }
            
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
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
                console.log("User Location (Nominatim):", city);
                return;
              }
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

  const handleApply = async (job: any) => {
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
      setMessage(data.error || "Failed to apply");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    
    if (selectedFile) {
      const fileName = selectedFile.name.toLowerCase();
      
      if (fileName.endsWith('.pdf')) {
        setMessage("PDF files are not supported. Please convert your CV to .doc or .docx format and try again.");
        setFile(null);
        setTimeout(() => setMessage(""), 5000);
        return;
      }
      
      if (!fileName.endsWith('.doc') && !fileName.endsWith('.docx')) {
        setMessage("Only .doc or .docx files are accepted. Please upload a valid CV.");
        setFile(null);
        setTimeout(() => setMessage(""), 5000);
        return;
      }
      
      setFile(selectedFile);
      setMessage("");
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("cv", file);
    
    let finalLocation = userLocation;
    let finalLat = userCoords?.lat;
    let finalLng = userCoords?.lng;

    if (!locationPermission && manualLocation.trim() !== "") {
      finalLocation = manualLocation.trim();
      
      try {
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(finalLocation)}&limit=1`
        );
        const geoData = await geoRes.json();
        if (geoData && geoData.length > 0) {
          finalLat = parseFloat(geoData[0].lat);
          finalLng = parseFloat(geoData[0].lon);
          console.log("Manual City Coords:", finalLat, finalLng);
        }
      } catch (error) {
        console.error("Geocoding error for manual city:", error);
      }
    }
    
    formData.append("location", finalLocation || "India");
    
    if (finalLat && finalLng) {
      formData.append("latitude", finalLat.toString());
      formData.append("longitude", finalLng.toString());
    }

    try {
      const timestamp = Date.now();
      const res = await fetch(`/api/upload-cv?t=${timestamp}`, { 
        method: "POST", 
        body: formData,
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
        }
      });
      const data = await res.json();

      if (data.success === false) {
        setMessage(data.message || "Upload failed. Please try again.");
        setSkills([]);
        setJobs([]);
        setAppliedJobs(new Set());
        setUploading(false);
        return;
      }

      if (data.success) {
        setSkills(data.keySkills || []);
        setJobs(data.matchedJobs || []);
        setAppliedJobs(new Set());
        
        const radiusMsg = (finalLat && finalLng) || (finalLocation && finalLocation !== "India") 
          ? `within 70km of ${finalLocation}` 
          : "in India";
          
        setMessage(`${data.matchedJobs?.length || 0} jobs found ${radiusMsg}!`);
      } else {
        setMessage(data.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setMessage("Network error. Please try again.");
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
      const fileName = files[0].name.toLowerCase();
      
      if (fileName.endsWith('.pdf')) {
        setMessage("PDF files are not supported. Please upload .doc or .docx format.");
        setTimeout(() => setMessage(""), 5000);
        return;
      }
      
      if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
        setFile(files[0]);
        setMessage("");
      } else {
        setMessage("Only .doc or .docx files are accepted.");
        setTimeout(() => setMessage(""), 5000);
      }
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
            <span style={{ color: "#f59e0b" }}>job</span>
            <span style={{ color: "#0b4df5" }}>switchers</span>
            <span style={{ color: "#ffffff" }}>.com</span>
          </div>
          <div style={styles.navLinks}>
            <a href="/dashboard" style={{ ...styles.navLink, ...styles.activeNavLink }}>Dashboard</a>
            {session && (
              <button onClick={() => router.push("/api/auth/signout")} style={styles.logoutBtn}>
                Logout
              </button>
            )}
          </div>
        </div>
      </nav>

      <div style={styles.mainLayout}>
        <div style={styles.contentArea}>
          <div style={styles.heroSection}>
            <div style={styles.heroContent}>
              <div style={styles.badge}>
                <span style={styles.badgeDot}></span>
                <span>7-Day Fresh Jobs</span>
              </div>
              
              <h1 style={styles.heroTitle}>
                Upload Your CV &<br />
                <span style={styles.heroHighlight}>AI match with relevant jobs</span>
              </h1>
              
              <p style={styles.heroSubtext}>
                AI scans your resume · 7-day fresh jobs · 70km radius
              </p>

              {!locationPermission ? (
                <div style={styles.locationPrompt}>
                  <span style={styles.locationPromptText}>Allow location or enter city for 70km radius jobs</span>
                  <div style={styles.locationInputRow}>
                    <button 
                      onClick={() => {
                        if ("geolocation" in navigator) {
                          navigator.geolocation.getCurrentPosition(
                            () => window.location.reload(),
                            () => {},
                            { enableHighAccuracy: true }
                          );
                        }
                      }} 
                      style={styles.locationAllowBtn}
                    >
                      Allow Location
                    </button>
                    <input 
                      type="text" 
                      placeholder="Or type city (e.g., Pune)" 
                      value={manualLocation}
                      onChange={(e) => setManualLocation(e.target.value)}
                      style={styles.manualLocationInput}
                    />
                  </div>
                </div>
              ) : userLocation && userLocation !== "India" ? (
                <div style={styles.locationBadge}>{userLocation} · 70km radius active</div>
              ) : (
                <div style={{
                  ...styles.locationBadge,
                  background: "rgba(251, 191, 36, 0.08)",
                  color: "#fbbf24",
                  border: "1px solid rgba(251, 191, 36, 0.12)"
                }}>
                  Default: India (Enable location for 70km radius)
                </div>
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
                  {file 
                    ? `${(file.size / 1024).toFixed(0)} KB · Ready to upload` 
                    : "Please upload .doc or .docx files only (Max 5MB)\nPDF files are not supported"}
                </p>
                
                <div style={styles.uploadActions}>
                  <label htmlFor="cv-upload-hero" style={styles.uploadBrowse}>
                    Browse Files
                  </label>
                  <input
                    type="file"
                    id="cv-upload-hero"
                    accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleFileChange}
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
                    <span style={styles.featureLabel}>AI Matching</span>
                  </div>
                  <div style={styles.featureDivider}></div>
                  <div style={styles.featureItem}>
                    <span style={styles.featureLabel}>Last 7 Days</span>
                  </div>
                  <div style={styles.featureDivider}></div>
                  <div style={styles.featureItem}>
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

          {/* ✅ ADSTERRA 320x50 BANNER */}
          <div style={styles.inFeedAd}>
            <p style={styles.adLabel}>— Sponsored —</p>
            <AdsterraBanner width={320} height={50} keyId="7f2c8c024d991d50a6b11ffa7675c061" />
          </div>

          {message && (
            <div style={{
              ...styles.messageToast,
              background: message.includes("PDF") || message.includes("not supported") || message.includes("not accepted")
                ? "rgba(239, 68, 68, 0.15)" 
                : "rgba(30,41,59,0.8)",
              border: message.includes("PDF") || message.includes("not supported") || message.includes("not accepted")
                ? "1px solid rgba(239, 68, 68, 0.3)"
                : "1px solid rgba(255,255,255,0.03)"
            }}>
              {message}
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
                      <p style={styles.jobLocation}>{job.location}</p>
                    )}
                    {job.distance && job.distance !== null && (
                      <p style={styles.jobDistance}>{typeof job.distance === 'number' ? job.distance.toFixed(1) : job.distance} km away</p>
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

              <div style={{ 
                textAlign: "center", 
                marginTop: 30, 
                fontSize: 12, 
                color: "rgba(255,255,255,0.5)",
                padding: "20px 0",
                borderTop: "1px solid rgba(255,255,255,0.05)"
              }}>
                Jobs powered by{" "}
                <a 
                  href="https://www.adzuna.co.in" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ 
                    color: "#f59e0b", 
                    textDecoration: "none", 
                    fontWeight: 600,
                    borderBottom: "1px solid #f59e0b"
                  }}
                >
                  Adzuna
                </a>
              </div>

            </div>
          )}

          {jobs.length === 0 && !uploading && (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}></div>
              <h3 style={styles.emptyTitle}>Upload your CV to get started</h3>
              <p style={styles.emptyDesc}>
                AI scans your resume and finds 7-day fresh jobs within 70km of your location.
              </p>
              <div style={styles.emptyFeatures}>
                <span>AI Matching</span>
                <span>7 Days Fresh</span>
                <span>70km Radius</span>
              </div>
            </div>
          )}
        </div>

        <div style={styles.sidebar}>
          {/* ✅ ADSTERRA 300x250 BANNER */}
          <div style={styles.adContainer}>
            <p style={styles.adLabel}>— Sponsored —</p>
            <AdsterraBanner width={300} height={250} keyId="c79b11868ca9e69eb48972d1fa68174c" />
          </div>

          <div style={styles.adContainer}>
            <p style={styles.adLabel}>— Sponsored —</p>
            <AdUnit 
              slot="0987654321" 
              format="vertical" 
              type="sidebar"
              style={{ minHeight: "200px" }}
            />
          </div>

          <div style={styles.sponsoredCard}>
            <div style={styles.sponsoredBadge}>Sponsored</div>
            <h4 style={styles.sponsoredTitle}>Senior Developer</h4>
            <p style={styles.sponsoredCompany}>Google</p>
            <p style={styles.sponsoredCta}>Apply Now</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: "100vh",
    background: "#0f172a",
    position: "relative",
    overflow: "hidden",
  },
  bgContainer: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
    pointerEvents: "none",
    overflow: "hidden",
  },
  bgGradient: {
    position: "absolute",
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
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: "none",
  },
  floatingLogo: {
    position: "absolute",
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
    flexDirection: "column",
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
    position: "sticky",
    zIndex: 10,
    background: "rgba(15, 23, 42, 0.5)",
    backdropFilter: "blur(30px)",
    padding: "12px 16px",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
    top: 0,
  },
  navContent: {
    maxWidth: 1200,
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    fontSize: 22,
    fontWeight: "bold",
  },
  navLinks: {
    display: "flex",
    gap: 16,
    alignItems: "center",
  },
  navLink: {
    textDecoration: "none",
    color: "rgba(255,255,255,0.5)",
    fontWeight: 500,
    fontSize: 13,
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
    fontSize: 13,
    transition: "color 0.3s",
  },
  heroSection: {
    position: "relative",
    zIndex: 5,
    padding: "30px 12px 40px",
  },
  heroContent: {
    maxWidth: 700,
    margin: "0 auto",
    textAlign: "center",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background: "linear-gradient(135deg, rgba(37,99,235,0.12), rgba(245,158,11,0.06))",
    border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: 50,
    padding: "4px 14px",
    color: "#f59e0b",
    fontSize: 10,
    fontWeight: 600,
    marginBottom: 16,
    textTransform: "uppercase",
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
    fontSize: 32,
    color: "white",
    fontWeight: 700,
    lineHeight: 1.2,
    marginBottom: 12,
    letterSpacing: "-0.5px",
  },
  heroHighlight: {
    background: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 40%, #f59e0b 100%)",
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    color: "transparent",
  },
  heroSubtext: {
    fontSize: 14,
    color: "rgba(255,255,255,0.5)",
    marginBottom: 16,
    lineHeight: 1.6,
  },
  locationPrompt: {
    background: "rgba(251, 191, 36, 0.08)",
    border: "1px solid rgba(251, 191, 36, 0.15)",
    borderRadius: 12,
    padding: "12px 16px",
    marginBottom: 16,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
  },
  locationPromptText: {
    color: "#fbbf24",
    fontSize: 13,
    fontWeight: 600,
    textAlign: "center",
  },
  locationInputRow: {
    display: "flex",
    gap: 8,
    width: "100%",
  },
  locationAllowBtn: {
    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s",
    whiteSpace: "nowrap",
  },
  manualLocationInput: {
    flex: 1,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 8,
    padding: "8px 12px",
    color: "white",
    fontSize: 12,
    outline: "none",
  },
  locationBadge: {
    color: "#34d399",
    fontSize: 12,
    fontWeight: 600,
    background: "rgba(52, 211, 153, 0.08)",
    border: "1px solid rgba(52, 211, 153, 0.12)",
    padding: "6px 16px",
    borderRadius: 20,
    display: "inline-block",
    marginBottom: 16,
  },
  uploadHero: {
    background: "rgba(255,255,255,0.02)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: 20,
    padding: "20px 16px",
    textAlign: "center",
    marginBottom: 20,
    transition: "all 0.4s",
  },
  uploadHeroDragging: {
    borderColor: "rgba(37,99,235,0.3)",
    background: "rgba(37,99,235,0.06)",
    boxShadow: "0 0 60px rgba(37,99,235,0.03)",
  },
  uploadIcon: {
    fontSize: 40,
    display: "block",
    marginBottom: 8,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: "white",
    marginBottom: 4,
  },
  uploadSub: {
    fontSize: 9,
    color: "rgba(255, 255, 255, 1)",
    marginBottom: 13,
    whiteSpace: "pre-line",
  },
  uploadActions: {
    display: "flex",
    gap: 10,
    justifyContent: "center",
    flexWrap: "wrap",
  },
  uploadBrowse: {
    background: "rgba(255,255,255,0.04)",
    color: "rgba(255,255,255,0.7)",
    padding: "10px 18px",
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    border: "1px solid rgba(255,255,255,0.04)",
    transition: "all 0.3s",
    animation: "glow 2s ease-in-out infinite",
    boxShadow: "0 0 15px rgba(37, 99, 235, 0.3)",
  },
  uploadBtn: {
    background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
    color: "white",
    border: "none",
    padding: "10px 24px",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    minWidth: 130,
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
    gap: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    paddingTop: 16,
    borderTop: "1px solid rgba(255,255,255,0.04)",
    flexWrap: "wrap",
  },
  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  featureLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
    fontWeight: 500,
    letterSpacing: "0.3px",
  },
  featureDivider: {
    width: 1,
    height: 16,
    background: "rgba(255,255,255,0.06)",
  },
  trustedCard: {
    background: "rgba(255,255,255,0.02)",
    backdropFilter: "blur(10px)",
    borderRadius: 14,
    padding: "14px 16px",
    border: "1px solid rgba(255,255,255,0.03)",
  },
  trustedText: {
    fontSize: 11,
    color: "rgba(255,255,255,0.35)",
    marginBottom: 10,
    textAlign: "center",
  },
  scrollContainer: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  scrollBtn: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.04)",
    fontSize: 16,
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
    gap: 10,
    overflowX: "auto",
    overflowY: "hidden",
    scrollBehavior: "smooth",
    padding: "4px 2px",
    flex: 1,
    msOverflowStyle: "none",
    scrollbarWidth: "thin",
  },
  companyLogo: {
    width: 38,
    height: 38,
    borderRadius: 8,
    background: "rgba(255,255,255,0.03)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    cursor: "pointer",
    border: "1px solid rgba(255,255,255,0.03)",
    padding: 4,
    flexShrink: 0,
    transition: "all 0.3s",
  },
  companyLogoImg: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },
  companyTooltip: {
    position: "absolute",
    bottom: -24,
    left: "50%",
    transform: "translateX(-50%)",
    background: "rgba(30,41,59,0.95)",
    color: "white",
    padding: "2px 8px",
    borderRadius: 4,
    fontSize: 8,
    fontWeight: 500,
    whiteSpace: "nowrap",
    opacity: 0,
    transition: "opacity 0.3s",
    pointerEvents: "none",
    zIndex: 10,
  },
  mainLayout: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    maxWidth: 1200,
    margin: "0 auto",
    padding: "0 12px",
  },
  contentArea: {
    flex: 1,
    minWidth: 0,
    padding: "0 4px",
  },
  inFeedAd: {
    margin: "12px 0",
    padding: "0 4px",
  },
  sidebar: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    padding: "0 4px",
  },
  adContainer: {
    background: "rgba(255,255,255,0.02)",
    borderRadius: 12,
    padding: 8,
    border: "1px solid rgba(255,255,255,0.03)",
    minHeight: 180,
  },
  adLabel: {
    fontSize: 9,
    color: "rgba(255,255,255,0.15)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
    textAlign: "center",
  },
  sponsoredCard: {
    background: "linear-gradient(135deg, rgba(245,158,11,0.06), rgba(245,158,11,0.02))",
    borderRadius: 12,
    padding: 14,
    border: "1px solid rgba(245,158,11,0.06)",
    display: "none",
  },
  sponsoredBadge: {
    fontSize: 9,
    fontWeight: 700,
    color: "#f59e0b",
    textTransform: "uppercase",
    marginBottom: 4,
    opacity: 0.7,
    letterSpacing: 0.5,
  },
  sponsoredTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: "white",
    marginBottom: 2,
  },
  sponsoredCompany: {
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
    marginBottom: 8,
  },
  sponsoredCta: {
    fontSize: 12,
    color: "#f59e0b",
    fontWeight: 500,
    cursor: "pointer",
    textDecoration: "underline",
  },
  messageToast: {
    position: "relative",
    zIndex: 5,
    color: "white",
    padding: "10px 16px",
    borderRadius: 10,
    margin: "12px 0",
    textAlign: "center",
    fontSize: 13,
  },
  skillsCard: {
    position: "relative",
    zIndex: 5,
    background: "rgba(255,255,255,0.02)",
    backdropFilter: "blur(10px)",
    borderRadius: 14,
    padding: 16,
    margin: "12px 0",
    border: "1px solid rgba(255,255,255,0.03)",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 12,
    color: "white",
    padding: "0 4px",
  },
  skillsContainer: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  skillTag: {
    background: "linear-gradient(135deg, rgba(37,99,235,0.12), rgba(124,58,237,0.06))",
    color: "#93c5fd",
    padding: "4px 12px",
    borderRadius: 16,
    fontSize: 11,
    fontWeight: 500,
    border: "1px solid rgba(37,99,235,0.06)",
  },
  jobsSection: {
    position: "relative",
    zIndex: 5,
    maxWidth: 1200,
    margin: "0 auto",
    padding: "0 0 30px",
  },
  jobsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 12,
    padding: "0 4px",
  },
  jobCard: {
    background: "rgba(255,255,255,0.02)",
    backdropFilter: "blur(10px)",
    borderRadius: 14,
    padding: 14,
    border: "1px solid rgba(255,255,255,0.03)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03), 0 8px 32px rgba(0,0,0,0.15)",
    transition: "all 0.3s",
  },
  jobHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  jobTitle: {
    fontSize: 15,
    fontWeight: 600,
    marginBottom: 2,
    color: "white",
  },
  jobCompany: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 12,
  },
  matchBadge: {
    background: "linear-gradient(135deg, rgba(52,211,153,0.12), rgba(16,185,129,0.06))",
    color: "#34d399",
    padding: "2px 10px",
    borderRadius: 16,
    fontSize: 11,
    fontWeight: 600,
    border: "1px solid rgba(52,211,153,0.06)",
  },
  jobLocation: {
    color: "rgba(255,255,255,0.35)",
    fontSize: 12,
    marginBottom: 4,
  },
  jobDistance: {
    color: "#6366f1",
    fontSize: 11,
    fontWeight: 600,
    marginBottom: 8,
  },
  matchingSkills: {
    display: "flex",
    gap: 6,
    flexWrap: "wrap",
    marginBottom: 10,
  },
  smallSkillTag: {
    background: "rgba(255,255,255,0.03)",
    color: "rgba(255,255,255,0.4)",
    padding: "2px 8px",
    borderRadius: 10,
    fontSize: 10,
    border: "1px solid rgba(255,255,255,0.02)",
  },
  applyBtn: {
    background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
    color: "white",
    border: "none",
    padding: "8px",
    borderRadius: 8,
    fontSize: 13,
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
    position: "relative",
    zIndex: 5,
    background: "rgba(255,255,255,0.02)",
    backdropFilter: "blur(10px)",
    borderRadius: 14,
    padding: 30,
    textAlign: "center",
    margin: "12px 0 30px",
    border: "1px solid rgba(255,255,255,0.03)",
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 16,
    marginBottom: 6,
    color: "white",
  },
  emptyDesc: {
    color: "rgba(255,255,255,0.35)",
    marginBottom: 12,
    fontSize: 13,
  },
  emptyFeatures: {
    display: "flex",
    gap: 10,
    justifyContent: "center",
    flexWrap: "wrap",
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
    @keyframes glow {
      0%, 100% { box-shadow: 0 0 5px rgba(37, 99, 235, 0.3), 0 0 10px rgba(37, 99, 235, 0.1); }
      50% { box-shadow: 0 0 20px rgba(37, 99, 235, 0.6), 0 0 30px rgba(37, 99, 235, 0.3); }
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
    @media (min-width: 768px) {
      .mainLayout {
        flex-direction: row !important;
        align-items: flex-start !important;
      }
      .sidebar {
        width: 300px !important;
        min-width: 300px !important;
        position: sticky !important;
        top: 80px !important;
      }
      .sponsoredCard {
        display: block !important;
      }
      .jobsGrid {
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)) !important;
      }
    }
    @media (max-width: 480px) {
      .heroTitle {
        font-size: 26px !important;
      }
      .uploadHero {
        padding: 16px 12px !important;
      }
      .uploadBtn {
        font-size: 13px !important;
        padding: 8px 18px !important;
        min-width: 100px !important;
      }
      .jobTitle {
        font-size: 14px !important;
      }
      .adContainer {
        min-height: 150px !important;
      }
      .locationInputRow {
        flex-direction: column !important;
      }
    }
    [class*="companyLogo"]:hover {
      transform: translateY(-2px);
      background: rgba(255,255,255,0.05);
    }
    [class*="companyLogo"]:hover [class*="companyTooltip"] {
      opacity: 1;
    }
    [class*="jobCard"]:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(0,0,0,0.2);
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
    [class*="logoutBtn"]:hover {
      color: rgba(239, 68, 68, 0.8);
    }
    [class*="navLink"]:hover {
      color: rgba(255,255,255,0.7);
    }
    [class*="scrollBtn"]:hover {
      background: rgba(255,255,255,0.06);
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
    [class*="footerLink"]:hover {
      color: rgba(255,255,255,0.8) !important;
    }
  `;
  document.head.appendChild(style);
}