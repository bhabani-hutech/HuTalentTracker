import { supabase } from "../supabase";

interface SkillMatch {
  skill: string;
  score: number;
}

interface ParsedResume {
  name?: string;
  email?: string;
  phone?: string;
  skills?: string[];
  experience?: string[];
  education?: string[];
  position?: string;
}

function calculateMatchScore(
  skills: string[],
  requiredSkills: string[] = ["JavaScript", "React", "TypeScript", "Node.js"],
): { score: number; matches: SkillMatch[] } {
  const matches: SkillMatch[] = [];
  let totalScore = 0;

  // Weight each skill match
  skills.forEach((skill) => {
    const matchingSkill = requiredSkills.find(
      (req) => req.toLowerCase() === skill.toLowerCase(),
    );
    if (matchingSkill) {
      const score = 1; // You can adjust scoring logic
      totalScore += score;
      matches.push({ skill: matchingSkill, score });
    }
  });

  // Calculate percentage score
  const maxPossibleScore = requiredSkills.length;
  const percentageScore = Math.round((totalScore / maxPossibleScore) * 100);

  return {
    score: Math.min(percentageScore, 100), // Cap at 100%
    matches,
  };
}

export async function parseResume(file: File): Promise<ParsedResume> {
  try {
    // Read the file content
    const text = await file.text();

    // Basic parsing logic - you can enhance this based on your needs
    const parsedData = {
      name: extractName(text),
      email: extractEmail(text),
      phone: extractPhone(text),
      skills: extractSkills(text),
      experience: extractExperience(text),
      education: extractEducation(text),
      position: extractPosition(text),
      summary: extractSummary(text),
    };

    // Calculate match score
    const { score, matches } = calculateMatchScore(parsedData.skills || []);

    return {
      ...parsedData,
      matchScore: score,
      skillMatches: matches,
    };
  } catch (error) {
    console.error("Error parsing resume:", error);
    throw error;
  }
}

// Helper functions for parsing
function extractName(text: string): string {
  // Basic name extraction - first line or first capitalized words
  const lines = text.split("\n");
  const nameLine = lines.find((line) => /^[A-Z][a-z]+ [A-Z][a-z]+/.test(line));
  return nameLine || "";
}

function extractEmail(text: string): string {
  const emailRegex = /[\w.-]+@[\w.-]+\.[A-Za-z]{2,}/;
  const match = text.match(emailRegex);
  return match ? match[0] : "";
}

function extractPhone(text: string): string {
  const phoneRegex = /(?:\+\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}/;
  const match = text.match(phoneRegex);
  return match ? match[0] : "";
}

function extractSkills(text: string): string[] {
  // Common technical skills to look for
  const commonSkills = [
    "JavaScript",
    "TypeScript",
    "React",
    "Angular",
    "Vue",
    "Node.js",
    "Python",
    "Java",
    "C\\+\\+", // Escaped C++ properly
    "C#",
    "SQL",
    "MongoDB",
    "AWS",
    "Azure",
    "Docker",
    "Kubernetes",
    "Git",
    "CI/CD",
    "HTML",
    "CSS",
    "REST API",
  ];

  return commonSkills.filter((skill) =>
    new RegExp(`\\b${skill}\\b`, "i").test(text)
  );
}


function extractExperience(text: string): string[] {
  // Look for common experience patterns
  const experienceSection =
    text.match(
      /EXPERIENCE|WORK EXPERIENCE|EMPLOYMENT[\s\S]*?(?=EDUCATION|SKILLS|$)/i,
    )?.[0] || "";
  return experienceSection
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => line.trim());
}

function extractEducation(text: string): string[] {
  // Look for common education patterns
  const educationSection =
    text.match(/EDUCATION[\s\S]*?(?=EXPERIENCE|SKILLS|$)/i)?.[0] || "";
  return educationSection
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => line.trim());
}

function extractPosition(text: string): string {
  // Look for job titles near the top of the resume
  const commonTitles = [
    "Software Engineer",
    "Developer",
    "Architect",
    "Manager",
    "Designer",
    "Analyst",
    "Consultant",
    "Lead",
    "Director",
  ];

  const firstFewLines = text.split("\n").slice(0, 5).join(" ");
  const match = commonTitles.find((title) =>
    new RegExp(`\\b${title}\\b`, "i").test(firstFewLines),
  );
  return match || "";
}

function extractSummary(text: string): string {
  // Look for summary or objective section
  const summarySection =
    text.match(
      /SUMMARY|OBJECTIVE|PROFILE[\s\S]*?(?=EXPERIENCE|EDUCATION|SKILLS|$)/i,
    )?.[0] || "";
  return summarySection
    .split("\n")
    .slice(1) // Skip the header
    .filter((line) => line.trim().length > 0)
    .join(" ")
    .trim();
}

interface ParsedResume {
  name?: string;
  email?: string;
  phone?: string;
  skills?: string[];
  experience?: string[];
  education?: string[];
  certifications?: string[];
  languages?: string[];
  position?: string;
  summary?: string;
  matchScore?: number;
  skillMatches?: SkillMatch[];
}
