import dotenv from "dotenv";
dotenv.config();

import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import exphbs from "express-handlebars";
import path from "path";
import { fileURLToPath } from "url";

import connectDb from "./config/mongoConnection.js";
import configRoutes from "./routes/index.js";
import { seedHospitals } from "./seed/seed.js";
import { requireAuth } from "./middleware/authMiddleware.js";

const isProd = process.env.NODE_ENV === "production";

console.log("URI:", process.env.MONGO_URI);
console.log("DB:", process.env.MONGO_DB_NAME);

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/public", express.static(path.join(__dirname, "public")));

// Handlebars setup
const hbs = exphbs.create({
  defaultLayout: "main",
  layoutsDir: path.join(__dirname, "views/layouts"),
});
app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

// Connect DB (once at startup)
await connectDb();

// Seed hospitals if required
if (process.env.RUN_SEED === "true" || process.env.RUN_SEED === "TRUE") {
  await seedHospitals();
  console.log("Finished seeding");
}

// Sessions stored in Mongo
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      dbName: process.env.MONGO_DB_NAME,
      collectionName: "sessions",
    }),
    cookie: {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 2,
    },
  })
);

app.get("/", (req, res) => {
  res.render("home", {
    title: "HealthRadar NJ",
    user: req.session.user || null,
  });
});

app.get("/dashboard", requireAuth, (req, res) => {
  res.render("dashboard", {
    title: "HealthRadar NJ Dashboard",
    user: req.session.user,
  });
});

configRoutes(app);

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});



/*
Testing
*/

import { searchHospitalByName, getHospitalsThroughFiter } from "./data/hospitals.js"; 

const hospitalList = await getHospitalsThroughFiter({facility_type: "ambulatory care facility", county: "SOMERset", isActive: true});
console.log(hospitalList);