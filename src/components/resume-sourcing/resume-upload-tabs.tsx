import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Upload, FileUp, Link as LinkIcon } from "lucide-react";

export function ResumeUploadTabs() {
  return (
    <Tabs defaultValue="upload" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="upload">Upload CV</TabsTrigger>
        <TabsTrigger value="bulk">Bulk Upload</TabsTrigger>
        <TabsTrigger value="import">Import CV</TabsTrigger>
      </TabsList>

      <TabsContent value="upload">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center gap-4 p-4 border-2 border-dashed rounded-lg">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm font-medium">
                  Drag and drop your CV here
                </p>
                <p className="text-sm text-muted-foreground">
                  or click to browse
                </p>
              </div>
              <Input
                type="file"
                className="hidden"
                id="cv-upload"
                accept=".pdf,.doc,.docx"
              />
              <Button asChild>
                <label htmlFor="cv-upload" className="cursor-pointer">
                  <FileUp className="mr-2 h-4 w-4" />
                  Upload CV
                </label>
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="bulk">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center gap-4 p-4 border-2 border-dashed rounded-lg">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm font-medium">
                  Drag and drop multiple CVs here
                </p>
                <p className="text-sm text-muted-foreground">
                  or click to browse
                </p>
              </div>
              <Input
                type="file"
                className="hidden"
                id="bulk-upload"
                accept=".pdf,.doc,.docx"
                multiple
              />
              <Button asChild>
                <label htmlFor="bulk-upload" className="cursor-pointer">
                  <FileUp className="mr-2 h-4 w-4" />
                  Upload Files
                </label>
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="import">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label>Import from LinkedIn</Label>
              <div className="flex gap-2">
                <Input placeholder="Paste LinkedIn Profile URL" />
                <Button>
                  <LinkIcon className="mr-2 h-4 w-4" />
                  Import
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Import from Naukri</Label>
              <div className="flex gap-2">
                <Input placeholder="Paste Naukri Profile URL" />
                <Button>
                  <LinkIcon className="mr-2 h-4 w-4" />
                  Import
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
