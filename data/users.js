import bcrypt from "bcrypt";
import { users as usersCollection } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";
import { validateDOB, validateEmail, validateName, validateCounty, validateZipCode, validatePassword, validateUsername  } from "../helpers.js";


export async function createUser(userData) {
  if (!userData || typeof userData !== "object") {
    throw "Invalid user data";
  }

  let isASCII = (s) => /^[\x00-\x7F]+$/.test(s);

  let checkStr = (v, name) => {
    if (!v || typeof v !== "string") throw `Invalid ${name}`;
    if (!isASCII(v)) throw `Invalid ${name}`;
    let trimmed = v.trim();
    if (!trimmed) throw `Invalid ${name}`;
    return trimmed;
  };

  let userName = validateUsername(userData.userName);

  let firstName = validateName(userData.firstName, "first name");
  let lastName = validateName(userData.lastName, "last name");
  let email = validateEmail(userData.email);
  let password = validatePassword(userData.password);
  let dob = validateDOB(userData.dob);
  let county = validateCounty(userData.county);
  let zipCode = validateZipCode(userData.zipCode);

  let users = await usersCollection();
  let existing = await users.findOne({
    $or: [
      { email: { $regex: `^${email}$`, $options: "i" } },
      { userName: { $regex: `^${userName}$`, $options: "i" } }
    ]
  });

  if (existing) {
    throw "User already exists";
  }

  let passwordHash = await bcrypt.hash(password, 12);

  let doc = {
    userName,
    firstName,
    lastName,
    dob,
    role: "citizen",
    email,
    county,
    zipCode,
    preferredLanguage: userData.preferredLanguage || "en",
    twoFactorEnabled: false,
    passwordHash,
    createdAt: new Date().toISOString(),
    isVerified: false,
  };

  let result = await users.insertOne(doc);
  return { _id: result.insertedId, ...doc };
}


export async function createAdmin(userData) {
  if (!userData || typeof userData !== "object") {
    throw "Invalid user data";
  }

  let isASCII = (s) => /^[\x00-\x7F]+$/.test(s);

  let checkStr = (v, name) => {
    if (!v || typeof v !== "string") throw `Invalid ${name}`;
    if (!isASCII(v)) throw `Invalid ${name}`;
    let trimmed = v.trim();
    if (!trimmed) throw `Invalid ${name}`;
    return trimmed;
  };

  let userName = validateUsername(userData.userName);

 let firstName = validateName(userData.firstName, "first name");
 let lastName = validateName(userData.lastName, "last name");
 let email = validateEmail(userData.email);
 let password = validatePassword(userData.password);
  let dob = validateDOB(userData.dob);
  let county = validateCounty(userData.county);
  let zipCode = validateZipCode(userData.zipCode);


  let users = await usersCollection();

  let existing = await users.findOne({
    $or: [{ email }, { userName }],
  });

  if (existing) {
    throw "User already exists";
  }

  let passwordHash = await bcrypt.hash(password, 12);

  let doc = {
    userName,
    firstName,
    lastName,
    dob,
    role: "admin",
    email,
    county,
    zipCode,
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
    throw "Invalid identifier";
  }
  let trimmed = identifier.trim();
  if (!trimmed || trimmed === "" || !/^[\x00-\x7F]+$/.test(trimmed)) {
    throw "Invalid identifier";
  }

  let query = [];
  if (trimmed.includes("@")) {
    let email = trimmed.toLowerCase();
    let validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!validEmail.test(email)) {
      throw "Invalid identifier";
    }
    query = { email };
  } else {
    if (trimmed.length < 4) {
      throw "Invalid identifier";
    }
    query = { userName: trimmed };
  }

  let users = await usersCollection();
  const user = await users.findOne({
    $or: [
      { email: { $regex: `^${identifier}$`, $options: "i" }},
      { userName: { $regex: `^${identifier}$`, $options: "i" }}
    ]
  });

  return user;
}

export async function findUserById(id) {
  if (!id || typeof id !== "string" || !ObjectId.isValid(id)) {
    throw "Invalid id";
  }

  let users = await usersCollection();
  let user = await users.findOne({ _id: new ObjectId(id) });
  return user;
}

export async function deleteUser(id) {
  if (!id || typeof id !== "string" || !ObjectId.isValid(id)) {
    throw "Invalid id";
  }

  let objId = new ObjectId(id);
  let users = await usersCollection();

  let existing = await users.findOne({ _id: objId });

  if (!existing) {
    throw "User not found";
  }

  await users.deleteOne({ _id: objId });

  return {
    success: true,
    user: existing,
  };
}

export async function editUser(userData) {
  if (!userData || typeof userData !== "object") {
    throw "Invalid user data";
  }

  if (
    !userData._id ||
    typeof userData._id !== "string" ||
    !ObjectId.isValid(userData._id)
  ) {
    throw "Invalid user id";
  }

  let isASCII = (s) => /^[\x00-\x7F]+$/.test(s);

  let checkStr = (v, name) => {
    if (!v || typeof v !== "string") throw `Invalid ${name}`;
    if (!isASCII(v)) throw `Invalid ${name}`;
    let trimmed = v.trim();
    if (!trimmed) throw `Invalid ${name}`;
    return trimmed;
  };

  let userName = validateUsername(userData.userName);

  let firstName = validateName(userData.firstName, "first name");
  let lastName = validateName(userData.lastName, "last name");
  let email = validateEmail(userData.email);
  let password = validatePassword(userData.password);
  let dob = validateDOB(userData.dob);
  let county = validateCounty(userData.county);
  let zipCode = validateZipCode(userData.zipCode);


  let passwordHash = await bcrypt.hash(password, 12);

  let updateDoc = {
    userName,
    firstName,
    lastName,
    dob,
    role: userData.role || "citizen",
    email,
    county,
    zipCode,
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
