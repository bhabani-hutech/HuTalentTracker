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
import { Textarea } from "@/components/ui/textarea";

interface PipelineStageFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
}

export function PipelineStageForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: PipelineStageFormProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Pipeline Stage" : "Add Pipeline Stage"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Stage Name</Label>
            <Input placeholder="Enter stage name" />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea placeholder="Enter stage description" />
          </div>
          <div className="space-y-2">
            <Label>Order</Label>
            <Input type="number" placeholder="Enter stage order" />
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
