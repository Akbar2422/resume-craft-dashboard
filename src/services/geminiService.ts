
const GEMINI_API_KEY = "AIzaSyAyk7uW697hyLlvaXWVF-x4pkdwaURe7oQ";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

type JobRole = "Frontend Developer" | "Backend Developer" | "Data Analyst" | "Product Manager" | "UX Designer";

/**
 * Improves resume content using Gemini AI
 * @param resumeText Original resume text
 * @param jobRole Target job role
 * @returns Improved resume text
 */
export const improveResume = async (resumeText: string, jobRole: JobRole = "Frontend Developer"): Promise<string> => {
  try {
    const prompt = `You are an expert resume builder. Rewrite and improve this resume for a job role: [${jobRole}]. Resume: [${resumeText}]`;
    
    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0]?.content?.parts[0]?.text || 
           "Could not generate improved resume. Please try again.";
  } catch (error) {
    console.error("Error improving resume:", error);
    return "An error occurred while improving your resume. Please try again later.";
  }
};

/**
 * Improves resume content based on a job description using Gemini AI
 * @param resumeText Original resume text
 * @param jobDescription Job description text
 * @returns Improved resume text tailored to the job description
 */
export const improveResumeForJob = async (resumeText: string, jobDescription: string): Promise<string> => {
  try {
    if (!resumeText || !jobDescription) {
      return "Both resume and job description are required.";
    }
    
    const prompt = `Act like a resume expert. Modify this resume to match the job description.\nResume:\n${resumeText}\n\nJob Description:\n${jobDescription}`;
    
    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0]?.content?.parts[0]?.text || 
           "Could not generate improved resume. Please try again.";
  } catch (error) {
    console.error("Error improving resume for job:", error);
    return "An error occurred while improving your resume. Please try again later.";
  }
};
