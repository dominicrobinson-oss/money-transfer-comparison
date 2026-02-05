/**
 * Number formatting utilities
 * Safely formats numbers to strings with fallback handling
 */

/**
 * Format a number to string with specified decimal places
 * @param value - Any value (will be validated)
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted number string or "—" if invalid
 */
export function formatNumber(value: unknown, decimals: number = 2): string {
  // Guard against null, undefined, non-numeric values, and NaN
  if (
    value === null ||
    value === undefined ||
    typeof value !== "number" ||
    isNaN(value)
  ) {
    return "—";
  }

  return value.toFixed(decimals);
}

/**
 * Format a number with locale-specific thousand separators
 * @param value - Any value (will be validated)
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted number string with locale formatting or "—" if invalid
 */
export function formatNumberLocale(
  value: unknown,
  decimals: number = 2
): string {
  // Guard against null, undefined, non-numeric values, and NaN
  if (
    value === null ||
    value === undefined ||
    typeof value !== "number" ||
    isNaN(value)
  ) {
    return "—";
  }

  return value.toLocaleString("en-GB", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
