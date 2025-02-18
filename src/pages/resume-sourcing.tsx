import { ResumeList } from "../components/resume-sourcing/resume-list";
import { ResumeUploadTabs } from "../components/resume-sourcing/resume-upload-tabs";
import { useResumes } from "@/lib/api/hooks/useResumes";
import { updateResume, uploadResume } from "@/lib/api/resumes";
import { parseResume } from "@/lib/api/parser";
import { useToast } from "@/components/ui/use-toast";

export default function ResumeSourcing() {
  const { resumes, isLoading, createResume, deleteResume } = useResumes();
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

          // Create initial resume entry
          const initialResume = await createResume({
            name: file.name.split(".")[0],
            email: "",
            position: "Processing...",
            source: file.type.includes("pdf") ? "PDF Upload" : "Word Upload",
            file_url: fileUrl,
            parsed_data: null,
          });

          // Parse the resume
          console.log(file);
          const parsedData = await parseResume(file);
          // Update the existing resume with parsed data
          await updateResume(initialResume.id, {
            name: parsedData.name || file.name.split(".")[0],
            email: parsedData.email || "",
            phone: parsedData.phone,
            position: parsedData.position || "Position Unknown",
            parsed_data: {
              skills: parsedData.skills || [],
              experience: parsedData.experience || [],
              education: parsedData.education || [],
            },
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
        resumes={resumes || []}
        isLoading={isLoading}
        onDelete={deleteResume}
      />
    </div>
  );
}
