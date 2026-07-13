import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft, Minus, Plus, ShoppingBasket } from "lucide-react";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { useCart } from "../../contexts/CartContext";
import { formatCurrency } from "../../lib/format";
import { getProductById } from "../../api/products";
import type { Product } from "../../types/api";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addItem, itemCount } = useCart();

  useEffect(() => {
    async function load() {
      if (!id) return;
      setLoading(true);
      try {
        const data = await getProductById(id);
        setProduct(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="h-96 rounded-2xl" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-40" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold mb-2">Product not found</h1>
        <p className="text-muted-foreground mb-6">
          We couldn't find the product you're looking for.
        </p>
        <Link to="/products">
          <Button>Browse products</Button>
        </Link>
      </div>
    );
  }

  const nutrition = [
    { label: "Calories", value: product.calories },
    { label: "Carbs", value: product.carbs, unit: "g" },
    { label: "Sugar", value: product.sugar, unit: "g" },
    { label: "Protein", value: product.protein, unit: "g" },
    { label: "Fat", value: product.fat, unit: "g" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-semibold" style={{ fontFamily: "'Playfair Display', serif" }}>
            Verdura
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/orders" className="hidden md:block text-sm text-muted-foreground hover:text-foreground">
              Orders
            </Link>
            <Link to="/cart" className="relative">
              <ShoppingBasket size={20} />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full text-[10px] flex items-center justify-center bg-primary text-primary-foreground">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <Link
          to="/products"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft size={16} /> Back to products
        </Link>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div
            className="rounded-2xl overflow-hidden border bg-muted"
            style={{ minHeight: 360 }}
          >
            <img
              src={
                product.image_url ||
                `https://placehold.co/600x600/1e381e/f2ece0?text=${encodeURIComponent(product.name)}`
              }
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-primary/15 text-primary border border-primary/25 mb-3">
              {product.category}
            </span>
            <h1
              className="text-3xl font-bold mb-2"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {product.name}
            </h1>
            <p className="text-2xl font-semibold mb-4">
              {formatCurrency(product.price)}
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              {product.description}
            </p>

            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm text-muted-foreground">
                Stock: {product.stock > 0 ? product.stock : "Out of stock"}
              </span>
            </div>

            {product.stock > 0 && (
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  >
                    <Minus size={16} />
                  </Button>
                  <span className="w-10 text-center font-medium">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  >
                    <Plus size={16} />
                  </Button>
                </div>

                <Button
                  className="flex-1"
                  style={{ background: "#e8631a", color: "#fff" }}
                  onClick={() => addItem(product, quantity)}
                >
                  Add to Basket — {formatCurrency(product.price * quantity)}
                </Button>
              </div>
            )}

            {nutrition.some((n) => n.value !== undefined && n.value !== null) && (
              <div className="rounded-xl border p-4 mt-8">
                <h3 className="font-semibold mb-3">Nutrition per 100g</h3>
                <div className="grid grid-cols-3 gap-4">
                  {nutrition.map(
                    (item) =>
                      item.value !== undefined &&
                      item.value !== null && (
                        <div key={item.label} className="text-center p-2 rounded-lg bg-muted">
                          <div className="text-lg font-bold" style={{ color: "#f0c040" }}>
                            {item.value}
                            {item.unit && <span className="text-sm">{item.unit}</span>}
                          </div>
                          <div className="text-xs text-muted-foreground">{item.label}</div>
                        </div>
                      )
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
