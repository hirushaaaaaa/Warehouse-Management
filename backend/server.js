const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Middleware
app.use(bodyParser.json());
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

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

// Test route
app.get('/', (req, res) => {
    res.json({ message: 'Server is running!' });
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
// HR Letter Approval Endpoint
app.post('/api/hr/letter', (req, res) => {
    console.log('Received letter request:', req.body);
    
    const { letterType, letterContent } = req.body;
    
    if (!letterType || !letterContent) {
        console.log('Missing required fields');
        return res.status(400).json({
            success: false,
            message: 'Letter type and content are required'
        });
    }
    
    const sql = 'INSERT INTO hr_letter (letter_type, letter_content) VALUES (?, ?)';
    db.query(sql, [letterType, letterContent], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Error submitting letter for approval: ' + err.message 
            });
        }
        
        console.log('Letter inserted successfully:', result);
        res.status(201).json({ 
            success: true, 
            message: 'Letter submitted for approval successfully',
            letterId: result.insertId
        });
    });
});

// Get HR Letters Endpoint
app.get('/api/hr/letters', (req, res) => {
    const sql = 'SELECT * FROM hr_letter ORDER BY hrl_no DESC';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Error fetching letters' 
            });
        }
        
        res.json({ 
            success: true, 
            letters: results 
        });
    });
});

// Update Letter Approval Status Endpoint
app.put('/api/hr/letter/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    const sql = 'UPDATE hr_letter SET approval_status = ? WHERE hrl_no = ?';
    db.query(sql, [status, id], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Error updating letter status' 
            });
        }
        
        res.json({ 
            success: true, 
            message: 'Letter status updated successfully' 
        });
    });
});

// Start the server
const PORT = 5002;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});