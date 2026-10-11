import { createClient } from '@supabase/supabase-js';

// ─── Supabase project credentials ──────────────────────────────────────────
const SUPABASE_URL     = 'https://fmfvchcwuegzutidpsea.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_4ETRyo9SyRbKT0cD9FeJgQ_kutYfkq7';

// ─── Create client ──────────────────────────────────────────────────────────
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,       // CRITICAL: picks up the OAuth token from URL after Google redirect
    storageKey: 'mk_supabase_auth', // separate key so it doesn't clash with our mk_user key
    flowType: 'pkce',               // most secure — uses code verifier
  },
});

// ─── Helper: build the correct redirect URL ─────────────────────────────────
// After Google auth, Supabase will redirect back here.
// Works for both localhost dev and any deployed domain.
function getRedirectUrl() {
  const origin = window.location.origin;
  return origin; // e.g. http://localhost:5173 or https://yourdomain.com
}

// ─── Normalize Supabase user → MaatiKatha user object ───────────────────────
export function formatUser(sbUser) {
  if (!sbUser) return null;
  const meta = sbUser.user_metadata || {};
  return {
    id:         sbUser.id,
    _id:        sbUser.id,
    email:      sbUser.email,
    name:       meta.full_name || meta.name || meta.user_name
                || (sbUser.email ? sbUser.email.split('@')[0] : 'Farmer'),
    phone:      meta.phone || '',
    state:      meta.state  || 'West Bengal',
    role:       meta.role   || 'farmer',
    avatar_url: meta.avatar_url || meta.picture || '',
    provider:   sbUser.app_metadata?.provider || 'email',
  };
}

// ─── Email / Password sign in ────────────────────────────────────────────────
export async function signInWithEmail(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  if (error) throw error;
  return data;
}

// ─── Email / Password sign up ────────────────────────────────────────────────
export async function signUpWithEmail(email, password, metadata = {}) {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: {
      data: {
        name:      metadata.name  || '',
        full_name: metadata.name  || '',
        phone:     metadata.phone || '',
        state:     metadata.state || 'West Bengal',
        role: 'farmer',
      },
    },
  });
  if (error) throw error;
  return data;
}

// ─── Google OAuth sign in ────────────────────────────────────────────────────
// This redirects the user to Google's consent screen.
// After the user approves, Google redirects → Supabase → back to our app.
// Supabase then fires an onAuthStateChange(SIGNED_IN) event, which App.jsx picks up.
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: getRedirectUrl(),
      queryParams: {
        access_type: 'offline',
        prompt: 'consent select_account', // always show Google account chooser
      },
    },
  });
  if (error) throw error;
  return data; // { provider, url } — the SDK will auto-redirect the browser
}

// ─── Sign out ────────────────────────────────────────────────────────────────
export async function signOut() {
  await supabase.auth.signOut();
  localStorage.removeItem('mk_token');
  localStorage.removeItem('mk_user');
}

// ─── Get current session ─────────────────────────────────────────────────────
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.warn('[Supabase] getSession error:', error.message);
    return null;
  }
  return session;
}
