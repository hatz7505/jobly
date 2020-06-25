const db = require("./db");
const Job = require("./models/job");
const request = require("supertest");
const app = require("./app");

beforeEach(async function () {
  await db.query("DELETE FROM companies");
  await db.query("DELETE FROM jobs");
  await db.query(`INSERT INTO companies (handle, name, num_employees, description, logo_url)
                    VALUES ('harryb', 'the harry banana', 1, 'vegan eatszzz', 'some banana pic')`);
  await db.query(`INSERT INTO jobs (title, salary, equity, company_handle)
                  VALUES ('banana ice cream maker', '300', 0.9, 'harryb')`);
});

//test getting a job by ID & sad path
describe("test job routes", function() {
  test("test deleting a job", async function(){
    let job = await Job.getJobsByHandle('harryb');

    let response = await request(app).delete(`/jobs/${job[0].id}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Job deleted");
  });

  test("test getting job by id: HAPPY PATH", async function(){
    let job = await Job.getJobsByHandle('harryb');

    let response = await request(app).get(`/jobs/${job[0].id}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.job.title).toBe("banana ice cream maker");
  });

  test("test getting job by id: SAD PATH", async function(){
    let response = await request(app).get(`/jobs/0`);

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe("job ID does not exist");
  });
});

afterAll(async function () {
  await db.end();
});