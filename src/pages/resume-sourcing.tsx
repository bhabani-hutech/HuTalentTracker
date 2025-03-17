import { useState, useEffect, useRef } from "react";
import { ResumeList } from "../components/resume-sourcing/resume-list";
import { ResumeUploadTabs } from "../components/resume-sourcing/resume-upload-tabs";
import { useCandidates } from "@/lib/api/hooks/useCandidates";
import { useJobs } from "@/lib/api/hooks/useJobs";
import {
  updateCandidate,
  uploadResume,
  createCandidate,
} from "@/lib/api/candidates";
import { parseResume } from "@/lib/api/parser";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { getJobById } from "@/lib/api/jobs";

export default function ResumeSourcing() {
  const {
    data: candidates,
    isLoading,
    createCandidate,
    deleteCandidate,
  } = useCandidates();
  const { jobs, isLoading: isJobsLoading } = useJobs();
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const subscriptionRef = useRef(null);

  // Set up real-time subscription for candidates
  useEffect(() => {
    // Skip if already subscribed
    if (subscriptionRef.current) return;

    const subscription = supabase
      .channel("candidates-changes-resume")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "candidates" },
        () => {
          // Invalidate and refetch candidates
          queryClient.invalidateQueries({ queryKey: ["candidates"] });
        },
      )
      .subscribe();

    // Store subscription reference
    subscriptionRef.current = subscription;

    return () => {
      if (subscriptionRef.current) {
        subscription.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [queryClient]);

  // Filter candidates based on selected job
  useEffect(() => {
    if (!candidates) {
      setFilteredCandidates([]);
      return;
    }

    if (selectedJobId) {
      // Filter by selected job ID
      setFilteredCandidates(
        candidates.filter((candidate) => candidate.job_id === selectedJobId),
      );
    } else {
      // No filter, show all candidates
      setFilteredCandidates(candidates);
    }
  }, [candidates, selectedJobId]);

  const handleFileUpload = async (files: FileList, jobId?: string) => {
    const maxFileSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    try {
      // If job ID is provided, fetch job details to get required skills
      let jobDetails = null;
      let requiredSkills: string[] = [];
      let jobTitle = "";

      if (jobId) {
        try {
          jobDetails = await getJobById(jobId);
          requiredSkills = jobDetails.skills || [];
          jobTitle = jobDetails.title || "";
        } catch (error) {
          console.error("Error fetching job details:", error);
          // Continue with default skills if job fetch fails
        }
      }

      let successCount = 0;
      let failedCount = 0;

      for (const file of Array.from(files)) {
        // Validate file size
        if (file.size > maxFileSize) {
          toast({
            variant: "destructive",
            title: "Error",
            description: `File ${file.name} is too large. Maximum size is 5MB.`,
          });
          failedCount++;
          continue;
        }

        // Validate file type
        if (!allowedTypes.includes(file.type)) {
          toast({
            variant: "destructive",
            title: "Error",
            description: `File ${file.name} is not supported. Please upload PDF or Word documents.`,
          });
          failedCount++;
          continue;
        }

        try {
          // Parse the resume first to check match score
          const parsedData = await parseResume(
            file,
            jobId,
            requiredSkills,
            jobTitle,
          );

          // Log match score
          console.log(
            `Match score for ${file.name}: ${parsedData.matchScore}%`,
          );

          // Upload the file
          const fileUrl = await uploadResume(file);

          if (!fileUrl) {
            throw new Error("Failed to get file URL after upload");
          }

          // Create candidate entry with parsed data
          await createCandidate({
            name: parsedData.name || file.name.split(".")[0],
            email: parsedData.email || "",
            phone: parsedData.phone,
            job_id: jobId || null,
            position: jobTitle || parsedData.position || "Unspecified Position",
            source: file.type.includes("pdf") ? "PDF Upload" : "Word Upload",
            file_url: fileUrl,
            match_score: parsedData.matchScore,
            notice_period: "",
            stage_id: 1, // Default to screening stage
            type: "Full Time",
            experience: parsedData.experience?.join(", ") || "0-1 years",
            skills: parsedData.skills?.join(", ") || "",
            location: parsedData.location || "Remote",
          });

          successCount++;
        } catch (error) {
          console.error(`Error processing ${file.name}:`, error);
          failedCount++;
        }
      }

      // Show summary toast
      if (successCount > 0) {
        toast({
          title: "Upload Complete",
          description: `Successfully processed ${successCount} file(s). ${failedCount} file(s) failed.`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Upload Failed",
          description: `Failed to process ${failedCount} file(s).`,
        });
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
      <ResumeUploadTabs
        onFileUpload={handleFileUpload}
        jobs={jobs || []}
        selectedJobId={selectedJobId}
        onJobSelect={setSelectedJobId}
      />
      <ResumeList
        candidates={filteredCandidates}
        isLoading={isLoading}
        onDelete={deleteCandidate}
        onEdit={updateCandidate}
      />
    </div>
  );
}
