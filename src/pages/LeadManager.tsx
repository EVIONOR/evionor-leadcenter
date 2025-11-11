import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getQuestionnaireResponses, updateQuestionnaireStatus } from "@/integrations/evionor/client";
import type { QuestionnaireResponse, LeadStatus } from "@/integrations/evionor/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";

const statusOptions: { value: LeadStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "converted", label: "Converted" },
  { value: "rejected", label: "Rejected" },
];

const ITEMS_PER_PAGE = 10;

export default function LeadManager() {
  const [responses, setResponses] = useState<QuestionnaireResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("new");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  useEffect(() => {
    fetchResponses();
  }, [statusFilter, currentPage]);

  const fetchResponses = async () => {
    setLoading(true);
    try {
      const offset = (currentPage - 1) * ITEMS_PER_PAGE;
      const result = await getQuestionnaireResponses({
        limit: ITEMS_PER_PAGE,
        offset,
        status: statusFilter !== "all" ? statusFilter : undefined,
      });

      if (!result?.data) {
        throw new Error("No data received");
      }

      setResponses(result.data);
      setTotalCount(result.count || 0);
    } catch (error) {
      console.error("Error fetching responses:", error);
      toast({
        title: "Error",
        description: "Failed to fetch questionnaire responses from EVIONOR database",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: LeadStatus) => {
    try {
      await updateQuestionnaireStatus(id, newStatus);

      // Refetch data to ensure we have up-to-date information
      await fetchResponses();

      toast({
        title: "Status Updated",
        description: `Lead status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update lead status",
        variant: "destructive",
      });
    }
  };

  const handleStatusFilterChange = (value: LeadStatus | "all") => {
    setStatusFilter(value);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleQualifyLead = (response: QuestionnaireResponse) => {
    const leadData = {
      contactName: response.name || "",
      email: response.email || "",
      phoneNumber: response.phone || "",
      carBrand: response.car_brand || "",
      carModel: response.car_model || "",
      location: response.location || "",
    };

    localStorage.setItem("prefill_lead_data", JSON.stringify(leadData));
    navigate("/");
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
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{response.name || "No Name"}</CardTitle>
                      <p className="text-sm text-muted-foreground">{new Date(response.created_at).toLocaleString()}</p>
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
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-4 gap-3 mb-3">
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
                    <div>
                      <p className="text-sm font-semibold">Car</p>
                      <p className="text-sm text-muted-foreground">
                        {response.car_brand} {response.car_model || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Annual KM</p>
                      <p className="text-sm text-muted-foreground">{response.km_per_year?.toLocaleString() || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Phases</p>
                      <p className="text-sm text-muted-foreground">{response.phases || "N/A"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
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
