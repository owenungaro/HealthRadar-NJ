import { Router } from "express";
import { facilitiesData } from "../data/index.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

// List facilities with filters
router.get("/", requireAuth, async (req, res) => {
  try {
    const { county, city, facilityType, isActive } = req.query;

    const facilities = await facilitiesData.getFacilities({
      county,
      city,
      facilityType,
      isActive: isActive !== "" ? isActive : undefined,
    });

    // if this is an AJAX request
    if (req.headers['x-requested-with'] === 'XMLHttpRequest' || req.headers.accept.includes('application/json')) {
      return res.json({ facilities });
    }

    // Otherwise, render the list page as usual
    res.render("facilities/list", {
      title: "Facilities - HealthRadar NJ",
      facilities,
      filters: {
        county: county || "",
        city: city || "",
        facilityType: facilityType || "",
        isActive: isActive || "",
      },
      user: req.session.user || null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).render("error", {
      title: "Error",
      error: "Could not load facilities.",
    });
  }
});


router.get("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const facility = await facilitiesData.getFacilityById(id);

  
    const user = req.session.user || null;

    res.render("facilities/detail", {
      title: facility.licensedFacilityName,
      facility,
      user,
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