const db = require("../db");
const ExpressError = require("../helpers/expressError");
const sqlForPartialUpdate = require("../helpers/partialUpdate");



class Job {

  static async create({ title, salary, equity, company_handle }) {
    let result = await db.query(`
        INSERT INTO jobs (title, salary, equity, company_handle)
        VALUES ($1, $2, $3, $4)
        RETURNING title, salary, equity, company_handle`,
      [title, salary, equity, company_handle]
    );
    return result.rows[0];
  }

  static async getAll() {
    let result = await db.query(`
    SELECT title, company_handle
    FROM jobs
    ORDER BY date_posted DESC`);

    return result.rows;
  }

  static async getAllQueries(queries) {
    let query = "SELECT title, company_handle FROM jobs WHERE";
    let queryParts = [];
    let values = [];
    let dollaSign = 1;

    if (queries.search) {
      queryParts.push(` title LIKE $${dollaSign}`);
      values.push(`%${queries.search}%`);
      dollaSign += 1;
    }

    if (queries.min_salary) {
      queryParts.push(` salary > $${dollaSign}`);
      values.push(`${queries.min_salary}`);
      dollaSign += 1;
    }

    if (queries.min_equity) {
      queryParts.push(` equity > $${dollaSign}`);
      values.push(`${queries.min_equity}`);
    }
    query += queryParts.join('and');


    let result = await db.query(query, values);
    return result.rows;
  }

  static async getById(id) {
    let result = await db.query(`
    SELECT title, salary, equity, company_handle
    FROM jobs
    WHERE id = $1`,
      [id]);

    if (result.rows.length === 0) {
      throw new ExpressError("job ID does not exist", 404);
    }

    return result.rows[0];
  }

  static async getJobsByHandle(handle) {
    let result = await db.query(`
    SELECT id, title, salary, equity
    FROM jobs
    WHERE company_handle = $1`,
      [handle]);

    if (result.rows.length === 0) {
      result.rows.push('No jobs listed');
    }

    return result.rows;
  }

  static async update(request, id) {
    let { query, values } = sqlForPartialUpdate("jobs", request, "id", id);
    let result = await db.query(query, values);

    if (result.rows.length === 0) {
      throw new ExpressError("job ID does not exist", 404);
    }
    return result.rows[0];
  }

  static async delete(id) {
    let result = await db.query(`
    DELETE from jobs
    WHERE id = $1
    RETURNING id`, [id]);

    if (result.rows.length === 0) {
      throw new ExpressError("Job ID does not exist", 404);
    }

    let deleteObj = { message: "Job deleted" };
    return deleteObj;
  }



}


module.exports = Job