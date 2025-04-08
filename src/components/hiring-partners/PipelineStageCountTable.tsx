import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";

interface PipelineStageCountTableProps {
  selectedPartnerId: string;
  stagesData: { id: string; stage: string }[];
  jobs: any[];
  candidates: any[];
}

interface StageJobCount {
  [stageId: string]: {
    [jobId: string]: number;
  };
}

export function PipelineStageCountTable({
  selectedPartnerId,
  stagesData,
  jobs,
  candidates,
}: PipelineStageCountTableProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stageCounts, setStageCounts] = useState<StageJobCount>({});
  const [relevantJobs, setRelevantJobs] = useState<any[]>([]);
  const [stageNames, setStageNames] = useState<{ [key: string]: string }>({});

  // Fetch stage names if not provided
  useEffect(() => {
    const fetchStageNames = async () => {
      // Create a map of stage IDs to stage names from stagesData
      const stageMap: { [key: string]: string } = {};
      stagesData.forEach((stage) => {
        stageMap[stage.id] = stage.stage || "Unknown";
      });

      // If any stage is missing a name, try to fetch it
      const missingStageIds = stagesData
        .filter((stage) => !stage.stage)
        .map((stage) => stage.id);

      if (missingStageIds.length > 0) {
        try {
          const { data, error } = await supabase
            .from("pipeline_stages")
            .select("id, stage")
            .in("id", missingStageIds);

          if (error) throw error;

          if (data) {
            data.forEach((stage) => {
              stageMap[stage.id] = stage.stage || "Unknown Stage";
            });
          }
        } catch (err) {
          console.error("Error fetching missing stage names:", err);
        }
      }

      setStageNames(stageMap);
    };

    fetchStageNames();
  }, [stagesData]);

  useEffect(() => {
    if (!selectedPartnerId || !stagesData.length || !jobs.length) {
      setIsLoading(false);
      return;
    }

    const fetchCounts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Filter candidates by the selected hiring partner
        const partnerCandidates = candidates.filter(
          (c) =>
            c.hiring_partner_id === selectedPartnerId.toString() ||
            (c.candidate_source === "Hiring Partner" &&
              c.hiring_partner_id === selectedPartnerId.toString())
        );

        // Find jobs that have candidates from this hiring partner
        const jobsWithPartnerCandidates = jobs.filter((job) => {
          return partnerCandidates.some((c) => c.job_id === job.id);
        });

        // If no jobs with candidates, show all jobs for this partner
        setRelevantJobs(
          jobsWithPartnerCandidates.length > 0
            ? jobsWithPartnerCandidates
            : jobs
        );

        // Calculate counts for each stage and job
        const counts: StageJobCount = {};

        // Initialize counts object
        stagesData.forEach((stage) => {
          counts[stage.id] = {};
          jobsWithPartnerCandidates.forEach((job) => {
            counts[stage.id][job.id] = 0;
          });

          // Initialize counts for all jobs if no candidates found
          if (jobsWithPartnerCandidates.length === 0) {
            jobs.forEach((job) => {
              counts[stage.id][job.id] = 0;
            });
          }
        });

        // Count candidates for each stage and job
        partnerCandidates.forEach((candidate) => {
          if (candidate.stage_id && candidate.job_id) {
            const stageId = candidate.stage_id.toString();
            const jobId = candidate.job_id.toString();

            // Initialize if not already done
            if (!counts[stageId]) {
              counts[stageId] = {};
            }

            if (!counts[stageId][jobId]) {
              counts[stageId][jobId] = 0;
            }

            counts[stageId][jobId]++;
          }
        });

        setStageCounts(counts);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching pipeline stage counts:", error);
        setError("Failed to load pipeline stage counts");
        setIsLoading(false);
      }
    };

    fetchCounts();
  }, [selectedPartnerId, stagesData, jobs, candidates]);

  // Calculate row totals
  const calculateRowTotal = (stageId: string) => {
    if (!stageCounts[stageId]) return 0;

    return Object.values(stageCounts[stageId]).reduce(
      (total, count) => total + count,
      0
    );
  };

  // Get stage name with fallback
  const getStageName = (stage: { id: string; stage: string }) => {
    // First check stageNames map (which might have fetched names)
    if (stageNames[stage.id]) {
      return stageNames[stage.id];
    }
    // Then check the stage object itself
    if (stage.stage) {
      return stage.stage;
    }
    // Fallback
    return `Stage ${stage.id}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (relevantJobs.length === 0) {
    return (
      <div className="text-muted-foreground">
        No job data available for this hiring partner
      </div>
    );
  }
  // console.log(stagesData);
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-bold">Job Post</TableHead>
            {stagesData.map((stage) => (
              <TableHead key={stage.id} className="text-center">
                {getStageName(stage)}
              </TableHead>
            ))}
            <TableHead className="text-center font-bold">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {relevantJobs.map((stage) => {
            const rowTotal = calculateRowTotal(stage.id);
            return (
              <TableRow key={stage.id}>
                <TableCell className="font-medium">
                  {stage.title || "Unknown Job"}
                </TableCell>
                {stagesData.map((job) => {
                  const count = stageCounts[stage.id]?.[job.id] || 0;
                  return (
                    <TableCell key={job.id} className="text-center">
                      {count > 0 ? (
                        <Badge variant="secondary">{count}</Badge>
                      ) : (
                        "0"
                      )}
                    </TableCell>
                  );
                })}
                <TableCell className="text-center font-bold">
                  {rowTotal > 0 ? (
                    <Badge variant="default">{rowTotal}</Badge>
                  ) : (
                    "0"
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
