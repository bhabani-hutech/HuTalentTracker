import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Upload,
  FileUp,
  Link as LinkIcon,
  AlertCircle,
  UserPlus,
} from "lucide-react";
import { JobApplicationForm } from "./job-application-form";
import { ApplyDirectlyModal } from "./apply-directly-modal";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Job } from "@/types/database";
import { Alert, AlertDescription } from "../ui/alert";

interface ResumeUploadTabsProps {
  onFileUpload: (files: FileList, jobId?: string) => Promise<void>;
  jobs: Job[];
  selectedJobId: string | null;
  onJobSelect: (jobId: string | null) => void;
}

export function ResumeUploadTabs({
  onFileUpload,
  jobs,
  selectedJobId,
  onJobSelect,
}: ResumeUploadTabsProps) {
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [showApplyDirectlyModal, setShowApplyDirectlyModal] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Check if upload buttons should be enabled based on job selection
  const isUploadEnabled = !!selectedJobId;

  const handleFileUpload = async (files: FileList) => {
    setUploadStatus(null);
    try {
      if (!selectedJobId) {
        throw new Error("Please select a position before uploading resumes");
      }
      await onFileUpload(files, selectedJobId);
      setUploadStatus({
        success: true,
        message: "Resume(s) uploaded successfully.",
      });
    } catch (error) {
      setUploadStatus({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to upload resume(s)",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Label htmlFor="job-position" className="min-w-32">
          Filter by Position:
        </Label>
        <div className="flex-1 flex gap-2">
          <div className="flex-1">
            <Select
              value={selectedJobId || ""}
              onValueChange={(value) =>
                onJobSelect(value === "all" ? null : value)
              }
            >
              <SelectTrigger id="job-position" className="w-full">
                <SelectValue placeholder="Select a position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Positions</SelectItem>
                {jobs.map((job) => (
                  <SelectItem key={job.id} value={job.id}>
                    {job.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedJobId && (
            <Button
              variant="outline"
              onClick={() => setShowApplyDirectlyModal(true)}
              className="whitespace-nowrap"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Apply Directly
            </Button>
          )}
        </div>
      </div>

      {uploadStatus && (
        <Alert variant={uploadStatus.success ? "default" : "destructive"}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{uploadStatus.message}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">Upload CV</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Upload</TabsTrigger>
          <TabsTrigger value="import">Import CV</TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center gap-4 p-4 border-2 border-dashed rounded-lg">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <div className="text-center">
                  <p className="text-sm font-medium">
                    Drag and drop your CV here
                  </p>
                  <p className="text-sm text-muted-foreground">
                    or click to browse
                  </p>
                  {selectedJobId && (
                    <p className="text-sm font-medium text-blue-500 mt-2">
                      Uploading for:{" "}
                      {jobs.find((j) => j.id === selectedJobId)?.title ||
                        "Selected position"}
                    </p>
                  )}
                </div>
                <Input
                  type="file"
                  className="hidden"
                  id="cv-upload"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => {
                    if (e.target.files) {
                      handleFileUpload(e.target.files);
                    }
                  }}
                  disabled={!isUploadEnabled}
                />
                <Button asChild disabled={!isUploadEnabled}>
                  <label
                    htmlFor="cv-upload"
                    className={`cursor-pointer ${!isUploadEnabled ? "opacity-50 pointer-events-none" : ""}`}
                  >
                    <FileUp className="mr-2 h-4 w-4" />
                    Upload CV
                  </label>
                </Button>
                {!isUploadEnabled && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Please select a position to enable upload
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center gap-4 p-4 border-2 border-dashed rounded-lg">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <div className="text-center">
                  <p className="text-sm font-medium">
                    Drag and drop multiple CVs here
                  </p>
                  <p className="text-sm text-muted-foreground">
                    or click to browse
                  </p>
                  {selectedJobId && (
                    <p className="text-sm font-medium text-blue-500 mt-2">
                      Uploading for:{" "}
                      {jobs.find((j) => j.id === selectedJobId)?.title ||
                        "Selected position"}
                    </p>
                  )}
                </div>
                <Input
                  type="file"
                  className="hidden"
                  id="bulk-upload"
                  accept=".pdf,.doc,.docx"
                  multiple
                  onChange={(e) => {
                    if (e.target.files) {
                      handleFileUpload(e.target.files);
                    }
                  }}
                  disabled={!isUploadEnabled}
                />
                <Button asChild disabled={!isUploadEnabled}>
                  <label
                    htmlFor="bulk-upload"
                    className={`cursor-pointer ${!isUploadEnabled ? "opacity-50 pointer-events-none" : ""}`}
                  >
                    <FileUp className="mr-2 h-4 w-4" />
                    Upload Files
                  </label>
                </Button>
                {!isUploadEnabled && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Please select a position to enable upload
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label>Import from LinkedIn</Label>
                <div className="flex gap-2">
                  <Input placeholder="Paste LinkedIn Profile URL" />
                  <Button>
                    <LinkIcon className="mr-2 h-4 w-4" />
                    Import
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Import from Naukri</Label>
                <div className="flex gap-2">
                  <Input placeholder="Paste Naukri Profile URL" />
                  <Button>
                    <LinkIcon className="mr-2 h-4 w-4" />
                    Import
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <JobApplicationForm
          isOpen={showApplicationForm}
          onClose={() => setShowApplicationForm(false)}
        />

        <ApplyDirectlyModal
          isOpen={showApplyDirectlyModal}
          onClose={() => setShowApplyDirectlyModal(false)}
          selectedJob={
            selectedJobId
              ? jobs.find((job) => job.id === selectedJobId) || null
              : null
          }
        />
      </Tabs>
    </div>
  );
}
