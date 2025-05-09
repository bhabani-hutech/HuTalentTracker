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
import { useState } from "react";
import { useDepartments } from "@/lib/api/hooks/useDepartments";

interface AddAssociateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

interface ErrorValidation {
  emailError: string;
  nameError: string;
  departmentError: string;
  roleError: string;
}

export function AddAssociateDialog({
  isOpen,
  onClose,
  onSubmit,
}: AddAssociateDialogProps) {
  const { departments } = useDepartments();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    department: "",
    is_active: true,
  });

  const [errorValidation, setErrorValidation] = useState<ErrorValidation>({
    emailError: "",
    nameError: "",
    departmentError: "",
    roleError: "",
  });

  const validateForm = () => {
    let valid = true;
    const errors: ErrorValidation = {
      emailError: "",
      nameError: "",
      departmentError: "",
      roleError: "",
    };

    if (!formData.name.trim()) {
      errors.nameError = "Name is required";
      valid = false;
    }

    const nameRegex = /^[A-Za-z.]+(?: [A-Za-z.]+)*$/;
    if (
      formData.name &&
      (!nameRegex.test(formData.name) || formData.name.length > 50)
    ) {
      errors.nameError =
        "Name can only contain letters, dots, and spaces (max 50 characters)";
      valid = false;
    }

    if (!formData.email.trim()) {
      errors.emailError = "Email is required";
      valid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.emailError = "Invalid email format";
        valid = false;
      }
    }

    if (!formData.department) {
      errors.departmentError = "Department is required";
      valid = false;
    }

    if (!formData.role) {
      errors.roleError = "Role is required";
      valid = false;
    }

    setErrorValidation(errors);
    return valid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    onSubmit(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Full Name <span className="text-red-500">*</span></Label>
            <Input
              value={formData.name}
              onChange={(e) => {
                const value = e.target.value;
                const formattedValue = value
                  .split(" ")
                  .map(
                    (word) =>
                      word.charAt(0).toUpperCase() +
                      word.slice(1).toLowerCase()
                  )
                  .join(" ");

                setFormData({ ...formData, name: formattedValue });
              }}
              placeholder="Enter user's full name"
            />
            {errorValidation.nameError && (
              <p className="text-sm text-red-500">
                {errorValidation.nameError}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Email <span className="text-red-500">*</span></Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value.trim() })
              }
              placeholder="Enter user's email"
            />
            {errorValidation.emailError && (
              <p className="text-sm text-red-500">
                {errorValidation.emailError}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Department <span className="text-red-500">*</span></Label>
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
            {errorValidation.departmentError && (
              <p className="text-sm text-red-500">
                {errorValidation.departmentError}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Role <span className="text-red-500">*</span></Label>
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
            {errorValidation.roleError && (
              <p className="text-sm text-red-500">
                {errorValidation.roleError}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Add User</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
