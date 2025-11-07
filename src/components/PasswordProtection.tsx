import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface PasswordProtectionProps {
  onAuthenticated: () => void;
}

// A jelszót itt lehet megváltoztatni
const CORRECT_PASSWORD = "evionor_2022";

export const PasswordProtection = ({ onAuthenticated }: PasswordProtectionProps) => {
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === CORRECT_PASSWORD) {
      localStorage.setItem("app_authenticated", "true");
      onAuthenticated();
      toast.success("Sikeres bejelentkezés!");
    } else {
      toast.error("Hibás jelszó!");
      setPassword("");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="/images/evionor-logo-new.png" 
              alt="Evionor" 
              className="h-12"
            />
          </div>
          <CardTitle>Jelszóval védett oldal</CardTitle>
          <CardDescription>
            Kérjük, adja meg a jelszót a folytatáshoz
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="password"
              placeholder="Jelszó"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
            <Button type="submit" className="w-full">
              Belépés
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
