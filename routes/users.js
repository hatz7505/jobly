const express = require("express");
const ExpressError = require("../helpers/expressError");
const User = require("../models/user");
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config');
const { ensureLoggedIn, isSameUser } = require("../helpers/auth")

const router = new express.Router();

router.post('/', async function(req, res, next) {
  try {
    const result = await User.create(req.body);
    result.token = jwt.sign(
      { username: result.username, is_admin: result.is_admin},
      SECRET_KEY
    );
    return res.json({ user: result });
  } catch (err) {
    next(err);
  }
})

router.get("/", async function (req, res, next) {
  try {
    let result = await User.getAll();
    return res.json({ users: result });
  } catch (err) {
    next(err);
  }
});

router.get("/:username", async function (req, res, next) {
  try {
    let result = await User.getByUsername(req.params.username);
    return res.json({ user: result });
  } catch (err) {
    next(err);
  }
});

router.patch("/:username", ensureLoggedIn, isSameUser, async function (req, res, next) {
  try {
    let result = await User.update(req.body, req.params.username);
    return res.json({ user: result });
  } catch (err) {
    next(err);
  }
});

router.delete("/:username", ensureLoggedIn, isSameUser, async function (req, res, next) {
  try {
    let result = await User.delete(req.params.username);
    return res.json(result)
  } catch(err) {
    next(err);
  }
})


module.exports = router;