import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Search, Filter, FileText, CheckCircle2, UserPlus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import { OnboardingProgress } from "./onboarding-progress";
import { OnboardingTasks } from "./onboarding-tasks";

interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  startDate: string;
  status: "Not Started" | "In Progress" | "Completed" | "Delayed";
  progress: number;
}

const mockEmployees: Employee[] = [
  {
    id: "1",
    name: "John Smith",
    position: "Senior Frontend Developer",
    department: "Engineering",
    startDate: "2024-04-01",
    status: "In Progress",
    progress: 65,
  },
  {
    id: "2",
    name: "Sarah Wilson",
    position: "UX Designer",
    department: "Design",
    startDate: "2024-04-15",
    status: "Not Started",
    progress: 0,
  },
  {
    id: "3",
    name: "Michael Brown",
    position: "Product Manager",
    department: "Product",
    startDate: "2024-03-28",
    status: "Completed",
    progress: 100,
  },
];

export function OnboardingList() {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );
  const [showTasks, setShowTasks] = useState<Employee | null>(null);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>New Employees</CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex w-full max-w-sm items-center space-x-2">
              <Input type="search" placeholder="Search employees..." />
              <Button type="submit" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Employee
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>{employee.position}</TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>{employee.startDate}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(employee.status)}>
                      {employee.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={employee.progress}
                        className="w-[60px]"
                      />
                      <span className="text-sm text-muted-foreground">
                        {employee.progress}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedEmployee(employee)}
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowTasks(employee)}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <OnboardingProgress
        isOpen={!!selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
        employee={selectedEmployee}
      />

      <OnboardingTasks
        isOpen={!!showTasks}
        onClose={() => setShowTasks(null)}
        employee={showTasks}
      />
    </Card>
  );
}

function getStatusColor(status: Employee["status"]): string {
  switch (status) {
    case "Completed":
      return "bg-green-500 hover:bg-green-600 text-white";
    case "In Progress":
      return "bg-blue-500 hover:bg-blue-600 text-white";
    case "Not Started":
      return "bg-yellow-500 hover:bg-yellow-600 text-white";
    case "Delayed":
      return "bg-red-500 hover:bg-red-600 text-white";
    default:
      return "";
  }
}
