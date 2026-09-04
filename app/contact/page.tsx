export default function ContactUs() {
  return (
    <div style={{ maxWidth: 600, margin: "40px auto", padding: "0 20px", color: "white", fontFamily: "sans-serif", textAlign: "center" }}>
      <h1 style={{ fontSize: 32, marginBottom: 20 }}>Contact Us</h1>
      <p style={{ lineHeight: 1.8, color: "rgba(255,255,255,0.7)", marginBottom: 40 }}>
        Have questions, feedback, or need support? We are here to help. Reach out to us using the details below.
      </p>
      
      <div style={{ background: "rgba(255,255,255,0.05)", padding: 30, borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)" }}>
        <h3 style={{ marginBottom: 20, color: "#f59e0b" }}>Get in Touch</h3>
        <p style={{ fontSize: 18, marginBottom: 15 }}>📞 <strong>Phone:</strong> +91 8796214431</p>
        <p style={{ fontSize: 18, marginBottom: 15 }}>✉️ <strong>Email:</strong> support@bluejobs.com</p>
        <p style={{ fontSize: 18 }}>📍 <strong>Location:</strong> Noida, Uttar Pradesh, India</p>
      </div>

      <p style={{ marginTop: 40, fontSize: 14, color: "rgba(255,255,255,0.5)" }}>
        Our support team typically responds within 24 hours.
      </p>
    </div>
  );
}