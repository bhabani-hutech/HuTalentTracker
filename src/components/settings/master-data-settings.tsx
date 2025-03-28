import { useState, useEffect } from "react";
import { useOrganizations } from "@/lib/api/hooks/useOrganizations";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { JobStagesSettings } from "./job-stages-settings";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { OrganizationForm } from "./master-data/organization-form";
import { OrganizationsList } from "./master-data/organizations-list";
import { JobPositionsList } from "./master-data/job-positions-list";
import { PipelineStagesList } from "./master-data/pipeline-stages-list";
import { DomainSkillsList } from "./master-data/domain-skills-list";
import { TechnicalSkillsList } from "./master-data/technical-skills-list";
import { SoftSkillsList } from "./master-data/soft-skills-list";
import { InterviewRoundsList } from "./master-data/interview-rounds-list";
import { DepartmentsList } from "./master-data/departments-list";
import { PanelsList } from "./master-data/panels-list";
import { RecruiterForm } from "./master-data/recruiter-form";
import { DepartmentForm } from "./master-data/department-form";
import { PipelineStageForm } from "./master-data/pipeline-stages-form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";

export function MasterDataSettings() {
  const [activeForm, setActiveForm] = useState<{
    type:
      | "organization"
      | "panel"
      | "recruiter"
      | "department"
      | "pipeline"
      | null;
    data?: any;
  }>({ type: null });

  const { organizations } = useOrganizations();

  // Mock data - replace with actual data from your API
  const mockData = {
    organizations: [
      {
        id: 1,
        name: "Acme Corp",
        industry: "Technology",
        location: "New York",
      },
      { id: 2, name: "Beta Inc", industry: "Finance", location: "London" },
    ],
    panels: [
      { id: 1, name: "Technical Panel", members: 5 },
      { id: 2, name: "HR Panel", members: 3 },
    ],
    recruiters: [
      { id: 1, name: "John Doe", role: "HR", email: "john@example.com" },
      {
        id: 2,
        name: "Jane Smith",
        role: "Hiring Partner",
        email: "jane@example.com",
      },
    ],
    departments: [
      {
        id: 1,
        name: "Engineering",
        client: "Tech Corp",
        location: "San Francisco",
      },
      { id: 2, name: "Design", client: "Creative Inc", location: "London" },
    ],
    pipelineStages: [
      { id: 1, name: "Screening", description: "Initial screening", order: 1 },
      {
        id: 2,
        name: "Shortlisted",
        description: "Candidate shortlisted",
        order: 2,
      },
      {
        id: 3,
        name: "Interview in Progress",
        description: "Interviews ongoing",
        order: 3,
      },
      { id: 4, name: "Offered", description: "Offer extended", order: 4 },
      { id: 5, name: "Rejected", description: "Candidate rejected", order: 5 },
      { id: 6, name: "Joined", description: "Candidate joined", order: 6 },
    ],
  };

  return (
    <Tabs defaultValue="organization" className="w-full">
      <TabsList className="grid w-full grid-cols-6">
        <TabsTrigger value="organization">Organizations</TabsTrigger>
        <TabsTrigger value="job-positions">Job Positions</TabsTrigger>
        <TabsTrigger value="pipeline">Pipeline Stages</TabsTrigger>
        <TabsTrigger value="panels">Interview Panels</TabsTrigger>
        {/* <TabsTrigger value="recruiters">Hiring Partners</TabsTrigger> */}
        <TabsTrigger value="skills">Skills</TabsTrigger>
        <TabsTrigger value="interview-rounds">Interview Rounds</TabsTrigger>
        {/* <TabsTrigger value="departments">Departments</TabsTrigger> */}
      </TabsList>
      <TabsContent value="organization" className="space-y-4">
        <OrganizationsList />
      </TabsContent>
      <TabsContent value="job-positions" className="space-y-4">
        <JobPositionsList />
      </TabsContent>
      <TabsContent value="panels" className="space-y-4">
        <PanelsList />
      </TabsContent>
      {/* <TabsContent value="recruiters" className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Hiring Partners</CardTitle>
            <Button onClick={() => setActiveForm({ type: "recruiter" })}>
              <Plus className="h-4 w-4 mr-2" /> Add Hiring Partner
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organization</TableHead>
                  <TableHead>Resumes Sourced</TableHead>
                  <TableHead>Positions Filled</TableHead>
                  <TableHead>Success Rate</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {organizations
                  ?.filter((org) => !org.is_own_org)
                  .map((org) => (
                    <TableRow key={org.id}>
                      <TableCell>{org.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {Math.floor(Math.random() * 50)}
                        </Badge>
                      </TableCell>
                      <TableCell>{Math.floor(Math.random() * 10)}</TableCell>
                      <TableCell>{Math.floor(Math.random() * 100)}%</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          onClick={() =>
                            (window.location.href =
                              "/hiring-partners?id=" + org.id)
                          }
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent> */}
      <TabsContent value="pipeline">
        <PipelineStagesList />
      </TabsContent>
      <TabsContent value="stages">
        <JobStagesSettings />
      </TabsContent>
      <TabsContent value="skills">
        <Tabs defaultValue="domain" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="domain">Domain Skills</TabsTrigger>
            <TabsTrigger value="technical">Technical Skills</TabsTrigger>
            <TabsTrigger value="soft">Soft Skills</TabsTrigger>
          </TabsList>
          <TabsContent value="domain" className="mt-4">
            <DomainSkillsList />
          </TabsContent>
          <TabsContent value="technical" className="mt-4">
            <TechnicalSkillsList />
          </TabsContent>
          <TabsContent value="soft" className="mt-4">
            <SoftSkillsList />
          </TabsContent>
        </Tabs>
      </TabsContent>
      <TabsContent value="interview-rounds">
        <InterviewRoundsList />
      </TabsContent>
      {/* <TabsContent value="departments">
        <DepartmentsList />
      </TabsContent> */}
      <OrganizationForm
        isOpen={activeForm.type === "organization"}
        onClose={() => setActiveForm({ type: null })}
        onSubmit={(data) => {
          console.log("Organization data:", data);
          setActiveForm({ type: null });
        }}
        initialData={activeForm.data}
      />
      {/* Panel form is now handled in the PanelsList component */}
      <RecruiterForm
        isOpen={activeForm.type === "recruiter"}
        onClose={() => setActiveForm({ type: null })}
        onSubmit={(data) => {
          console.log("Recruiter data:", data);
          setActiveForm({ type: null });
        }}
        initialData={activeForm.data}
      />
      <DepartmentForm
        isOpen={activeForm.type === "department"}
        onClose={() => setActiveForm({ type: null })}
        onSubmit={(data) => {
          console.log("Department data:", data);
          setActiveForm({ type: null });
        }}
        initialData={activeForm.data}
      />
      <PipelineStageForm
        isOpen={activeForm.type === "pipeline"}
        onClose={() => setActiveForm({ type: null })}
        onSubmit={(data) => {
          console.log("Pipeline stage data:", data);
          setActiveForm({ type: null });
        }}
        initialData={activeForm.data}
      />
    </Tabs>
  );
}
