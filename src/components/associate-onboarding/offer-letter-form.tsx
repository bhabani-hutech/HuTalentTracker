import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { DatePicker } from "../ui/date-picker";

interface OfferLetterFormProps {
  isOpen: boolean;
  onClose: () => void;
  associate: {
    name: string;
    position: string;
  } | null;
}

export function OfferLetterForm({
  isOpen,
  onClose,
  associate,
}: OfferLetterFormProps) {
  if (!associate) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Send Offer Letter - {associate.name}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pr-6">
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Upload Offer Letter</Label>
              <Input type="file" accept=".pdf,.doc,.docx" />
            </div>

            <div className="space-y-2">
              <Label>Additional Documents</Label>
              <Input type="file" accept=".pdf,.doc,.docx" multiple />
              <p className="text-sm text-muted-foreground">
                Upload NDA, policies, or other documents
              </p>
            </div>

            <div className="space-y-2">
              <Label>Email ID</Label>
              <Input type="email" placeholder="candidate@example.com" />
            </div>

            <div className="space-y-2">
              <Label>Joining Date</Label>
              <DatePicker />
            </div>

            <div className="space-y-2">
              <Label>Offer Valid Until</Label>
              <DatePicker />
            </div>

            <div className="space-y-2">
              <Label>CC Recipients</Label>
              <Input
                type="text"
                placeholder="hr@company.com, manager@company.com"
              />
              <p className="text-sm text-muted-foreground">
                Separate multiple emails with commas
              </p>
            </div>

            <div className="space-y-2">
              <Label>Email Message</Label>
              <Textarea
                placeholder="Enter email message body"
                className="min-h-[100px]"
                defaultValue={`Dear ${associate.name},

We are pleased to offer you the position of ${associate.position} at our company. Please find attached the offer letter and additional documents.

Kindly review and sign the documents at your earliest convenience.

Best regards,
HR Team`}
              />
            </div>
          </div>
        </div>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              // Handle sending offer letter
              onClose();
            }}
          >
            Send Offer Letter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
