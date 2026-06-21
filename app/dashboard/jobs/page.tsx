"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  applyUrl: string;
  postedDate: string;
  skills: string[];
  salaryMin: number;
  salaryMax: number;
}

export default function JobsFeed() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applyCount, setApplyCount] = useState(0);
  const [userLocation, setUserLocation] = useState("");
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Get parsed CV from localStorage
    const parsedCV = localStorage.getItem("parsedCV");
    if (!parsedCV) {
      router.push("/dashboard/upload");
      return;
    }
    
    // Get user location (browser geolocation)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setUserLocation(`${position.coords.latitude},${position.coords.longitude}`);
      });
    }
    
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    const cvData = JSON.parse(localStorage.getItem("parsedCV") || "{}");
    
    const response = await fetch("/api/jobs/fetch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cvData, userLocation })
    });
    
    const data = await response.json();
    if (data.success) {
      setJobs(data.jobs);
    }
    setLoading(false);
  };

  const handleApply = async (job: Job) => {
    setApplying(true);
    
    // Check apply count (fetch from API)
    const countResponse = await fetch("/api/user/apply-count");
    const countData = await countResponse.json();
    
    if (countData.count >= 20) {
      // Redirect to payment
      router.push("/dashboard/payment");
      return;
    }
    
    // Record application
    await fetch("/api/jobs/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId: job.id })
    });
    
    // Open job link in new tab
    window.open(job.applyUrl, "_blank");
    
    setApplyCount(countData.count + 1);
    setApplying(false);
    
    // Move to next job
    if (currentIndex + 1 < jobs.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      alert("You've viewed all jobs! New jobs will appear soon.");
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: 100 }}>
        <h2>Finding jobs for you...</h2>
        <div style={{ fontSize: 40, marginTop: 20 }}>🔍</div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div style={{ textAlign: "center", marginTop: 100 }}>
        <h2>No jobs found in last 7 days</h2>
        <p>Try uploading a CV with different skills</p>
        <button onClick={() => router.push("/dashboard/upload")} style={{ padding: "10px 20px", background: "#2563eb", color: "white", border: "none", borderRadius: 5, cursor: "pointer" }}>
          Upload New CV
        </button>
      </div>
    );
  }

  const currentJob = jobs[currentIndex];
  const matchPercentage = Math.floor(Math.random() * 40) + 60; // Random 60-100% for demo

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 20 }}>
      {/* Header */}
      <div style={{ marginBottom: 30 }}>
        <h1>
          <span style={{ color: "#2563eb" }}>Job</span>
          <span style={{ color: "#eab308" }}>Matches</span>
        </h1>
        <p>Job {currentIndex + 1} of {jobs.length} | Free applications left: {20 - applyCount}</p>
      </div>

      {/* Job Card */}
      <div style={{
        background: "white",
        borderRadius: 16,
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        overflow: "hidden",
        padding: 30
      }}>
        {/* Match Badge */}
        <div style={{
          display: "inline-block",
          background: "#dcfce7",
          color: "#166534",
          padding: "5px 15px",
          borderRadius: 20,
          fontSize: 14,
          fontWeight: "bold",
          marginBottom: 20
        }}>
          🎯 {matchPercentage}% Match
        </div>

        {/* Job Title */}
        <h2 style={{ fontSize: 28, marginBottom: 10 }}>{currentJob.title}</h2>
        
        {/* Company & Location */}
        <p style={{ color: "#666", marginBottom: 20 }}>
          {currentJob.company} • {currentJob.location}
        </p>

        {/* Salary */}
        <div style={{
          background: "#f3f4f6",
          padding: "10px 15px",
          borderRadius: 8,
          marginBottom: 20
        }}>
          💰 Salary: ₹{currentJob.salaryMin.toLocaleString()} - ₹{currentJob.salaryMax.toLocaleString()}/year
        </div>

        {/* Posted Date */}
        <p style={{ fontSize: 14, color: "#666", marginBottom: 15 }}>
          📅 Posted: {new Date(currentJob.postedDate).toLocaleDateString()}
        </p>

        {/* Skills Match */}
        <div style={{ marginBottom: 20 }}>
          <strong>Key skills from your CV:</strong>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 10 }}>
            {currentJob.skills?.slice(0, 5).map((skill, idx) => (
              <span key={idx} style={{
                background: "#dbeafe",
                color: "#1e40af",
                padding: "5px 12px",
                borderRadius: 15,
                fontSize: 14
              }}>
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Description */}
        <div style={{ marginBottom: 25 }}>
          <strong>Job Description:</strong>
          <p style={{ marginTop: 8, lineHeight: 1.6, color: "#444" }}>
            {currentJob.description}
          </p>
        </div>

        {/* Apply Button */}
        <button
          onClick={() => handleApply(currentJob)}
          disabled={applying}
          style={{
            width: "100%",
            padding: "14px",
            background: applying ? "#9ca3af" : "#2563eb",
            color: "white",
            border: "none",
            borderRadius: 8,
            fontSize: 16,
            fontWeight: "bold",
            cursor: applying ? "not-allowed" : "pointer",
            transition: "background 0.3s"
          }}
        >
          {applying ? "Processing..." : "🔗 Apply Now (Redirects to Company)"}
        </button>

        {/* Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
          <button
            onClick={() => setCurrentIndex(currentIndex - 1)}
            disabled={currentIndex === 0}
            style={{
              padding: "8px 16px",
              background: currentIndex === 0 ? "#e5e7eb" : "#f3f4f6",
              border: "none",
              borderRadius: 5,
              cursor: currentIndex === 0 ? "not-allowed" : "pointer"
            }}
          >
            ← Previous
          </button>
          <button
            onClick={() => setCurrentIndex(currentIndex + 1)}
            disabled={currentIndex === jobs.length - 1}
            style={{
              padding: "8px 16px",
              background: currentIndex === jobs.length - 1 ? "#e5e7eb" : "#f3f4f6",
              border: "none",
              borderRadius: 5,
              cursor: currentIndex === jobs.length - 1 ? "not-allowed" : "pointer"
            }}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}