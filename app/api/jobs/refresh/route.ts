import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  // Fetch jobs for multiple categories
  const categories = ['developer', 'aml', 'compliance', 'data scientist', 'financial analyst'];
  
  for (const category of categories) {
    await fetch(`${process.env.NEXTAUTH_URL}/api/fetch-jobs?keyword=${category}`);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
  }
  
  const totalJobs = await prisma.job.count();
  
  return NextResponse.json({ 
    message: 'Jobs refreshed successfully',
    totalJobs 
  });
}