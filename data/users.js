import bcrypt from "bcrypt";
import { users as usersCollection } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";

export async function createUser(userData) {
  if (!userData || typeof userData !== "object") {
    throw new Error("Invalid user data");
  }

  let isASCII = (s) => /^[\x00-\x7F]+$/.test(s);

  let checkStr = (v, name) => {
    if (!v || typeof v !== "string") throw new Error(`Invalid ${name}`);
    if (!isASCII(v)) throw new Error(`Invalid ${name}`);
    let trimmed = v.trim();
    if (!trimmed) throw new Error(`Invalid ${name}`);
    return trimmed;
  };

  let userName = checkStr(userData.userName, "username");
  if (userName.length < 4) {
    throw new Error("Invalid username");
  }

  let firstName = checkStr(userData.firstName, "first name");
  let lastName = checkStr(userData.lastName, "last name");

  let email = checkStr(userData.email, "email").toLowerCase();
  if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    throw new Error("Invalid email");
  }

  let password = checkStr(userData.password, "password");

  let pwFails =
    password.length < 7 ||
    !/[A-Z]/.test(password) ||
    !/[0-9]/.test(password) ||
    !/[!@#$%^&*()_\-+=<>?/[\]{}|~]/.test(password);

  if (pwFails) {
    throw new Error("Invalid password");
  }

  let dob = checkStr(userData.dob, "date of birth");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
    throw new Error("Invalid date of birth");
  }

  let parsed = new Date(dob);
  if (isNaN(parsed.getTime())) {
    throw new Error("Invalid date of birth");
  }

  let today = new Date();
  let isoToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  if (parsed > isoToday) {
    throw new Error("Invalid date of birth");
  }

  let users = await usersCollection();

  let existing = await users.findOne({
    $or: [{ email }, { userName }],
  });

  if (existing) {
    throw new Error("User already exists");
  }

  let passwordHash = await bcrypt.hash(password, 12);

  let doc = {
    userName,
    firstName,
    lastName,
    dob,
    role: "citizen",
    email,
    county: userData.county || null,
    zipCode: userData.zipCode || null,
    preferredLanguage: userData.preferredLanguage || "en",
    twoFactorEnabled: false,
    passwordHash,
    createdAt: new Date().toISOString(),
    isVerified: false,
  };

  let result = await users.insertOne(doc);
  return { _id: result.insertedId, ...doc };
}

export async function findUserByEmailOrUsername(identifier) {
  if (!identifier || typeof identifier !== "string") {
    throw new Error("Invalid identifier");
  }
  let trimmed = identifier.trim();
  if (!trimmed || trimmed === "" || !/^[\x00-\x7F]+$/.test(trimmed)) {
    throw new Error("Invalid identifier");
  }

  let query = [];
  if (trimmed.includes("@")) {
    //treat as email
    let email = trimmed.toLowerCase();
    let validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!validEmail.test(email)) {
      throw new Error("Invalid identifier");
    }
    query = { email };
  } else {
    //treat as username
    if (trimmed.length < 4) {
      throw new Error("Invalid identifier");
    }
    query = { userName: trimmed };
  }

  let users = await usersCollection();
  let user = await users.findOne(query);

  if (!user) {
    throw new Error("User not found");
  }
  return user;
}

export async function findUserById(id) {
  if (!id || typeof id !== "string" || !ObjectId.isValid(id)) {
    throw new Error("Invalid id");
  }

  let users = await usersCollection();
  let user = await users.findOne({ _id: new ObjectId(id) });

  if (!user) {
    throw new Error("User not found");
  }
  return user;
}

export async function deleteUser(id) {
  if (!id || typeof id !== "string" || !ObjectId.isValid(id)) {
    throw new Error("Invalid id");
  }

  let objId = new ObjectId(id);
  let users = await usersCollection();

  let existing = await users.findOne({ _id: objId });

  if (!existing) {
    throw new Error("User not found");
  }

  await users.deleteOne({ _id: objId });

  return {
    success: true,
    user: existing,
  };
}

export async function editUser(userData) {
  if (!userData || typeof userData !== "object") {
    throw new Error("Invalid user data");
  }

  if (
    !userData._id ||
    typeof userData._id !== "string" ||
    !ObjectId.isValid(userData._id)
  ) {
    throw new Error("Invalid user id");
  }

  let isASCII = (s) => /^[\x00-\x7F]+$/.test(s);

  let checkStr = (v, name) => {
    if (!v || typeof v !== "string") throw new Error(`Invalid ${name}`);
    if (!isASCII(v)) throw new Error(`Invalid ${name}`);
    let trimmed = v.trim();
    if (!trimmed) throw new Error(`Invalid ${name}`);
    return trimmed;
  };

  let userName = checkStr(userData.userName, "username");
  if (userName.length < 4) throw new Error("Invalid username");

  let firstName = checkStr(userData.firstName, "first name");
  let lastName = checkStr(userData.lastName, "last name");

  let email = checkStr(userData.email, "email").toLowerCase();
  if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    throw new Error("Invalid email");
  }

  let password = checkStr(userData.password, "password");

  let pwFails =
    password.length < 7 ||
    !/[A-Z]/.test(password) ||
    !/[0-9]/.test(password) ||
    !/[!@#$%^&*()_\-+=<>?/[\]{}|~]/.test(password);

  if (pwFails) throw new Error("Invalid password");

  let dob = checkStr(userData.dob, "date of birth");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
    throw new Error("Invalid date of birth");
  }

  let parsed = new Date(dob);
  if (isNaN(parsed.getTime())) throw new Error("Invalid date of birth");

  let today = new Date();
  let isoToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  if (parsed > isoToday) throw new Error("Invalid date of birth");

  let passwordHash = await bcrypt.hash(password, 12);

  let updateDoc = {
    userName,
    firstName,
    lastName,
    dob,
    role: userData.role || "citizen",
    email,
    county: userData.county || null,
    zipCode: userData.zipCode || null,
    preferredLanguage: userData.preferredLanguage || "en",
    twoFactorEnabled: userData.twoFactorEnabled || false,
    passwordHash,
    isVerified: !!userData.isVerified,
  };

  let users = await usersCollection();

  await users.updateOne(
    { _id: new ObjectId(userData._id) },
    { $set: updateDoc }
  );

  return {
    _id: userData._id,
    ...updateDoc,
  };
}
