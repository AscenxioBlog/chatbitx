import { usePaystackPayment } from 'react-paystack'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import { Button } from '../ui/Button'

export function PayButton({ competition, userId, userEmail, onSuccess }) {
  const config = {
    reference: `bitxbase_${competition.id}_${userId}_${Date.now()}`,
    email: userEmail,
    amount: competition.entry_fee * 100,
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
  }

  const initializePayment = usePaystackPayment(config)

  async function handleSuccess(ref) {
    const { error } = await supabase
      .from('competition_registrations')
      .upsert({ competition_id: competition.id, user_id: userId, payment_status: 'paid', payment_reference: ref.reference })
    if (error) { toast.error('Payment recorded but registration failed'); return }
    toast.success('Registration successful!')
    onSuccess?.()
  }

  function handleClose() {
    toast.error('Payment cancelled')
  }

  return (
    <Button size="sm" onClick={() => initializePayment({ onSuccess: handleSuccess, onClose: handleClose })}>
      Pay ₦{competition.entry_fee?.toLocaleString()} & Register
    </Button>
  )
}
