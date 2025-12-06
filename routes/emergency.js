// routes/emergency.js
import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { facilitiesData } from "../data/index.js";

const router = Router();

// Haversine distance in kilometers
function distanceKm(lat1, lon1, lat2, lon2) {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371; // Earth radius in km

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // distance in km
}

// Convert kilometers to miles
function kmToMiles(km) {
  return km * 0.621371;
}

// Emergency Locator main page
router.get("/", requireAuth, async (req, res) => {
  try {
    res.render("emergencyLocator", {
      title: "Emergency Locator - HealthRadar NJ",
      user: req.session.user || null,
    });
  } catch (e) {
    console.error(e);
    res.status(500).render("error", {
      title: "Error",
      error: "Could not load Emergency Locator page.",
    });
  }
});

// Find nearest emergency facility
router.post("/nearest", requireAuth, async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (
      latitude === undefined ||
      longitude === undefined ||
      isNaN(Number(latitude)) ||
      isNaN(Number(longitude))
    ) {
      return res.status(400).json({ error: "Invalid coordinates." });
    }

    const userLat = Number(latitude);
    const userLon = Number(longitude);

    // Get all facilities (you can later filter only emergency-type facilities)
    const facilities = await facilitiesData.getFacilities({}); 

    if (!facilities || facilities.length === 0) {
      return res.status(404).json({ error: "No facilities in database." });
    }

    let nearest = null;
    let nearestDistanceKm = Infinity;

    for (const fac of facilities) {
      const facLat = Number(fac.latitude);
      const facLon = Number(fac.longitude);
      if (isNaN(facLat) || isNaN(facLon)) continue;

      // use our distanceKm helper
      const distKm = distanceKm(userLat, userLon, facLat, facLon);

      if (distKm < nearestDistanceKm) {
        nearestDistanceKm = distKm;
        nearest = fac;
      }
    }

    if (!nearest) {
      return res
        .status(404)
        .json({ error: "Could not find the nearest emergency center." });
    }

    const distanceMiles = kmToMiles(nearestDistanceKm);

    return res.json({
      facility: nearest,
      distanceKm: Number(nearestDistanceKm.toFixed(2)),      
      distanceMiles: Number(distanceMiles.toFixed(2)),       
    });
  } catch (e) {
    console.error("Error in /emergency/nearest:", e);
    res
      .status(500)
      .json({ error: "Server error while finding nearest center." });
  }
});

export default router;
