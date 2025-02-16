import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { format } from "date-fns";
import { useInterviews } from "@/lib/api/hooks/useInterviews";
import { useFeedback } from "@/lib/api/hooks/useFeedback";

interface TimelineEvent {
  candidate: string;
  status: string;
  date: string;
  time: string;
  type: "success" | "error" | "warning" | "info";
}

export function StatusTimeline() {
  const { interviews } = useInterviews();
  const { feedback } = useFeedback();

  // Combine interviews and feedback into timeline events
  const timelineEvents: TimelineEvent[] = [
    // Add interview events
    ...(interviews?.map((interview) => ({
      candidate: interview.candidate?.name || "Unknown",
      status: getStatusText(interview.status, interview.type),
      date: format(new Date(interview.date), "MMM d, yyyy"),
      time: format(new Date(interview.date), "h:mm a"),
      type: getEventType(interview.status),
    })) || []),
    // Add feedback events
    ...(feedback?.map((f) => ({
      candidate: f.candidate?.name || "Unknown",
      status: `Feedback: ${f.recommendation}`,
      date: format(new Date(f.created_at || ""), "MMM d, yyyy"),
      time: format(new Date(f.created_at || ""), "h:mm a"),
      type: getFeedbackEventType(f.recommendation),
    })) || []),
  ].sort(
    (a, b) =>
      new Date(b.date + " " + b.time).getTime() -
      new Date(a.date + " " + a.time).getTime(),
  );

  function getStatusText(status: string, type: string): string {
    if (status?.includes("Rejected")) return `Rejected in ${type} Round`;
    if (status === "Cleared") return `Cleared ${type} Round`;
    if (status === "HR round") return "Scheduled for HR Round";
    return status || "Status Unknown";
  }

  function getEventType(status: string): TimelineEvent["type"] {
    if (status?.includes("Rejected")) return "error";
    if (status === "Cleared") return "success";
    if (status === "HR round") return "info";
    return "warning";
  }

  function getFeedbackEventType(recommendation: string): TimelineEvent["type"] {
    switch (recommendation) {
      case "Strong Hire":
      case "Hire":
        return "success";
      case "Maybe":
        return "warning";
      case "No Hire":
      case "Strong No Hire":
        return "error";
      default:
        return "info";
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {timelineEvents.map((event, i) => (
            <div key={i} className="flex gap-4">
              <div className="relative flex items-center justify-center">
                <div
                  className={`w-2 h-2 rounded-full ${getStatusColor(event.type)}`}
                />
                {i !== timelineEvents.length - 1 && (
                  <div className="absolute top-4 w-px h-[calc(100%+1rem)] bg-border" />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{event.candidate}</p>
                    <p className="text-sm text-muted-foreground">
                      {event.status}
                    </p>
                  </div>
                  <Badge variant="outline" className="whitespace-nowrap">
                    {event.date} at {event.time}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function getStatusColor(type: TimelineEvent["type"]): string {
  switch (type) {
    case "success":
      return "bg-green-500";
    case "error":
      return "bg-red-500";
    case "warning":
      return "bg-yellow-500";
    case "info":
      return "bg-blue-500";
    default:
      return "bg-gray-500";
  }
}
