export default function AboutUs() {
  return (
    <div style={{ maxWidth: 800, margin: "40px auto", padding: "0 20px", color: "white", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: 32, marginBottom: 20 }}>About BlueJobs</h1>
      <p style={{ lineHeight: 1.8, color: "rgba(255,255,255,0.7)", fontSize: 18 }}>
        BlueJobs is an innovative, AI-powered job matching platform designed to bridge the gap between talented professionals and their dream opportunities.
      </p>
      <h3 style={{ marginTop: 30, marginBottom: 10 }}>Our Mission</h3>
      <p style={{ lineHeight: 1.8, color: "rgba(255,255,255,0.7)" }}>
        Traditional job hunting is broken. Endless scrolling, outdated postings, and irrelevant matches waste valuable time. Our mission is to streamline this process by leveraging advanced AI to analyze your CV in seconds and connect you with highly relevant, 7-day fresh job openings within a 70km radius of your location.
      </p>
      <h3 style={{ marginTop: 30, marginBottom: 10 }}>How It Helps You</h3>
      <ul style={{ lineHeight: 1.8, color: "rgba(255,255,255,0.7)", paddingLeft: 20 }}>
        <li><strong>AI-Powered Matching:</strong> Our system intelligently extracts your core skills (like US Payroll, Tax Compliance, etc.) to find jobs that truly fit your profile.</li>
        <li><strong>Hyper-Local Focus:</strong> By focusing on a 70km radius, we help you find quality opportunities without the burden of an unreasonable commute.</li>
        <li><strong>Fresh Opportunities:</strong> We only show jobs posted in the last 7 days, ensuring you are always applying to active, responsive roles.</li>
        <li><strong>Privacy First:</strong> Your data is processed securely, and we never sell your information to third parties.</li>
      </ul>
      <p style={{ marginTop: 40, fontSize: 14, color: "rgba(255,255,255,0.5)" }}>Based in Noida, India. Empowering careers since 2026.</p>
    </div>
  );
}