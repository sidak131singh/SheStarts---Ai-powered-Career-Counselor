// Career paths database
export const CAREER_PATHS = {
  'HR Business Partner': {
    domain: 'Human Resources',
    description: 'Strategic HR role focused on business alignment',
    avgSalaryInr: 900000,
    remoteAvailability: 'high' as const,
    learningEffortWeeks: 8,
    timeToHireWeeks: 12,
    requiredSkills: [
      'Strategic Thinking',
      'Business Acumen',
      'Employee Relations',
      'HR Analytics',
      'Change Management',
      'HRIS Systems',
    ],
    relatedRoles: [
      'People Operations Manager',
      'HR Manager',
      'Talent Development Manager',
    ],
  },
  'People Operations Manager': {
    domain: 'Human Resources',
    description: 'Operational leadership in HR functions',
    avgSalaryInr: 800000,
    remoteAvailability: 'high' as const,
    learningEffortWeeks: 6,
    timeToHireWeeks: 10,
    requiredSkills: [
      'Operations Management',
      'HR Policies',
      'Team Leadership',
      'Payroll Management',
      'Compliance',
      'Data Management',
    ],
    relatedRoles: [
      'HR Operations Specialist',
      'HR Manager',
      'Payroll Manager',
    ],
  },
  'Talent Acquisition Specialist': {
    domain: 'Human Resources',
    description: 'Recruitment and talent sourcing expert',
    avgSalaryInr: 750000,
    remoteAvailability: 'medium' as const,
    learningEffortWeeks: 4,
    timeToHireWeeks: 8,
    requiredSkills: [
      'Recruitment',
      'Sourcing',
      'Interview Techniques',
      'LinkedIn Recruiting',
      'Job Analysis',
      'ATS Systems',
    ],
    relatedRoles: [
      'Recruiter',
      'Talent Sourcer',
      'HR Generalist',
    ],
  },
  'HR Tech Consultant': {
    domain: 'Human Resources Technology',
    description: 'HR systems and technology implementation',
    avgSalaryInr: 1000000,
    remoteAvailability: 'high' as const,
    learningEffortWeeks: 12,
    timeToHireWeeks: 14,
    requiredSkills: [
      'HRIS Systems',
      'Data Analysis',
      'Process Optimization',
      'Technical Skills',
      'Change Management',
      'Business Analysis',
    ],
    relatedRoles: [
      'HR Systems Administrator',
      'HR Business Analyst',
      'HRIS Manager',
    ],
  },
  'EdTech HR Coordinator': {
    domain: 'Education Technology',
    description: 'HR roles in educational technology companies',
    avgSalaryInr: 650000,
    remoteAvailability: 'high' as const,
    learningEffortWeeks: 5,
    timeToHireWeeks: 9,
    requiredSkills: [
      'EdTech Industry Knowledge',
      'Recruitment',
      'Employee Engagement',
      'Learning Management',
      'Community Building',
      'Cultural Alignment',
    ],
    relatedRoles: [
      'HR Generalist',
      'People Coordinator',
      'Talent Recruiter',
    ],
  },
};

export const INDUSTRIES = [
  'Information Technology',
  'Finance & Banking',
  'Manufacturing',
  'Healthcare',
  'Education',
  'Retail',
  'Media & Entertainment',
  'Consulting',
  'NGO / Non-Profit',
  'Government / Public Sector',
  'Startups',
  'E-commerce',
];

export const SKILLS_DATABASE = {
  technical: [
    'Excel',
    'SQL',
    'Python',
    'Data Analysis',
    'Tableau',
    'Power BI',
    'HRIS Systems',
    'ATS Systems',
    'Salesforce',
  ],
  hr_specific: [
    'Recruitment',
    'Onboarding',
    'Employee Relations',
    'Payroll',
    'Compensation & Benefits',
    'HR Analytics',
    'Learning & Development',
    'Performance Management',
    'Change Management',
  ],
  soft_skills: [
    'Communication',
    'Leadership',
    'Problem Solving',
    'Project Management',
    'Stakeholder Management',
    'Emotional Intelligence',
    'Team Collaboration',
    'Negotiation',
    'Strategic Thinking',
  ],
  certifications: [
    'SHRM-CP / SHRM-SCP',
    'PHR / SPHR',
    'CIPD Level 7',
    'Google Analytics Certificate',
    'Project Management Professional (PMP)',
    'Six Sigma Green Belt',
  ],
};

export const GAP_ACTIVITY_BENEFITS = {
  freelance: {
    label: 'Freelance / Consulting',
    skillsGained: [
      'Client Management',
      'Project Management',
      'Negotiation',
      'Business Acumen',
    ],
    confidenceBoost: 'High',
  },
  volunteering: {
    label: 'Volunteering',
    skillsGained: [
      'Leadership',
      'Team Collaboration',
      'Problem Solving',
      'Social Impact Awareness',
    ],
    confidenceBoost: 'Medium',
  },
  courses: {
    label: 'Online Courses / Certifications',
    skillsGained: ['Technical Skills', 'Domain Knowledge', 'Self-Directed Learning'],
    confidenceBoost: 'High',
  },
  community_leadership: {
    label: 'Community / Group Leadership',
    skillsGained: [
      'Leadership',
      'Organization',
      'Communication',
      'Influence',
    ],
    confidenceBoost: 'Medium-High',
  },
  caregiving: {
    label: 'Caregiving / Family Responsibility',
    skillsGained: [
      'Time Management',
      'Multitasking',
      'Patience',
      'Responsibility',
    ],
    confidenceBoost: 'Low',
  },
  part_time_work: {
    label: 'Part-Time / Contract Work',
    skillsGained: ['Professional Skills', 'Recent Experience', 'Flexibility'],
    confidenceBoost: 'High',
  },
};

export const LEARNING_RESOURCES_BY_SKILL = {
  'Recruitment': [
    { title: 'LinkedIn Recruiter Guide', url: 'https://linkedin.com', type: 'article' },
    { title: 'Recruitment Best Practices', url: 'https://udemy.com', type: 'course' },
  ],
  'HRIS Systems': [
    { title: 'Workday Training', url: 'https://workday.com/en-US/products/hcm/workday-training', type: 'course' },
    { title: 'SAP SuccessFactors', url: 'https://sap.com', type: 'course' },
  ],
  'Excel': [
    { title: 'Excel Mastery Course', url: 'https://udemy.com', type: 'course' },
    { title: 'Advanced Excel Tutorial', url: 'https://youtube.com', type: 'video' },
  ],
  'Data Analysis': [
    { title: 'Google Analytics Certification', url: 'https://analytics.google.com/analytics/academy/', type: 'course' },
    { title: 'Data Analysis with Python', url: 'https://coursera.org', type: 'course' },
  ],
};

export const COMPANIES_HIRING_BY_ROLE = {
  'HR Business Partner': [
    'Infosys',
    'Accenture',
    'HCL Technologies',
    'TCS',
    'Wipro',
    'IBM',
    'Google',
    'Microsoft',
    'Amazon',
  ],
  'Talent Acquisition Specialist': [
    'LinkedIn',
    'Indeed',
    'Naukri.com',
    'LinkedIn Recruiter',
    'Infosys',
    'Google',
  ],
  'HR Tech Consultant': [
    'Workday',
    'SAP',
    'Oracle',
    'ADP',
    'Guidepoint',
  ],
};

export const JOB_BOARDS = ['LinkedIn', 'Naukri', 'Indeed', 'Internshala', 'Glassdoor', 'AngelList'];
