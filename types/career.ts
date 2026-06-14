export interface CareerRecommendation {
  rank: number;
  title: string;
  domain: string;
  matchScore: number;
  matchReasoning: string;
  avgSalaryInr: number;
  remoteAvailability: 'high' | 'medium' | 'low';
  learningEffortWeeks: number;
  timeToHireWeeks: number;
  isPivot: boolean;
  pivotDifficulty?: 'easy' | 'moderate' | 'challenging';
  companiesHiring: string[];
  jobBoards: string[];
  keySkillsNeeded: string[];
  growthPotential: string;
}

export interface CareerRecommendations {
  userId: string;
  profileSnapshot: any;
  recommendations: CareerRecommendation[];
  selectedPath?: CareerRecommendation;
  generatedAt: Date;
  isActive: boolean;
}

export interface SkillGap {
  skill: string;
  currentLevel: 'none' | 'beginner' | 'intermediate' | 'advanced';
  requiredLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  importance: 'must' | 'should' | 'nice';
  gapSeverity: 'critical' | 'moderate' | 'minor';
  priorityOrder: number;
  avgTimeToLearnHours: number;
  resourcesAvailable: string[];
  isTransferable: boolean;
}

export interface SkillGapAnalysis {
  userId: string;
  careerPath: string;
  currentSkills: SkillGap[];
  requiredSkills: SkillGap[];
  transferableSkills: SkillGap[];
  criticalGaps: SkillGap[];
  quickWins: SkillGap[];
  totalLearningHours: number;
  estimatedWeeks: number;
  generatedAt: Date;
}

export interface RoadmapTask {
  id: string;
  title: string;
  description: string;
  estimatedHours: number;
  dueDate: Date;
  completed: boolean;
  completedDate?: Date;
  resourceLinks: {
    title: string;
    url: string;
    type: 'course' | 'article' | 'video' | 'book' | 'project';
  }[];
  skillsAddressed: string[];
  priority: 'high' | 'medium' | 'low';
}

export interface RoadmapPhase {
  phase: 'thirty_day' | 'sixty_day' | 'ninety_day';
  startDate: Date;
  endDate: Date;
  goals: string[];
  tasks: RoadmapTask[];
  skillsCovered: string[];
  expectedScore: number;
}

export interface Roadmap {
  userId: string;
  careerPath: string;
  createdAt: Date;
  updatedAt: Date;
  thirtyDayPlan: RoadmapPhase;
  sixtyDayPlan: RoadmapPhase;
  ninetyDayPlan: RoadmapPhase;
  totalEstimatedHours: number;
  estimatedCompletionDate: Date;
  projectedFinalScore: number;
  isActive: boolean;
}

export interface RoadmapProgress {
  userId: string;
  taskId: string;
  completionDate: Date;
  hoursSpent: number;
  notesOrReflection: string;
}
