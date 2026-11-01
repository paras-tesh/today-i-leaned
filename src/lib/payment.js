import { supabase } from './supabase.js'

// Asks the payment-start Edge Function for a Zarinpal payment URL.
// Only ids and the coupon code are sent: the server works out the price itself
// from the database, so the amount can't be tampered with in the browser.
export async function startPayment({ courseIds, coupon }) {
  const { data, error } = await supabase.functions.invoke('payment-start', {
    body: { courseIds, coupon },
  })
  if (error) throw error
  return data
}
