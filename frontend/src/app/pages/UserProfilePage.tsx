import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, ShoppingBasket, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";
import { Skeleton } from "../components/ui/skeleton";
import { useAuth } from "../../contexts/AuthContext";
import { changePassword, getMe, updateMe } from "../../api/auth";

export default function UserProfilePage() {
  const { user, isLoading: authLoading, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [form, setForm] = useState({
    username: "",
    email: "",
    full_name: "",
    phone_number: "",
    location: "",
  });

  const [passwords, setPasswords] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const me = await getMe();
        setForm({
          username: me.username,
          email: me.email ?? "",
          full_name: me.full_name ?? "",
          phone_number: me.phone_number ?? "",
          location: me.location ?? "",
        });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function updateField(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function updatePasswordField(field: keyof typeof passwords, value: string) {
    setPasswords((prev) => ({ ...prev, [field]: value }));
  }

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateMe({
        username: form.username,
        email: form.email || undefined,
        full_name: form.full_name || undefined,
        phone_number: form.phone_number || undefined,
        location: form.location || undefined,
      });
      toast.success("Profile updated successfully");
      window.location.reload();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (passwords.new_password !== passwords.confirm_password) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwords.new_password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword({
        current_password: passwords.current_password,
        new_password: passwords.new_password,
      });
      toast.success("Password changed successfully. Please sign in again.");
      logout();
    } finally {
      setIsChangingPassword(false);
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-2xl mx-auto space-y-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-semibold" style={{ fontFamily: "'Playfair Display', serif" }}>
            Verdura
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/cart" className="relative">
              <ShoppingBasket size={20} />
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft size={16} /> Back to home
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-primary/15 text-primary">
            <User size={24} />
          </div>
          <div>
            <h1
              className="text-3xl font-bold"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Profile
            </h1>
            <p className="text-muted-foreground text-sm">
              Manage your account and password
            </p>
          </div>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>
              Update your personal details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={form.username}
                  onChange={(e) => updateField("username", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="full_name">Full name</Label>
                <Input
                  id="full_name"
                  value={form.full_name}
                  onChange={(e) => updateField("full_name", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone_number">Phone number</Label>
                <Input
                  id="phone_number"
                  type="tel"
                  value={form.phone_number}
                  onChange={(e) => updateField("phone_number", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={form.location}
                  onChange={(e) => updateField("location", e.target.value)}
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                style={{ background: "#e8631a", color: "#fff" }}
              >
                {isSubmitting ? "Saving..." : "Save changes"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Separator className="my-8" />

        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
              You will be signed out after changing your password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current_password">Current password</Label>
                <Input
                  id="current_password"
                  type="password"
                  value={passwords.current_password}
                  onChange={(e) => updatePasswordField("current_password", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new_password">New password</Label>
                <Input
                  id="new_password"
                  type="password"
                  value={passwords.new_password}
                  onChange={(e) => updatePasswordField("new_password", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirm new password</Label>
                <Input
                  id="confirm_password"
                  type="password"
                  value={passwords.confirm_password}
                  onChange={(e) => updatePasswordField("confirm_password", e.target.value)}
                  required
                />
                {passwords.new_password !== passwords.confirm_password &&
                  passwords.confirm_password && (
                    <p className="text-xs text-destructive">Passwords do not match</p>
                  )}
              </div>

              <Button
                type="submit"
                disabled={
                  isChangingPassword ||
                  passwords.new_password !== passwords.confirm_password ||
                  passwords.new_password.length < 6
                }
              >
                {isChangingPassword ? "Changing..." : "Change password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
