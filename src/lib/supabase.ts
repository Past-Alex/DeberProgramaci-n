// Cliente de Supabase
// En un proyecto real de Next.js, aquí inicializarías @supabase/supabase-js
// usando las variables de entorno de .env.local

export const supabase = {
  auth: {
    getUser: async () => ({ data: { user: null }, error: null }),
    signInWithPassword: async () => ({ data: {}, error: null }),
    signOut: async () => ({ error: null })
  },
  from: (table: string) => ({
    select: () => ({ data: [], error: null }),
    insert: () => ({ data: null, error: null })
  })
};
