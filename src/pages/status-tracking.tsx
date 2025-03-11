import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusTimeline } from "@/components/status-tracking/status-timeline";
import { StatusAnalytics } from "@/components/status-tracking/status-analytics";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { StatusOverview } from "@/components/status-tracking/status-overview";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function StatusTracking() {
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [stages, setStages] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [jobPositions, setJobPositions] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [selectedCandidateId, setSelectedCandidateId] = useState("");

  // Fetch job positions
  useEffect(() => {
    const fetchJobPositions = async () => {
      try {
        const { data, error } = await supabase
          .from("jobs")
          .select("id, title")
          .order("title");
        if (error) throw error;
        setJobPositions(data || []);
      } catch (error) {
        console.error("Error fetching job positions:", error);
      }
    };
    fetchJobPositions();
  }, []);

  // Fetch stages and candidates
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch pipeline stages
        const { data: stagesData } = await supabase
          .from("stages")
          .select("id, stage")
          .order("stage_order", { ascending: true });

        setStages(stagesData || []);

        // Fetch candidates with their stages
        const query = supabase
          .from("candidates")
          .select("id, name, stage_id, job_id, created_at, source, jobs(title)")
          .order("updated_at", { ascending: false });

        // Apply job filter if selected
        if (selectedJobId) {
          query.eq("job_id", selectedJobId);
        }

        const { data: candidatesData } = await query;
        setCandidates(candidatesData || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedJobId]);

  // Update selected candidate when ID changes
  useEffect(() => {
    if (selectedCandidateId) {
      const fetchFullCandidateData = async () => {
        try {
          const { data, error } = await supabase
            .from("candidates")
            .select("*, jobs(title)")
            .eq("id", selectedCandidateId)
            .single();

          if (error) throw error;
          setSelectedCandidate(data);
        } catch (error) {
          console.error("Error fetching candidate details:", error);
          setSelectedCandidate(null);
        }
      };

      fetchFullCandidateData();
    } else {
      setSelectedCandidate(null);
    }
  }, [selectedCandidateId]);

  // Group candidates by stage
  const candidatesByStage = {};
  stages.forEach((stage) => {
    candidatesByStage[stage.id] = candidates.filter(
      (c) => c.stage_id === stage.id,
    );
  });

  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Status Tracking</h1>
        <p className="text-muted-foreground">
          Track candidate progress through the hiring pipeline
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Job Position</Label>
          <Select
            value={selectedJobId}
            onValueChange={(value) => {
              setSelectedJobId(value);
              setSelectedCandidateId("");
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select job position" />
            </SelectTrigger>
            <SelectContent>
              {jobPositions.map((job) => (
                <SelectItem key={job.id} value={job.id}>
                  {job.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Candidate</Label>
          <Select
            value={selectedCandidateId}
            onValueChange={setSelectedCandidateId}
            disabled={candidates.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select candidate" />
            </SelectTrigger>
            <SelectContent>
              {candidates.map((candidate) => (
                <SelectItem key={candidate.id} value={candidate.id}>
                  {candidate.name}{" "}
                  {candidate.jobs?.title ? `(${candidate.jobs.title})` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <StatusOverview selectedJobId={selectedJobId} />

      <div className="flex flex-wrap gap-4 pb-4 overflow-auto">
        {stages.map((stage) => (
          <Card
            key={stage.id}
            className="w-[250px] bg-gray-50 shadow-md rounded-lg flex flex-col h-auto"
          >
            <CardHeader className="py-3 bg-gray-200 rounded-t-lg">
              <CardTitle className="text-sm font-medium flex items-center justify-between text-gray-700">
                {stage.stage}
                <Badge className="bg-blue-600 text-white">
                  {candidatesByStage[stage.id]?.length || 0}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow p-2">
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {isLoading ? (
                    <div className="text-center py-4 text-muted-foreground">
                      Loading...
                    </div>
                  ) : candidatesByStage[stage.id]?.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      No candidates
                    </div>
                  ) : (
                    candidatesByStage[stage.id]?.map((candidate) => (
                      <div
                        key={candidate.id}
                        className="p-3 cursor-pointer bg-white shadow-sm hover:shadow-md transition-all duration-200 rounded-md border border-gray-200"
                        onClick={() => {
                          setSelectedCandidateId(candidate.id);
                        }}
                      >
                        <div className="font-medium text-gray-900">
                          {candidate.name}
                        </div>
                        {candidate.jobs?.title && (
                          <div className="text-xs text-gray-600 mt-1">
                            {candidate.jobs.title}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <StatusTimeline selectedCandidate={selectedCandidate} />
        <StatusAnalytics
          selectedJobId={selectedJobId}
          selectedCandidateId={selectedCandidateId}
        />
      </div>
    </div>
  );
}
