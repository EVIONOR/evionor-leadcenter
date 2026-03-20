import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { getCountyByCity, isBudapestOrPest } from "./countyMapping";

interface Lead {
  created_at: string;
  location?: string;
  timeline?: string;
}

interface LeadKPIsProps {
  leads: Lead[];
}

const TIMELINE_LABELS: Record<string, string> = {
  asap: "ASAP",
  "1-month": "1 hónap",
  "3-month": "3 hónap",
  "3month+": "3+ hónap",
};

const PIE_COLORS = [
  "hsl(var(--primary))",
  "hsl(220 70% 50%)",
  "hsl(150 60% 40%)",
  "hsl(40 80% 55%)",
  "hsl(0 70% 55%)",
];

export function LeadKPIs({ leads }: LeadKPIsProps) {
  const total = leads.length;

  const bpOnly = useMemo(() => {
    if (!total) return { count: 0, pct: 0 };
    const count = leads.filter((l) => {
      const county = getCountyByCity(l.location);
      return county === "Budapest";
    }).length;
    return { count, pct: Math.round((count / total) * 100) };
  }, [leads, total]);

  const bpPestRatio = useMemo(() => {
    if (!total) return { count: 0, pct: 0 };
    const count = leads.filter((l) => isBudapestOrPest(l.location)).length;
    return { count, pct: Math.round((count / total) * 100) };
  }, [leads, total]);

  const countyData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const lead of leads) {
      const county = getCountyByCity(lead.location);
      counts[county] = (counts[county] || 0) + 1;
    }
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value, pct: Math.round((value / total) * 100) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [leads, total]);

  const timelineData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const lead of leads) {
      const key = lead.timeline || "ismeretlen";
      counts[key] = (counts[key] || 0) + 1;
    }
    return Object.entries(counts)
      .map(([name, value]) => ({
        name: TIMELINE_LABELS[name] || name,
        value,
        pct: Math.round((value / total) * 100),
      }))
      .sort((a, b) => b.value - a.value);
  }, [leads, total]);

  const timelineChartConfig = useMemo(
    () =>
      Object.fromEntries(
        timelineData.map((d, i) => [d.name, { label: d.name, color: PIE_COLORS[i % PIE_COLORS.length] }])
      ),
    [timelineData]
  );

  if (!total) {
    return <p className="text-sm text-muted-foreground text-center py-8">Nincs adat.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Budapest only */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Budapest</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tabular-nums">{bpOnly.pct}%</span>
            <span className="text-sm text-muted-foreground">
              ({bpOnly.count} / {total} lead)
            </span>
          </div>
        </CardContent>
      </Card>

      {/* BP + Pest ratio */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Budapest + Pest megye</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tabular-nums">{bpPestRatio.pct}%</span>
            <span className="text-sm text-muted-foreground">
              ({bpPestRatio.count} / {total} lead)
            </span>
          </div>
        </CardContent>
      </Card>

      {/* County breakdown - top 10 */}
      <Card className="md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Top 10 megye</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-1 text-sm">
            {countyData.map((d, i) => (
              <div key={d.name} className="flex justify-between">
                <span className="truncate">
                  <span className="text-muted-foreground mr-1">{i + 1}.</span>
                  {d.name}
                </span>
                <span className="font-medium tabular-nums ml-2">
                  {d.pct}% <span className="text-muted-foreground text-xs">({d.value})</span>
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Timeline breakdown */}
      <Card className="md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Időzítés megoszlás</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={timelineChartConfig} className="h-[220px] w-full">
            <PieChart>
              <Pie
                data={timelineData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, pct }) => `${name} (${pct}%)`}
              >
                {timelineData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
