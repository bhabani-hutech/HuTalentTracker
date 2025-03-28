import { useState, useEffect } from "react";
import { useOrganizations } from "@/lib/api/hooks/useOrganizations";
import { useCandidates } from "@/lib/api/hooks/useCandidates";
import { useJobs } from "@/lib/api/hooks/useJobs";
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
import { Download, RefreshCw } from "lucide-react";

export default function HiringPartners() {
  const [searchParams] = useSearchParams();
  const partnerId = searchParams.get("id");
  const { organizations, queryClient } = useOrganizations();
  const { data: candidates } = useCandidates();
  const { jobs } = useJobs();
  const [selectedPartner, setSelectedPartner] = useState<any>(null);
  const [partnerStats, setPartnerStats] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter to only hiring partners (non-own organizations)
  const hiringPartners = organizations?.filter((org) => !org.is_own_org) || [];

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
    // Simulate a refresh by waiting 1 second
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      setIsRefreshing(false);
    }, 1000);
  };

  // Calculate statistics for the selected partner
  useEffect(() => {
    if (!selectedPartner || !candidates || !jobs) return;

    // Filter candidates sourced by this partner
    const partnerCandidates = candidates.filter(
      (c) => c.hiring_partner_id === selectedPartner.id.toString(),
    );

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

    // Calculate overall stats
    const totalCandidates = partnerCandidates.length;
    const totalJoined = partnerCandidates.filter(
      (c) => c.stage_id === 6,
    ).length;
    const successRate =
      totalCandidates > 0
        ? Math.round((totalJoined / totalCandidates) * 100)
        : 0;

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
        count: partnerCandidates.filter((c) => c.stage_id === 6).length,
      },
      {
        stage: "Rejected",
        count: partnerCandidates.filter((c) => c.stage_id === 5).length,
      },
    ];

    setPartnerStats({
      totalCandidates,
      totalJoined,
      successRate,
      jobStats: Object.values(jobStats),
      stageData,
    });
  }, [selectedPartner, candidates, jobs]);

  if (!organizations || organizations.length === 0) {
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

      <div className="grid grid-cols-4 gap-4">
        {hiringPartners.map((partner) => (
          <Card
            key={partner.id}
            className={`cursor-pointer ${selectedPartner?.id === partner.id ? "border-primary" : ""}`}
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

          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Candidates Sourced
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {partnerStats.totalCandidates}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Candidates Joined
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {partnerStats.totalJoined}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Success Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {partnerStats.successRate}%
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="positions">Positions</TabsTrigger>
              <TabsTrigger value="candidates">Candidates</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Candidate Pipeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PipelineChart data={partnerStats.stageData} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={[
                          { month: "Jan", candidates: 12, joined: 3 },
                          { month: "Feb", candidates: 19, joined: 5 },
                          { month: "Mar", candidates: 15, joined: 4 },
                          { month: "Apr", candidates: 25, joined: 8 },
                          { month: "May", candidates: 30, joined: 10 },
                          {
                            month: "Jun",
                            candidates: partnerStats.totalCandidates,
                            joined: partnerStats.totalJoined,
                          },
                        ]}
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
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Efficiency Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
                      <h3 className="text-lg font-medium text-muted-foreground">
                        Avg. Time to Hire
                      </h3>
                      <p className="text-3xl font-bold mt-2">14 days</p>
                    </div>
                    <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
                      <h3 className="text-lg font-medium text-muted-foreground">
                        Conversion Rate
                      </h3>
                      <p className="text-3xl font-bold mt-2">
                        {partnerStats.successRate}%
                      </p>
                    </div>
                    <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
                      <h3 className="text-lg font-medium text-muted-foreground">
                        Cost per Hire
                      </h3>
                      <p className="text-3xl font-bold mt-2">$1,200</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="positions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Positions Sourced</CardTitle>
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
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="candidates" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Sourced Candidates</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Detailed list of candidates sourced by this hiring partner
                  </p>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Stage</TableHead>
                        <TableHead>Applied Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {candidates
                        ?.filter(
                          (c) =>
                            c.hiring_partner_id ===
                            selectedPartner?.id.toString(),
                        )
                        .slice(0, 5)
                        .map((candidate, index) => {
                          const job = jobs?.find(
                            (j) => j.id === candidate.job_id,
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
                                  candidate.created_at || Date.now(),
                                ).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    status === "Completed"
                                      ? "success"
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
                            selectedPartner?.id.toString(),
                        ).length === 0) && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-4">
                            No candidates found for this hiring partner
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
