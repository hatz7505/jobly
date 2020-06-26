const express = require("express");
const ExpressError = require("../helpers/expressError");
const User = require("../models/user");

const router = new express.Router();

router.post('/', async function(req, res, next) {
  try {
    const result = await User.create(req.body);
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

router.patch("/:username", async function (req, res, next) {
  try {
    let result = await User.update(req.body, req.params.username);
    return res.json({ user: result });
  } catch (err) {
    next(err);
  }
});

router.delete("/:username", async function (req, res, next) {
  try {
    let result = await User.delete(req.params.username);
    return res.json(result)
  } catch(err) {
    next(err);
  }
})


module.exports = router;