/** HTTP statuses worth retrying: the model provider is overloaded or rate-limiting us. */
const RETRYABLE_STATUSES = new Set([429, 503]);

function statusOf(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null) return undefined;
  const { status, statusCode } = error as { status?: unknown; statusCode?: unknown };
  const value = status ?? statusCode;
  return typeof value === "number" ? value : undefined;
}

/**
 * Runs an AI call, retrying overload / rate-limit failures with exponential backoff and jitter.
 * Any other error is thrown straight away.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelayMs = 1000,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const status = statusOf(error);
      if (status === undefined || !RETRYABLE_STATUSES.has(status)) throw error;
      if (attempt < maxRetries - 1) {
        const delay = baseDelayMs * 2 ** attempt + Math.random() * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError ?? new Error("Max retries exceeded");
}
