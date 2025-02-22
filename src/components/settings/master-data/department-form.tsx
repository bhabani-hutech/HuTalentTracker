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

interface DepartmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
}

export function DepartmentForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: DepartmentFormProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Department" : "Add Department"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Department Name</Label>
            <Input placeholder="Enter department name" />
          </div>
          <div className="space-y-2">
            <Label>Client Name</Label>
            <Input placeholder="Enter client name" />
          </div>
          <div className="space-y-2">
            <Label>Location</Label>
            <Input placeholder="Enter location" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onSubmit({})}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
