import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getQuestionnaireResponses } from "@/integrations/evionor/client";
import type { QuestionnaireResponse } from "@/integrations/evionor/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Lead extends QuestionnaireResponse {
  status: string;
}

export default function LeadManager() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const result = await getQuestionnaireResponses();
      
      if (!result?.data) {
        throw new Error('No data received');
      }

      // Map questionnaire responses to leads with default status
      const leadsWithStatus = result.data.map((response: QuestionnaireResponse) => ({
        ...response,
        status: 'new' // Default status since EVIONOR DB doesn't have status field
      }));

      setLeads(leadsWithStatus);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast({
        title: "Error",
        description: "Failed to fetch leads from EVIONOR database",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    // Note: Status updates are client-side only since EVIONOR DB is read-only
    setLeads(leads.map(lead => 
      lead.id === leadId ? { ...lead, status: newStatus } : lead
    ));

    toast({
      title: "Success",
      description: `Lead status updated to ${newStatus} (local only)`,
    });
  };

  const handleQualifyLead = (lead: Lead) => {
    const leadData = {
      contactName: lead.name || '',
      email: lead.email || '',
      phoneNumber: lead.phone || '',
      carBrand: lead.car_brand || '',
      carModel: lead.car_model || '',
      location: lead.location || '',
    };
    
    localStorage.setItem('prefill_lead_data', JSON.stringify(leadData));
    updateLeadStatus(lead.id, 'qualified');
    navigate('/');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-500';
      case 'in_progress': return 'bg-yellow-500';
      case 'hold': return 'bg-orange-500';
      case 'qualified': return 'bg-green-500';
      case 'waste': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredLeads = filter === 'all' 
    ? leads 
    : leads.filter(lead => lead.status === filter);

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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Questionnaire
            </Button>
            <h1 className="text-3xl font-bold">Lead Manager</h1>
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Leads</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="hold">Hold</SelectItem>
              <SelectItem value="qualified">Qualified</SelectItem>
              <SelectItem value="waste">Waste</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4">
          {filteredLeads.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  No questionnaire responses found in EVIONOR database.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredLeads.map((lead) => (
              <Card key={lead.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {lead.name || 'No Name'}
                      <Badge className={getStatusColor(lead.status)}>
                        {lead.status}
                      </Badge>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(lead.created_at).toLocaleString()}
                    </p>
                  </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-semibold">Email</p>
                      <p className="text-sm text-muted-foreground">{lead.email || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Phone</p>
                      <p className="text-sm text-muted-foreground">{lead.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Car</p>
                      <p className="text-sm text-muted-foreground">
                        {lead.car_brand} {lead.car_model || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Location</p>
                      <p className="text-sm text-muted-foreground">
                        {lead.location || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {lead.status !== 'waste' && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => updateLeadStatus(lead.id, 'waste')}
                      >
                        Mark as Waste
                      </Button>
                    )}
                    {lead.status !== 'in_progress' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateLeadStatus(lead.id, 'in_progress')}
                      >
                        In Progress
                      </Button>
                    )}
                    {lead.status !== 'hold' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateLeadStatus(lead.id, 'hold')}
                      >
                        Hold
                      </Button>
                    )}
                    {lead.status !== 'qualified' && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleQualifyLead(lead)}
                      >
                        Qualify & Fill Form
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}