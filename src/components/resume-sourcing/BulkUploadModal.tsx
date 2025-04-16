import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { useState, useRef } from "react";
import { FileUp, Download } from "lucide-react";

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => void;
}

export function BulkUploadModal({
  isOpen,
  onClose,
  onUpload,
}: BulkUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const uploadedFile = e.dataTransfer.files[0];
      if (isValidFileType(uploadedFile)) {
        setFile(uploadedFile);
      } else {
        alert("Please upload an Excel or CSV file");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const uploadedFile = e.target.files[0];
      if (isValidFileType(uploadedFile)) {
        setFile(uploadedFile);
      } else {
        alert("Please upload an Excel or CSV file");
      }
    }
  };

  const isValidFileType = (file: File) => {
    const validTypes = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
    ];
    return validTypes.includes(file.type);
  };

  const handleUpload = () => {
    if (file) {
      onUpload(file);
      onClose();
    }
  };

  const downloadTemplate = () => {
    // Create a sample CSV template
    const headers =
      "Name,Email,Phone,Position,Location,Notice Period,Skills,Experience,Type\n";
    const sampleRow1 =
      "John Doe,john@example.com,1234567890,Software Engineer,Remote,30 days,JavaScript, React, Node.js,5 years,Full Time\n";
    const sampleRow2 =
      "Jane Smith,jane@example.com,9876543210,Product Manager,New York,15 days,Product Management, Agile, Scrum,3 years,Full Time\n";

    const csvContent = headers + sampleRow1 + sampleRow2;

    // Create a blob and download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "candidate_upload_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold">
            Bulk Upload Candidates
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-6">
          <div
            className={`border-2 border-dashed rounded-md w-full p-10 flex flex-col items-center justify-center ${isDragging ? "border-primary bg-primary/5" : "border-gray-300"}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <FileUp className="h-10 w-10 text-green-500 mb-4" />

            <p className="text-lg text-gray-600 mb-2">
              Drag a CSV or Excel file here
            </p>
            <div className="flex items-center">
              <p className="text-lg text-gray-600">or</p>
              <button
                className="text-lg text-blue-500 ml-2"
                onClick={() => fileInputRef.current?.click()}
              >
                browse
              </button>
              <p className="text-lg text-gray-600 ml-2">to upload</p>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Upload a CSV or Excel file with candidate information
            </p>
            <p className="text-sm text-gray-500">
              File should include: Name, Email, Phone, Position, etc.
            </p>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".xlsx,.xls,.csv"
              className="hidden"
            />
          </div>

          {file && (
            <div className="mt-4 text-sm text-gray-600">
              Selected file: {file.name}
            </div>
          )}

          <div className="mt-8 w-full">
            <Button
              className="w-full bg-gray-200 text-gray-800 hover:bg-gray-300"
              onClick={handleUpload}
              disabled={!file}
            >
              Upload Candidates
            </Button>
          </div>

          <Button
            variant="ghost"
            className="mt-4 text-gray-600"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            variant="link"
            className="mt-4 flex items-center text-blue-500"
            onClick={downloadTemplate}
          >
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
