import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Download, Mail, Phone, MapPin, Calendar } from "lucide-react";

interface ResumePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  resume: {
    id: string;
    name: string;
    position: string;
    source: string;
    date: string;
    matchScore: number;
    noticePeriod: string;
  } | null;
}

export function ResumePreview({ isOpen, onClose, resume }: ResumePreviewProps) {
  if (!resume) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>Resume Preview</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col md:flex-row gap-6 flex-1 overflow-hidden">
          <div className="w-full md:w-1/3 space-y-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">{resume.name}</h2>
              <p className="text-muted-foreground">{resume.position}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Bangalore, India</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>candidate@example.com</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Notice Period: {resume.noticePeriod}</span>
              </div>
            </div>
            <Button className="w-full">
              <Download className="mr-2 h-4 w-4" /> Download CV
            </Button>
          </div>
          <div className="flex-1 bg-muted rounded-lg p-4 overflow-y-auto">
            {/* Placeholder for CV content */}
            <div className="space-y-6">
              <section>
                <h3 className="text-lg font-semibold mb-2">Summary</h3>
                <p className="text-sm text-muted-foreground">
                  Experienced software developer with expertise in React,
                  TypeScript, and modern web technologies. Proven track record
                  of delivering high-quality applications and mentoring junior
                  developers.
                </p>
              </section>
              <section>
                <h3 className="text-lg font-semibold mb-2">Experience</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Senior Frontend Developer</h4>
                    <p className="text-sm text-muted-foreground">
                      Tech Corp • 2020 - Present
                    </p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground mt-2">
                      <li>Led development of customer-facing applications</li>
                      <li>
                        Implemented CI/CD pipelines reducing deployment time by
                        40%
                      </li>
                      <li>
                        Mentored junior developers and conducted code reviews
                      </li>
                    </ul>
                  </div>
                </div>
              </section>
              <section>
                <h3 className="text-lg font-semibold mb-2">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    "React",
                    "TypeScript",
                    "Node.js",
                    "AWS",
                    "Docker",
                    "Git",
                  ].map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-1 bg-background rounded text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
