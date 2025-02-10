import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Plus, Calendar, FileText, UserPlus } from "lucide-react";

export function QuickActions() {
  const actions = [
    {
      title: "Post New Job",
      description: "Create a new job posting",
      icon: <Plus className="h-5 w-5" />,
      onClick: () => {},
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      title: "Schedule Interview",
      description: "Set up candidate interviews",
      icon: <Calendar className="h-5 w-5" />,
      onClick: () => {},
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      title: "Review Applications",
      description: "Review pending applications",
      icon: <FileText className="h-5 w-5" />,
      onClick: () => {},
      color: "bg-purple-500 hover:bg-purple-600",
    },
    {
      title: "Start Onboarding",
      description: "Begin employee onboarding",
      icon: <UserPlus className="h-5 w-5" />,
      onClick: () => {},
      color: "bg-orange-500 hover:bg-orange-600",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {actions.map((action, i) => (
            <Button
              key={i}
              className={`h-auto p-4 flex flex-col items-center justify-center gap-3 text-white transition-all ${action.color} hover:scale-[1.02] hover:shadow-lg w-full`}
              onClick={action.onClick}
            >
              <div className="bg-white/20 p-2 rounded-lg">{action.icon}</div>
              <div className="text-center">
                <div className="font-semibold">{action.title}</div>
                <div className="text-xs opacity-90 mt-1">
                  {action.description}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
