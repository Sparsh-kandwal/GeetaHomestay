/**
 * Date and numeric validation helpers for bookings in Asia/Kolkata timezone.
 */

export const getKolkataTodayString = () => {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(new Date()); // "YYYY-MM-DD"
};

/**
 * Normalizes input date to YYYY-MM-DD in Asia/Kolkata.
 * Returns null if invalid or malformed.
 */
export const normalizeToKolkataDateString = (dateInput) => {
  if (!dateInput) return null;
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return null;

  try {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const formatted = formatter.format(d);
    // Extra validation: ensure standard YYYY-MM-DD format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(formatted)) return null;
    return formatted;
  } catch {
    return null;
  }
};

/**
 * Computes nights between two YYYY-MM-DD date strings.
 * Returns integer nights, or NaN if invalid.
 */
export const calculateNights = (checkInStr, checkOutStr) => {
  if (!checkInStr || !checkOutStr) return NaN;
  const [y1, m1, d1] = checkInStr.split("-").map(Number);
  const [y2, m2, d2] = checkOutStr.split("-").map(Number);

  if (!y1 || !m1 || !d1 || !y2 || !m2 || !d2) return NaN;

  const utc1 = Date.UTC(y1, m1 - 1, d1);
  const utc2 = Date.UTC(y2, m2 - 1, d2);
  const diffMs = utc2 - utc1;
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
};

/**
 * Validates that value is a strictly positive integer (1, 2, 3...).
 */
export const isPositiveInteger = (value) => {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
};
