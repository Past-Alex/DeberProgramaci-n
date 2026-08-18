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

  if (!profile) {
    await supabase.auth.signOut()
    redirect('/login?error=account_deleted')
  }

  const userData: User = {
    id: user.id,
    name: profile?.name || user.email?.split('@')[0] || 'Usuario',
    role: profile?.role || 'user'
  }

  // Requerimiento 2.7: Consumo de API Externa (desde un Server Component)
  let externalQuote = null;
  try {
    // Usamos una API gratuita de citas para inspirar al usuario en sus hábitos
    const res = await fetch('https://dummyjson.com/quotes/random', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      
      // Traducir la cita al español
      const translateRes = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(data.quote)}&langpair=en|es`);
      let translatedText = data.quote;
      
      if (translateRes.ok) {
        const translateData = await translateRes.json();
        if (translateData.responseData && translateData.responseData.translatedText) {
          translatedText = translateData.responseData.translatedText;
        }
      }

      externalQuote = {
        text: translatedText,
        author: data.author
      };
    } else {
      console.error("API response not OK:", res.status);
    }
  } catch (error) {
    // Manejo básico de errores si la API falla o tarda
    console.error("Error fetching external quote API:", error);
  }

  return <App initialUser={userData} initialQuote={externalQuote} />
}

