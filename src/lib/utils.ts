import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Readable message from anything a `catch` block can receive. */
export function getErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (error instanceof Error && error.message) return error.message
  if (typeof error === "string" && error) return error
  return fallback
}

/** Anything Firestore or our own code stores as a point in time. */
export type DateLike = { toDate(): Date } | Date | string | number

/** Converts a Firestore Timestamp, Date, ISO string or epoch millis into a Date. */
export function toDate(value: DateLike | null | undefined): Date {
  if (value && typeof value === "object" && "toDate" in value) return value.toDate()
  return value === null || value === undefined ? new Date(NaN) : new Date(value)
}
