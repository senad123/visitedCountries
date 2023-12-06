import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;
let visitedCountries;
let count = 0;
let addNewCountry;
let error;
let results;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: "sen123",
  port: 5432,   
});
  
db.connect(); 

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// app.get("/", async (req, res) => {
//   const result = await db.query("SELECT country_code FROM visited_countries");
//  // let countries = [];

//   // result.rows.forEach((country)=>{
//   // countries.push(country.country_code);
//   // });

//    // Extract country codes from the result
//   const countries = result.rows.map(country => country.country_code);
//    // Create a comma-separated string
//   const countriesString = countries.join(',');
//     // Get the total count
//    count = countries.length;

//   console.log(countries);
//   res.render("index.ejs",{
//     countries:countriesString,
//     total:count,
//   });
//   db.end();
// }); 

// app.get("/", async (req, res) => {
//   try { 
//     const result = await db.query("SELECT country_code FROM visited_countries");
//     const countries = result.rows.map((country) => country.country_code);
//     const count = countries.length;
//     console.log(countries); 

//     res.render("index.ejs", {  
//       countries: countries,
//       total: count,
//     });  
//     db.end(); 
//   } catch (error) {
//     console.error("Error fetching data from the database:", error);
//     res.status(500).send("Internal Server Error");
//   } 
// });
 
//Function to getAll Countries
async function checkVisited() {
  const result = await db.query("SELECT country_code FROM visited_countries");
  let countries = [];
  result.rows.forEach((country) => {
    countries.push(country.country_code);
  });
  return countries;
}
// GET home page
app.get("/", async (req, res) => {
  const countries= await checkVisited();
  res.render("index.ejs", { countries: countries, total: countries.length});
});
// POST
app.post("/add", async (req, res) => {
  const add = req.body.country;
  try{
    const result = await db.query(
      "SELECT country_code FROM countries WHERE LOWER country_name LIKE '%'|| $1 || '%'", 
      [add.toLowerCase()],
    );
    const data = result.rows[0];
    const countryCode = data.country_code;
    try{
      await db.query("INSERT INTO visited_countries (country_code) VALUES ($1)",
      [countryCode],
    );
    res.redirect("/");           
  }catch (error) {
    const countries= await checkVisited();
    res.render("index.ejs", { countries: countries, total: countries.length, error: "Country alredy Exist"});
  }
}catch(error){
  const countries= await checkVisited();
  res.render("index.ejs", { countries: countries, total: countries.length, error: "Country does not exist"});
}
});
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});   
 
