"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const result = await signIn("credentials", { 
        email, 
        password, 
        redirect: false 
      });
      
      if (result?.error) {
        setError("Invalid email or password");
        setLoading(false);
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.logo}>
          <span style={{ color: "#2563eb" }}>blue</span>
          <span style={{ color: "#f59e0b" }}>jobs</span>
        </h1>
        <h2 style={styles.title}>Welcome Back!</h2>
        <p style={styles.subtitle}>Login to your account</p>
        
        {error && (
          <div style={styles.errorBox}>
            <span style={styles.errorIcon}>⚠️</span>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input 
              type="email" 
              placeholder="Enter your email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              style={styles.input}
            />
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input 
              type="password" 
              placeholder="Enter your password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              style={styles.input}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            style={{
              ...styles.loginBtn,
              ...(loading ? styles.loginBtnDisabled : {})
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        
        <p style={styles.signupText}>
          Don't have an account? <Link href="/signup" style={styles.signupLink}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "20px",
  },
  card: {
    background: "white",
    borderRadius: "20px",
    padding: "40px",
    maxWidth: "420px",
    width: "100%",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
  },
  logo: {
    fontSize: "36px",
    fontWeight: "bold",
    textAlign: "center" as const,
    marginBottom: "8px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "600",
    color: "#1f2937",
    textAlign: "center" as const,
    marginBottom: "4px",
  },
  subtitle: {
    fontSize: "14px",
    color: "#6b7280",
    textAlign: "center" as const,
    marginBottom: "24px",
  },
  errorBox: {
    background: "#fee2e2",
    color: "#dc2626",
    padding: "12px 16px",
    borderRadius: "10px",
    fontSize: "14px",
    marginBottom: "16px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  errorIcon: {
    fontSize: "16px",
  },
  form: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "16px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "4px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#374151",
  },
  input: {
    padding: "12px 16px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    transition: "border-color 0.3s",
    outline: "none",
    width: "100%",
    boxSizing: "border-box" as const,
  },
  loginBtn: {
    padding: "12px",
    borderRadius: "10px",
    background: "#2563eb",
    color: "white",
    border: "none",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background 0.3s",
    width: "100%",
  },
  loginBtnDisabled: {
    background: "#9ca3af",
    cursor: "not-allowed",
  },
  signupText: {
    textAlign: "center" as const,
    fontSize: "14px",
    color: "#6b7280",
    marginTop: "16px",
  },
  signupLink: {
    color: "#2563eb",
    fontWeight: "600",
    textDecoration: "none",
  },
};