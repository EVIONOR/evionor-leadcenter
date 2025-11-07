import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { QuestionnaireForm } from "@/components/questionnaire/QuestionnaireForm";
import { PasswordProtection } from "@/components/PasswordProtection";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const authenticated = localStorage.getItem("app_authenticated") === "true";
    setIsAuthenticated(authenticated);
  }, []);

  if (!isAuthenticated) {
    return <PasswordProtection onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/leads')}
          className="flex items-center gap-2"
        >
          <Users className="h-4 w-4" />
          Lead Manager
        </Button>
      </div>
      <QuestionnaireForm />
    </div>
  );
};

export default Index;
