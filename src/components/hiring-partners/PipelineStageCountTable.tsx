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
  // console.log(stagesData, "selectedPartnerId,stagesData,jobs,candidates");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stageCounts, setStageCounts] = useState<StageJobCount>({});
  const [relevantJobs, setRelevantJobs] = useState<any[]>([]);

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
        console.log(jobsWithPartnerCandidates, jobs);
        setRelevantJobs(jobs);

        // Calculate counts for each stage and job
        const counts: StageJobCount = {};

        // Initialize counts object
        stagesData.forEach((stage) => {
          counts[stage.id] = {};
          jobsWithPartnerCandidates.forEach((job) => {
            counts[stage.id][job.id] = 0;
          });
        });

        // Count candidates for each stage and job
        partnerCandidates.forEach((candidate) => {
          if (candidate.stage_id && candidate.job_id) {
            if (
              counts[candidate.stage_id] &&
              counts[candidate.stage_id][candidate.job_id] !== undefined
            ) {
              counts[candidate.stage_id][candidate.job_id]++;
            }
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
  }, []);

  // Calculate row totals
  const calculateRowTotal = (stageId: string) => {
    if (!stageCounts[stageId]) return 0;

    return Object.values(stageCounts[stageId]).reduce(
      (total, count) => total + count,
      0
    );
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

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-bold">Pipeline Stage</TableHead>
            {relevantJobs.map((job) => (
              <TableHead key={job.id} className="text-center">
                {job.title || "Unknown Job"}
              </TableHead>
            ))}
            <TableHead className="text-center font-bold">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stagesData.map((stage) => {
            const rowTotal = calculateRowTotal(stage.id);
            return (
              <TableRow key={stage.id}>
                <TableCell className="font-medium">{stage.stage}</TableCell>
                {relevantJobs.map((job) => {
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
