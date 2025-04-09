import { useState, useEffect, useMemo } from "react";
import { useHiringPartnerMetrics } from "@/lib/api/hooks/useHiringPartnerMetrics";
import { useOrganizations } from "@/lib/api/hooks/useOrganizations";
import { useCandidates } from "@/lib/api/hooks/useCandidates";
import { useJobs } from "@/lib/api/hooks/useJobs";
import { usePipelineStages } from "@/lib/api/hooks/usePipelineStages";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PipelineChart } from "@/components/dashboard/pipeline-chart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PipelineStageCountTable } from "@/components/hiring-partners/PipelineStageCountTable";
import { useSearchParams } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Download,
  RefreshCw,
  Users,
  Briefcase,
  BarChart2,
  Calendar,
  DollarSign,
} from "lucide-react";
import axios from "axios";
import { supabase } from "@/lib/supabase";

// Helper function to generate monthly performance data
const generateMonthlyData = (candidates, partnerId, months = 6) => {
  if (!candidates || !partnerId) return [];

  const partnerCandidates = candidates.filter(
    (c) =>
      c.hiring_partner_id === partnerId.toString() ||
      (c.candidate_source === "Hiring Partner" &&
        c.hiring_partner_id === partnerId.toString()),
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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sourceCount, setSourceCount] = useState({});
  const [isLoadingPartnerDetails, setIsLoadingPartnerDetails] = useState(false);
  // console.log(stagesD);
  // Filter to only hiring partners (non-own organizations)
  const hiringPartners = organizations?.filter((org) => !org.is_own_org) || [];

  useEffect(() => {
    const fetchPartnerDetails = async () => {
      if (!hiringPartners || hiringPartners.length === 0) {
        console.log("No hiring partners available to fetch counts");
        return;
      }

      try {
        const orgIdArray = hiringPartners.map((ele) => ele?.id);
        let finalData: any = {};

        for (const partnerId of orgIdArray) {
          if (!partnerId) continue;

          // Count candidates with this hiring partner ID
          const { data, error, count } = await supabase
            .from("candidates")
            .select("*", { count: "exact", head: true })
            .or(
              `hiring_partner_id.eq.${partnerId},and(candidate_source.eq.Hiring Partner,hiring_partner_id.eq.${partnerId})`,
            );

          if (error) {
            console.error(
              `Error fetching count for partner ${partnerId}:`,
              error,
            );
            finalData[partnerId] = 0;
          } else {
            finalData[partnerId] = count || 0;
          }
        }

        setSourceCount(finalData);
      } catch (err) {
        console.error("Error in fetchPartnerDetails:", err);
      }
    };

    fetchPartnerDetails();
  }, [hiringPartners]);

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

  // Function to refresh data
  const refreshData = () => {
    setIsRefreshing(true);
    // Refresh all relevant data
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      setIsRefreshing(false);
    }, 1000);
  };

  // Set up a listener for candidate changes
  useEffect(() => {
    // This effect will run whenever createCandidate, updateCandidate, or deleteCandidate changes
    // It ensures the hiring partners page reflects the latest candidate data
    return () => {
      // Cleanup function
    };
  }, [createCandidate, updateCandidate, deleteCandidate]);

  // Fetch additional partner details when a partner is selected
  useEffect(() => {
    if (!selectedPartner) return;

    const fetchPartnerDetails = async () => {
      setIsLoadingPartnerDetails(true);
      try {
        // Simulate API call to get partner details
        // In a real implementation, this would be an actual API call
        // const response = await axios.get(`/api/partners/${selectedPartner.id}`);

        // For now, simulate a response with mock data
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

    // Filter candidates sourced by this partner - only include candidates that are explicitly linked to this partner
    const partnerCandidates = candidates.filter(
      (c) =>
        c.hiring_partner_id === selectedPartner.id.toString() ||
        (c.candidate_source === "Hiring Partner" &&
          c.hiring_partner_id === selectedPartner.id.toString()),
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
      (c) => c.stage_id === 2 || c.stage_id === 3,
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
          (c) => c.stage_id === 2 || c.stage_id === 3,
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
        <Button
          variant="outline"
          onClick={refreshData}
          disabled={isRefreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw
            className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
          Refresh Data
        </Button>
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

          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              {/* <TabsTrigger value="positions">Positions</TabsTrigger>
              <TabsTrigger value="candidates">Candidates</TabsTrigger> */}
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle>Candidate Pipeline</CardTitle>
                    <Badge variant="outline" className="ml-2">
                      {partnerStats.totalCandidates} total
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <PipelineChart data={partnerStats.stageData} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle>Monthly Performance</CardTitle>
                    <Badge variant="outline" className="ml-2">
                      Last 6 months
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={generateMonthlyData(
                          candidates,
                          selectedPartner.id
                        )}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar
                          dataKey="candidates"
                          fill="#8884d8"
                          name="Total Candidates"
                        />
                        <Bar dataKey="joined" fill="#82ca9d" name="Joined" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div> */}

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
                              selectedPartner?.id.toString()),
                      ).length || 0}{" "}
                      candidates
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Detailed list of candidates sourced by{" "}
                      {selectedPartner.name}
                    </p>

                    {selectedPartner ? (
                      <PipelineStageCountTable
                        selectedPartnerId={
                          selectedPartner?.id?.toString() || ""
                        }
                        stagesData={stagesD.map((stage) => ({
                          id: stage.id.toString(), // Ensure ID is a string
                          stage: stage.name || "Unknown", // Provide a default value if missing
                        }))}
                        jobs={jobs || []}
                        candidates={candidates || []}
                      />
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
                      {/* <div>
                        <h3 className="text-lg font-medium mb-2">
                          Agreement Details
                        </h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Start Date:
                            </span>
                            <span>
                              {new Date(
                                partnerDetails.agreement.startDate
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              End Date:
                            </span>
                            <span>
                              {new Date(
                                partnerDetails.agreement.endDate
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Fee Structure:
                            </span>
                            <span>{partnerDetails.agreement.fee}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Exclusivity:
                            </span>
                            <span>{partnerDetails.agreement.exclusivity}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Contact Person:
                            </span>
                            <span>{partnerDetails.contactPerson.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Contact Email:
                            </span>
                            <a
                              href={`mailto:${partnerDetails.contactPerson.email}`}
                              className="text-primary hover:underline"
                            >
                              {partnerDetails.contactPerson.email}
                            </a>
                          </div>
                        </div>
                      </div> */}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* <TabsContent value="positions" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle>Positions Sourced</CardTitle>
                  <Badge variant="outline" className="ml-2">
                    {partnerStats.positionsCount || 0} positions
                  </Badge>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Position</TableHead>
                        <TableHead>Total Candidates</TableHead>
                        <TableHead>In Screening</TableHead>
                        <TableHead>In Interview</TableHead>
                        <TableHead>Offered</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Success Rate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {partnerStats.jobStats.map((job) => (
                        <TableRow key={job.job_id}>
                          <TableCell className="font-medium">
                            {job.job_title}
                          </TableCell>
                          <TableCell>{job.total}</TableCell>
                          <TableCell>{job.screening}</TableCell>
                          <TableCell>{job.interview}</TableCell>
                          <TableCell>{job.offered}</TableCell>
                          <TableCell>{job.joined}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {job.total > 0
                                ? Math.round((job.joined / job.total) * 100)
                                : 0}
                              %
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                      {partnerStats.jobStats.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-4">
                            No positions found for this hiring partner
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="candidates" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle>Sourced Candidates</CardTitle>
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
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Detailed list of candidates sourced by{" "}
                    {selectedPartner.name}
                  </p>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Stage</TableHead>
                        <TableHead>Applied Date</TableHead>
                        <TableHead>Days in Process</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {candidates
                        ?.filter(
                          (c) =>
                            c.hiring_partner_id ===
                              selectedPartner?.id.toString() ||
                            (c.candidate_source === "Hiring Partner" &&
                              c.hiring_partner_id ===
                                selectedPartner?.id.toString())
                        )
                        .slice(0, 10)
                        .map((candidate, index) => {
                          const job = jobs?.find(
                            (j) => j.id === candidate.job_id
                          );
                          let stage = "Unknown";
                          let status = "Pending";

                          if (candidate.stage_id === 1) stage = "Screening";
                          else if (
                            candidate.stage_id === 2 ||
                            candidate.stage_id === 3
                          )
                            stage = "Interview";
                          else if (candidate.stage_id === 4) stage = "Offered";
                          else if (candidate.stage_id === 6) {
                            stage = "Joined";
                            status = "Completed";
                          } else if (candidate.stage_id === 5) {
                            stage = "Rejected";
                            status = "Rejected";
                          }

                          return (
                            <TableRow key={index}>
                              <TableCell className="font-medium">
                                {candidate.name}
                              </TableCell>
                              <TableCell>
                                {job?.title || candidate.position || "Unknown"}
                              </TableCell>
                              <TableCell>{stage}</TableCell>
                              <TableCell>
                                {new Date(
                                  candidate.created_at || Date.now()
                                ).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                {candidate.created_at
                                  ? Math.ceil(
                                      Math.abs(
                                        new Date().getTime() -
                                          new Date(
                                            candidate.created_at
                                          ).getTime()
                                      ) /
                                        (1000 * 60 * 60 * 24)
                                    )
                                  : "N/A"}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    status === "Completed"
                                      ? "default"
                                      : status === "Rejected"
                                      ? "destructive"
                                      : "outline"
                                  }
                                >
                                  {status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      {(!candidates ||
                        candidates.filter(
                          (c) =>
                            c.hiring_partner_id ===
                            selectedPartner?.id.toString()
                        ).length === 0) && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4">
                            No candidates found for this hiring partner
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent> */}
          </Tabs>
        </div>
      )}
    </div>
  );
}
