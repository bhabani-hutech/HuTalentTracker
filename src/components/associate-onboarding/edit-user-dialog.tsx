import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useState, useEffect } from "react";
import { useDepartments } from "@/lib/api/hooks/useDepartments";
import { User } from "@/types/database";

interface EditUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  user: User | null;
}

interface ErrorValidation {
  nameError: string;
  emailError: string;
  departmentError: string;
  roleError: string;
}

export function EditUserDialog({
  isOpen,
  onClose,
  onSubmit,
  user,
}: EditUserDialogProps) {
  const { departments } = useDepartments();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Interviewer",
    department: "",
  });

  const [errors, setErrors] = useState<ErrorValidation>({
    nameError: "",
    emailError: "",
    departmentError: "",
    roleError: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        role: user.role || "Interviewer",
        department: user.department || "",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        role: "Interviewer",
        department: "",
      });
    }
    setErrors({
      nameError: "",
      emailError: "",
      departmentError: "",
      roleError: "",
    });
  }, [user]);

  const validate = () => {
    let valid = true;
    const newErrors: ErrorValidation = {
      nameError: "",
      emailError: "",
      departmentError: "",
      roleError: "",
    };

    const nameRegex = /^[A-Za-z.]+(?: [A-Za-z.]+)*$/;
    if (!formData.name.trim()) {
      newErrors.nameError = "Name is required";
      valid = false;
    } else if (!nameRegex.test(formData.name) || formData.name.length > 50) {
      newErrors.nameError =
        "Name can only contain letters, dots, and spaces (max 50 characters)";
      valid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.emailError = "Email is required";
      valid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.emailError = "Invalid email format";
      valid = false;
    }

    if (!formData.department) {
      newErrors.departmentError = "Department is required";
      valid = false;
    }

    if (!formData.role) {
      newErrors.roleError = "Role is required";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              required
              value={formData.name}
              onChange={(e) => {
                const formatted = e.target.value
                  .split(" ")
                  .map(
                    (word) =>
                      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                  )
                  .join(" ");
                setFormData({ ...formData, name: formatted });
              }}
              placeholder="Enter full name"
            />
            {errors.nameError && (
              <p className="text-sm text-red-500">{errors.nameError}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="Enter email"
            />
            {errors.emailError && (
              <p className="text-sm text-red-500">{errors.emailError}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>
              Department <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.department}
              onValueChange={(value) =>
                setFormData({ ...formData, department: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments?.map((dept) => (
                  <SelectItem key={dept.id} value={dept.name}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.departmentError && (
              <p className="text-sm text-red-500">{errors.departmentError}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>
              Role <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.role}
              onValueChange={(value) =>
                setFormData({ ...formData, role: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="HR">HR</SelectItem>
                <SelectItem value="Hiring Manager">Hiring Manager</SelectItem>
                <SelectItem value="Interviewer">Interviewer</SelectItem>
              </SelectContent>
            </Select>
            {errors.roleError && (
              <p className="text-sm text-red-500">{errors.roleError}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
