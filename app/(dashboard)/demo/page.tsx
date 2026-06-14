'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';
import { generateUserId } from '@/lib/utils';

export default function DemoPage() {
  const router = useRouter();
  const { setUser } = useUserStore();

  useEffect(() => {
    // Set demo user and redirect to dashboard
    setUser('priya.sharma@shestarts.demo', 'Priya Sharma');

    // Pre-populate demo data in the API
    const seedDemo = async () => {
      try {
        const userId = generateUserId('priya.sharma@shestarts.demo');
        const demoProfile = {
          userId,
          email: 'priya.sharma@shestarts.demo',
          name: 'Priya Sharma',
          education: { highestEducation: 'bachelors', educationField: 'Business Administration', educationInstitution: 'Bangalore University', graduationYear: 2014 },
          experience: { yearsOfExperience: 3, lastJobTitle: 'HR Generalist', lastCompany: 'Infosys BPO', industry: 'IT Services', jobFunctions: ['Recruitment', 'Onboarding', 'Payroll', 'Employee Relations'] },
          gap: { startDate: new Date('2019-03-01'), endDate: new Date('2024-03-01'), durationMonths: 60, reason: 'childcare', activities: ['volunteering', 'courses', 'caregiving'] },
          skills: {
            currentSkills: ['Recruitment', 'Onboarding', 'Excel', 'Payroll', 'Employee Relations', 'HRMS', 'Policy Development', 'Communication'],
            skillProficiency: { Recruitment: 'intermediate', Excel: 'intermediate', Payroll: 'beginner' },
            languages: ['English', 'Hindi', 'Kannada'],
            certifications: [],
          },
          preferences: {
            targetCareerPaths: ['HR Business Partner', 'People Operations Manager'],
            workPreference: 'remote',
            location: 'Bangalore, India',
            preferredIndustries: ['Technology', 'SaaS', 'EdTech'],
            salaryExpectationMin: 600000,
            salaryExpectationMax: 900000,
            currency: 'INR',
            targetTimelineMonths: 3,
          },
          availability: { dailyStudyHours: 2.5, weeklyAvailableDays: 5, canAttendBootcamp: false, learningStyle: 'self_paced' },
          motivationStatement: "I want to restart my career in HR, ideally in a remote role in the tech sector. I've been actively upskilling during my break and feel ready to contribute.",
          concerns: ['technology gap', 'interview confidence', 'age bias'],
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await fetch('/api/assessment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, profile: demoProfile, step: 7 }),
        });
      } catch {}
    };

    seedDemo().then(() => {
      router.push('/dashboard');
    });
  }, [router, setUser]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 flex items-center justify-center">
      <div className="text-center text-white">
        <div className="animate-spin w-12 h-12 border-4 border-white border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-lg font-semibold">Setting up Priya's demo...</p>
        <p className="text-purple-300 text-sm mt-1">Just a moment</p>
      </div>
    </div>
  );
}
