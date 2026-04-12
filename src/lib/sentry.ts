import * as Sentry from "@sentry/nextjs";

export const isSentryEnabled = () =>
  !!process.env.NEXT_PUBLIC_SENTRY_DSN && Sentry.isInitialized();

export const logErrorToSentry = (
  error: unknown,
  context?: Record<string, unknown>
) => {
  if (isSentryEnabled()) {
    Sentry.captureException(error, {
      extra: context,
    });
  } else {
    console.log(error);
  }
};
