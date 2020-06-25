const db = require("./db");
const Company = require("./models/company");
const request = require("supertest");
const app = require("./app");

describe("partialUpdate()", () => {
  beforeEach(async function () {
    await db.query("DELETE FROM companies");
    await db.query(`INSERT INTO companies (handle, name, num_employees, description, logo_url)
                    VALUES ('harryb', 'the harry banana', 1, 'vegan eatszzz', 'some banana pic')`);
  });
});

describe("test company routes", function () {
  test("test get all companies no query", async function () {
    let response = await request(app).get("/companies");
    expect(response.statusCode).toBe(200);
    expect(response.body.companies.length).toBe(1);
    expect(response.body.companies[0].handle).toBe("harryb");
  });
  test("test get all companies with search query", async function () {
    let response = await request(app).get("/companies?search=olivia");
    expect(response.statusCode).toBe(200);
    expect(response.body.companies.length).toBe(0);
  });
  test("test min can't be more than max query", async function () {
    let response = await request(app).get(
      "/companies?min_employees=10&max_employees=5"
    );

    // THIS IS ACTUALLY A TEST FOR THE MODELS (the route handles the error so system doesn't crash):
    // expect(
    //   await request(app).get("/companies?min_employees=10&max_employees=5")
    // ).toThrowError("Min employees cannot be greater than max employees duhh");
    
    
    expect(response.body.status).toBe(400);
    expect(response.body.message).toBe(
      "Min employees cannot be greater than max employees duhh"
    );
  });
  test("test adding a new company", async function () {
    let response = await request(app).post("/companies").send({
      handle: "walkwitme",
      name: "Olivias Walkabouts",
      num_employees: 200,
      description: "for your inner hippy",
      logo_url: "trees and love and joy",
    });
    expect(response.statusCode).toBe(201);
    expect(Object.keys(response.body.company).length).toBe(5);
    expect(response.body.company.handle).toBe("walkwitme");
  });
});

afterAll(async function () {
  await db.end();
});
