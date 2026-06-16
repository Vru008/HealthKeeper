// Tiny, bundled lists (specialities, cities, counts) for instant dropdowns and
// stats — the heavy doctor/hospital catalog is fetched at runtime (see CatalogContext).
import lists from "./lists.json";

export const specialities = lists.specialities;
export const locations = lists.locations;
export const doctorCount = lists.doctorCount;
export const hospitalCount = lists.hospitalCount;
