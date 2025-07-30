import { createClient } from '@supabase/supabase-js'

// HTTP edge function to toggle the reset_required flag
export const handler = async (req: Request): Promise<Response> => {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials')
    return new Response('Server configuration error', { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    const { email, value } = await req.json()

    if (!email) {
      return new Response('Email is required', { status: 400 })
    }

    const { error } = await supabase
      .from('profiles')
      .update({ reset_required: value })
      .eq('email', String(email).trim().toLowerCase())

    if (error) {
      console.error('Failed to update reset_required:', error.message)
      return new Response('Database update failed', { status: 500 })
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (err) {
    console.error('Error handling request:', err)
    return new Response('Invalid request', { status: 400 })
  }
}
