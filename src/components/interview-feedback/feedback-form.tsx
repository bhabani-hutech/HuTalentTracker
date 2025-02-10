import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface FeedbackQuestion {
  id: string;
  question: string;
  type: "rating" | "text" | "select";
  options?: string[];
}

const defaultQuestions: FeedbackQuestion[] = [
  {
    id: "technical",
    question: "Technical Skills Assessment",
    type: "rating",
  },
  {
    id: "communication",
    question: "Communication Skills",
    type: "rating",
  },
  {
    id: "problem_solving",
    question: "Problem Solving Ability",
    type: "rating",
  },
  {
    id: "experience",
    question: "Relevant Experience",
    type: "rating",
  },
  {
    id: "culture_fit",
    question: "Cultural Fit",
    type: "rating",
  },
  {
    id: "strengths",
    question: "Key Strengths",
    type: "text",
  },
  {
    id: "improvements",
    question: "Areas for Improvement",
    type: "text",
  },
  {
    id: "recommendation",
    question: "Hiring Recommendation",
    type: "select",
    options: ["Strong Hire", "Hire", "Maybe", "No Hire", "Strong No Hire"],
  },
];

interface InterviewFeedbackFormProps {
  candidate?: {
    name: string;
    position: string;
  };
}

export function InterviewFeedbackForm({
  candidate,
}: InterviewFeedbackFormProps) {
  const [customQuestion, setCustomQuestion] = useState("");
  const [questions, setQuestions] = useState(defaultQuestions);

  const addCustomQuestion = () => {
    if (!customQuestion.trim()) return;

    setQuestions([
      ...questions,
      {
        id: `custom_${Date.now()}`,
        question: customQuestion,
        type: "text",
      },
    ]);
    setCustomQuestion("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Interview Feedback Form</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Candidate Information */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Candidate Name</Label>
            <Input
              placeholder="Enter candidate name"
              value={candidate?.name || ""}
              readOnly={!!candidate}
            />
          </div>
          <div className="space-y-2">
            <Label>Position</Label>
            <Input
              placeholder="Enter position"
              value={candidate?.position || ""}
              readOnly={!!candidate}
            />
          </div>
          <div className="space-y-2">
            <Label>Interview Round</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select interview round" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="technical_1">Technical Round 1</SelectItem>
                <SelectItem value="technical_2">Technical Round 2</SelectItem>
                <SelectItem value="hr">HR Round</SelectItem>
                <SelectItem value="manager">Manager Round</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Interviewer</Label>
            <Input placeholder="Enter interviewer name" />
          </div>
        </div>

        {/* Standard Questions */}
        <div className="space-y-6">
          {questions.map((q) => (
            <div key={q.id} className="space-y-2">
              <Label>{q.question}</Label>
              {q.type === "rating" && (
                <div className="flex gap-4">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Button
                      key={rating}
                      variant="outline"
                      className="h-10 w-10"
                      onClick={() => {}}
                    >
                      {rating}
                    </Button>
                  ))}
                </div>
              )}
              {q.type === "text" && (
                <Textarea
                  placeholder={`Enter your feedback for ${q.question.toLowerCase()}`}
                />
              )}
              {q.type === "select" && q.options && (
                <Select>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={`Select ${q.question.toLowerCase()}`}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {q.options.map((option) => (
                      <SelectItem key={option} value={option.toLowerCase()}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          ))}
        </div>

        {/* Custom Questions */}
        <div className="space-y-2">
          <Label>Add Custom Question</Label>
          <div className="flex gap-2">
            <Input
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              placeholder="Enter your custom question"
            />
            <Button onClick={addCustomQuestion}>Add</Button>
          </div>
        </div>

        {/* Submit Button */}
        <Button className="w-full" size="lg">
          Submit Feedback
        </Button>
      </CardContent>
    </Card>
  );
}
