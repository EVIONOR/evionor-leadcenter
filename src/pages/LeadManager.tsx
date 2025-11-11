import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getQuestionnaireResponses } from "@/integrations/evionor/client";
import type { QuestionnaireResponse } from "@/integrations/evionor/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft } from "lucide-react";

export default function LeadManager() {
  const [responses, setResponses] = useState<QuestionnaireResponse[]>([]);
  const [loading, setLoading] = useState(true);
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
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Questionnaire
          </Button>
          <h1 className="text-3xl font-bold">Questionnaire Responses</h1>
        </div>

        <div className="grid gap-4">
          {responses.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  No questionnaire responses found in EVIONOR database.
                </p>
              </CardContent>
            </Card>
          ) : (
            responses.map((response) => (
              <Card key={response.id}>
                <CardHeader>
                  <CardTitle>{response.name || "No Name"}</CardTitle>
                  <p className="text-sm text-muted-foreground">{new Date(response.created_at).toLocaleString()}</p>
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
