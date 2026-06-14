import { UserProfile } from '@/types/assessment';
import { CareerRecommendation, RoadmapPhase } from '@/types/career';
import { EmployabilityScore } from '@/types/scoring';
import {
  calculateConfidenceReadinessScore,
  calculateExperienceRelevanceScore,
  calculateGapImpactScore,
  calculateLearningProgressScore,
  calculateMarketDemandScore,
  calculateOverallEmployabilityScore,
  calculateSkillMatchScore,
  generateScoringNarrative,
} from '@/lib/scoring/employabilityEngine';

export interface GeneratedResults {
  recommendations: CareerRecommendation[];
  score: EmployabilityScore;
  scoreNarrative: string;
  roadmap: RoadmapPhase[];
}

const ROLE_SKILLS: Record<string, string[]> = {
  'HR Business Partner': [
    'HR',
    'Employee Relations',
    'Communication',
    'Excel',
    'Stakeholder Management',
    'People Analytics',
  ],
  'Talent Acquisition Specialist': [
    'Recruitment',
    'Communication',
    'LinkedIn',
    'Interviewing',
    'Applicant Tracking Systems',
  ],
  'People Operations Coordinator': [
    'Onboarding',
    'Excel',
    'Payroll',
    'HRMS',
    'Employee Relations',
  ],
  'Data Analyst': ['Excel', 'SQL', 'Data Analysis', 'Dashboards', 'Python', 'Reporting'],
  'Business Operations Analyst': [
    'Excel',
    'Process Improvement',
    'Project Management',
    'Communication',
    'Reporting',
  ],
  'Customer Success Specialist': [
    'Communication',
    'Problem Solving',
    'CRM',
    'Customer Support',
    'Presentation',
  ],
  'Project Coordinator': [
    'Project Management',
    'Planning',
    'Communication',
    'Excel',
    'Stakeholder Management',
  ],
  'Learning Program Coordinator': [
    'Teaching',
    'Training',
    'Communication',
    'Content Development',
    'Program Management',
  ],
};

function titleCase(value: string): string {
  return value
    .replace(/_/g, ' ')
    .replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}

function inferRolePool(profile: UserProfile): string[] {
  const skills = profile.skills.currentSkills.join(' ').toLowerCase();
  const role = profile.experience.lastJobTitle.toLowerCase();
  const targets = profile.preferences.targetCareerPaths.filter(Boolean);

  const inferred: string[] = [];

  if (targets.length) {
    inferred.push(...targets);
  }

  if (/hr|recruit|payroll|employee|onboarding|talent/.test(`${skills} ${role}`)) {
    inferred.push('HR Business Partner', 'Talent Acquisition Specialist', 'People Operations Coordinator');
  }

  if (/excel|data|python|sql|analysis|report/.test(`${skills} ${role}`)) {
    inferred.push('Data Analyst', 'Business Operations Analyst');
  }

  if (/teach|training|education|content|program/.test(`${skills} ${role}`)) {
    inferred.push('Learning Program Coordinator', 'Project Coordinator');
  }

  inferred.push('Project Coordinator', 'Customer Success Specialist', 'Business Operations Analyst');

  return [...new Set(inferred)].slice(0, 5);
}

function requiredSkillsFor(role: string, profile: UserProfile): string[] {
  const direct = ROLE_SKILLS[role];
  if (direct) {
    return direct;
  }

  return [
    ...profile.skills.currentSkills.slice(0, 2),
    'Communication',
    'Excel',
    'Project Management',
    'Stakeholder Management',
  ].filter(Boolean);
}

function estimateSalary(profile: UserProfile, rank: number): number {
  const min = profile.preferences.salaryExpectationMin || 400000;
  const max = profile.preferences.salaryExpectationMax || Math.max(min + 300000, 800000);
  const midpoint = Math.round((min + max) / 2);

  return Math.max(300000, midpoint - (rank - 1) * 50000);
}

export function generateUserResults(profile: UserProfile): GeneratedResults {
  const roles = inferRolePool(profile);

  const recommendations = roles.map((role, index) => {
    const requiredSkills = requiredSkillsFor(role, profile);
    const skillMatch = calculateSkillMatchScore(requiredSkills, profile.skills.currentSkills);
    const experienceBonus = Math.min(12, profile.experience.yearsOfExperience * 2);
    const preferenceBonus = profile.preferences.targetCareerPaths.includes(role) ? 8 : 0;
    const matchScore = Math.min(95, Math.max(45, skillMatch.score + experienceBonus + preferenceBonus));

    return {
      rank: index + 1,
      title: role,
      domain: profile.experience.industry || profile.preferences.preferredIndustries[0] || 'General',
      matchScore,
      matchReasoning: `Matches your ${profile.experience.yearsOfExperience} years of experience, ${profile.skills.currentSkills.length} listed skills, and ${profile.preferences.workPreference} work preference.`,
      avgSalaryInr: estimateSalary(profile, index + 1),
      remoteAvailability: profile.preferences.workPreference === 'remote' ? 'high' : 'medium',
      learningEffortWeeks: Math.max(4, Math.min(16, requiredSkills.length * 2 - Math.round(skillMatch.score / 20))),
      timeToHireWeeks: Math.max(6, profile.preferences.targetTimelineMonths * 4),
      isPivot: !role.toLowerCase().includes(profile.experience.lastJobTitle.toLowerCase().split(' ')[0] || role),
      pivotDifficulty: matchScore >= 75 ? 'easy' : matchScore >= 60 ? 'moderate' : 'challenging',
      companiesHiring: ['LinkedIn jobs', 'Naukri', 'Indeed', 'Remote OK'],
      jobBoards: ['LinkedIn', 'Naukri', 'Indeed', 'Instahyre'],
      keySkillsNeeded: requiredSkills,
      growthPotential: matchScore >= 75 ? 'High' : 'Moderate',
    } satisfies CareerRecommendation;
  });

  const topRecommendation = recommendations[0];
  const requiredSkills = topRecommendation?.keySkillsNeeded ?? ['Communication', 'Excel'];
  const skillMatch = calculateSkillMatchScore(requiredSkills, profile.skills.currentSkills);
  const gapManagement = calculateGapImpactScore(profile);
  const experienceRelevance = calculateExperienceRelevanceScore(profile);
  const marketDemand = calculateMarketDemandScore(topRecommendation?.title ?? '');
  const learningProgress = calculateLearningProgressScore(0, 9);
  const confidenceReadiness = calculateConfidenceReadinessScore(profile, 0);
  const overallScore = calculateOverallEmployabilityScore(
    skillMatch.score,
    gapManagement,
    experienceRelevance,
    marketDemand,
    learningProgress,
    confidenceReadiness
  );

  const score: EmployabilityScore = {
    userId: profile.userId,
    overallScore,
    skillMatch: skillMatch.score,
    gapManagement,
    experienceRelevance,
    marketDemand,
    learningProgress,
    confidenceReadiness,
    skillMatches: skillMatch.matches,
    strengths: [
      profile.experience.yearsOfExperience
        ? `${profile.experience.yearsOfExperience} years of prior experience`
        : '',
      profile.gap.activities.length ? 'Stayed active during the career break' : '',
      profile.availability.dailyStudyHours >= 2 ? 'Consistent weekly learning capacity' : '',
    ].filter(Boolean),
    areasForImprovement: [
      skillMatch.score < 70 ? 'Close the highest-priority skill gaps for the top role' : '',
      profile.gap.durationMonths > 24 ? 'Build recent proof of work to offset the career gap' : '',
      'Practice interviews and update your resume for the target role',
    ].filter(Boolean),
    nextActions: [
      `Build one portfolio project for ${topRecommendation?.title ?? 'your target role'}`,
      `Learn ${requiredSkills.slice(0, 3).join(', ')}`,
      'Apply to 5 well-matched roles each week after the first project is ready',
    ],
    scoreHistory: [{ date: new Date(), score: overallScore, component: 'Initial Assessment' }],
    generatedAt: new Date(),
    careerPath: topRecommendation?.title ?? 'Target Role',
  };

  const roadmap = buildRoadmap(profile, topRecommendation?.title ?? 'Target Role', requiredSkills, overallScore);

  return {
    recommendations,
    score,
    scoreNarrative: generateScoringNarrative(overallScore),
    roadmap,
  };
}

function buildRoadmap(
  profile: UserProfile,
  careerPath: string,
  requiredSkills: string[],
  initialScore: number
): RoadmapPhase[] {
  const now = new Date();
  const skillFocus = requiredSkills.filter((skill) => !profile.skills.currentSkills.includes(skill));
  const firstSkills = skillFocus.slice(0, 3).join(', ') || requiredSkills.slice(0, 3).join(', ');

  return [
    {
      phase: 'thirty_day',
      startDate: now,
      endDate: addDays(now, 30),
      goals: [
        `Refresh core ${careerPath} fundamentals`,
        `Strengthen ${firstSkills}`,
        'Update resume and LinkedIn with restart story',
      ],
      tasks: [
        task('audit-skills', 'Skill gap audit', 'Compare your current skills against target job posts.', 3, 7, [
          'Skill planning',
        ]),
        task('learn-core', `Learn ${firstSkills}`, 'Complete a focused beginner-to-intermediate learning block.', 18, 21, [
          firstSkills,
        ]),
        task('resume-refresh', 'Resume refresh', 'Rewrite resume bullets around outcomes and transferable skills.', 5, 28, [
          'Resume',
        ]),
      ],
      skillsCovered: requiredSkills.slice(0, 4),
      expectedScore: Math.min(100, initialScore + 8),
    },
    {
      phase: 'sixty_day',
      startDate: addDays(now, 31),
      endDate: addDays(now, 60),
      goals: [
        'Build recent proof of work',
        'Create one portfolio-ready project',
        'Start networking with target-role professionals',
      ],
      tasks: [
        task('portfolio-project', `${careerPath} portfolio project`, 'Build a practical project based on a real job scenario.', 25, 45, [
          careerPath,
        ]),
        task('networking', 'Informational interviews', 'Speak with at least 3 people in your target role.', 6, 55, [
          'Networking',
        ]),
        task('profile-update', 'Profile update', 'Publish your project summary on LinkedIn or a portfolio page.', 4, 60, [
          'Personal branding',
        ]),
      ],
      skillsCovered: requiredSkills.slice(2, 6),
      expectedScore: Math.min(100, initialScore + 16),
    },
    {
      phase: 'ninety_day',
      startDate: addDays(now, 61),
      endDate: addDays(now, 90),
      goals: [
        'Apply to matched roles consistently',
        'Practice interviews with STAR stories',
        'Negotiate around your preferred work setup',
      ],
      tasks: [
        task('mock-interviews', 'Mock interviews', 'Practice 5 role-specific interviews and refine answers.', 10, 75, [
          'Interviewing',
        ]),
        task('applications', 'Targeted applications', 'Apply to 20 matched jobs with customized resumes.', 12, 85, [
          'Job search',
        ]),
        task('offer-readiness', 'Offer readiness', 'Prepare salary, remote-work, and availability talking points.', 4, 90, [
          'Negotiation',
        ]),
      ],
      skillsCovered: requiredSkills,
      expectedScore: Math.min(100, initialScore + 25),
    },
  ];
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function task(
  id: string,
  title: string,
  description: string,
  estimatedHours: number,
  dueInDays: number,
  skillsAddressed: string[]
) {
  return {
    id,
    title,
    description,
    estimatedHours,
    dueDate: addDays(new Date(), dueInDays),
    completed: false,
    resourceLinks: [
      {
        title: `${titleCase(skillsAddressed[0] ?? title)} resources`,
        url: 'https://www.coursera.org/',
        type: 'course' as const,
      },
    ],
    skillsAddressed,
    priority: dueInDays <= 30 ? ('high' as const) : ('medium' as const),
  };
}
