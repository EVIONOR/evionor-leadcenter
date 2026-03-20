import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface Lead {
  created_at: string;
  status?: string;
}

interface DailyLeadsChartProps {
  leads: Lead[];
  showRejected?: boolean;
}

const chartConfig = {
  active: {
    label: "Aktív",
    color: "hsl(var(--primary))",
  },
  rejected: {
    label: "Elutasított",
    color: "hsl(0 70% 55%)",
  },
  count: {
    label: "Leadek",
    color: "hsl(var(--primary))",
  },
};

export function DailyLeadsChart({ leads, showRejected }: DailyLeadsChartProps) {
  const data = useMemo(() => {
    const buckets: Record<string, { active: number; rejected: number }> = {};
    for (const lead of leads) {
      const day = lead.created_at.substring(0, 10);
      if (!buckets[day]) buckets[day] = { active: 0, rejected: 0 };
      if (showRejected && lead.status === "rejected") {
        buckets[day].rejected++;
      } else {
        buckets[day].active++;
      }
    }
    return Object.entries(buckets)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, counts]) => ({
        date: date.substring(5),
        fullDate: date,
        ...counts,
        count: counts.active + counts.rejected,
      }));
  }, [leads, showRejected]);

  if (!data.length) {
    return <p className="text-sm text-muted-foreground text-center py-8">Nincs adat a kiválasztott időszakban.</p>;
  }

  return (
    <ChartContainer config={chartConfig} className="h-[350px] w-full">
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          fontSize={11}
          interval={data.length > 30 ? Math.floor(data.length / 15) : 0}
        />
        <YAxis tickLine={false} axisLine={false} allowDecimals={false} fontSize={11} />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(_, payload) => {
                const item = payload?.[0]?.payload;
                return item?.fullDate || "";
              }}
            />
          }
        />
        {showRejected ? (
          <>
            <Bar dataKey="active" stackId="a" fill="var(--color-active)" radius={[0, 0, 0, 0]} />
            <Bar dataKey="rejected" stackId="a" fill="var(--color-rejected)" radius={[4, 4, 0, 0]} />
            <Legend />
          </>
        ) : (
          <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
        )}
      </BarChart>
    </ChartContainer>
  );
}
