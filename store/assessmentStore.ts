import { create } from 'zustand';
import { UserProfile } from '@/types/assessment';

interface AssessmentStore {
  profile: Partial<UserProfile>;
  currentStep: number;
  isComplete: boolean;
  
  // Actions
  setProfile: (profile: Partial<UserProfile>) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  completeAssessment: () => void;
  resetAssessment: () => void;
  getAssessmentData: () => Partial<UserProfile>;
}

const initialProfile: Partial<UserProfile> = {
  education: {
    highestEducation: 'bachelors',
    educationField: '',
    educationInstitution: '',
    graduationYear: new Date().getFullYear(),
  },
  experience: {
    yearsOfExperience: 0,
    lastJobTitle: '',
    lastCompany: '',
    industry: '',
    jobFunctions: [],
  },
  gap: {
    startDate: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
    endDate: new Date(),
    durationMonths: 0,
    reason: 'childcare',
    activities: [],
  },
  skills: {
    currentSkills: [],
    skillProficiency: {},
    languages: [],
    certifications: [],
  },
  preferences: {
    targetCareerPaths: [],
    workPreference: 'remote',
    location: '',
    preferredIndustries: [],
    salaryExpectationMin: 0,
    salaryExpectationMax: 0,
    currency: 'INR',
    targetTimelineMonths: 3,
  },
  availability: {
    dailyStudyHours: 2.5,
    weeklyAvailableDays: 5,
    canAttendBootcamp: false,
    learningStyle: 'self_paced',
  },
  motivationStatement: '',
  concerns: [],
};

export const useAssessmentStore = create<AssessmentStore>((set, get) => ({
  profile: initialProfile,
  currentStep: 0,
  isComplete: false,
  
  setProfile: (profile) => set({ profile }),
  
  updateProfile: (updates) => set((state) => ({
    profile: { ...state.profile, ...updates },
  })),
  
  setCurrentStep: (step) => set({ currentStep: step }),
  
  nextStep: () => set((state) => ({
    currentStep: Math.min(state.currentStep + 1, 7),
  })),
  
  previousStep: () => set((state) => ({
    currentStep: Math.max(state.currentStep - 1, 0),
  })),
  
  completeAssessment: () => set({ isComplete: true, currentStep: 8 }),
  
  resetAssessment: () => set({
    profile: initialProfile,
    currentStep: 0,
    isComplete: false,
  }),
  
  getAssessmentData: () => get().profile,
}));
