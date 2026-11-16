import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() || '';
const supabaseAnonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() || '';

export const SUPABASE_MEDIA_BUCKET = import.meta.env.VITE_SUPABASE_MEDIA_BUCKET?.trim() || 'mam-xanh-media';
const teacherAdminUid = import.meta.env.VITE_SUPABASE_ADMIN_UID?.trim();

export function isTeacherAdmin(userId: string): boolean {
  return !teacherAdminUid || userId === teacherAdminUid;
}

function isValidSupabaseUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return (
      (parsed.protocol === 'https:' || parsed.protocol === 'http:') &&
      Boolean(parsed.hostname) &&
      parsed.hostname.includes('.')
    );
  } catch {
    return false;
  }
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    supabaseUrl &&
      supabaseAnonKey &&
      isValidSupabaseUrl(supabaseUrl) &&
      supabaseAnonKey.length >= 20
  );
}

let cachedClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!cachedClient) {
    try {
      cachedClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    } catch {
      return null;
    }
  }
  return cachedClient;
}
