import { ObjectId } from "mongodb";
export function sanitizeString(value) {
  if (typeof value !== "string") return value;
  return value.trim();
}

export function checkId(id, varName = "id") {
  if (!id || typeof id !== "string") {
    throw new Error(`${varName} must be a non-empty string`);
  }
  id = id.trim();
  if (!ObjectId.isValid(id)) {
    throw new Error(`${varName} is not a valid ObjectId`);
  }
  return id;
}
