import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Plus, Trash2, PenSquare } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { SkillForm } from "./skill-form";

interface Skill {
  id: number;
  name: string;
  category: string;
  skill_order: number;
}

export function SkillsList() {
  const { toast } = useToast();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Load skills
  const loadSkills = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("skills")
        .select("*")
        .order("skill_order", { ascending: true });

      if (error) throw error;
      setSkills(data);
    } catch (error) {
      console.error("Error loading skills:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load skills",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSkills();
  }, []);

  // Remove a skill
  const removeSkill = async (id: number) => {
    try {
      await supabase.from("skills").delete().eq("id", id);
      setSkills(skills.filter((skill) => skill.id !== id));
      toast({
        title: "Success",
        description: "Skill removed successfully",
      });
    } catch (error) {
      console.error("Error removing skill:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove skill",
      });
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Skills</CardTitle>
          <div>
            <Button
              onClick={() => {
                setSelectedSkill(null);
                setShowForm(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" /> Add Skill
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {skills.map((skill, index) => (
            <div
              key={skill.id}
              className="flex items-center gap-4 p-2 rounded border bg-background"
            >
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div className="font-medium">{skill.name}</div>
                <div className="text-muted-foreground">{skill.category}</div>
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
          ))}
        </div>
      </CardContent>

      <SkillForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setSelectedSkill(null);
        }}
        onSubmit={async (data) => {
          try {
            if (selectedSkill?.id) {
              await supabase
                .from("skills")
                .update({
                  name: data.name,
                  category: data.category,
                })
                .eq("id", selectedSkill.id);
            } else {
              await supabase.from("skills").insert([
                {
                  name: data.name,
                  category: data.category,
                  skill_order: skills.length + 1,
                },
              ]);
            }
            loadSkills();
            setShowForm(false);
            setSelectedSkill(null);
            toast({
              title: "Success",
              description: `Skill ${selectedSkill ? "updated" : "added"} successfully`,
            });
          } catch (error) {
            console.error("Error saving skill:", error);
            toast({
              variant: "destructive",
              title: "Error",
              description: `Failed to ${selectedSkill ? "update" : "add"} skill`,
            });
          }
        }}
        initialData={selectedSkill}
      />
    </Card>
  );
}
