import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Leaf } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useAuth } from "../../contexts/AuthContext";

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    full_name: "",
    phone_number: "",
    location: "",
    password: "",
    confirmPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  function updateField(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        username: form.username,
        email: form.email,
        full_name: form.full_name,
        phone_number: form.phone_number || undefined,
        location: form.location || undefined,
        password: form.password,
      });
      navigate("/");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-background">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Leaf className="text-accent" size={28} />
          <span
            className="text-2xl font-semibold tracking-tight"
            style={{ fontFamily: "'Playfair Display', serif", color: "#f2ece0" }}
          >
            Verdura
          </span>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Create an account</CardTitle>
            <CardDescription>Join Verdura and start shopping fresh</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full name</Label>
                <Input
                  id="full_name"
                  value={form.full_name}
                  onChange={(e) => updateField("full_name", e.target.value)}
                  placeholder="Jane Doe"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={form.username}
                  onChange={(e) => updateField("username", e.target.value)}
                  placeholder="jane_doe"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="jane@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone_number">Phone number</Label>
                <Input
                  id="phone_number"
                  type="tel"
                  value={form.phone_number}
                  onChange={(e) => updateField("phone_number", e.target.value)}
                  placeholder="+1 555 123 4567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={form.location}
                  onChange={(e) => updateField("location", e.target.value)}
                  placeholder="New York, NY"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  placeholder="Create a password"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => updateField("confirmPassword", e.target.value)}
                  placeholder="Confirm your password"
                  required
                />
                {form.password !== form.confirmPassword && form.confirmPassword && (
                  <p className="text-xs text-destructive">Passwords do not match</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || form.password !== form.confirmPassword}
                style={{ background: "#e8631a", color: "#fff" }}
              >
                {isSubmitting ? "Creating account..." : "Create account"}
              </Button>
            </form>

            <p className="mt-4 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
