/** Express app for jobly. */

const express = require("express");
const ExpressError = require("./helpers/expressError");
const morgan = require("morgan");
const companyRoutes = require("./routes/companies");
const jobRoutes = require("./routes/jobs");
const userRoutes = require("./routes/users");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const User = require("./models/user");
const { SECRET_KEY } = require("./config");
const { authenticate } = require("./helpers/auth")

const app = express();

app.use(express.json());
app.use(authenticate);

// add logging system
app.use(morgan("tiny"));

app.use("/companies", companyRoutes);
app.use("/jobs", jobRoutes);
app.use("/users", userRoutes);

app.post("/login", async function (req, res, next) {
  try {
    let { username, password } = req.body;
    let user = await User.getByUsername(username);
    if (user) {
      if (await bcrypt.compare(password, user.password) === true) {
        let token = jwt.sign({username, is_admin: user.is_admin}, SECRET_KEY);
        return res.json({ token });
      }
    }
    throw new ExpressError("Invalid user/password", 400);
  } catch (err) {
    next(err);
  }
});

/** 404 handler */

app.use(function (req, res, next) {
  const err = new ExpressError("Not Found", 404);

  // pass the error to the next piece of middleware
  return next(err);
});

/** general error handler */

app.use(function (err, req, res, next) {
  res.status(err.status || 500);

  return res.json({
    status: err.status,
    message: err.message,
  });
});

module.exports = app;
