import { NextRequest, NextResponse } from 'next/server';
import { getUserProfile, saveUserProfile } from '@/lib/db/queries';
import { validateAssessmentStep } from '@/lib/utils/validators';
import { UserProfile } from '@/types/assessment';

interface AssessmentRequestBody {
  userId?: string;
  profile?: Partial<UserProfile>;
  step?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AssessmentRequestBody;
    const { userId, profile, step } = body;

    if (!userId || !profile) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate current step
    if (step !== undefined) {
      try {
        validateAssessmentStep(step, profile);
      } catch (error: unknown) {
        if (!(error instanceof Error)) {
          throw error;
        }

        return NextResponse.json(
          { error: error.message, field: 'field' in error ? error.field : undefined },
          { status: 400 }
        );
      }
    }

    // Save profile
    const userProfile: UserProfile = {
      ...profile,
      userId,
      email: profile.email || '',
      name: profile.name,
      createdAt: profile.createdAt || new Date(),
      updatedAt: new Date(),
    } as UserProfile;

    await saveUserProfile(userProfile);

    return NextResponse.json({
      success: true,
      message: 'Assessment step saved successfully',
      profile: userProfile,
    });
  } catch (error: unknown) {
    console.error('Assessment API error:', error);
    return NextResponse.json(
      { error: 'Failed to save assessment' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const profile = await getUserProfile(userId);

    if (!profile) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    return NextResponse.json({ profile });
  } catch {
    return NextResponse.json(
      { error: 'Failed to retrieve assessment' },
      { status: 500 }
    );
  }
}
