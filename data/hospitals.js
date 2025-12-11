import { hospitals as hospitalCollections } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";
import { sanitizeString, checkId, cleanString, normalizePhone } from "../helpers.js";

//strictly for database seeding
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
    licensedFacilityName: hospitalName,
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

export async function getFacilityById(id) {
  id = checkId(id, "facilityId");
  const facilities = await hospitalCollections();
  const facility = await facilities.findOne({ _id: new ObjectId(id) });

  if (!facility) throw "Facility not found";

  return facility;
}

export async function getHospitalsThroughFiter(filters = {}) {
  const hospitals = await hospitalCollections();
  const query = {};

  if (filters.county) {
    let county = filters.county;
    if (typeof county !== "string") throw "Invalid county type.";
    if (county.trim().length === 0) throw "County cannot be empty.";

    county = county.trim().toUpperCase();
    query.county = { $regex: county, $options: "i" }; // changed for filtering facilities with keywords
  }

  if (filters.city) {
    let city = filters.city;
    if (typeof city !== "string") throw "Invalid city type.";
    if (city.trim().length === 0) throw "City cannot be empty.";

    city = city.trim().toUpperCase();
    query.city = { $regex: city, $options: "i" }; // changed for filtering facilities with keywords
  }

  if (filters.facility_type) {
    let facilityType = filters.facility_type;
    if (typeof facilityType !== "string") throw "Invalid facility type.";
    if (facilityType.trim().length === 0)
      throw "Facility type cannot be empty.";

    facilityType = facilityType.trim().toUpperCase();
    query.facility_type = { $regex: facilityType, $options: "i" }; // changed for filtering facilities with keywords
  }

  if (filters.isActive !== undefined) {
    const licenseStatus = filters.isActive;
    if (typeof licenseStatus !== "boolean")
      throw "Invalid license status type.";

    query.isActive = licenseStatus;
  }

  const filteredHospitals = await hospitals.find(query).toArray();

  if (!filteredHospitals) {
    throw "No hospitals found for the desired queries.";
  }

  return filteredHospitals;
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
  licensedOwner,
  latitude,
  longitude,
  isActive,
) {
  if (!ObjectId.isValid(_id)) throw "Invalid ObjectId";
  const id = new ObjectId(_id);

  facility_type = cleanString(facility_type).toUpperCase();
  city = cleanString(city).toUpperCase();
  state = cleanString(state).toUpperCase();
  county = cleanString(county).toUpperCase();

  licenseNumber = cleanString(licenseNumber);
  licensedFacilityName = cleanString(licensedFacilityName);
  address = cleanString(address);
  zipCode = cleanString(zipCode);
  telephone = cleanString(telephone);
  telephone = normalizePhone(telephone);
  email = cleanString(email);
  adminName = cleanString(adminName);
  licensedOwner = cleanString(licensedOwner);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) throw "Invalid email format.";

  let expires;
  if (licenseExpires instanceof Date) {
    expires = licenseExpires;
  } else if (typeof licenseExpires === 'string' && licenseExpires.includes('-')) {
    const [year, month, day] = licenseExpires.split('-');
    expires = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)));
  } else {
    expires = new Date(licenseExpires);
  }
  
  if (isNaN(expires.getTime())) throw "Invalid licenseExpires date";

  if (typeof isActive !== "boolean")
    throw "isActive must be boolean";

  if (isNaN(Number(latitude))) throw "latitude must be numeric";
  if (isNaN(Number(longitude))) throw "longitude must be numeric";


  latitude = Number(latitude);
  longitude = Number(longitude);


  const updateDoc = {
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
    licenseExpires: typeof licenseExpires === 'string' ? licenseExpires : expires,
    adminName,
    licensedOwner,
    latitude,
    longitude,
    isActive,
  };

  const hospitals = await hospitalCollections();
  const result = await hospitals.updateOne(
    { _id: id },
    { $set: updateDoc }
  );

  if (!result) throw "No hospital found with that id";
  return result;
}


export async function deleteHospital(_id) {
  if (!ObjectId.isValid(_id)) throw "Invalid mongo id provided.";
  const hospitals = await hospitalCollections();
  const id = new ObjectId(_id);

  const deletedHospital = await hospitals.deleteOne({ _id: id });
  if (deletedHospital.deletedCount === 0) throw "Unable to delete hospital.";

  return deletedHospital;
}
