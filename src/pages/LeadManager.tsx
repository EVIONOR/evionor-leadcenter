import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getQuestionnaireResponses, updateQuestionnaireStatus } from "@/integrations/evionor/client";
import type { QuestionnaireResponse, LeadStatus } from "@/integrations/evionor/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft } from "lucide-react";

const statusOptions: { value: LeadStatus; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'converted', label: 'Converted' },
  { value: 'rejected', label: 'Rejected' },
];

export default function LeadManager() {
  const [responses, setResponses] = useState<QuestionnaireResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchResponses();
  }, []);

  const fetchResponses = async () => {
    try {
      const result = await getQuestionnaireResponses();
      console.log(result);

      if (!result?.data) {
        throw new Error("No data received");
      }

      setResponses(result.data);
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
      
      setResponses(prev => 
        prev.map(r => r.id === id ? { ...r, status: newStatus } : r)
      );
      
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

  const filteredResponses = statusFilter === 'all' 
    ? responses 
    : responses.filter(r => r.status === statusFilter);

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
          
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as LeadStatus | 'all')}>
            <SelectTrigger className="w-[180px] bg-background">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-background z-50">
              <SelectItem value="all">All Statuses</SelectItem>
              {statusOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4">
          {filteredResponses.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  {statusFilter === 'all' 
                    ? 'No questionnaire responses found in EVIONOR database.'
                    : `No responses with status "${statusFilter}".`
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredResponses.map((response) => (
              <Card key={response.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{response.name || "No Name"}</CardTitle>
                      <p className="text-sm text-muted-foreground">{new Date(response.created_at).toLocaleString()}</p>
                    </div>
                    <Select 
                      value={response.status} 
                      onValueChange={(value) => handleStatusChange(response.id, value as LeadStatus)}
                    >
                      <SelectTrigger className="w-[140px] bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background z-50">
                        {statusOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-semibold">Email</p>
                      <p className="text-sm text-muted-foreground">{response.email || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Phone</p>
                      <p className="text-sm text-muted-foreground">{response.phone || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Car</p>
                      <p className="text-sm text-muted-foreground">
                        {response.car_brand} {response.car_model || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Location</p>
                      <p className="text-sm text-muted-foreground">{response.location || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Annual KM</p>
                      <p className="text-sm text-muted-foreground">{response.km_per_year?.toLocaleString() || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Phases</p>
                      <p className="text-sm text-muted-foreground">{response.phases || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Timeline</p>
                      <p className="text-sm text-muted-foreground">{response.timeline || "N/A"}</p>
                    </div>
                  </div>

                  <Button variant="default" size="sm" onClick={() => handleQualifyLead(response)}>
                    Fill Form with This Data
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
