import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, ShoppingBasket } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import { createOrder } from "../../api/orders";
import { formatCurrency } from "../../lib/format";
import type { OrderItemCreate } from "../../types/api";

export default function CheckoutPage() {
  const { items, total, itemCount, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handlePlaceOrder() {
    if (items.length === 0) return;

    setIsSubmitting(true);
    try {
      const orderItems: OrderItemCreate[] = items.map((item) => ({
        order_id: 0,
        product_id: item.product.id,
        price_at_purchase: item.product.price.toFixed(2),
        quantity: item.quantity.toString(),
      }));

      await createOrder(orderItems);
      clearCart();
      toast.success("Order placed successfully!");
      navigate("/orders");
    } catch {
      // Error toast handled by axios interceptor
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <ShoppingBasket size={48} className="mb-4 text-muted-foreground opacity-50" />
        <h1 className="text-2xl font-bold mb-2">Please sign in</h1>
        <p className="text-muted-foreground mb-6">
          You need to be logged in to complete your order.
        </p>
        <Link to="/login">
          <Button style={{ background: "#e8631a", color: "#fff" }}>Sign in</Button>
        </Link>
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
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <Link
          to="/cart"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft size={16} /> Back to basket
        </Link>

        <h1
          className="text-3xl font-bold mb-8"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Checkout
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-xl font-semibold mb-2">Your basket is empty</h2>
            <p className="text-muted-foreground mb-6">
              Add some products before checking out.
            </p>
            <Link to="/products">
              <Button style={{ background: "#e8631a", color: "#fff" }}>
                Browse products
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8 items-start">
            <div className="md:col-span-2 space-y-4">
              {items.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-4 rounded-2xl border bg-card"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={
                        product.image_url ||
                        `https://placehold.co/80x80/1e381e/f2ece0?text=${encodeURIComponent(product.name)}`
                      }
                      alt={product.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div>
                      <h3 className="font-semibold" style={{ fontFamily: "'Playfair Display', serif" }}>
                        {product.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(product.price)} × {quantity}
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold">
                    {formatCurrency(product.price * quantity)}
                  </p>
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
              <Button
                className="w-full"
                size="lg"
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                style={{ background: "#e8631a", color: "#fff" }}
              >
                {isSubmitting ? "Placing order..." : "Place Order"}
              </Button>
              <p className="text-xs text-muted-foreground mt-4 text-center">
                Payment on delivery. Your order will start as PENDING.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
