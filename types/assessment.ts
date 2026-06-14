export type EducationLevel = 'high_school' | 'diploma' | 'bachelors' | 'masters' | 'phd' | 'other';
export type CareerGapReason = 'childcare' | 'relocation' | 'health' | 'marriage' | 'personal' | 'other';
export type GapActivity = 'freelance' | 'volunteering' | 'courses' | 'community_leadership' | 'caregiving' | 'part_time_work' | 'other';
export type WorkPreference = 'remote' | 'hybrid' | 'onsite';
export type LearningStyle = 'self_paced' | 'structured' | 'project_based';

export interface EducationProfile {
  highestEducation: EducationLevel;
  educationField: string;
  educationInstitution: string;
  graduationYear: number;
}

export interface WorkExperience {
  yearsOfExperience: number;
  lastJobTitle: string;
  lastCompany: string;
  industry: string;
  jobFunctions: string[];
}

export interface CareerGap {
  startDate: Date;
  endDate: Date;
  durationMonths: number;
  reason: CareerGapReason;
  activities: GapActivity[];
}

export interface SkillProfile {
  currentSkills: string[];
  skillProficiency: Record<string, 'beginner' | 'intermediate' | 'advanced'>;
  languages: string[];
  certifications: {
    name: string;
    issuer: string;
    year: number;
  }[];
}

export interface CareerPreferences {
  targetCareerPaths: string[];
  workPreference: WorkPreference;
  location: string;
  preferredIndustries: string[];
  salaryExpectationMin: number;
  salaryExpectationMax: number;
  currency: string;
  targetTimelineMonths: number;
}

export interface TimeAvailability {
  dailyStudyHours: number;
  weeklyAvailableDays: number;
  canAttendBootcamp: boolean;
  learningStyle: LearningStyle;
}

export interface UserProfile {
  userId: string;
  email: string;
  name?: string;
  
  // Sections
  education: EducationProfile;
  experience: WorkExperience;
  gap: CareerGap;
  skills: SkillProfile;
  preferences: CareerPreferences;
  availability: TimeAvailability;
  
  // Additional context
  motivationStatement: string;
  concerns: string[];
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface AssessmentStep {
  step: number;
  title: string;
  description: string;
  fields: string[];
  completed: boolean;
}

export interface AssessmentState {
  currentStep: number;
  data: Partial<UserProfile>;
  isComplete: boolean;
  steps: AssessmentStep[];
}
