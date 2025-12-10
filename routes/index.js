import authRoutes from "./auth.js";
import facilitiesRoutes from "./facilities.js";
import emergencyRoutes from "./emergency.js";
import analyticsRoutes from "./analytics.js";
import i18next from "../app.js";

const constructorMethod = (app) => {
  app.use("/auth", authRoutes);
  app.use("/facilities", facilitiesRoutes);
  app.use("/emergency", emergencyRoutes);
  app.use("/analytics", analyticsRoutes);
  app.get("/language", (req, res) => {
    if (i18next.language == "en") {
      i18next.changeLanguage("es", () => {
        res.redirect(req.headers.referer)
      })
    }
    else {
      i18next.changeLanguage("en", () => {
        res.redirect(req.headers.referer)
      })
    }
  })

  app.get("/", (req, res) => {
    res.render("home", {
      title: "HealthRadar NJ",
      user: req.session.user || null,
    });
  });

  app.use("*", (req, res) => {
    res.status(404).json({ error: "Route not found" });
  });
};

export default constructorMethod;
