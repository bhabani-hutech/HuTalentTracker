import { useState } from "react";
import { OfferLetterForm } from "./offer-letter-form";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Search,
  Filter,
  FileText,
  CheckCircle2,
  UserPlus,
  Files,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";

interface Document {
  id: string;
  name: string;
  type: string;
  uploadedDate: string;
  size: string;
}

interface Associate {
  id: string;
  name: string;
  position: string;
  department: string;
  startDate: string;
  status: "Not Started" | "In Progress" | "Completed" | "Delayed";
  progress: number;
  documents: Document[];
  offerLetterStatus?: "Sent" | "Signed" | "Pending" | "Rejected";
}

const mockAssociates: Associate[] = [
  {
    id: "1",
    name: "John Smith",
    position: "Senior Frontend Developer",
    department: "Engineering",
    startDate: "2024-04-01",
    status: "In Progress",
    progress: 65,
    offerLetterStatus: "Signed",
    documents: [
      {
        id: "d1",
        name: "Offer Letter",
        type: "PDF",
        uploadedDate: "2024-03-25",
        size: "2.5 MB",
      },
      {
        id: "d2",
        name: "NDA Agreement",
        type: "PDF",
        uploadedDate: "2024-03-24",
        size: "1.8 MB",
      },
    ],
  },
  {
    id: "2",
    name: "Sarah Wilson",
    position: "UX Designer",
    department: "Design",
    startDate: "2024-04-15",
    status: "Not Started",
    progress: 0,
  },
  {
    id: "3",
    name: "Michael Brown",
    position: "Product Manager",
    department: "Product",
    startDate: "2024-03-28",
    status: "Completed",
    progress: 100,
  },
];

import { DocumentOverlay } from "./document-overlay";
import { ApprovalOverlay } from "./approval-overlay";
import { DocumentPreview } from "./document-preview";

export function AssociateList() {
  const [selectedDocuments, setSelectedDocuments] = useState<{
    name: string;
    documents: Document[];
  } | null>(null);
  const [showOfferLetter, setShowOfferLetter] = useState<{
    name: string;
    position: string;
  } | null>(null);
  const [showApproval, setShowApproval] = useState<{
    name: string;
  } | null>(null);
  const [showDocumentPreview, setShowDocumentPreview] = useState<{
    name: string;
  } | null>(null);
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>New Associates</CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex w-full max-w-sm items-center space-x-2">
              <Input type="search" placeholder="Search associates..." />
              <Button type="submit" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Associate
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Document received</TableHead>
                <TableHead>Offer Letter</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockAssociates.map((associate) => (
                <TableRow key={associate.id}>
                  <TableCell className="font-medium">
                    {associate.name}
                  </TableCell>
                  <TableCell>{associate.position}</TableCell>
                  <TableCell>{associate.department}</TableCell>
                  <TableCell>{associate.startDate}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(associate.status)}>
                      {associate.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={associate.progress}
                        className="w-[60px]"
                      />
                      <span className="text-sm text-muted-foreground">
                        {associate.progress}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={() =>
                        setSelectedDocuments({
                          name: associate.name,
                          documents: associate.documents || [],
                        })
                      }
                    >
                      <Files className="h-4 w-4" />
                      <span>{associate.documents?.length || 0} Documents</span>
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      className="p-0 h-auto font-normal"
                      onClick={() =>
                        setShowOfferLetter({
                          name: associate.name,
                          position: associate.position,
                        })
                      }
                    >
                      <Badge
                        className={getOfferLetterStatus(
                          associate.offerLetterStatus,
                        )}
                      >
                        {associate.offerLetterStatus || "Not Sent"}
                      </Badge>
                    </Button>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setShowDocumentPreview({ name: associate.name })
                      }
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowApproval({ name: associate.name })}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <DocumentOverlay
        isOpen={!!selectedDocuments}
        onClose={() => setSelectedDocuments(null)}
        associateName={selectedDocuments?.name || ""}
        documents={selectedDocuments?.documents || []}
      />

      <OfferLetterForm
        isOpen={!!showOfferLetter}
        onClose={() => setShowOfferLetter(null)}
        associate={showOfferLetter}
      />

      <ApprovalOverlay
        isOpen={!!showApproval}
        onClose={() => setShowApproval(null)}
        associateName={showApproval?.name || ""}
      />

      <DocumentPreview
        isOpen={!!showDocumentPreview}
        onClose={() => setShowDocumentPreview(null)}
        associateName={showDocumentPreview?.name || ""}
      />
    </Card>
  );
}

function getOfferLetterStatus(status?: string): string {
  switch (status) {
    case "Signed":
      return "bg-green-500 hover:bg-green-600 text-white";
    case "Sent":
      return "bg-blue-500 hover:bg-blue-600 text-white";
    case "Pending":
      return "bg-yellow-500 hover:bg-yellow-600 text-white";
    case "Rejected":
      return "bg-red-500 hover:bg-red-600 text-white";
    default:
      return "bg-slate-500 hover:bg-slate-600 text-white";
  }
}

function getStatusColor(status: Associate["status"]): string {
  switch (status) {
    case "Completed":
      return "bg-green-500 hover:bg-green-600 text-white";
    case "In Progress":
      return "bg-blue-500 hover:bg-blue-600 text-white";
    case "Not Started":
      return "bg-yellow-500 hover:bg-yellow-600 text-white";
    case "Delayed":
      return "bg-red-500 hover:bg-red-600 text-white";
    default:
      return "";
  }
}
