import { NextRequest, NextResponse } from 'next/server';
import {
  calculateSkillMatchScore,
  calculateGapImpactScore,
  calculateExperienceRelevanceScore,
  calculateMarketDemandScore,
  calculateLearningProgressScore,
  calculateConfidenceReadinessScore,
  calculateOverallEmployabilityScore,
  generateScoringNarrative,
} from '@/lib/scoring/employabilityEngine';
import { getUserProfile, getEmployabilityScore, saveEmployabilityScore } from '@/lib/db/queries';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, recalculate = false } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Return cached score if available
    if (!recalculate) {
      const cached = await getEmployabilityScore(userId);
      if (cached) {
        return NextResponse.json({ success: true, ...cached, cached: true });
      }
    }

    // Load profile
    const profile = await getUserProfile(userId);
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found. Complete assessment first.' }, { status: 404 });
    }

    // Determine career path and required skills
    const careerPath = profile.preferences?.targetCareerPaths?.[0] || 'HR Business Partner';
    const requiredSkillsMap: Record<string, string[]> = {
      'HR Business Partner': ['HR', 'Employee Relations', 'Communication', 'Excel', 'People Analytics', 'Stakeholder Management'],
      'Data Analyst': ['Excel', 'SQL', 'Python', 'Data Visualization', 'Statistics', 'Reporting'],
      'Digital Marketing': ['SEO', 'Social Media', 'Content Marketing', 'Google Analytics', 'Email Marketing'],
      'Product Manager': ['Product Strategy', 'Agile', 'Data Analysis', 'User Research', 'Roadmapping'],
    };
    const requiredSkills = requiredSkillsMap[careerPath] || requiredSkillsMap['HR Business Partner'];

    const currentSkills = profile.skills?.currentSkills || [];
    const skillMatchResult = calculateSkillMatchScore(requiredSkills, currentSkills);
    const gapImpact = calculateGapImpactScore(profile);
    const experienceRelevance = calculateExperienceRelevanceScore(profile);
    const marketDemand = calculateMarketDemandScore(careerPath);
    const learningProgress = calculateLearningProgressScore(0, 10);
    const confidenceReadiness = calculateConfidenceReadinessScore(profile, 0);

    const overallScore = calculateOverallEmployabilityScore(
      skillMatchResult.score,
      gapImpact,
      experienceRelevance,
      marketDemand,
      learningProgress,
      confidenceReadiness
    );

    const employabilityScore = {
      userId,
      overallScore,
      skillMatch: skillMatchResult.score,
      gapManagement: gapImpact,
      experienceRelevance,
      marketDemand,
      learningProgress,
      confidenceReadiness,
      skillMatches: skillMatchResult.matches,
      strengths: [
        profile.experience?.yearsOfExperience > 0 ? `${profile.experience.yearsOfExperience} years of relevant ${profile.experience.industry} experience` : '',
        (profile.gap?.activities?.length ?? 0) > 0 ? 'Proactively maintained skills during career break' : '',
        (profile.availability?.dailyStudyHours ?? 0) >= 2 ? 'Strong daily learning commitment' : '',
        (profile.skills?.certifications?.length ?? 0) > 0 ? 'Demonstrated commitment to continuous learning' : '',
      ].filter(Boolean),
      areasForImprovement: [
        skillMatchResult.score < 70 ? 'Close the highest-priority skill gaps for target role' : '',
        (profile.gap?.durationMonths ?? 0) > 24 ? 'Build recent proof of work to offset career gap' : '',
        confidenceReadiness < 60 ? 'Build confidence through mock interviews and portfolio projects' : '',
      ].filter(Boolean),
      nextActions: [
        `Complete one foundational course for ${careerPath}`,
        'Build a portfolio project to demonstrate skills',
        'Update LinkedIn with restart narrative and apply to 3 roles',
      ],
      scoreHistory: [{ date: new Date(), score: overallScore, component: 'Initial Assessment' }],
      generatedAt: new Date(),
      careerPath,
    };

    await saveEmployabilityScore(employabilityScore);

    return NextResponse.json({
      success: true,
      ...employabilityScore,
      narrative: generateScoringNarrative(overallScore),
    });
  } catch (error) {
    console.error('Employability score API error:', error);
    return NextResponse.json({ error: 'Failed to calculate score' }, { status: 500 });
  }
}
