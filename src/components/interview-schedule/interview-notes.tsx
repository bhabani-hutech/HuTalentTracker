import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { ScrollArea } from "../ui/scroll-area";
import { format } from "date-fns";

interface Note {
  id: string;
  text: string;
  timestamp: Date;
  author: string;
}

interface InterviewNotesProps {
  isOpen: boolean;
  onClose: () => void;
  interviewId: string;
  candidateName: string;
}

export function InterviewNotes({
  isOpen,
  onClose,
  interviewId,
  candidateName,
}: InterviewNotesProps) {
  const [newNote, setNewNote] = useState("");
  const [notes, setNotes] = useState<Note[]>([
    {
      id: "1",
      text: "Candidate has strong React experience",
      timestamp: new Date(2024, 3, 20, 10, 30),
      author: "Alex Johnson",
    },
    {
      id: "2",
      text: "Good problem-solving skills demonstrated",
      timestamp: new Date(2024, 3, 20, 11, 15),
      author: "Emma Davis",
    },
  ]);

  const addNote = () => {
    if (!newNote.trim()) return;

    const note: Note = {
      id: Date.now().toString(),
      text: newNote,
      timestamp: new Date(),
      author: "Current User", // Replace with actual user name
    };

    setNotes([...notes, note]);
    setNewNote("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Interview Notes - {candidateName}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-[300px] flex flex-col gap-4">
          <ScrollArea className="flex-1 border rounded-md p-4">
            <div className="space-y-4">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="p-3 bg-muted rounded-lg space-y-2"
                >
                  <div className="text-sm">{note.text}</div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{note.author}</span>
                    <span>{format(note.timestamp, "MMM d, yyyy h:mm a")}</span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="space-y-2">
            <Textarea
              placeholder="Add a note..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="min-h-[100px]"
            />
            <Button onClick={addNote} className="w-full">
              Add Note
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
