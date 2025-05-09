import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePanels } from "@/lib/api/hooks/usePanels";
import { useUsers } from "@/lib/api/hooks/useUsers";
import { usePipelineStages } from "@/lib/api/hooks/usePipelineStages";
import { InterviewPanel } from "@/lib/api/panels";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface PanelFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: InterviewPanel | null;
}

export function PanelForm({ isOpen, onClose, initialData }: PanelFormProps) {
  const { createPanel, updatePanel, isCreating, isUpdating } = usePanels();
  const { users } = useUsers();
  const { stagesD, isLoading: isLoadingStages } = usePipelineStages();

  const [name, setName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [openMembers, setOpenMembers] = useState(false);
  const isSubmitting = isCreating || isUpdating || isLoadingStages;

  // Debug logs
  console.log("Initial data:", initialData);

  // Reset form when initialData changes or dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name || "");
        setSelectedMembers(initialData.members || []);
      } else {
        // Reset form for new panel
        setName("");
        setSelectedMembers([]);
      }
    }
  }, [isOpen, initialData]);

  console.log("Form data:", { name });

  const handleSubmit = () => {
    const panelData = {
      name,
      members: selectedMembers,
      department_id: initialData?.department_id || 0, // Provide a valid default or fetch dynamically
    };

    console.log("Submitting panel data:", panelData);

    if (initialData) {
      updatePanel({ id: initialData.id, updates: panelData });
    } else {
      createPanel(panelData);
    }

    onClose();
  };

  const toggleMember = (userId: string) => {
    setSelectedMembers((current) =>
      current.includes(userId)
        ? current.filter((id) => id !== userId)
        : [...current, userId]
    );
  };
  console.log(stagesD, "stagesD");
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && !isSubmitting && onClose()}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Panel" : "Add Panel"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="panel-name">Panel Name</Label>
            <Select
              value={name}
              onValueChange={setName}
              disabled={isSubmitting || isLoadingStages}
            >
              <SelectTrigger id="panel-name">
                <SelectValue placeholder="Select a panel name" />
              </SelectTrigger>
              <SelectContent>
                {stagesD?.length > 0 ? (
                  stagesD.map((stage) => (
                    <SelectItem key={stage.id} value={stage.name}>
                      {stage.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-stages" disabled>No pipeline stages available</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Panel Members</Label>
            <Popover open={openMembers} onOpenChange={setOpenMembers}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openMembers}
                  className="w-full justify-between"
                  disabled={isSubmitting}
                >
                  {selectedMembers.length > 0
                    ? `${selectedMembers.length} members selected`
                    : "Select members"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0">
                <Command>
                  <CommandInput placeholder="Search members..." />
                  <CommandList>
                    <CommandEmpty>No members found.</CommandEmpty>
                    <CommandGroup>
                      {users?.map((user) => (
                        <CommandItem
                          key={user.id}
                          value={user.name}
                          onSelect={() => toggleMember(user.id)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedMembers.includes(user.id)
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {user.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {selectedMembers.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {selectedMembers.map((memberId) => {
                  const user = users?.find((u) => u.id === memberId);
                  return (
                    <Badge
                      key={memberId}
                      variant="secondary"
                      className="mr-1 mb-1"
                    >
                      {user?.name || "Unknown User"}
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!name || selectedMembers.length === 0 || isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
