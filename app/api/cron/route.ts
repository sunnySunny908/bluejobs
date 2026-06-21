import { NextResponse } from 'next/server';

// This will run when server starts
export async function GET() {
  // Refresh jobs every 6 hours
  const refresh = async () => {
    await fetch(`${process.env.NEXTAUTH_URL}/api/jobs/refresh`, { method: 'POST' });
  };
  
  // Initial refresh
  await refresh();
  
  // Schedule refresh every 6 hours
  setInterval(refresh, 6 * 60 * 60 * 1000);
  
  return NextResponse.json({ message: 'Job refresh scheduler started' });
}