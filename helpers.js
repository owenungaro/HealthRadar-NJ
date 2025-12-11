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



// Input Validations

export function validateDOB(dob) {
  if (typeof dob !== "string") throw "Invalid date of birth";
  dob = dob.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
    throw "Invalid date format for DOB";
  }
  const parsed = new Date(dob);
  if (isNaN(parsed.getTime())) {
    throw "Invalid date of birth";
  }
  const today = new Date();
  if (parsed > today) {
    throw "Date of birth cannot be in the future";
  }
  let age = today.getFullYear() - parsed.getFullYear();
  let monthDiff = today.getMonth() - parsed.getMonth();
  let dayDiff = today.getDate() - parsed.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }
  if (age < 14) {
    throw "You must be at least 14 years old to create an account";
  }

  if (age > 120) {
    throw "Invalid age: cannot be older than 120 years";
  }
  return dob;
}


export function validateEmail(email) {
  if (typeof email !== "string") throw "Invalid email";
  email = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw "Invalid email format";
  }

  const domain = email.split("@")[1];

  if (!domain.includes(".")) {
    throw "Invalid email domain";
  }
  if (/[<>"'(){}[\]]/.test(email)) {
    throw "Invalid email characters";
  }

  return email;
}


export function validateName(name, fieldName = "name") {
  if (typeof name !== "string") {
    throw `${fieldName} must be a string`;
  }

  let trimmed = name.trim();
  if (trimmed.length === 0) {
    throw `${fieldName} cannot be empty`;
  }
  if (!/^[A-Za-z]+$/.test(trimmed)) {
    throw `${fieldName} must contain only letters`;
  }
  return trimmed;
}


export function validateCounty(county) {
  if (typeof county !== "string") {
    throw "County must be a string";
  }
  let trimmed = county.trim();
  if (trimmed.length === 0) {
    throw "County cannot be empty";
  }
  if (!/^[A-Za-z\s-]+$/.test(trimmed)) {
    throw "County must contain only letters, spaces, or hyphens";
  }
  return trimmed;
}


export function validateZipCode(zip) {
  if (!zip) throw "Zip code is required";
  zip = zip.toString().trim();
  if (!/^\d{5}$/.test(zip)) {
    throw "Zip code must be a 5-digit number";
  }
  return zip;
}

export function validatePassword(password) {
  if (!password || typeof password !== "string") {
    throw "Password must be a string";
  }
  password = password.trim();
  if (password.length < 8) {
    throw "Password must be at least 8 characters long";
  }
  if (!/[A-Z]/.test(password)) {
    throw "Password must contain at least one uppercase letter";
  }
  if (!/[0-9]/.test(password)) {
    throw "Password must contain at least one digit";
  }
  if (!/[!@#$%^&*()_\-+=<>?/[\]{}|~]/.test(password)) {
    throw "Password must contain at least one special character";
  }
  return password;
}
