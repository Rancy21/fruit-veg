import { Route, Routes } from "react-router";
import AdminRoute from "./components/AdminRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import SearchPage from "./pages/SearchPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import UserProfilePage from "./pages/UserProfilePage";
import AdminProductsPage from "./pages/AdminProductsPage";
import AdminProductCreatePage from "./pages/AdminProductCreatePage";
import AdminProductEditPage from "./pages/AdminProductEditPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/products/:id" element={<ProductDetailPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/cart" element={<CartPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/orders/:id" element={<OrderDetailPage />} />
        <Route path="/profile" element={<UserProfilePage />} />
        {/* User-only routes will be added here */}
      </Route>

      <Route element={<AdminRoute />}>
        <Route path="/admin/products" element={<AdminProductsPage />} />
        <Route path="/admin/products/new" element={<AdminProductCreatePage />} />
        <Route path="/admin/products/:id/edit" element={<AdminProductEditPage />} />
      </Route>

      <Route path="*" element={<div className="p-10 text-center">Page not found</div>} />
    </Routes>
  );
}
