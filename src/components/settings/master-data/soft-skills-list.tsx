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

export function SoftSkillsList() {
  const { toast } = useToast();
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { skills, isLoading, createSkill, updateSkill, deleteSkill } =
    useSkills("soft");

  // Remove a skill
  const removeSkill = (id: number) => {
    deleteSkill(id, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Soft skill removed successfully",
        });
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to remove soft skill",
        });
      },
    });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Soft Skills</CardTitle>
          <div>
            <Button
              onClick={() => {
                setSelectedSkill(null);
                setShowForm(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" /> Add Soft Skill
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {skills.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No soft skills found. Add your first one!
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
                  skill_type: "soft",
                },
              },
              {
                onSuccess: () => {
                  setShowForm(false);
                  setSelectedSkill(null);
                  toast({
                    title: "Success",
                    description: "Soft skill updated successfully",
                  });
                },
                onError: () => {
                  toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to update soft skill",
                  });
                },
              },
            );
          } else {
            createSkill(
              {
                name: data.name,
                category: "",
                skill_type: "soft",
                skill_order: skills.length + 1,
              },
              {
                onSuccess: () => {
                  setShowForm(false);
                  setSelectedSkill(null);
                  toast({
                    title: "Success",
                    description: "Soft skill added successfully",
                  });
                },
                onError: () => {
                  toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to add soft skill",
                  });
                },
              },
            );
          }
        }}
        initialData={selectedSkill}
        skillType="soft"
      />
    </Card>
  );
}
