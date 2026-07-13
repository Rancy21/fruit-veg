import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, Eye, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { adminCancelOrder, getAllOrders } from "../../api/orders";
import { formatCurrency, formatDate } from "../../lib/format";
import type { OrderResponse } from "../../types/api";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    try {
      const data = await getAllOrders();
      setOrders(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCancel(orderId: number) {
    setCancellingId(orderId);
    try {
      await adminCancelOrder(orderId);
      toast.success("Order cancelled");
      await load();
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
          <div className="flex items-center gap-4">
            <Link to="/admin/products" className="text-sm text-muted-foreground hover:text-foreground">
              Admin Products
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
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
          Admin — Orders
        </h1>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            No orders found.
          </div>
        ) : (
          <div className="rounded-2xl border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell>{order.user_name}</TableCell>
                    <TableCell>{formatCurrency(order.total_price)}</TableCell>
                    <TableCell>
                      <span
                        className="px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase"
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
                        }}
                      >
                        {order.status}
                      </span>
                    </TableCell>
                    <TableCell>{formatDate(order.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <Link to={`/admin/orders/${order.id}`}>
                        <Button variant="ghost" size="icon">
                          <Eye size={16} />
                        </Button>
                      </Link>
                      {order.status === "PENDING" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleCancel(order.id)}
                          disabled={cancellingId === order.id}
                        >
                          <X size={16} />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
    </div>
  );
}
