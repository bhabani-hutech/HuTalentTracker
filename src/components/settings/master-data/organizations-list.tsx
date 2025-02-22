import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, PenSquare } from "lucide-react";
import { OrganizationForm } from "./organization-form";
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

interface Organization {
  id: string;
  name: string;
  industry?: string;
  description?: string;
  website?: string;
  email_domain?: string;
  logo_url?: string;
}

export function OrganizationsList() {
  const { toast } = useToast();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load organizations
  const loadOrganizations = async () => {
    try {
      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .order("name");

      if (error) throw error;
      setOrganizations(data || []);
    } catch (error) {
      console.error("Error loading organizations:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load organizations",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrganizations();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this organization?")) {
      try {
        const { error } = await supabase
          .from("organizations")
          .delete()
          .eq("id", id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Organization deleted successfully",
        });
        loadOrganizations();
      } catch (error) {
        console.error("Error deleting organization:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete organization",
        });
      }
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Organizations</CardTitle>
          <Button
            onClick={() => {
              setSelectedOrg(null);
              setShowForm(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Organization
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead className="hidden md:table-cell">Website</TableHead>
                <TableHead className="hidden lg:table-cell">
                  Email Domain
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {organizations.map((org) => (
                <TableRow key={org.id}>
                  <TableCell className="font-medium">{org.name}</TableCell>
                  <TableCell>{org.industry || "-"}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {org.website || "-"}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {org.email_domain || "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedOrg(org);
                          setShowForm(true);
                        }}
                      >
                        <PenSquare className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(org.id)}
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

      <OrganizationForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setSelectedOrg(null);
        }}
        onSubmit={async (data) => {
          try {
            if (selectedOrg?.id) {
              await supabase
                .from("organizations")
                .update(data)
                .eq("id", selectedOrg.id);
            } else {
              await supabase.from("organizations").insert([data]);
            }
            loadOrganizations();
            setShowForm(false);
            setSelectedOrg(null);
            toast({
              title: "Success",
              description: `Organization ${selectedOrg ? "updated" : "added"} successfully`,
            });
          } catch (error) {
            console.error("Error saving organization:", error);
            toast({
              variant: "destructive",
              title: "Error",
              description: `Failed to ${selectedOrg ? "update" : "add"} organization`,
            });
          }
        }}
        initialData={selectedOrg}
      />
    </Card>
  );
}
