"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Signup() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, mobile, password }),
    });
    const data = await res.json();
    if (res.ok) {
      router.push("/login");
    } else {
      setError(data.error);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "50px auto", padding: 20 }}>
      <h1 style={{ fontSize: 32, textAlign: "center" }}>
        <span style={{ color: "blue" }}>blue</span>
        <span style={{ color: "gold" }}>jobs</span>
      </h1>
      <h2>Sign Up</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required style={{ width: "100%", padding: 10, margin: "10px 0" }} />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: "100%", padding: 10, margin: "10px 0" }} />
        <input type="tel" placeholder="Mobile Number" value={mobile} onChange={(e) => setMobile(e.target.value)} required style={{ width: "100%", padding: 10, margin: "10px 0" }} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: "100%", padding: 10, margin: "10px 0" }} />
        <button type="submit" style={{ width: "100%", padding: 10, background: "blue", color: "white", border: "none", borderRadius: 5 }}>Sign Up</button>
      </form>
      <p style={{ marginTop: 20 }}>Already have an account? <Link href="/login">Login</Link></p>
    </div>
  );
}