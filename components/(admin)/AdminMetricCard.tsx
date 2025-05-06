interface AdminMetricCardProps {
    title: string;
    value: number;
    trend?: "up" | "down";
    percentage?: number;
  }
  
  export default function AdminMetricCard({ title, value, trend, percentage }: AdminMetricCardProps) {
    const trendColor = trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-gray-500";
    const trendIcon = trend === "up" ? "▲" : trend === "down" ? "▼" : "";
  
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-md text-blue-700 font-semibold">{title}</h3>
        <p className="text-3xl font-bold mt-1">{value}</p>
        {percentage !== undefined && (
          <p className={`text-sm mt-2 ${trendColor}`}>
            {trendIcon} {percentage}% {trend === "up" ? "increase" : "decrease"} this week
          </p>
        )}
      </div>
    );
  }
  