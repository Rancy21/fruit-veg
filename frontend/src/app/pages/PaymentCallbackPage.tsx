import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { CheckCircle2, XCircle, Loader2, ShoppingBag } from 'lucide-react'

export default function PaymentCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'processing' | 'success' | 'failed'>('processing')
  const reference = searchParams.get('reference')
  const statusParam = searchParams.get('status')

  useEffect(() => {
    // Status is passed as URL parameter from backend callback
    // Backend already verified the payment, no need to fetch again
    console.log('PaymentCallbackPage - reference:', reference)
    console.log('PaymentCallbackPage - statusParam:', statusParam)
    if (!reference) {
      setStatus('failed')
      return
    }

    // Small delay for UX, then show the status from URL parameter
    const timer = setTimeout(() => {
             console.log('Checking status:', statusParam, 'type:', typeof statusParam)

             if (statusParam === 'successful') {
                console.log('Setting status to success')
               setStatus('success')
             } else if (statusParam === 'failed') {
                console.log('Setting status to failed')
               setStatus('failed')
             } else if (statusParam === 'processing') {
               setStatus('processing')
               } else {
                console.log('Unknown status, defaulting to failed')
                 // No status param or unknown status
                 setStatus('failed')
             }
    }, 1500)

    return () => clearTimeout(timer)
  }, [reference, statusParam])

  if (status === 'processing') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 text-center">
            <Loader2 className="h-16 w-16 animate-spin mx-auto text-primary mb-4" />
            <h2 className="text-2xl font-bold mb-2">Processing Payment</h2>
            <p className="text-muted-foreground">
              Please wait while we verify your payment...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-green-600">Payment Successful!</h2>
            <p className="text-muted-foreground mb-6">
              Your payment has been processed successfully. You will receive an email confirmation shortly.
            </p>
            <div className="bg-muted/30 rounded-lg p-4 mb-6">
              <p className="text-sm text-muted-foreground mb-1">Reference</p>
              <p className="font-mono font-semibold">{reference}</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => navigate('/orders')}
                className="flex-1"
                style={{ background: "#e8631a", color: "#fff" }}
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                View Orders
              </Button>
              <Button
                onClick={() => navigate('/products')}
                variant="outline"
                className="flex-1"
              >
                Continue Shopping
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-8 text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-red-600">Payment Failed</h2>
          <p className="text-muted-foreground mb-6">
            We couldn't process your payment. Please try again or contact support if the problem persists.
          </p>
          {reference && (
            <div className="bg-muted/30 rounded-lg p-4 mb-6">
              <p className="text-sm text-muted-foreground mb-1">Reference</p>
              <p className="font-mono font-semibold">{reference}</p>
            </div>
          )}
          <div className="flex gap-3">
            <Button
              onClick={() => navigate('/orders')}
              variant="outline"
              className="flex-1"
            >
              View Orders
            </Button>
            <Button
              onClick={() => navigate('/products')}
              className="flex-1"
              style={{ background: "#e8631a", color: "#fff" }}
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
