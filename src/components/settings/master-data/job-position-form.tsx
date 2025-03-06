import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";

interface JobPosition {
  id?: number;
  title: string;
  department: string;
  status: string;
}

interface JobPositionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: JobPosition) => void;
  initialData?: JobPosition | null;
}

export function JobPositionForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: JobPositionFormProps) {
  const [formData, setFormData] = useState<JobPosition>({
    title: "",
    department: "",
    status: "Active",
  });
  const [departments, setDepartments] = useState<{ name: string }[]>([]);

  // Fetch departments from own organizations
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const { data: organizations, error } = await supabase
          .from("organizations")
          .select("*")
          .eq("is_own_org", true);

        if (error) throw error;

        // Extract all departments from own organizations
        const allDepartments: { name: string }[] = [];
        for (const org of organizations || []) {
          if (org.departments && Array.isArray(org.departments)) {
            for (const dept of org.departments) {
              if (
                dept.name &&
                !allDepartments.some((d) => d.name === dept.name)
              ) {
                allDepartments.push({ name: dept.name });
              }
            }
          }
        }
        setDepartments(allDepartments);
      } catch (error) {
        console.error("Error fetching organization departments:", error);
      }
    };

    fetchDepartments();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        title: "",
        department: "",
        status: "Active",
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Position" : "Add Position"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label>Position Title</Label>
              <Input
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Enter position title"
              />
            </div>

            <div className="space-y-2">
              <Label>Department</Label>
              <Select
                value={formData.department}
                onValueChange={(value) =>
                  setFormData({ ...formData, department: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.length > 0 ? (
                    departments.map((dept, index) => (
                      <SelectItem key={index} value={dept.name}>
                        {dept.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>
                      No departments available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{initialData ? "Update" : "Create"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
