import { UserProfile } from '@/types/assessment';
import { EmployabilityScore, SkillMatchScore, ScoringRubric } from '@/types/scoring';

export const DEFAULT_RUBRIC: ScoringRubric = {
  criticalSkillsWeight: 0.6,
  shouldSkillsWeight: 0.4,
  directMatchValue: 1.0,
  transferableValue: 0.6,
  adjacentValue: 0.3,
  gapDurationPenalty: 0.8,
  activityBonus: {
    freelance: 15,
    volunteering: 10,
    courses: 12,
    community_leadership: 8,
    caregiving: 3,
    part_time_work: 18,
  },
};

function findBestMatch(
  requiredSkill: string,
  currentSkills: string[]
): { type: 'direct' | 'transferable' | 'adjacent'; score: number } {
  // Direct match
  if (currentSkills.includes(requiredSkill)) {
    return { type: 'direct', score: 1.0 };
  }

  // Simple transferable detection (in real app, would use embeddings)
  const transferableMap: Record<string, string[]> = {
    'Project Management': ['Team Leadership', 'Organization', 'Planning'],
    'Communication': ['Presentation', 'Writing', 'Stakeholder Management'],
    'Excel': ['Data Analysis', 'Spreadsheets', 'Reporting'],
    'Python': ['Programming', 'Scripting', 'Data Science'],
    'HR': ['Recruitment', 'Payroll', 'Employee Relations', 'Onboarding'],
  };

  for (const [key, transferables] of Object.entries(transferableMap)) {
    if (currentSkills.some(s => transferables.includes(s))) {
      return { type: 'transferable', score: 0.6 };
    }
  }

  // Adjacent skills (same domain)
  return { type: 'adjacent', score: 0.3 };
}

export function calculateSkillMatchScore(
  requiredSkills: string[],
  currentSkills: string[],
  rubric: ScoringRubric = DEFAULT_RUBRIC
): { score: number; matches: SkillMatchScore[] } {
  const matches: SkillMatchScore[] = [];

  // Separate required skills into critical and should-have
  const criticalSkills = requiredSkills.slice(0, Math.ceil(requiredSkills.length * 0.6));
  const shouldSkills = requiredSkills.slice(Math.ceil(requiredSkills.length * 0.6));

  let score = 0;

  criticalSkills.forEach(skill => {
    const match = findBestMatch(skill, currentSkills);
    matches.push({
      skill,
      type: match.type,
      matchPercentage: match.score * 100,
    });

    const contribution = (match.score / criticalSkills.length) * rubric.criticalSkillsWeight * 100;
    score += contribution;
  });

  shouldSkills.forEach(skill => {
    const match = findBestMatch(skill, currentSkills);
    matches.push({
      skill,
      type: match.type,
      matchPercentage: match.score * 100,
    });

    const contribution = (match.score / shouldSkills.length) * rubric.shouldSkillsWeight * 100;
    score += contribution;
  });

  return {
    score: Math.min(100, Math.round(score)),
    matches,
  };
}

export function calculateGapImpactScore(
  profile: UserProfile,
  rubric: ScoringRubric = DEFAULT_RUBRIC
): number {
  const gapMonths = profile.gap.durationMonths;
  const durationPenalty = Math.min(40, gapMonths * 0.8);

  const activityBonus = profile.gap.activities.reduce((bonus, activity) => {
    const activityValue = rubric.activityBonus[activity] || 5;
    return bonus + activityValue;
  }, 0);

  return Math.min(100, Math.max(20, 100 - durationPenalty + Math.min(30, activityBonus)));
}

export function calculateExperienceRelevanceScore(profile: UserProfile): number {
  const yearsOfExperience = profile.experience.yearsOfExperience;
  const relevantSkills = Object.keys(profile.skills.skillProficiency).length;

  // Base score from years (capped at 50)
  const yearsScore = Math.min(50, (yearsOfExperience / 10) * 50);

  // Bonus from relevant skills (capped at 50)
  const skillsScore = Math.min(50, (relevantSkills / 15) * 50);

  return Math.round(yearsScore + skillsScore);
}

export function calculateMarketDemandScore(careerPath: string): number {
  // In production, this would query market data
  // For now, return a reasonable default
  const demandMap: Record<string, number> = {
    'HR Business Partner': 85,
    'People Operations Manager': 82,
    'Talent Acquisition Specialist': 88,
    'HR Tech Consultant': 80,
    'EdTech HR Coordinator': 75,
  };

  return demandMap[careerPath] || 75;
}

export function calculateLearningProgressScore(
  completedTasks: number,
  totalTasks: number
): number {
  if (totalTasks === 0) return 50;
  return Math.round((completedTasks / totalTasks) * 100);
}

export function calculateConfidenceReadinessScore(
  profile: UserProfile,
  completedTasks: number
): number {
  // Base confidence from gap activities and recent engagement
  const activityBonus = profile.gap.activities.length * 5;
  const taskBonus = Math.min(30, completedTasks * 2);

  return Math.round(50 + activityBonus + taskBonus);
}

export function calculateOverallEmployabilityScore(
  skillMatch: number,
  gapImpact: number,
  experienceRelevance: number,
  marketDemand: number,
  learningProgress: number,
  confidenceReadiness: number
): number {
  // Weighted average
  const weights = {
    skillMatch: 0.25,
    gapImpact: 0.20,
    experienceRelevance: 0.15,
    marketDemand: 0.15,
    learningProgress: 0.15,
    confidenceReadiness: 0.10,
  };

  const total =
    skillMatch * weights.skillMatch +
    gapImpact * weights.gapImpact +
    experienceRelevance * weights.experienceRelevance +
    marketDemand * weights.marketDemand +
    learningProgress * weights.learningProgress +
    confidenceReadiness * weights.confidenceReadiness;

  return Math.min(100, Math.round(total));
}

export function generateScoringNarrative(score: number): string {
  if (score >= 90) {
    return 'You are job-ready! Focus on final interview prep and applications.';
  } else if (score >= 75) {
    return 'Very strong positioning! Targeted skill work will get you there.';
  } else if (score >= 60) {
    return 'Good foundation. Follow the roadmap and you will be competitive.';
  } else if (score >= 45) {
    return 'You have the potential! A structured learning path is essential.';
  } else {
    return 'Start with foundational skills and build systematically.';
  }
}
