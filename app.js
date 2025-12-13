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
import { createAdmin } from "./data/users.js";
import "./helpers.js"; 

import i18next from "i18next";
import mapRoutes from "./routes/map.js";

const isProd = process.env.NODE_ENV === "production";

console.log("URI:", process.env.MONGO_URI);
console.log("DB:", process.env.MONGO_DB_NAME);

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/public", express.static(path.join(__dirname, "public")));

i18next.init({
  lng: "en",
  fallbackLng: "en",
  resources: {
    es: {
      translation: {
        "Sign In": "iniciar sesión",
        "HealthRadar NJ": "HealthRadar NJ",
        "High Contrast Mode": "Modo de contraste alto",
        "Explore Facilities": "Explora las instalaciones",
        "See Reviews": "ver reseñas",
        "User Profile": "perfil de usuario",
        "Analytics Dashboard": "Dashboard de Analytics",
        "Find Emergency Centers": "Encuentra centros de emergencia",
        "Logout": "cerrar sesión",
        "HealthRadar NJ Dashboard": "Panel de control de HealthRadar NJ",
        "Welcome to the HealthRadar NJ Dashboard":
          "Bienvenido al Panel de HealthRadar NJ",
        "Welcome,": "Bienvenidos,",
        "Sign up here": "regístrate aquí",
        "Sign Up": "Registrarse",
        "Username": "Nombre de Usuario",
        "First Name": "Nombre",
        "Last Name": "Apellido",
        "Date of Birth": "Fecha de Nacimiento",
        "Email Address": "Dirección de Correo Electrónico",
        "County": "Condado",
        "Zip Code": "Código Postal",
        "required": "requerido",
        "Password": "Contraseña",
        "Confirm Password": "Confirmar contraseña",
        "Create Account": "Crear Cuenta",
        "Already have an account? Sign in here":
          "¿Ya tienes una cuenta? Inicie sesión aquí",
        "Welcome to Emergency Locator":
          "Bienvenido al Localizador de Emergencia",
        "Back to Dashboard": "Volver al Tablero",
        "Find Your Nearest Emergency Center":
          "Encuentra tu Centro de Emergencias más Cercano",
        "Click the button below to use your current location and find nearby emergency centers.":
          "haga clic en el botón de abajo para utilizar su ubicación actual y encontrar centros de emergencia cercanos.",
        "Use My Location": "Usar mi Ubicación",
        "Emergency Locator - HealthRadar NJ":
          "Localizador de Emergencias - HealthRadar NJ",
        "Facilities by County": "Instalaciones por Condado",
        "Active vs Inactive": "Activo vs Inactivo",
        "Facility Types": "Tipos de Instalaciones",
        "License Expiration Timeline": "Cronología de Caducidad de Licencia",
        "Welcome to Analytics": "Bienvenido de Analytics",
        "Type": "Tipo",
        "Address": "Dirección",
        "County": "Condado",
        "Phone": "Teléfono",
        "Email": "Correo Electrónico",
        "License Expires": "La Licencia Expira",
        "License Status": "Estado de la licencia",
        "Status": "Estado",
        "Active": "Activo",
        "Inactive": "Inactivo",
        "Admin": "Administración",
        "Licensed Beds": "Camas con Licencia",
        "Owner": "Propietario",
        "Average Rating": "Valoración Media",
        "reviews": "comentarios",
        "Reviews": "Comentarios",
        "Reviews feature coming soon.": "Las Reseñas Vienen Pronto.",
        "← Back to facility list": "← Volver a la Lista de Instalaciones",
        "Welcome to Facilities": "Bienvenido a Instalaciones",
        "Hospitals - HealthRadar NJ": "Hospitales - HealthRadar NJ",
        "Filter": "Filtrar",
        "Reset Filters": "restablecer filtros",
        "No facilities found with these filters.":
          "No se han Encontrado Instalaciones con estos Filtros.",
          "You must be logged in to leave a review.": "Debes Iniciar Sesión para Dejar una Reseña.",
          "Submit Review": "Enviar Reseña",
          "Leave a Review": "Deja una Reseña",
          "No reviews yet. Be the first to review this facility!": "Aún no hay Reseñas. ¡Sé el Primero en Revisar esta Instalación!",
          "You haven't written any reviews yet": "Aún no has Escrito Ninguna Reseña",
          "Write your review...": "Escribe tu Reseña...",
          "My Reviews": "Mis Comentarios",
          "All": "Todo",
          "City": "Ciudad",
          "Your Rating": "Su Calificación",
          "Latitude": "Latitud",
          "Longitude": "Longitud",
          "Admin Name": "Nombre de Administrador",
          "Telephone": "Teléfono",
          "State": "Estado",
          "Licensed Facility Name": "Nombre de Instalación con Licencia",
          "License Number": "Número de Licencia",
          "Edit Facility": "Facilidad de Edición",
          "Delete Facility": "Función de Eliminación",
          "Interactive Map": "Mapa interactivo",
          "Interactive Facility Map": "Mapa interactivo de instalaciones"
      },
    },
  },
});

export default i18next;

function translateText(text) {
  return i18next.t(text);
}

// Handlebars setup
const hbs = exphbs.create({
  defaultLayout: "main",
  layoutsDir: path.join(__dirname, "views/layouts"),
  helpers: { translateText,json: (data) => JSON.stringify(data) },
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

// Add admin if required
if (
  process.env.CREATE_ADMIN === "true" ||
  process.env.CREATE_ADMIN === "TRUE"
) {
  await createAdmin({
    userName: "Admin",
    firstName: "System",
    lastName: "Admin",
    dob: "1990-01-01",
    role: "admin",
    email: "admin@example.com",
    county: null,
    zipCode: null,
    password: "Admin123!",
  });

  console.log("Admin added to database");
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

// app.get("/", (req, res) => {
//   res.render("home", {
//     title: "HealthRadar NJ",
//     user: req.session.user || null,
//     language: "en",
//   });
// });

app.get("/dashboard", requireAuth, (req, res) => {
  res.render("dashboard", {
    title: "HealthRadar NJ Dashboard",
    user: req.session.user,
    language: "en"
  });
});

configRoutes(app);

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
