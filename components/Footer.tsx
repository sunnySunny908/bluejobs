import Link from "next/link";

export default function Footer() {
  return (
    <footer style={styles.footer}>
      <div style={styles.footerContent}>
        {/* Column 1: Brand */}
        <div style={styles.footerSection}>
          <h4 style={styles.footerTitle}>JobSwitchers</h4>
          <p style={styles.footerText}>
            AI-powered job matching platform connecting top talent with their dream opportunities in seconds.
          </p>
        </div>
        
        {/* Column 2: Quick Links */}
        <div style={styles.footerSection}>
          <h4 style={styles.footerTitle}>Quick Links</h4>
          <div style={styles.footerLinks}>
            <Link href="/privacy" style={styles.footerLink}>Privacy Policy</Link>
            <Link href="/about" style={styles.footerLink}>About Us</Link>
            <Link href="/contact" style={styles.footerLink}>Contact Us</Link>
            <Link href="/terms" style={styles.footerLink}>Terms & Conditions</Link>
          </div>
        </div>
        
        {/* Column 3: Contact Info */}
        <div style={styles.footerSection}>
          <h4 style={styles.footerTitle}>Contact Us</h4>
          <p style={styles.footerText}> Phone: +91 8796214431</p>
          <p style={styles.footerText}>✉️ Email: support@jobswitchers.com</p>
          <p style={styles.footerText}>📍 Location: Noida, India</p>
        </div>
      </div>
      
      <div style={styles.footerBottom}>
        <p style={styles.copyright}>© 2026 JobSwitchers. All rights reserved.</p>
      </div>
    </footer>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  footer: {
    background: "rgba(15, 23, 42, 0.9)",
    backdropFilter: "blur(20px)",
    borderTop: "1px solid rgba(255,255,255,0.05)",
    padding: "40px 20px 20px",
    marginTop: "60px",
  },
  footerContent: {
    maxWidth: 1200,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: 30,
    marginBottom: 30,
  },
  footerSection: {
    textAlign: "left",
  },
  footerTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: "white",
    marginBottom: 12,
  },
  footerText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    marginBottom: 8,
    lineHeight: 1.6,
  },
  footerLinks: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  footerLink: {
    color: "rgba(255,255,255,0.6)",
    textDecoration: "none",
    fontSize: 13,
    transition: "color 0.3s",
  },
  footerBottom: {
    borderTop: "1px solid rgba(255,255,255,0.05)",
    paddingTop: 20,
    textAlign: "center",
  },
  copyright: {
    fontSize: 12,
    color: "rgba(255,255,255,0.4)",
  },
};