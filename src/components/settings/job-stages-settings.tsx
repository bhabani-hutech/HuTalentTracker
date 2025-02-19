import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { GripVertical, Plus, Trash2 } from "lucide-react";

interface Stage {
  id: string;
  name: string;
  order: number;
}

export function JobStagesSettings() {
  const [stages, setStages] = useState<Stage[]>([
    { id: "screening", name: "Screening", order: 1 },
    { id: "shortlisted", name: "Shortlisted", order: 2 },
    { id: "test", name: "Test", order: 3 },
    { id: "tech1", name: "Tech-1", order: 4 },
    { id: "tech2", name: "Tech-2", order: 5 },
    { id: "hr", name: "HR", order: 6 },
    { id: "barraiser", name: "Bar Raiser", order: 7 },
    { id: "mgmt", name: "Management", order: 8 },
    { id: "offered", name: "Offered", order: 9 },
    { id: "joined", name: "Joined", order: 10 },
    { id: "rejected", name: "Rejected", order: 11 },
    { id: "offer_rejected", name: "Offer Rejected", order: 12 },
  ]);

  const addStage = () => {
    const newStage: Stage = {
      id: `stage_${Date.now()}`,
      name: "New Stage",
      order: stages.length + 1,
    };
    setStages([...stages, newStage]);
  };

  const removeStage = (id: string) => {
    setStages(stages.filter((stage) => stage.id !== id));
  };

  const updateStageName = (id: string, newName: string) => {
    setStages(
      stages.map((stage) =>
        stage.id === id ? { ...stage, name: newName } : stage,
      ),
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Interview Stages</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stages.map((stage, index) => (
            <div key={stage.id} className="flex items-center gap-4">
              <GripVertical className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <Label className="sr-only">Stage name</Label>
                <Input
                  value={stage.name}
                  onChange={(e) => updateStageName(stage.id, e.target.value)}
                />
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
          <Button onClick={addStage} className="w-full">
            <Plus className="h-4 w-4 mr-2" /> Add Stage
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
