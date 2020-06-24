const db = require("../db");
const ExpressError = require("../helpers/expressError");


class Company {

  static async create({handle, name, num_employees, description, logo_url}) {
    let result = await db.query(
      `INSERT INTO companies (handle, name, num_employees, description, logo_url) 
       values ($1, $2, $3, $4, $5) RETURNING handle, name, num_employees, description, logo_url`,
      [handle, name, num_employees, description, logo_url]
    );
    return result.rows[0];
  }

  static async getAll() {
    let result = await db.query(`SELECT handle, name FROM companies`);
    return result.rows;
  }

  static async get(handle) {
    let result = await db.query(
      `SELECT handle, name, num_employees, description, logo_url FROM companies
      WHERE handle=$1`,
      [handle]
    );
    if (result.rows.length === 0) {
      throw new ExpressError("company handle does not exist", 404);
    }
    return result.rows[0];
  }

  static async update(query, values) {
    let result = await db.query(query, values);
    if (result.rows.length === 0) {
      throw new ExpressError("company handle does not exist", 404);
    }
    return result.rows[0];
  }

  static async delete(handle) {
    let result = await db.query(
      `DELETE from companies WHERE handle=$1 RETURNING handle`,
      [handle]
    );
    if (result.rows.length === 0) {
      throw new ExpressError("company handle does not exist", 404);
    }
    let returnObj = { messge: "Company deleted" };
    return returnObj
  }
  static async getAllQueries(queries) {
  if (+queries.min_employees > +queries.max_employees) {
        throw new ExpressError(
          "Min employees cannot be greater than max employees duhh",
          400
        );
      }
      let query = "SELECT handle, name FROM companies WHERE";
      let values = [];
      let dollaSign = 1;
      if (queries.search) {
        query += ` name LIKE $${dollaSign}`;
        values.push(`%${queries.search}%`);
        dollaSign += 1;
      }
      if (queries.min_employees) {
        if (values.length > 0) {
          query += ` and num_employees > $${dollaSign}`;
          values.push(queries.min_employees);
          dollaSign += 1;
        } else {
          query += ` num_employees > $${dollaSign}`;
          values.push(queries.min_employees);
          dollaSign += 1;
        }
      }
      if (queries.max_employees) {
        if (values.length > 0) {
          query += ` and num_employees < $${dollaSign}`;
          values.push(queries.max_employees);
          dollaSign += 1;
        } else {
          query += ` num_employees < $${dollaSign}`;
          values.push(queries.max_employees);
        }
      }
      let result = await db.query(query, values);
      return result.rows;
  }
}



module.exports = Company;