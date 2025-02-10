import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";

const data = [
  { name: "Selected", value: 15, color: "#22c55e" },
  { name: "In Progress", value: 28, color: "#3b82f6" },
  { name: "Rejected", value: 77, color: "#ef4444" },
];

export function StatusAnalytics() {
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
