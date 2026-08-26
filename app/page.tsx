"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();

  return (
    <div style={styles.container}>
      {/* Navigation */}
      <nav style={styles.navbar}>
        <div style={styles.navContent}>
          <div style={styles.logo}>
            <span style={{ color: "#2563eb" }}>blue</span>
            <span style={{ color: "#f59e0b" }}>jobs</span>
          </div>
          <div style={styles.navLinks}>
            <a href="/" style={{ ...styles.navLink, ...styles.activeNavLink }}>Home</a>
            <a href="/jobs" style={styles.navLink}>Browse Jobs</a>
            {session ? (
              <a href="/dashboard" style={styles.loginBtn}>Dashboard</a>
            ) : (
              <a href="/login" style={styles.loginBtn}>Login</a>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.title}>
            Find Your <span style={{ color: "#f59e0b" }}>Dream Job</span> with AI
          </h1>
          <p style={styles.subtitle}>
            Upload your CV and get matched with <strong>7-day fresh</strong> job opportunities within <strong>70km</strong> of your location.
          </p>
          <div style={styles.ctaContainer}>
            <Link href={session ? "/dashboard" : "/signup"} style={styles.primaryCta}>
              Get Started Free →
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div style={styles.featuresSection}>
        <div style={styles.featuresGrid}>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>📄</div>
            <h3 style={styles.featureTitle}>Smart CV Parsing</h3>
            <p style={styles.featureDesc}>AI extracts your skills, experience, and location automatically from any CV format.</p>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>🎯</div>
            <h3 style={styles.featureTitle}>90%+ Match Accuracy</h3>
            <p style={styles.featureDesc}>Get jobs that truly match your profile with our advanced AI matching algorithm.</p>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>📍</div>
            <h3 style={styles.featureTitle}>70km Radius</h3>
            <p style={styles.featureDesc}>Find opportunities near you — no unnecessary commute, only relevant jobs.</p>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>⚡</div>
            <h3 style={styles.featureTitle}>Last 7 Days Only</h3>
            <p style={styles.featureDesc}>Fresh job postings from the last 7 days. Never miss out on new opportunities.</p>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div style={styles.howItWorks}>
        <h2 style={styles.sectionTitle}>How <span style={{ color: "#2563eb" }}>bluejobs</span> Works</h2>
        <div style={styles.steps}>
          <div style={styles.step}>
            <div style={styles.stepNumber}>1</div>
            <h4>Upload CV</h4>
            <p>PDF, DOCX, or TXT format</p>
          </div>
          <div style={styles.stepArrow}>→</div>
          <div style={styles.step}>
            <div style={styles.stepNumber}>2</div>
            <h4>AI Analysis</h4>
            <p>Skills & experience extraction</p>
          </div>
          <div style={styles.stepArrow}>→</div>
          <div style={styles.step}>
            <div style={styles.stepNumber}>3</div>
            <h4>Get Matches</h4>
            <p>Curated job feed within 70km</p>
          </div>
          <div style={styles.stepArrow}>→</div>
          <div style={styles.step}>
            <div style={styles.stepNumber}>4</div>
            <h4>Apply Directly</h4>
            <p>One-click applications</p>
          </div>
        </div>
      </div>

      {/* Trusted Companies */}
      <div style={styles.trustedSection}>
        <h2 style={styles.sectionTitle}>Trusted by candidates at 500+ Fortune companies</h2>
        <div style={styles.companyGrid}>
          <span style={styles.companyTag}>Google</span>
          <span style={styles.companyTag}>Microsoft</span>
          <span style={styles.companyTag}>Amazon</span>
          <span style={styles.companyTag}>Apple</span>
          <span style={styles.companyTag}>Meta</span>
          <span style={styles.companyTag}>Netflix</span>
          <span style={styles.companyTag}>Tesla</span>
          <span style={styles.companyTag}>IBM</span>
          <span style={styles.companyTag}>Samsung</span>
          <span style={styles.companyTag}>Intel</span>
          <span style={styles.companyTag}>NVIDIA</span>
          <span style={styles.companyTag}>Adobe</span>
        </div>
      </div>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div>
            <div style={styles.footerLogo}>
              <span style={{ color: "#2563eb", fontWeight: "bold" }}>blue</span>
              <span style={{ color: "#f59e0b", fontWeight: "bold" }}>jobs</span>
            </div>
            <p style={styles.footerText}>AI-powered job matching platform</p>
          </div>
          <div style={styles.footerLinks}>
            <a href="/privacy" style={styles.footerLink}>Privacy</a>
            <a href="/terms" style={styles.footerLink}>Terms</a>
            <a href="/contact" style={styles.footerLink}>Contact</a>
          </div>
        </div>
        <div style={styles.copyright}>
          © 2024 bluejobs — All rights reserved.
        </div>
      </footer>
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
    padding: "16px 24px",
    borderBottom: "1px solid #e2e8f0",
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
    color: "#64748b",
    fontWeight: 500,
  },
  activeNavLink: {
    color: "#2563eb",
    borderBottom: "2px solid #2563eb",
    paddingBottom: 4,
  },
  loginBtn: {
    background: "#2563eb",
    color: "white",
    padding: "8px 20px",
    borderRadius: 8,
    textDecoration: "none",
    fontWeight: 500,
  },
  hero: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "80px 24px",
    textAlign: "center" as const,
  },
  heroContent: {
    maxWidth: 700,
    margin: "0 auto",
  },
  title: {
    fontSize: 44,
    color: "white",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 32,
  },
  ctaContainer: {
    display: "flex",
    justifyContent: "center",
  },
  primaryCta: {
    background: "white",
    color: "#667eea",
    padding: "14px 32px",
    borderRadius: 10,
    textDecoration: "none",
    fontWeight: 600,
    fontSize: 16,
  },
  featuresSection: {
    maxWidth: 1200,
    margin: "-40px auto 0",
    padding: "0 24px 40px",
  },
  featuresGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 24,
    background: "white",
    padding: 40,
    borderRadius: 16,
    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
  },
  featureCard: {
    textAlign: "center" as const,
  },
  featureIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 18,
    marginBottom: 8,
    color: "#1f2937",
  },
  featureDesc: {
    color: "#64748b",
    fontSize: 14,
    lineHeight: 1.6,
  },
  howItWorks: {
    maxWidth: 1000,
    margin: "60px auto",
    padding: "0 24px",
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center" as const,
    marginBottom: 40,
    color: "#1f2937",
  },
  steps: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap" as const,
    gap: 8,
  },
  step: {
    textAlign: "center" as const,
    background: "white",
    padding: "24px 20px",
    borderRadius: 12,
    minWidth: 140,
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  },
  stepNumber: {
    width: 40,
    height: 40,
    background: "#2563eb",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
    color: "white",
    fontWeight: "bold",
    margin: "0 auto 12px",
  },
  stepArrow: {
    fontSize: 24,
    color: "#cbd5e1",
    fontWeight: "bold",
  },
  trustedSection: {
    maxWidth: 1000,
    margin: "0 auto 60px",
    padding: "0 24px",
    textAlign: "center" as const,
  },
  companyGrid: {
    display: "flex",
    flexWrap: "wrap" as const,
    justifyContent: "center",
    gap: 12,
    marginTop: 20,
  },
  companyTag: {
    background: "white",
    padding: "8px 20px",
    borderRadius: 20,
    color: "#475569",
    fontSize: 14,
    fontWeight: 500,
    border: "1px solid #e2e8f0",
  },
  footer: {
    background: "white",
    borderTop: "1px solid #e2e8f0",
    padding: "40px 24px 20px",
  },
  footerContent: {
    maxWidth: 1200,
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap" as const,
  },
  footerLogo: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  footerText: {
    fontSize: 12,
    color: "#94a3b8",
  },
  footerLinks: {
    display: "flex",
    gap: 24,
  },
  footerLink: {
    color: "#94a3b8",
    textDecoration: "none",
    fontSize: 14,
  },
  copyright: {
    maxWidth: 1200,
    margin: "32px auto 0",
    textAlign: "center" as const,
    fontSize: 12,
    color: "#94a3b8",
    borderTop: "1px solid #e2e8f0",
    paddingTop: 20,
  },
};