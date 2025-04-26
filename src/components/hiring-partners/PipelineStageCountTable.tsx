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
  partnerCand: any[];
  stagesData: {
    id: string;
    stage: string;
    count: number;
    position: string;
    location: string;
    created_at: string;
  }[];
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
  partnerCand,
  stagesData,
  jobs,
  candidates,
}: PipelineStageCountTableProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stageCounts, setStageCounts] = useState<StageJobCount>({});
  const [relevantJobs, setRelevantJobs] = useState<any[]>([]);
  const [stageNames, setStageNames] = useState<{ [key: string]: string }>({});
  console.log(partnerCand);

  const positionLocationMap: {
    [key: string]: {
      position: string;
      location: string;
      createdDate: string;
      count: number;
    };
  } = {};

  partnerCand.forEach((candidate) => {
    const position = candidate.jobs?.title || "Unknown Position";
    const location = candidate.location || "Unknown Location";
    const createdDate = candidate.jobs?.created_at
      ? new Date(candidate.jobs.created_at).toISOString().split("T")[0]
      : "Unknown Date";

    const key = `${position}||${location}||${createdDate}`;

    if (!positionLocationMap[key]) {
      positionLocationMap[key] = {
        position,
        location,
        createdDate,
        count: 0,
      };
    }

    positionLocationMap[key].count++;
  });

  const resultData = Object.values(positionLocationMap);

  console.log(resultData);
  const groupedByJobTitleLocationAndDate: { [key: string]: typeof stagesData } =
    {};

  stagesData.forEach((stageItem) => {
    const createdDate = new Date(stageItem.created_at)
      .toISOString()
      .split("T")[0]; // Get YYYY-MM-DD
    const key = `${stageItem.location}||${stageItem.position}||${createdDate}`;

    if (!groupedByJobTitleLocationAndDate[key]) {
      groupedByJobTitleLocationAndDate[key] = [];
    }

    groupedByJobTitleLocationAndDate[key].push(stageItem);
  });

  useEffect(() => {
    const fetchStageNames = async () => {
      const stageMap: { [key: string]: string } = {};
      stagesData.forEach((stage) => {
        stageMap[stage.id] = stage.stage || "Unknown";
      });

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

  const partnerCandidates = useMemo(() => {
    if (!selectedPartnerId || !candidates.length) return [];
    return candidates.filter(
      (c) =>
        c.hiring_partner_id === selectedPartnerId.toString() ||
        (c.candidate_source === "Hiring Partner" &&
          c.hiring_partner_id === selectedPartnerId.toString())
    );
  }, [selectedPartnerId, candidates]);

  const jobsWithPartnerCandidates = useMemo(() => {
    if (!partnerCandidates.length || !jobs.length) return [];
    return jobs.filter((job) =>
      partnerCandidates.some((c) => c.job_id === job.id)
    );
  }, [partnerCandidates, jobs]);

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
        setRelevantJobs(relevantJobsMemo);
        const counts: StageJobCount = {};

        stagesData.forEach((stage) => {
          counts[stage.id] = {};
          relevantJobsMemo.forEach((job) => {
            counts[stage.id][job.id] = 0;
          });
        });

        partnerCandidates.forEach((candidate) => {
          if (candidate.stage_id && candidate.job_id) {
            const stageId = candidate.stage_id.toString();
            const jobId = candidate.job_id.toString();

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

  const getTotalCountByLocation = (
    position: string,
    location: string,
    createdDate: string
  ) => {
    return resultData
      .filter(
        (item) =>
          item.position === position &&
          item.location === location &&
          item.createdDate === createdDate
      )
      .reduce((sum, item) => sum + item.count, 0);
  };

  const getStageName = (stage: { id: string; stage: string }) => {
    if (stageNames[stage.id]) return stageNames[stage.id];
    if (stage.stage) return stage.stage;
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

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-bold">Job Post</TableHead>
            <TableHead className="font-bold">Location</TableHead>
            <TableHead className="font-bold">Created Date</TableHead>
            {groupedByJobTitleLocationAndDate[
              Object.keys(groupedByJobTitleLocationAndDate)[0]
            ]?.map((stage) => (
              <TableHead key={`head-${stage.stage}`} className="text-center">
                {getStageName(stage)}
              </TableHead>
            ))}
            <TableHead className="text-center font-bold">Total</TableHead>
          </TableRow>
        </TableHeader>
        {/* <TableBody>
          {Object.entries(groupedByJobTitleLocationAndDate).map(
            ([jobTitle, stageItems]) => {
              const [location, position, date] = jobTitle.split("||");

              return (
                <TableRow key={`row-${jobTitle}`}>
                  <TableCell className="font-medium">{position}</TableCell>
                  <TableCell className="font-medium">{location}</TableCell>
                  <TableCell className="font-medium">{date}</TableCell>
                  {stageItems.map((stage) => {
                    const cellKey = `${jobTitle}-${stage.stage}`;
                    console.log(stage.count)
                    return (
                      <TableCell key={cellKey} className="text-center">
                        {stage.count}
                      </TableCell>
                    );
                  })}

                  <TableCell className="text-center font-bold">
                    <Badge variant="default">
                      {getTotalCountByLocation(position, location, date)}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            }
          )}
        </TableBody> */}
        <TableBody>
          {Object.entries(groupedByJobTitleLocationAndDate).map(
            ([jobTitle, stageItems]) => {
              const [location, position, date] = jobTitle.split("||");

              return (
                <TableRow key={`row-${jobTitle}`}>
                  <TableCell className="font-medium">{position}</TableCell>
                  <TableCell className="font-medium">{location}</TableCell>
                  <TableCell className="font-medium">{date}</TableCell>
                  {stageItems.map((stage) => {
                    const count = partnerCand.filter((candidate) => {
                      const jobTitleMatch =
                        (candidate.jobs?.title || "Unknown Position") ===
                        position;
                      const locationMatch = candidate.location === location;
                      const dateMatch =
                        new Date(candidate.jobs?.created_at || "")
                          .toISOString()
                          .split("T")[0] === date;
                      const stageMatch =
                        candidate.stages?.id?.toString() ===
                        stage.id.toString();

                      return (
                        jobTitleMatch &&
                        locationMatch &&
                        dateMatch &&
                        stageMatch
                      );
                    }).length;

                    return (
                      <TableCell
                        key={`${jobTitle}-${stage.id}`}
                        className="text-center"
                      >
                        {count}
                      </TableCell>
                    );
                  })}
                  <TableCell className="text-center font-bold">
                    <Badge variant="default">
                      {getTotalCountByLocation(position, location, date)}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            }
          )}
        </TableBody>
      </Table>
    </div>
  );
}
