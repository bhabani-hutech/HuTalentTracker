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
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";

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
  phone?: string;
  email?: string;
  logo_url?: string;
  logo_file?: File;
  is_own_org?: boolean;
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
    email: "",
    phone: "",
    logo_url: "",
    is_own_org: false,
    locations: [],
    departments: [],
  });

  const [isUploading, setIsUploading] = useState(false);

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
      // When editing, load the existing data including the logo URL
      setFormData({
        ...initialData,
        // Ensure locations and departments are arrays
        locations: initialData.locations || [],
        departments: initialData.departments || [],
      });
    } else {
      // Reset form for new organization
      setFormData({
        name: "",
        industry: "",
        description: "",
        website: "",
        email_domain: "",
        email: "",
        phone: "",
        logo_url: "",
        is_own_org: false,
        locations: [],
        departments: [],
      });
    }
  }, [initialData, isOpen]);

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

      setIsUploading(true);

      // Handle logo upload if there's a file
      if (formData.logo_file) {
        try {
          const fileExt = formData.logo_file.name.split(".").pop();
          const fileName = `${Date.now()}.${fileExt}`;

          // Upload to the organization-logos bucket directly
          const { error: uploadError } = await supabase.storage
            .from("organization-logos")
            .upload(fileName, formData.logo_file, {
              cacheControl: "3600",
              upsert: true,
            });

          if (uploadError) {
            throw uploadError;
          }

          // Get public URL for the uploaded file
          const { data } = supabase.storage
            .from("organization-logos")
            .getPublicUrl(fileName);

          if (data) {
            formData.logo_url = data.publicUrl;
          }
        } catch (uploadError) {
          console.error("Error uploading logo:", uploadError);
          toast({
            variant: "destructive",
            title: "Upload Error",
            description: "Failed to upload logo. Please try again.",
          });
          setIsUploading(false);
          return;
        }
      }

      // Remove the file object before submitting to API
      const { logo_file, ...dataToSubmit } = formData;

      // Pass the form data to the parent component's onSubmit handler
      // Let the parent component handle the API call and state updates
      onSubmit(dataToSubmit);
      setIsUploading(false);
      onClose();
    } catch (error) {
      console.error("Error in form submission:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to submit organization form`,
      });
      setIsUploading(false);
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
          <div className="grid gap-6 py-4">
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

            <div className="flex items-center space-x-2">
              <Switch
                id="is-own-org"
                checked={formData.is_own_org}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_own_org: checked })
                }
              />
              <Label htmlFor="is-own-org" className="font-medium">
                This is our own organization (not a partner)
              </Label>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter organization description"
                className="min-h-[100px]"
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
                <Label>Hiring Contact Email Domain</Label>
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="Enter organization email"
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Upload Logo</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // Create a preview URL for the UI
                    const imageUrl = URL.createObjectURL(file);
                    setFormData({
                      ...formData,
                      logo_url: imageUrl,
                      logo_file: file, // Store the file object for later upload
                    });
                  }
                }}
              />

              {formData.logo_url && (
                <div className="relative mt-2 w-fit">
                  <img
                    src={formData.logo_url}
                    alt="Logo Preview"
                    className="h-20 w-20 object-contain rounded border"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        logo_url: "",
                        logo_file: undefined,
                      })
                    }
                    className="absolute -top-2 -right-2 rounded-full bg-red-500 text-white w-5 h-5 flex items-center justify-center text-xs"
                    aria-label="Remove logo"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            {/* Departments Section */}
            <div className="space-y-4 border-t pt-4">
              <Label className="text-lg font-semibold">Departments</Label>
              <div className="space-y-4">
                {formData.departments?.map((dept, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-3 border rounded-md bg-gray-50"
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
            <div className="space-y-4 border-t pt-4">
              <Label className="text-lg font-semibold">Locations</Label>
              <div className="space-y-4">
                {formData.locations?.map((loc, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-3 border rounded-md bg-gray-50"
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
                        setNewLocation({
                          ...newLocation,
                          state: e.target.value,
                        })
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
          </div>

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {initialData ? "Updating..." : "Creating..."}
                </>
              ) : initialData ? (
                "Update"
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
