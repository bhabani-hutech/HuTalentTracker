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
  notice_period?: string;
  summary?: string;
}

function calculateMatchScore(
  skills: string[],
  requiredSkills: string[] = ["JavaScript", "React", "TypeScript", "Node.js"],
  jobTitle?: string,
): { score: number; matches: SkillMatch[] } {
  console.log("Calculate match score input:", {
    skills,
    requiredSkills,
    jobTitle,
  });
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

  // Add job title specific scoring with higher weight
  if (jobTitle) {
    // Add bonus for job title match in skills or experience
    const jobTitleWords = jobTitle.toLowerCase().split(/\s+/);
    const jobTitleBonus = skills.some((skill) =>
      jobTitleWords.some(
        (word) => skill.toLowerCase().includes(word) && word.length > 3,
      ),
    )
      ? 2 // Increased weight for job title match
      : 0;

    totalScore += jobTitleBonus;
    maxPossibleScore += 2; // Account for job title bonus in total possible score

    if (jobTitleBonus > 0) {
      matches.push({ skill: jobTitle, score: jobTitleBonus });
    }
  }

  // Weight each skill match with importance factors
  skills.forEach((skill) => {
    if (!skill) return; // Skip empty skills

    const skillLower = skill.toLowerCase().trim();
    if (skillLower.length < 2) return; // Skip very short skills

    // Check for exact matches first (highest priority)
    const exactMatch = requiredSkills.find(
      (req) => req && req.toLowerCase().trim() === skillLower,
    );

    if (exactMatch) {
      // Higher weight for exact matches
      const score = 2;
      totalScore += score;
      matches.push({ skill: exactMatch, score });
      return; // Skip further checks for this skill
    }

    // Check for partial matches
    const partialMatch = requiredSkills.find((req) => {
      if (!req) return false;
      const reqLower = req.toLowerCase().trim();
      return reqLower.includes(skillLower) || skillLower.includes(reqLower);
    });

    if (partialMatch) {
      // Lower weight for partial matches
      const score = 1;
      totalScore += score;
      matches.push({ skill: partialMatch, score });
    }
  });

  // Calculate percentage score - ensure we don't divide by zero
  const percentageScore =
    maxPossibleScore > 0
      ? Math.round((totalScore / maxPossibleScore) * 100)
      : 0;

  // Apply a minimum threshold for very few matches
  let finalScore = Math.min(percentageScore, 100); // Cap at 100%

  // If we have very few matches but at least one, ensure a minimum score
  if (matches.length > 0 && finalScore < 30) {
    finalScore = 30; // Minimum score for having at least some matches
  }

  const result = {
    score: finalScore,
    matches,
  };
  console.log("Match score calculation result:", result);
  return result;
}

export async function parseResume(
  file: File,
  jobId?: string,
  requiredSkills?: string[],
  jobTitle?: string,
): Promise<ParsedResume & { matchScore: number; skillMatches?: SkillMatch[] }> {
  try {
    // Read the file content
    const text = await file.text();

    // Enhanced parsing logic with improved extraction
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
      notice_period: extractNoticePeriod(text),
    };

    console.log("Parsed resume data:", parsedData);

    // Ensure skills is an array
    if (!parsedData.skills || !Array.isArray(parsedData.skills)) {
      parsedData.skills = [];
    }

    // Fetch job details and required skills if jobId is provided
    let jobDetails = null;
    let jobRequiredSkills = requiredSkills;

    if (jobId) {
      try {
        const { data: job, error } = await supabase
          .from("jobs")
          .select("*")
          .eq("id", jobId)
          .single();

        if (error) throw error;
        if (job) {
          jobDetails = job;
          // Use job skills if available, otherwise use provided requiredSkills
          if (
            job.skills &&
            Array.isArray(job.skills) &&
            job.skills.length > 0
          ) {
            jobRequiredSkills = job.skills;
          }
          // If job title is not provided but job is available, use job title
          if (!jobTitle && job.title) {
            jobTitle = job.title;
          }
        }
      } catch (err) {
        console.error("Error fetching job details:", err);
        // Continue with provided skills if job fetch fails
      }
    }

    // Ensure required skills is an array
    if (
      !jobRequiredSkills ||
      !Array.isArray(jobRequiredSkills) ||
      jobRequiredSkills.length === 0
    ) {
      jobRequiredSkills = ["JavaScript", "React", "TypeScript", "Node.js"];
    }

    // Calculate match score based on job requirements if provided
    console.log("Extracted skills:", parsedData.skills);
    console.log("Required skills:", jobRequiredSkills);
    console.log("Job title:", jobTitle);

    const { score, matches } = calculateMatchScore(
      parsedData.skills,
      jobRequiredSkills,
      jobTitle,
    );

    console.log("Match score calculation result:", { score, matches });

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
  // Enhanced name extraction with multiple patterns
  const lines = text.split("\n");

  // Try to find name in common header patterns
  const headerPatterns = [
    /^\s*([A-Z][a-z]+(\s[A-Z][a-z]+)+)\s*$/, // Full name on its own line
    /^\s*Name:\s*([A-Z][a-z]+(\s[A-Z][a-z]+)+)\s*$/i, // "Name: John Doe"
    /^\s*([A-Z][a-z]+(\s[A-Z][a-z]+){1,3})\s*$/, // Name with up to 3 parts
  ];

  for (const pattern of headerPatterns) {
    for (const line of lines.slice(0, 10)) {
      // Check first 10 lines
      const match = line.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
  }

  // Fallback to first line with capitalized words pattern
  const nameLine = lines.find((line) => /^[A-Z][a-z]+ [A-Z][a-z]+/.test(line));
  return nameLine ? nameLine.trim() : "";
}

function extractEmail(text: string): string {
  // Enhanced email extraction
  const emailPatterns = [
    /[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g, // Standard email pattern
    /Email:\s*([\w.+-]+@[\w.-]+\.[A-Za-z]{2,})/gi, // "Email: user@example.com"
    /E-mail:\s*([\w.+-]+@[\w.-]+\.[A-Za-z]{2,})/gi, // "E-mail: user@example.com"
    /Mail:\s*([\w.+-]+@[\w.-]+\.[A-Za-z]{2,})/gi, // "Mail: user@example.com"
  ];

  for (const pattern of emailPatterns) {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      // If the pattern has a capture group, extract the email from the match
      if (pattern.toString().includes("(")) {
        const captureMatch = pattern.exec(text);
        if (captureMatch && captureMatch[1]) {
          return captureMatch[1];
        }
      }
      // Otherwise return the first match
      return matches[0]
        .replace(/Email:\s*/i, "")
        .replace(/E-mail:\s*/i, "")
        .replace(/Mail:\s*/i, "");
    }
  }

  return "";
}

function extractPhone(text: string): string {
  // Enhanced phone extraction with multiple formats
  const phonePatterns = [
    /(?:\+\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}/g, // Standard US format
    /Phone:\s*((?:\+\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4})/gi, // "Phone: +1 123-456-7890"
    /Tel:\s*((?:\+\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4})/gi, // "Tel: +1 123-456-7890"
    /Mobile:\s*((?:\+\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4})/gi, // "Mobile: +1 123-456-7890"
    /\d{10}/g, // Simple 10 digit number
    /\d{3}[-.]\d{3}[-.]\d{4}/g, // Format: 123-456-7890 or 123.456.7890
  ];

  for (const pattern of phonePatterns) {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      // If the pattern has a capture group, extract the phone from the match
      if (pattern.toString().includes("(")) {
        const captureMatch = pattern.exec(text);
        if (captureMatch && captureMatch[1]) {
          return captureMatch[1];
        }
      }
      // Otherwise return the first match
      return matches[0]
        .replace(/Phone:\s*/i, "")
        .replace(/Tel:\s*/i, "")
        .replace(/Mobile:\s*/i, "");
    }
  }

  return "";
}

function extractSkills(text: string): string[] {
  console.log("Extracting skills from text length:", text.length);
  // Common technical skills to look for - expanded list
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
    "Go",
    "Golang",
    "Rust",
    "Scala",
    "Elixir",
    "Ruby",
    "Perl",
    "Bash",
    "Shell",
    "PowerShell",
    "Terraform",
    "Ansible",
    "Jenkins",
    "CircleCI",
    "GitHub Actions",
    "Webpack",
    "Babel",
    "ESLint",
    "Jest",
    "Mocha",
    "Chai",
    "Cypress",
    "Selenium",
    "Puppeteer",
    "Storybook",
    "Tailwind CSS",
    "Bootstrap",
    "Material UI",
    "Chakra UI",
    "Styled Components",
    "SASS",
    "LESS",
    "PostgreSQL",
    "MySQL",
    "Oracle",
    "SQLite",
    "Redis",
    "Elasticsearch",
    "Kafka",
    "RabbitMQ",
    "GraphQL",
    "REST",
    "gRPC",
    "WebSockets",
    "OAuth",
    "JWT",
    "SAML",
    "Linux",
    "Unix",
    "Windows",
    "MacOS",
    "iOS",
    "Android",
    "Mobile Development",
    "Web Development",
    "Backend Development",
    "Frontend Development",
    "Full Stack Development",
    "Cloud Computing",
    "Microservices",
    "Serverless",
    "Blockchain",
    "Ethereum",
    "Solidity",
    "Smart Contracts",
    "AI",
    "NLP",
    "Computer Vision",
    "Deep Learning",
    "Reinforcement Learning",
    "Big Data",
    "Hadoop",
    "Spark",
    "Tableau",
    "Power BI",
    "Data Visualization",
    "Data Engineering",
    "ETL",
    "Data Warehousing",
    "Data Modeling",
    "Data Analysis",
    "Statistical Analysis",
    "R",
    "MATLAB",
    "SAS",
    "SPSS",
    "Excel",
    "VBA",
    "Google Analytics",
    "A/B Testing",
    "UX Research",
    "Wireframing",
    "Prototyping",
    "Responsive Design",
    "Accessibility",
    "SEO",
    "SEM",
    "Content Marketing",
    "Social Media Marketing",
    "Email Marketing",
    "CRM",
    "Salesforce",
    "HubSpot",
    "Marketo",
    "Jira",
    "Confluence",
    "Trello",
    "Asana",
    "Notion",
    "Slack",
    "Microsoft Office",
    "Google Workspace",
    "Technical Support",
    "Customer Support",
    "Troubleshooting",
    "Networking",
    "TCP/IP",
    "DNS",
    "HTTP/HTTPS",
    "SSL/TLS",
    "Firewalls",
    "VPN",
    "Load Balancing",
    "CDN",
    "Caching",
    "Security",
    "Penetration Testing",
    "Encryption",
    "Authentication",
    "Authorization",
    "GDPR",
    "HIPAA",
    "SOC 2",
    "ISO 27001",
    "Compliance",
  ];

  // Extract skills from text using regex with word boundaries
  const extractedSkills = commonSkills.filter((skill) => {
    // Escape special regex characters and handle Node.js special case
    const escapedSkill = skill
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      .replace(/\+/g, "\\+");
    const regex = new RegExp(`\\b${escapedSkill}\\b`, "i");
    const match = regex.test(text);
    if (match) console.log(`Found skill: ${skill}`);
    return match;
  });

  // Look for skills sections with various headers
  const skillsSectionRegex =
    /(?:SKILLS|TECHNICAL SKILLS|CORE COMPETENCIES|EXPERTISE|PROFICIENCIES|TECHNOLOGIES|TOOLS|LANGUAGES|FRAMEWORKS)[\s\S]*?(?=EXPERIENCE|EDUCATION|PROJECTS|CERTIFICATIONS|ACHIEVEMENTS|INTERESTS|REFERENCES|$)/i;
  const skillsSection = text.match(skillsSectionRegex)?.[0] || "";
  const skillLines = skillsSection.split(/\n|\r\n/).slice(1); // Skip the header

  // Extract potential skills from bullet points or comma-separated lists
  const additionalSkills = [];
  for (const line of skillLines) {
    const cleanLine = line.trim();
    if (cleanLine.length > 2) {
      // Split by commas, bullet points, or other common separators
      const parts = cleanLine
        .split(/[,•\-\*\|\:\;\+\/]/)
        .map((part) => part.trim())
        .filter((part) => part.length > 2);
      additionalSkills.push(...parts);
    }
  }

  // Also look for skills in the entire document that might be separated by commas
  const potentialSkillLists =
    text.match(/([A-Za-z0-9]+(?:, [A-Za-z0-9]+){2,})/g) || [];
  for (const list of potentialSkillLists) {
    const items = list
      .split(/, ?/)
      .map((item) => item.trim())
      .filter((item) => item.length > 2);
    additionalSkills.push(...items);
  }

  // Combine extracted skills with additional skills, removing duplicates
  const allSkills = [...extractedSkills];
  for (const skill of additionalSkills) {
    // Check if this might be a skill by comparing with common skills
    const isPotentialSkill = commonSkills.some(
      (commonSkill) =>
        skill.toLowerCase().includes(commonSkill.toLowerCase()) ||
        commonSkill.toLowerCase().includes(skill.toLowerCase()),
    );

    if (
      isPotentialSkill &&
      !allSkills.some((s) => s.toLowerCase() === skill.toLowerCase())
    ) {
      allSkills.push(skill);
    }
  }

  console.log("Final extracted skills:", allSkills);
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
  // Enhanced position extraction with multiple patterns

  // Look for position/title labels
  const positionLabelPatterns = [
    /Title:\s*([A-Za-z\s&\/]+)\b/i,
    /Position:\s*([A-Za-z\s&\/]+)\b/i,
    /Designation:\s*([A-Za-z\s&\/]+)\b/i,
    /Role:\s*([A-Za-z\s&\/]+)\b/i,
    /Job Title:\s*([A-Za-z\s&\/]+)\b/i,
    /Current Role:\s*([A-Za-z\s&\/]+)\b/i,
  ];

  for (const pattern of positionLabelPatterns) {
    const match = pattern.exec(text);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

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
    "HR Manager",
    "Recruiter",
    "Talent Acquisition Specialist",
    "Human Resources Specialist",
    "Marketing Manager",
    "Digital Marketing Specialist",
    "Content Strategist",
    "SEO Specialist",
    "Social Media Manager",
    "Sales Representative",
    "Account Manager",
    "Customer Success Manager",
    "Operations Manager",
    "Finance Manager",
    "Financial Analyst",
    "Accountant",
  ];

  // Check first few lines for job title
  const firstFewLines = text.split("\n").slice(0, 15).join(" ");

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
    "Specialist",
    "Administrator",
    "Coordinator",
    "Supervisor",
    "Head",
    "Chief",
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
    "HR",
    "Human Resources",
    "Marketing",
    "Sales",
    "Finance",
    "Operations",
    "Customer",
    "Technical",
    "IT",
    "Information Technology",
    "Quality Assurance",
    "QA",
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
  // Enhanced location extraction with multiple patterns

  // Look for location labels
  const locationLabelPatterns = [
    /Location:\s*([A-Za-z\s,]+(?:\s*-\s*[A-Z]{2})?)\b/i,
    /Address:\s*([A-Za-z\s,]+(?:\s*-\s*[A-Z]{2})?)\b/i,
    /City:\s*([A-Za-z\s,]+)\b/i,
    /Based in:\s*([A-Za-z\s,]+)\b/i,
    /Located in:\s*([A-Za-z\s,]+)\b/i,
  ];

  for (const pattern of locationLabelPatterns) {
    const match = pattern.exec(text);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  // Common location patterns
  const locationRegex =
    /\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)*),\s*([A-Z]{2})\b|\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)\s*-\s*([A-Z]{2})\b|\bRemote\b/g;
  const matches = text.match(locationRegex);

  if (matches && matches.length > 0) {
    return matches[0];
  }

  // Check for remote work indicators
  const remoteIndicators = [
    /\bremote\b/i,
    /\bwork from home\b/i,
    /\bwfh\b/i,
    /\bvirtual\b/i,
    /\btelework\b/i,
  ];

  for (const pattern of remoteIndicators) {
    if (pattern.test(text)) {
      return "Remote";
    }
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
  // Enhanced summary extraction
  const summaryPatterns = [
    /(?:SUMMARY|PROFESSIONAL SUMMARY|CAREER SUMMARY|EXECUTIVE SUMMARY)[\s\S]*?(?=EXPERIENCE|EDUCATION|SKILLS|EMPLOYMENT|WORK|$)/i,
    /(?:OBJECTIVE|CAREER OBJECTIVE|PROFESSIONAL OBJECTIVE)[\s\S]*?(?=EXPERIENCE|EDUCATION|SKILLS|EMPLOYMENT|WORK|$)/i,
    /(?:PROFILE|PROFESSIONAL PROFILE)[\s\S]*?(?=EXPERIENCE|EDUCATION|SKILLS|EMPLOYMENT|WORK|$)/i,
    /(?:ABOUT ME|ABOUT|INTRODUCTION)[\s\S]*?(?=EXPERIENCE|EDUCATION|SKILLS|EMPLOYMENT|WORK|$)/i,
  ];

  for (const pattern of summaryPatterns) {
    const match = text.match(pattern)?.[0] || "";
    if (match) {
      return match
        .split("\n")
        .slice(1) // Skip the header
        .filter((line) => line.trim().length > 0)
        .join(" ")
        .trim();
    }
  }

  return "";
}

function extractNoticePeriod(text: string): string {
  // Extract notice period information
  const noticePatterns = [
    /notice\s*period\s*:?\s*(\d+\s*(?:days?|weeks?|months?))/i,
    /notice\s*:?\s*(\d+\s*(?:days?|weeks?|months?))/i,
    /available\s*in\s*:?\s*(\d+\s*(?:days?|weeks?|months?))/i,
    /available\s*after\s*:?\s*(\d+\s*(?:days?|weeks?|months?))/i,
    /join\s*in\s*:?\s*(\d+\s*(?:days?|weeks?|months?))/i,
    /joining\s*time\s*:?\s*(\d+\s*(?:days?|weeks?|months?))/i,
  ];

  for (const pattern of noticePatterns) {
    const match = pattern.exec(text);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return "";
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
  notice_period?: string;
  summary?: string;
  matchScore?: number;
  skillMatches?: SkillMatch[];
}
