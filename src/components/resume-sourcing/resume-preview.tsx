import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Download, Mail, Phone, MapPin, Calendar } from "lucide-react";
import { Resume } from "@/lib/api/resumes";

function getScoreColor(score: number): string {
  if (score >= 90) return "bg-green-500 hover:bg-green-600 text-white";
  if (score >= 80) return "bg-blue-500 hover:bg-blue-600 text-white";
  if (score >= 70) return "bg-yellow-500 hover:bg-yellow-600 text-white";
  return "bg-red-500 hover:bg-red-600 text-white";
}

interface ResumePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  resume: Resume | null;
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
              {resume.email && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{resume.email}</span>
                </div>
              )}
              {resume.phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{resume.phone}</span>
                </div>
              )}
            </div>
            <Button
              className="w-full"
              onClick={() => window.open(resume.file_url, "_blank")}
            >
              <Download className="mr-2 h-4 w-4" /> Download CV
            </Button>
          </div>
          <div className="flex-1 bg-muted rounded-lg p-4 overflow-y-auto">
            <div className="space-y-6">
              {resume.parsed_data?.summary && (
                <section>
                  <h3 className="text-lg font-semibold mb-2">
                    Professional Summary
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {resume.parsed_data.summary}
                  </p>
                </section>
              )}
              {/* Match Score Section */}
              <section className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Match Score</h3>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getScoreColor(resume.match_score || 0)}`}
                      style={{ width: `${resume.match_score || 0}%` }}
                    />
                  </div>
                  <span className="font-semibold">
                    {resume.match_score || 0}%
                  </span>
                </div>
              </section>

              {resume.parsed_data && (
                <>
                  {resume.parsed_data.skills &&
                    resume.parsed_data.skills.length > 0 && (
                      <section>
                        <h3 className="text-lg font-semibold mb-2">Skills</h3>
                        <div className="flex flex-wrap gap-2">
                          {resume.parsed_data.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-background rounded text-sm"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </section>
                    )}

                  {resume.parsed_data.experience &&
                    resume.parsed_data.experience.length > 0 && (
                      <section>
                        <h3 className="text-lg font-semibold mb-2">
                          Experience
                        </h3>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
                          {resume.parsed_data.experience.map((exp, index) => (
                            <li key={index}>{exp}</li>
                          ))}
                        </ul>
                      </section>
                    )}

                  {resume.parsed_data.education &&
                    resume.parsed_data.education.length > 0 && (
                      <section>
                        <h3 className="text-lg font-semibold mb-2">
                          Education
                        </h3>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
                          {resume.parsed_data.education.map((edu, index) => (
                            <li key={index}>{edu}</li>
                          ))}
                        </ul>
                      </section>
                    )}

                  {resume.parsed_data.certifications &&
                    resume.parsed_data.certifications.length > 0 && (
                      <section>
                        <h3 className="text-lg font-semibold mb-2">
                          Certifications
                        </h3>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
                          {resume.parsed_data.certifications.map(
                            (cert, index) => (
                              <li key={index}>{cert}</li>
                            ),
                          )}
                        </ul>
                      </section>
                    )}

                  {resume.parsed_data.languages &&
                    resume.parsed_data.languages.length > 0 && (
                      <section>
                        <h3 className="text-lg font-semibold mb-2">
                          Languages
                        </h3>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
                          {resume.parsed_data.languages.map((lang, index) => (
                            <li key={index}>{lang}</li>
                          ))}
                        </ul>
                      </section>
                    )}
                </>
              )}
              {(!resume.parsed_data ||
                (!resume.parsed_data.skills?.length &&
                  !resume.parsed_data.experience?.length &&
                  !resume.parsed_data.education?.length)) && (
                <div className="text-center text-muted-foreground py-8">
                  No parsed data available
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
