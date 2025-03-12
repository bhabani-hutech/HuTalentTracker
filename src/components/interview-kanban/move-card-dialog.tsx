import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface MoveCardDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  fromStage: string;
  toStage: string;
  itemName: string;
  isAutomatic?: boolean;
}

export function MoveCardDialog({
  isOpen,
  onClose,
  onConfirm,
  fromStage,
  toStage,
  itemName,
  isAutomatic = false,
}: MoveCardDialogProps) {
  const [comment, setComment] = useState("");

  const handleSubmit = () => {
    if (comment.trim()) {
      onConfirm(comment);
      setComment("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isAutomatic ? "Automatic Movement" : "Move Candidate"}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="mb-2">
            {isAutomatic ? (
              <>
                <span className="font-medium">{itemName}</span> was
                automatically moved from{" "}
                <span className="font-medium">{fromStage}</span> to{" "}
                <span className="font-medium">{toStage}</span>
              </>
            ) : (
              <>
                Moving <span className="font-medium">{itemName}</span> from{" "}
                <span className="font-medium">{fromStage}</span> to{" "}
                <span className="font-medium">{toStage}</span>
              </>
            )}
          </p>
          <div className="space-y-2">
            <Label htmlFor="move-comment">
              {isAutomatic ? "System-generated comment" : "Comments (optional)"}
            </Label>
            <Textarea
              id="move-comment"
              placeholder={
                isAutomatic
                  ? "System-generated comment"
                  : "Add comments about this stage change..."
              }
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              readOnly={isAutomatic}
              className={isAutomatic ? "bg-gray-50" : ""}
            />
          </div>
        </div>
        <DialogFooter>
          {isAutomatic ? (
            <Button onClick={onClose}>Close</Button>
          ) : (
            <>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={() => onConfirm(comment)}>Confirm Move</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
