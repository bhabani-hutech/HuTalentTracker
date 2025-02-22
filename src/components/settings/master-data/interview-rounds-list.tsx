import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "../../../lib/supabase";

interface InterviewRound {
  id: number;
  name: string;
  description: string;
  duration: number;
  round_order: number;
}

export function InterviewRoundsList() {
  const { toast } = useToast();
  const [rounds, setRounds] = useState<InterviewRound[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 🔹 Fetch interview rounds from Supabase
  const loadRounds = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("interview_rounds")
        .select("id, name, description, duration, round_order")
        .order("round_order", { ascending: true });

      if (error) throw error;

      setRounds(data || []);
    } catch (error) {
      console.error("Error loading interview rounds:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load interview rounds",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRounds();
  }, []);

  // 🔹 Save interview rounds using upsert
  const handleSave = async () => {
    try {
      const updates = rounds.map((round, index) => ({
        id: round.id, // Keep original ID
        round_order: index + 1, // Update order
        name: round.name.trim(),
        description: round.description.trim(),
        duration: round.duration, // Save duration
      }));

      const { error } = await supabase
        .from("interview_rounds")
        .upsert(updates, {
          onConflict: ["id"],
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Interview rounds saved successfully",
      });

      loadRounds(); // ✅ Refresh rounds after save
    } catch (error) {
      console.error("Error saving interview rounds:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save interview rounds",
      });
    }
  };

  // 🔹 Add a new round
  const addRound = () => {
    setRounds([
      ...rounds,
      {
        id: Date.now(), // Temporary ID
        name: "New Round",
        description: "Round description",
        duration: 30, // Default duration
        round_order: rounds.length + 1,
      },
    ]);
  };

  // 🔹 Remove a round
  const removeRound = async (id: number) => {
    try {
      await supabase.from("interview_rounds").delete().eq("id", id);
      setRounds(rounds.filter((round) => round.id !== id));
      toast({
        title: "Round Removed",
        description: "The round has been deleted.",
      });
    } catch (error) {
      console.error("Error deleting interview round:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete interview round",
      });
    }
  };

  // 🔹 Update round details
  const updateRound = (
    id: number,
    key: keyof InterviewRound,
    value: string | number,
  ) => {
    setRounds(
      rounds.map((round) =>
        round.id === id ? { ...round, [key]: value } : round,
      ),
    );
  };

  // 🔹 Drag-and-drop functionality
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handleDragEnd = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;

    const reorderedRounds = [...rounds];
    const [movedRound] = reorderedRounds.splice(dragItem.current, 1);
    reorderedRounds.splice(dragOverItem.current, 0, movedRound);

    // 🔹 Update round_order after reordering
    const updatedRounds = reorderedRounds.map((round, index) => ({
      ...round,
      round_order: index + 1,
    }));

    setRounds(updatedRounds);
    dragItem.current = null;
    dragOverItem.current = null;
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Interview Rounds</CardTitle>
          <div className="flex gap-2">
            <Button onClick={addRound}>
              <Plus className="h-4 w-4 mr-2" /> Add Round
            </Button>
            <Button onClick={handleSave} variant="secondary">
              Save Changes
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {rounds.map((round, index) => (
            <div
              key={round.id}
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
                    <Label className="sr-only">Round name</Label>
                    <Input
                      value={round.name}
                      onChange={(e) =>
                        updateRound(round.id, "name", e.target.value)
                      }
                      placeholder="Enter round name"
                    />
                  </div>
                  <div className="flex-[2]">
                    <Label className="sr-only">Description</Label>
                    <Input
                      value={round.description}
                      onChange={(e) =>
                        updateRound(round.id, "description", e.target.value)
                      }
                      placeholder="Enter round description"
                    />
                  </div>
                  <div className="w-24">
                    <Label className="sr-only">Duration (minutes)</Label>
                    <Input
                      type="number"
                      value={round.duration}
                      onChange={(e) =>
                        updateRound(
                          round.id,
                          "duration",
                          Number(e.target.value),
                        )
                      }
                      placeholder="Duration"
                    />
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeRound(round.id)}
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
