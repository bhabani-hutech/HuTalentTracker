import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";

interface Task {
  id: string;
  title: string;
  description: string;
  assignee: string;
  dueDate: string;
  completed: boolean;
  category: "HR" | "IT" | "Training" | "Admin";
}

interface OnboardingTasksProps {
  isOpen: boolean;
  onClose: () => void;
  employee: {
    id: string;
    name: string;
    position: string;
  } | null;
}

const mockTasks: Task[] = [
  {
    id: "1",
    title: "Complete Personal Information Form",
    description: "Fill out employee details and emergency contacts",
    assignee: "HR Team",
    dueDate: "2024-04-05",
    completed: true,
    category: "HR",
  },
  {
    id: "2",
    title: "IT Equipment Setup",
    description: "Configure laptop and required software",
    assignee: "IT Support",
    dueDate: "2024-04-06",
    completed: false,
    category: "IT",
  },
  {
    id: "3",
    title: "Department Introduction",
    description: "Meet team members and department head",
    assignee: "Team Lead",
    dueDate: "2024-04-07",
    completed: false,
    category: "Admin",
  },
  {
    id: "4",
    title: "Company Policies Training",
    description: "Complete mandatory company policies training",
    assignee: "HR Team",
    dueDate: "2024-04-08",
    completed: false,
    category: "Training",
  },
];

export function OnboardingTasks({
  isOpen,
  onClose,
  employee,
}: OnboardingTasksProps) {
  if (!employee) return null;

  const completedTasks = mockTasks.filter((task) => task.completed).length;
  const progress = (completedTasks / mockTasks.length) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Onboarding Tasks - {employee.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                Overall Progress ({completedTasks} of {mockTasks.length} tasks
                completed)
              </span>
              <span className="text-sm text-muted-foreground">
                {progress.toFixed(0)}%
              </span>
            </div>
            <Progress value={progress} />
          </div>

          <div className="space-y-4">
            {mockTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-start space-x-4 p-4 border rounded-lg"
              >
                <Checkbox checked={task.completed} />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{task.title}</p>
                    <Badge variant="outline">{task.category}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {task.description}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Assignee: {task.assignee}
                    </span>
                    <span className="text-muted-foreground">
                      Due: {task.dueDate}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button className="w-full" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
