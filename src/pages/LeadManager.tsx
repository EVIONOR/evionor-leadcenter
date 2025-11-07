import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
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

interface Lead {
  id: string;
  contact_name: string | null;
  email: string | null;
  phone_number: string | null;
  car_brand: string | null;
  car_model: string | null;
  zip_code: string | null;
  city: string | null;
  status: string;
  raw_data: any;
  created_at: string;
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
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast({
        title: "Error",
        description: "Failed to fetch leads",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status: newStatus })
        .eq('id', leadId);

      if (error) throw error;

      setLeads(leads.map(lead => 
        lead.id === leadId ? { ...lead, status: newStatus } : lead
      ));

      toast({
        title: "Success",
        description: `Lead status updated to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating lead:', error);
      toast({
        title: "Error",
        description: "Failed to update lead status",
        variant: "destructive",
      });
    }
  };

  const handleQualifyLead = (lead: Lead) => {
    const leadData = {
      contactName: lead.contact_name || '',
      email: lead.email || '',
      phoneNumber: lead.phone_number || '',
      carBrand: lead.car_brand || '',
      carModel: lead.car_model || '',
      zipCode: lead.zip_code || '',
      city: lead.city || '',
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
                  No leads found. Configure Make.com to send data to: <br />
                  <code className="mt-2 inline-block bg-muted px-2 py-1 rounded">
                    {window.location.origin}/functions/v1/receive-lead
                  </code>
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
                        {lead.contact_name || 'No Name'}
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
                      <p className="text-sm text-muted-foreground">{lead.phone_number || 'N/A'}</p>
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
                        {lead.zip_code} {lead.city || 'N/A'}
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