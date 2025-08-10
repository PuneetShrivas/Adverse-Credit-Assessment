import { createClient } from '@/lib/server'
import { type EmailOtpType } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token')
  const type = searchParams.get('type') as EmailOtpType | null
  const _next = searchParams.get('redirect_to')
  const next = _next?.startsWith('/') ? _next : '/'

  if (token_hash && type) {
    const supabase = await createClient()

    const { data: verifyData, error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })

    if (!error && verifyData?.user) {
      const userId = verifyData.user.id
      const userEmail = verifyData.user.email

      // 1️⃣ Create a new organization
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: `${userEmail?.split('@')[0]}'s Organization`,
          created_by: userId,
        })
        .select()
        .single()

      if (orgError || !org) {
        console.error('Error creating organization:', orgError)
        redirect(`/auth/error?error=${orgError?.message}`)
        return
      }

      // 2️⃣ Add the user as an admin in organization_members
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: org.id,
          user_id: userId,
          role: 'admin',
        })

      if (memberError) {
        console.error('Error adding organization member:', memberError)
        redirect(`/auth/error?error=${memberError?.message}`)
        return
      }

      // ✅ Redirect to dashboard or intended next page
      redirect(next)
    } else {
      redirect(`/auth/error?error=${error?.message}`)
    }
  }

  redirect(`/auth/error?error=No token hash or type`)
}
