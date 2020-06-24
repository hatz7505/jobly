
const express = require("express");
const ExpressError = require("../helpers/expressError");
const sqlForPartialUpdate = require("../helpers/partialUpdate");
const db = require("../db");

const router = new express.Router();

router.get('/', async function(req, res, next) {
  try {
    if (req.query) {
      if (+req.query.min_employees > +req.query.max_employees) {
        throw new ExpressError('Min employees cannot be greater than max employees duhh', 400)
      }
      let query = "SELECT handle, name FROM companies WHERE";
      let values = [];
      let dollaSign = 1
      if (req.query.search) {
        query += ` name LIKE $${dollaSign}`;
        values.push(`%${req.query.search}%`);
        dollaSign += 1
      }
      if (req.query.min_employees) {
        if (values.length > 0) {
          query += ` and num_employees > $${dollaSign}`;
          values.push(req.query.min_employees);
          dollaSign += 1
        } else {
          query += ` num_employees > $${dollaSign}`;
          values.push(req.query.min_employees);
          dollaSign += 1;
        }
      }
      if (req.query.max_employees) {
        if (values.length > 0) {
          query += ` and num_employees < $${dollaSign}`;
          values.push(req.query.max_employees);
          dollaSign += 1;
        } else {
          query += ` num_employees < $${dollaSign}`;
          values.push(req.query.max_employees);
        }
      }
      let result = await db.query(query, values);
      return res.json({ companies: result.rows });
    }
    let result = await db.query(`SELECT handle, name FROM companies`)
    return res.json({companies: result.rows});
  } catch (err) {
    next(err);
  }
})

router.post('/', async function(req, res, next) {
  try {
    let { handle, name, num_employees, description, logo_url } = req.body;
    console.log(arguments);
    let result = await db.query(
      `INSERT INTO companies (handle, name, num_employees, description, logo_url) 
    values ($1, $2, $3, $4, $5) RETURNING handle, name, num_employees, description, logo_url`,
      [handle, name, num_employees, description, logo_url]
    );
    return res.json({ company: result.rows[0] })
  } catch(err) {
    next(err);
  }
})

router.get("/:handle", async function(req, res, next) {
  try {
    let result = await db.query(`
    SELECT handle, name, num_employees, description, logo_url FROM companies
    WHERE handle=$1`,
    [req.params.handle]);
     if (result.rows.length === 0) {
       throw new ExpressError("company handle does not exist", 404);
     }
    return res.json({ company: result.rows[0] });
  } catch (err) {
    next(err);
  }
})

router.patch("/:handle", async function(req, res, next) {
  try {
    let { query, values } = sqlForPartialUpdate("companies", req.body, "handle", req.params.handle); 
    let result = await db.query(query, values);
    if (result.rows.length === 0) {
      throw new ExpressError("company handle does not exist", 404);
    }
    return res.json({ company: result.rows[0] });
  } catch(err) {
    next(err);
  }
})

router.delete("/:handle", async function(req, res, next) {
  try {
    let result = await db.query(`
    DELETE from companies WHERE handle=$1 RETURNING handle`,
    [req.params.handle]);
    if (result.rows.length === 0) {
      throw new ExpressError("company handle does not exist", 404)
    }
    return res.json({ message: "Company deleted" });
  } catch(err) {
    next(err);
  }
})


module.exports = router;