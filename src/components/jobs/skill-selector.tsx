import { useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { useSkills } from "@/lib/api/hooks/useSkills";

interface Skill {
  id: number;
  name: string;
  category: string;
  skill_type: string;
}

interface SelectedSkill {
  name: string;
  level: "Basic" | "Intermediate" | "Expert";
}

interface SkillSelectorProps {
  skillType: "domain" | "technical" | "soft";
  label: string;
  selectedSkills: SelectedSkill[];
  onChange: (skills: SelectedSkill[]) => void;
}

export function SkillSelector({
  skillType,
  label,
  selectedSkills,
  onChange,
}: SkillSelectorProps) {
  const [selectedSkill, setSelectedSkill] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<
    "Basic" | "Intermediate" | "Expert"
  >("Intermediate");
  const { skills, isLoading } = useSkills(skillType);

  const addSkill = () => {
    if (!selectedSkill) return;

    // Check if skill already exists
    if (selectedSkills.some((s) => s.name === selectedSkill)) {
      return;
    }

    const newSkills = [
      ...selectedSkills,
      { name: selectedSkill, level: selectedLevel },
    ];

    onChange(newSkills);
    setSelectedSkill("");
  };

  const removeSkill = (skillName: string) => {
    const newSkills = selectedSkills.filter((s) => s.name !== skillName);
    onChange(newSkills);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Basic":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "Intermediate":
        return "bg-green-100 text-green-800 border-green-300";
      case "Expert":
        return "bg-purple-100 text-purple-800 border-purple-300";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-4">
      <Label>{label}</Label>

      <div className="flex gap-2">
        <Select value={selectedSkill || ""} onValueChange={setSelectedSkill}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder={`Select ${skillType} skill`} />
          </SelectTrigger>
          <SelectContent>
            {isLoading ? (
              <SelectItem value="loading" disabled>
                Loading...
              </SelectItem>
            ) : skills.length === 0 ? (
              <SelectItem value="none" disabled>
                No skills available
              </SelectItem>
            ) : (
              skills.map((skill) => (
                <SelectItem key={skill.id} value={skill.name}>
                  {skill.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>

        <Select
          value={selectedLevel}
          onValueChange={(value: "Basic" | "Intermediate" | "Expert") =>
            setSelectedLevel(value)
          }
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Basic">Basic</SelectItem>
            <SelectItem value="Intermediate">Intermediate</SelectItem>
            <SelectItem value="Expert">Expert</SelectItem>
          </SelectContent>
        </Select>

        <Button type="button" onClick={addSkill} disabled={!selectedSkill}>
          <Plus className="h-4 w-4 mr-2" /> Add
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 mt-2">
        {selectedSkills.map((skill, index) => (
          <Badge
            key={index}
            variant="outline"
            className={`${getLevelColor(skill.level)} px-3 py-1 flex items-center gap-1`}
          >
            {skill.name} ({skill.level})
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
              onClick={() => removeSkill(skill.name)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
      </div>
    </div>
  );
}
