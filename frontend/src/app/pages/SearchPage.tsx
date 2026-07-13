import { useState } from "react";
import { Link } from "react-router";
import { Search as SearchIcon, ShoppingBasket, Sparkles, Plus } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Skeleton } from "../components/ui/skeleton";
import { useCart } from "../../contexts/CartContext";
import { formatCurrency } from "../../lib/format";
import { aiSearch } from "../../api/search";
import type { Product } from "../../types/api";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchedQuery, setSearchedQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const { addItem, itemCount } = useCart();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    setLoading(true);
    setHasSearched(true);
    setSearchedQuery(trimmed);
    try {
      const response = await aiSearch(trimmed);
      setResults(response.results);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
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

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider mb-4"
            style={{ background: "rgba(240,192,64,0.15)", color: "#f0c040", border: "1px solid rgba(240,192,64,0.3)" }}
          >
            <Sparkles size={12} />
            AI-Powered
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            What are you craving?
          </h1>
          <p className="text-muted-foreground">
            Describe what you want in plain language. We'll find the perfect match.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2 mb-10">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. something sweet and healthy for breakfast"
              className="pl-9 h-12"
            />
          </div>
          <Button
            type="submit"
            size="lg"
            disabled={loading || !query.trim()}
            style={{ background: "#e8631a", color: "#fff" }}
          >
            {loading ? "Searching..." : "Search"}
          </Button>
        </form>

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-2xl" />
            ))}
          </div>
        )}

        {/* Empty before search */}
        {!loading && !hasSearched && (
          <div className="text-center py-20 text-muted-foreground">
            <SearchIcon size={32} className="mx-auto mb-3 opacity-50" />
            <p>Try "vitamin C rich fruits" or "vegetables for a stir fry"</p>
          </div>
        )}

        {/* Empty after search */}
        {!loading && hasSearched && results.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground mb-2">
              No products matched "{searchedQuery}"
            </p>
            <Link to="/products">
              <Button variant="outline">Browse all products</Button>
            </Link>
          </div>
        )}

        {/* Results */}
        {!loading && results.length > 0 && (
          <>
            <div className="mb-4 text-sm text-muted-foreground">
              Showing {results.length} result{results.length !== 1 ? "s" : ""} for "{searchedQuery}"
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {results.map((product) => (
                <div
                  key={product.id}
                  className="group rounded-2xl overflow-hidden border bg-card transition-all hover:-translate-y-1"
                >
                  <Link to={`/products/${product.id}`}>
                    <div
                      className="relative overflow-hidden bg-muted"
                      style={{ height: 200 }}
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
                    <Link to={`/products/${product.id}`}>
                      <h3 className="font-semibold hover:underline mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold">{formatCurrency(product.price)}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addItem(product)}
                        disabled={product.stock <= 0}
                      >
                        <Plus size={14} />
                        {product.stock > 0 ? "Add" : "Out"}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
