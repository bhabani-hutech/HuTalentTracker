import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Card, CardContent } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { FileSignature, Download, Upload } from "lucide-react";

interface OnboardingProgressProps {
  isOpen: boolean;
  onClose: () => void;
  employee: {
    id: string;
    name: string;
    position: string;
    department: string;
    start_date: string;
    status: string;
    progress: number;
  } | null;
}

export function OnboardingProgress({
  isOpen,
  onClose,
  employee,
}: OnboardingProgressProps) {
  if (!employee) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Onboarding Progress - {employee.name}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="documents" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="access">System Access</TabsTrigger>
            <TabsTrigger value="welcome">Welcome Kit</TabsTrigger>
          </TabsList>

          <TabsContent value="documents" className="space-y-4">
            <div className="grid gap-4">
              {[
                "Offer Letter",
                "NDA Agreement",
                "Employment Contract",
                "Bank Details Form",
                "ID Proof",
                "Address Proof",
              ].map((doc, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-medium">{doc}</p>
                        <p className="text-sm text-muted-foreground">
                          PDF or DOC format
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Upload className="h-4 w-4 mr-2" /> Upload
                        </Button>
                        <Button variant="outline" size="sm">
                          <FileSignature className="h-4 w-4 mr-2" /> Sign
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" /> Download
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="access" className="space-y-4">
            <div className="grid gap-4">
              {[
                "Email Account",
                "Slack Access",
                "Project Management Tool",
                "Code Repository",
                "VPN Access",
                "Time Tracking System",
              ].map((system, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-medium">{system}</p>
                        <p className="text-sm text-muted-foreground">
                          System credentials
                        </p>
                      </div>
                      <Badge variant="outline">Pending</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="welcome" className="space-y-4">
            <div className="grid gap-4">
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div className="space-y-2">
                    <Label>T-Shirt Size</Label>
                    <Input placeholder="Select size" />
                  </div>
                  <div className="space-y-2">
                    <Label>Preferred Name Tag</Label>
                    <Input placeholder="Enter name for tag" />
                  </div>
                  <div className="space-y-2">
                    <Label>Additional Notes</Label>
                    <Input placeholder="Any special requirements" />
                  </div>
                  <Button className="w-full">
                    Submit Welcome Kit Preferences
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
