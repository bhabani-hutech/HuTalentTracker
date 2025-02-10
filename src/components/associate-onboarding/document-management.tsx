import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { FileSignature, Download, Upload, Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";

interface Document {
  id: string;
  name: string;
  type: string;
  status: "Pending" | "Signed" | "Rejected" | "Expired";
  lastUpdated: string;
}

const mockDocuments: Document[] = [
  {
    id: "1",
    name: "Offer Letter",
    type: "PDF",
    status: "Signed",
    lastUpdated: "2024-03-25",
  },
  {
    id: "2",
    name: "NDA Agreement",
    type: "PDF",
    status: "Pending",
    lastUpdated: "2024-03-24",
  },
  {
    id: "3",
    name: "Employment Contract",
    type: "PDF",
    status: "Pending",
    lastUpdated: "2024-03-24",
  },
  {
    id: "4",
    name: "Bank Details Form",
    type: "DOC",
    status: "Pending",
    lastUpdated: "2024-03-24",
  },
];

export function DocumentManagement() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Document Management</CardTitle>
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockDocuments.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">{doc.name}</TableCell>
                  <TableCell>{doc.type}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(doc.status)}>
                      {doc.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{doc.lastUpdated}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                    {doc.status === "Pending" && (
                      <Button variant="ghost" size="icon">
                        <FileSignature className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function getStatusColor(status: Document["status"]): string {
  switch (status) {
    case "Signed":
      return "bg-green-500 hover:bg-green-600 text-white";
    case "Pending":
      return "bg-yellow-500 hover:bg-yellow-600 text-white";
    case "Rejected":
      return "bg-red-500 hover:bg-red-600 text-white";
    case "Expired":
      return "bg-gray-500 hover:bg-gray-600 text-white";
    default:
      return "";
  }
}
