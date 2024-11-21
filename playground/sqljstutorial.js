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

// Function to create a user (signup/register)
async function createUser(uuid, fName, lName, email, password, uri) {
  try {
    // Prepare and execute the insert query for creating a user
    const [result] = await pool.query(
      'INSERT INTO users (uuid, first_name, last_name, email, password, dp_uri) VALUES (?, ?, ?, ?, ?, ?)',
      [uuid, fName, lName, email, password, uri]
    );

    // If insertion is successful, return the result
    if (result.affectedRows > 0) {
      return { uuid, fName, lName, email, uri };
    } else {
      return {}; // Return empty object if the operation fails
    }
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

// Function to login a user (validate credentials)
async function login(email, password) {
  try {
    // Query the user data from the database
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

    if (rows.length > 0) {
      // Check if the email exists and match the password
      const user = rows[0]; // Assuming email is unique
      if (user.password === password) {
        return user; // Return user data if login is successful
      } else {
        return {}; // Return empty object if password does not match
      }
    } else {
      return {}; // Return empty object if no user is found
    }
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
}

// Example usage
createUser('unique-uuid', 'John', 'Doe', 'john.doe@example.com', 'securepassword', 'profile-uri')
  .then(user => console.log('User created:', user))
  .catch(err => console.log('Error:', err));

login('john.doe@example.com', 'securepassword')
  .then(user => console.log('Login successful:', user))
  .catch(err => console.log('Error:', err));
