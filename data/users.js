
import bcrypt from 'bcrypt';
import { users as usersCollection } from '../config/mongoCollections.js';

export async function createUser(userData) {
  const users = await usersCollection();

  const existing = await users.findOne({
    $or: [
      { email: userData.email.toLowerCase() },
      { userName: userData.userName }
    ]
  });

  if (existing) {
    throw new Error('User with this email or username already exists');
  }

  const passwordHash = await bcrypt.hash(userData.password, 12);

  const doc = {
    userName: userData.userName,
    firstName: userData.firstName,
    lastName: userData.lastName,
    dob: userData.dob,
    role: userData.role || 'citizen',
    email: userData.email.toLowerCase(),
    county: userData.county || null,
    zipCode: userData.zipCode || null,
    preferredLanguage: userData.preferredLanguage || 'en',
    twoFactorEnabled: false,
    passwordHash,
    createdAt: new Date().toISOString(),
    isVerified: false
  };

  const result = await users.insertOne(doc);
  return { _id: result.insertedId, ...doc };
}

export async function findUserByEmailOrUsername(identifier) {
  const users = await usersCollection();

  return users.findOne({
    $or: [
      { email: identifier.toLowerCase() },
      { userName: identifier }
    ]
  });
}
