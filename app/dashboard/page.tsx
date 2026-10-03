"use client";
import React from 'react';
import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// ✅ Success Modal Component (Replaces Plan Purchase Popup with Large Green Tick)
function FastTrackModal({ isOpen, onClose, userName }: { isOpen: boolean; onClose: () => void; userName: string }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(26, 26, 26, 0.8)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      backdropFilter: 'blur(5px)'
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: '24px',
        padding: '40px 32px',
        maxWidth: '420px',
        width: '100%',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
        textAlign: 'center',
        position: 'relative',
        border: '2px solid #10B981'
      }}>
        {/* ✅ LARGE GREEN TICK */}
        <div style={{
          width: '80px',
          height: '80px',
          background: 'rgba(16, 185, 129, 0.1)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px auto'
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 6L9 17L4 12" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <h2 style={{ color: '#1A1A1A', fontSize: '24px', fontWeight: '800', marginBottom: '12px' }}>
          Analysis Successful!
        </h2>
        <p style={{ color: 'rgba(26,26,26,0.6)', fontSize: '15px', marginBottom: '32px', lineHeight: '1.5' }}>
          Hi, your CV has been successfully analyzed. We found highly relevant jobs matching your profile.
        </p>

        <button 
          onClick={onClose}
          style={{
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            color: '#FFFFFF',
            border: 'none',
            padding: '16px 32px',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '700',
            cursor: 'pointer',
            width: '100%',
            transition: 'all 0.3s',
            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
          }}
        >
          View My Jobs
        </button>
      </div>
    </div>
  );
}

// ✅ AI Skill Gap Analyzer Component (Emojis removed)
function SkillGapAnalyzer({ skills, experienceYears }: { skills: string[]; experienceYears: number }) {
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  useEffect(() => {
    const mockAnalysis = {
      missingSkills: [
        { name: 'Advanced Excel & Power BI', demand: 'High', salaryImpact: '+25%' },
        { name: 'Python for Data Analysis', demand: 'Very High', salaryImpact: '+35%' },
        { name: 'Project Management (PMP)', demand: 'High', salaryImpact: '+30%' },
      ],
      recommendedCourses: [
        { title: 'Advanced Excel & Power BI Masterclass', platform: 'Udemy', price: '499', duration: '12 hours', url: 'https://udemy.com' },
        { title: 'Python for Data Science', platform: 'Coursera', price: '₹1,999/mo', duration: '8 weeks', url: 'https://coursera.org' },
        { title: 'PMP Certification Prep', platform: 'LinkedIn Learning', price: '₹1,299/mo', duration: '35 hours', url: 'https://linkedin.com' },
      ],
      estimatedSalaryHike: '35-45%',
      timeline: '6-12 months'
    };
    setAnalysis(mockAnalysis);
  }, [skills, experienceYears]);

  if (!showAnalysis) {
    return (
      <div style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        padding: '24px',
        margin: '20px 0',
        border: '1px solid rgba(0, 102, 204, 0.1)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        textAlign: 'center',
        cursor: 'pointer'
      }}
      onClick={() => setShowAnalysis(true)}
      >
        <h3 style={{ color: '#1A1A1A', fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>
          AI Skill Gap Analyzer
        </h3>
        <p style={{ color: 'rgba(26,26,26,0.6)', fontSize: '14px', marginBottom: '16px' }}>
          Discover the exact skills that can boost your salary by <span style={{ color: '#10B981', fontWeight: '700' }}>35-45%</span>
        </p>
        <button style={{
          background: 'linear-gradient(135deg, #0066CC 0%, #0052a3 100%)',
          color: '#FFFFFF',
          border: 'none',
          padding: '12px 28px',
          borderRadius: '10px',
          fontSize: '15px',
          fontWeight: '700',
          cursor: 'pointer'
        }}>
          Analyze My Profile - Free
        </button>
      </div>
    );
  }

  return (
    <div style={{
      background: '#FFFFFF',
      borderRadius: '16px',
      padding: '24px',
      margin: '20px 0',
      border: '1px solid rgba(0, 102, 204, 0.1)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h3 style={{ color: '#1A1A1A', fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>
            Your AI-Powered Career Roadmap
          </h3>
          <p style={{ color: 'rgba(26,26,26,0.6)', fontSize: '14px' }}>
            Estimated Salary Hike: <span style={{ color: '#10B981', fontWeight: '700' }}>{analysis?.estimatedSalaryHike}</span> in {analysis?.timeline}
          </p>
        </div>
        <button onClick={() => setShowAnalysis(false)} style={{
          background: 'rgba(26,26,26,0.05)', color: '#1A1A1A', border: 'none',
          padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600'
        }}>Close</button>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ color: '#0066CC', fontSize: '15px', fontWeight: '700', marginBottom: '16px', textTransform: 'uppercase' }}>
          High-Demand Skills to Learn
        </h4>
        <div style={{ display: 'grid', gap: '12px' }}>
          {analysis?.missingSkills.map((skill: any, idx: number) => (
            <div key={idx} style={{
              background: '#F8FAFC', borderRadius: '12px', padding: '16px',
              border: '1px solid rgba(0, 102, 204, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <div style={{ color: '#1A1A1A', fontWeight: '600', marginBottom: '4px' }}>{skill.name}</div>
                <div style={{ color: 'rgba(26,26,26,0.5)', fontSize: '13px' }}>Market Demand: {skill.demand}</div>
              </div>
              {/* ✅ CHANGE 1: Emerald Green for Salary Increase Indicators */}
              <div style={{
                background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', padding: '8px 16px',
                borderRadius: '10px', fontSize: '14px', fontWeight: '800'
              }}>
                {skill.salaryImpact}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 style={{ color: '#0066CC', fontSize: '15px', fontWeight: '700', marginBottom: '16px', textTransform: 'uppercase' }}>
          Recommended Courses
        </h4>
        <div style={{ display: 'grid', gap: '12px' }}>
          {analysis?.recommendedCourses.map((course: any, idx: number) => (
            <div key={idx} onClick={() => window.open(course.url, '_blank')} style={{
              background: '#F8FAFC', borderRadius: '12px', padding: '16px',
              border: '1px solid rgba(0, 102, 204, 0.05)', cursor: 'pointer', transition: 'all 0.3s'
            }}>
              <div style={{ color: '#1A1A1A', fontWeight: '600', marginBottom: '8px' }}>{course.title}</div>
              <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'rgba(26,26,26,0.6)' }}>
                <span>{course.platform}</span>
                <span>{course.price}</span>
                <span>{course.duration}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ✅ In-Feed Monetization Card
function InFeedMonetizationCard({ position }: { position: number }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.05) 0%, rgba(0, 102, 204, 0.05) 100%)',
      borderRadius: '16px',
      padding: '24px',
      margin: '16px 0',
      border: '2px solid #FF6B35',
      boxShadow: '0 12px 40px rgba(255, 107, 53, 0.1)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute', top: '0', right: '0',
        background: '#FF6B35', color: '#FFFFFF', padding: '4px 16px',
        fontSize: '11px', fontWeight: '800', borderBottomLeftRadius: '12px',
        textTransform: 'uppercase', letterSpacing: '0.5px'
      }}>
        Hot Offer
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #FF6B35 0%, #ff8f66 100%)',
          color: '#FFFFFF', padding: '8px 16px', borderRadius: '10px',
          fontSize: '13px', fontWeight: '800', textTransform: 'uppercase'
        }}>
          10-Min Fast-Track
        </div>
      </div>

      <h3 style={{ color: '#1A1A1A', fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>
        Get Hired in 10 Minutes!
      </h3>
      <p style={{ color: 'rgba(26,26,26,0.7)', fontSize: '14px', marginBottom: '20px', lineHeight: '1.5' }}>
        Don't wait weeks for a callback. Get your CV instantly in front of decision-makers who are hiring right now.
      </p>

      <button 
        onClick={() => window.open('https://imjo.in/SBqtUs', '_blank')}
        style={{
          background: 'linear-gradient(135deg, #FF6B35 0%, #ff8f66 100%)',
          color: '#FFFFFF', border: 'none', padding: '16px', borderRadius: '12px',
          fontSize: '16px', fontWeight: '800', cursor: 'pointer', width: '100%',
          marginBottom: '12px', boxShadow: '0 4px 15px rgba(255, 107, 53, 0.3)'
        }}
      >
        Get Hired in 10 Mins - Just ₹99
      </button>

      <button 
        onClick={() => window.open('https://imjo.in/TfbXzp', '_blank')}
        style={{
          background: '#FFFFFF',
          color: '#0066CC', border: '2px solid #0066CC', padding: '14px', borderRadius: '10px',
          fontSize: '14px', fontWeight: '700', cursor: 'pointer', width: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          transition: 'all 0.3s'
        }}
      >
        Career Consulting Package - ₹149
      </button>
    </div>
  );
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
  
  const [candidateName, setCandidateName] = useState<string>("");
  const [salaryData, setSalaryData] = useState<any>(null);
  const [negotiationTip, setNegotiationTip] = useState<string>("");
  
  const [showFastTrackModal, setShowFastTrackModal] = useState(false);
  
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
              return;
            }
            
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
            );
            
            if (response.ok) {
              const data = await response.json();
              let city = "";
              if (data.address) {
                city = data.address.city || data.address.town || data.address.village || data.address.state_district || data.address.state || "";
              }
              if (city) {
                setUserLocation(city);
                return;
              }
            }
            setUserLocation("India");
          } catch (error) {
            setUserLocation("India");
          }
        },
        (error) => {
          setLocationPermission(false);
          setUserLocation("India");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setUserLocation("India");
    }
  }, []);

  if (status === "loading") {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={{ color: '#1A1A1A' }}>Loading...</p>
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
      setTimeout(() => { window.open(job.url, "_blank"); setMessage(""); }, 1000);
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
      if (!fileName.endsWith('.doc') && !fileName.endsWith('.docx') && !fileName.endsWith('.pdf')) {
        setMessage("Only .doc, .docx, or .pdf files are accepted.");
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
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(finalLocation)}&limit=1`);
        const geoData = await geoRes.json();
        if (geoData && geoData.length > 0) {
          finalLat = parseFloat(geoData[0].lat);
          finalLng = parseFloat(geoData[0].lon);
        }
      } catch (error) {
        console.error("Geocoding error:", error);
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
        headers: { "Cache-Control": "no-cache, no-store, must-revalidate", "Pragma": "no-cache" }
      });
      const data = await res.json();

      if (data.success === false) {
        setMessage(data.message || "Upload failed. Please try again.");
        setSkills([]); setJobs([]); setAppliedJobs(new Set());
        setUploading(false);
        return;
      }

      if (data.success) {
        setSkills(data.keySkills || []);
        setJobs(data.matchedJobs || []);
        setAppliedJobs(new Set());
        setCandidateName(data.candidateFirstName || "");
        setSalaryData(data.salaryEstimate || null);
        setNegotiationTip(data.negotiationTip || "");
        
        console.log("💰 Salary Data Received:", data.salaryEstimate);
        console.log("💰 Salary Min:", data.salaryEstimate?.min);
        console.log("💰 Salary Max:", data.salaryEstimate?.max);
        
        // ✅ NOW SHOWS SUCCESS POPUP WITH GREEN TICK INSTEAD OF PLAN PURCHASE
        setShowFastTrackModal(true);
        
        const radiusMsg = (finalLat && finalLng) || (finalLocation && finalLocation !== "India") 
          ? `within 70km of ${finalLocation}` : "in India";
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

  const handleLogoError = (companyName: string) => setLogoErrors(prev => new Set(prev).add(companyName));
  const getLogoUrl = (domain: string) => `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const fileName = files[0].name.toLowerCase();
      if (fileName.endsWith('.doc') || fileName.endsWith('.docx') || fileName.endsWith('.pdf')) {
        setFile(files[0]); setMessage("");
      } else {
        setMessage("Only .doc, .docx, or .pdf files are accepted.");
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
            <div key={idx} style={{
              ...styles.floatingLogo,
              animationDelay: `${Math.random() * 10}s`,
              left: `${Math.random() * 90 + 5}%`,
              top: `${Math.random() * 90 + 5}%`,
              transform: `scale(${0.4 + Math.random() * 0.6})`,
              opacity: 0.10,
            }}>
              <img src={getLogoUrl(company.domain)} alt={company.name} style={styles.floatingLogoImg}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </div>
          ))}
        </div>
      </div>

      {/* ✅ This now renders the Success Popup with Large Green Tick */}
      <FastTrackModal isOpen={showFastTrackModal} onClose={() => setShowFastTrackModal(false)} userName={userName} />

      <div style={styles.mainLayout}>
        <div style={styles.contentArea}>
          <div style={styles.heroSection}>
            <div style={styles.heroContent}>
              <div style={styles.badge}>
                <span style={styles.badgeDot}></span>
                <span>Get Hired in 10 Minutes</span>
              </div>
              
              <h1 style={styles.heroTitle}>
                Get Hired in 10 Minutes!<br />
                <span style={styles.heroHighlight}>Upload Your CV & Instantly Connect with Hiring Managers</span>
              </h1>
              
              <p style={styles.heroSubtext}>
                AI scans your resume · Instant HR delivery · 70km radius matching
              </p>

              {!locationPermission ? (
                <div style={styles.locationPrompt}>
                  <span style={styles.locationPromptText}>Allow location or enter city for 70km radius jobs</span>
                  <div style={styles.locationInputRow}>
                    <button onClick={() => { if ("geolocation" in navigator) navigator.geolocation.getCurrentPosition(() => window.location.reload(), () => {}, { enableHighAccuracy: true }); }} style={styles.locationAllowBtn}>
                      Allow Location
                    </button>
                    <input type="text" placeholder="Or type city (e.g., Pune)" value={manualLocation} onChange={(e) => setManualLocation(e.target.value)} style={styles.manualLocationInput} />
                  </div>
                </div>
              ) : userLocation && userLocation !== "India" ? (
                <div style={styles.locationBadge}>{userLocation} · 70km radius active</div>
              ) : (
                <div style={{ ...styles.locationBadge, background: "rgba(0, 102, 204, 0.08)", color: "#0066CC", border: "1px solid rgba(0, 102, 204, 0.15)" }}>
                  Default: India (Enable location for 70km radius)
                </div>
              )}

              <div style={{ ...styles.uploadHero, ...(isDragging ? styles.uploadHeroDragging : {}) }} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
                <div style={styles.uploadIcon}></div>
                <h2 style={styles.uploadTitle}>{file ? file.name : "Drop your CV here"}</h2>
                <p style={styles.uploadSub}>{file ? `${(file.size / 1024).toFixed(0)} KB · Ready to upload` : "Please upload .doc, .docx, or .pdf files (Max 5MB)"}</p>
                
                <div style={styles.uploadActions}>
                  <label htmlFor="cv-upload-hero" style={styles.uploadBrowse}>Browse Files</label>
                  <input type="file" id="cv-upload-hero" accept=".doc,.docx,.pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf" onChange={handleFileChange} style={{ display: "none" }} />
                  <button onClick={handleUpload} disabled={uploading || !file} style={{ ...styles.uploadBtn, ...((uploading || !file) ? styles.uploadBtnDisabled : {}) }}>
                    {uploading ? (<><span style={styles.spinnerSmall}></span>Analyzing...</>) : ("Get Hired in 10 Mins")}
                  </button>
                </div>

                <div style={styles.features}>
                  <div style={styles.featureItem}><span style={styles.featureLabel}>AI Matching</span></div>
                  <div style={styles.featureDivider}></div>
                  <div style={styles.featureItem}><span style={styles.featureLabel}>Instant Delivery</span></div>
                  <div style={styles.featureDivider}></div>
                  <div style={styles.featureItem}><span style={styles.featureLabel}>70km Radius</span></div>
                </div>
              </div>

              {/* ✅ Infinite Auto-Scrolling Marquee */}
              <div style={styles.trustedCard}>
                <p style={styles.trustedText}>TRUSTED BY 500+ FORTUNE 500 COMPANIES</p>
                <div style={styles.marqueeContainer}>
                  <div style={styles.marqueeTrack}>
                    {[...trustedCompanies, ...trustedCompanies].map((company, idx) => (
                      <div key={idx} style={styles.companyLogo}>
                        {!logoErrors.has(company.name) ? (
                          <img src={getLogoUrl(company.domain)} alt={company.name} style={styles.companyLogoImg} onError={() => handleLogoError(company.name)} />
                        ) : (
                          <span style={{ color: '#1A1A1A', fontWeight: '700' }}>{company.name.charAt(0)}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ✅ CHANGE 3: Emerald Green for "Payment Successful" / Success Messages */}
          {message && (
            <div style={{
              ...styles.messageToast,
              background: message.toLowerCase().includes("success") || message.toLowerCase().includes("paid") || message.toLowerCase().includes("found") 
                ? "rgba(16, 185, 129, 0.1)" 
                : (message.includes("not supported") || message.includes("not accepted") || message.includes("Unsupported") || message.includes("failed") 
                  ? "rgba(255, 107, 53, 0.1)" 
                  : "#FFFFFF"),
              color: message.toLowerCase().includes("success") || message.toLowerCase().includes("paid") || message.toLowerCase().includes("found")
                ? "#10B981"
                : (message.includes("not supported") || message.includes("not accepted") || message.includes("Unsupported") || message.includes("failed")
                  ? "#FF6B35"
                  : "#1A1A1A"),
              border: message.toLowerCase().includes("success") || message.toLowerCase().includes("paid") || message.toLowerCase().includes("found")
                ? "1px solid #10B981"
                : (message.includes("not supported") || message.includes("not accepted") || message.includes("Unsupported") || message.includes("failed")
                  ? "1px solid #FF6B35"
                  : "1px solid rgba(0,0,0,0.05)")
            }}>
              {message}
            </div>
          )}

          {/* ✅ PERMANENT FIX: Relaxed condition to show salary even if min is 0 */}
          {salaryData && (salaryData.min > 0 || salaryData.max > 0) && (
            <div style={{
              position: "relative", zIndex: 5, background: "#FFFFFF", borderRadius: 20, padding: 24, margin: "20px 0",
              border: "1px solid rgba(0, 102, 204, 0.1)", boxShadow: "0 10px 40px rgba(0,0,0,0.05)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
                <div style={{ flex: 1, minWidth: 250 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#FF6B35", letterSpacing: "0.5px" }}>
                      {candidateName ? `${candidateName}'s Market Value` : "Your Market Value"}
                    </h3>
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 12 }}>
                    <span style={{ fontSize: 36, fontWeight: 800, color: "#1A1A1A", letterSpacing: "-1px" }}>
                      ₹{salaryData.min} - ₹{salaryData.max}
                    </span>
                    <span style={{ fontSize: 16, fontWeight: 600, color: "rgba(26,26,26,0.5)" }}>{salaryData.currency}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: "rgba(26,26,26,0.6)", lineHeight: 1.5 }}>
                    Based on your {salaryData.confidence.toLowerCase()} confidence match for current Indian market trends.
                  </p>
                </div>

                {negotiationTip && (
                  <div style={{ flex: 1, minWidth: 250, background: "#F8FAFC", borderRadius: 12, padding: 16, border: "1px solid rgba(0, 102, 204, 0.05)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#0066CC", textTransform: "uppercase", letterSpacing: 0.5 }}>
                        HR Negotiation Tip
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: 13, color: "#1A1A1A", lineHeight: 1.5, fontStyle: "italic" }}>
                      "{negotiationTip}"
                    </p>
                  </div>
                )}
              </div>
              <p style={{ margin: "16px 0 0", fontSize: 10, color: "rgba(26,26,26,0.4)", textAlign: "right" }}>
                *Estimate based on market data. Actual offers may vary.
              </p>
            </div>
          )}

          {skills.length > 0 && <SkillGapAnalyzer skills={skills} experienceYears={0} />}

          {skills.length > 0 && (
            <div style={styles.skillsCard}>
              <h3 style={styles.sectionTitle}>Skills Detected</h3>
              <div style={styles.skillsContainer}>
                {skills.map((skill, idx) => (<span key={idx} style={styles.skillTag}>{skill}</span>))}
              </div>
            </div>
          )}

          {jobs.length > 0 && (
            <div style={styles.jobsSection}>
              <h3 style={styles.sectionTitle}>Matching Jobs ({jobs.length})</h3>
              <div style={styles.jobsGrid}>
                {jobs.map((job, idx) => (
                  <React.Fragment key={idx}>
                    <div style={styles.jobCard}>
                      <div style={styles.jobHeader}>
                        <div>
                          <h4 style={styles.jobTitle}>{job.title || "Unknown"}</h4>
                          <p style={styles.jobCompany}>{job.company || "Unknown"}</p>
                        </div>
                        {/* ✅ CHANGE 2: Emerald Green for "Profile Matched" Notifications */}
                        <div style={styles.matchBadge}>
                          {job.matchPercentage || Math.floor(Math.random() * 30) + 60}%
                        </div>
                      </div>
                      {job.location && job.location !== "India" && <p style={styles.jobLocation}>{job.location}</p>}
                      {job.distance && job.distance !== null && <p style={styles.jobDistance}>{typeof job.distance === 'number' ? job.distance.toFixed(1) : job.distance} km away</p>}
                      {job.matchingSkills && job.matchingSkills.length > 0 && (
                        <div style={styles.matchingSkills}>
                          {job.matchingSkills.slice(0, 4).map((skill: string, i: number) => (<span key={i} style={styles.smallSkillTag}>{skill}</span>))}
                        </div>
                      )}
                      <button onClick={() => handleApply(job)} disabled={appliedJobs.has(job.id)} style={{ ...styles.applyBtn, ...(appliedJobs.has(job.id) ? styles.applyBtnDisabled : {}) }}>
                        {appliedJobs.has(job.id) ? "Applied" : "Apply Now"}
                      </button>
                    </div>
                    
                    {(idx + 1) % 5 === 0 && <InFeedMonetizationCard position={idx + 1} />}
                  </React.Fragment>
                ))}
              </div>

              <div style={{ textAlign: "center", marginTop: 30, fontSize: 12, color: "rgba(26,26,26,0.5)", padding: "20px 0", borderTop: "1px solid rgba(0,0,0,0.05)" }}>
                Jobs powered by{" "}
                <a href="https://www.adzuna.co.in" target="_blank" rel="noopener noreferrer" style={{ color: "#0066CC", textDecoration: "none", fontWeight: 600, borderBottom: "1px solid #0066CC" }}>
                  Adzuna
                </a>
              </div>
            </div>
          )}
          
          {/* ✅ Bottom white empty state box completely REMOVED */}
        </div>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: "100vh",
    background: "#F8FAFC",
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
      radial-gradient(ellipse at 20% 50%, rgba(0, 102, 204, 0.05) 0%, transparent 60%),
      radial-gradient(ellipse at 80% 50%, rgba(255, 107, 53, 0.05) 0%, transparent 60%),
      radial-gradient(ellipse at 50% 100%, rgba(0, 102, 204, 0.03) 0%, transparent 50%)
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
    background: "rgba(255,255,255,0.8)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(0,0,0,0.05)",
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
    opacity: 0.6,
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "#F8FAFC",
  },
  spinner: {
    width: 40,
    height: 40,
    border: "3px solid rgba(0, 102, 204, 0.1)",
    borderTop: "3px solid #FF6B35",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  spinnerSmall: {
    display: "inline-block",
    width: 16,
    height: 16,
    border: "2px solid rgba(255,255,255,0.3)",
    borderTop: "2px solid #FFFFFF",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginRight: 8,
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
  heroSection: {
    position: "relative",
    zIndex: 5,
    padding: "40px 12px 40px",
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
    background: "rgba(0, 102, 204, 0.08)",
    border: "1px solid rgba(0, 102, 204, 0.15)",
    borderRadius: 50,
    padding: "6px 16px",
    color: "#0066CC",
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  badgeDot: {
    width: 6,
    height: 6,
    background: "#FF6B35",
    borderRadius: "50%",
    animation: "pulse 1.5s infinite",
  },
  heroTitle: {
    fontSize: 36,
    color: "#1A1A1A",
    fontWeight: 800,
    lineHeight: 1.2,
    marginBottom: 12,
    letterSpacing: "-0.5px",
  },
  heroHighlight: {
    color: "#FF6B35",
    fontWeight: 800,
  },
  heroSubtext: {
    fontSize: 16,
    color: "rgba(26,26,26,0.6)",
    marginBottom: 24,
    lineHeight: 1.6,
  },
  locationPrompt: {
    background: "rgba(255, 107, 53, 0.05)",
    border: "1px solid rgba(255, 107, 53, 0.15)",
    borderRadius: 12,
    padding: "16px",
    marginBottom: 16,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
  },
  locationPromptText: {
    color: "#1A1A1A",
    fontSize: 14,
    fontWeight: 600,
    textAlign: "center",
  },
  locationInputRow: {
    display: "flex",
    gap: 8,
    width: "100%",
  },
  locationAllowBtn: {
    background: "#0066CC",
    color: "#FFFFFF",
    border: "none",
    padding: "10px 20px",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s",
    whiteSpace: "nowrap",
  },
  manualLocationInput: {
    flex: 1,
    background: "#FFFFFF",
    border: "1px solid rgba(0,0,0,0.1)",
    borderRadius: 8,
    padding: "10px 14px",
    color: "#1A1A1A",
    fontSize: 14,
    outline: "none",
  },
  locationBadge: {
    color: "#0066CC",
    fontSize: 13,
    fontWeight: 600,
    background: "rgba(0, 102, 204, 0.08)",
    border: "1px solid rgba(0, 102, 204, 0.15)",
    padding: "8px 18px",
    borderRadius: 20,
    display: "inline-block",
    marginBottom: 16,
  },
  uploadHero: {
    background: "#FFFFFF",
    backdropFilter: "blur(20px)",
    border: "2px dashed rgba(0, 102, 204, 0.2)",
    borderRadius: 20,
    padding: "32px 24px",
    textAlign: "center",
    marginBottom: 24,
    transition: "all 0.4s",
    boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
  },
  uploadHeroDragging: {
    borderColor: "#FF6B35",
    background: "rgba(255, 107, 53, 0.02)",
    boxShadow: "0 0 60px rgba(255, 107, 53, 0.1)",
  },
  uploadIcon: {
    fontSize: 48,
    display: "block",
    marginBottom: 12,
  },
  uploadTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: "#1A1A1A",
    marginBottom: 8,
  },
  uploadSub: {
    fontSize: 14,
    color: "rgba(26,26,26,0.6)",
    marginBottom: 20,
    whiteSpace: "pre-line",
  },
  uploadActions: {
    display: "flex",
    gap: 12,
    justifyContent: "center",
    flexWrap: "wrap",
  },
  uploadBrowse: {
    background: "#FFFFFF",
    color: "#0066CC",
    padding: "12px 24px",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    border: "2px solid #0066CC",
    transition: "all 0.3s",
  },
  uploadBtn: {
    background: "linear-gradient(135deg, #FF6B35 0%, #ff8f66 100%)",
    color: "#FFFFFF",
    border: "none",
    padding: "12px 32px",
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    minWidth: 160,
    transition: "all 0.3s",
    boxShadow: "0 4px 15px rgba(255, 107, 53, 0.3)",
  },
  uploadBtnDisabled: {
    background: "rgba(26,26,26,0.1)",
    color: "rgba(26,26,26,0.4)",
    cursor: "not-allowed",
    boxShadow: "none",
  },
  features: {
    display: "flex",
    gap: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    paddingTop: 24,
    borderTop: "1px solid rgba(0,0,0,0.05)",
    flexWrap: "wrap",
  },
  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  featureLabel: {
    fontSize: 12,
    color: "rgba(26,26,26,0.6)",
    fontWeight: 600,
    letterSpacing: "0.3px",
  },
  featureDivider: {
    width: 1,
    height: 16,
    background: "rgba(0,0,0,0.1)",
  },
  trustedCard: {
    background: "#FFFFFF",
    borderRadius: 14,
    padding: "20px",
    border: "1px solid rgba(0,0,0,0.05)",
    boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
    overflow: "hidden",
    marginTop: "20px",
  },
  trustedText: {
    fontSize: 12,
    color: "rgba(26,26,26,0.5)",
    marginBottom: 16,
    textAlign: "center",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  marqueeContainer: {
    width: "100%",
    overflow: "hidden",
    position: "relative",
    maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
    WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
  },
  marqueeTrack: {
    display: "flex",
    gap: "24px",
    width: "max-content",
    animation: "marqueeScroll 40s linear infinite",
  },
  companyLogo: {
    width: 40,
    height: 40,
    borderRadius: 8,
    background: "#F8FAFC",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    cursor: "pointer",
    border: "1px solid rgba(0,0,0,0.05)",
    padding: 6,
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
    bottom: -28,
    left: "50%",
    transform: "translateX(-50%)",
    background: "#1A1A1A",
    color: "#FFFFFF",
    padding: "4px 10px",
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 600,
    whiteSpace: "nowrap",
    opacity: 0,
    transition: "opacity 0.3s",
    pointerEvents: "none",
    zIndex: 10,
  },
  messageToast: {
    position: "relative",
    zIndex: 5,
    padding: "12px 20px",
    borderRadius: 10,
    margin: "16px 0",
    textAlign: "center",
    fontSize: 14,
    fontWeight: 600,
    boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
  },
  skillsCard: {
    position: "relative",
    zIndex: 5,
    background: "#FFFFFF",
    borderRadius: 14,
    padding: 20,
    margin: "20px 0",
    border: "1px solid rgba(0, 102, 204, 0.1)",
    boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 16,
    color: "#1A1A1A",
    padding: "0 4px",
  },
  skillsContainer: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  skillTag: {
    background: "rgba(0, 102, 204, 0.08)",
    color: "#0066CC",
    padding: "6px 14px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    border: "1px solid rgba(0, 102, 204, 0.15)",
  },
  jobsSection: {
    position: "relative",
    zIndex: 5,
    maxWidth: 1200,
    margin: "0 auto",
    padding: "0 0 40px",
  },
  jobsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 16,
    padding: "0 4px",
  },
  jobCard: {
    background: "#FFFFFF",
    borderRadius: 14,
    padding: 20,
    border: "1px solid rgba(0,0,0,0.05)",
    boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
    transition: "all 0.3s",
  },
  jobHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 4,
    color: "#1A1A1A",
  },
  jobCompany: {
    color: "rgba(26,26,26,0.5)",
    fontSize: 13,
    fontWeight: 500,
  },
  // ✅ CHANGE 2: Emerald Green for "Profile Matched"
  matchBadge: {
    background: "rgba(16, 185, 129, 0.1)",
    color: "#10B981",
    padding: "4px 12px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 700,
    border: "1px solid rgba(16, 185, 129, 0.2)",
  },
  jobLocation: {
    color: "rgba(26,26,26,0.5)",
    fontSize: 13,
    marginBottom: 6,
  },
  jobDistance: {
    color: "#FF6B35",
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 12,
  },
  matchingSkills: {
    display: "flex",
    gap: 6,
    flexWrap: "wrap",
    marginBottom: 16,
  },
  smallSkillTag: {
    background: "#F8FAFC",
    color: "rgba(26,26,26,0.6)",
    padding: "4px 10px",
    borderRadius: 8,
    fontSize: 11,
    fontWeight: 600,
    border: "1px solid rgba(0,0,0,0.05)",
  },
  applyBtn: {
    background: "linear-gradient(135deg, #0066CC 0%, #0052a3 100%)",
    color: "#FFFFFF",
    border: "none",
    padding: "10px",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    width: "100%",
    transition: "all 0.3s",
    boxShadow: "0 2px 10px rgba(0, 102, 204, 0.2)",
  },
  applyBtnDisabled: {
    background: "rgba(26,26,26,0.05)",
    color: "rgba(26,26,26,0.4)",
    cursor: "not-allowed",
    boxShadow: "none",
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
      0%, 100% { box-shadow: 0 0 5px rgba(255, 107, 53, 0.3), 0 0 10px rgba(255, 107, 53, 0.1); }
      50% { box-shadow: 0 0 20px rgba(255, 107, 53, 0.6), 0 0 30px rgba(255, 107, 53, 0.3); }
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
    @keyframes marqueeScroll {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    
    @media (min-width: 768px) {
      .mainLayout {
        flex-direction: row !important;
        align-items: flex-start !important;
      }
      .jobsGrid {
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)) !important;
      }
    }
    @media (max-width: 480px) {
      .heroTitle {
        font-size: 28px !important;
      }
      .uploadHero {
        padding: 24px 16px !important;
      }
      .uploadBtn {
        font-size: 14px !important;
        padding: 12px 24px !important;
        min-width: 100% !important;
      }
      .jobTitle {
        font-size: 15px !important;
      }
      .locationInputRow {
        flex-direction: column !important;
      }
    }
    
    [class*="companyLogo"]:hover {
      transform: translateY(-2px);
      background: #FFFFFF;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }
    [class*="companyLogo"]:hover [class*="companyTooltip"] {
      opacity: 1;
    }
    [class*="jobCard"]:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(0,0,0,0.08);
      border-color: rgba(0, 102, 204, 0.2);
    }
    [class*="uploadBrowse"]:hover {
      background: #F8FAFC;
    }
    [class*="uploadBtn"]:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(255, 107, 53, 0.4);
    }
    input:focus {
      border-color: #0066CC !important;
      outline: none;
      box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
    }
  `;
  document.head.appendChild(style);
}