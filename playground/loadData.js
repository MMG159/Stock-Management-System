import sqlite3 from 'sqlite3';
import { nanoid } from 'nanoid';
import { fileURLToPath } from 'url';
import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'fast-csv';
import { rejects } from 'assert';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

//! READ FUNCTIONS
function login(userName, password) {
  const db = new sqlite3.Database('database.db');
  const sql = 'SELECT * FROM USERS WHERE first_name = ?';
  db.get(sql, [userName], function (err, row) {
    if (row == undefined) {
      return console.log('No User Found, Create Account');
    }
    console.log(row);
  });
}

login('Sinu', 'pasdfpasdf');

//! WRITE FUNCTIONS
//? create a user
function createUser(fname, lname, email, pass, dpUri) {
  // open the database
  const db = new sqlite3.Database('./test.db');

  const sql = `INSERT INTO USERS VALUES (?,?,?,?,?,?)`;
  const params = [nanoid(15), fname, lname, email, pass, dpUri];

  db.run(sql, params, (error) => {
    if (error) {
      return console.log(error);
    }
  });

  // close the database connection
  db.close();
}

//? insert into US companeis
function insertUsCompany(name, symbol, industry, description) {
  // open the database
  const db = new sqlite3.Database('./database.db');

  const sql = `INSERT INTO US_COMPANIES VALUES (?,?,?,?,?,?)`;
  const params = [nanoid(15), name, symbol, industry, description, null];

  db.run(sql, params, (error) => {
    if (error) {
      return console.log(error);
    }
  });

  // close the database connection
  db.close();
}

//? insert into IND companeis
function insertIndCompany(name, symbol, industry) {
  // open the database
  const db = new sqlite3.Database('./database.db');

  const sql = `INSERT INTO IND_COMPANIES VALUES (?,?,?,?,?,?)`;
  const params = [nanoid(15), name, symbol, industry, null, null];

  db.run(sql, params, (error) => {
    if (error) {
      return console.log(error);
    }
  });

  // close the database connection
  db.close();
}

// fs.createReadStream(path.join(__dirname, 'sandp500.csv'))
//   .pipe(csv.parse({ headers: true }))
//   .on('data', (row) => {
//     let descriptionArr = row['Longbusinesssummary'].split('.');
//     let shortDescription = [descriptionArr[0], descriptionArr[1]].join();
//     console.log(' ');
//     insertUsCompany(
//       row['Shortname'],
//       row['Symbol'],
//       row['Industry'],
//       shortDescription
//     );
//   })
//   .on('end', () => {
//     console.log('done uploading');
//   });
