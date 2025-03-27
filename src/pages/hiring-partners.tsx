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

export default function HiringPartners() {
  const [searchParams] = useSearchParams();
  const partnerId = searchParams.get("id");
  const { organizations } = useOrganizations();
  const { data: candidates } = useCandidates();
  const { jobs } = useJobs();
  const [selectedPartner, setSelectedPartner] = useState<any>(null);
  const [partnerStats, setPartnerStats] = useState<any>(null);

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

  // Calculate statistics for the selected partner
  useEffect(() => {
    if (!selectedPartner || !candidates || !jobs) return;

    // Filter candidates sourced by this partner
    const partnerCandidates = candidates.filter(
      (c) =>
        c.hiring_partner_id === selectedPartner.id.toString() ||
        c.candidate_source === "Hiring Partner",
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
    return <div className="container py-8">Loading hiring partners...</div>;
  }

  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Hiring Partners</h1>
        <p className="text-muted-foreground">
          Manage and track performance of hiring partners
        </p>
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
            <Button variant="outline">Export Report</Button>
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
              <Card>
                <CardHeader>
                  <CardTitle>Candidate Pipeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <PipelineChart data={partnerStats.stageData} />
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
                  {/* Candidate list would go here */}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
