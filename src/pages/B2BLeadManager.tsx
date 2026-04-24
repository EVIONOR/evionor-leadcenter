import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryState, parseAsInteger, parseAsStringLiteral } from "nuqs";
import { getB2BQuestionnaireResponses, getB2BAutomationSettings, setB2BAutomationEnabled, setB2BAutoGroupEnabled, queryEvionorTable } from "@/integrations/evionor/client";
import { supabase } from "@/integrations/supabase/client";
import { evionorAuth } from "@/integrations/evionor/auth-client";
import type { B2BQuestionnaireResponse } from "@/integrations/evionor/types";
import { isFakeLead } from "@/components/stats/fakeLead";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { B2BQualifyForm } from "@/components/b2b/B2BQualifyForm";
import {
  Loader2,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Clock,
  Building2,
  Car,
  FileText,
  Plug,
} from "lucide-react";

type B2BLeadStatus = "new" | "contacted" | "qualified" | "converted" | "rejected" | "auto_email" | "auto_contacted";

const statusOptions: { value: B2BLeadStatus; label: string; color: string }[] = [
  { value: "new", label: "Új", color: "bg-blue-500/15 text-blue-700 border-blue-200" },
  { value: "contacted", label: "Kontaktált", color: "bg-amber-500/15 text-amber-700 border-amber-200" },
  { value: "qualified", label: "Minősített", color: "bg-emerald-500/15 text-emerald-700 border-emerald-200" },
  { value: "converted", label: "Konvertált", color: "bg-green-500/15 text-green-700 border-green-200" },
  { value: "rejected", label: "Elutasított", color: "bg-red-500/15 text-red-700 border-red-200" },
  { value: "auto_email", label: "Auto email", color: "bg-cyan-500/15 text-cyan-700 border-cyan-200" },
  { value: "auto_contacted", label: "Auto contacted", color: "bg-violet-500/15 text-violet-700 border-violet-200" },
];

const getStatusBadge = (status: string) => {
  const found = statusOptions.find((s) => s.value === status);
  return found || { label: status || "Új", color: "bg-blue-500/15 text-blue-700 border-blue-200" };
};

// Extended type with local qualification status
type B2BLeadWithStatus = B2BQuestionnaireResponse & {
  qualification_status: B2BLeadStatus;
  qualification_id: string | null;
};

export default function B2BLeadManager() {
  const [responses, setResponses] = useState<B2BLeadWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedLead, setSelectedLead] = useState<B2BQuestionnaireResponse | null>(null);
  const [automationEnabled, setAutomationEnabled] = useState(false);
  const [autoGroupEnabled, setAutoGroupEnabled] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialLoad = useRef(true);

  const [statusFilter, setStatusFilter] = useQueryState(
    "status",
    parseAsStringLiteral([
      "new", "contacted", "qualified", "converted", "rejected", "all", "auto_email", "auto_contacted", "false",
    ] as const).withDefault("new"),
  );

  const [language, setLanguage] = useQueryState(
    "lang",
    parseAsStringLiteral(["hu", "ro"] as const).withDefault("hu"),
  );

  const [currentPage, setCurrentPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [itemsPerPage, setItemsPerPage] = useQueryState("perPage", parseAsInteger.withDefault(15));
  const [allFalseLeads, setAllFalseLeads] = useState<B2BLeadWithStatus[]>([]);

  const isFalseFilter = statusFilter === "false";
  const totalPages = isFalseFilter
    ? Math.ceil(allFalseLeads.length / itemsPerPage)
    : Math.ceil(totalCount / itemsPerPage);

  // Load automation settings
  useEffect(() => {
    (async () => {
      try {
        const settings = await getB2BAutomationSettings();
        setAutomationEnabled(settings.automationEnabled);
        setAutoGroupEnabled(settings.autoGroupEnabled);
      } catch (e) {
        console.error("Error loading B2B automation settings:", e);
      } finally {
        setLoadingSettings(false);
      }
    })();
  }, []);

  const fetchAllB2BLeads = async (lang: "hu" | "ro" = "hu"): Promise<B2BQuestionnaireResponse[]> => {
    const PAGE = 1000;
    let offset = 0;
    const all: B2BQuestionnaireResponse[] = [];
    const tableName = lang === "ro" ? "b2b_questionnaire_responses_ro" : "b2b_questionnaire_responses";
    while (true) {
      const result = await queryEvionorTable<B2BQuestionnaireResponse>(tableName, {
        limit: PAGE,
        offset,
        select: "id, company_name, name, email, phone, fleet_count, km_per_year, charging_stations, home_chargers, phases, location, timeline, usage_environment, data_consent, created_at",
        order: { column: "created_at", ascending: false },
      });
      const rows = result?.data || [];
      all.push(...rows);
      if (rows.length < PAGE) break;
      offset += PAGE;
    }
    return all;
  };

  const qualificationsCache = useRef<Map<string, { status: string; id: string }> | null>(null);

  const fetchQualifications = async (force = false) => {
    if (qualificationsCache.current && !force) return qualificationsCache.current;
    const { data: { session } } = await evionorAuth.auth.getSession();
    const { data: qualResult } = await supabase.functions.invoke("manage-qualifications", {
      body: { action: "list", access_token: session?.access_token }
    });
    const qualifications = qualResult?.data || [];
    const statusMap = new Map<string, { status: string; id: string }>();
    qualifications.forEach((q: any) => {
      if (q.source_b2b_id) {
        statusMap.set(q.source_b2b_id, { status: q.status || "new", id: q.id });
      }
    });
    qualificationsCache.current = statusMap;
    return statusMap;
  };

  // Fetch all false leads only when entering false filter
  useEffect(() => {
    if (!isFalseFilter) {
      setAllFalseLeads([]);
      return;
    }

    let cancelled = false;
    const fetchFalse = async () => {
      if (isInitialLoad.current) setLoading(true);
      try {
        const statusMap = await fetchQualifications();
        const allLeads = await fetchAllB2BLeads(language);
        const leadsWithStatus: B2BLeadWithStatus[] = allLeads.map((lead) => {
          const qual = statusMap.get(lead.id);
          return { ...lead, qualification_status: (qual?.status as B2BLeadStatus) || "new", qualification_id: qual?.id || null };
        });
        const fakeLeads = leadsWithStatus.filter((l) => isFakeLead({ name: l.name, email: l.email, phone: l.phone }));
        if (!cancelled) {
          setAllFalseLeads(fakeLeads);
          setTotalCount(fakeLeads.length);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Error fetching false B2B leads:", error);
        }
      } finally {
        if (!cancelled) { setLoading(false); isInitialLoad.current = false; }
      }
    };
    fetchFalse();
    return () => { cancelled = true; };
  }, [statusFilter, language]);

  // Paginate false leads from cache
  useEffect(() => {
    if (!isFalseFilter || allFalseLeads.length === 0) return;
    const start = (currentPage - 1) * itemsPerPage;
    setResponses(allFalseLeads.slice(start, start + itemsPerPage));
  }, [isFalseFilter, allFalseLeads, currentPage, itemsPerPage]);

  // Fetch normal (non-false) leads
  useEffect(() => {
    if (isFalseFilter) return;

    let cancelled = false;
    const fetchNormal = async () => {
      if (isInitialLoad.current) setLoading(true);
      try {
        const offset = (currentPage - 1) * itemsPerPage;
        const statusMap = await fetchQualifications();

        const result = await getB2BQuestionnaireResponses({ limit: 200, offset: 0, language });
        if (!result?.data) throw new Error("No data received");

        const leadsWithStatus: B2BLeadWithStatus[] = result.data.map((lead) => {
          const qual = statusMap.get(lead.id);
          return { ...lead, qualification_status: (qual?.status as B2BLeadStatus) || "new", qualification_id: qual?.id || null };
        });

        const filtered = statusFilter === "all"
          ? leadsWithStatus
          : leadsWithStatus.filter((l) => l.qualification_status === statusFilter);

        if (!cancelled) {
          setTotalCount(filtered.length);
          setResponses(filtered.slice(offset, offset + itemsPerPage));
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Error fetching B2B responses:", error);
          toast({ title: "Hiba", description: "Nem sikerült lekérni a B2B leadeket", variant: "destructive" });
        }
      } finally {
        if (!cancelled) { setLoading(false); isInitialLoad.current = false; }
      }
    };
    fetchNormal();
    return () => { cancelled = true; };
  }, [currentPage, statusFilter, itemsPerPage, language]);

  const fetchResponses = async () => {
    qualificationsCache.current = null; // force refresh
    if (isFalseFilter) {
      const statusMap = await fetchQualifications(true);
      const allLeads = await fetchAllB2BLeads(language);
      const leadsWithStatus: B2BLeadWithStatus[] = allLeads.map((lead) => {
        const qual = statusMap.get(lead.id);
        return { ...lead, qualification_status: (qual?.status as B2BLeadStatus) || "new", qualification_id: qual?.id || null };
      });
      const fakeLeads = leadsWithStatus.filter((l) => isFakeLead({ name: l.name, email: l.email, phone: l.phone }));
      setAllFalseLeads(fakeLeads);
      setTotalCount(fakeLeads.length);
      const offset = (currentPage - 1) * itemsPerPage;
      setResponses(fakeLeads.slice(offset, offset + itemsPerPage));
    } else {
      const offset = (currentPage - 1) * itemsPerPage;
      const statusMap = await fetchQualifications(true);
      const result = await getB2BQuestionnaireResponses({ limit: 200, offset: 0, language });
      if (!result?.data) return;
      const leadsWithStatus: B2BLeadWithStatus[] = result.data.map((lead) => {
        const qual = statusMap.get(lead.id);
        return { ...lead, qualification_status: (qual?.status as B2BLeadStatus) || "new", qualification_id: qual?.id || null };
      });
      const filtered = statusFilter === "all"
        ? leadsWithStatus
        : leadsWithStatus.filter((l) => l.qualification_status === statusFilter);
      setTotalCount(filtered.length);
      setResponses(filtered.slice(offset, offset + itemsPerPage));
    }
  };

  const handleStatusChange = async (lead: B2BLeadWithStatus, newStatus: B2BLeadStatus) => {
    try {
      const { data: { session } } = await evionorAuth.auth.getSession();
      const access_token = session?.access_token;

      if (lead.qualification_id) {
        const { error } = await supabase.functions.invoke("manage-qualifications", {
          body: { action: "update_status", access_token, id: lead.qualification_id, status: newStatus }
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.functions.invoke("manage-qualifications", {
          body: {
            action: "insert",
            access_token,
            data: {
              source_b2b_id: lead.id,
              company_name: lead.company_name,
              contact_name: lead.name,
              phone: lead.phone,
              email: lead.email,
              status: newStatus,
            }
          }
        });
        if (error) throw error;
      }

      // Optimistic update
      if (statusFilter !== "all" && statusFilter !== newStatus && !isFalseFilter) {
        setResponses((prev) => prev.filter((r) => r.id !== lead.id));
        setTotalCount((prev) => Math.max(0, prev - 1));
      } else {
        setResponses((prev) =>
          prev.map((r) => r.id === lead.id ? { ...r, qualification_status: newStatus } : r)
        );
      }

      toast({ title: "Státusz frissítve", description: `Státusz: ${getStatusBadge(newStatus).label}` });
    } catch (error) {
      console.error("Error updating B2B status:", error);
      toast({ title: "Hiba", description: "Nem sikerült frissíteni a státuszt", variant: "destructive" });
      fetchResponses();
    }
  };

  const handleStatusFilterChange = async (value: string) => {
    await setStatusFilter(value as any);
    await setCurrentPage(1);
  };

  const handleToggleAutomation = async (enabled: boolean) => {
    try {
      await setB2BAutomationEnabled(enabled);
      setAutomationEnabled(enabled);
      toast({ title: enabled ? "B2B Auto email bekapcsolva" : "B2B Auto email kikapcsolva" });
    } catch (error) {
      console.error("Error toggling B2B automation:", error);
      toast({ title: "Hiba", description: "Nem sikerült módosítani a beállítást", variant: "destructive" });
    }
  };

  const handleToggleAutoGroup = async (enabled: boolean) => {
    try {
      await setB2BAutoGroupEnabled(enabled);
      setAutoGroupEnabled(enabled);
      toast({ title: enabled ? "Auto Group bekapcsolva" : "Auto Group kikapcsolva" });
    } catch (error) {
      console.error("Error toggling B2B auto group:", error);
      toast({ title: "Hiba", description: "Nem sikerült módosítani a beállítást", variant: "destructive" });
    }
  };

  if (selectedLead) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-6">
          <B2BQualifyForm
            lead={selectedLead}
            onBack={() => { setSelectedLead(null); fetchResponses(); }}
            onSaved={() => { setSelectedLead(null); fetchResponses(); }}
          />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">B2B leadek betöltése...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="rounded-full h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-foreground tracking-tight">B2B Lead Manager</h1>
              <p className="text-xs text-muted-foreground">
                {isFalseFilter ? allFalseLeads.length : totalCount} B2B lead · {language === "ro" ? "Román" : "Magyar"}
              </p>
            </div>

            {/* Language switcher */}
            <div className="ml-3 flex items-center gap-1 bg-muted rounded-full p-1">
              <button
                onClick={async () => { await setLanguage("hu"); await setCurrentPage(1); }}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  language === "hu"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                🇭🇺 HU
              </button>
              <button
                onClick={async () => { await setLanguage("ro"); await setCurrentPage(1); }}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  language === "ro"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                🇷🇴 RO
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="perPage" className="text-xs text-muted-foreground whitespace-nowrap">Oldalanként:</Label>
            <Input
              id="perPage"
              type="number"
              min={1}
              max={100}
              defaultValue={itemsPerPage}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (value > 0 && value <= 100) {
                  if (debounceRef.current) clearTimeout(debounceRef.current);
                  debounceRef.current = setTimeout(() => {
                    setItemsPerPage(value);
                    setCurrentPage(1);
                  }, 3000);
                }
              }}
              className="w-16 h-8 text-xs"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        {/* Filter tabs */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
          <button
            onClick={() => handleStatusFilterChange("all")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
              statusFilter === "all"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-card text-muted-foreground hover:bg-muted border border-border"
            }`}
          >
            Mind
          </button>
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleStatusFilterChange(option.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                statusFilter === option.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-card text-muted-foreground hover:bg-muted border border-border"
              }`}
            >
              {option.label}
            </button>
          ))}
          <button
            onClick={() => handleStatusFilterChange("false")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
              statusFilter === "false"
                ? "bg-zinc-800 text-white shadow-sm"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 border border-zinc-300"
            }`}
          >
            False
          </button>
        </div>

        {/* Auto email controls */}
        {statusFilter === "auto_email" && !loadingSettings && (
          <div className="flex items-center gap-6 mb-4 p-3 bg-card rounded-lg border">
            <div className="flex items-center gap-2">
              <Switch
                id="b2b-auto-email"
                checked={automationEnabled}
                onCheckedChange={handleToggleAutomation}
              />
              <Label htmlFor="b2b-auto-email" className="text-xs font-medium cursor-pointer">
                Auto email küldés
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="b2b-auto-group"
                checked={autoGroupEnabled}
                onCheckedChange={handleToggleAutoGroup}
              />
              <Label htmlFor="b2b-auto-group" className="text-xs font-medium cursor-pointer">
                Auto Group (új → auto email)
              </Label>
            </div>
          </div>
        )}

        {/* Lead cards */}
        <div className="space-y-3">
          {responses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">Nincs találat</p>
              <p className="text-xs text-muted-foreground mt-1">
                {statusFilter === "all"
                  ? "Még nincsenek B2B leadek."
                  : isFalseFilter
                    ? "Nincs false B2B lead."
                    : `Nincs "${getStatusBadge(statusFilter).label}" státuszú B2B lead.`}
              </p>
            </div>
          ) : (
            responses.map((response) => {
              const statusInfo = getStatusBadge(response.qualification_status);
              return (
                <Card key={response.id} className="group hover:shadow-md transition-shadow duration-200 overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row md:items-center">
                      {/* Left: Company + Name */}
                      <div className="flex items-center gap-3 p-4 md:w-[240px] md:min-w-[240px] border-b md:border-b-0 md:border-r">
                        <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {response.company_name || response.name}
                          </p>
                          {response.company_name && (
                            <p className="text-[11px] text-muted-foreground truncate">{response.name}</p>
                          )}
                          <p className="text-[11px] text-muted-foreground">
                            {new Date(response.created_at).toLocaleDateString("hu-HU", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Center: Info fields */}
                      <div className="flex-1 px-4 py-2.5 flex flex-col gap-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Mail className="h-3 w-3 shrink-0" />{response.email || "N/A"}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Phone className="h-3 w-3 shrink-0" />{response.phone || "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                            <MapPin className="h-3 w-3 shrink-0" />{response.location || "N/A"}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Clock className="h-3 w-3 shrink-0" />{response.timeline || "N/A"}
                          </span>
                        </div>
                      </div>

                      {/* Right: Stats + Status + Actions */}
                      <div className="flex items-center gap-2 p-4 md:pr-5 border-t md:border-t-0 md:border-l">
                        <div className="flex gap-1.5">
                          <Badge variant="outline" className="text-[10px] px-2 py-0.5">
                            <Car className="h-3 w-3 mr-1" />
                            {response.fleet_count} autó
                          </Badge>
                          <Badge variant="outline" className="text-[10px] px-2 py-0.5">
                            <Plug className="h-3 w-3 mr-1" />
                            {response.charging_stations} töltő
                          </Badge>
                        </div>
                        <Badge variant="outline" className={`text-[10px] font-medium px-2 py-0.5 ${statusInfo.color}`}>
                          {statusInfo.label}
                        </Badge>
                        <Select
                          value={response.qualification_status}
                          onValueChange={(value) => handleStatusChange(response, value as B2BLeadStatus)}
                        >
                          <SelectTrigger className="w-[130px] h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value} className="text-xs">
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          onClick={() => setSelectedLead(response)}
                          className="h-8 px-3 text-xs"
                        >
                          Kvalifikálás
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center mt-8 gap-2">
            <Button
              variant="ghost"
              size="icon"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs text-muted-foreground px-3">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="ghost"
              size="icon"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
