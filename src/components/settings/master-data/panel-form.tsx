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

interface PanelFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
}

export function PanelForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: PanelFormProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Panel" : "Add Panel"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Panel Name</Label>
            <Input placeholder="Enter panel name" />
          </div>
          <div className="space-y-2">
            <Label>Panel Members</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select members" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member1">John Doe (Technical)</SelectItem>
                <SelectItem value="member2">Jane Smith (HR)</SelectItem>
              </SelectContent>
            </Select>
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
