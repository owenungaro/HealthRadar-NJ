import authRoutes from "./auth.js";
import facilitiesRoutes from "./facilities.js";
import emergencyRoutes from "./emergency.js";
import analyticsRoutes from "./analytics.js";
import reviewsRoutes from "./reviews.js";
import i18next from "../app.js";
import mapRoutes from "./map.js";


const constructorMethod = (app) => {
  app.use("/map", mapRoutes);
  app.use("/auth", authRoutes);
  app.use("/facilities", facilitiesRoutes);
  app.use("/emergency", emergencyRoutes);
  app.use("/analytics", analyticsRoutes);
  app.use("/reviews", reviewsRoutes);
  app.get("/language", (req, res) => {
    if (i18next.language == "en") {
      i18next.changeLanguage("es", () => {
        res.redirect(req.headers.referer);
      });
    } else {
      i18next.changeLanguage("en", () => {
        res.redirect(req.headers.referer);
      });
    }
  });

  app.get("/", (req, res) => {
    const errorMessage = req.query.error ||req.session.routeError  || null;;
    req.session.routeError = null;

    res.render("home", {
      title: "HealthRadar NJ",
      user: req.session.user || null,
      routeError: errorMessage,
    });
  });

  app.use("*", (req, res) => {
    req.session.routeError = "Page not found. You were redirected home.";
    res.redirect("/");
  });
};

export default constructorMethod;
