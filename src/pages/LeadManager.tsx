import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryState, parseAsInteger, parseAsStringLiteral } from "nuqs";
import {
  getQuestionnaireResponses,
  queryEvionorTable,
  updateQuestionnaireStatus,
  getAutomaticProcessingSetting,
  runResidentialAutomationDryRun,
  runResidentialAutomationTestSend,
  setAutomaticProcessingSetting,
} from "@/integrations/evionor/client";
import type { QuestionnaireResponse, LeadStatus } from "@/integrations/evionor/types";
import { isFakeLead } from "@/components/stats/fakeLead";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Clock,
  Users,
  Zap,
  FileText,
} from "lucide-react";

const statusOptions: { value: LeadStatus; label: string; color: string }[] = [
  { value: "new", label: "Új", color: "bg-blue-500/15 text-blue-700 border-blue-200" },
  { value: "contacted", label: "Kontaktált", color: "bg-amber-500/15 text-amber-700 border-amber-200" },
  { value: "qualified", label: "Minősített", color: "bg-emerald-500/15 text-emerald-700 border-emerald-200" },
  { value: "converted", label: "Konvertált", color: "bg-green-500/15 text-green-700 border-green-200" },
  { value: "rejected", label: "Elutasított", color: "bg-red-500/15 text-red-700 border-red-200" },
  { value: "auto contacted", label: "Auto kontaktált", color: "bg-violet-500/15 text-violet-700 border-violet-200" },
];

const getStatusBadge = (status: string) => {
  const found = statusOptions.find((s) => s.value === status);
  return found || { label: status, color: "bg-muted text-muted-foreground border-border" };
};

export default function LeadManager() {
  const [responses, setResponses] = useState<QuestionnaireResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [autoProcessingEnabled, setAutoProcessingEnabled] = useState(false);
  const [loadingAutoSetting, setLoadingAutoSetting] = useState(true);
  const [runningDryRun, setRunningDryRun] = useState(false);
  const [runningTestSend, setRunningTestSend] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [statusFilter, setStatusFilter] = useQueryState(
    "status",
    parseAsStringLiteral([
      "new", "contacted", "qualified", "converted", "rejected", "all", "auto contacted", "false",
    ] as const).withDefault("new"),
  );

  const [language, setLanguage] = useQueryState(
    "lang",
    parseAsStringLiteral(["hu", "ro"] as const).withDefault("hu"),
  );

  const [currentPage, setCurrentPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [itemsPerPage, setItemsPerPage] = useQueryState("perPage", parseAsInteger.withDefault(15));
  const [allFalseLeads, setAllFalseLeads] = useState<QuestionnaireResponse[]>([]);

  const isFalseFilter = statusFilter === "false";
  const totalPages = isFalseFilter
    ? Math.ceil(allFalseLeads.length / itemsPerPage)
    : Math.ceil(totalCount / itemsPerPage);

  // Load automatic processing setting on mount
  useEffect(() => {
    const loadAutoProcessingSetting = async () => {
      try {
        const enabled = await getAutomaticProcessingSetting();
        setAutoProcessingEnabled(enabled);
      } catch (error) {
        console.error("Error loading automatic processing setting:", error);
      } finally {
        setLoadingAutoSetting(false);
      }
    };

    loadAutoProcessingSetting();
  }, []);

  const isInitialLoad = useRef(true);

  // Fetch all false leads only when entering false filter
  useEffect(() => {
    if (!isFalseFilter) {
      setAllFalseLeads([]);
      return;
    }

    let cancelled = false;
    const fetchAllForFalse = async () => {
      if (isInitialLoad.current) setLoading(true);
      try {
        const PAGE = 1000;
        let offset = 0;
        let all: QuestionnaireResponse[] = [];
        const tableName = language === "ro" ? "questionnaire_responses_ro" : "questionnaire_responses";
        while (true) {
          const result = await queryEvionorTable<QuestionnaireResponse>(tableName, {
            limit: PAGE,
            offset,
            select: "id,name,email,phone,location,timeline,car_brand,car_model,phases,status,created_at",
            order: { column: "created_at", ascending: false },
          });
          const rows = result?.data || [];
          all = all.concat(rows);
          if (rows.length < PAGE) break;
          offset += PAGE;
        }
        if (!cancelled) {
          const fakeLeads = all.filter((r) => isFakeLead({ name: r.name, email: r.email, phone: r.phone }));
          setAllFalseLeads(fakeLeads);
          setTotalCount(fakeLeads.length);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Error fetching false leads:", error);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          isInitialLoad.current = false;
        }
      }
    };

    fetchAllForFalse();
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
    const fetchResponses = async () => {
      if (isInitialLoad.current) setLoading(true);
      try {
        const offset = (currentPage - 1) * itemsPerPage;
        const result = await getQuestionnaireResponses({
          limit: itemsPerPage,
          offset,
          status: statusFilter !== "all" ? statusFilter : undefined,
          language,
        });

        if (!result?.data) throw new Error("No data received");

        if (!cancelled) {
          setResponses(result.data);
          setTotalCount(result.count || 0);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Error fetching responses:", error);
          toast({
            title: "Hiba",
            description: "Nem sikerült lekérni az adatokat",
            variant: "destructive",
          });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          isInitialLoad.current = false;
        }
      }
    };

    fetchResponses();
    return () => { cancelled = true; };
  }, [statusFilter, currentPage, itemsPerPage, language]);

  const handleStatusChange = async (id: string, newStatus: LeadStatus) => {
    try {
      // Optimistic update: remove item from list if it no longer matches filter
      if (statusFilter !== "all" && statusFilter !== newStatus) {
        setResponses((prev) => prev.filter((r) => r.id !== id));
        setTotalCount((prev) => Math.max(0, prev - 1));
      } else {
        // Update the item in the list if it still matches the filter
        setResponses((prev) => prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)));
      }

      await updateQuestionnaireStatus(id, newStatus, language);

      toast({
        title: "Státusz frissítve",
        description: `Státusz: ${getStatusBadge(newStatus).label}`,
      });
    } catch (error) {
      console.error("Error updating status:", error);

      // Revert optimistic update on error by refetching
      const offset = (currentPage - 1) * itemsPerPage;
      const result = await getQuestionnaireResponses({
        limit: itemsPerPage,
        offset,
        status: statusFilter !== "all" ? statusFilter : undefined,
        language,
      });

      if (result?.data) {
        setResponses(result.data);
        setTotalCount(result.count || 0);
      }

      toast({
        title: "Hiba",
        description: "Nem sikerült frissíteni a státuszt",
        variant: "destructive",
      });
    }
  };

  const handleStatusFilterChange = async (value: LeadStatus | "all" | "false") => {
    await setStatusFilter(value);
    await setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleQualifyLead = async (response: QuestionnaireResponse) => {
    const leadData = {
      contactName: response.name || "",
      email: response.email || "",
      phoneNumber: response.phone || "",
      carBrand: response.car_brand || "",
      carModel: response.car_model || "",
      location: response.location || "",
      phases: String(response.phases || "1"),
    };

    localStorage.setItem("prefill_lead_data", JSON.stringify(leadData));

    // Update status to "Qualified" immediately
    try {
      await updateQuestionnaireStatus(response.id, "qualified", language);

      // Optimistically update UI
      if (statusFilter !== "all" && statusFilter !== "qualified") {
        setResponses((prev) => prev.filter((r) => r.id !== response.id));
        setTotalCount((prev) => Math.max(0, prev - 1));
      } else {
        setResponses((prev) => prev.map((r) => (r.id === response.id ? { ...r, status: "qualified" } : r)));
      }

      toast({
        title: "Lead minősítve",
        description: "Státusz: Minősített",
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Figyelmeztetés",
        description: "Űrlap kitöltve, de a státusz frissítés sikertelen",
        variant: "destructive",
      });
    }

    navigate("/");
  };

  const handleAutoProcessingToggle = async (checked: boolean) => {
    try {
      await setAutomaticProcessingSetting(checked);
      setAutoProcessingEnabled(checked);
      toast({
        title: checked ? "Auto feldolgozás bekapcsolva" : "Auto feldolgozás kikapcsolva",
        description: checked
          ? "Új leadek 2 óránként automatikusan feldolgozásra kerülnek"
          : "Automatikus feldolgozás kikapcsolva",
      });
    } catch (error) {
      console.error("Error updating automatic processing setting:", error);
      toast({
        title: "Hiba",
        description: error instanceof Error ? error.message : "Nem sikerült frissíteni a beállítást",
        variant: "destructive",
      });
    }
  };

  const handleDryRun = async () => {
    setRunningDryRun(true);

    try {
      const result = await runResidentialAutomationDryRun();
      if (result.blocked > 0) {
        const firstBlockedLead = result.blockedLeads[0];
        toast({
          title: `Dry run kész: ${result.processed} lead ellenőrizve`,
          description: `${result.blocked} lead blokkolt. Első hiba: ${firstBlockedLead?.email || "N/A"} -> ${firstBlockedLead?.missingFields.join(", ") || "ismeretlen"}`,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Dry run kész",
        description: `${result.processed} lead ellenőrizve, blokkoló hiányosság nélkül.`,
      });
    } catch (error) {
      console.error("Error running residential automation dry run:", error);
      toast({
        title: "Dry run hiba",
        description: "Nem sikerült lefuttatni az auditot.",
        variant: "destructive",
      });
    } finally {
      setRunningDryRun(false);
    }
  };

  const handleTestSend = async () => {
    setRunningTestSend(true);
    try {
      const result = await runResidentialAutomationTestSend();
      toast({
        title: `Teszt küldés kész: ${result.sent || 0} email elküldve`,
        description: `${result.processed || 0} lead feldolgozva, ${result.blocked || 0} blokkolt. Emailek: misho + istvan`,
      });
    } catch (error) {
      console.error("Error running test send:", error);
      toast({
        title: "Teszt küldés hiba",
        description: "Nem sikerült elküldeni a teszt emaileket.",
        variant: "destructive",
      });
    } finally {
      setRunningTestSend(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#0a2540]" />
          <p className="text-sm text-muted-foreground">Leadek betöltése...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="rounded-full h-9 w-9"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-[#0a2540] tracking-tight">Lead Manager</h1>
              <p className="text-xs text-muted-foreground">
                {totalCount} lead{totalCount !== 1 ? "" : ""} · {language === "ro" ? "Román" : "Magyar"}
              </p>
            </div>

            {/* Language switcher */}
            <div className="ml-3 flex items-center gap-1 bg-slate-100 rounded-full p-1">
              <button
                onClick={async () => { await setLanguage("hu"); await setCurrentPage(1); }}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  language === "hu"
                    ? "bg-white text-[#0a2540] shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                🇭🇺 HU
              </button>
              <button
                onClick={async () => { await setLanguage("ro"); await setCurrentPage(1); }}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  language === "ro"
                    ? "bg-white text-[#0a2540] shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                🇷🇴 RO
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTestSend}
              disabled={runningTestSend}
              className="h-9 border-orange-300 text-orange-700 hover:bg-orange-50"
            >
              {runningTestSend ? "Teszt küldés..." : "Teszt küldés"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDryRun}
              disabled={runningDryRun}
              className="h-9"
            >
              {runningDryRun ? "Dry run..." : "Dry run"}
            </Button>
            <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-1.5 border border-slate-200">
              <Switch
                id="auto-processing"
                checked={autoProcessingEnabled}
                onCheckedChange={handleAutoProcessingToggle}
                disabled={loadingAutoSetting}
                className="scale-90"
              />
              <Label htmlFor="auto-processing" className="text-xs font-medium cursor-pointer text-slate-600 whitespace-nowrap">
                <Zap className="h-3 w-3 inline mr-1" />
                Auto
              </Label>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        {/* Filter tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
          <button
            onClick={() => handleStatusFilterChange("all")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
              statusFilter === "all"
                ? "bg-[#0a2540] text-white shadow-sm"
                : "bg-white text-slate-500 hover:bg-slate-100 border border-slate-200"
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
                  ? "bg-[#0a2540] text-white shadow-sm"
                  : "bg-white text-slate-500 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {option.label}
            </button>
          ))}
          <button
            onClick={() => handleStatusFilterChange("false")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
              statusFilter === "false"
                ? "bg-slate-700 text-white shadow-sm"
                : "bg-white text-slate-500 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            False
          </button>
        </div>

        {/* Lead cards */}
        <div className="space-y-3">
          {responses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-600">Nincs találat</p>
              <p className="text-xs text-muted-foreground mt-1">
                {statusFilter === "all"
                  ? "Még nincsenek leadek."
                  : `Nincs "${getStatusBadge(statusFilter).label}" státuszú lead.`}
              </p>
            </div>
          ) : (
            responses.map((response) => {
              const statusInfo = getStatusBadge(response.status);
              return (
                <Card
                  key={response.id}
                  className="group bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
                >
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row md:items-center">
                      {/* Left: Name + date + badge */}
                      <div className="flex items-center gap-3 p-4 md:w-[220px] md:min-w-[220px] border-b md:border-b-0 md:border-r border-slate-100">
                        <div className="h-10 w-10 rounded-full bg-[#0a2540] text-white flex items-center justify-center text-sm font-bold shrink-0">
                          {(response.name || "?")[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#0a2540] truncate">{response.name || "Névtelen"}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {new Date(response.created_at).toLocaleDateString("hu-HU", {
                              year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Center: Info fields */}
                      <div className="flex-1 p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="flex items-start gap-2">
                          <Mail className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
                          <span className="text-xs text-slate-600 truncate">{response.email || "N/A"}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Phone className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
                          <span className="text-xs text-slate-600">{response.phone || "N/A"}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
                          <span className="text-xs text-slate-600">{response.location || "N/A"}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Clock className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
                          <span className="text-xs text-slate-600">{response.timeline || "N/A"}</span>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 p-4 md:pr-5 border-t md:border-t-0 md:border-l border-slate-100">
                        <Badge variant="outline" className={`text-[10px] font-medium px-2 py-0.5 ${statusInfo.color}`}>
                          {statusInfo.label}
                        </Badge>
                        <Select
                          value={response.status}
                          onValueChange={(value) => handleStatusChange(response.id, value as LeadStatus)}
                        >
                          <SelectTrigger className="w-[110px] h-8 text-xs bg-white border-slate-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white z-50">
                            {statusOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value} className="text-xs">
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          onClick={() => handleQualifyLead(response)}
                          className="h-8 px-3 text-xs bg-[#0a2540] hover:bg-[#0d3155] text-white"
                        >
                          Űrlap
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
          <div className="flex items-center justify-between mt-8 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-2">
              <label htmlFor="perPage" className="text-xs text-muted-foreground">
                Oldalanként:
              </label>
              <Input
                id="perPage"
                type="number"
                min="1"
                max="100"
                defaultValue={itemsPerPage}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (value > 0 && value <= 100) {
                    if (debounceRef.current) clearTimeout(debounceRef.current);
                    debounceRef.current = setTimeout(() => {
                      setItemsPerPage(value);
                      setCurrentPage(1);
                    }, 300);
                  }
                }}
                className="w-16 h-8 text-xs"
              />
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-8 px-2"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) pageNum = i + 1;
                else if (currentPage <= 3) pageNum = i + 1;
                else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                else pageNum = currentPage - 2 + i;

                return (
                  <Button
                    key={pageNum}
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`h-8 w-8 text-xs ${
                      currentPage === pageNum
                        ? "bg-[#0a2540] text-white hover:bg-[#0d3155] hover:text-white"
                        : "text-slate-500"
                    }`}
                  >
                    {pageNum}
                  </Button>
                );
              })}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="h-8 px-2"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
