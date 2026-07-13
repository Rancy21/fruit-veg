import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Plus, Search, ShoppingBasket, Star } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Skeleton } from "../components/ui/skeleton";
import { useCart } from "../../contexts/CartContext";
import { formatCurrency } from "../../lib/format";
import { getProducts, getProductsByCategory } from "../../api/products";
import type { Product } from "../../types/api";

const CATEGORIES = ["All", "fruit", "vegetable", "legume"];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [skip, setSkip] = useState(0);
  const limit = 12;
  const { addItem, itemCount } = useCart();

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data =
          category === "All"
            ? await getProducts(skip, limit)
            : await getProductsByCategory(category, skip, limit);
        setProducts(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [category, skip]);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <span
              className="text-xl font-semibold tracking-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Verdura
            </span>
          </Link>

          <div className="relative hidden md:block flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search produce..."
              className="pl-9"
            />
          </div>

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

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1
            className="text-3xl font-bold mb-2"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Market Picks
          </h1>
          <p className="text-muted-foreground">Fresh produce from partner farms</p>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat}
              variant={category === cat ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setCategory(cat);
                setSkip(0);
              }}
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-2xl" />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            No products found.
          </div>
        )}

        {/* Product grid */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((product) => (
              <div
                key={product.id}
                className="group rounded-2xl overflow-hidden border bg-card transition-all hover:-translate-y-1"
              >
                <Link to={`/products/${product.id}`}>
                  <div
                    className="relative overflow-hidden bg-muted"
                    style={{ height: 220 }}
                  >
                    <img
                      src={
                        product.image_url ||
                        `https://placehold.co/600x600/1e381e/f2ece0?text=${encodeURIComponent(product.name)}`
                      }
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-primary/15 text-primary border border-primary/25">
                      {product.category}
                    </span>
                  </div>
                </Link>

                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <Link to={`/products/${product.id}`}>
                      <h3
                        className="font-semibold hover:underline"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                      >
                        {product.name}
                      </h3>
                    </Link>
                    <span className="font-bold">
                      {formatCurrency(product.price)}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {product.description}
                  </p>

                  <div className="flex items-center gap-1 mb-4">
                    <Star size={12} fill="currentColor" className="text-yellow-500" />
                    <span className="text-xs font-medium">4.8</span>
                    <span className="text-xs text-muted-foreground">(120)</span>
                  </div>

                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => addItem(product)}
                    disabled={product.stock <= 0}
                  >
                    <Plus size={16} />
                    {product.stock > 0 ? "Add to Basket" : "Out of Stock"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && products.length === limit && (
          <div className="flex justify-center gap-4 mt-10">
            <Button
              variant="outline"
              onClick={() => setSkip((s) => Math.max(0, s - limit))}
              disabled={skip === 0}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => setSkip((s) => s + limit)}
            >
              Next
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
