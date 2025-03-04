import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, PenSquare } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { SkillForm } from "./skill-form";
import { useSkills } from "@/lib/api/hooks/useSkills";

interface Skill {
  id: number;
  name: string;
  category: string;
  skill_type: string;
  skill_order: number;
}

export function TechnicalSkillsList() {
  const { toast } = useToast();
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { skills, isLoading, createSkill, updateSkill, deleteSkill } =
    useSkills("technical");

  // Remove a skill
  const removeSkill = (id: number) => {
    deleteSkill(id, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Technical skill removed successfully",
        });
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to remove technical skill",
        });
      },
    });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Technical Skills</CardTitle>
          <div>
            <Button
              onClick={() => {
                setSelectedSkill(null);
                setShowForm(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" /> Add Technical Skill
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {skills.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No technical skills found. Add your first one!
            </p>
          ) : (
            skills.map((skill, index) => (
              <div
                key={skill.id}
                className="flex items-center gap-4 p-2 rounded border bg-background"
              >
                <div className="flex-1">
                  <div className="font-medium">{skill.name}</div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedSkill(skill);
                      setShowForm(true);
                    }}
                  >
                    <PenSquare className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSkill(skill.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>

      <SkillForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setSelectedSkill(null);
        }}
        onSubmit={(data) => {
          if (selectedSkill?.id) {
            updateSkill(
              {
                id: selectedSkill.id,
                updates: {
                  name: data.name,
                  category: "",
                  skill_type: "technical",
                },
              },
              {
                onSuccess: () => {
                  setShowForm(false);
                  setSelectedSkill(null);
                  toast({
                    title: "Success",
                    description: "Technical skill updated successfully",
                  });
                },
                onError: () => {
                  toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to update technical skill",
                  });
                },
              },
            );
          } else {
            createSkill(
              {
                name: data.name,
                category: "",
                skill_type: "technical",
                skill_order: skills.length + 1,
              },
              {
                onSuccess: () => {
                  setShowForm(false);
                  setSelectedSkill(null);
                  toast({
                    title: "Success",
                    description: "Technical skill added successfully",
                  });
                },
                onError: () => {
                  toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to add technical skill",
                  });
                },
              },
            );
          }
        }}
        initialData={selectedSkill}
        skillType="technical"
      />
    </Card>
  );
}
