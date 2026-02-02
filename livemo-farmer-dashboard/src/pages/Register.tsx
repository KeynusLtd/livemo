import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { register } from "@/lib/authApi";
import { useAuthStore } from "@/stores/authStore";

export default function Register() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const setSession = useAuthStore((s) => s.setSession);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== passwordConfirmation) {
      toast({
        variant: "destructive",
        title: "Passwords do not match",
        description: "Please confirm your password correctly.",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await register({
        name,
        email,
        phone: phone.length > 0 ? phone : undefined,
        password,
        password_confirmation: passwordConfirmation,
      });
      setSession({ user: res.user, accessToken: res.access_token });
      navigate("/", { replace: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registration failed";
      toast({ variant: "destructive", title: "Registration failed", description: message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" required />
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              autoComplete="email"
              required
            />
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone (optional)" />
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete="new-password"
              required
            />
            <Input
              type="password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              placeholder="Confirm password"
              autoComplete="new-password"
              required
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating..." : "Create account"}
            </Button>
            <div className="text-sm text-muted-foreground">
              Already have an account? <Link to="/login" className="underline">Sign in</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
