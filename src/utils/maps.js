// Builds a real Google Maps search link from any address parts. No API key
// needed — the universal Maps URL works on web and opens the native app on
// mobile. Using "search" (not a hard-coded lat/lng) lets Maps resolve the
// best match and offer directions.
export const mapsUrl = (...parts) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    parts.filter(Boolean).join(" ")
  )}`;

// "Nearest ER to the user right now" — Maps centers on the device's location.
export const nearestErUrl = () =>
  "https://www.google.com/maps/search/?api=1&query=emergency+hospital+near+me";

// Convenience for a catalog hospital object.
export const hospitalMapsUrl = (h) =>
  mapsUrl(h?.name, h?.address || h?.location, "hospital");
