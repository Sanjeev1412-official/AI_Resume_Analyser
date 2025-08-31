"use client";

import { useState } from "react";
import { ResumeResultType } from "../app/page";

interface Props {
  data: ResumeResultType;
}


const ResumeResult: React.FC<Props> = ({ data }) => {
  const [activeTab, setActiveTab] = useState("overview");
  
  if (!data) return null;

  const { resume_summary, hr_evaluation, ats_analysis } = data;

  // Calculate score percentages for visual indicators (using scores directly as percent)
  const overallScorePercent = ats_analysis.overall_score;
  const keywordScorePercent = ats_analysis.keyword_score;
  const structureScorePercent = ats_analysis.structure_score;
  const formattingScorePercent = ats_analysis.formatting_score;

  // Render circular progress indicator
  const CircularProgress = ({ percent, size = 100, strokeWidth = 10, score }: { 
    percent: number; 
    size?: number;
    strokeWidth?: number;
    score: number;
  }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percent / 100) * circumference;
    
    const getColor = (p: number) => {
      if (p >= 80) return "#10B981"; // green
      if (p >= 60) return "#F59E0B"; // amber
      return "#EF4444"; // red
    };

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg className="transform -rotate-90" width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={getColor(percent)}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-xl text-gray-500 font-bold">{score}/100</span>
          <span className="text-xs text-gray-500">Score</span>
        </div>
      </div>
    );
  };
  
  // Render tab navigation
  const renderTabs = () => (
    <div className="border-b border-gray-200 mb-6">
      <nav className="-mb-px flex space-x-8">
        {[
          { id: "overview", name: "Overview" },
          { id: "ats", name: "ATS Analysis" },
          { id: "hr", name: "HR Evaluation" },
          { id: "skills", name: "Skills Analysis" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === tab.id
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {tab.name}
          </button>
        ))}
      </nav>
    </div>
  );

  // Render metrics overview
  const renderMetrics = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center">
          <div className="p-2 rounded-lg bg-blue-50">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
        </div>
        <h3 className="mt-4 text-sm font-medium text-gray-500">Experience</h3>
        <p className="mt-1 text-2xl font-semibold text-gray-900">{resume_summary.key_metrics.total_experience_years} years</p>
      </div>

      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center">
          <div className="p-2 rounded-lg bg-green-50">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
          </div>
        </div>
        <h3 className="mt-4 text-sm font-medium text-gray-500">Technical Skills</h3>
        <p className="mt-1 text-2xl font-semibold text-gray-900">{resume_summary.key_metrics.technical_skills_count}</p>
      </div>

      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center">
          <div className="p-2 rounded-lg bg-purple-50">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
            </svg>
          </div>
        </div>
        <h3 className="mt-4 text-sm font-medium text-gray-500">Projects</h3>
        <p className="mt-1 text-2xl font-semibold text-gray-900">{resume_summary.key_metrics.projects_count}</p>
      </div>

      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center">
          <div className="p-2 rounded-lg bg-amber-50">
            <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14v6l9-5m-9 5l-9-5"></path>
            </svg>
          </div>
        </div>
        <h3 className="mt-4 text-sm font-medium text-gray-500">Education</h3>
        <p className="mt-1 text-l font-medium text-gray-900">{resume_summary.key_metrics.education_level}</p>
      </div>
    </div>
  );

  // Render ATS scores with visual indicators
  const renderATSScores = () => (
    <div className="mb-8 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-xl font-semibold mb-6 text-gray-800 flex items-center">
        <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd"></path>
        </svg>
        ATS Analysis
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-700">Overall Score</h4>
              <p className="text-sm text-gray-500">How well your resume matches the job</p>
            </div>
            <CircularProgress percent={overallScorePercent} size={90} strokeWidth={8} score={ats_analysis.overall_score} />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-700">Keyword Score</h4>
              <p className="text-sm text-gray-500">Relevant keywords matched</p>
            </div>
            <CircularProgress percent={keywordScorePercent} size={90} strokeWidth={8} score={ats_analysis.keyword_score} />
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-700">Structure Score</h4>
              <p className="text-sm text-gray-500">Organization and readability</p>
            </div>
            <CircularProgress percent={structureScorePercent} size={90} strokeWidth={8} score={ats_analysis.structure_score} />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-700">Formatting Score</h4>
              <p className="text-sm text-gray-500">Professional appearance</p>
            </div>
            <CircularProgress percent={formattingScorePercent} size={90} strokeWidth={8} score={ats_analysis.formatting_score} />
          </div>
        </div>
      </div>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h4 className="font-medium text-gray-700 mb-3">Top Matched Keywords</h4>
          <div className="flex flex-wrap gap-2">
            {ats_analysis.top_matched_keywords.slice(0, 10).map(([keyword, _score], idx) => (
  <span key={idx} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
    {keyword}
  </span>
))}
          </div>
        </div>
        <div>
          <h4 className="font-medium text-gray-700 mb-3">Missing Keywords</h4>
          <div className="flex flex-wrap gap-2">
            {ats_analysis.missing_jd_keywords.slice(0, 10).map((k: string, idx: number) => (
              <span key={idx} className="px-3 py-1.5 bg-red-50 text-red-700 rounded-full text-sm font-medium">
                {k}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h4 className="font-medium text-gray-700 mb-3">Structure Analysis</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(ats_analysis.structure_analysis).map(([key, value]: [string, any]) => (
            <div key={key} className="flex items-center">
              <svg className={`w-5 h-5 mr-2 ${value ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={value ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"}></path>
              </svg>
              <span className="text-sm text-gray-700 capitalize">{key.replace(/_/g, ' ')}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 flex items-center space-x-4">
        <div className="p-3 bg-gray-100 rounded-lg">
          <span className="font-medium text-gray-700">ATS Grade: </span>
          <span className="text-lg font-bold text-gray-900">{ats_analysis.ats_grade}</span>
        </div>
        <div className="p-3 bg-gray-100 rounded-lg">
          <span className="font-medium text-gray-700">Keyword Coverage: </span>
          <span className="text-lg font-bold text-gray-900">{ats_analysis.jd_keyword_coverage}</span>
        </div>
      </div>
    </div>
  );

  // Render HR evaluation with improved visual design
  const renderHRAnalysis = () => (
    <div className="mb-8 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-xl font-semibold mb-6 text-gray-800 flex items-center">
        <svg className="w-5 h-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
        </svg>
        HR Evaluation
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {Object.entries(hr_evaluation.score_breakdown).map(([key, value]) => (
          <div key={key} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h5 className="font-medium text-gray-700 capitalize mb-1">{key.replace(/_/g, ' ')}</h5>
            <p className="text-lg font-semibold text-gray-900">{String(value)}/100</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-green-50 p-5 rounded-lg border border-green-100">
          <h4 className="font-semibold text-green-800 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
            </svg>
            Key Strengths
          </h4>
          <ul className="space-y-2">
            {hr_evaluation.key_strengths.map((s: any, idx: number) => (
              <li key={idx} className="text-sm text-green-700">
                <span className="font-medium">{s.area}:</span> {s.strength} ({s.impact_score} Impact)
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-red-50 p-5 rounded-lg border border-red-100">
          <h4 className="font-semibold text-red-800 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
            </svg>
            Critical Gaps
          </h4>
          <ul className="space-y-2">
            {hr_evaluation.critical_gaps.map((g: any, idx: number) => (
              <li key={idx} className="text-sm text-red-700">
                <span className="font-medium">{g.gap_category} ({g.severity}):</span> {g.gap_description}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 bg-blue-50 p-5 rounded-lg border border-blue-100">
        <h4 className="font-semibold text-blue-800 mb-3">JD Alignment</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-3 rounded border border-blue-200">
            <h5 className="font-medium text-blue-700 mb-2">Requirements Met</h5>
            <ul className="space-y-1 text-sm text-gray-600">
              {hr_evaluation.jd_alignment_analysis.requirements_met.map((r: string, idx: number) => (
                <li key={idx}>{r}</li>
              ))}
            </ul>
          </div>
          <div className="bg-white p-3 rounded border border-blue-200">
            <h5 className="font-medium text-blue-700 mb-2">Partially Met</h5>
            <ul className="space-y-1 text-sm text-gray-600">
              {hr_evaluation.jd_alignment_analysis.requirements_partially_met.map((r: string, idx: number) => (
                <li key={idx}>{r}</li>
              ))}
            </ul>
          </div>
          <div className="bg-white p-3 rounded border border-blue-200">
            <h5 className="font-medium text-blue-700 mb-2">Requirements Missing</h5>
            <ul className="space-y-1 text-sm text-gray-600">
              {hr_evaluation.jd_alignment_analysis.requirements_missing.map((r: string, idx: number) => (
                <li key={idx}>{r}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-6 p-5 bg-white rounded-lg border border-gray-200">
        <h4 className="font-semibold text-gray-800 mb-3">Interview Recommendation</h4>
        <div className="flex items-center">
          <div className={`p-3 rounded-lg mr-4 ${
            hr_evaluation.interview_recommendation.recommendation === "Recommended" 
              ? "bg-green-100 text-green-800"
              : hr_evaluation.interview_recommendation.recommendation === "Not Recommended"
              ? "bg-red-100 text-red-800"
              : "bg-blue-100 text-blue-800"
          }`}>
            <span className="font-bold">{hr_evaluation.interview_recommendation.recommendation}</span>
          </div>
          <div>
            <p className="text-sm text-gray-600">
              Confidence: <span className="font-medium">{hr_evaluation.interview_recommendation.confidence_level}</span>
            </p>
            <p className="text-sm text-gray-600">
              Recommended Range: <span className="font-medium">{hr_evaluation.compensation_analysis.recommended_range}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 p-5 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-3">Detailed Assessment</h4>
        <p className="text-gray-700">{hr_evaluation.detailed_assessment}</p>
      </div>
    </div>
  );

  // Render content based on active tab
  const renderTabContent = () => {
    switch(activeTab) {
      case "overview":
        return (
          <>
            {renderMetrics()}
            {renderATSScores()}
          </>
        );
      case "ats":
        return renderATSScores();
      case "hr":
        return renderHRAnalysis();
      case "skills":
        return (
          <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-semibold mb-6 text-gray-800">Skills Analysis</h3>
            <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
              <h4 className="font-semibold text-blue-800 mb-4">JD Alignment Analysis</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <h5 className="font-medium text-blue-700 mb-2">Requirements Met</h5>
                  <ul className="space-y-1 text-sm text-gray-600">
                    {hr_evaluation.jd_alignment_analysis.requirements_met.map((r: string, idx: number) => (
                      <li key={idx}>{r}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <h5 className="font-medium text-blue-700 mb-2">Partially Met</h5>
                  <ul className="space-y-1 text-sm text-gray-600">
                    {hr_evaluation.jd_alignment_analysis.requirements_partially_met.map((r: string, idx: number) => (
                      <li key={idx}>{r}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <h5 className="font-medium text-blue-700 mb-2">Requirements Missing</h5>
                  <ul className="space-y-1 text-sm text-gray-600">
                    {hr_evaluation.jd_alignment_analysis.requirements_missing.map((r: string, idx: number) => (
                      <li key={idx}>{r}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return renderMetrics();
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-200">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Resume Analysis Report</h2>
        <p className="text-gray-600">Comprehensive analysis of your resume against the job requirements</p>
      </div>

      {renderTabs()}
      {renderTabContent()}
    </div>
  );
};

export default ResumeResult;