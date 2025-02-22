import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

interface Skill {
  id?: string;
  name: string;
  category: string;
  skill_order?: number;
}

interface SkillFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Skill) => void;
  initialData?: Skill;
}

export function SkillForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: SkillFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Skill>({
    name: initialData?.name || "",
    category: initialData?.category || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.name || !formData.category) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Name and category are required",
        });
        return;
      }

      onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Error saving skill:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save skill",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Skill" : "Add Skill"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Skill Name</Label>
              <Input
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter skill name"
              />
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Input
                required
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                placeholder="Enter skill category"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{initialData ? "Update" : "Add"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
