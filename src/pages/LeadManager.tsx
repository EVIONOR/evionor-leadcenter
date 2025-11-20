import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryState, parseAsInteger, parseAsStringLiteral } from "nuqs";
import { getQuestionnaireResponses, updateQuestionnaireStatus } from "@/integrations/evionor/client";
import type { QuestionnaireResponse, LeadStatus } from "@/integrations/evionor/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const statusOptions: { value: LeadStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "converted", label: "Converted" },
  { value: "rejected", label: "Rejected" },
];

export default function LeadManager() {
  const [responses, setResponses] = useState<QuestionnaireResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [autoProcessEnabled, setAutoProcessEnabled] = useState(false);
  const [autoProcessLoading, setAutoProcessLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [statusFilter, setStatusFilter] = useQueryState(
    "status",
    parseAsStringLiteral(["new", "contacted", "qualified", "converted", "rejected", "all"] as const).withDefault("new"),
  );

  const [currentPage, setCurrentPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [itemsPerPage, setItemsPerPage] = useQueryState("perPage", parseAsInteger.withDefault(15));

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // Fetch auto-process setting
  useEffect(() => {
    const fetchAutoProcessSetting = async () => {
      try {
        const { data, error } = await supabase
          .from("settings")
          .select("value")
          .eq("key", "auto_process_leads")
          .single();

        if (error) throw error;
        
        const value = data?.value as { enabled?: boolean } | null;
        setAutoProcessEnabled(value?.enabled || false);
      } catch (error) {
        console.error("Error fetching auto-process setting:", error);
      }
    };

    fetchAutoProcessSetting();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchResponses = async () => {
      setLoading(true);
      try {
        const offset = (currentPage - 1) * itemsPerPage;
        const result = await getQuestionnaireResponses({
          limit: itemsPerPage,
          offset,
          status: statusFilter !== "all" ? statusFilter : undefined,
        });

        if (!result?.data) {
          throw new Error("No data received");
        }

        // Only update state if this request hasn't been cancelled
        if (!cancelled) {
          setResponses(result.data);
          setTotalCount(result.count || 0);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Error fetching responses:", error);
          toast({
            title: "Error",
            description: "Failed to fetch questionnaire responses from EVIONOR database",
            variant: "destructive",
          });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchResponses();

    // Cleanup function to cancel the request if filter/page changes before completion
    return () => {
      cancelled = true;
    };
  }, [statusFilter, currentPage, itemsPerPage, toast]);

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

      await updateQuestionnaireStatus(id, newStatus);

      toast({
        title: "Status Updated",
        description: `Lead status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error("Error updating status:", error);

      // Revert optimistic update on error by refetching
      const offset = (currentPage - 1) * itemsPerPage;
      const result = await getQuestionnaireResponses({
        limit: itemsPerPage,
        offset,
        status: statusFilter !== "all" ? statusFilter : undefined,
      });

      if (result?.data) {
        setResponses(result.data);
        setTotalCount(result.count || 0);
      }

      toast({
        title: "Error",
        description: "Failed to update lead status",
        variant: "destructive",
      });
    }
  };

  const handleStatusFilterChange = async (value: LeadStatus | "all") => {
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
      phases: response.phases || "1", // FIX: Include phases field
    };

    localStorage.setItem("prefill_lead_data", JSON.stringify(leadData));
    
    // Update status to "qualified" immediately
    try {
      await updateQuestionnaireStatus(response.id, "qualified");
      
      // Update local state
      setResponses((prev) => 
        statusFilter === "all" || statusFilter === "qualified"
          ? prev.map((r) => (r.id === response.id ? { ...r, status: "qualified" } : r))
          : prev.filter((r) => r.id !== response.id)
      );
      
      toast({
        title: "Lead Qualified",
        description: "Lead status updated to Qualified",
      });
    } catch (error) {
      console.error("Error updating lead status:", error);
      toast({
        title: "Warning",
        description: "Lead data loaded but status update failed",
        variant: "destructive",
      });
    }
    
    navigate("/");
  };

  const handleAutoProcessToggle = async (enabled: boolean) => {
    setAutoProcessLoading(true);
    try {
      const { error } = await supabase
        .from("settings")
        .update({ value: { enabled }, updated_at: new Date().toISOString() })
        .eq("key", "auto_process_leads");

      if (error) throw error;

      setAutoProcessEnabled(enabled);
      toast({
        title: enabled ? "Auto-Processing Enabled" : "Auto-Processing Disabled",
        description: enabled
          ? "New leads will be automatically processed every 2 hours"
          : "Automatic lead processing has been disabled",
      });
    } catch (error) {
      console.error("Error updating auto-process setting:", error);
      toast({
        title: "Error",
        description: "Failed to update auto-process setting",
        variant: "destructive",
      });
    } finally {
      setAutoProcessLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Questionnaire
            </Button>
            <h1 className="text-3xl font-bold">Questionnaire Responses</h1>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center space-x-2 bg-card p-3 rounded-lg border">
              <Switch
                id="auto-process"
                checked={autoProcessEnabled}
                onCheckedChange={handleAutoProcessToggle}
                disabled={autoProcessLoading}
              />
              <Label htmlFor="auto-process" className="cursor-pointer">
                {autoProcessLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                ) : null}
                Automatically Process New Leads
              </Label>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                {totalCount} total {totalCount === 1 ? "response" : "responses"}
              </div>
              <Select
                value={statusFilter}
                onValueChange={(value) => handleStatusFilterChange(value as LeadStatus | "all")}
              >
                <SelectTrigger className="w-[180px] bg-background">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  <SelectItem value="all">All Statuses</SelectItem>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="grid gap-4 mb-6">
          {responses.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  {statusFilter === "all"
                    ? "No questionnaire responses found in EVIONOR database."
                    : `No responses with status "${statusFilter}".`}
                </p>
              </CardContent>
            </Card>
          ) : (
            responses.map((response) => (
              <Card key={response.id}>
                <CardContent className="flex items-center gap-8 justify-between p-6">
                  <div>
                    <CardTitle className="text-lg">{response.name || "No Name"}</CardTitle>
                    <p className="text-sm text-muted-foreground">{new Date(response.created_at).toLocaleString()}</p>
                  </div>
                  <div className="grid grid-cols-4 gap-3 mb-3 flex-1">
                    <div>
                      <p className="text-sm font-semibold">Email</p>
                      <p className="text-sm text-muted-foreground truncate">{response.email || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Phone</p>
                      <p className="text-sm text-muted-foreground">{response.phone || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Location</p>
                      <p className="text-sm text-muted-foreground">{response.location || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Timeline</p>
                      <p className="text-sm text-muted-foreground">{response.timeline || "N/A"}</p>
                    </div>
                    {/* <div>
                      <p className="text-sm font-semibold">Car</p>
                      <p className="text-sm text-muted-foreground">
                        {response.car_brand} {response.car_model || "N/A"}
                      </p>
                    </div> */}
                    {/* <div>
                      <p className="text-sm font-semibold">Annual KM</p>
                      <p className="text-sm text-muted-foreground">{response.km_per_year?.toLocaleString() || "N/A"}</p>
                    </div> */}
                    {/* <div>
                      <p className="text-sm font-semibold">Phases</p>
                      <p className="text-sm text-muted-foreground">{response.phases || "N/A"}</p>
                    </div> */}
                  </div>
                  <div className="flex items-center gap-4">
                    <Button variant="default" size="sm" onClick={() => handleQualifyLead(response)}>
                      Fill Form
                    </Button>
                    <Select
                      value={response.status}
                      onValueChange={(value) => handleStatusChange(response.id, value as LeadStatus)}
                    >
                      <SelectTrigger className="w-[140px] bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background z-50">
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <label htmlFor="perPage" className="text-sm text-muted-foreground whitespace-nowrap">
                Per page:
              </label>
              <Input
                id="perPage"
                type="number"
                min="1"
                max="100"
                value={itemsPerPage}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (value > 0 && value <= 100) {
                    setItemsPerPage(value);
                    setCurrentPage(1);
                  }
                }}
                className="w-20"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-10"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
