import { Router } from "express";
import { facilitiesData } from "../data/index.js";

const router = Router();

// List facilities with filters
router.get("/", async (req, res) => {
  try {
    const { county, city, facilityType, isActive } = req.query;

    const facilities = await facilitiesData.getFacilities({
      county,
      city,
      facilityType,
      isActive,
    });

    res.render("facilities/list", {
      title: "Facilities - HealthRadar NJ",
      facilities,
      filters: {
        county: county || "",
        city: city || "",
        facilityType: facilityType || "",
        isActive: isActive || "",
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).render("error", {
      title: "Error",
      error: "Could not load facilities.",
    });
  }
});

// Facility detail page

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const facility = await facilitiesData.getFacilityById(id);

    // TODO: later fetch reviews for this facility
    // const reviews = await reviewsData.getReviewsByFacility(id);

    res.render("facilities/detail", {
      title: facility.licensedFacilityName,
      facility,
      // reviews,
    });
  } catch (err) {
    console.error(err);
    res.status(404).render("error", {
      title: "Facility Not Found",
      error: "Facility not found.",
    });
  }
});

export default router;
