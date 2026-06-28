import { createClient } from "@supabase/supabase-js";

const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publicKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;

function normalizeSupabaseUrl(url?: string) {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  return trimmed.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
}

const supabaseUrl = normalizeSupabaseUrl(rawSupabaseUrl);

export function hasSupabaseConfig() {
  return Boolean(supabaseUrl && publicKey);
}

export function hasSupabaseServiceConfig() {
  return Boolean(supabaseUrl && serviceKey);
}

export function getPublicSupabase() {
  if (!supabaseUrl || !publicKey) return null;
  return createClient(supabaseUrl, publicKey);
}

export function getServiceSupabase() {
  if (!supabaseUrl || !serviceKey) return null;
  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false }
  });
}

export function getSupabaseConnectionInfo() {
  return {
    hasUrl: Boolean(supabaseUrl),
    hasPublicKey: Boolean(publicKey),
    hasServiceKey: Boolean(serviceKey),
    urlLooksLikeApiEndpoint: Boolean(rawSupabaseUrl?.includes("/rest/v1"))
  };
}