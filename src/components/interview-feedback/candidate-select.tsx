import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useQuery } from "@tanstack/react-query";
import { getCandidates } from "@/lib/api/candidates";
import { Candidate } from "@/types/database";

interface CandidateSelectProps {
  onSelect: (candidate: Candidate | null) => void;
}

export function CandidateSelect({ onSelect }: CandidateSelectProps) {
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string>("");

  const { data: candidates } = useQuery({
    queryKey: ["candidates"],
    queryFn: getCandidates,
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedId
            ? candidates?.find((c) => c.id === selectedId)?.name
            : "Select candidate..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput placeholder="Search candidates..." />
          <CommandEmpty>No candidate found.</CommandEmpty>
          <CommandGroup>
            {candidates?.map((candidate) => (
              <CommandItem
                key={candidate.id}
                value={candidate.name}
                onSelect={() => {
                  setSelectedId(candidate.id);
                  onSelect(candidate);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedId === candidate.id ? "opacity-100" : "opacity-0",
                  )}
                />
                {candidate.name} - {candidate.position}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
