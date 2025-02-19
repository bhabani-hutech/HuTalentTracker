import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { JobStagesSettings } from "./job-stages-settings";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export function MasterDataSettings() {
  return (
    <Tabs defaultValue="organization" className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="organization">Organization Setting</TabsTrigger>
        <TabsTrigger value="panels">Interview Panels</TabsTrigger>
        <TabsTrigger value="recruiters">HR & Hiring Partners</TabsTrigger>
        <TabsTrigger value="departments">Departments & Clients</TabsTrigger>
        <TabsTrigger value="stages">Interview Stages</TabsTrigger>
      </TabsList>

      <TabsContent value="organization" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Organization Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Organization Name</Label>
                <Input placeholder="Enter organization name" />
              </div>
              <div className="space-y-2">
                <Label>Industry</Label>
                <Input placeholder="Enter industry" />
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input placeholder="Enter address" />
              </div>
              <div className="space-y-2">
                <Label>Website</Label>
                <Input placeholder="Enter website URL" />
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="panels" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Interview Panel Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>Panel Name</Label>
                <Input placeholder="Enter panel name" />
              </div>
              <div className="space-y-2">
                <Label>Panel Members</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select members" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member1">
                      John Doe (Technical)
                    </SelectItem>
                    <SelectItem value="member2">Jane Smith (HR)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button>Add Panel</Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="recruiters" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>HR & Hiring Partners</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input placeholder="Enter name" />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hr">HR Recruiter</SelectItem>
                    <SelectItem value="partner">Hiring Partner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" placeholder="Enter email" />
              </div>
              <Button>Add Member</Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="departments" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Departments & Clients</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>Department Name</Label>
                <Input placeholder="Enter department name" />
              </div>
              <div className="space-y-2">
                <Label>Client Name</Label>
                <Input placeholder="Enter client name" />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input placeholder="Enter location" />
              </div>
              <Button>Add Department/Client</Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="stages">
        <JobStagesSettings />
      </TabsContent>
    </Tabs>
  );
}
