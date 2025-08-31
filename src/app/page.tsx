"use client"; // <<< Add this at the very top

import { useState } from "react";
import ResumeUploader from "../components/ResumeUploader";
import ResumeResult from "../components/ResumeResult";
import { Upload, FileText, Briefcase, AlertCircle, CheckCircle } from "lucide-react";

export default function Home() {
  const [result, setResult] = useState<any>(null);

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
