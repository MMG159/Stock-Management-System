const { contextBridge } = require('electron');
const { login, createUser } = require('./backend/userApi');
const {
  getIndCompanies,
  getUsCompanies,
  getCompanyIndexes,
  currentStockPrice,
} = require('./backend/queryCompanies');
const { executeOrder } = require('./backend/orders');
const {
  transactionsOnComp,
  allTransactions,
} = require('./backend/portfolioQueries');
const { fundTransaction, fundTransactionHistory } = require('./backend/funds');

const mysql = require('mysql2/promise');

// MySQL connection configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '9I1Gghe0',
  database: 'stockDBMS',
};

// Utility function to generate a change percentage
const changePercentFunc = (min, max) => {
  let num = Math.random() * (max - min) + min;
  num = Math.floor(num * 100) / 100;
  if (Math.round(Math.random()) === 1) {
    num -= num * 2;
  }
  return (num / 100).toFixed(4);
};

// Market simulation function
const marketSimulation = async () => {
  let connection;
  try {
    // Connect to MySQL database
    connection = await mysql.createConnection(dbConfig);

    // Query all company indexes
    const [companies] = await connection.execute('SELECT * FROM COMPANY_INDEXES');

    for (const row of companies) {
      const changePercent = changePercentFunc(0, 1);
      const price_yesterday = row.price_today;
      const changeAmount = (row.price_today * Number(changePercent)).toFixed(2);
      const price_today = Number(
        (row.price_today + Number(changeAmount)).toFixed(2)
      );

      // Update the company indexes with the new values
      await connection.execute(
        'UPDATE COMPANY_INDEXES SET price_yesterday = ?, price_today = ?, change_percentage = ? WHERE sl_no = ?',
        [
          price_yesterday,
          price_today,
          Number((changePercent * 100).toFixed(2)),
          row.sl_no,
        ]
      );
    }

    console.log('Market simulation completed successfully!');
  } catch (err) {
    console.error('Error during market simulation:', err);
  } finally {
    if (connection) {
      await connection.end(); // Close the database connection
    }
  }
};

// Run the market simulation
marketSimulation();

contextBridge.exposeInMainWorld('backend', {
  login: login,
  createUser: createUser,
  getIndCompanies: getIndCompanies,
  getUsCompanies: getUsCompanies,
  getCompanyIndexes: getCompanyIndexes,
  executeOrder: executeOrder,
  transactionsOnComp: transactionsOnComp,
  fundTransaction: fundTransaction,
  fundTransactionHistory: fundTransactionHistory,
  allTransactions: allTransactions,
  currentStockPrice: currentStockPrice,
});
