import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Alert, AlertDescription } from '../components/ui/alert'
import { CreditCard, Lock, AlertCircle, Loader2 } from 'lucide-react'

interface PaymentFormProps {
  orderId: number
  amount: number
  currency: string
  onPaymentInitiated: (paymentId: string, reference: string, status: string) => void
  onCancel: () => void
}

interface PaymentFormData {
  email: string
  first_name: string
  last_name: string
  phone: string
  card_number: string
  exp_month: string
  exp_year: string
  cvv: string
}

export default function PaymentForm({ orderId, amount, currency, onPaymentInitiated, onCancel }: PaymentFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { register, handleSubmit, control, formState: { errors } } = useForm<PaymentFormData>()

  const formatCardNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '')
    // Format as XXXX XXXX XXXX XXXX
    const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ')
    return formatted.substring(0, 19) // Limit to 16 digits + 3 spaces
  }

  const formatExpiry = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '')
    // Format as MM/YY
    if (digits.length >= 2) {
      return digits.substring(0, 2) + '/' + digits.substring(2, 4)
    }
    return digits
  }

  const onSubmit = async (data: PaymentFormData) => {
    setIsLoading(true)
    setError('')

    try {
      // Remove spaces from card number before sending
      const paymentData = {
        ...data,
        order_id: orderId,
        currency: currency,
        card_number: data.card_number.replace(/\s/g, ''),
      }

      const token = localStorage.getItem('fruit-veg-token')
      const response = await fetch('http://localhost:8000/payments/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(paymentData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.detail || 'Payment initiation failed')
      }

      // Payment initiated successfully
      onPaymentInitiated(result.payment_id, result.reference, result.status)
      
    } catch (err: any) {
      setError(err.message || 'Failed to process payment. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Lock className="h-5 w-5 text-green-600" />
          <CardTitle className="text-2xl">Secure Payment</CardTitle>
        </div>
        <CardDescription>
          Complete your order payment securely
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Order Summary */}
        <div className="bg-muted/30 rounded-lg p-4 mb-6">
          <p className="text-sm text-muted-foreground mb-1">Amount to pay</p>
          <p className="text-3xl font-bold">
            {currency} {amount.toFixed(2)}
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Personal Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  placeholder="John"
                  {...register('first_name', { required: 'First name is required' })}
                />
                {errors.first_name && (
                  <p className="text-sm text-destructive">{errors.first_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  placeholder="Doe"
                  {...register('last_name', { required: 'Last name is required' })}
                />
                {errors.last_name && (
                  <p className="text-sm text-destructive">{errors.last_name.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1234567890"
                {...register('phone', { 
                  required: 'Phone number is required',
                  pattern: {
                    value: /^\+?[1-9]\d{1,14}$/,
                    message: 'Invalid phone number'
                  }
                })}
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              )}
            </div>
          </div>

          {/* Card Details */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              <h3 className="font-semibold text-lg">Card Details</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="card_number">Card Number</Label>
              <Controller
                name="card_number"
                control={control}
                rules={{ 
                  required: 'Card number is required',
                  validate: (value) => {
                    const digits = value?.replace(/\s/g, '') || ''
                    return digits.length === 16 || 'Card number must be 16 digits'
                  }
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="card_number"
                    placeholder="1234 5678 9012 3456"
                    onChange={(e) => {
                      const formatted = formatCardNumber(e.target.value)
                      field.onChange(formatted)
                    }}
                  />
                )}
              />
              {errors.card_number && (
                <p className="text-sm text-destructive">{errors.card_number.message}</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="exp_month">Month</Label>
                <Input
                  id="exp_month"
                  placeholder="MM"
                  maxLength={2}
                  {...register('exp_month', { 
                    required: 'Required',
                    pattern: {
                      value: /^(0[1-9]|1[0-2])$/,
                      message: 'Invalid'
                    }
                  })}
                />
                {errors.exp_month && (
                  <p className="text-sm text-destructive">{errors.exp_month.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="exp_year">Year</Label>
                <Input
                  id="exp_year"
                  placeholder="YYYY"
                  maxLength={4}
                  {...register('exp_year', { 
                    required: 'Required',
                    pattern: {
                      value: /^(20)\d{2}$/,
                      message: 'Invalid'
                    }
                  })}
                />
                {errors.exp_year && (
                  <p className="text-sm text-destructive">{errors.exp_year.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  type="password"
                  placeholder="***"
                  maxLength={4}
                  {...register('cvv', { 
                    required: 'Required',
                    pattern: {
                      value: /^\d{3,4}$/,
                      message: 'Invalid'
                    }
                  })}
                />
                {errors.cvv && (
                  <p className="text-sm text-destructive">{errors.cvv.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-lg p-3 flex items-start gap-2">
            <Lock className="h-4 w-4 text-green-600 mt-0.5" />
            <p className="text-xs text-green-800 dark:text-green-300">
              Your payment information is encrypted and secure. We use Flutterwave's industry-standard encryption to protect your data.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
              style={{ background: "#e8631a", color: "#fff" }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Pay ${currency} ${amount.toFixed(2)}`
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
