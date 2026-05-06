export function getPublicSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  return { url, anonKey };
}

export function getServiceSupabaseConfig() {
  const publicConfig = getPublicSupabaseConfig();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!publicConfig || !serviceRoleKey) {
    return null;
  }

  return { ...publicConfig, serviceRoleKey };
}

export function getAdminEmails() {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isSupabaseConfigured() {
  return Boolean(getPublicSupabaseConfig());
}

export function isServiceSupabaseConfigured() {
  return Boolean(getServiceSupabaseConfig());
}
