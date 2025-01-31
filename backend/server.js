const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Create a MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234', 
    database: 'disa_distributors'
});

// Connect to the database
db.connect((err) => {
    if (err) throw err;
    console.log('MySQL connected...');
});

// Customer Signup Endpoint
app.post('/api/customer/signup', async (req, res) => {
    const { name, email, password } = req.body;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the customer into the database
    const sql = 'INSERT INTO customers (name, email, password) VALUES (?, ?, ?)';
    db.query(sql, [name, email, hashedPassword], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).send('Email already exists');
            }
            throw err;
        }
        res.send('Customer registered successfully');
    });
});

// Customer Login Endpoint
app.post('/api/customer/login', async (req, res) => {
    const { email, password } = req.body;

    console.log('Login request received:', { email, password }); // Debugging

    // Fetch customer from the database
    const sql = 'SELECT * FROM customers WHERE email = ?';
    db.query(sql, [email], async (err, results) => {
        if (err) {
            console.error('Database error:', err); // Debugging
            return res.status(500).send({ message: 'Database error' });
        }

        if (results.length === 0) {
            console.log('Customer not found'); // Debugging
            return res.status(400).send({ message: 'Customer not found' });
        }

        const customer = results[0];

        // Compare passwords
        const validPassword = await bcrypt.compare(password, customer.password);
        if (!validPassword) {
            console.log('Invalid password'); // Debugging
            return res.status(400).send({ message: 'Invalid password' });
        }

        // Generate a JWT token
        const token = jwt.sign(
            { id: customer.id, email: customer.email },
            'your_secret_key', // Replace with a strong secret key
            { expiresIn: '1h' }
        );

        // Send the token and customer details in the response
        console.log('Login successful'); // Debugging
        res.send({
            token,
            customer: {
                id: customer.id,
                name: customer.name,
                email: customer.email
            }
        });
    });
});
// Start the server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});