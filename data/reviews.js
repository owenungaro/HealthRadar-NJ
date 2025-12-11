import { ObjectId } from "mongodb";
import { reviews as reviewsCollections } from "../config/mongoCollections.js";
import { sanitizeString } from "../helpers.js";
import { usersData } from "./index.js";
import { hospitals as hospitalCollections } from "../config/mongoCollections.js";

export async function createReview(review, rating, userId, hospitalId) {
  review = sanitizeString(review);
  if (review.length < 5 || review.length > 500) {
    throw "Review must be between 5 and 500 characters!";
  }

  if (rating === undefined || rating === null) {
    throw "Rating not found";
  }

  const numericRating = Number(rating);
  if (isNaN(numericRating)) {
    throw "Rating must be a number";
  }
  if (numericRating < 0.5 || numericRating > 5) {
    throw "Rating must be between 0.5 and 5";
  }
  if (Math.round(numericRating * 2) !== numericRating * 2) {
    throw "Rating must be in 0.5 increments";
  }

  if (!ObjectId.isValid(userId)) {
    throw "Invalid user ID.";
  }
  if (!ObjectId.isValid(hospitalId)) {
    throw "Invalid hospital ID.";
  }

  const reviews = await reviewsCollections();

  const newReview = {
    review,
    rating: numericRating,
    facilityID: new ObjectId(hospitalId),
    userID: new ObjectId(userId),
    createdAt: new Date(),
  };

  const insertResult = await reviews.insertOne(newReview);

  const hospitalObjectId = new ObjectId(hospitalId);

  const results = await reviews
    .aggregate([
      { $match: { facilityID: hospitalObjectId } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ])
    .toArray();

  let avgPercent = null;
  let totalReviews = 0;

  if (results.length > 0) {
    const avgStars = results[0].avgRating;
    totalReviews = results[0].count;

    avgPercent = Math.round((avgStars / 5) * 100 * 10) / 10;
  }

  const hospitals = await hospitalCollections();

  await hospitals.updateOne(
    { _id: hospitalObjectId },
    {
      $set: {
        averageRating: avgPercent,
        totalReviews: totalReviews,
      },
    }
  );

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
