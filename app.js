const express = require('express');
const mariadb = require('mariadb');

const app = express();
const PORT = 3002;

// MariaDB connection pool
const pool = mariadb.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Pakhtoon2002@',
    database: 'guestbook',
    connectionLimit: 5
});

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Function to test the connection
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('Connected to MariaDB!');
        connection.release(); // Release the connection back to the pool
    } catch (err) {
        console.error('Error connecting to MariaDB:', err);
    }
}

// Call the function to test the connection
testConnection();

// Set up the view engine
app.set("view engine", "ejs");

app.use(express.static('styles'));

// Home route
app.get('/', (req, res) => {
    res.render('home');
});

// Define a "confirm" route, using the POST method
app.post('/confirm', async (req, res) => {
    try {
        const data = req.body;
        console.log('[DEBUG] Received data:', data);

        if (!data.fname || !data.lname || !data.email) {
            return res.status(400).send('Missing required fields: fname, lname, or email');
        }

        const conn = await pool.getConnection();

        const query = `
            INSERT INTO guests (fname, lname, title, company, email, url, meet, other, message)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            data.fname,
            data.lname,
            data.title,
            data.company,
            data.email,
            data.url,
            data.meet,
            data.other,
            data.message
        ];


       
        res.render('confirmation', { details: data });
    } catch (err) {
        console.error('[ERROR] Error saving data to MariaDB:', err);
        res.status(500).send('Error saving data to the database');
    }
});

app.get('/guests', async (req, res) => {
    try {
        const conn = await pool.getConnection();
        const guests = await conn.query('SELECT * FROM guests');
        conn.release();

        res.render('guests', { guests });
    } catch (err) {
        console.error('[ERROR] Error fetching data from MariaDB:', err);
        res.status(500).send('Error fetching data from the database');
    }
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});
