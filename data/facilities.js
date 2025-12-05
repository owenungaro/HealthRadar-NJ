import { ObjectId } from "mongodb";
import { facilities as facilitiesCollection } from "../config/mongoCollections.js";

function sanitizeString(value) {
  if (typeof value !== "string") return value;
  return value.trim();
}

function checkId(id, varName = "id") {
  if (!id || typeof id !== "string") {
    throw new Error(`${varName} must be a non-empty string`);
  }
  id = id.trim();
  if (!ObjectId.isValid(id)) {
    throw new Error(`${varName} is not a valid ObjectId`);
  }
  return id;
}

// Get one facility by its Mongo _id
export async function getFacilityById(id) {
  id = checkId(id, "facilityId");
  const facilities = await facilitiesCollection();
  const facility = await facilities.findOne({ _id: new ObjectId(id) });
  if (!facility) {
    throw new Error("Facility not found");
  }
  return facility;
}

// Get facilities list, with optional filters
export async function getFacilities(filters = {}) {
  const facilities = await facilitiesCollection();

  const query = {};

  if (filters.county) {
    query.county = sanitizeString(filters.county).toUpperCase(); 
  }

  if (filters.city) {
    query.city = new RegExp(`^${sanitizeString(filters.city)}`, "i"); // starts with, case-insensitive
  }

  if (filters.facilityType) {
    query.facilityType = sanitizeString(filters.facilityType).toUpperCase();
  }

  if (filters.isActive !== undefined) {
    query.isActive = filters.isActive === "true" || filters.isActive === true;
  }

  const facilityList = await facilities
    .find(query)
    .sort({ county: 1, city: 1, licensedFacilityName: 1 })
    .toArray();

  return facilityList;
}
