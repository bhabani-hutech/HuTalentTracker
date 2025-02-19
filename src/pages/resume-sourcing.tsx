import { ResumeList } from "../components/resume-sourcing/resume-list";
import { ResumeUploadTabs } from "../components/resume-sourcing/resume-upload-tabs";
import { useCandidates } from "@/lib/api/hooks/useCandidates";
import {
  updateCandidate,
  uploadResume,
  createCandidate,
} from "@/lib/api/candidates";
import { parseResume } from "@/lib/api/parser";
import { useToast } from "@/components/ui/use-toast";

export default function ResumeSourcing() {
  const {
    data: candidates,
    isLoading,
    createCandidate,
    deleteCandidate,
  } = useCandidates();
  const { toast } = useToast();

  const handleFileUpload = async (files: FileList) => {
    const maxFileSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    try {
      for (const file of Array.from(files)) {
        // Validate file size
        if (file.size > maxFileSize) {
          toast({
            variant: "destructive",
            title: "Error",
            description: `File ${file.name} is too large. Maximum size is 5MB.`,
          });
          continue;
        }

        // Validate file type
        if (!allowedTypes.includes(file.type)) {
          toast({
            variant: "destructive",
            title: "Error",
            description: `File ${file.name} is not supported. Please upload PDF or Word documents.`,
          });
          continue;
        }

        try {
          // First upload the file
          const fileUrl = await uploadResume(file);

          if (!fileUrl) {
            throw new Error("Failed to get file URL after upload");
          }

          // Parse the resume first
          const parsedData = await parseResume(file);

          // Create candidate entry with parsed data
          await createCandidate({
            name: parsedData.name || file.name.split(".")[0],
            email: parsedData.email || "",
            phone: parsedData.phone,
            position: parsedData.position || "Position Unknown",
            source: file.type.includes("pdf") ? "PDF Upload" : "Word Upload",
            file_url: fileUrl,
            match_score: 0,
            notice_period: "",
          });

          toast({
            title: "Success",
            description: `${file.name} uploaded and parsed successfully`,
          });
        } catch (error) {
          console.error(`Error processing ${file.name}:`, error);
          toast({
            variant: "destructive",
            title: "Error",
            description: `Failed to process ${file.name}. Please try again.`,
          });
        }
      }
    } catch (error) {
      console.error("Error in handleFileUpload:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      });
    }
  };

  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Resume Sourcing</h1>
        <p className="text-muted-foreground">
          Manage and review candidate resumes
        </p>
      </div>
      <ResumeUploadTabs onFileUpload={handleFileUpload} />
      <ResumeList
        candidates={candidates || []}
        isLoading={isLoading}
        onDelete={deleteCandidate}
        onEdit={updateCandidate}
      />
    </div>
  );
}
