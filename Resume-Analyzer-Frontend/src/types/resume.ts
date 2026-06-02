export interface ResumeSummary {
  key_metrics: {
    total_experience_years: number;
    technical_skills_count: number;
    projects_count: number;
    education_level: string;
  };
  // Add other resume summary properties as needed
}

export interface ATSAnalysis {
  overall_score: number;
  keyword_score: number;
  structure_score: number;
  formatting_score: number;
  top_matched_keywords: [string, number][];
  missing_jd_keywords: string[];
  structure_analysis: Record<string, boolean>;
  ats_grade: string;
  jd_keyword_coverage: string;
}

export interface HREvaluation {
  score_breakdown: Record<string, number>;
  key_strengths: Array<{
    area: string;
    strength: string;
    impact_score: number;
  }>;
  critical_gaps: Array<{
    gap_category: string;
    gap_description: string;
    severity: string;
  }>;
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
}

export interface ResumeAnalysisData {
  resume_summary: ResumeSummary;
  hr_evaluation: HREvaluation;
  ats_analysis: ATSAnalysis;
}