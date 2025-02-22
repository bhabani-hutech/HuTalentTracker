import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, PenSquare } from "lucide-react";
import { JobPositionForm } from "./job-position-form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

interface JobPosition {
  id: number;
  title: string;
  department: string;
  status: string;
}

export function JobPositionsList() {
  const { toast } = useToast();
  const [positions, setPositions] = useState<JobPosition[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<JobPosition | null>(
    null,
  );
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadPositions = async () => {
    try {
      const { data, error } = await supabase
        .from("job_positions")
        .select("*")
        .order("title");

      if (error) throw error;
      setPositions(data || []);
    } catch (error) {
      console.error("Error loading positions:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load positions",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPositions();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this position?")) {
      try {
        const { error } = await supabase
          .from("job_positions")
          .delete()
          .eq("id", id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Position deleted successfully",
        });
        loadPositions();
      } catch (error) {
        console.error("Error deleting position:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete position",
        });
      }
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Job Positions</CardTitle>
          <Button
            onClick={() => {
              setSelectedPosition(null);
              setShowForm(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Position
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {positions.map((position) => (
                <TableRow key={position.id}>
                  <TableCell className="font-medium">
                    {position.title}
                  </TableCell>
                  <TableCell>{position.department}</TableCell>

                  <TableCell>
                    <Badge
                      variant={
                        position.status === "Active" ? "default" : "secondary"
                      }
                    >
                      {position.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedPosition(position);
                          setShowForm(true);
                        }}
                      >
                        <PenSquare className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(position.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <JobPositionForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setSelectedPosition(null);
        }}
        onSubmit={async (data) => {
          try {
            if (selectedPosition?.id) {
              await supabase
                .from("job_positions")
                .update(data)
                .eq("id", selectedPosition.id);
            } else {
              await supabase.from("job_positions").insert([data]);
            }
            loadPositions();
            setShowForm(false);
            setSelectedPosition(null);
            toast({
              title: "Success",
              description: `Position ${selectedPosition ? "updated" : "added"} successfully`,
            });
          } catch (error) {
            console.error("Error saving position:", error);
            toast({
              variant: "destructive",
              title: "Error",
              description: `Failed to ${selectedPosition ? "update" : "add"} position`,
            });
          }
        }}
        initialData={selectedPosition}
      />
    </Card>
  );
}
