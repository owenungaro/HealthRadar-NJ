import { Router } from "express";
import bcrypt from "bcrypt";
import { usersData } from "../data/index.js"; // Assuming you have user data functionality
import { sanitizeString } from "../helpers.js";

const router = Router();

// Route for sign up
router.get("/signup", (req, res) => {
  res.render("signup", { title: "Sign Up" });
});

// Route for sign up
router.post("/signup", async (req, res) => {
  try {
    let {
      userName,
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      county,
      preferredLanguage,
      zipCode,
      dob,
    } = req.body;

    // Validations
    if (
      !userName ||
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !county ||
      !preferredLanguage ||
      !zipCode ||
      !dob
    ) {
      return res.status(400).render("signup", {
      title: "Sign Up",
      hasErrors: true,
      errors: ["All fields are required."],
      ...req.body
    });
    }

    if (password !== confirmPassword) {
      return res.status(400).render("signup", {
      title: "Sign Up",
      hasErrors: true,
      errors: ["Passwords do not match."],
      ...req.body
    });
    }

    // Sanitize inputs
    userName = sanitizeString(userName);
    firstName = sanitizeString(firstName);
    lastName = sanitizeString(lastName);
    email = sanitizeString(email);
    county = sanitizeString(county);
    zipCode = sanitizeString(zipCode);
    preferredLanguage = sanitizeString(preferredLanguage);
    dob = sanitizeString(dob);

    const existingUser = await usersData.findUserByEmailOrUsername(email);
    if (existingUser) {
      return res.status(400).render("signup", {
      title: "Sign Up",
      hasErrors: true,
      errors: ["User already exists."],
      ...req.body
    });

    }



    // Create new user
    const user = await usersData.createUser({
      userName,
      firstName,
      lastName,
      email,
      dob,
      county,
      zipCode,
      preferredLanguage,
      password: password,
    });

    // Create session for the user
    req.session.user = {
      _id: user._id,
      userName: user.userName,
      email: user.email,
    };

    res.redirect("/dashboard"); // Redirect to the dashboard after successful signup
  } catch (err) {
    console.error(err);
  return res.status(400).render("signup", {
    title: "Sign Up",
    hasErrors: true,
    errors: [err.toString()],
    ...req.body });
  }
});

// Route for login (POST)
router.post("/login", async (req, res) => {
  try {
    let { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ error: "Missing credentials" });
    }

    // Sanitize identifier
    identifier = sanitizeString(identifier);

    // Find user by email or username
    const user = await usersData.findUserByEmailOrUsername(identifier);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check password
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Create session for the user
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
        role: user.role
      };

      // Redirect to dashboard after successful login
      res.redirect("/dashboard");
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

// Logout Route
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error during session destruction", err);
      return res.status(500).json({ error: "Failed to log out" });
    }
    res.redirect("/"); // Redirect to home page after successful logout
  });
});

export default router;
