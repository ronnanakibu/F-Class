/**
 * Validates admin API keys / passkeys across all administration endpoints.
 * Supports environment variables (STORY_BOT_SECRET, ADMIN_PASSKEY, ADMIN_SECRET)
 * as well as the standardized class passkeys.
 */
export function isValidAdminKey(key?: string | null): boolean {
  if (!key) return false;
  const clean = key.trim();

  const acceptedKeys = [
    process.env.STORY_BOT_SECRET,
    process.env.ADMIN_PASSKEY,
    process.env.ADMIN_SECRET,
    'cef2024',
    'cef2025',
    'fclass2025',
    'admince-f',
    'admin123',
    'ronn',
  ].filter(Boolean) as string[];

  return acceptedKeys.some(
    (k) => k === clean || k.toLowerCase() === clean.toLowerCase()
  );
}
