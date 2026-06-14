export interface SkillMatchScore {
  skill: string;
  type: 'direct' | 'transferable' | 'adjacent';
  matchPercentage: number;
}

export interface EmployabilityScore {
  userId: string;
  overallScore: number;
  skillMatch: number;
  gapManagement: number;
  experienceRelevance: number;
  marketDemand: number;
  learningProgress: number;
  confidenceReadiness: number;
  
  skillMatches: SkillMatchScore[];
  strengths: string[];
  areasForImprovement: string[];
  nextActions: string[];
  
  scoreHistory: EmployabilityScoreHistory[];
  generatedAt: Date;
  careerPath: string;
}

export interface EmployabilityScoreHistory {
  date: Date;
  score: number;
  component: string; // which component improved
}

export interface ScoreProjection {
  day30: number;
  day60: number;
  day90: number;
  trajectory: 'accelerating' | 'steady' | 'slow';
}

export interface ScoringRubric {
  criticalSkillsWeight: number; // 60%
  shouldSkillsWeight: number;   // 40%
  directMatchValue: number;     // 1.0
  transferableValue: number;    // 0.6
  adjacentValue: number;        // 0.3
  gapDurationPenalty: number;   // per month
  activityBonus: Record<string, number>;
}

export enum ScoreGrade {
  Excellent = 'Excellent', // 90-100
  Very_Good = 'VeryGood',  // 75-89
  Good = 'Good',           // 60-74
  Fair = 'Fair',           // 45-59
  Needs_Improvement = 'NeedsImprovement' // <45
}

export function getScoreGrade(score: number): ScoreGrade {
  if (score >= 90) return ScoreGrade.Excellent;
  if (score >= 75) return ScoreGrade.Very_Good;
  if (score >= 60) return ScoreGrade.Good;
  if (score >= 45) return ScoreGrade.Fair;
  return ScoreGrade.Needs_Improvement;
}

export function getScoreColor(score: number): string {
  if (score >= 90) return '#10b981'; // emerald
  if (score >= 75) return '#3b82f6'; // blue
  if (score >= 60) return '#f59e0b'; // amber
  if (score >= 45) return '#ef4444'; // red
  return '#dc2626'; // dark red
}
