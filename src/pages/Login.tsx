import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: 'Hiba',
        description: 'Kérjük töltse ki az összes mezőt',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await signIn(email, password);

      if (error) {
        toast({
          title: 'Bejelentkezési hiba',
          description: error.message === 'Invalid login credentials' 
            ? 'Hibás email vagy jelszó' 
            : error.message,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Sikeres bejelentkezés',
        description: 'Üdvözöljük!',
      });

      navigate('/');
    } catch (error) {
      toast({
        title: 'Hiba történt',
        description: 'Próbálja újra később',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <img 
              src="/images/evionor-logo-new.png" 
              alt="Evionor" 
              className="h-12"
            />
          </div>
          <CardTitle className="text-2xl text-center">Admin bejelentkezés</CardTitle>
          <CardDescription className="text-center">
            Jelentkezzen be az admin fiókjával
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="pelda@evionor.hu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Jelszó</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Bejelentkezés...' : 'Bejelentkezés'}
            </Button>
          </form>
          <p className="text-sm text-muted-foreground text-center mt-4">
            Csak adminisztrátorok számára elérhető
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
