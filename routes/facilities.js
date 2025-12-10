import { Router } from "express";
import { hospitalsData } from "../data/index.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

// List hospitals with filters
router.get("/", requireAuth, async (req, res) => {
  try {
    const { county, city, facility_type, isActive } = req.query;

    // Build filters object exactly like old facilities route
    const filters = {
      county: county || undefined,
      city: city || undefined,
      facility_type: facility_type || undefined,
      isActive:
        isActive !== undefined && isActive !== ""
          ? isActive === "true" || isActive === true
          : undefined,
    };

    const hospitals = await hospitalsData.getHospitalsThroughFiter(filters);

    // AJAX / fetch() detection
    if (
      req.headers["x-requested-with"] === "XMLHttpRequest" ||
      (req.headers.accept && req.headers.accept.includes("application/json"))
    ) {
      return res.json({ hospitals });
    }

    // Render list (same structure as old facilities route)
    res.render("facilities/list", {
      title: "Hospitals - HealthRadar NJ",
      hospitals,
      filters: {
        county: county || "",
        city: city || "",
        facility_type: facility_type || "",
        isActive: isActive || "",
      },
      user: req.session.user || null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).render("error", {
      title: "Error",
      error: "Could not load hospitals.",
    });
  }
});

// Get hospital by ID
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const hospital = await hospitalsData.getFacilityById(id);

    res.render("hospitals/detail", {
      title: hospital.licensedFacilityName,
      hospital,
      facility: hospital,
      user: req.session.user || null,
    });
  } catch (err) {
    console.error(err);
    res.status(404).render("error", {
      title: "Hospital Not Found",
      error: "Hospital not found.",
    });
  }
});

export default router;
