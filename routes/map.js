import { Router } from "express";
import { hospitalsData } from "../data/index.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();


router.get("/", async (req, res) => {
  try {
    const hospitals = await hospitalsData.getHospitalsThroughFiter({});

    res.render("map", {
      title: "Interactive Facility Map",
      hospitals,
      user: req.session.user || null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).render("error", {
      title: "Map Error",
      error: "Could not load map data.",
    });
  }
});

export default router;
