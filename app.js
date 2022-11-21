const express = require("express");
const path = require("path");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
app.use(express.json());

let db = null;
dbPath = path.join(__dirname, "covid19India.db");

const intializeDBandServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log(`Server is running at http://localhost:3000`);
    });
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
};
const fromSnakeToCamel = (dbObj) => {
  return {
    districtId: dbObj.district_id,
    districtName: dbObj.district_name,
    stateId: dbObj.state_id,
    stateName: dbObj.state_name,
    population: dbObj.population,
    cases: dbObj.cases,
    cured: dbObj.cured,
    active: dbObj.active,
    deaths: dbObj.deaths,
  };
};

const snakeToCamel = (dbObj) => {
  return {
    totalCases: dbObj.cases,
    totalCured: dbObj.cured,
    totalActive: dbObj.active,
    totolDeaths: dbObj.deaths,
  };
};

intializeDBandServer();

// GET API 1
app.get("/states/", async (request, response) => {
  const Query = `SELECT * FROM state ORDER BY state_id;`;
  const dbResponse = await db.all(Query);
  response.send(dbResponse.map((each) => fromSnakeToCamel(each)));
});

//GET API 2

app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const Query = `SELECT * FROM state WHERE state_id = ${stateId};`;
  const dbResponse = await db.get(Query);
  response.send(fromSnakeToCamel(dbResponse));
});

//GET API 3
app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const Query = `SELECT * FROM district WHERE district_id = ${districtId};`;
  const dbResponse = await db.get(Query);
  response.send(fromSnakeToCamel(dbResponse));
});

// GET API 4

app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const Query = `SELECT SUM(cases) as cases, SUM(cured) as cured, SUM(active) as active, SUM(deaths) as deaths FROM district WHERE state_id = ${stateId} GROUP BY state_id;`;
  const dbResponse = await db.get(Query);
  response.send(snakeToCamel(dbResponse));
});

// GET API 5
app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const Query = `SELECT state_name FROM state LEFT JOIN district ON state.state_id = district.state_id WHERE district_id = ${districtId};`;
  const dbResponse = await db.get(Query);
  response.send(fromSnakeToCamel(dbResponse));
});

// POST API
app.post("/districts/", async (request, response) => {
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const Query = `INSERT INTO district (district_name, state_id, cases, cured, active, deaths) VALUES('${districtName}', ${stateId}, ${cases}, ${cured}, ${cured}, ${deaths});`;
  await db.run(Query);
  response.send("District Successfully Added");
});

//DELETE API
app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const Query = `DELETE FROM district WHERE district_id = ${districtId};`;
  await db.run(Query);
  response.send("District Removed");
});


// PUT API
app.put("/districts/:districtId/", async (request, response) => {
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const { districtId } = request.params;
  const Query = `INSERT INTO
   district (district_name, state_id, cases, cured, active, deaths) 
   VALUES('${districtName}', ${stateId}, ${cases}, ${cured}, ${cured}, ${deaths});`;
  await db.run(Query);
  response.send("District Details Updated");
});

module.exports = app;
