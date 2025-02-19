import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useJobs } from "@/lib/api/hooks/useJobs";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JobStatus } from "@/types/database";

export default function Jobs() {
  const navigate = useNavigate();
  const { jobs, isLoading, deleteJob } = useJobs();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 10;

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this job posting?")) {
      try {
        await deleteJob(id);
        toast({
          title: "Success",
          description: "Job posting deleted successfully",
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete job posting",
        });
      }
    }
  };

  const filteredJobs = jobs?.filter(
    (job) =>
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const totalPages = Math.ceil((filteredJobs?.length || 0) / resultsPerPage);
  const paginatedJobs = filteredJobs?.slice(
    (currentPage - 1) * resultsPerPage,
    currentPage * resultsPerPage,
  );

  const getStatusColor = (status: JobStatus) => {
    switch (status) {
      case "Published":
        return "bg-green-500 hover:bg-green-600";
      case "Draft":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "Closed":
        return "bg-red-500 hover:bg-red-600";
      case "On Hold":
        return "bg-gray-500 hover:bg-gray-600";
      default:
        return "";
    }
  };

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Job Postings</h1>
          <p className="text-muted-foreground">Manage and track job postings</p>
        </div>
        <Button onClick={() => navigate("/jobs/new")}>
          <Plus className="h-4 w-4 mr-2" /> Post New Job
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Jobs</CardTitle>
            <div className="flex w-full max-w-sm items-center space-x-2">
              <Input
                type="search"
                placeholder="Search jobs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button type="submit" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading...</div>
          ) : (
            <>
              {" "}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : !filteredJobs?.length ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          No jobs found
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedJobs?.map((job) => (
                        <TableRow key={job.id}>
                          <TableCell className="font-medium">
                            {job.title}
                          </TableCell>
                          <TableCell>{job.department}</TableCell>
                          <TableCell>{job.location}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{job.type}</Badge>
                          </TableCell>
                          <TableCell>{job.level}</TableCell>
                          <TableCell>
                            <Badge
                              className={`${getStatusColor(job.status)} text-white`}
                            >
                              {job.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button
                              variant="ghost"
                              onClick={() => navigate(`/jobs/${job.id}`)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              className="text-red-500 hover:text-red-600"
                              onClick={() => handleDelete(job.id)}
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="flex items-center justify-between space-x-2 py-4">
                <div className="text-sm text-muted-foreground">
                  Showing{" "}
                  {Math.min(
                    currentPage * resultsPerPage,
                    filteredJobs?.length || 0,
                  )}{" "}
                  of {filteredJobs?.length || 0} jobs
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
