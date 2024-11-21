const mysql = require('mysql2/promise');
const shortUuid = require('short-uuid');
const DateTime = require('datetime-js');

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

// Get the current date and time in the desired format
const dateObj = new Date();
const todayDate = DateTime(dateObj, '%Y-%m-%d %H:%M:%S');

// Function to execute a transaction order
const executeOrder = async (uuid, symbol, qty, price, order_type) => {
  try {
    const uniqueId = shortUuid.generate();

    // Insert the transaction into the TRANSACTIONS table
    const [result] = await pool.query(
      'INSERT INTO TRANSACTIONS (tuid, uuid, symbol, order_type, date, qty, price) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [uniqueId, uuid, symbol, order_type, todayDate, qty, price]
    );

    return {
      status: 200,
      message: 'Order Executed.',
      id: uniqueId
    };
  } catch (error) {
    console.error('Error executing order:', error);
    throw error;
  }
};

// Function to get all transactions for a user on a specific symbol
const transactionsOnComp = async (uuid, symbol) => {
  try {
    // Query for transactions on a particular symbol for a user
    const [transactions] = await pool.query(
      'SELECT * FROM TRANSACTIONS WHERE uuid = ? AND symbol = ?',
      [uuid, symbol]
    );

    return transactions;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
};

// Function to get all transactions for a user
const allTransactions = async (uuid) => {
  try {
    // Query for all transactions for a user
    const [transactions] = await pool.query(
      'SELECT * FROM TRANSACTIONS WHERE uuid = ?',
      [uuid]
    );

    return transactions;
  } catch (error) {
    console.error('Error fetching all transactions:', error);
    throw error;
  }
};

module.exports = { executeOrder, transactionsOnComp, allTransactions };
