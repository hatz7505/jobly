
const db = require("../../db");
const sqlForPartialUpdate = require("../../helpers/partialUpdate")

describe("partialUpdate()", () => {
   beforeEach(async function () {
     await db.query("DELETE FROM companies");
     await db.query(`INSERT INTO companies (handle, name, num_employees, description, logo_url)
                    VALUES ('harryb', 'the harry banana', 1, 'vegan eatszzz', 'some banana pic')`);
   });
  
  it("should generate a proper partial update query with just 1 field",
  async function () {
        let { query, values} = sqlForPartialUpdate('companies', { description: 'bomb vegan eatszzz'}, 'handle', 'harryb');
        let result = await db.query(query, values);
    
    expect(result.rows.length).toBe(1);
    expect(result.rows[0].description).toBe("bomb vegan eatszzz");
  
  });
});
