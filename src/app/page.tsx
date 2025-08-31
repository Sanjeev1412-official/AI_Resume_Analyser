"use client";

import { useState } from "react";
import ResumeUploader from "../components/ResumeUploader";
import ResumeResult from "../components/ResumeResult";
import { FileText } from "lucide-react";

export type ResumeResultType = {
  key_metrics: {
    total_experience_years: number;
    skills_count: number;
    certifications_count: number;
  };
  skills: string[];
  experience: { company: string; role: string; duration: string }[];
  education: { degree: string; institution: string; year: string }[];
  resume_summary: {
    key_metrics: {
      total_experience_years: number;
      technical_skills_count: number;
      projects_count: number;
      education_level: string;
    };
  };
  ats_analysis: {
    overall_score: number;
    keyword_score: number;
    structure_score: number;
    formatting_score: number;
    top_matched_keywords: [string, number][];
    missing_jd_keywords: string[];
    structure_analysis: Record<string, boolean>;
    ats_grade: string;
    jd_keyword_coverage: string;
  };
  hr_evaluation: {
    score_breakdown: Record<string, number>;
    key_strengths: { area: string; strength: string; impact_score: number }[];
    critical_gaps: { gap_category: string; severity: string; gap_description: string }[];
    jd_alignment_analysis: {
      requirements_met: string[];
      requirements_partially_met: string[];
      requirements_missing: string[];
    };
    interview_recommendation: {
      recommendation: string;
      confidence_level: string;
    };
    compensation_analysis: {
      recommended_range: string;
    };
    detailed_assessment: string;
  };
};


export default function Home() {
  const [result, setResult] = useState<ResumeResultType | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 flex-col items-center justify-center">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4">
          <FileText className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Resume Analyzer</h1>
        <p className="text-gray-600">Upload your resume and get AI-powered insights for your dream job</p>
      </div>
      <ResumeUploader onResult={setResult} />
      {result && <ResumeResult data={result} />}
    </div>
  );
}
