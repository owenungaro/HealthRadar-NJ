import { ObjectId } from "mongodb";
import xss from "xss";
import Handlebars from "handlebars";

export function sanitizeString(value) {
  if (typeof value !== "string") {
    throw "Expected string";
  }

  let s = value.trim();
  if (s.length === 0) {
    throw "String cannot be empty";
  }

  s = xss(s);

  return s;
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

export function cleanString(x) {
  if (typeof x !== "string") throw "Expected string";
  const s = x.trim();
  if (s.length === 0) throw "String cannot be empty";
  return s;
}

export function normalizePhone(phone) {
  if (typeof phone !== "string") throw "Phone must be a string";

  const digits = phone.replace(/\D/g, "");

  if (digits.length !== 10) {
    throw "Phone number must contain exactly 10 digits";
  }

  const area = digits.slice(0, 3);
  const mid = digits.slice(3, 6);
  const last = digits.slice(6, 10);

  return `(${area}) ${mid}-${last}`;
}

Handlebars.registerHelper("eq", function (a, b, options) {
  return a === b ? options.fn(this) : options.inverse(this);
});

