import { useEffect, useState } from "react";
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
  skillType?: "domain" | "technical" | "soft";
}

export function SkillForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  skillType = "domain",
}: SkillFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Skill>({
    name: initialData?.name || "",
    category: "",
  });
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          ...initialData,
          category: "",
        });
      } else {
        setFormData({ name: "", category: "" });
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.name) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Name is required",
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
          <DialogTitle>
            {initialData
              ? `Edit ${skillType.charAt(0).toUpperCase() + skillType.slice(1)} Skill`
              : `Add ${skillType.charAt(0).toUpperCase() + skillType.slice(1)} Skill`}
          </DialogTitle>
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
