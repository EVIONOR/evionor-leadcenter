import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { QuestionnaireResponse } from "@/integrations/evionor/types";

interface DailyLeadsChartProps {
  leads: QuestionnaireResponse[];
}

const chartConfig = {
  count: {
    label: "Leadek",
    color: "hsl(var(--primary))",
  },
};

export function DailyLeadsChart({ leads }: DailyLeadsChartProps) {
  const data = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const lead of leads) {
      const day = lead.created_at.substring(0, 10);
      counts[day] = (counts[day] || 0) + 1;
    }
    return Object.entries(counts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({
        date: date.substring(5), // MM-DD
        fullDate: date,
        count,
      }));
  }, [leads]);

  if (!data.length) {
    return <p className="text-sm text-muted-foreground text-center py-8">Nincs adat a kiválasztott időszakban.</p>;
  }

  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
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
