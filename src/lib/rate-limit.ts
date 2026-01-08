// Stub rate limiting functions
export async function checkEmailRateLimit(email: string): Promise<boolean> {
  console.log('Rate limit check for:', email);
  return true; // Allow by default
}