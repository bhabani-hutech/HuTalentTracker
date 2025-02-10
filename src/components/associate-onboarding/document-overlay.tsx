import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Download } from "lucide-react";

interface Document {
  id: string;
  name: string;
  type: string;
  uploadedDate: string;
  size: string;
}

interface DocumentOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  associateName: string;
  documents: Document[];
}

export function DocumentOverlay({
  isOpen,
  onClose,
  associateName,
  documents,
}: DocumentOverlayProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Documents - {associateName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="space-y-1">
                <p className="font-medium">{doc.name}</p>
                <div className="flex gap-2 text-sm text-muted-foreground">
                  <span>{doc.type}</span>
                  <span>•</span>
                  <span>{doc.size}</span>
                  <span>•</span>
                  <span>{doc.uploadedDate}</span>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button className="w-full" onClick={() => {}}>
            <Download className="h-4 w-4 mr-2" /> Download All
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
