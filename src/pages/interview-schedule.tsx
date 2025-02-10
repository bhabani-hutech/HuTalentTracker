import { InterviewInsights } from "../components/interview-schedule/interview-insights";
import { InterviewList } from "../components/interview-schedule/interview-list";

export default function InterviewSchedule() {
  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Interview Schedule
        </h1>
        <p className="text-muted-foreground">
          Track and manage upcoming interviews
        </p>
      </div>
      <InterviewInsights />
      <InterviewList />
    </div>
  );
}
