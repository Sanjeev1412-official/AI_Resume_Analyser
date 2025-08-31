# 📄 Advanced AI Resume Analyzer API

An **AI-powered Resume Analyzer** built with **FastAPI**, **Groq LLMs**, and **PDF/Text parsing**.  
It evaluates resumes against **job descriptions (JD)** with **HR-grade analysis**, **ATS scoring**, and **JD alignment reports**.  

This project helps **recruiters, HR teams, and candidates** quickly assess resume fit for specific roles.

---

## ✨ Features

- ✅ **Resume Text Extraction** from PDF / TXT files  
- ✅ **AI-Powered Resume Parsing** (skills, experience, projects, education, etc.)  
- ✅ **HR-Style Evaluation** (strengths, gaps, cultural fit, interview recommendation)  
- ✅ **ATS Score Analysis** (keyword coverage, structure, formatting checks)  
- ✅ **JD Alignment** (skills/experience matching with job description)  
- ✅ **Quantitative & Qualitative Scoring** combined  
- ✅ **Persistent Results** (retrieve past analyses by ID)  
- ✅ **CORS Enabled API** (frontend ready)  

---

## 🛠️ Tech Stack

- **Backend**: FastAPI  
- **AI Models**: Groq `gpt-oss-120b`  
- **PDF Parsing**: `pdfplumber`  
- **Data Processing**: Python, Regex  
- **Deployment**: Docker / Uvicorn  

---

## ⚡ API Endpoints

### 🔹 Health Check
```http
GET /health
