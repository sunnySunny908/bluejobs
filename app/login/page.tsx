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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) setError("Invalid credentials");
    else router.push("/dashboard");
  };

  return (
    <div style={{ maxWidth: 400, margin: "50px auto", padding: 20 }}>
      <h1 style={{ fontSize: 32, textAlign: "center" }}>
        <span style={{ color: "blue" }}>blue</span>
        <span style={{ color: "gold" }}>jobs</span>
      </h1>
      <h2>Login</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: "100%", padding: 10, margin: "10px 0" }} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: "100%", padding: 10, margin: "10px 0" }} />
        <button type="submit" style={{ width: "100%", padding: 10, background: "blue", color: "white", border: "none", borderRadius: 5 }}>Login</button>
      </form>
      <button onClick={() => signIn("google", { callbackUrl: "/dashboard" })} style={{ width: "100%", padding: 10, marginTop: 10, background: "#db4437", color: "white", border: "none", borderRadius: 5 }}>Sign in with Google</button>
      <p style={{ marginTop: 20 }}>No account? <Link href="/signup">Sign up</Link></p>
    </div>
  );
}