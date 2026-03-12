import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getB2BQuestionnaireResponses } from "@/integrations/evionor/client";
import type { B2BQuestionnaireResponse } from "@/integrations/evionor/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

export default function B2BLeadManager() {
  const [responses, setResponses] = useState<B2BQuestionnaireResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLead, setSelectedLead] = useState<B2BQuestionnaireResponse | null>(null);
  const itemsPerPage = 15;
  const navigate = useNavigate();
  const { toast } = useToast();

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const fetchResponses = async () => {
    setLoading(true);
    try {
      const offset = (currentPage - 1) * itemsPerPage;
      const result = await getB2BQuestionnaireResponses({
        limit: itemsPerPage,
        offset,
      });

      if (!result?.data) throw new Error("No data received");
      setResponses(result.data);
      setTotalCount(result.count || 0);
    } catch (error) {
      console.error("Error fetching B2B responses:", error);
      toast({
        title: "Hiba",
        description: "Nem sikerült lekérni a B2B leadeket",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResponses();
  }, [currentPage]);

  if (selectedLead) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-6">
          <B2BQualifyForm
            lead={selectedLead}
            onBack={() => setSelectedLead(null)}
            onSaved={() => {
              setSelectedLead(null);
              fetchResponses();
            }}
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
              <p className="text-xs text-muted-foreground">{totalCount} B2B lead</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        {/* Lead cards */}
        <div className="space-y-3">
          {responses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">Nincs B2B lead</p>
              <p className="text-xs text-muted-foreground mt-1">Még nincsenek B2B érdeklődők.</p>
            </div>
          ) : (
            responses.map((response) => (
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
                    <div className="flex-1 p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="flex items-start gap-2">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                        <span className="text-xs text-muted-foreground truncate">{response.email || "N/A"}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                        <span className="text-xs text-muted-foreground">{response.phone || "N/A"}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                        <span className="text-xs text-muted-foreground">{response.location || "N/A"}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                        <span className="text-xs text-muted-foreground">{response.timeline || "N/A"}</span>
                      </div>
                    </div>

                    {/* Right: Stats + Action */}
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
            ))
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
