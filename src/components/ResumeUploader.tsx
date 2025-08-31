import { useState, useRef } from "react";
import axios from "axios";
import { Upload, CheckCircle } from "lucide-react";
import { ResumeResultType } from "../app/page"; // or define it here

interface Props {
  onResult: (data: ResumeResultType) => void;
}

const ResumeUploader: React.FC<Props> = ({ onResult }) => {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [jobTitle, setJobTitle] = useState("Software Developer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError("");
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
      setError("");
    }
  };

  const handleSubmit = async () => {
  if (!file || !jobDescription) {
    setError("Please upload a resume and provide a job description.");
    return;
  }

  setLoading(true);
  setError("");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("job_description", jobDescription);
  formData.append("job_title", jobTitle);

  try {
    const response = await axios.post(
      "https://ai-resume-analyser-backend-vs6n.onrender.com/analyze_resume",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    onResult(response.data.data);
  } catch (err: unknown) {
    const errorMessage =
      axios.isAxiosError(err) && err.response?.data?.detail
        ? err.response.data.detail
        : "Analysis failed. Please try again.";
    console.error(err);
    setError(errorMessage);
  } finally {
    setLoading(false);
  }
};

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-300 hover:shadow-xl">
      <div className="px-8 py-15">


        {/* File Upload Area */}
        <div 
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
            isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400"
          }`}
          onClick={triggerFileInput}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            ref={fileInputRef}
            accept=".pdf,.txt,.docx"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="flex flex-col items-center justify-center space-y-3">
            
            <div className="text-gray-600">
              {file ? (
                <div className="flex items-center justify-center space-x-3">
                  <CheckCircle className="w-12 h-12 text-green-500" />
                  <div>
                    <p className="font-medium text-green-700">{file.name}</p>
                    <p className="text-sm text-green-600">Ready to analyze</p>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                  <Upload className={`w-12 h-12 mx-auto mb-4 transition-colors text-gray-400`} />
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    Drop your resume here or click to browse
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports PDF, TXT, and DOCX files
                  </p>
                </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Job Title Input */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
          <input
            className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            placeholder="e.g. Software Developer"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
          />
        </div>

        {/* Job Description Textarea */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
          <textarea
            className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            placeholder="Paste the job description here..."
            rows={5}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-start">
            <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          className={`w-full mt-6 py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center ${
            loading 
              ? "bg-blue-400 cursor-not-allowed" 
              : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-md hover:shadow-lg"
          }`}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing Resume...
            </>
          ) : (
            "Analyze Resume"
          )}
        </button>
      </div>
    </div>
  );
};

export default ResumeUploader;