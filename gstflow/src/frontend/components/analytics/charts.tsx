"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

// ─── REVENUE BAR CHART ──────────────────────────────────────────

interface RevenueChartProps {
  data: Array<{
    month: string;
    revenue: number;
    taxCollected: number;
  }>;
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis
          dataKey="month"
          tick={{ fill: "#9ca3af", fontSize: 12 }}
          axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
        />
        <YAxis
          tick={{ fill: "#9ca3af", fontSize: 12 }}
          axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
          tickFormatter={(v: number) =>
            v >= 100000
              ? `₹${(v / 100000).toFixed(1)}L`
              : v >= 1000
              ? `₹${(v / 1000).toFixed(0)}K`
              : `₹${v}`
          }
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(24, 24, 27, 0.95)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "8px",
            color: "#fff",
            fontSize: "13px",
          }}
          formatter={(value: any) => {
            return [`₹${Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, ""];
          }}
        />
        <Bar
          dataKey="revenue"
          fill="url(#revenueGradient)"
          radius={[6, 6, 0, 0]}
          name="Revenue"
        />
        <Bar
          dataKey="taxCollected"
          fill="url(#taxGradient)"
          radius={[6, 6, 0, 0]}
          name="GST Collected"
        />
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
            <stop offset="100%" stopColor="#6366f1" stopOpacity={0.3} />
          </linearGradient>
          <linearGradient id="taxGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
            <stop offset="100%" stopColor="#10b981" stopOpacity={0.3} />
          </linearGradient>
        </defs>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── GST BREAKDOWN PIE CHART ────────────────────────────────────

interface GstBreakdownChartProps {
  data: {
    cgstTotal: number;
    sgstTotal: number;
    igstTotal: number;
  };
}

const PIE_COLORS = ["#6366f1", "#a855f7", "#10b981"];

export function GstBreakdownChart({ data }: GstBreakdownChartProps) {
  const pieData = [
    { name: "CGST", value: data.cgstTotal },
    { name: "SGST", value: data.sgstTotal },
    { name: "IGST", value: data.igstTotal },
  ].filter((d) => d.value > 0);

  if (pieData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
        No tax data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={pieData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={5}
          dataKey="value"
          label={({ name, percent }: any) =>
            `${name} (${(percent * 100).toFixed(0)}%)`
          }
        >
          {pieData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(24, 24, 27, 0.95)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "8px",
            color: "#fff",
            fontSize: "13px",
          }}
          formatter={(value: any) => {
            return [`₹${Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, ""];
          }}
        />
        <Legend
          wrapperStyle={{ fontSize: "12px", color: "#9ca3af" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
