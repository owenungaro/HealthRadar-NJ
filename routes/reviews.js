import { Router } from "express";
import { reviewsData } from "../data/index.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = req.session.user._id;
    const reviews = await reviewsData.getReviewsByUser(userId);

    res.render("reviews/list", {
      title: "My Reviews",
      user: req.session.user,
      reviews,
    });
  } catch (err) {
    res.status(500).render("error", { error: "Failed to load reviews" });
  }
});

export default router;
