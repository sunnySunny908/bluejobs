import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for tracking applications (no database needed)
const appliedJobs = new Map<string, {
  jobId: string;
  jobData: any;
  appliedAt: string;
}>();

export async function POST(req: NextRequest) {
  try {
    console.log('📝 Apply Job API called');
    
    const body = await req.json();
    const { jobId, jobData } = body;

    if (!jobId || !jobData) {
      return NextResponse.json(
        { error: 'Missing jobId or jobData' },
        { status: 400 }
      );
    }

    console.log(' Applying to job:', jobData.title);
    console.log('📝 Company:', jobData.company);
    console.log(' Job URL:', jobData.url);

    // Store application in memory
    appliedJobs.set(jobId, {
      jobId,
      jobData,
      appliedAt: new Date().toISOString()
    });

    console.log('✅ Application recorded for:', jobId);

    return NextResponse.json({
      success: true,
      message: 'Application successful',
      jobId,
      redirectUrl: jobData.url
    });

  } catch (error) {
    console.error(' Apply Job Error:', error);
    return NextResponse.json(
      { error: 'Failed to apply' },
      { status: 500 }
    );
  }
}

// GET endpoint to check applied jobs (optional)
export async function GET(req: NextRequest) {
  try {
    const appliedJobsList = Array.from(appliedJobs.values());
    
    return NextResponse.json({
      success: true,
      appliedJobs: appliedJobsList,
      count: appliedJobsList.length
    });
  } catch (error) {
    console.error('❌ Get Applied Jobs Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applied jobs' },
      { status: 500 }
    );
  }
}