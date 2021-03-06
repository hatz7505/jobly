const express = require("express");
const ExpressError = require("../helpers/expressError");
const sqlForPartialUpdate = require("../helpers/partialUpdate");
const Company = require("../models/company");
const Job = require("../models/job");
const jsonschema = require("jsonschema");
const companyPostSchema = require("../schemas/companyPost.json");
const companyPatchSchema = require("../schemas/companyPatch.json");
const { ensureLoggedIn, isAdmin } = require("../helpers/auth");

const router = new express.Router();

router.get("/", ensureLoggedIn, async function (req, res, next) {
  try {
    if (Object.keys(req.query).length > 0) {
      let result = await Company.getAllQueries(req.query);
      return res.json({ companies: result });
    }
    let result = await Company.getAll();
    return res.json({ companies: result });
  } catch (err) {
    next(err);
  }
});

router.post("/", ensureLoggedIn, isAdmin, async function (req, res, next) {
  try {
    const schemaResult = jsonschema.validate(req.body, companyPostSchema);
    if (!schemaResult.valid) {
      let listOfErrors = schemaResult.errors.map((error) => error.stack);
      let error = new ExpressError(listOfErrors, 400);
      return next(error);
    }
    let result = await Company.create(req.body);
    return res.status(201).json({ company: result });
  } catch (err) {
    next(err);
  }
});

router.get("/:handle", ensureLoggedIn, async function (req, res, next) {
  try {
    let companyResult = await Company.get(req.params.handle);
    let jobsResult = await Job.getJobsByHandle(req.params.handle);
    companyResult.jobs = jobsResult;

    return res.json({ company: companyResult });
  } catch (err) {
    next(err);
  }
});

router.patch("/:handle", ensureLoggedIn, isAdmin, async function (
  req,
  res,
  next
) {
  try {
    const schemaResult = jsonschema.validate(req.body, companyPatchSchema);
    if (!schemaResult.valid) {
      let listOfErrors = schemaResult.errors.map((error) => error.stack);
      let error = new ExpressError(listOfErrors, 400);
      return next(error);
    }
    let { query, values } = sqlForPartialUpdate(
      "companies",
      req.body,
      "handle",
      req.params.handle
    );
    let result = await Company.update(query, values);
    return res.status(201).json({ company: result });
  } catch (err) {
    next(err);
  }
});

router.delete("/:handle", ensureLoggedIn, isAdmin, async function (
  req,
  res,
  next
) {
  try {
    return res.json(await Company.delete(req.params.handle));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
