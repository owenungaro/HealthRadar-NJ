import { Router } from "express";
import bcrypt from "bcrypt";
import { usersData } from "../data/index.js"; 
import { sanitizeString } from "../helpers.js";

const router = Router();

// Signup Route
router.get("/signup", (req, res) => {
  res.render("signup", { title: "Sign Up" });
});


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
    password = sanitizeString(password);
    confirmPassword = sanitizeString(confirmPassword); 

    const existingUser = await usersData.findUserByEmailOrUsername(email);
    if (existingUser) {
      return res.status(400).render("signup", {
      title: "Sign Up",
      hasErrors: true,
      errors: ["User already exists."],
      ...req.body
    });

    }



    // New User Creation
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

// Route for login 
router.post("/login", async (req, res) => {
  try {
    let { identifier, password } = req.body;

    if (!identifier || !password) {
    req.session.routeError = "missing credentials";
    return res.redirect("/");

    }

    // Sanitize identifier
    try {
    identifier = sanitizeString(identifier);
  } catch (e) {
    req.session.routeError = "Invalid username or email format";
    return res.redirect("/");
  }

    try {
      password = sanitizeString(password);
    } catch (e) {
      req.session.routeError = "Invalid password format";
      return res.redirect("/");
    }

    const user = await usersData.findUserByEmailOrUsername(identifier);
    if (!user) {
    req.session.routeError = "missing credentials";
    return res.redirect("/");

    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
    req.session.routeError = "Invalid credentials";
    return res.redirect("/");

    }

    // session for the user
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

      res.redirect("/dashboard"); // Redirect to dashboard after login
    });
  } catch (err) {
  console.error(err);
  req.session.routeError = "Login failed. Please check your username and password.";
  return res.redirect("/");
}
});

// Logout Route
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error during session destruction", err);
      return res.status(500).json({ error: "Failed to log out" });
    }
    res.redirect("/"); // Redirect to home page after logout
  });
});

export default router;
