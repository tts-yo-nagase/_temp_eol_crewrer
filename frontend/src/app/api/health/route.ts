import { NextResponse } from 'next/server';

export async function GET() {
  try {

    return NextResponse.json(
      { status: 'healthy', message: 'Service is running' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { status: 'unhealthy', message: 'Service is not healthy' },
      { status: 503 }
    );
  }
} 