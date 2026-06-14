import { NextRequest, NextResponse } from 'next/server';
import { getUserProfile, getCareerRecommendations, saveCareerRecommendations } from '@/lib/db/queries';
import { generateUserResults } from '@/lib/results/userResults';

function isValidApiKey(): boolean {
  const key = process.env.ANTHROPIC_API_KEY;
  return !!(key && key !== 'your-anthropic-key-here' && key.startsWith('sk-ant-'));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, forceRegenerate } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Check for cached recommendations
    if (!forceRegenerate) {
      const cached = await getCareerRecommendations(userId);
      if (cached) {
        return NextResponse.json({
          success: true,
          recommendations: cached.recommendations,
          cached: true,
        });
      }
    }

    // Load profile
    const profile = await getUserProfile(userId);
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found. Complete assessment first.' }, { status: 404 });
    }

    let recommendations;

    if (isValidApiKey()) {
      // Use AI for recommendations
      try {
        const { Anthropic } = await import('@anthropic-ai/sdk');
        const { CAREER_RECOMMENDATION_SYSTEM_PROMPT } = await import('@/lib/prompts/systemPrompts');

        const client = new Anthropic();
        const profileContext = buildProfileContext(profile);

        const response = await client.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 3000,
          system: CAREER_RECOMMENDATION_SYSTEM_PROMPT,
          messages: [{
            role: 'user',
            content: `Analyze this profile and provide 5 career path recommendations as a JSON array:\n\n${profileContext}`,
          }],
        });

        const content = response.content[0];
        if (content.type === 'text') {
          const jsonMatch = content.text.match(/```json\n([\s\S]*?)\n```/) ||
                            content.text.match(/\[[\s\S]*\]/);
          const parsed = JSON.parse(jsonMatch?.[1] || jsonMatch?.[0] || content.text);
          recommendations = Array.isArray(parsed) ? parsed : parsed.recommendations || [];
        }
      } catch (aiError) {
        console.error('AI recommendations failed, using rule-based fallback:', aiError);
      }
    }

    // Fallback to rule-based engine
    if (!recommendations || recommendations.length === 0) {
      const results = generateUserResults(profile);
      recommendations = results.recommendations;
    }

    // Save and return
    await saveCareerRecommendations({
      userId,
      profileSnapshot: profile,
      recommendations,
      generatedAt: new Date(),
      isActive: true,
    });

    return NextResponse.json({ success: true, recommendations });
  } catch (error) {
    console.error('Career recommendations API error:', error);
    return NextResponse.json({ error: 'Failed to generate recommendations' }, { status: 500 });
  }
}

function buildProfileContext(profile: any): string {
  return `
User: ${profile.name || 'Unknown'}, ${profile.preferences?.location || 'India'}
Education: ${profile.education?.highestEducation} in ${profile.education?.educationField}
Experience: ${profile.experience?.yearsOfExperience} years as ${profile.experience?.lastJobTitle} at ${profile.experience?.lastCompany}
Industry: ${profile.experience?.industry}
Career gap: ${profile.gap?.durationMonths} months (${profile.gap?.reason})
Gap activities: ${profile.gap?.activities?.join(', ')}
Current skills: ${profile.skills?.currentSkills?.join(', ')}
Certifications: ${profile.skills?.certifications?.map((c: any) => c.name).join(', ') || 'None'}
Work preference: ${profile.preferences?.workPreference}
Preferred industries: ${profile.preferences?.preferredIndustries?.join(', ')}
Salary expectation: ₹${profile.preferences?.salaryExpectationMin}–₹${profile.preferences?.salaryExpectationMax}
Timeline: ${profile.preferences?.targetTimelineMonths} months
Daily study hours: ${profile.availability?.dailyStudyHours}
Learning style: ${profile.availability?.learningStyle}
Motivation: ${profile.motivationStatement || 'Not provided'}
Concerns: ${profile.concerns?.join(', ') || 'None'}
  `.trim();
}
