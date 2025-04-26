import { useState, useEffect, useMemo } from "react";
import React from "react";
import { useHiringPartnerMetrics } from "@/lib/api/hooks/useHiringPartnerMetrics";
import { useOrganizations } from "@/lib/api/hooks/useOrganizations";
import { useCandidates } from "@/lib/api/hooks/useCandidates";
import { useJobs } from "@/lib/api/hooks/useJobs";
import { usePipelineStages } from "@/lib/api/hooks/usePipelineStages";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PipelineStageCountTable } from "@/components/hiring-partners/PipelineStageCountTable";
import { useSearchParams } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, Users, Briefcase, BarChart2, Calendar } from "lucide-react";
import { supabase } from "@/lib/supabase";

// Helper function to generate monthly performance data
const generateMonthlyData = (candidates, partnerId, months = 6) => {
  if (!candidates || !partnerId) return [];

  const partnerCandidates = candidates.filter(
    (c) =>
      c.hiring_partner_id === partnerId.toString() ||
      (c.candidate_source === "Hiring Partner" &&
        c.hiring_partner_id === partnerId.toString())
  );

  // Get current date and calculate the last 6 months
  const currentDate = new Date();
  const monthData = [];

  for (let i = months - 1; i >= 0; i--) {
    const monthDate = new Date(currentDate);
    monthDate.setMonth(currentDate.getMonth() - i);
    const monthName = monthDate.toLocaleString("default", { month: "short" });
    const monthYear = monthDate.getFullYear();
    const monthStart = new Date(monthYear, monthDate.getMonth(), 1);
    const monthEnd = new Date(monthYear, monthDate.getMonth() + 1, 0);

    // Filter candidates for this month
    const monthCandidates = partnerCandidates.filter((candidate) => {
      if (!candidate.created_at) return false;
      const candidateDate = new Date(candidate.created_at);
      return candidateDate >= monthStart && candidateDate <= monthEnd;
    });

    // Count joined candidates for this month
    const monthJoined = monthCandidates.filter((c) => c.stage_id === 6).length;

    monthData.push({
      month: monthName,
      candidates: monthCandidates.length,
      joined: monthJoined,
    });
  }

  return monthData;
};

export default function HiringPartners() {
  const [searchParams] = useSearchParams();
  const partnerId = searchParams.get("id");
  const {
    organizations,
    ownOrganization,
    isLoading: isLoadingOrgs,
    error: orgsError,
    queryClient,
  } = useOrganizations();
  const {
    data: candidates,
    isLoading: isLoadingCandidates,
    error: candidatesError,
    createCandidate,
    updateCandidate,
    deleteCandidate,
  } = useCandidates();
  const { jobs, isLoading: isLoadingJobs, error: jobsError } = useJobs();
  const { stagesD, isLoading: isLoadingStages } = usePipelineStages();
  const [selectedPartner, setSelectedPartner] = useState<any>(null);
  const [partnerStats, setPartnerStats] = useState<any>(null);
  const [timeToHireData, setTimeToHireData] = useState<{
    avg: number;
    data: any[];
  }>({ avg: 0, data: [] });
  const [costPerHireData, setCostPerHireData] = useState<{
    avg: number;
    data: any[];
  }>({ avg: 0, data: [] });
  const [partnerDetails, setPartnerDetails] = useState<any>(null);
  const [sourceCount, setSourceCount] = useState({});
  const [partnerCandi, setPartnerCand] = useState([]);
  const [stageDataCount, setStageDataCount] = useState(0);
  const [isLoadingPartnerDetails, setIsLoadingPartnerDetails] = useState(false);
  // console.log(stagesD);
  // Filter to only hiring partners (non-own organizations)
  const hiringPartners = organizations?.filter((org) => !org.is_own_org) || [];

  // Memoize the hiring partners array to prevent unnecessary re-renders
  const memoizedHiringPartners = useMemo(
    () => hiringPartners || [],
    [hiringPartners]
  );

  // Use a ref to track if we've already fetched the data
  const hasFetchedRef = React.useRef(false);

  useEffect(() => {
    const fetchPartnerDetails = async () => {
      if (!memoizedHiringPartners.length) {
        console.log("No hiring partners available to fetch counts");
        return;
      }

      // Skip if we've already fetched and there's no change in partners
      if (
        hasFetchedRef.current &&
        Object.keys(sourceCount).length === memoizedHiringPartners.length
      ) {
        return;
      }

      hasFetchedRef.current = true;

      try {
        const orgIdArray = memoizedHiringPartners
          .map((ele) => ele?.id)
          .filter(Boolean);

        // Batch the query instead of making individual requests
        const { data, error } = await supabase
          .from("candidates")
          .select("hiring_partner_id, id")
          .in("hiring_partner_id", orgIdArray);

        if (error) {
          console.error("Error fetching counts for partners:", error);
          return;
        }

        // Count candidates for each partner
        const finalData = orgIdArray.reduce((acc, partnerId) => {
          acc[partnerId] =
            data?.filter(
              (c) =>
                c.hiring_partner_id === partnerId.toString() ||
                (c.candidate_source === "Hiring Partner" &&
                  c.hiring_partner_id === partnerId.toString())
            ).length || 0;
          return acc;
        }, {} as Record<string, number>);
        console.log(data, finalData);
        setSourceCount(finalData);
      } catch (err) {
        console.error("Error in fetchPartnerDetails:", err);
      }
    };

    fetchPartnerDetails();
  }, [memoizedHiringPartners, sourceCount]);

  useEffect(() => {
    if (partnerId && hiringPartners.length > 0) {
      const partner = hiringPartners.find((p) => p.id.toString() === partnerId);
      if (partner) {
        setSelectedPartner(partner);
      }
    } else if (hiringPartners.length > 0 && !selectedPartner) {
      setSelectedPartner(hiringPartners[0]);
    }
  }, [partnerId, hiringPartners, selectedPartner]);

  useEffect(() => {
    if (!selectedPartner) return;

    const fetchPartnerDetails = async () => {
      setIsLoadingPartnerDetails(true);
      try {
        setTimeout(() => {
          setPartnerDetails({
            name: selectedPartner.name,
            industry: selectedPartner.industry || "Technology",
            location: selectedPartner.location || "San Francisco, CA",
            founded: selectedPartner.founded || "2010",
            employees: selectedPartner.employees || "100-500",
            website: selectedPartner.website || "https://example.com",
            agreement: {
              startDate: "2023-01-15",
              endDate: "2024-01-14",
              fee: "15%",
              exclusivity: "Non-exclusive",
            },
            contactPerson: {
              name: "John Smith",
              email: "john@example.com",
              phone: "+1 (555) 123-4567",
            },
          });
          setIsLoadingPartnerDetails(false);
        }, 500);
      } catch (error) {
        console.error("Error fetching partner details:", error);
        setIsLoadingPartnerDetails(false);
      }
    };

    fetchPartnerDetails();
  }, [selectedPartner]);

  useEffect(() => {
    const fetchCount = async () => {
      const { data, error } = await supabase
        .from("candidates")
        .select(
          `
    location,
    stages (
    id,
      stage
    ),
    jobs (
      created_at,
      title
    )
  `
        )
        .eq("hiring_partner_id", selectedPartner?.id);
      // const { data, error } = await supabase
      //   .from("candidates")
      //   .select("*")
      //   .eq("hiring_partner_id", selectedPartner?.id);
      console.log(data);
      if (error) {
        console.error("Error fetching candidates:", error);
      } else {
        setPartnerCand(data);
        setStageDataCount(
          data.filter((c) => c.stages[0]?.id === 2).length
        );
      }
    };

    fetchCount();
  }, [selectedPartner]);

  // Import the new hook
  const { data: partnerMetrics, isLoading: isLoadingMetrics } =
    useHiringPartnerMetrics(selectedPartner?.id?.toString() || "");

  // Calculate statistics for the selected partner
  useEffect(() => {
    if (
      !selectedPartner ||
      !candidates ||
      !jobs ||
      !stagesD ||
      !partnerMetrics
    ) {
      return;
    }
    console.log(candidates, selectedPartner.id);
    // Filter candidates sourced by this partner - only include candidates that are explicitly linked to this partner
    const partnerCandidates = candidates.filter(
      (c) =>
        c.hiring_partner_id == selectedPartner.id.toString() ||
        (c.candidate_source === "Hiring Partner" &&
          c.hiring_partner_id === selectedPartner.id.toString())
    );

    // Get unique job positions for this partner
    const uniquePositions = new Set();
    partnerCandidates.forEach((candidate) => {
      if (candidate.job_id) {
        uniquePositions.add(candidate.job_id);
      }
    });

    const positionsCount = uniquePositions.size;

    // Group by job
    const jobStats = {};
    partnerCandidates.forEach((candidate) => {
      const jobId = candidate.job_id;
      if (!jobId) return;

      if (!jobStats[jobId]) {
        const job = jobs.find((j) => j.id === jobId);
        jobStats[jobId] = {
          job_id: jobId,
          job_title: job?.title || "Unknown Position",
          total: 0,
          screening: 0,
          interview: 0,
          offered: 0,
          joined: 0,
          rejected: 0,
        };
      }

      jobStats[jobId].total++;

      // Count by stage
      if (candidate.stage_id === 1) jobStats[jobId].screening++;
      else if (candidate.stage_id === 2 || candidate.stage_id === 3)
        jobStats[jobId].interview++;
      else if (candidate.stage_id === 4) jobStats[jobId].offered++;
      else if (candidate.stage_id === 6) jobStats[jobId].joined++;
      else if (candidate.stage_id === 5) jobStats[jobId].rejected++;
    });

    // Use metrics from backend
    const totalCandidates = partnerMetrics.totalCandidates;
    const totalJoined = partnerMetrics.totalJoined;
    const successRate = partnerMetrics.successRate;
    const avgTimeToHire = partnerMetrics.avgTimeToHire;

    // Set time to hire data from backend
    setTimeToHireData({
      avg: avgTimeToHire,
      data: partnerMetrics.timeToHireData,
    });

    const totalInterviewed = partnerCandidates.filter(
      (c) => c.stage_id === 2 || c.stage_id === 3
    ).length;

    // Calculate cost per hire (using a placeholder average cost of $1000 per candidate)
    const baseCost = 1000; // Base cost per candidate
    const costMultiplier = 1.2; // Cost multiplier for different stages
    const costData = [];

    const totalCost = partnerCandidates.reduce((acc, candidate) => {
      let candidateCost = baseCost;
      if (candidate.stage_id >= 2) candidateCost *= costMultiplier; // Higher cost for candidates who reached interview

      costData.push({
        name: candidate.name,
        cost: candidateCost,
        position:
          jobs.find((j) => j.id === candidate.job_id)?.title ||
          "Unknown Position",
      });

      return acc + candidateCost;
    }, 0);

    const avgCostPerHire =
      totalJoined > 0 ? Math.round(totalCost / totalJoined) : 0;
    setCostPerHireData({ avg: avgCostPerHire, data: costData });

    // Prepare chart data
    const stageData = [
      {
        stage: "Screening",
        count: partnerCandidates.filter((c) => c.stage_id === 1).length,
      },
      {
        stage: "Interview",
        count: partnerCandidates.filter(
          (c) => c.stage_id === 2 || c.stage_id === 3
        ).length,
      },
      {
        stage: "Offered",
        count: partnerCandidates.filter((c) => c.stage_id === 4).length,
      },
      {
        stage: "Joined",
        count: totalJoined, // Use the backend count
      },
      {
        stage: "Rejected",
        count: partnerCandidates.filter((c) => c.stage_id === 5).length,
      },
    ];

    setPartnerStats({
      totalCandidates,
      totalJoined,
      totalInterviewed,
      successRate,
      positionsCount,
      jobStats: Object.values(jobStats),
      stageData,
    });

    // Update source count for this partner
    setSourceCount({
      ...sourceCount,
      [selectedPartner.id]: totalCandidates,
    });
  }, [
    selectedPartner,
    candidates,
    jobs,
    stagesD,
    partnerMetrics,
    createCandidate,
    updateCandidate,
    deleteCandidate,
  ]);

  const isLoading = isLoadingOrgs || isLoadingCandidates || isLoadingJobs;
  const hasError = orgsError || candidatesError || jobsError;

  if (isLoading || !organizations) {
    return (
      <div className="container py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hiring Partners</h1>
          <p className="text-muted-foreground">
            Loading hiring partners data...
          </p>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="cursor-pointer">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="container py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hiring Partners</h1>
          <p className="text-muted-foreground text-red-500">
            Error loading data. Please try refreshing the page.
          </p>
        </div>
      </div>
    );
  }

  if (organizations.length === 0) {
    return (
      <div className="container py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hiring Partners</h1>
          <p className="text-muted-foreground">
            No hiring partners found. Please add hiring partners to view their
            performance.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hiring Partners</h1>
          <p className="text-muted-foreground">
            Manage and track performance of hiring partners
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {hiringPartners.map((partner) => (
          <Card
            key={partner.id}
            className={`cursor-pointer ${
              selectedPartner?.id === partner.id ? "border-primary" : ""
            }`}
            onClick={() => setSelectedPartner(partner)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{partner.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {partner.industry || "No industry specified"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedPartner && partnerStats && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">
              {selectedPartner.name} Performance
            </h2>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Total Candidates Sourced
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {sourceCount[selectedPartner.id] !== undefined
                    ? sourceCount[selectedPartner.id]
                    : partnerStats.totalCandidates || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {partnerStats.totalCandidates > 0
                    ? `${partnerStats.totalCandidates} candidates in total`
                    : "No candidates yet"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-primary" />
                  Candidates Joined
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* {console.log(partnerStats)} */}
                <div className="text-2xl font-bold">
                  {partnerStats.totalJoined}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {partnerStats.totalJoined > 0
                    ? `${partnerStats.totalJoined} out of ${partnerStats.totalCandidates} candidates`
                    : "No hires yet"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <BarChart2 className="h-4 w-4 text-primary" />
                  Success Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {partnerStats.successRate}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {partnerStats.successRate > 0
                    ? `${partnerStats.successRate}% conversion rate`
                    : "No conversions yet"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Avg. Time to Hire
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {timeToHireData.avg} days
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {timeToHireData.avg > 0
                    ? `Based on ${timeToHireData.data.length} successful hires`
                    : "No completed hires yet"}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle>Pipeline Stage Count by Job</CardTitle>
                  <Badge variant="outline" className="ml-2">
                    {candidates?.filter(
                      (c) =>
                        c.hiring_partner_id ===
                          selectedPartner?.id.toString() ||
                        (c.candidate_source === "Hiring Partner" &&
                          c.hiring_partner_id ===
                            selectedPartner?.id.toString())
                    ).length || 0}{" "}
                    candidates
                  </Badge>
                </CardHeader>
                {console.log(candidates, jobs)}
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Detailed list of candidates sourced by{" "}
                    {selectedPartner.name}
                  </p>
                  {console.log(selectedPartner)}
                  {selectedPartner ? (
                    (() => {
                      // Flatten all stage data across all jobs
                      const allStagesData = jobs.flatMap((job) =>
                        stagesD.map((stage) => ({
                          id: stage.id.toString(),
                          stage: stage.name || "Unknown",
                          count:
                            candidates.filter(
                              (ele) =>
                                ele.stage_id === stage.id &&
                                ele.position === job.title &&
                                ele.location === job.location &&
                                ele.hiring_partner_id == selectedPartner?.id
                            ).length || 0,
                          position: job.title,
                          location: job.location,
                          created_at: job.created_at, // for job-specific row
                        }))
                      );

                      return (
                        <PipelineStageCountTable
                          selectedPartnerId={
                            selectedPartner?.id?.toString() || ""
                          }
                          partnerCand={partnerCandi}
                          stagesData={allStagesData}
                          jobs={jobs || []}
                          candidates={candidates || []}
                        />
                      );
                    })()
                  ) : (
                    <div className="text-muted-foreground">
                      No data available for this hiring partner
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            {partnerDetails && (
              <Card>
                <CardHeader>
                  <CardTitle>Partner Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">
                        Company Details
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Industry:
                          </span>
                          <span>{partnerDetails.industry}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Location:
                          </span>
                          <span>{partnerDetails.location}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Founded:
                          </span>
                          <span>{partnerDetails.founded}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Employees:
                          </span>
                          <span>{partnerDetails.employees}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Website:
                          </span>
                          <a
                            href={partnerDetails.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {partnerDetails.website}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
