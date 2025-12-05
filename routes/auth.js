import { Router } from "express";
import bcrypt from "bcrypt";
import { usersData } from "../data/index.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

// simple sanitizer to strip leading/trailing spaces
// and neutralize characters that can be used in XSS payloads
function sanitizeString(value) {
  if (typeof value !== "string") return value;
  return value
    .trim()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

router.get("/signup", (req, res) => {
  res.render("signup", { title: "Sign Up" });
});

// signup part
router.post("/signup", async (req, res) => {
  try {
    let {
      userName,
      firstName,
      lastName,
      dob,
      role,
      email,
      county,
      zipCode,
      preferredLanguage,
      password,
      confirmPassword,
    } = req.body;

    // basic required checks
    if (
      !userName ||
      !firstName ||
      !lastName ||
      !dob ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    // sanitize all string inputs before saving to DB
    userName = sanitizeString(userName);
    firstName = sanitizeString(firstName);
    lastName = sanitizeString(lastName);
    email = sanitizeString(email);
    county = sanitizeString(county);
    zipCode = sanitizeString(zipCode);
    preferredLanguage = sanitizeString(preferredLanguage);
    role = sanitizeString(role);

    const user = await usersData.createUser({
      userName,
      firstName,
      lastName,
      dob, 
      role,
      email,
      county,
      zipCode,
      preferredLanguage,
      password,
    });

    // session object uses sanitized data from DB
    req.session.user = {
      _id: user._id,
      userName: user.userName,
      email: user.email,
      role: user.role,
    };

    res.status(201).json({
      message: "Signup successful",
      user: req.session.user,
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({
      error: err.message || "Signup failed",
    });
  }
});

// login part
router.post("/login", async (req, res) => {
  try {
    let { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ error: "Missing credentials" });
    }

    // trim + sanitize identifier to avoid weird injection strings
    identifier = sanitizeString(identifier);

    const user = await usersData.findUserByEmailOrUsername(identifier);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // optional hardening: regenerate session ID on login
    req.session.regenerate((err) => {
      if (err) {
        console.error(err);
        return res
          .status(500)
          .json({ error: "Could not create secure session" });
      }

      req.session.user = {
        _id: user._id,
        userName: user.userName,
        email: user.email,
        role: user.role,
      };

      res.json({
        message: "Login successful",
        user: req.session.user,
      });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Login failed",
    });
  }
});

// logout part
router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out" });
  });
});

router.get("/me", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  res.json({ user: req.session.user });
});

router.get("/protected", requireAuth, (req, res) => {
  res.json({
    message: "You are authenticated",
    user: req.session.user,
  });
});

export default router;
