const express = require("express");
const ExpressError = require("../helpers/expressError");
const Job = require("../models/job");
const jsonschema = require("jsonschema");
const jobPostSchema = require("../schemas/jobPost.json");
const jobPatchSchema = require("../schemas/jobPatch.json");

const router = new express.Router();

router.post("/", async function (req, res, next) {
  try {
    const schemaResult = jsonschema.validate(req.body, jobPostSchema);
    if (!schemaResult.valid) {
      let listOfErrors = schemaResult.errors.map((error) => error.stack);
      let error = new ExpressError(listOfErrors, 400);
      return next(error);
    }
    const result = await Job.create(req.body);

    return res.json({ job: result });

  } catch (err) {
    next(err);
  }
});

router.get("/", async function (req, res, next) {
  try {
    if (Object.keys(req.query).length > 0) {
      let result = await Job.getAllQueries(req.query);
      return res.json({ jobs: result });
    }
    let result = await Job.getAll();
    return res.json({ jobs: result });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async function (req, res, next) {
  try {
    let result = await Job.getById(req.params.id);
    return res.json({ job: result });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", async function (req, res, next) {
  try {
    const schemaResult = jsonschema.validate(req.body, jobPatchSchema);
    if (!schemaResult.valid) {
      let listOfErrors = schemaResult.errors.map((error) => error.stack);
      let error = new ExpressError(listOfErrors, 400);
      return next(error);
    }
    let result = await Job.update(req.body, req.params.id);
    return res.json({ job: result });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async function (req, res, next) {
  try {
    let result = await Job.delete(req.params.id);
    return res.json(result);
  } catch (err) {
    next(err);
  }
});


module.exports = router