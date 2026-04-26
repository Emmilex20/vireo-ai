export const env = {
  clerkPublishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  clerkSignInUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
  clerkSignUpUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL
};

export function validatePublicEnv() {
  const missing: string[] = [];

  if (!env.clerkPublishableKey) {
    missing.push("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY");
  }

  return {
    ok: missing.length === 0,
    missing
  };
}
