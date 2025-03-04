import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Trash2, Edit } from "lucide-react";
import { useComments } from "@/lib/api/hooks/useComments";

interface Comment {
  id: string;
  item_id: string;
  comment: string;
  created_at: string;
  updated_at: string;
}

interface CommentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string;
  itemType: "interview" | "candidate";
  itemName: string;
}

export function CommentDialog({
  isOpen,
  onClose,
  itemId,
  itemType,
  itemName,
}: CommentDialogProps) {
  const [newComment, setNewComment] = useState("");
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const { toast } = useToast();
  const { comments, isLoading, createComment, updateComment, deleteComment } =
    useComments(itemId);

  const addComment = () => {
    if (!newComment.trim()) return;

    createComment(
      {
        item_id: itemId,
        item_type: itemType,
        comment: newComment.trim(),
      },
      {
        onSuccess: () => {
          setNewComment("");
          toast({
            title: "Success",
            description: "Comment added successfully",
          });
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to add comment",
          });
        },
      },
    );
  };

  const handleUpdateComment = () => {
    if (!editingComment || !editingComment.comment.trim()) return;

    updateComment(
      {
        id: editingComment.id as string,
        updates: { comment: editingComment.comment },
      },
      {
        onSuccess: () => {
          setEditingComment(null);
          toast({
            title: "Success",
            description: "Comment updated successfully",
          });
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to update comment",
          });
        },
      },
    );
  };

  const handleDeleteComment = (id: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    deleteComment(id, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Comment deleted successfully",
        });
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete comment",
        });
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Comments for {itemName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-comment">Add a comment</Label>
            <Textarea
              id="new-comment"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Type your comment here..."
              className="min-h-[80px]"
            />
            <Button onClick={addComment} disabled={!newComment.trim()}>
              Add Comment
            </Button>
          </div>

          <div className="space-y-4 mt-6">
            <h3 className="text-sm font-medium">Previous Comments</h3>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">
                Loading comments...
              </p>
            ) : comments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No comments yet</p>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-3 border rounded-md bg-gray-50"
                  >
                    {editingComment?.id === comment.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editingComment.comment}
                          onChange={(e) =>
                            setEditingComment({
                              ...editingComment,
                              comment: e.target.value,
                            })
                          }
                          className="min-h-[80px]"
                        />
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingComment(null)}
                          >
                            Cancel
                          </Button>
                          <Button size="sm" onClick={handleUpdateComment}>
                            Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <p className="text-sm whitespace-pre-wrap">
                              {comment.comment}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(comment.created_at).toLocaleString()}
                              {comment.updated_at !== comment.created_at &&
                                " (edited)"}
                            </p>
                          </div>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingComment(comment)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                handleDeleteComment(comment.id as string)
                              }
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
