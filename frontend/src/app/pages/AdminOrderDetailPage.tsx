import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { adminCancelOrder, adminGetOrder, adminGetOrderItems } from "../../api/orders";
import { formatCurrency, formatDate } from "../../lib/format";
import type { OrderItem, OrderResponse } from "../../types/api";

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const orderId = Number(id);
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  async function load() {
    if (Number.isNaN(orderId)) return;
    setLoading(true);
    try {
      const [orderData, itemsData] = await Promise.all([
        adminGetOrder(orderId),
        adminGetOrderItems(orderId),
      ]);
      setOrder(orderData);
      setItems(itemsData);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [orderId]);

  async function handleCancel() {
    if (!order) return;
    setActionLoading(true);
    try {
      await adminCancelOrder(order.id);
      toast.success("Order cancelled");
      await load();
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-10 w-1/2 mb-4" />
          <Skeleton className="h-6 w-1/4 mb-8" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl mb-3" />
          ))}
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold mb-2">Order not found</h1>
        <p className="text-muted-foreground mb-6">
          We couldn't find the order you're looking for.
        </p>
        <Link to="/admin/orders">
          <Button>Back to admin orders</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-semibold" style={{ fontFamily: "'Playfair Display', serif" }}>
            Verdura
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/admin/orders" className="text-sm text-muted-foreground hover:text-foreground">Orders</Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <Link
          to="/admin/orders"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft size={16} /> Back to admin orders
        </Link>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1
                className="text-3xl font-bold"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Order #{order.id}
              </h1>
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
                  border: `1px solid transparent`,
                }}
              >
                {order.status}
              </span>
            </div>
            <p className="text-muted-foreground">
              Placed on {formatDate(order.created_at)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Customer: {order.user_name}
            </p>
          </div>

          <div className="text-right">
            <p className="text-2xl font-bold">{formatCurrency(order.total_price)}</p>
            <p className="text-sm text-muted-foreground">{items.length} item(s)</p>
          </div>
        </div>

        {order.status === "PENDING" && (
          <div className="flex gap-2 mb-8">
            <Button
              variant="outline"
              className="flex-1 md:flex-none"
              onClick={handleCancel}
              disabled={actionLoading}
            >
              <X size={16} className="mr-1" /> Cancel Order
            </Button>
          </div>
        )}

        <div className="rounded-2xl border bg-card overflow-hidden">
          <div className="px-6 py-4 border-b bg-muted/50">
            <h2 className="font-semibold">Items</h2>
          </div>
          <div className="divide-y">
            {items.map((item) => (
              <div
                key={item.id}
                className="px-6 py-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium">{item.product_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(item.price_at_purchase)} × {item.quantity}
                  </p>
                </div>
                <p className="font-semibold">
                  {formatCurrency(
                    parseFloat(item.price_at_purchase) * parseFloat(item.quantity)
                  )}
                </p>
              </div>
            ))}
          </div>
          <div className="px-6 py-4 border-t bg-muted/50 flex justify-between items-center">
            <span className="font-medium">Total</span>
            <span className="text-xl font-bold">
              {formatCurrency(order.total_price)}
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}