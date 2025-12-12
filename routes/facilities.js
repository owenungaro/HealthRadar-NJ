import { Router } from "express";
import { hospitalsData, reviewsData } from "../data/index.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { sanitizeString } from "../helpers.js";
import { getReviewsByHospital } from "../data/reviews.js";

const router = Router();

// List hospitals with filters
router.get("/", requireAuth, async (req, res) => {
  try {
    const { county, city, facility_type, isActive } = req.query;

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

    // Render list 
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

router
  .route("/:id")
  .post(requireAuth, async (req, res) => {
    try {
      const hospitalId = req.params.id;
      const userId = req.session.user._id;
      const { reviewText, rating } = req.body;

      //Sanitizing and creating review.
      const cleanedReviewText = sanitizeString(reviewText);

      await reviewsData.createReview(
        cleanedReviewText,
        Number(rating),
        userId,
        hospitalId
      );

      // redirect back to the facility detail page
      return res.redirect(`/facilities/${hospitalId}`);
    } catch (err) {
      const hospitalId = req.params.id;
      const hospital = await hospitalsData.getFacilityById(hospitalId);
      const reviews = await reviewsData.getReviewsByHospital(hospitalId);

      return res.status(400).render("hospitals/detail", {
        title: hospital.licensedFacilityName,
        hospital,
        facility: hospital,
        user: req.session.user || null,
        reviews,
        reviewError: err.toString(),
      });
    }
  })
  .get(requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const hospital = await hospitalsData.getFacilityById(id);
      const reviews = await reviewsData.getReviewsByHospital(id);

      res.render("hospitals/detail", {
        title: hospital.licensedFacilityName,
        hospital,
        facility: hospital,
        user: req.session.user || null,
        reviews,
      });
    } catch (err) {
      // console.error(err);
      res.status(404).render("error", {
        title: "Hospital Not Found",
        error: "Hospital not found.",
      });
    }
  });

router.get("/:id/edit", requireAuth, async (req, res) => {
  try {
    if (req.session.user.role !== "admin") {
      return res.status(403).render("error", {
        title: "Forbidden",
        error: "You are not authorized to edit facilities.",
      });
    }

    const hospital = await hospitalsData.getFacilityById(req.params.id);

    hospital.licenseExpiresFormatted = hospital.licenseExpires
      ? new Date(hospital.licenseExpires).toISOString().split("T")[0]
      : "";

    res.render("hospitals/editHospital", {
      title: `Edit ${hospital.licensedFacilityName}`,
      hospital,
      facility: hospital,
      user: req.session.user,
    });
  } catch (err) {
    res.status(404).render("error", {
      title: "Not Found",
      error: "Hospital not found.",
    });
  }
});

router.post("/:id/edit", requireAuth, async (req, res) => {
  try {
    if (req.session.user.role !== "admin") {
      return res.status(403).render("error", {
        title: "Forbidden",
        error: "You are not authorized to edit facilities.",
      });
    }

    const updatedData = req.body;

  //Sanitizing/XSS for admin dashboard
  for (const key in updatedData) {
    if (typeof updatedData[key] === "string") {
      updatedData[key] = sanitizeString(updatedData[key]);
    }
  }

    delete updatedData.adminUserName;
    updatedData.isActive = updatedData.isActive === "true";
    updatedData.latitude = Number(updatedData.latitude);
    updatedData.longitude = Number(updatedData.longitude);
    
    await hospitalsData.updateHospital(
      req.params.id,
      updatedData.facility_type,
      updatedData.licenseNumber,
      updatedData.licensedFacilityName,
      updatedData.address,
      updatedData.city,
      updatedData.state,
      updatedData.zipCode,
      updatedData.county,
      updatedData.telephone,
      updatedData.email,
      updatedData.licenseExpires,
      updatedData.adminName,
      updatedData.licensedOwner,
      updatedData.latitude,
      updatedData.longitude,
      updatedData.isActive
    );

    return res.redirect(`/facilities/${req.params.id}`);
  } catch (err) {
    console.error(err);

    const hospital = await hospitalsData.getFacilityById(req.params.id);

    hospital.licenseExpiresFormatted = hospital.licenseExpires
      ? hospital.licenseExpires.toISOString().split("T")[0]
      : "";

    return res.status(400).render("hospitals/editHospital", {
      title: `Edit ${hospital.licensedFacilityName}`,
      hospital,
      facility: hospital,
      user: req.session.user,
      error: err.toString(),
    });
  }
});

router.post("/:id/delete", requireAuth, async (req, res) => {
  try {
    if (req.session.user.role !== "admin") {
      return res.status(403).render("error", {
        title: "Forbidden",
        error: "You are not authorized to delete facilities.",
      });
    }

    await hospitalsData.deleteHospital(req.params.id);
    return res.redirect("/facilities"); 
  } catch (err) {
    console.error(err);
    return res.status(500).render("error", { title: "Error", error: err });
  }
});

export default router;
