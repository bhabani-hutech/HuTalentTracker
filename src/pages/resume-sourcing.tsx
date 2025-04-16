import { useState, useEffect, useRef } from "react";
import { ResumeDataTable } from "../components/resume-sourcing/ResumeDataTable";
import {
  ResumeFilters,
  FilterOptions,
} from "../components/resume-sourcing/ResumeFilters";
import { useCandidates } from "@/lib/api/hooks/useCandidates";
import { useJobs } from "@/lib/api/hooks/useJobs";
import { useDepartments } from "@/lib/api/hooks/useDepartments";
import {
  updateCandidate,
  uploadResume,
  createCandidate,
  Candidate,
  deleteCandidate as deleteCandidate_,
} from "@/lib/api/candidates";
import { parseResume } from "@/lib/api/parser";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { getJobById } from "@/lib/api/jobs";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Download, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AddCandidateModal } from "../components/resume-sourcing/AddCandidateModal";
import { ViewResumeModal } from "../components/resume-sourcing/ViewResumeModal";
import { ViewProfileModal } from "../components/resume-sourcing/ViewProfileModal";
import { InterviewScheduler } from "../components/interview-schedule/interview-scheduler";

export default function ResumeSourcing() {
  const {
    data: candidates,
    isLoading,
    createCandidate: createCandidateHook,
    deleteCandidate: deleteCandidateHook,
  } = useCandidates();
  const { jobs, isLoading: isJobsLoading } = useJobs();
  const { departments } = useDepartments();
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const subscriptionRef = useRef(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Apply filters to candidates
  const [filters, setFilters] = useState<FilterOptions>({
    jobId: null,
    departmentId: null,
    source: null,
    hiringPartnerId: null,
    noticePeriod: null,
    searchTerm: "",
  });

  // Filter candidates based on all filter criteria
  useEffect(() => {
    if (!candidates) {
      setFilteredCandidates([]);
      return;
    }

    let filtered = [...candidates];

    // Filter by job ID
    if (filters.jobId) {
      filtered = filtered.filter(
        (candidate) => candidate.job_id === filters.jobId,
      );
    } else if (selectedJobId) {
      // Legacy support for job selection from tabs
      filtered = filtered.filter(
        (candidate) => candidate.job_id === selectedJobId,
      );
    }

    // Filter by department ID
    if (filters.departmentId) {
      filtered = filtered.filter((candidate) => {
        const job = jobs?.find((j) => j.id === candidate.job_id);
        return job?.department_id === filters.departmentId;
      });
    }

    // Filter by source
    if (filters.source) {
      if (filters.source === "direct") {
        filtered = filtered.filter(
          (candidate) => candidate.candidate_source === "Direct Apply",
        );
      } else if (filters.source === "hiring_partner") {
        filtered = filtered.filter(
          (candidate) => candidate.candidate_source === "Hiring Partner",
        );
      }
    }

    // Filter by hiring partner ID
    if (filters.hiringPartnerId) {
      filtered = filtered.filter(
        (candidate) => candidate.hiring_partner_id === filters.hiringPartnerId,
      );
    }

    // Filter by notice period
    if (filters.noticePeriod) {
      filtered = filtered.filter((candidate) => {
        if (!candidate.notice_period) return false;

        const noticePeriod = candidate.notice_period.toLowerCase();

        switch (filters.noticePeriod) {
          case "immediate":
            return noticePeriod.includes("immediate");
          case "15days":
            return (
              noticePeriod.includes("15") || noticePeriod.includes("fifteen")
            );
          case "30days":
            return (
              noticePeriod.includes("30") ||
              noticePeriod.includes("thirty") ||
              noticePeriod.includes("month")
            );
          case "60days":
            return (
              noticePeriod.includes("60") ||
              noticePeriod.includes("sixty") ||
              noticePeriod.includes("2 month")
            );
          case "90days":
            return (
              noticePeriod.includes("90") ||
              noticePeriod.includes("ninety") ||
              noticePeriod.includes("3 month")
            );
          default:
            return true;
        }
      });
    }

    // Filter by search term
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (candidate) =>
          candidate.name?.toLowerCase().includes(searchLower) ||
          candidate.email?.toLowerCase().includes(searchLower) ||
          candidate.position?.toLowerCase().includes(searchLower) ||
          candidate.skills?.toLowerCase().includes(searchLower),
      );
    }

    setFilteredCandidates(filtered);
  }, [candidates, selectedJobId, filters, jobs]);

  const handleFileUpload = async (
    files: FileList,
    jobId?: string,
    hiringPartnerId?: string,
  ) => {
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
          console.log("Fetching job details for ID:", jobId);
          jobDetails = await getJobById(jobId);
          console.log("Job details fetched:", jobDetails);

          // Ensure skills is an array
          if (jobDetails.skills && Array.isArray(jobDetails.skills)) {
            requiredSkills = jobDetails.skills;
          } else if (
            jobDetails.skills &&
            typeof jobDetails.skills === "string"
          ) {
            // Handle case where skills might be a string
            requiredSkills = jobDetails.skills
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);
          } else {
            requiredSkills = [];
          }

          jobTitle = jobDetails.title || "";
          console.log("Required skills from job:", requiredSkills);
          console.log("Job title from job:", jobTitle);
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
          console.log("Parsing resume:", file.name);
          console.log("Job ID:", jobId);
          console.log("Required skills:", requiredSkills);
          console.log("Job title:", jobTitle);

          const parsedData = await parseResume(
            file,
            jobId,
            requiredSkills,
            jobTitle,
          );

          console.log("Parsed resume data:", parsedData);
          console.log(
            `Match score for ${file.name}: ${parsedData.matchScore || 0}%`,
          );
          console.log("Skill matches:", parsedData.skillMatches || []);

          // Upload the file
          const fileUrl = await uploadResume(file);

          if (!fileUrl) {
            throw new Error("Failed to get file URL after upload");
          }

          // Create candidate entry with parsed data
          const candidateData = {
            name: parsedData.name || file.name.split(".")[0],
            email: parsedData.email || "",
            phone: parsedData.phone,
            job_id: jobId || null,
            position: jobTitle || parsedData.position || "Unspecified Position",
            source: file.type.includes("pdf") ? "PDF Upload" : "Word Upload",
            file_url: fileUrl,
            match_score: parsedData.matchScore || 0, // Ensure match_score is always defined
            notice_period: "",
            stage_id: 1, // Default to screening stage
            type: "Full Time",
            experience: parsedData.experience?.join(", ") || "0-1 years",
            skills: parsedData.skills?.join(", ") || "",
            location: parsedData.location || "Remote",
            candidate_source: hiringPartnerId
              ? "Hiring Partner"
              : "Direct Apply",
            hiring_partner_id: hiringPartnerId,
          };

          console.log("Creating candidate with data:", candidateData);
          await createCandidate(candidateData);

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
          description: `Successfully processed ${successCount} file(s). ${
            failedCount > 0 ? `${failedCount} file(s) failed.` : ""
          }`,
        });
      } else if (failedCount > 0) {
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

  // Handler functions for the ResumeDataTable
  const handleViewResume = (candidate: Candidate) => {
    if (candidate.file_url) {
      window.open(candidate.file_url, "_blank");
    } else {
      toast({
        variant: "destructive",
        title: "No Resume",
        description: "This candidate does not have a resume attached.",
      });
    }
  };

  const handleViewProfile = (candidate: Candidate) => {
    // This would typically open a modal or navigate to a profile page
    toast({
      title: "View Profile",
      description: `Viewing profile for ${candidate.name}`,
    });
    // Implementation for profile view would go here
  };

  const [editCandidateModalOpen, setEditCandidateModalOpen] = useState(false);
  const [scheduleInterviewModalOpen, setScheduleInterviewModalOpen] =
    useState(false);
  const [selectedCandidateForEdit, setSelectedCandidateForEdit] =
    useState<Candidate | null>(null);
  const [selectedCandidateForInterview, setSelectedCandidateForInterview] =
    useState<Candidate | null>(null);

  const handleEditCandidate = (candidate: Candidate) => {
    setSelectedCandidateForEdit(candidate);
    setEditCandidateModalOpen(true);
  };

  const handleScheduleInterview = (candidate: Candidate) => {
    setSelectedCandidateForInterview(candidate);
    setScheduleInterviewModalOpen(true);
  };

  const handleDeleteCandidate = async (id: string) => {
    try {
      await deleteCandidateHook(id);
      toast({
        title: "Candidate Deleted",
        description: "The candidate has been successfully deleted.",
      });
    } catch (error) {
      console.error("Error deleting candidate:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete candidate. Please try again.",
      });
    }
  };

  // Function to open the Add Candidate modal
  const openAddCandidateModal = () => {
    setShowAddModal(true);
  };

  // Function to handle bulk upload
  const handleBulkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      // TODO: Implement bulk upload functionality
      toast({
        title: "Bulk Upload",
        description: `File ${file.name} selected. Bulk upload functionality will be implemented soon.`,
      });
    }
  };

  // Function to download sample template
  const downloadSampleTemplate = () => {
    // TODO: Implement sample template download
    toast({
      title: "Download Template",
      description:
        "Sample template download functionality will be implemented soon.",
    });
  };

  const [showViewResumeModal, setShowViewResumeModal] = useState(false);
  const [showViewProfileModal, setShowViewProfileModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    null,
  );

  // Updated view resume handler
  const handleViewResumeUpdated = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setShowViewResumeModal(true);
  };

  // Updated view profile handler
  const handleViewProfileUpdated = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setShowViewProfileModal(true);
  };

  return (
    <div className="container py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resume Sourcing</h1>
          <p className="text-muted-foreground">
            Manage and review candidate resumes
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* <Button
            onClick={downloadSampleTemplate}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" /> Download Template
          </Button> */}
          {/* <div className="flex items-center space-x-2 bg-white p-4 rounded-lg border"> */}
          <Input
            placeholder="Search by name, email, position, or skills..."
            value={filters.searchTerm}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, searchTerm: e.target.value }))
            }
            className="flex-1"
          />
          {/* <Button type="submit" size="icon">
            <Search className="h-4 w-4" />
          </Button> */}
          {/* </div> */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".csv,.xlsx,.xls"
            onChange={handleBulkUpload}
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" /> Bulk Upload
          </Button>
          <Button
            onClick={openAddCandidateModal}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Add Candidate
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      {/* <div className="flex items-center space-x-2 bg-white p-4 rounded-lg border">
        <Input
          placeholder="Search by name, email, position, or skills..."
          value={filters.searchTerm}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, searchTerm: e.target.value }))
          }
          className="flex-1"
        />
        <Button type="submit" size="icon">
          <Search className="h-4 w-4" />
        </Button>
      </div> */}

      <ResumeFilters
        jobs={jobs || []}
        departments={departments || []}
        onFilterChange={setFilters}
      />

      <ResumeDataTable
        candidates={filteredCandidates}
        isLoading={isLoading}
        onDelete={handleDeleteCandidate}
        onEdit={handleEditCandidate}
        onViewResume={handleViewResumeUpdated}
        onViewProfile={handleViewProfileUpdated}
        onScheduleInterview={handleScheduleInterview}
      />

      {showAddModal && (
        <AddCandidateModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {/* Edit Candidate Modal */}
      {editCandidateModalOpen && selectedCandidateForEdit && (
        <AddCandidateModal
          isOpen={editCandidateModalOpen}
          onClose={() => {
            setEditCandidateModalOpen(false);
            setSelectedCandidateForEdit(null);
          }}
          candidateData={selectedCandidateForEdit}
          isEditing={true}
        />
      )}

      {/* Schedule Interview Modal */}
      {scheduleInterviewModalOpen && selectedCandidateForInterview && (
        <InterviewScheduler
          isOpen={scheduleInterviewModalOpen}
          onClose={() => {
            setScheduleInterviewModalOpen(false);
            setSelectedCandidateForInterview(null);
          }}
          interviewId={selectedCandidateForInterview.id}
          candidateName={selectedCandidateForInterview.name}
        />
      )}

      {/* View Resume Modal */}
      {showViewResumeModal && selectedCandidate && (
        <ViewResumeModal
          isOpen={showViewResumeModal}
          onClose={() => setShowViewResumeModal(false)}
          candidate={selectedCandidate}
        />
      )}

      {/* View Profile Modal */}
      {showViewProfileModal && selectedCandidate && (
        <ViewProfileModal
          isOpen={showViewProfileModal}
          onClose={() => setShowViewProfileModal(false)}
          candidate={selectedCandidate}
        />
      )}
    </div>
  );
}
