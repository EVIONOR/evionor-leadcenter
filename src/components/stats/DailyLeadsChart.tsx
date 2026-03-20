import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface Lead {
  created_at: string;
}

interface DailyLeadsChartProps {
  leads: Lead[];
}

const chartConfig = {
  count: {
    label: "Leadek",
    color: "hsl(var(--primary))",
  },
};

export function DailyLeadsChart({ leads }: DailyLeadsChartProps) {
  const data = useMemo(() => {
    if (!leads.length) return [];

    const buckets: Record<string, number> = {};
    for (const lead of leads) {
      const day = lead.created_at.substring(0, 10);
      buckets[day] = (buckets[day] || 0) + 1;
    }

    const days = Object.keys(buckets).sort();
    const start = new Date(days[0]);
    const end = new Date(days[days.length - 1]);

    const result: { date: string; fullDate: string; count: number }[] = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const iso = d.toISOString().substring(0, 10);
      result.push({
        date: iso.substring(5),
        fullDate: iso,
        count: buckets[iso] || 0,
      });
    }
    return result;
  }, [leads]);

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
        <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
