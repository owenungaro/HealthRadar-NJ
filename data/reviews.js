import { ObjectId } from "mongodb";
import { reviews as reviewsCollections } from "../config/mongoCollections.js";
import { sanitizeString } from "../helpers.js";
import { usersData } from "./index.js";

export async function createReview(review, userId, hospitalId) {
  const sanitizedReview = sanitizeString(review);

  if (sanitizedReview.length < 5 || sanitizedReview.length > 500)
    throw "Review must be between 5 and 500 characters!";

  if (!ObjectId.isValid(userId)) throw "Invalid user ID.";
  if (!ObjectId.isValid(hospitalId)) throw "Invalid hospital ID.";

  const reviews = await reviewsCollections();

  const newReview = {
    review: sanitizedReview,
    facilityID: new ObjectId(hospitalId),
    userID: new ObjectId(userId),
    createdAt: new Date(),
  };

  const insertResult = await reviews.insertOne(newReview);

  return insertResult;
}

export async function getReviewsByUser(userId) {
  if (!ObjectId.isValid(userId)) throw "Invalid user ID.";

  const reviews = await reviewsCollections();

  const desiredReviews = await reviews
    .find({ userID: new ObjectId(userId) })
    .toArray();

  for (let review of desiredReviews) {
    try {
      const user = await usersData.findUserById(review.userID.toString());
      review.username = user.userName;
    } catch (e) {
      review.username = "Unknown User";
    }

    review.dateFormatted = new Date(review.createdAt).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  }

  //   if (desiredReviews.length === 0)
  //     throw "User is either invalid, or there were no reviews with this given user.";

  return desiredReviews;
}

export async function getReviewsByHospital(hospitalId) {
  if (!ObjectId.isValid(hospitalId)) throw "Invalid hospital ID.";

  const reviews = await reviewsCollections();

  const desiredReviews = await reviews
    .find({ facilityID: new ObjectId(hospitalId) })
    .toArray();

  for (let review of desiredReviews) {
    try {
      const user = await usersData.findUserById(review.userID.toString());
      review.username = user.userName;
    } catch (e) {
      review.username = "Unknown User";
    }

    review.dateFormatted = new Date(review.createdAt).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  }

  //   if (desiredReviews.length === 0)
  //     throw "User is either invalid, or there were no reviews with this given user.";
  return desiredReviews;
}
