import { hospitals as hospitalCollection } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";

export async function createHospital(hospitalData) {
  const hospitals = await hospitalCollection();

  const doc = {
    _id: new ObjectId(),
    facility_type: hospitalData.facility_type,
    licenseNumber: hospitalData.licenseNumber,
    licensedFacilityName: hospitalData.licensedFacilityName,
    address: hospitalData.address,
    city: hospitalData.city,
    state: hospitalData.state,
    zipCode: hospitalData.zipCode,
    county: hospitalData.county,
    telephone: hospitalData.telephone,
    email: hospitalData.email,
    licenseExpires: hospitalData.licenseExpires,
    licensedBeds: hospitalData.licensedBeds,
    adminName: hospitalData.adminName,
    adminUserName: hospitalData.adminUserName,
    licensedOwner: hospitalData.licensedOwner,
    latitude: hospitalData.latitude,
    longitude: hospitalData.longitude,
    isActive: hospitalData.isActive,
    averageRating: hospitalData.averageRating,
    totalReviews: hospitalData.totalReviews,
  };

  const result = await hospitals.insertOne(doc);
  return { _id: result.insertedId, ...doc };
}
