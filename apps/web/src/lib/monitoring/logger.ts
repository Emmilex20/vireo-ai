import * as Sentry from "@sentry/nextjs";

function ensureSentryInitialized() {
  if (Sentry.getClient()) {
    return;
  }

  const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

  if (!dsn) {
    return;
  }

  Sentry.init({
    dsn,
    sendDefaultPii: false,
    tracesSampleRate: 0.1,
    integrations: [
      Sentry.breadcrumbsIntegration({
        console: false
      })
    ]
  });
}

export function logError(error: unknown, context?: Record<string, unknown>) {
  console.error(error);
  ensureSentryInitialized();

  Sentry.captureException(error, {
    extra: context
  });
}

export function logMessage(
  message: string,
  context?: Record<string, unknown>
) {
  console.log(message);
  ensureSentryInitialized();

  Sentry.captureMessage(message, {
    level: "info",
    extra: context
  });
}
