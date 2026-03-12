import { useNavigate } from "react-router-dom";
import { QuestionnaireForm } from "@/components/questionnaire/QuestionnaireForm";
import { Button } from "@/components/ui/button";
import { Users, LogOut, Building2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-4 right-4 z-50 flex gap-2 items-center">
        <span className="text-sm text-muted-foreground">{user?.email}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/b2b-leads')}
          className="flex items-center gap-2"
        >
          <Building2 className="h-4 w-4" />
          B2B Leads
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/leads')}
          className="flex items-center gap-2"
        >
          <Users className="h-4 w-4" />
          Lead Manager
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={signOut}
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Kijelentkezés
        </Button>
      </div>
      <QuestionnaireForm />
    </div>
  );
};

export default Index;
