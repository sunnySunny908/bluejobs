"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function UploadCV() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { data: session } = useSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a CV file");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("cv", file);

    try {
      const response = await fetch("/api/cv/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        // Store parsed data in session/localStorage for now
        localStorage.setItem("parsedCV", JSON.stringify(data.parsedData));
        router.push("/dashboard/jobs");
      } else {
        setError(data.error || "Upload failed");
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return <div>Please login</div>;
  }

  return (
    <div style={{ maxWidth: 600, margin: "50px auto", padding: 20 }}>
      <h1 style={{ marginBottom: 20 }}>
        <span style={{ color: "#2563eb" }}>Upload</span>{" "}
        <span style={{ color: "#eab308" }}>Your CV</span>
      </h1>
      
      <div style={{ 
        background: "#f9fafb", 
        padding: 30, 
        borderRadius: 10,
        border: "2px dashed #cbd5e1"
      }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", marginBottom: 10, fontWeight: "bold" }}>
              Upload CV (PDF or DOCX)
            </label>
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              style={{ 
                width: "100%", 
                padding: 10, 
                border: "1px solid #cbd5e1", 
                borderRadius: 5 
              }}
              required
            />
          </div>
          
          {error && (
            <div style={{ background: "#fee2e2", color: "#dc2626", padding: 10, borderRadius: 5, marginBottom: 20 }}>
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              background: loading ? "#9ca3af" : "#2563eb",
              color: "white",
              border: "none",
              borderRadius: 5,
              fontSize: 16,
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Processing CV..." : "Upload & Find Jobs"}
          </button>
        </form>
      </div>

      <div style={{ marginTop: 30, padding: 20, background: "#fef3c7", borderRadius: 10 }}>
        <h3>📄 Supported formats:</h3>
        <ul>
          <li>PDF files (.pdf)</li>
          <li>Microsoft Word (.docx)</li>
        </ul>
        <p style={{ fontSize: 14, color: "#666", marginTop: 10 }}>
          Your CV will be parsed to extract: Skills, Job Roles, Experience, Location
        </p>
      </div>
    </div>
  );
}