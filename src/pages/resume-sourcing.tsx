import { ResumeList } from "../components/resume-sourcing/resume-list";
import { ResumeUploadTabs } from "../components/resume-sourcing/resume-upload-tabs";

export default function ResumeSourcing() {
  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Resume Sourcing</h1>
        <p className="text-muted-foreground">
          Manage and review candidate resumes
        </p>
      </div>
      <ResumeUploadTabs />
      <ResumeList />
    </div>
  );
}
