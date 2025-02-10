import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Download, Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";

interface DocumentPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  associateName: string;
}

export function DocumentPreview({
  isOpen,
  onClose,
  associateName,
}: DocumentPreviewProps) {
  // Mock signed documents
  const documents = [
    {
      id: "1",
      name: "Signed Offer Letter",
      type: "PDF",
      signedDate: "2024-03-25",
      size: "2.5 MB",
      status: "Signed",
      preview: "https://api.dicebear.com/7.x/avataaars/svg?seed=1", // Replace with actual document preview
    },
    {
      id: "2",
      name: "Signed NDA",
      type: "PDF",
      signedDate: "2024-03-24",
      size: "1.8 MB",
      status: "Pending",
      preview: "https://api.dicebear.com/7.x/avataaars/svg?seed=2", // Replace with actual document preview
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Signed Documents - {associateName}</DialogTitle>
        </DialogHeader>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document received</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Signed Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">{doc.name}</TableCell>
                  <TableCell>{doc.type}</TableCell>
                  <TableCell>{doc.size}</TableCell>
                  <TableCell>{doc.signedDate}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        doc.status === "Signed"
                          ? "bg-green-500 hover:bg-green-600 text-white"
                          : "bg-yellow-500 hover:bg-yellow-600 text-white"
                      }
                    >
                      {doc.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
