import { useState } from "react"
import { Link, useNavigate } from "react-router"
import { ArrowLeft, ShoppingBasket, CreditCard } from "lucide-react"
import { Button } from "../components/ui/button"
import { useAuth } from "../../contexts/AuthContext"
import { useCart } from "../../contexts/CartContext"
import { createOrder } from "../../api/orders"
import { formatCurrency } from "../../lib/format"
import type { OrderItemCreate } from "../../types/api"
import PaymentForm from "./PaymentForm"

export default function CheckoutPage() {
  const { items, total, itemCount, clearCart } = useCart()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [orderId, setOrderId] = useState<number | null>(null)

  async function handlePlaceOrder() {
    if (items.length === 0) return

    setIsSubmitting(true)
    try {
      const orderItems: OrderItemCreate[] = items.map((item) => ({
        order_id: 0,
        product_id: item.product.id,
        price_at_purchase: item.product.price.toFixed(2),
        quantity: item.quantity.toString(),
      }))

      const order = await createOrder(orderItems)
      setOrderId(order.id)
      setShowPaymentForm(true)
    } catch (error) {
      console.error('Failed to create order:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePaymentInitiated = (paymentId: string, reference: string, status: string) => {
    clearCart()
    navigate(`/payment/callback?reference=${reference}&status=${status}`)
  }

  const handleCancelPayment = () => {
    setShowPaymentForm(false)
    setOrderId(null)
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
    )
  }

  if (items.length === 0 && !showPaymentForm) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <ShoppingBasket size={48} className="mb-4 text-muted-foreground opacity-50" />
        <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
        <p className="text-muted-foreground mb-6">
          Add some delicious fruits and vegetables to get started.
        </p>
        <Link to="/products">
          <Button style={{ background: "#e8631a", color: "#fff" }}>Shop now</Button>
        </Link>
      </div>
    )
  }

  if (showPaymentForm && orderId) {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <Link
            to="/cart"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft size={16} /> Back to cart
          </Link>

          <PaymentForm
            orderId={orderId}
            amount={total}
            currency="USD"
            onPaymentInitiated={handlePaymentInitiated}
            onCancel={handleCancelPayment}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/cart"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft size={16} /> Back to cart
        </Link>

        <h1 className="text-3xl font-bold mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>
          Checkout
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div>
            <div className="bg-card border rounded-2xl p-6">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                {items.map((item) => (
                  <div key={item.product.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.product.name} × {item.quantity}
                    </span>
                    <span>
                      {formatCurrency(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Items ({itemCount})</span>
                  <span>{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Actions */}
          <div>
            <div className="bg-card border rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Payment</h2>
              </div>

              <p className="text-sm text-muted-foreground mb-6">
                Click "Place Order" to proceed to secure payment. You'll enter your card details on the next screen.
              </p>

              <Button
                onClick={handlePlaceOrder}
                disabled={isSubmitting || items.length === 0}
                className="w-full"
                size="lg"
                style={{ background: "#e8631a", color: "#fff" }}
              >
                {isSubmitting ? "Creating Order..." : "Place Order"}
              </Button>

              <p className="text-xs text-muted-foreground text-center mt-4">
                By placing your order, you agree to our terms and conditions.
              </p>
            </div>

            {/* Security Badge */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mt-6">
              <p className="text-xs text-green-800 dark:text-green-300 text-center">
                🔒 Your payment is secured with 256-bit SSL encryption
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
