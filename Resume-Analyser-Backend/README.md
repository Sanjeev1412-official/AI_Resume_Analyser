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
```

## 💡 Technical Design Strengths

*   **Stateless REST Architecture**: The server does not maintain session file-system state. Files are processed cleanly out of incoming memory buffers, optimizing horizontal scaling across stateless compute engines.
*   **Strict Error Boundaries**: Safe handling of corrupted uploads, unreadable PDF layers, and LLM rate-limiting exceptions via standardized fallback handlers.
*   **Deterministic Prompt Engineering**: System instructions utilize structural formatting directives to force LLM models to output valid, parseable JSON arrays without polluting responses with markdown text blocks.
*   **Isolated Container Readiness**: Packaged with an explicit Multi-Stage `Dockerfile` ensuring secure, lean container footprint deployments on Kubernetes, Cloud Run, AWS ECS, or Render.

---

## 📂 Structural Codebase Breakdown
```bash
Resume-Analyser-Backend/
├── app.py              # Main execution entry-point containing routing and LLM middleware integrations
├── requirements.txt    # Frozen pip application dependencies
└── Dockerfile          # Configuration for containerized production builds
```

## ⚙️ Direct Setup & Local Server Execution
Step into the working directory:

```bash
   cd Resume-Analyser-Backend
```
Initialize isolated environment layers:

```bash
   python -m venv venv
   source venv/bin/activate
```
Acquire frozen application requirements:

```bash
   pip install -r requirements.txt
```
Configure production secrets safely:
Create a local configuration .env file in this directory:

```bash
   PORT=5000
   AI_API_KEY=your_secure_upstream_llm_token_here
   FLASK_ENV=development
```
Fire up the WSGI/ASGI service engine:

```bash
   python app.py
```
The core worker listens natively at http://localhost:5000
