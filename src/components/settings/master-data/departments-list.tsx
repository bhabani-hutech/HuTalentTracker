import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, PenSquare } from "lucide-react";
import { DepartmentForm } from "./department-form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

interface Department {
  id: number;
  name: string;
  description: string;
}

export function DepartmentsList() {
  const { toast } = useToast();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] =
    useState<Department | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from("departments")
        .select("*")
        .order("name");

      if (error) throw error;
      setDepartments(data || []);
    } catch (error) {
      console.error("Error loading departments:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load departments",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this department?")) {
      try {
        const { error } = await supabase
          .from("departments")
          .delete()
          .eq("id", id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Department deleted successfully",
        });
        loadDepartments();
      } catch (error) {
        console.error("Error deleting department:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete department",
        });
      }
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Departments</CardTitle>
          <Button
            onClick={() => {
              setSelectedDepartment(null);
              setShowForm(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Department
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments.map((department) => (
                <TableRow key={department.id}>
                  <TableCell className="font-medium">
                    {department.name}
                  </TableCell>
                  <TableCell>{department.description || "-"}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedDepartment(department);
                          setShowForm(true);
                        }}
                      >
                        <PenSquare className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(department.id)}
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

      <DepartmentForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setSelectedDepartment(null);
        }}
        onSubmit={async (data) => {
          try {
            if (selectedDepartment?.id) {
              await supabase
                .from("departments")
                .update(data)
                .eq("id", selectedDepartment.id);
            } else {
              await supabase.from("departments").insert([data]);
            }
            loadDepartments();
            setShowForm(false);
            setSelectedDepartment(null);
            toast({
              title: "Success",
              description: `Department ${selectedDepartment ? "updated" : "added"} successfully`,
            });
          } catch (error) {
            console.error("Error saving department:", error);
            toast({
              variant: "destructive",
              title: "Error",
              description: `Failed to ${selectedDepartment ? "update" : "add"} department`,
            });
          }
        }}
        initialData={selectedDepartment}
      />
    </Card>
  );
}
