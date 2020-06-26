const db = require("../db");
const ExpressError = require("../helpers/expressError");
const sqlForPartialUpdate = require("../helpers/partialUpdate");
const bcrypt = require("bcrypt");

class User {
  static async create({
    username,
    password,
    first_name,
    last_name,
    email,
    photo_url,
    is_admin,
  }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    let result = await db.query(
      `INSERT INTO users (username, password, first_name, last_name, email, photo_url, is_admin)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING username, password, first_name, last_name, email, photo_url, is_admin`,
      [
        username,
        hashedPassword,
        first_name,
        last_name,
        email,
        photo_url,
        // !! forces into boolean value
        !!is_admin,
      ]
    );
    return result.rows[0];
  }

  static async getAll() {
    let result = await db.query(
      `SELECT username, first_name, last_name, email, photo_url, is_admin FROM users`
    );
    if (result.rows.length === 0) {
      throw new ExpressError("no users :(", 404);
    }
    return result.rows;
  }

  static async getByUsername(username) {
    let result = await db.query(
      `SELECT username, first_name, last_name, email, photo_url, password, is_admin FROM users
      WHERE username=$1`,
      [username]
    );
    if (result.rows.length === 0) {
      throw new ExpressError("Username does not exist :(", 404);
    }
    return result.rows[0];
  }

  static async update(request, username) {
    let { query, values } = sqlForPartialUpdate(
      "users",
      request,
      "username",
      username
    );
    let result = await db.query(query, values);

    if (result.rows.length === 0) {
      throw new ExpressError("Username doesn't exist :(", 404);
    }
    return result.rows[0];
  }

  static async delete(username) {
    let result = await db.query(
      `DELETE from users WHERE username=$1 RETURNING username`,
      [username]
    );
    if (result.rows.length === 0) {
      throw new ExpressError("Username does not exist", 404);
    }
    let returnObj = { messge: "User deleted" };
    return returnObj;
  }
}
module.exports = User;
