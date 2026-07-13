import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Skeleton } from "../components/ui/skeleton";
import { Textarea } from "../components/ui/textarea";
import { getProductById, updateProduct } from "../../api/products";
import type { ProductCreate } from "../../types/api";

const INITIAL_FORM: ProductCreate = {
  name: "",
  category: "",
  description: "",
  price: 0,
  stock: 0,
  calories: undefined,
  carbs: undefined,
  sugar: undefined,
  protein: undefined,
  fat: undefined,
  image_url: "",
};

export default function AdminProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState<ProductCreate>(INITIAL_FORM);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      if (!id) return;
      setLoading(true);
      try {
        const product = await getProductById(id);
        setForm({
          name: product.name,
          category: product.category,
          description: product.description,
          price: product.price,
          stock: product.stock,
          calories: product.calories,
          carbs: product.carbs,
          sugar: product.sugar,
          protein: product.protein,
          fat: product.fat,
          image_url: product.image_url ?? "",
        });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  function updateField<K extends keyof ProductCreate>(
    field: K,
    value: ProductCreate[K]
  ) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateNumber(field: keyof ProductCreate, value: string) {
    const num = value === "" ? undefined : parseFloat(value);
    setForm((prev) => ({ ...prev, [field]: num }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!id || !form.name || !form.category || form.price <= 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateProduct(id, form);
      toast.success("Product updated successfully");
      navigate("/admin/products");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-2xl mx-auto space-y-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-3/4" />
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 rounded-xl" />
          ))}
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
            <Link to="/admin/products" className="text-sm text-muted-foreground hover:text-foreground">
              Admin Products
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <Link
          to="/admin/products"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft size={16} /> Back to admin products
        </Link>

        <h1
          className="text-3xl font-bold mb-8"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Edit Product
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="Alphonso Mangoes"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Input
                id="category"
                value={form.category}
                onChange={(e) => updateField("category", e.target.value)}
                placeholder="Fruits"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Sweet, aromatic mangoes from Ratnagiri..."
              rows={4}
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (USD) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => updateNumber("price", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Stock *</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => updateNumber("stock", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="calories">Calories</Label>
              <Input
                id="calories"
                type="number"
                step="0.01"
                min="0"
                value={form.calories ?? ""}
                onChange={(e) => updateNumber("calories", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="carbs">Carbs (g)</Label>
              <Input
                id="carbs"
                type="number"
                step="0.01"
                min="0"
                value={form.carbs ?? ""}
                onChange={(e) => updateNumber("carbs", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sugar">Sugar (g)</Label>
              <Input
                id="sugar"
                type="number"
                step="0.01"
                min="0"
                value={form.sugar ?? ""}
                onChange={(e) => updateNumber("sugar", e.target.value)}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="protein">Protein (g)</Label>
              <Input
                id="protein"
                type="number"
                step="0.01"
                min="0"
                value={form.protein ?? ""}
                onChange={(e) => updateNumber("protein", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fat">Fat (g)</Label>
              <Input
                id="fat"
                type="number"
                step="0.01"
                min="0"
                value={form.fat ?? ""}
                onChange={(e) => updateNumber("fat", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_url">Image URL</Label>
              <Input
                id="image_url"
                type="url"
                value={form.image_url}
                onChange={(e) => updateField("image_url", e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isSubmitting}
            style={{ background: "#e8631a", color: "#fff" }}
          >
            {isSubmitting ? "Updating..." : "Update Product"}
          </Button>
        </form>
      </main>
    </div>
  );
}
