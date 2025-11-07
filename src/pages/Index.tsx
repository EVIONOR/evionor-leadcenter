import { useState, useEffect } from "react";
import { QuestionnaireForm } from "@/components/questionnaire/QuestionnaireForm";
import { PasswordProtection } from "@/components/PasswordProtection";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const authenticated = localStorage.getItem("app_authenticated") === "true";
    setIsAuthenticated(authenticated);
  }, []);

  if (!isAuthenticated) {
    return <PasswordProtection onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <QuestionnaireForm />
    </div>
  );
};

export default Index;
