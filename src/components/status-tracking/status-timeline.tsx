import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { supabase } from "@/lib/supabase";

interface StatusTimelineProps {
  selectedCandidate: any;
}

interface TimelineEvent {
  date: string;
  status: string;
  description: string;
}

export function StatusTimeline({ selectedCandidate }: StatusTimelineProps) {
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCandidateTimeline = async () => {
      if (!selectedCandidate) {
        setTimelineEvents([]);
        return;
      }

      setIsLoading(true);
      try {
        // Fetch interviews for this candidate
        const { data: interviews } = await supabase
          .from("interviews")
          .select("id, date, type, status, feedback(id, recommendation)")
          .eq("candidate_id", selectedCandidate.id)
          .order("date", { ascending: true });

        // Fetch stage changes
        const { data: stageChanges } = await supabase
          .from("pipeline_comments")
          .select("*")
          .eq("item_id", selectedCandidate.id)
          .eq("item_type", "candidate")
          .order("created_at", { ascending: true });

        // Create timeline events
        const events: TimelineEvent[] = [
          // Initial application
          {
            date: selectedCandidate.created_at,
            status: "Application Received",
            description: `Applied for ${selectedCandidate.jobs?.title || "position"} via ${selectedCandidate.source || "direct application"}`,
          },
        ];

        // Add stage changes to timeline
        if (stageChanges?.length) {
          stageChanges.forEach((change) => {
            events.push({
              date: change.created_at,
              status: "Stage Change",
              description: change.comment,
            });
          });
        }

        // Add interviews to timeline
        if (interviews?.length) {
          for (const interview of interviews) {
            // Add interview scheduled event
            events.push({
              date: interview.date,
              status: `${interview.type} Interview`,
              description: "Interview scheduled",
            });

            // If there's feedback, add it as a separate event
            if (interview.feedback && interview.feedback.length > 0) {
              for (const feedback of interview.feedback) {
                events.push({
                  date: interview.date, // Using same date but it will appear after the interview
                  status: "Interview Feedback",
                  description: `Outcome: ${feedback.recommendation || "No recommendation provided"}`,
                });
              }
            }
          }
        }

        // Sort by date
        events.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        );
        setTimelineEvents(events);
      } catch (error) {
        console.error("Error fetching candidate timeline:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCandidateTimeline();
  }, [selectedCandidate]);

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>
          {selectedCandidate
            ? `${selectedCandidate.name}'s Timeline`
            : "Candidate Timeline"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!selectedCandidate ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            Select a candidate to view their timeline
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            Loading timeline...
          </div>
        ) : timelineEvents.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No timeline events available
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
            <div className="space-y-8">
              {timelineEvents.map((event, index) => (
                <div key={index} className="relative pl-10">
                  <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm">
                    {index + 1}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{event.status}</h4>
                      <Badge variant="outline">
                        {new Date(event.date).toLocaleDateString()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {event.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
