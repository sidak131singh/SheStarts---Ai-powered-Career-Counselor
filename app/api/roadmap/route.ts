import { NextRequest, NextResponse } from 'next/server';
import { getUserProfile } from '@/lib/db/queries';
import { generateUserResults } from '@/lib/results/userResults';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const profile = await getUserProfile(userId);
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const results = generateUserResults(profile);
    return NextResponse.json({ roadmap: results.roadmap });
  } catch (error) {
    console.error('Roadmap API error:', error);
    return NextResponse.json({ error: 'Failed to generate roadmap' }, { status: 500 });
  }
}
