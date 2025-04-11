import React, { useEffect, useState, useMemo } from "react";
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
  stagesData: { id: string; stage: string; count: number; position: string }[];
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
  position,
}: PipelineStageCountTableProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stageCounts, setStageCounts] = useState<StageJobCount>({});
  const [relevantJobs, setRelevantJobs] = useState<any[]>([]);
  const [stageNames, setStageNames] = useState<{ [key: string]: string }>({});
  //  console.log(jobs, position);
  // Fetch stage names if not provided

  const result = stagesData.reduce((acc, curr) => {
    acc[curr.stage] = curr.count;
    acc.position = curr.position; // position is same for all, just set once
    return acc;
  }, {});
  const groupedByJobTitle: { [title: string]: typeof stagesData } = {};
  stagesData.forEach((stageItem) => {
    if (!groupedByJobTitle[stageItem.position]) {
      groupedByJobTitle[stageItem.position] = [];
    }
    groupedByJobTitle[stageItem.position].push(stageItem);
  });
  // console.log(result);
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

  // Memoize the filtered candidates to prevent recalculation on every render
  const partnerCandidates = useMemo(() => {
    if (!selectedPartnerId || !candidates.length) return [];

    return candidates.filter(
      (c) =>
        c.hiring_partner_id === selectedPartnerId.toString() ||
        (c.candidate_source === "Hiring Partner" &&
          c.hiring_partner_id === selectedPartnerId.toString())
    );
  }, [selectedPartnerId, candidates]);

  // Memoize the jobs with partner candidates
  const jobsWithPartnerCandidates = useMemo(() => {
    if (!partnerCandidates.length || !jobs.length) return [];

    return jobs.filter((job) => {
      return partnerCandidates.some((c) => c.job_id === job.id);
    });
  }, [partnerCandidates, jobs]);

  // Memoize the relevant jobs
  const relevantJobsMemo = useMemo(() => {
    return jobsWithPartnerCandidates.length > 0
      ? jobsWithPartnerCandidates
      : jobs;
  }, [jobsWithPartnerCandidates, jobs]);

  useEffect(() => {
    if (!selectedPartnerId || !stagesData.length || !jobs.length) {
      setIsLoading(false);
      return;
    }

    const calculateCounts = () => {
      setIsLoading(true);
      setError(null);

      try {
        // Set relevant jobs from memoized value
        setRelevantJobs(relevantJobsMemo);

        // Calculate counts for each stage and job
        const counts: StageJobCount = {};

        // Initialize counts object
        stagesData.forEach((stage) => {
          counts[stage.id] = {};
          relevantJobsMemo.forEach((job) => {
            counts[stage.id][job.id] = 0;
          });
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
        setError("Failed to load pipeline stage counts");
        setIsLoading(false);
      }
    };

    calculateCounts();
  }, [
    selectedPartnerId,
    stagesData,
    jobs,
    partnerCandidates,
    relevantJobsMemo,
  ]);

  // Calculate row totals
  const calculateRowTotal = (stageId: string) => {
    if (!stageCounts[stageId]) return 0;

    return Object.values(stageCounts[stageId]).reduce(
      (total, count) => total + (count || 0),
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
    // <div className="overflow-x-auto">
    //   <Table>
    //     <TableHeader>
    //       <TableRow>
    //         <TableHead className="font-bold">Job Post</TableHead>
    //         {stagesData.map((stage) => (
    //           <TableHead key={stage.id} className="text-center">
    //             {getStageName(stage)}
    //           </TableHead>
    //         ))}
    //         <TableHead className="text-center font-bold">Total</TableHead>
    //       </TableRow>
    //     </TableHeader>
    //     <TableBody>
    //       {relevantJobs.map((stage) => {
    //         const rowTotal = calculateRowTotal(stage.id);
    //         // console.log(stage);
    //         return (
    //           <TableRow key={stage.id}>
    //             <TableCell className="font-medium">
    //               {stage.title || "Unknown Job"}
    //             </TableCell>
    //             <TableCell className="text-center">
    //               {stage.title === result["position"] ? (
    //                 <Badge variant="secondary">
    //                   {stagesData.map((stageItem, index) => (
    //                     <span key={index}>
    //                       {result[getStageName(stageItem)]}
    //                     </span>
    //                   ))}
    //                 </Badge>
    //               ) : (
    //                 0
    //               )}
    //             </TableCell>
    //             <TableCell className="text-center font-bold">
    //               {rowTotal > 0 ? (
    //                 <Badge variant="default">{rowTotal}</Badge>
    //               ) : (
    //                 "0"
    //               )}
    //             </TableCell>
    //           </TableRow>
    //         );
    //       })}
    //     </TableBody>
    //   </Table>
    // </div>
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-bold">Job Post</TableHead>

            {groupedByJobTitle[Object.keys(groupedByJobTitle)[0]].map(
              (stage) => (
                <TableHead key={`head-${stage.stage}`} className="text-center">
                  {stage.stage}
                </TableHead>
              )
            )}

            <TableHead className="text-center font-bold">Total</TableHead>
          </TableRow>
        </TableHeader>

        {/* <TableBody>
          {Object.entries(groupedByJobTitle).map(([jobTitle, stageItems]) => {
            const total = stageItems.reduce((sum, item) => sum + item.count, 0);
            console.log(stagesData);
            return (
              <TableRow key={`row-${jobTitle}`}>
                <TableCell className="font-medium">{jobTitle}</TableCell>

                {stagesData.map((stage) => {
                  const matched = stageItems.find(
                    (s) => s.id === stage.id.toString()
                  );
                  const cellKey = `${jobTitle}-${stage.id}`; // Unique key

                  return (
                    <TableCell key={cellKey} className="text-center">
                      {matched?.count ?? 0}
                    </TableCell>
                  );
                })}

                <TableCell className="text-center font-bold">
                  <Badge variant="default">{total}</Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody> */}
        <TableBody>
          {Object.entries(groupedByJobTitle).map(([jobTitle, stageItems]) => {
            const total = stageItems.reduce((sum, item) => sum + item.count, 0);
            // console.log(stageItems);
            return (
              <TableRow key={`row-${jobTitle}`}>
                <TableCell className="font-medium">{jobTitle}</TableCell>

                {stageItems.map((stage) => {
                  const cellKey = `${jobTitle}-${stage.stage}`; // Use stage name for uniqueness

                  return (
                    <TableCell key={cellKey} className="text-center">
                      {stage.count}
                    </TableCell>
                  );
                })}

                <TableCell className="text-center font-bold">
                  <Badge variant="default">{total}</Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
