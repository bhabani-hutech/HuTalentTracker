import React, { useState, useEffect } from "react";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { X } from "lucide-react";
import { Job } from "@/types/database";

interface ResumeFiltersProps {
  jobs: Job[];
  departments: { id: string; name: string }[];
  onFilterChange: (filters: FilterOptions) => void;
}

export interface FilterOptions {
  jobId: string | null;
  departmentId: string | null;
  source: string | null;
  hiringPartnerId: string | null;
  noticePeriod: string | null;
  searchTerm: string;
}

export function ResumeFilters({
  jobs,
  departments,
  onFilterChange,
}: ResumeFiltersProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    jobId: null,
    departmentId: null,
    source: null,
    hiringPartnerId: null,
    noticePeriod: null,
    searchTerm: "",
  });

  // Source options
  const sourceOptions = [
    { value: "direct", label: "Self" },
    { value: "hiring_partner", label: "Hiring Partner" },
  ];

  // Notice period options
  const noticePeriodOptions = [
    { value: "immediate", label: "Immediate" },
    { value: "15days", label: "15 Days" },
    { value: "30days", label: "30 Days" },
    { value: "60days", label: "60 Days" },
    { value: "90days", label: "90 Days" },
  ];

  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const handleFilterChange = (
    key: keyof FilterOptions,
    value: string | null,
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      jobId: null,
      departmentId: null,
      source: null,
      hiringPartnerId: null,
      noticePeriod: null,
      searchTerm: "",
    });
  };

  return (
    <div className="space-y-4 bg-white p-4 rounded-lg border">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Filter Candidates</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="text-gray-500"
        >
          <X className="h-4 w-4 mr-1" /> Clear Filters
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Position Filter */}
        <div className="space-y-2">
          <Label htmlFor="position-filter">Position</Label>
          <Select
            value={filters.jobId || ""}
            onValueChange={(value) =>
              handleFilterChange("jobId", value === "" ? null : value)
            }
          >
            <SelectTrigger id="position-filter">
              <SelectValue placeholder="All Positions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Positions</SelectItem>
              {jobs.map((job) => (
                <SelectItem key={job.id} value={job.id}>
                  {job.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Department Filter */}
        <div className="space-y-2">
          <Label htmlFor="department-filter">Department</Label>
          <Select
            value={filters.departmentId || ""}
            onValueChange={(value) =>
              handleFilterChange("departmentId", value === "" ? null : value)
            }
          >
            <SelectTrigger id="department-filter">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Source Filter */}
        <div className="space-y-2">
          <Label htmlFor="source-filter">Source</Label>
          <Select
            value={filters.source || ""}
            onValueChange={(value) =>
              handleFilterChange("source", value === "" ? null : value)
            }
          >
            <SelectTrigger id="source-filter">
              <SelectValue placeholder="All Sources" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Sources</SelectItem>
              {sourceOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Notice Period Filter */}
        <div className="space-y-2">
          <Label htmlFor="notice-period-filter">Notice Period</Label>
          <Select
            value={filters.noticePeriod || ""}
            onValueChange={(value) =>
              handleFilterChange("noticePeriod", value === "" ? null : value)
            }
          >
            <SelectTrigger id="notice-period-filter">
              <SelectValue placeholder="All Notice Periods" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Notice Periods</SelectItem>
              {noticePeriodOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
