import { Link } from "react-router";
import { ArrowLeft, Minus, Plus, ShoppingBasket, Trash2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { useCart } from "../../contexts/CartContext";
import { formatCurrency } from "../../lib/format";

export default function CartPage() {
  const { items, updateQuantity, removeItem, total, itemCount } = useCart();

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
          <ArrowLeft size={16} /> Continue shopping
        </Link>

        <h1
          className="text-3xl font-bold mb-8"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Your Basket
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBasket size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
            <h2 className="text-xl font-semibold mb-2">Your basket is empty</h2>
            <p className="text-muted-foreground mb-6">
              Looks like you haven't added anything yet.
            </p>
            <Link to="/products">
              <Button style={{ background: "#e8631a", color: "#fff" }}>
                Start shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8 items-start">
            <div className="md:col-span-2 space-y-4">
              {items.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="flex gap-4 p-4 rounded-2xl border bg-card"
                >
                  <Link
                    to={`/products/${product.id}`}
                    className="w-24 h-24 rounded-xl overflow-hidden bg-muted flex-shrink-0"
                  >
                    <img
                      src={
                        product.image_url ||
                        `https://placehold.co/200x200/1e381e/f2ece0?text=${encodeURIComponent(product.name)}`
                      }
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link to={`/products/${product.id}`}>
                      <h3 className="font-semibold hover:underline truncate" style={{ fontFamily: "'Playfair Display', serif" }}>
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-sm text-muted-foreground mb-2">
                      {formatCurrency(product.price)} each
                    </p>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center border rounded-lg">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                        >
                          <Minus size={14} />
                        </Button>
                        <span className="w-8 text-center text-sm">{quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            updateQuantity(product.id, quantity + 1)
                          }
                        >
                          <Plus size={14} />
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => removeItem(product.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold">
                      {formatCurrency(product.price * quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border bg-card p-6 sticky top-24">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              <div className="flex justify-between mb-2 text-sm">
                <span className="text-muted-foreground">Items</span>
                <span>{itemCount}</span>
              </div>
              <div className="flex justify-between mb-6 text-lg font-semibold">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <Link to="/checkout">
                <Button
                  className="w-full"
                  size="lg"
                  style={{ background: "#e8631a", color: "#fff" }}
                >
                  Proceed to Checkout
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
