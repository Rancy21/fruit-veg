import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, Eye, ShoppingBasket, X } from "lucide-react";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { getMyOrders, cancelOrder } from "../../api/orders";
import { formatCurrency, formatDate } from "../../lib/format";
import type { OrderResponse } from "../../types/api";

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  async function loadOrders() {
    setLoading(true);
    try {
      const data = await getMyOrders();
      setOrders(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function handleCancel(orderId: number) {
    setCancellingId(orderId);
    try {
      await cancelOrder(orderId);
      await loadOrders();
    } finally {
      setCancellingId(null);
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
          <Link to="/cart" className="relative">
            <ShoppingBasket size={20} />
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft size={16} /> Back to home
        </Link>

        <h1
          className="text-3xl font-bold mb-8"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          My Orders
        </h1>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBasket size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
            <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
            <p className="text-muted-foreground mb-6">
              Start shopping and your orders will appear here.
            </p>
            <Link to="/products">
              <Button style={{ background: "#e8631a", color: "#fff" }}>
                Browse products
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border bg-card p-5"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span
                        className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide"
                        style={{
                          background:
                            order.status === "COMPLETED"
                              ? "rgba(138,171,138,0.15)"
                              : order.status === "CANCELLED"
                              ? "rgba(220,38,38,0.15)"
                              : "rgba(240,192,64,0.15)",
                          color:
                            order.status === "COMPLETED"
                              ? "#8aab8a"
                              : order.status === "CANCELLED"
                              ? "#dc2626"
                              : "#f0c040",
                          border: `1px solid ${
                            order.status === "COMPLETED"
                              ? "rgba(138,171,138,0.3)"
                              : order.status === "CANCELLED"
                              ? "rgba(220,38,38,0.3)"
                              : "rgba(240,192,64,0.3)"
                          }`,
                        }}
                      >
                        {order.status}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(order.created_at)}
                      </span>
                    </div>
                    <p className="font-semibold text-lg">
                      {formatCurrency(order.total_price)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Ordered by {order.user_name}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link to={`/orders/${order.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye size={14} className="mr-1" /> Details
                      </Button>
                    </Link>
                    {order.status === "PENDING" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => handleCancel(order.id)}
                        disabled={cancellingId === order.id}
                      >
                        <X size={14} className="mr-1" />
                        {cancellingId === order.id
                          ? "Cancelling..."
                          : "Cancel"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
