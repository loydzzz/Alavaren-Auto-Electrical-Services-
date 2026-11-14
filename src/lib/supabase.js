import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const REMEMBER_KEY = 'remember_me'

// Decides where the session is saved:
// - "Keep me signed in" checked   → localStorage (survives closing the browser)
// - "Keep me signed in" unchecked → sessionStorage (gone when the tab closes)
const hybridStorage = {
  getItem: (key) =>
    localStorage.getItem(key) ?? sessionStorage.getItem(key),

  setItem: (key, value) => {
    const remember = localStorage.getItem(REMEMBER_KEY) === 'true'

    if (remember) {
      localStorage.setItem(key, value)
      sessionStorage.removeItem(key)
    } else {
      sessionStorage.setItem(key, value)
      localStorage.removeItem(key)
    }
  },

  removeItem: (key) => {
    localStorage.removeItem(key)
    sessionStorage.removeItem(key)
  },
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: hybridStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
})