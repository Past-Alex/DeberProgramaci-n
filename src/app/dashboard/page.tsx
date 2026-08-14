import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import App from '../../App'
import { User } from '@/types'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const userData: User = {
    id: user.id,
    name: profile?.name || user.email?.split('@')[0] || 'Usuario',
    role: profile?.role || 'user'
  }

  return <App initialUser={userData} />
}
