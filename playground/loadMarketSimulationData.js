const mysql = require('mysql2/promise');

// Create a connection pool for MySQL
const pool = mysql.createPool({
  host: 'localhost', // Replace with your MySQL host
  user: 'root', // Replace with your MySQL username
  password: '9I1Gghe0', // Replace with your MySQL password
  database: 'stockDBMS', // Replace with your MySQL database name
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Function to generate a random number between min and max with 2 decimal precision
const numGen = (min, max) => {
  let num = Math.random() * (max - min) + min;

  // Round the number to two decimal places
  num = Math.floor(num * 100) / 100;
  return num;
};

// Function to load data and insert into COMPANY_INDEXES table
const loadData = async () => {
  try {
    const connection = await pool.getConnection();

    let count = 1;

    // Read data from US_COMPANIES and insert into COMPANY_INDEXES
    const [usCompanies] = await connection.execute('SELECT * FROM US_COMPANIES');
    for (const row of usCompanies) {
      const priceOfStock = numGen(10, 2500);

      await connection.execute(
        'INSERT INTO COMPANY_INDEXES (cuid, sl_no, name, symbol, market, no_equity, price_yesterday, price_today, change_percentage) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          row.usuid,
          count,
          row.name,
          row.symbol,
          'us', // market is 'us'
          null, // no_equity is null
          priceOfStock,
          priceOfStock,
          numGen(0, 6),
        ]
      );
      count++;
    }

    // Read data from IND_COMPANIES and insert into COMPANY_INDEXES
    const [inCompanies] = await connection.execute('SELECT * FROM IND_COMPANIES');
    for (const row of inCompanies) {
      const priceOfStock = numGen(10, 2500);

      await connection.execute(
        'INSERT INTO COMPANY_INDEXES (cuid, sl_no, name, symbol, market, no_equity, price_yesterday, price_today, change_percentage) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          row.inuid,
          count,
          row.name,
          row.symbol,
          'in', // market is 'in'
          null, // no_equity is null
          priceOfStock,
          priceOfStock,
          numGen(0, 6),
        ]
      );
      count++;
    }

    connection.release(); // Release the connection back to the pool

    console.log('Data loaded successfully!');
  } catch (error) {
    console.error('Error loading data:', error);
  }
};

loadData();
