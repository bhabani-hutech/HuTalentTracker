import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "../../../lib/supabase";

interface Stage {
  id: number;
  name: string;
  description: string;
  stage_order: number;
}

export function PipelineStagesList() {
  const { toast } = useToast();
  const [stages, setStages] = useState<Stage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 🔹 Fetch pipeline stages from Supabase
  const loadStages = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("stages")
        .select("id, stage, description, stage_order")
        .order("stage_order", { ascending: true });

      if (error) throw error;

      setStages(
        data.map((stage) => ({
          id: stage.id,
          name: stage.stage,
          description: stage.description || "",
          stage_order: stage.stage_order,
        })),
      );
    } catch (error) {
      console.error("Error loading pipeline stages:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load pipeline stages",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStages();
  }, []);

  // 🔹 Save pipeline stages using upsert
  const handleSave = async () => {
    try {
      const updates = stages.map((stage, index) => ({
        id: index + 1, // 🔹 Assign stage_order as id
        stage_order: index + 1, // Keep stage_order unique
        stage: stage.name.trim(),
        description: stage.description.trim(),
      }));
      console.log(updates);
      const { error } = await supabase.from("stages").upsert(updates, {
        onConflict: ["id"],
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Pipeline stages saved successfully",
      });

      loadStages(); // ✅ Refresh stages after save
    } catch (error) {
      console.error("Error saving pipeline stages:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save pipeline stages",
      });
    }
  };

  // 🔹 Add a new stage
  const addStage = () => {
    setStages([
      ...stages,
      {
        id: Date.now(), // Temporary ID
        name: "New Stage",
        description: "Stage description",
        stage_order: stages.length + 1,
      },
    ]);
  };

  // 🔹 Remove a stage
  const removeStage = async (id: number) => {
    try {
      await supabase.from("stages").delete().eq("id", id);
      setStages(stages.filter((stage) => stage.id !== id));
      toast({
        title: "Stage Removed",
        description: "The stage has been deleted.",
      });
    } catch (error) {
      console.error("Error deleting stage:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete stage",
      });
    }
  };

  // 🔹 Update stage details
  const updateStage = (id: number, key: keyof Stage, value: string) => {
    setStages(
      stages.map((stage) =>
        stage.id === id ? { ...stage, [key]: value } : stage,
      ),
    );
  };

  // 🔹 Drag-and-drop functionality (restrict to vertical movement)
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handleDragEnd = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;

    const reorderedStages = [...stages];
    const [movedStage] = reorderedStages.splice(dragItem.current, 1);
    reorderedStages.splice(dragOverItem.current, 0, movedStage);

    // 🔹 Update stage_order after reordering
    const updatedStages = reorderedStages.map((stage, index) => ({
      ...stage,
      stage_order: index + 1,
    }));

    setStages(updatedStages);
    dragItem.current = null;
    dragOverItem.current = null;
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Pipeline Stages</CardTitle>
          <div className="flex gap-2">
            <Button onClick={addStage}>
              <Plus className="h-4 w-4 mr-2" /> Add Stage
            </Button>
            <Button onClick={handleSave} variant="secondary">
              Save Changes
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stages.map((stage, index) => (
            <div
              key={stage.id}
              className="flex items-start gap-4 p-2 rounded border bg-background"
              draggable
              onDragStart={() => (dragItem.current = index)}
              onDragEnter={() => (dragOverItem.current = index)}
              onDragOver={(e) => e.preventDefault()}
              onDragEnd={handleDragEnd}
            >
              <div className="cursor-move">
                <GripVertical className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label className="sr-only">Stage name</Label>
                    <Input
                      value={stage.name}
                      onChange={(e) =>
                        updateStage(stage.id, "name", e.target.value)
                      }
                      placeholder="Enter stage name"
                    />
                  </div>
                  <div className="flex-[2]">
                    <Label className="sr-only">Description</Label>
                    <Input
                      value={stage.description}
                      onChange={(e) =>
                        updateStage(stage.id, "description", e.target.value)
                      }
                      placeholder="Enter stage description"
                    />
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeStage(stage.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
