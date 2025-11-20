//_id
//facility_type
//licenseNumber
//licensedFacilityName
//address
//city
//state
//zipCode
//county
//telephone
//email
//licenseExpires
//adminName
//adminUserName = NULL
//licensedOwner
//latitude
//longitude
//isActive = true
//averageRating = NULL
//totalReviews = 0

import axios from "axios";
import { ObjectId } from "mongodb";
import { createHospital } from "../data/hospitals.js";

export async function seedHospitals() {
  let { data } = await axios.get("https://data.nj.gov/resource/mrzk-zrvp.json");

  let hospitals = [];

  for (let hospital of data) {
    let latitude = null;
    let longitude = null;

    if (hospital.geocoded_column && hospital.geocoded_column.coordinates) {
      longitude = hospital.geocoded_column.coordinates[0];
      latitude = hospital.geocoded_column.coordinates[1];
    }

    if (hospital.address) {
    }

    let obj = {
      // _id: new ObjectId(),
      facility_type: hospital.facility_type || null,
      licenseNumber: hospital.lic || null,
      licensedFacilityName: hospital.licensed_name || null,
      address: hospital.address?.replace(/\n/g, " ") || null,
      city: hospital.fac_city || null,
      state: hospital.fac_st || null,
      zipCode: hospital.zip || null,
      county: hospital.county || null,
      telephone: hospital.telephone || null,
      email: hospital.facemail || null,
      licenseExpires: hospital.lic_expires || null,
      licensedBeds: hospital.hospbedtotal || 0,
      adminName: hospital.admin || null,
      adminUserName: null,
      licensedOwner: hospital.licensed_owner || null,
      latitude,
      longitude,
      isActive: true,
      averageRating: null,
      totalReviews: 0,
    };

    hospitals.push(obj);
  }

  // console.log(JSON.stringify(hospitals.slice(0, 20), null, 2));
  console.log("Hospital API Finished");
  console.log(hospitals.length);

  for (const hospitalObj of hospitals) {
    try {
      await createHospital(hospitalObj);
    } catch (err) {
      console.error("Error inserting hospital:", err.message);
    }
  }
}
