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
  location?: string;
}

function calculateMatchScore(
  skills: string[],
  requiredSkills: string[] = ["JavaScript", "React", "TypeScript", "Node.js"],
  jobTitle?: string,
): { score: number; matches: SkillMatch[] } {
  // Ensure skills is an array
  if (!Array.isArray(skills)) {
    skills = [];
  }

  // Ensure requiredSkills is an array
  if (!Array.isArray(requiredSkills) || requiredSkills.length === 0) {
    requiredSkills = ["JavaScript", "React", "TypeScript", "Node.js"];
  }
  const matches: SkillMatch[] = [];
  let totalScore = 0;
  let maxPossibleScore = requiredSkills.length;

  // Add job title specific scoring
  if (jobTitle) {
    // Add bonus for job title match in skills or experience
    const jobTitleWords = jobTitle.toLowerCase().split(/\s+/);
    const jobTitleBonus = skills.some((skill) =>
      jobTitleWords.some(
        (word) => skill.toLowerCase().includes(word) && word.length > 3,
      ),
    )
      ? 1
      : 0;

    totalScore += jobTitleBonus;
    maxPossibleScore += 1; // Account for job title bonus in total possible score

    if (jobTitleBonus > 0) {
      matches.push({ skill: jobTitle, score: jobTitleBonus });
    }
  }

  // Weight each skill match with importance factors
  skills.forEach((skill) => {
    const matchingSkill = requiredSkills.find(
      (req) =>
        req.toLowerCase() === skill.toLowerCase() ||
        req.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(req.toLowerCase()),
    );

    if (matchingSkill) {
      // Assign different weights based on skill importance
      let score = 1;

      // Higher weight for exact matches
      if (matchingSkill.toLowerCase() === skill.toLowerCase()) {
        score = 1.5;
      }

      totalScore += score;
      matches.push({ skill: matchingSkill, score });
    }
  });

  // Calculate percentage score
  const percentageScore = Math.round((totalScore / maxPossibleScore) * 100);

  return {
    score: Math.min(percentageScore, 100), // Cap at 100%
    matches,
  };
}

export async function parseResume(
  file: File,
  jobId?: string,
  requiredSkills?: string[],
  jobTitle?: string,
): Promise<ParsedResume & { matchScore: number }> {
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
      location: extractLocation(text),
      summary: extractSummary(text),
    };

    // Calculate match score based on job requirements if provided
    const { score, matches } = calculateMatchScore(
      parsedData.skills || [],
      requiredSkills || ["JavaScript", "React", "TypeScript", "Node.js"],
      jobTitle,
    );

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
    "C++",
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
    "GraphQL",
    "Redux",
    "Express",
    "Next.js",
    "Nest.js",
    "Spring Boot",
    "Django",
    "Flask",
    "Ruby on Rails",
    "PHP",
    "Laravel",
    "Swift",
    "Kotlin",
    "Flutter",
    "React Native",
    "TensorFlow",
    "PyTorch",
    "Machine Learning",
    "Data Science",
    "DevOps",
    "Agile",
    "Scrum",
    "Project Management",
    "UI/UX",
    "Figma",
    "Adobe XD",
    "Sketch",
    "Photoshop",
    "Illustrator",
    "Product Management",
    "Business Analysis",
    "SEO",
    "Digital Marketing",
    "Content Strategy",
    "Technical Writing",
    "Leadership",
    "Team Management",
  ];

  // Extract skills from text using regex
  const extractedSkills = commonSkills.filter((skill) =>
    new RegExp(`\\b${skill.replace(/\+/g, "\\+")}\\b`, "i").test(text),
  );

  // Look for additional skills in Skills section
  const skillsSection =
    text.match(/SKILLS[\s\S]*?(?=EXPERIENCE|EDUCATION|PROJECTS|$)/i)?.[0] || "";
  const skillLines = skillsSection.split("\n").slice(1); // Skip the header

  // Extract potential skills from bullet points or comma-separated lists
  const additionalSkills = [];
  for (const line of skillLines) {
    const cleanLine = line.trim();
    if (cleanLine.length > 2) {
      // Minimum length to be considered a skill
      // Split by commas or bullet points
      const parts = cleanLine
        .split(/[,•\-\*]/)
        .map((part) => part.trim())
        .filter((part) => part.length > 2);
      additionalSkills.push(...parts);
    }
  }

  // Combine extracted skills with additional skills, removing duplicates
  const allSkills = [...extractedSkills];
  for (const skill of additionalSkills) {
    if (!allSkills.some((s) => s.toLowerCase() === skill.toLowerCase())) {
      allSkills.push(skill);
    }
  }

  return allSkills;
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
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "DevOps Engineer",
    "Data Scientist",
    "Machine Learning Engineer",
    "UI/UX Designer",
    "Product Manager",
    "Project Manager",
    "Business Analyst",
    "QA Engineer",
    "Test Engineer",
    "Technical Writer",
    "System Administrator",
    "Network Engineer",
    "Security Engineer",
    "Cloud Engineer",
    "Mobile Developer",
    "iOS Developer",
    "Android Developer",
    "Game Developer",
    "Blockchain Developer",
    "AI Engineer",
    "Database Administrator",
    "Data Engineer",
    "Data Analyst",
    "CTO",
    "CEO",
    "COO",
    "CIO",
    "VP of Engineering",
    "VP of Product",
    "VP of Design",
    "Engineering Manager",
    "Technical Lead",
    "Scrum Master",
    "Agile Coach",
  ];

  // Check first few lines for job title
  const firstFewLines = text.split("\n").slice(0, 10).join(" ");

  // Try to find exact matches first
  for (const title of commonTitles) {
    if (new RegExp(`\\b${title}\\b`, "i").test(firstFewLines)) {
      return title;
    }
  }

  // Look for partial matches or combinations
  const titleWords = [
    "Engineer",
    "Developer",
    "Architect",
    "Manager",
    "Designer",
    "Analyst",
    "Consultant",
    "Lead",
    "Director",
  ];
  const domainWords = [
    "Software",
    "Frontend",
    "Backend",
    "Full Stack",
    "Web",
    "Mobile",
    "UI",
    "UX",
    "Product",
    "Project",
    "Data",
    "Cloud",
    "DevOps",
  ];

  for (const domain of domainWords) {
    for (const title of titleWords) {
      const combinedTitle = `${domain} ${title}`;
      if (new RegExp(`\\b${domain}\\s+${title}\\b`, "i").test(firstFewLines)) {
        return combinedTitle;
      }
    }
  }

  // Check for any title words as a fallback
  for (const title of titleWords) {
    if (new RegExp(`\\b${title}\\b`, "i").test(firstFewLines)) {
      return title;
    }
  }

  return "";
}

function extractLocation(text: string): string {
  // Common location patterns
  const locationRegex =
    /\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)*),\s*([A-Z]{2})\b|\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)\s*-\s*([A-Z]{2})\b|\bRemote\b/g;
  const matches = text.match(locationRegex);

  if (matches && matches.length > 0) {
    return matches[0];
  }

  // Look for common city names
  const commonCities = [
    "New York",
    "Los Angeles",
    "Chicago",
    "Houston",
    "Phoenix",
    "Philadelphia",
    "San Antonio",
    "San Diego",
    "Dallas",
    "San Jose",
    "Austin",
    "Jacksonville",
    "Fort Worth",
    "Columbus",
    "San Francisco",
    "Charlotte",
    "Indianapolis",
    "Seattle",
    "Denver",
    "Boston",
    "London",
    "Paris",
    "Berlin",
    "Madrid",
    "Rome",
    "Amsterdam",
    "Brussels",
    "Vienna",
    "Tokyo",
    "Sydney",
    "Singapore",
    "Hong Kong",
    "Mumbai",
    "Delhi",
    "Bangalore",
    "Hyderabad",
    "Chennai",
    "Kolkata",
    "Pune",
    "Ahmedabad",
    "Toronto",
    "Vancouver",
    "Montreal",
  ];

  for (const city of commonCities) {
    if (new RegExp(`\\b${city}\\b`, "i").test(text)) {
      return city;
    }
  }

  return "Remote"; // Default to Remote if no location found
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
  location?: string;
  summary?: string;
  matchScore?: number;
  skillMatches?: SkillMatch[];
}
