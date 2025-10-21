import { formatInTimeZone } from 'date-fns-tz';

/**
 * Formats a timestamp from the backend in the user's selected timezone.
 * Backend timestamps are in UTC but may not have the 'Z' suffix.
 * This function ensures they're treated as UTC before converting to the target timezone.
 */
export function formatTimestamp(timestamp: string, timezone: string, formatStr: string): string {
  // If the timestamp doesn't end with 'Z' and doesn't have timezone info, add 'Z' to mark it as UTC
  let utcTimestamp = timestamp;
  if (!timestamp.endsWith('Z') && !timestamp.includes('+') && !timestamp.includes('T')) {
    // This might be a date-only string, don't modify it
    utcTimestamp = timestamp;
  } else if (!timestamp.endsWith('Z') && !timestamp.includes('+') && timestamp.includes('T')) {
    // This is an ISO timestamp without timezone info, mark it as UTC
    utcTimestamp = timestamp + 'Z';
  }
  
  return formatInTimeZone(new Date(utcTimestamp), timezone, formatStr);
}

