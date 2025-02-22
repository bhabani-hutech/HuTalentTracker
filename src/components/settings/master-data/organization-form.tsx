import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

interface Location {
  id?: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
}

interface Department {
  id?: string;
  name: string;
  description?: string;
}

interface Organization {
  id?: string;
  name: string;
  industry?: string;
  description?: string;
  website?: string;
  email_domain?: string;
  logo_url?: string;
  locations?: Location[];
  departments?: Department[];
}

interface OrganizationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Organization) => void;
  initialData?: Organization;
}

export function OrganizationForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: OrganizationFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Organization>({
    name: "",
    industry: "",
    description: "",
    website: "",
    email_domain: "",
    logo_url: "",
    locations: [],
    departments: [],
  });

  const [newLocation, setNewLocation] = useState<Location>({
    name: "",
    address: "",
    city: "",
    state: "",
    country: "",
    postal_code: "",
  });

  const [newDepartment, setNewDepartment] = useState<Department>({
    name: "",
    description: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.name) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Organization name is required",
        });
        return;
      }

      if (initialData?.id) {
        const { error } = await supabase
          .from("organizations")
          .update(formData)
          .eq("id", initialData.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("organizations")
          .insert([formData]);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Organization ${initialData ? "updated" : "created"} successfully`,
      });
      onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Error saving organization:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${initialData ? "update" : "create"} organization`,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[800px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Organization" : "Add Organization"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Organization Name</Label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter organization name"
                />
              </div>
              <div className="space-y-2">
                <Label>Industry</Label>
                <Input
                  value={formData.industry}
                  onChange={(e) =>
                    setFormData({ ...formData, industry: e.target.value })
                  }
                  placeholder="Enter industry"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter organization description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Website</Label>
                <Input
                  type="url"
                  value={formData.website}
                  onChange={(e) =>
                    setFormData({ ...formData, website: e.target.value })
                  }
                  placeholder="Enter website URL"
                />
              </div>
              <div className="space-y-2">
                <Label>Email Domain</Label>
                <Input
                  type="text"
                  value={formData.email_domain}
                  onChange={(e) =>
                    setFormData({ ...formData, email_domain: e.target.value })
                  }
                  placeholder="e.g. company.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Logo URL</Label>
              <Input
                type="url"
                value={formData.logo_url}
                onChange={(e) =>
                  setFormData({ ...formData, logo_url: e.target.value })
                }
                placeholder="Enter logo URL"
              />
            </div>
          </div>

          {/* Departments Section */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Departments</Label>
            <div className="space-y-4">
              {formData.departments?.map((dept, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-2 border rounded"
                >
                  <div className="flex-1">
                    <div className="font-medium">{dept.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {dept.description}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newDepts = [...(formData.departments || [])];
                      newDepts.splice(index, 1);
                      setFormData({ ...formData, departments: newDepts });
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <Input
                    placeholder="Department name"
                    value={newDepartment.name}
                    onChange={(e) =>
                      setNewDepartment({
                        ...newDepartment,
                        name: e.target.value,
                      })
                    }
                  />
                  <Input
                    placeholder="Department description"
                    value={newDepartment.description}
                    onChange={(e) =>
                      setNewDepartment({
                        ...newDepartment,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
                <Button
                  type="button"
                  onClick={() => {
                    if (newDepartment.name) {
                      setFormData({
                        ...formData,
                        departments: [
                          ...(formData.departments || []),
                          newDepartment,
                        ],
                      });
                      setNewDepartment({ name: "", description: "" });
                    }
                  }}
                >
                  Add Department
                </Button>
              </div>
            </div>
          </div>

          {/* Locations Section */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Locations</Label>
            <div className="space-y-4">
              {formData.locations?.map((loc, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-2 border rounded"
                >
                  <div className="flex-1">
                    <div className="font-medium">{loc.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {[
                        loc.address,
                        loc.city,
                        loc.state,
                        loc.country,
                        loc.postal_code,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newLocs = [...(formData.locations || [])];
                      newLocs.splice(index, 1);
                      setFormData({ ...formData, locations: newLocs });
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Location name"
                    value={newLocation.name}
                    onChange={(e) =>
                      setNewLocation({ ...newLocation, name: e.target.value })
                    }
                  />
                  <Input
                    placeholder="Address"
                    value={newLocation.address}
                    onChange={(e) =>
                      setNewLocation({
                        ...newLocation,
                        address: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    placeholder="City"
                    value={newLocation.city}
                    onChange={(e) =>
                      setNewLocation({ ...newLocation, city: e.target.value })
                    }
                  />
                  <Input
                    placeholder="State/Province"
                    value={newLocation.state}
                    onChange={(e) =>
                      setNewLocation({ ...newLocation, state: e.target.value })
                    }
                  />
                  <Input
                    placeholder="Postal code"
                    value={newLocation.postal_code}
                    onChange={(e) =>
                      setNewLocation({
                        ...newLocation,
                        postal_code: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex gap-4">
                  <Input
                    placeholder="Country"
                    value={newLocation.country}
                    onChange={(e) =>
                      setNewLocation({
                        ...newLocation,
                        country: e.target.value,
                      })
                    }
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      if (newLocation.name) {
                        setFormData({
                          ...formData,
                          locations: [
                            ...(formData.locations || []),
                            newLocation,
                          ],
                        });
                        setNewLocation({
                          name: "",
                          address: "",
                          city: "",
                          state: "",
                          country: "",
                          postal_code: "",
                        });
                      }
                    }}
                  >
                    Add Location
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{initialData ? "Update" : "Create"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
