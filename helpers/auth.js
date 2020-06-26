const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

function authenticate(req, res, next) {
  try {
    const tokenFromBody = req.body._token;
    const payload = jwt.verify(tokenFromBody, SECRET_KEY);
    req.user = payload; // create a current user
    return next();
  } catch (err) {
    return next();
  }
}

function ensureLoggedIn(req, res, next) {
  if (!req.user) {
    return next({ status: 401, message: "Unauthorized" });
  } else {
    return next();
  }
}

function isAdmin(req, res, next) {
  try {
    let admin = req.user.is_admin;
    if (!admin) {
      return next({ status: 401, message: "Unauthorized" });
    } else {
      return next();
    }
  } catch (err) {
    next(err);
  }
}

function isSameUser(req, res, next) {
  try {
    let loggedInUsername = req.user.username;
    let paramUsername = req.params.username;
     if (loggedInUsername !== paramUsername) {
       return next({ status: 401, message: "Unauthorized" });
     } else {
       return next();
     }

  } catch(err) {
    next(err);
  }
}

module.exports = { authenticate, ensureLoggedIn, isAdmin, isSameUser };
