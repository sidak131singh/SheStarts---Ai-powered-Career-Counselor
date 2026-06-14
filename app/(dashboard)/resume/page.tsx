'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getUserId } from '@/store/userStore';

interface ResumeAnalysis {
  atsScore: number;
  atsIssues: string[];
  strengths: string[];
  improvements: { section: string; issue: string; suggestion: string }[];
  suggestedSummary: string;
  extractedSkills: string[];
}

const DEMO_ANALYSIS: ResumeAnalysis = {
  atsScore: 63,
  atsIssues: [
    'Missing keywords: "People Analytics", "HRIS", "OKR", "Change Management"',
    'Employment gap is visible but not addressed in summary',
    'No quantified achievements in experience section',
    'Skills section lacks role-specific keywords',
  ],
  strengths: [
    'Clear chronological format — ATS-friendly',
    'Education section is properly structured',
    'Contact information is complete',
    'Multiple relevant HR keywords present',
  ],
  improvements: [
    { section: 'Summary', issue: 'Generic summary doesn\'t address the career gap', suggestion: 'Add a confident 2-3 sentence restart narrative: "HR professional with 3 years of experience in [industry]. After a purposeful career break focused on [activities], I am returning with fresh perspective and updated skills in [new skills]."' },
    { section: 'Experience', issue: 'Responsibilities listed but no quantified outcomes', suggestion: 'Change "Managed recruitment process" to "Reduced time-to-hire by 23% by implementing structured interview process for 30+ positions annually"' },
    { section: 'Skills', issue: 'Missing in-demand HRBP skills', suggestion: 'Add: People Analytics, HRIS (Darwinbox/Workday), OKR Frameworks, DEI Initiatives, Stakeholder Management' },
    { section: 'Career Gap', issue: 'Gap not explained, may raise questions', suggestion: 'Add a "Career Break" entry: "2019–2024 | Career Break — Childcare & Upskilling | Completed [courses], maintained skills in [areas]"' },
  ],
  suggestedSummary: 'Results-oriented HR Business Partner with 3+ years of progressive experience in talent acquisition, employee relations, and HR operations. After a purposeful career break for family responsibilities, I return with enhanced perspective and current knowledge in People Analytics and modern HRIS platforms. Passionate about building high-performance cultures and enabling business growth through strategic HR partnership. Seeking remote or hybrid HRBP roles in tech-forward organizations.',
  extractedSkills: ['Recruitment', 'Employee Relations', 'Payroll', 'Onboarding', 'Excel', 'HRMS', 'Policy Development', 'Performance Management'],
};

export default function ResumePage() {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [analysisStep, setAnalysisStep] = useState(0);

  const ANALYSIS_STEPS = [
    'Parsing document structure...',
    'Extracting skills and experience...',
    'Checking ATS compatibility...',
    'Comparing with job market requirements...',
    'Generating improvement suggestions...',
  ];

  const handleFileUpload = (file: File) => {
    if (!file) return;
    if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
      alert('Please upload a PDF or Word document (.pdf, .doc, .docx)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setFileName(file.name);
    setIsAnalyzing(true);
    setAnalysisStep(0);

    // Simulate analysis steps
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setAnalysisStep(step);
      if (step >= ANALYSIS_STEPS.length) {
        clearInterval(interval);
        setTimeout(() => {
          setIsAnalyzing(false);
          setAnalysis(DEMO_ANALYSIS);
        }, 500);
      }
    }, 800);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  };

  const getAtsColor = (score: number) => {
    if (score >= 80) return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', bar: 'bg-green-500', label: 'Good' };
    if (score >= 60) return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', bar: 'bg-amber-500', label: 'Needs Work' };
    return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', bar: 'bg-red-500', label: 'Poor' };
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="text-\[#0D6B7A\] font-medium text-sm">AI-Powered Resume Review</p>
        <h1 className="text-2xl md:text-3xl font-black text-gray-900 mt-1">Resume Analyzer</h1>
        <p className="text-gray-500 mt-1 text-sm">Get your ATS score, identify gaps, and see AI-suggested improvements</p>
      </div>

      {!analysis && (
        <>
          {/* Upload Area */}
          <div
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`rounded-2xl border-2 border-dashed p-12 text-center transition-all ${
              isDragging ? 'border-\[#00C4BA\] bg-\[#EFF7F7\]' : 'border-gray-300 bg-white hover:border-\[#00C4BA\] hover:bg-\[#EFF7F7\]/50'
            }`}
          >
            <div className="text-5xl mb-4">📄</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Upload Your Resume</h2>
            <p className="text-gray-500 mb-6">Drag & drop or click to upload your PDF or Word document</p>
            <label className="inline-flex items-center gap-2 px-6 py-3 bg-\[#0B3540\] text-white font-semibold rounded-xl hover:bg-purple-800 cursor-pointer transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Choose File
              <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} className="hidden" />
            </label>
            <p className="text-xs text-gray-400 mt-3">Supports PDF, DOC, DOCX · Max 5MB</p>
          </div>

          {/* Analysis in progress */}
          {isAnalyzing && (
            <div className="mt-6 bg-white rounded-2xl border border-\[#00C4BA\] p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="animate-spin w-6 h-6 border-3 border-\[#0B3540\] border-t-transparent rounded-full" style={{ borderWidth: '3px' }} />
                <span className="font-bold text-\[#0B3540\]">Analyzing {fileName}...</span>
              </div>
              <div className="space-y-2">
                {ANALYSIS_STEPS.map((step, i) => (
                  <div key={i} className={`flex items-center gap-3 text-sm transition-all ${i < analysisStep ? 'text-green-600' : i === analysisStep ? 'text-\[#0D6B7A\] font-medium' : 'text-gray-400'}`}>
                    <span className="w-5 h-5 flex items-center justify-center rounded-full flex-shrink-0 text-xs">
                      {i < analysisStep ? '✓' : i === analysisStep ? '⟳' : '○'}
                    </span>
                    {step}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Demo option */}
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center gap-4">
            <span className="text-2xl">💡</span>
            <div className="flex-1">
              <p className="font-semibold text-amber-900">Want to see a demo analysis?</p>
              <p className="text-sm text-amber-700 mt-0.5">See how Priya's HR resume would be analyzed for an HRBP role</p>
            </div>
            <button
              onClick={() => { setFileName('Priya_Sharma_Resume.pdf'); setAnalysis(DEMO_ANALYSIS); }}
              className="px-4 py-2 bg-amber-400 text-amber-900 font-semibold rounded-xl hover:bg-amber-300 transition-colors text-sm flex-shrink-0"
            >
              View Demo
            </button>
          </div>
        </>
      )}

      {analysis && (
        <div className="space-y-6">
          {/* ATS Score */}
          {(() => {
            const c = getAtsColor(analysis.atsScore);
            return (
              <div className={`rounded-2xl border p-6 ${c.bg} ${c.border}`}>
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div>
                    <h2 className="font-black text-gray-900 text-xl">ATS Compatibility Score</h2>
                    <p className="text-gray-500 text-sm mt-0.5">for {fileName}</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-4xl font-black ${c.text}`}>{analysis.atsScore}</div>
                    <div className={`text-sm font-semibold ${c.text}`}>{c.label}</div>
                  </div>
                </div>
                <div className="h-3 bg-white/50 rounded-full overflow-hidden">
                  <div className={`h-full ${c.bar} rounded-full transition-all duration-1000`} style={{ width: `${analysis.atsScore}%` }} />
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  {analysis.atsScore >= 80 ? 'Your resume will pass most ATS filters.' :
                   analysis.atsScore >= 60 ? 'Your resume will pass some ATS systems but needs improvement for competitive roles.' :
                   'Many ATS systems may filter out your resume before a human sees it.'}
                </p>
              </div>
            );
          })()}

          <div className="grid md:grid-cols-2 gap-6">
            {/* Issues */}
            <div className="bg-red-50 rounded-2xl border border-red-200 p-5">
              <h3 className="font-bold text-red-900 mb-3">⚠️ ATS Issues Found</h3>
              <ul className="space-y-2">
                {analysis.atsIssues.map((issue, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-red-800">
                    <span className="text-red-400 flex-shrink-0 mt-0.5">×</span>
                    {issue}
                  </li>
                ))}
              </ul>
            </div>

            {/* Strengths */}
            <div className="bg-green-50 rounded-2xl border border-green-200 p-5">
              <h3 className="font-bold text-green-900 mb-3">✅ What's Working</h3>
              <ul className="space-y-2">
                {analysis.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-green-800">
                    <span className="text-green-500 flex-shrink-0 mt-0.5">✓</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Improvements */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-5">Section-by-Section Improvements</h2>
            <div className="space-y-4">
              {analysis.improvements.map((item, i) => (
                <div key={i} className="border border-gray-100 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs bg-purple-100 text-\[#0D6B7A\] font-bold px-2 py-0.5 rounded-full">{item.section}</span>
                    <span className="text-xs text-red-500 font-medium">{item.issue}</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    <strong>Suggestion:</strong> {item.suggestion}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* AI-Suggested Summary */}
          <div className="bg-\[#EFF7F7\] rounded-2xl border border-\[#00C4BA\] p-6">
            <h2 className="font-bold text-\[#0B3540\] mb-3">✨ AI-Suggested Professional Summary</h2>
            <p className="text-purple-800 text-sm leading-relaxed italic">{analysis.suggestedSummary}</p>
            <button
              onClick={() => navigator.clipboard.writeText(analysis.suggestedSummary)}
              className="mt-4 text-xs text-\[#0D6B7A\] font-semibold hover:underline"
            >
              Copy to clipboard
            </button>
          </div>

          {/* Extracted Skills */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-3">Skills Detected in Resume</h2>
            <div className="flex flex-wrap gap-2">
              {analysis.extractedSkills.map(skill => (
                <span key={skill} className="px-3 py-1.5 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => { setAnalysis(null); setFileName(null); }}
              className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              Upload Different Resume
            </button>
            <Link href="/counselor" className="px-6 py-3 bg-\[#0B3540\] text-white font-semibold rounded-xl hover:bg-purple-800 transition-colors">
              Discuss with Prerna →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
