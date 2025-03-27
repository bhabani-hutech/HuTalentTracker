import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, PenSquare, Building2 } from "lucide-react";
import { OrganizationForm } from "./organization-form";
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

interface Organization {
  id: number;
  name: string;
  industry: string;
  description: string;
  website: string;
  email_domain: string;
  logo_url: string;
  is_own_org: boolean;
  locations: any[];
  departments: any[];
}

export function OrganizationsList() {
  const { toast } = useToast();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrganization, setSelectedOrganization] =
    useState<Organization | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadOrganizations = async () => {
    try {
      setIsLoading(true);
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

  const handleDelete = async (id: number) => {
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

  const handleOwnOrgToggle = async (org: Organization) => {
    try {
      // If setting to own org, first reset any existing own org
      if (!org.is_own_org) {
        // Find current own org if any
        const currentOwnOrg = organizations.find((o) => o.is_own_org);

        if (currentOwnOrg) {
          // Reset current own org
          await supabase
            .from("organizations")
            .update({ is_own_org: false })
            .eq("id", currentOwnOrg.id);
        }

        // Set new own org
        await supabase
          .from("organizations")
          .update({ is_own_org: true })
          .eq("id", org.id);

        toast({
          title: "Success",
          description: `${org.name} is now set as your own organization`,
        });

        // Show additional message about departments and locations
        toast({
          title: "Organization Changed",
          description: `Departments and locations from ${org.name} will now be available throughout the application.`,
        });
      } else {
        // Cannot unset the only own org
        toast({
          variant: "destructive",
          title: "Error",
          description:
            "You must have one organization set as your own. Create another organization first before changing this setting.",
        });
        return;
      }

      loadOrganizations();
    } catch (error) {
      console.error("Error updating organization type:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update organization type",
      });
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
              setSelectedOrganization(null);
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
                <TableHead>Type</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Website</TableHead>
                <TableHead>Locations</TableHead>
                <TableHead>Departments</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {organizations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No organizations found. Add your first one!
                  </TableCell>
                </TableRow>
              ) : (
                organizations.map((org) => (
                  <TableRow key={org.id}>
                    <TableCell className="font-medium">{org.name}</TableCell>
                    <TableCell>
                      <Badge
                        variant={org.is_own_org ? "default" : "outline"}
                        className={
                          org.is_own_org
                            ? "bg-green-500 hover:bg-green-600"
                            : "bg-blue-500 hover:bg-blue-600"
                        }
                      >
                        {org.is_own_org ? "Own Organization" : "Hiring Partner"}
                      </Badge>
                    </TableCell>
                    <TableCell>{org.industry || "-"}</TableCell>
                    <TableCell>
                      {org.website ? (
                        <a
                          href={org.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          {org.website.replace(/^https?:\/\//, "")}
                        </a>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {org.locations?.length ? (
                        <Badge variant="outline">
                          {org.locations.length} location
                          {org.locations.length !== 1 ? "s" : ""}
                        </Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {org.departments?.length ? (
                        <Badge variant="outline">
                          {org.departments.length} department
                          {org.departments.length !== 1 ? "s" : ""}
                        </Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        {!org.is_own_org && (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Set as Own Organization"
                            onClick={() => handleOwnOrgToggle(org)}
                          >
                            <Building2 className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedOrganization(org);
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
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <OrganizationForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setSelectedOrganization(null);
        }}
        onSubmit={async (data) => {
          try {
            // Check if name is unique
            const { data: existingOrgs, error: checkError } = await supabase
              .from("organizations")
              .select("id, name")
              .eq("name", data.name);

            if (checkError) throw checkError;

            // If editing, filter out the current org from the check
            const nameExists = selectedOrganization?.id
              ? existingOrgs.some(
                  (org) =>
                    org.id !== selectedOrganization.id &&
                    org.name === data.name,
                )
              : existingOrgs.length > 0;

            if (nameExists) {
              toast({
                variant: "destructive",
                title: "Error",
                description: "An organization with this name already exists",
              });
              return;
            }

            // If setting to own org, first reset any existing own org
            if (data.is_own_org) {
              // Find current own org if any
              const { data: currentOwnOrgs } = await supabase
                .from("organizations")
                .select("id")
                .eq("is_own_org", true);

              // If there's an existing own org and it's not the one being edited
              if (
                currentOwnOrgs?.length &&
                (!selectedOrganization?.id ||
                  currentOwnOrgs[0].id !== selectedOrganization.id)
              ) {
                await supabase
                  .from("organizations")
                  .update({ is_own_org: false })
                  .eq("id", currentOwnOrgs[0].id);
              }
            }

            let result;
            if (selectedOrganization?.id) {
              result = await supabase
                .from("organizations")
                .update(data)
                .eq("id", selectedOrganization.id);
            } else {
              // For new organizations, if no own org exists, set this as own org
              const { data: existingOwnOrgs } = await supabase
                .from("organizations")
                .select("id")
                .eq("is_own_org", true);

              if (!existingOwnOrgs?.length && !data.is_own_org) {
                data.is_own_org = true;
              }

              result = await supabase.from("organizations").insert([data]);
            }

            if (result.error) {
              throw result.error;
            }

            // First show success message
            toast({
              title: "Success",
              description: `Organization ${selectedOrganization ? "updated" : "added"} successfully`,
            });

            // Then close the form
            setShowForm(false);
            setSelectedOrganization(null);

            // Finally reload the organizations list
            await loadOrganizations();
          } catch (error) {
            console.error("Error saving organization:", error);
            toast({
              variant: "destructive",
              title: "Error",
              description: `Failed to ${selectedOrganization ? "update" : "add"} organization`,
            });
          }
        }}
        initialData={selectedOrganization}
      />
    </Card>
  );
}
