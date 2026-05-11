/**
 * CheckinService — Core geofencing and check-in business logic.
 *
 * Extracted from actions/coach.ts per Architecture Document:
 * "Logic nghiệp vụ không được rò rỉ ra ngoài thư mục services."
 *
 * This service is framework-agnostic and testable without Next.js context.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface GeofenceTarget {
  latitude: number | null;
  longitude: number | null;
  allowed_radius_m: number | null;
}

export interface CheckinCoords {
  latitude: number | null;
  longitude: number | null;
}

export interface GeofenceResult {
  distance: number | null;
  isValid: boolean;
  notes: string | null;
  warningMessage: string | null;
}

// ─── Haversine ───────────────────────────────────────────────────────────────

/**
 * Calculate the great-circle distance in meters between two lat/lng points
 * using the Haversine formula.
 *
 * @returns distance in meters
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const p1 = (lat1 * Math.PI) / 180;
  const p2 = (lat2 * Math.PI) / 180;
  const dp = ((lat2 - lat1) * Math.PI) / 180;
  const dl = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dp / 2) * Math.sin(dp / 2) +
    Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) * Math.sin(dl / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// ─── Geofence Validation ─────────────────────────────────────────────────────

/**
 * Evaluate whether a check-in position is within the allowed geofence radius.
 *
 * Handles three cases:
 *  1. Both positions available → compute distance, compare to radius
 *  2. Coach position missing (GPS denied/timeout) → invalid + warning
 *  3. Target position missing (academy not configured) → valid + note
 */
export function validateGeofence(
  coords: CheckinCoords,
  target: GeofenceTarget,
  existingNotes?: string | null
): GeofenceResult {
  let distance: number | null = null;
  let isValid = false;
  let notes = existingNotes || null;
  let warningMessage: string | null = null;

  if (
    coords.latitude &&
    coords.longitude &&
    target.latitude &&
    target.longitude
  ) {
    // Case 1: Both positions available
    distance = calculateDistanceMeters(
      coords.latitude,
      coords.longitude,
      target.latitude,
      target.longitude
    );
    const radius = target.allowed_radius_m || 300;
    isValid = distance <= radius;

    if (!isValid) {
      notes =
        (notes ? notes + ' | ' : '') +
        `Ngoại phạm vi: Cảnh báo khoảng cách ${Math.round(distance)}m`;
      warningMessage = `Bạn đang cách sân ${Math.round(distance)}m (quá bán kính cho phép).`;
    }
  } else if (!coords.latitude || !coords.longitude) {
    // Case 2: Coach GPS missing
    isValid = false;
    notes =
      (notes ? notes + ' | ' : '') + `Thiết bị không cung cấp GPS`;
    warningMessage = 'Không thể lấy thông tin GPS từ thiết bị.';
  } else if (!target.latitude || !target.longitude) {
    // Case 3: Academy/schedule not configured
    isValid = true;
    notes =
      (notes ? notes + ' | ' : '') +
      `Chưa cấu hình tọa độ sân/trung tâm`;
  }

  return { distance, isValid, notes, warningMessage };
}

// ─── Schedule GPS Parsing ────────────────────────────────────────────────────

/**
 * Parse GPS coordinates from a schedule location string.
 * Format: "Location Name | lat, lng"
 *
 * @returns parsed coordinates or null if not parseable
 */
export function parseScheduleGPS(
  location: string | null | undefined
): { latitude: number; longitude: number } | null {
  if (!location || !location.includes('|')) return null;

  try {
    const parts = location.split('|');
    if (parts.length < 2) return null;

    const coordsPart = parts[1].trim();
    if (!coordsPart.includes(',')) return null;

    const [latStr, lngStr] = coordsPart.split(',');
    const latitude = parseFloat(latStr.trim());
    const longitude = parseFloat(lngStr.trim());

    if (isNaN(latitude) || isNaN(longitude)) return null;

    return { latitude, longitude };
  } catch {
    return null;
  }
}
