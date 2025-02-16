import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";

import { useInterviews } from "@/lib/api/hooks/useInterviews";
import { useFeedback } from "@/lib/api/hooks/useFeedback";

export function StatusAnalytics() {
  const { interviews } = useInterviews();
  const { feedback } = useFeedback();

  // Calculate analytics data
  const stats = {
    selected:
      feedback?.filter((f) =>
        ["Strong Hire", "Hire"].includes(f.recommendation || ""),
      )?.length || 0,
    inProgress:
      interviews?.filter(
        (i) => !i.status?.includes("Rejected") && i.status !== "Offered",
      )?.length || 0,
    rejected:
      interviews?.filter((i) => i.status?.includes("Rejected"))?.length || 0,
  };

  const data = [
    { name: "Selected", value: stats.selected, color: "#22c55e" },
    { name: "In Progress", value: stats.inProgress, color: "#3b82f6" },
    { name: "Rejected", value: stats.rejected, color: "#ef4444" },
  ];
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Interview Outcomes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value, entry, index) => {
                  const item = data[index!];
                  return (
                    <span className="text-sm">
                      {item.name} ({item.value})
                    </span>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
