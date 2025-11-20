import {hospitals as hospitalsCollections} from "../config/mongoCollections.js";

export async function searchHospitalByName(hospitalName) {
    const hospitals = await hospitalsCollections();

    if (hospitalName === null || hospitalName === undefined) throw "Hospital name is null or undefined.";
    if (typeof hospitalName !== 'string') throw "Invalid hospital name type.";
    if (hospitalName.trim().length === 0) throw "Hospital name cannot be empty.";

    hospitalName = hospitalName.trim().toUpperCase();
    
   const desiredHospital = await hospitals.findOne({
        licensed_name: hospitalName
    });

    if(!desiredHospital) throw "Desired hospital was not found.";

    return desiredHospital;
}

export async function searchHospitalsByCity(city) {
    const hospitals = await hospitalsCollections();

    if (city === null || city === undefined) throw "City is null or undefined.";
    if (typeof city !== 'string') throw "Invalid city type.";
    if (city.trim().length === 0) throw "City cannot be empty.";

    city = city.trim().toUpperCase();

    const hospitalsByCity = await hospitals.find({ fac_city: city }).toArray();

    if (hospitalsByCity.length === 0) throw "No hospitals found in the specified city.";
    
    return hospitalsByCity;
}


export async function searchHospitalsByState(state) {
    const hospitals = await hospitalsCollections();

    if (state === null || state === undefined) throw "State is null or undefined.";
    if (typeof state !== 'string') throw "Invalid state type.";
    if (state.trim().length === 0) throw "State cannot be empty.";

    state = state.trim().toUpperCase();

    const hospitalsByState = await hospitals.find({ fac_st: state }).toArray();

    if (hospitalsByState.length === 0) throw "No hospitals found in the specified state.";
    
    return hospitalsByState;
}

export async function searchHospitalsByCounty(county) {
    const hospitals = await hospitalsCollections();

    if (county === null || county === undefined) throw "County is null or undefined.";
    if (typeof county !== 'string') throw "Invalid county type.";
    if (county.trim().length === 0) throw "County cannot be empty.";

    county = county.trim().toUpperCase();

    const hospitalsByCounty = await hospitals.find({ county: county }).toArray();

    if (hospitalsByCounty.length === 0) throw "No hospitals found in the specified county.";
    
    return hospitalsByCounty;
}

export async function updateHospital(_id, facility_type, licenseNumber, licensedFacilityName, address, city, state, zipCode, county, telephone, email, licenseExpires, adminName, adminUserName, licensedOwner, latitude, longitude, isActive, averageRating, totalReviews) {}
