import { useState, useEffect, useMemo } from "react";
import { BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { queryEvionorTable } from "@/integrations/evionor/client";
import type { QuestionnaireResponse } from "@/integrations/evionor/types";
import { DailyLeadsChart } from "./DailyLeadsChart";
import { LeadKPIs } from "./LeadKPIs";

const RANGE_OPTIONS = [
  { value: "7", label: "7 nap" },
  { value: "30", label: "30 nap" },
  { value: "90", label: "90 nap" },
  { value: "all", label: "Összes" },
];

export function LeadStatsDialog() {
  const [open, setOpen] = useState(false);
  const [allLeads, setAllLeads] = useState<QuestionnaireResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [range, setRange] = useState("30");

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const result = await queryEvionorTable<QuestionnaireResponse>("questionnaire_responses", {
          limit: 5000,
          select: "id,created_at,location,timeline",
          order: { column: "created_at", ascending: true },
        });
        if (!cancelled && result) {
          setAllLeads(result.data || []);
        }
      } catch (err) {
        console.error("Stats fetch error:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [open]);

  const filteredLeads = useMemo(() => {
    if (range === "all") return allLeads;
    const days = parseInt(range, 10);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffStr = cutoff.toISOString();
    return allLeads.filter((l) => l.created_at >= cutoffStr);
  }, [allLeads, range]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Stats
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Lead Statisztikák</SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          {/* Range selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Időtáv:</span>
            <Select value={range} onValueChange={setRange}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RANGE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground ml-auto tabular-nums">
              {filteredLeads.length} lead
            </span>
          </div>

          {loading ? (
            <p className="text-sm text-muted-foreground text-center py-8">Betöltés...</p>
          ) : (
            <Tabs defaultValue="chart">
              <TabsList className="w-full">
                <TabsTrigger value="chart" className="flex-1">Napi beérkezés</TabsTrigger>
                <TabsTrigger value="kpis" className="flex-1">KPI-k</TabsTrigger>
              </TabsList>
              <TabsContent value="chart" className="mt-4">
                <DailyLeadsChart leads={filteredLeads} />
              </TabsContent>
              <TabsContent value="kpis" className="mt-4">
                <LeadKPIs leads={filteredLeads} />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
