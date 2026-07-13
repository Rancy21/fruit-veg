import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react";
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
import { deleteProduct, getProducts } from "../../api/products";
import { formatCurrency } from "../../lib/format";
import type { Product } from "../../types/api";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const data = await getProducts(0, 100);
      setProducts(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await deleteProduct(id);
      toast.success("Product deleted");
      await load();
    } finally {
      setDeletingId(null);
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
            <Link to="/products" className="text-sm text-muted-foreground hover:text-foreground">
              Shop
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

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h1
            className="text-3xl font-bold"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Admin — Products
          </h1>
          <Link to="/admin/products/new">
            <Button style={{ background: "#e8631a", color: "#fff" }}>
              <Plus size={16} className="mr-1" /> New Product
            </Button>
          </Link>
        </div>

        {loading ? (
          <Skeleton className="h-96 rounded-2xl" />
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground mb-4">No products found.</p>
            <Link to="/admin/products/new">
              <Button>Add your first product</Button>
            </Link>
          </div>
        ) : (
          <div className="rounded-2xl border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      <Link
                        to={`/products/${product.id}`}
                        className="hover:underline"
                      >
                        {product.name}
                      </Link>
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{formatCurrency(product.price)}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell className="text-right">
                      <Link to={`/admin/products/${product.id}/edit`}>
                        <Button variant="ghost" size="icon">
                          <Pencil size={16} />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => handleDelete(product.id)}
                        disabled={deletingId === product.id}
                      >
                        <Trash2 size={16} />
                      </Button>
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
