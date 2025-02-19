import { JobLevel } from "@/types/database";

const MOCK_RESPONSES = {
  "Senior Level": {
    description:
      "We are seeking an experienced professional to join our team in a senior role. The ideal candidate will have a proven track record of success and the ability to lead and mentor team members.",
    requirements: [
      "8+ years of relevant experience",
      "Strong leadership and mentoring abilities",
      "Excellent problem-solving skills",
      "Track record of delivering complex projects",
      "Bachelor's degree in relevant field",
    ],
    responsibilities: [
      "Lead and mentor team members",
      "Drive technical decisions and architecture",
      "Collaborate with stakeholders across departments",
      "Ensure delivery of high-quality solutions",
      "Contribute to strategic planning and execution",
    ],
  },
  "Mid Level": {
    description:
      "We are looking for a skilled professional to contribute to our team's success. The ideal candidate will have solid experience and the ability to work independently on complex tasks.",
    requirements: [
      "3-5 years of relevant experience",
      "Strong technical skills",
      "Good communication abilities",
      "Problem-solving mindset",
      "Bachelor's degree in relevant field",
    ],
    responsibilities: [
      "Develop and maintain solutions",
      "Collaborate with team members",
      "Participate in code reviews",
      "Write technical documentation",
      "Support junior team members",
    ],
  },
  "Entry Level": {
    description:
      "We are seeking motivated individuals to join our team. This is an excellent opportunity for someone starting their career and eager to learn and grow.",
    requirements: [
      "0-2 years of experience",
      "Basic technical knowledge",
      "Strong willingness to learn",
      "Good communication skills",
      "Bachelor's degree in relevant field",
    ],
    responsibilities: [
      "Learn and apply best practices",
      "Assist in development tasks",
      "Participate in team meetings",
      "Help with documentation",
      "Work under senior team members' guidance",
    ],
  },
};

export async function generateJobDescription(title: string, level: JobLevel) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Get base template based on level
  const template = MOCK_RESPONSES[level] || MOCK_RESPONSES["Mid Level"];

  // Customize for specific job title
  // Define skill sets based on job title and level
  const skillSets = {
    "Senior Level": [
      "Leadership",
      "Strategic Planning",
      "Team Management",
      "Project Management",
      "Stakeholder Management",
      "Technical Architecture",
      "Mentoring",
    ],
    "Mid Level": [
      "Problem Solving",
      "Team Collaboration",
      "Technical Design",
      "Code Review",
      "Documentation",
      "Testing",
    ],
    "Entry Level": [
      "Basic Programming",
      "Version Control",
      "Testing",
      "Documentation",
      "Communication",
    ],
  };

  const baseSkills = skillSets[level] || skillSets["Mid Level"];
  const jobSpecificSkills = baseSkills.map((skill) =>
    skill.includes("Technical") ? skill.replace("Technical", title) : skill,
  );

  const customized = {
    description: template.description.replace("professional", title),
    requirements: template.requirements.map((r) =>
      r.replace("technical", title.toLowerCase()),
    ),
    responsibilities: template.responsibilities.map((r) =>
      r.replace("technical", title.toLowerCase()),
    ),
    skills: jobSpecificSkills,
  };

  return customized;
}
