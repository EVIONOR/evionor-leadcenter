import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { queryEvionorTable } from "@/integrations/evionor/client";
import type { QuestionnaireResponse, B2BQuestionnaireResponse } from "@/integrations/evionor/types";
import { DailyLeadsChart } from "@/components/stats/DailyLeadsChart";
import { LeadKPIs } from "@/components/stats/LeadKPIs";
import { useAuth } from "@/contexts/AuthContext";

const RANGE_PRESETS = [
  { value: 7, label: "7 nap" },
  { value: 14, label: "14 nap" },
  { value: 30, label: "30 nap" },
  { value: 60, label: "60 nap" },
  { value: 90, label: "90 nap" },
  { value: 180, label: "180 nap" },
  { value: 0, label: "Összes" },
];

export default function Stats() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [b2cLeads, setB2cLeads] = useState<QuestionnaireResponse[]>([]);
  const [b2bLeads, setB2bLeads] = useState<B2BQuestionnaireResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState(30);
  const [customRange, setCustomRange] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.all([
      queryEvionorTable<QuestionnaireResponse>("questionnaire_responses", {
        limit: 5000,
        select: "id,created_at,location,timeline,status",
        order: { column: "created_at", ascending: true },
      }),
      queryEvionorTable<B2BQuestionnaireResponse>("b2b_questionnaire_responses", {
        limit: 5000,
        select: "id,created_at,location,timeline",
        order: { column: "created_at", ascending: true },
      }),
    ])
      .then(([b2cResult, b2bResult]) => {
        if (!cancelled) {
          setB2cLeads(b2cResult?.data || []);
          setB2bLeads(b2bResult?.data || []);
        }
      })
      .catch((err) => console.error("Stats fetch error:", err))
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, []);

  const filterByRange = <T extends { created_at: string }>(items: T[]) => {
    if (range === 0) return items;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - range);
    const cutoffStr = cutoff.toISOString();
    return items.filter((l) => l.created_at >= cutoffStr);
  };

  const filteredB2C = useMemo(() => filterByRange(b2cLeads), [b2cLeads, range]);
  const filteredB2B = useMemo(() => filterByRange(b2bLeads), [b2bLeads, range]);

  const handleCustomRange = () => {
    const n = parseInt(customRange, 10);
    if (n > 0) setRange(n);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Lead Statisztikák</h1>
          <span className="text-sm text-muted-foreground ml-auto">{user?.email}</span>
        </div>

        {/* Range selector */}
        <div className="flex flex-wrap items-center gap-2">
          {RANGE_PRESETS.map((p) => (
            <Button
              key={p.value}
              variant={range === p.value ? "default" : "outline"}
              size="sm"
              onClick={() => setRange(p.value)}
              className="text-xs"
            >
              {p.label}
            </Button>
          ))}
          <div className="flex items-center gap-1 ml-2">
            <Input
              type="number"
              placeholder="Egyéb"
              value={customRange}
              onChange={(e) => setCustomRange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCustomRange()}
              className="w-20 h-8 text-xs"
              min={1}
            />
            <Button variant="outline" size="sm" onClick={handleCustomRange} className="text-xs">
              OK
            </Button>
          </div>
          <span className="text-sm text-muted-foreground ml-auto tabular-nums">
            B2C: {filteredB2C.length} · B2B: {filteredB2B.length}
          </span>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground text-center py-16">Betöltés...</p>
        ) : (
          <Tabs defaultValue="b2c" className="space-y-4">
            <TabsList>
              <TabsTrigger value="b2c">B2C ({filteredB2C.length})</TabsTrigger>
              <TabsTrigger value="b2b">B2B ({filteredB2B.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="b2c" className="space-y-6">
              <DailyLeadsChart leads={filteredB2C} showRejected />
              <LeadKPIs leads={filteredB2C} showRejected />
            </TabsContent>

            <TabsContent value="b2b" className="space-y-6">
              <DailyLeadsChart leads={filteredB2B} />
              <LeadKPIs leads={filteredB2B} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
