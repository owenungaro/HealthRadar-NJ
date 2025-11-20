import { hospitals as hospitalCollections } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";

export async function createHospital(hospitalData) {
  const hospitals = await hospitalCollections();

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

export async function searchHospitalByName(hospitalName) {
  const hospitals = await hospitalCollections();

  if (hospitalName === null || hospitalName === undefined)
    throw "Hospital name is null or undefined.";
  if (typeof hospitalName !== "string") throw "Invalid hospital name type.";
  if (hospitalName.trim().length === 0) throw "Hospital name cannot be empty.";

  hospitalName = hospitalName.trim().toUpperCase();

  const desiredHospital = await hospitals.findOne({
    licensed_name: hospitalName,
  });

  if (!desiredHospital) throw "Desired hospital was not found.";

  return desiredHospital;
}

export async function searchHospitalsByCity(city) {
  const hospitals = await hospitalCollections();

  if (city === null || city === undefined) throw "City is null or undefined.";
  if (typeof city !== "string") throw "Invalid city type.";
  if (city.trim().length === 0) throw "City cannot be empty.";

  city = city.trim().toUpperCase();

  const hospitalsByCity = await hospitals.find({ city }).toArray();

  if (hospitalsByCity.length === 0)
    throw "No hospitals found in the specified city.";

  return hospitalsByCity;
}

export async function searchHospitalsByState(state) {
  //Abbreviated to NJ, NY, CT, etc
  const hospitals = await hospitalCollections();

  if (state === null || state === undefined)
    throw "State is null or undefined.";
  if (typeof state !== "string") throw "Invalid state type.";
  if (state.trim().length === 0) throw "State cannot be empty.";

  state = state.trim().toUpperCase();

  const hospitalsByState = await hospitals.find({ state }).toArray();

  if (hospitalsByState.length === 0)
    throw "No hospitals found in the specified state.";

  return hospitalsByState;
}

export async function searchHospitalsByCounty(county) {
  const hospitals = await hospitalCollections();

  if (county === null || county === undefined)
    throw "County is null or undefined.";
  if (typeof county !== "string") throw "Invalid county type.";
  if (county.trim().length === 0) throw "County cannot be empty.";

  county = county.trim().toUpperCase();

  const hospitalsByCounty = await hospitals.find({ county }).toArray();

  if (hospitalsByCounty.length === 0)
    throw "No hospitals found in the specified county.";

  return hospitalsByCounty;
}

export async function updateHospital(
  _id,
  facility_type,
  licenseNumber,
  licensedFacilityName,
  address,
  city,
  state,
  zipCode,
  county,
  telephone,
  email,
  licenseExpires,
  adminName,
  adminUserName,
  licensedOwner,
  latitude,
  longitude,
  isActive,
  averageRating,
  totalReviews
) {}
