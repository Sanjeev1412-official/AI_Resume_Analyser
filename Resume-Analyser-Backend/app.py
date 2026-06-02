# resume_analyzer.py
from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import Optional, Dict, Any, List, Tuple
import shutil
import os
import json
import logging
import pdfplumber
import re
from groq import Groq
import uuid
from datetime import datetime
import math

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Advanced AI Resume Analyzer API")

# Allow CORS for any origin (for web use)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Initialize Groq client
api_keys = os.getenv("GROQ_API_KEY")  # Replace with your actual API key
client = Groq(api_key=api_keys)

def clean_json_response(response_text: str) -> str:
    """Clean and extract JSON from response text"""
    # Remove markdown code blocks
    response_text = re.sub(r'^```json\s*|\s*```$', '', response_text, flags=re.MULTILINE)
    response_text = re.sub(r'^```\s*|\s*```$', '', response_text, flags=re.MULTILINE)
    
    # Remove any text before the first {
    start_idx = response_text.find('{')
    if start_idx != -1:
        response_text = response_text[start_idx:]
    
    # Remove any text after the last }
    end_idx = response_text.rfind('}')
    if end_idx != -1:
        response_text = response_text[:end_idx + 1]
    
    return response_text.strip()

async def extract_resume_text(file_path: str) -> str:
    """Extract text from resume file"""
    try:
        if file_path.endswith(".pdf"):
            with pdfplumber.open(file_path) as pdf:
                resume_text = ""
                for page in pdf.pages:
                    page_text = page.extract_text() or ""
                    resume_text += page_text + "\n"
        else:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                resume_text = f.read()
        return resume_text[:8000]  # Limit text length
    except Exception as e:
        logger.error(f"Error reading file: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error reading file: {str(e)}")

async def analyze_resume_with_groq(resume_text: str) -> dict:
    """Analyze resume using Groq API"""
    prompt = (
        "Analyze the following resume text and return ONLY a JSON object with the following structure: "
        "{\n"
        "  \"technical_skills\": [\"skill1\", \"skill2\"],\n"
        "  \"tools\": [\"tool1\", \"tool2\"],\n"
        "  \"experience\": [{\"title\": \"job title\", \"company\": \"company name\", \"duration\": \"time period\", \"description\": \"job description\", \"achievements\": [\"achievement1\", \"achievement2\"]}],\n"
        "  \"education\": [{\"degree\": \"degree name\", \"institution\": \"school name\", \"duration\": \"time period\", \"cgpa\": \"GPA if available\", \"honors\": \"honors if any\"}],\n"
        "  \"certifications\": [{\"name\": \"cert name\", \"issuer\": \"issuing organization\", \"date\": \"completion date\"}],\n"
        "  \"projects\": [{\"name\": \"project name\", \"description\": \"project description\", \"technologies_used\": [\"tech1\", \"tech2\"], \"impact\": \"business impact if mentioned\"}],\n"
        "  \"soft_skills\": [\"skill1\", \"skill2\"],\n"
        "  \"achievements\": [\"achievement1\", \"achievement2\"],\n"
        "  \"years_of_experience\": 3,\n"
        "  \"summary\": \"brief professional summary\",\n"
        "  \"languages\": [\"language1\", \"language2\"],\n"
        "  \"publications\": [\"publication1\", \"publication2\"],\n"
        "  \"awards\": [\"award1\", \"award2\"]\n"
        "}\n\n"
        "Resume Text:\n"
        f"{resume_text[:4000]}"
    )

    try:
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="openai/gpt-oss-120b",
            temperature=0.1,
            max_tokens=2500
        )
        result_text = chat_completion.choices[0].message.content.strip()
        
        # Clean the response
        cleaned_text = clean_json_response(result_text)
        return json.loads(cleaned_text)
    except Exception as e:
        logger.error(f"Groq analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Resume analysis failed: {str(e)}")

def extract_jd_requirements(job_description: str) -> dict:
    """Extract key requirements from job description"""
    jd_lower = job_description.lower()
    
    # Extract required skills
    skills_section = re.search(r'(skills|qualifications|requirements)[:.\s]*(.*?)(?=\n\n|\n[A-Z]|$)', jd_lower, re.DOTALL | re.IGNORECASE)
    skills_text = skills_section.group(2) if skills_section else jd_lower
    
    required_skills = list(set(re.findall(r'\b([a-zA-Z]{4,})\b', skills_text)))
    
    # Extract experience requirements
    experience_match = re.search(r'(\d+)[+\s]*(years|yrs)\s*(experience|exp)', jd_lower)
    required_experience = int(experience_match.group(1)) if experience_match else 0
    
    # Extract education requirements
    education_keywords = ['bachelor', 'master', 'phd', 'degree', 'diploma', 'bs', 'ms', 'mba']
    education_requirements = []
    for keyword in education_keywords:
        if re.search(rf'\b{keyword}\b', jd_lower):
            education_requirements.append(keyword)
    
    return {
        "required_skills": required_skills,
        "required_experience": required_experience,
        "education_requirements": education_requirements,
        "key_responsibilities": list(set(re.findall(r'\b([a-zA-Z]{5,})\b', jd_lower)))[:20]
    }

def calculate_quantitative_scores(resume_data: dict, job_description: str, company_info: str) -> dict:
    """Calculate quantitative scores based on resume data with JD alignment"""
    jd_requirements = extract_jd_requirements(job_description)
    
    # Skill matching with JD requirements
    resume_skills = [skill.lower() for skill in resume_data.get('technical_skills', [])]
    required_skills = jd_requirements['required_skills']
    
    matched_skills = []
    for req_skill in required_skills:
        for resume_skill in resume_skills:
            if req_skill.lower() in resume_skill.lower() or resume_skill.lower() in req_skill.lower():
                matched_skills.append(req_skill)
                break
    
    skill_match_rate = (len(matched_skills) / max(len(required_skills), 1)) * 100
    
    # Experience scoring with JD alignment
    years_exp = resume_data.get('years_of_experience', 0)
    required_exp = jd_requirements['required_experience']
    
    if required_exp == 0:
        experience_score = 80 if years_exp > 0 else 50
    else:
        if years_exp >= required_exp + 3:
            experience_score = 100
        elif years_exp >= required_exp:
            experience_score = 90
        elif years_exp >= required_exp - 2:
            experience_score = 75
        elif years_exp > 0:
            experience_score = 60
        else:
            experience_score = 30
    
    # Add points for relevant experience mentions
    jd_keywords = jd_requirements['key_responsibilities']
    experience_text = ' '.join([exp.get('description', '') for exp in resume_data.get('experience', [])]).lower()
    
    relevant_experience_count = 0
    for keyword in jd_keywords:
        if re.search(rf'\b{re.escape(keyword)}\b', experience_text):
            relevant_experience_count += 1
    
    experience_score = min(experience_score + (relevant_experience_count * 3), 100)
    
    # Education scoring with JD alignment
    education_score = 50
    education_list = resume_data.get('education', [])
    required_education = jd_requirements['education_requirements']
    
    if education_list:
        highest_degree = education_list[0].get('degree', '').lower()
        
        # Check if education meets requirements
        education_met = False
        for req_ed in required_education:
            if req_ed in highest_degree:
                education_met = True
                break
        
        if education_met:
            if 'phd' in highest_degree or 'doctor' in highest_degree:
                education_score = 100
            elif 'master' in highest_degree or 'ms' in highest_degree or 'mba' in highest_degree:
                education_score = 90
            elif 'bachelor' in highest_degree or 'bs' in highest_degree or 'b.tech' in highest_degree:
                education_score = 85
        else:
            # Some credit for having education even if not exactly matching
            if 'phd' in highest_degree or 'doctor' in highest_degree:
                education_score = 80
            elif 'master' in highest_degree or 'ms' in highest_degree or 'mba' in highest_degree:
                education_score = 70
            elif 'bachelor' in highest_degree or 'bs' in highest_degree or 'b.tech' in highest_degree:
                education_score = 60
    
    # Projects scoring with impact assessment
    projects = resume_data.get('projects', [])
    projects_score = min(len(projects) * 12, 100)
    
    # Check for impact mentions in projects
    impact_count = sum(1 for proj in projects if proj.get('impact') and len(proj['impact']) > 20)
    projects_score = min(projects_score + (impact_count * 8), 100)
    
    # Achievements scoring
    achievements = resume_data.get('achievements', [])
    achievements_score = min(len(achievements) * 15, 100)
    
    # Overall score with JD-focused weights
    overall_score = (
        skill_match_rate * 0.40 +  # Highest weight for skill matching
        experience_score * 0.30 +   # Strong weight for experience
        education_score * 0.15 +    # Moderate weight for education
        projects_score * 0.10 +     # Some weight for projects
        achievements_score * 0.05   # Minor weight for achievements
    )
    
    return {
        "skill_match_rate": round(skill_match_rate),
        "experience_score": round(experience_score),
        "education_score": round(education_score),
        "projects_score": round(projects_score),
        "achievements_score": round(achievements_score),
        "overall_quantitative_score": round(overall_score),
        "matched_skills_count": len(matched_skills),
        "total_required_skills": len(required_skills),
        "jd_requirements": jd_requirements,
        "relevant_experience_count": relevant_experience_count
    }

async def analyze_job_fit_hr_style(resume_data: dict, job_description: str, company_info: str, job_title: str) -> dict:
    """Professional HR-style analysis with precise JD alignment"""
    # Compute quantitative scores first
    quantitative_scores = calculate_quantitative_scores(resume_data, job_description, company_info)
    
    # Include quantitative data in prompt for LLM to base scores on
    quantitative_json = json.dumps(quantitative_scores, indent=2)
    
    # Enhanced prompt for professional HR evaluation
    resume_json = json.dumps(resume_data, ensure_ascii=False)[:3500]
    
    prompt = f"""
    As a senior HR director with 20+ years of experience in technical recruitment, perform a precise, 
    evidence-based evaluation of this candidate's resume against the specific job description for the 
    {job_title} role. Your analysis must be strictly anchored to the JD requirements.

    SCORING CRITERIA (Professional HR Grade):
    - 95-100: Exceptional match - exceeds JD requirements significantly
    - 85-94: Strong match - meets all key JD requirements
    - 75-84: Good match - meets most JD requirements, minor gaps
    - 65-74: Fair match - meets basic requirements but has significant gaps
    - 50-64: Weak match - partial alignment, major JD mismatches
    - Below 50: Poor match - minimal alignment with JD

    QUANTITATIVE BASELINE METRICS:
    {quantitative_json}

    RESUME DATA:
    {resume_json}

    JOB DESCRIPTION (Primary Reference):
    {job_description[:3000]}

    COMPANY CONTEXT:
    {company_info[:800]}

    Output EXACTLY this JSON structure:
    {{
        "overall_score": 0-100,  // Professional HR score based on JD alignment
        "score_breakdown": {{
            "technical_skills_alignment": 0-100,  // Match with JD technical requirements
            "experience_relevance": 0-100,        // Relevance to JD experience needs
            "education_fit": 0-100,              // Alignment with JD education requirements
            "achievements_impact": 0-100,        // Demonstrated results vs JD expectations
            "cultural_company_fit": 0-100,       // Fit with company context
            "growth_potential": 0-100            // Potential to grow into JD responsibilities
        }},
        "key_strengths": [
            {{
                "area": "Technical/Experience/Education",
                "strength": "Specific strength",
                "jd_relevance": "How it aligns with JD requirement X",
                "evidence": "Resume evidence",
                "impact_score": "High/Medium/Low"
            }}
        ],
        "critical_gaps": [
            {{
                "gap_category": "Skills/Experience/Education",
                "gap_description": "Specific JD requirement missing",
                "severity": "Critical/High/Medium/Low",
                "jd_requirement": "Exact JD requirement not met",
                "mitigation_strategy": "How to address this gap"
            }}
        ],
        "jd_alignment_analysis": {{
            "requirements_met": ["List of specific JD requirements met"],
            "requirements_partially_met": ["Requirements partially addressed"],
            "requirements_missing": ["Key JD requirements not addressed"]
        }},
        "interview_recommendation": {{
            "recommendation": "Strongly Recommend/Recommend/Consider/Not Recommended",
            "confidence_level": "High/Medium/Low",
            "priority_level": "Immediate/High/Medium/Low",
            "expected_ramp_up_time": "1-3/3-6/6+ months based on gaps"
        }},
        "compensation_analysis": {{
            "market_alignment": "Above/Below/At market based on JD fit",
            "recommended_range": "Salary range justified by JD alignment",
            "equity_considerations": "Based on skill scarcity vs JD needs"
        }},
        "detailed_assessment": "Comprehensive 5-7 paragraph analysis covering: 1. Overall JD fit 2. Technical competency 3. Experience relevance 4. Education alignment 5. Achievement impact 6. Cultural fit 7. Final recommendation"
    }}

    Be brutally honest and evidence-based. Every score and comment must directly reference the JD.
    """

    try:
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="openai/gpt-oss-120b",
            temperature=0.1,
            max_tokens=4000,
            response_format={"type": "json_object"}
        )
        result_text = chat_completion.choices[0].message.content.strip()
        
        cleaned_text = clean_json_response(result_text)
        hr_analysis = json.loads(cleaned_text)
        
        # Integrate quantitative metrics for balanced scoring
        hr_analysis["quantitative_metrics"] = quantitative_scores
        
        # Ensure overall score is weighted average for accuracy
        if 'overall_score' in hr_analysis:
            quantitative_weight = 0.4
            qualitative_weight = 0.6
            hr_analysis["overall_score"] = round(
                (quantitative_scores["overall_quantitative_score"] * quantitative_weight) +
                (hr_analysis["overall_score"] * qualitative_weight)
            )
        
        return hr_analysis
        
    except Exception as e:
        logger.error(f"HR analysis failed: {str(e)}")
        return create_hr_fallback_analysis(resume_data, job_description)

def create_hr_fallback_analysis(resume_data: dict, job_description: str) -> dict:
    """Create fallback HR analysis with JD focus"""
    quantitative_scores = calculate_quantitative_scores(resume_data, job_description, "")
    jd_requirements = quantitative_scores["jd_requirements"]
    
    return {
        "overall_score": quantitative_scores["overall_quantitative_score"],
        "score_breakdown": {
            "technical_skills_alignment": quantitative_scores["skill_match_rate"],
            "experience_relevance": quantitative_scores["experience_score"],
            "education_fit": quantitative_scores["education_score"],
            "achievements_impact": quantitative_scores["achievements_score"],
            "cultural_company_fit": 65,
            "growth_potential": 70
        },
        "key_strengths": [
            {
                "area": "Technical",
                "strength": f"Matches {quantitative_scores['matched_skills_count']}/{quantitative_scores['total_required_skills']} required skills",
                "jd_relevance": "Core technical alignment",
                "evidence": "Skills section",
                "impact_score": "High"
            }
        ],
        "critical_gaps": [
            {
                "gap_category": "Analysis",
                "gap_description": "Comprehensive HR evaluation unavailable",
                "severity": "Medium",
                "jd_requirement": "Full qualitative assessment",
                "mitigation_strategy": "Retry analysis with stable connection"
            }
        ],
        "jd_alignment_analysis": {
            "requirements_met": [f"Skill: {skill}" for skill in jd_requirements["required_skills"][:3]],
            "requirements_partially_met": ["Experience level partially matches"],
            "requirements_missing": ["Detailed qualitative assessment pending"]
        },
        "interview_recommendation": {
            "recommendation": "Consider",
            "confidence_level": "Medium",
            "priority_level": "Medium",
            "expected_ramp_up_time": "3-6 months"
        },
        "compensation_analysis": {
            "market_alignment": "Market average based on quantitative fit",
            "recommended_range": "Competitive range for role",
            "equity_considerations": "Standard package"
        },
        "detailed_assessment": "Fallback analysis based on quantitative metrics. Resume shows technical alignment with JD requirements. For comprehensive HR-grade evaluation, full AI processing is required. Focus on enhancing specific JD keyword matches and quantifying achievements.",
        "quantitative_metrics": quantitative_scores
    }

def calculate_advanced_ats_score(resume_data: dict, job_description: str) -> dict:
    """Advanced ATS scoring system with JD keyword optimization"""
    jd_requirements = extract_jd_requirements(job_description)
    resume_text = json.dumps(resume_data).lower()
    
    # Keyword matching with JD requirements
    keyword_matches = {}
    for keyword in jd_requirements["required_skills"] + jd_requirements["key_responsibilities"]:
        if re.search(rf'\b{re.escape(keyword.lower())}\b', resume_text):
            count = len(re.findall(rf'\b{re.escape(keyword.lower())}\b', resume_text))
            keyword_matches[keyword] = min(count, 4)  # Cap at 4 mentions
    
    total_possible = len(jd_requirements["required_skills"] + jd_requirements["key_responsibilities"]) * 4
    actual_score = sum(keyword_matches.values())
    keyword_score = (actual_score / total_possible) * 100 if total_possible > 0 else 0
    
    # Structure analysis with JD relevance
    structure_checks = {
        "contact_info_present": any(keyword in resume_text for keyword in ['email', 'phone', 'contact']),
        "professional_summary": 'summary' in resume_data and len(resume_data['summary']) > 40,
        "skills_section_organized": len(resume_data.get('technical_skills', [])) > 2,
        "experience_with_achievements": any('achievements' in exp for exp in resume_data.get('experience', [])),
        "education_details": len(resume_data.get('education', [])) > 0,
        "projects_with_impact": any('impact' in proj for proj in resume_data.get('projects', [])),
        "quantifiable_results": bool(re.search(r'\d+%|\$|\d+\+', resume_text)),
    }
    
    structure_score = (sum(structure_checks.values()) / len(structure_checks)) * 100
    
    # JD-specific formatting score
    formatting_score = 75
    if 'summary' in resume_data and any(kw in resume_data['summary'].lower() for kw in jd_requirements["key_responsibilities"][:3]):
        formatting_score += 15
    if any(exp.get('description', '') and any(kw in exp['description'].lower() for kw in jd_requirements["key_responsibilities"][:2]) for exp in resume_data.get('experience', [])):
        formatting_score += 10
    
    overall_ats_score = (keyword_score * 0.60) + (structure_score * 0.25) + (formatting_score * 0.15)
    
    return {
        "overall_score": round(overall_ats_score),
        "keyword_score": round(keyword_score),
        "structure_score": round(structure_score),
        "formatting_score": round(formatting_score),
        "top_matched_keywords": sorted(keyword_matches.items(), key=lambda x: x[1], reverse=True)[:15],
        "missing_jd_keywords": [k for k in jd_requirements["required_skills"] if k.lower() not in [mk.lower() for mk in keyword_matches.keys()]][:10],
        "structure_analysis": structure_checks,
        "ats_grade": get_ats_grade(overall_ats_score),
        "jd_keyword_coverage": f"{len(keyword_matches)}/{len(jd_requirements['required_skills'] + jd_requirements['key_responsibilities'])}"
    }

def get_ats_grade(score: float) -> str:
    """Convert ATS score to letter grade"""
    if score >= 90: return "A (Excellent)"
    elif score >= 80: return "B+ (Very Good)"
    elif score >= 70: return "B (Good)"
    elif score >= 60: return "C+ (Fair)"
    elif score >= 50: return "C (Needs Improvement)"
    else: return "D (Poor)"

@app.post("/analyze_resume")
async def analyze_resume(
    file: UploadFile = File(...),
    job_description: str = Form(...),
    company_info: str = Form(""),
    job_title: str = Form("Software Developer"),
    industry: str = Form("Technology")
):
    """
    Professional HR-grade resume analysis with precise job description matching
    """
    try:
        # Generate unique filename
        file_id = str(uuid.uuid4())
        file_ext = file.filename.split(".")[-1].lower()
        temp_file_path = os.path.join(UPLOAD_DIR, f"{file_id}.{file_ext}")
        
        # Save uploaded file
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Extract resume text
        resume_text = await extract_resume_text(temp_file_path)
        
        # Analyze resume structure
        resume_data = await analyze_resume_with_groq(resume_text)
        
        # Perform professional HR-style analysis
        hr_analysis = await analyze_job_fit_hr_style(resume_data, job_description, company_info, job_title)
        
        # Calculate advanced ATS score
        ats_analysis = calculate_advanced_ats_score(resume_data, job_description)
        
        # Combine results
        result = {
            "analysis_id": file_id,
            "timestamp": datetime.now().isoformat(),
            "resume_summary": {
                "key_metrics": {
                    "total_experience_years": resume_data.get('years_of_experience', 0),
                    "technical_skills_count": len(resume_data.get('technical_skills', [])),
                    "projects_count": len(resume_data.get('projects', [])),
                    "achievements_count": len(resume_data.get('achievements', [])),
                    "education_level": resume_data.get('education', [{}])[0].get('degree', 'Not specified') if resume_data.get('education') else 'Not specified'
                },
                "professional_highlights": {
                    "key_skills": resume_data.get('technical_skills', [])[:10],
                    "recent_experience": resume_data.get('experience', [])[:2],
                    "notable_achievements": resume_data.get('achievements', [])[:3]
                }
            },
            "hr_evaluation": hr_analysis,
            "ats_analysis": ats_analysis,
            "jd_alignment_report": {
                "summary": f"Matches {hr_analysis['quantitative_metrics']['matched_skills_count']} of {hr_analysis['quantitative_metrics']['total_required_skills']} required skills",
                "fit_category": get_fit_category(hr_analysis['overall_score']),
                "recommended_next_steps": get_recommended_actions(hr_analysis['overall_score'])
            },
            "metadata": {
                "job_title": job_title,
                "industry": industry,
                "company_context": company_info[:200],
                "original_filename": file.filename,
                "analysis_version": "3.0_professional_hr_grade"
            }
        }

        # Save analysis result
        result_file = os.path.join(UPLOAD_DIR, f"{file_id}_result.json")
        with open(result_file, "w") as f:
            json.dump(result, f, indent=2)

        # Clean up temporary file
        os.remove(temp_file_path)

        return JSONResponse(content={"success": True, "data": result})

    except Exception as e:
        logger.error(f"Analysis error: {str(e)}")
        if 'temp_file_path' in locals() and os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        raise HTTPException(status_code=500, detail=str(e))

def get_fit_category(score: float) -> str:
    """Get fit category based on score"""
    if score >= 90: return "Exceptional Fit"
    elif score >= 80: return "Strong Fit"
    elif score >= 70: return "Good Fit"
    elif score >= 60: return "Moderate Fit"
    elif score >= 50: return "Limited Fit"
    else: return "Poor Fit"

def get_recommended_actions(score: float) -> List[str]:
    """Get recommended actions based on fit score"""
    if score >= 80:
        return ["Proceed to interview", "Prepare technical assessment", "Check references"]
    elif score >= 60:
        return ["Schedule screening call", "Address specific skill gaps", "Review experience depth"]
    else:
        return ["Consider other candidates", "Provide constructive feedback", "Suggest skill development"]

@app.get("/analysis/{analysis_id}")
async def get_analysis_result(analysis_id: str):
    """Retrieve previous analysis results"""
    try:
        result_file = os.path.join(UPLOAD_DIR, f"{analysis_id}_result.json")
        if not os.path.exists(result_file):
            raise HTTPException(status_code=404, detail="Analysis not found")
        
        with open(result_file, "r") as f:
            result = json.load(f)
        
        return JSONResponse(content={"success": True, "data": result})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=False)