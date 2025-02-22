import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { JobStagesSettings } from "./job-stages-settings";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { OrganizationForm } from "./master-data/organization-form";
import { OrganizationsList } from "./master-data/organizations-list";
import { JobPositionsList } from "./master-data/job-positions-list";
import { PipelineStagesList } from "./master-data/pipeline-stages-list";
import { SkillsList } from "./master-data/skills-list";
import { InterviewRoundsList } from "./master-data/interview-rounds-list";
import { PanelForm } from "./master-data/panel-form";
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
      <TabsList className="grid w-full grid-cols-7">
        <TabsTrigger value="organization">Organizations</TabsTrigger>
        <TabsTrigger value="job-positions">Job Positions</TabsTrigger>
        <TabsTrigger value="panels">Interview Panels</TabsTrigger>
        <TabsTrigger value="recruiters">Hiring Partners</TabsTrigger>
        <TabsTrigger value="pipeline">Pipeline Stages</TabsTrigger>
        <TabsTrigger value="skills">Skills</TabsTrigger>
        <TabsTrigger value="interview-rounds">Interview Rounds</TabsTrigger>
      </TabsList>

      <TabsContent value="organization" className="space-y-4">
        <OrganizationsList />
      </TabsContent>

      <TabsContent value="job-positions" className="space-y-4">
        <JobPositionsList />
      </TabsContent>

      <TabsContent value="panels" className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Interview Panels</CardTitle>
            <Button onClick={() => setActiveForm({ type: "panel" })}>
              <Plus className="h-4 w-4 mr-2" /> Add Panel
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Panel Name</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockData.panels.map((panel) => (
                  <TableRow key={panel.id}>
                    <TableCell>{panel.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{panel.members} members</Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        onClick={() =>
                          setActiveForm({ type: "panel", data: panel })
                        }
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="recruiters" className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>HR & Hiring Partners</CardTitle>
            <Button onClick={() => setActiveForm({ type: "recruiter" })}>
              <Plus className="h-4 w-4 mr-2" /> Add Recruiter
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockData.recruiters.map((recruiter) => (
                  <TableRow key={recruiter.id}>
                    <TableCell>{recruiter.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{recruiter.role}</Badge>
                    </TableCell>
                    <TableCell>{recruiter.email}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        onClick={() =>
                          setActiveForm({ type: "recruiter", data: recruiter })
                        }
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="departments" className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Departments & Clients</CardTitle>
            <Button onClick={() => setActiveForm({ type: "department" })}>
              <Plus className="h-4 w-4 mr-2" /> Add Department
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockData.departments.map((dept) => (
                  <TableRow key={dept.id}>
                    <TableCell>{dept.name}</TableCell>
                    <TableCell>{dept.client}</TableCell>
                    <TableCell>{dept.location}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        onClick={() =>
                          setActiveForm({ type: "department", data: dept })
                        }
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="pipeline">
        <PipelineStagesList />
      </TabsContent>

      <TabsContent value="stages">
        <JobStagesSettings />
      </TabsContent>

      <TabsContent value="skills">
        <SkillsList />
      </TabsContent>

      <TabsContent value="interview-rounds">
        <InterviewRoundsList />
      </TabsContent>

      <OrganizationForm
        isOpen={activeForm.type === "organization"}
        onClose={() => setActiveForm({ type: null })}
        onSubmit={(data) => {
          console.log("Organization data:", data);
          setActiveForm({ type: null });
        }}
        initialData={activeForm.data}
      />

      <PanelForm
        isOpen={activeForm.type === "panel"}
        onClose={() => setActiveForm({ type: null })}
        onSubmit={(data) => {
          console.log("Panel data:", data);
          setActiveForm({ type: null });
        }}
        initialData={activeForm.data}
      />

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
