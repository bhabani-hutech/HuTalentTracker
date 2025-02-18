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

export async function parseResume(fileUrl: string): Promise<ParsedResume> {
  try {
    // In a real implementation, you would call an actual CV parsing service
    // For now, we'll simulate parsing with a delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock parsed data
    const parsedData = {
      name: "John Doe",
      email: "john@example.com",
      phone: "+1234567890",
      skills: ["JavaScript", "React", "Node.js", "TypeScript"],
      experience: [
        "Senior Frontend Developer at Tech Corp",
        "Software Engineer at StartupX",
      ],
      education: ["Bachelor's in Computer Science"],
      position: "Senior Frontend Developer",
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
