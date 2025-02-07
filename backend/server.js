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
app.get('/', (_req, res) => {
    res.json({ message: 'Server is running!' });
});

// Customer Signup Endpoint
app.post('/api/customer/signup', async (req, res) => {
    const { name, email, password } = req.body;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the customer into the database
    const sql = 'INSERT INTO customers (name, email, password) VALUES (?, ?, ?)';
    db.query(sql, [name, email, hashedPassword], (err, _result) => {
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
app.get('/api/hr/letters', (_req, res) => {
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
    db.query(sql, [status, id], (err, _result) => {
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

// Leave Request Endpoint
app.post('/api/leaves', (req, res) => {
    const { employee_id, leave_type, start_date, end_date, comments } = req.body;
    
    // Validate required fields
    if (!employee_id || !leave_type || !start_date || !end_date) {
        return res.status(400).json({
            success: false,
            message: 'All fields are required'
        });
    }
    
    const sql = 'INSERT INTO leaves (employee_id, leave_type, start_date, end_date, comments) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [employee_id, leave_type, start_date, end_date, comments], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Error submitting leave request'
            });
        }
        
        res.status(201).json({
            success: true,
            message: 'Leave request submitted successfully',
            leaveId: result.insertId
        });
    });
});

// Get All Leave Requests Endpoint
app.get('/api/leaves', (_req, res) => {
    const sql = 'SELECT * FROM leaves ORDER BY created_at DESC';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Error fetching leave requests' 
            });
        }
        
        res.json({ 
            success: true, 
            leaves: results 
        });
    });
});

// Update Leave Status Endpoint
app.put('/api/leaves/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid status. Must be APPROVED or REJECTED'
        });
    }
    
    const sql = 'UPDATE leaves SET status = ? WHERE leave_id = ?';
    db.query(sql, [status, id], (err, _result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Error updating leave status' 
            });
        }
        
        res.json({ 
            success: true, 
            message: 'Leave status updated successfully' 
        });
    });
});

app.post('/api/suppliers', async (req, res) => {
    const { sup_id, name, no, street, city, email, tele_no, password } = req.body;
    
    // Validate required fields
    if (!sup_id || !name || !no || !street || !city || !email || !tele_no || !password) {
        return res.status(400).json({
            success: false,
            message: 'All fields are required'
        });
    }
    
    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const sql = 'INSERT INTO Supplier (sup_id, Name, No, Street, City, Email, Tele_no, Password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        db.query(sql, [sup_id, name, no, street, city, email, tele_no, hashedPassword], (err, result) => {
            if (err) {
                console.error('Database error:', err);
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({
                        success: false,
                        message: 'Supplier ID or Email already exists'
                    });
                }
                return res.status(500).json({
                    success: false,
                    message: `Database error: ${err.message}`
                });
            }
            
            res.status(201).json({
                success: true,
                message: 'Supplier added successfully',
                supplierId: result.insertId
            });
        });
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({
            success: false,
            message: `Error processing request: ${error.message}`
        });
    }
});

// New Staff Management Routes
// Test endpoint
app.get('/api/staff/test', (_req, res) => {
    console.log('Staff API test endpoint hit');
    res.json({
        success: true,
        message: 'Staff API is working'
    });
});

// Get all staff members
app.get('/api/staff', (_req, res) => {
    console.log('Fetching staff data...');
    
    const sql = `
        SELECT staff_id, role, name, email, tele_no, no, street, city 
        FROM Staff 
        ORDER BY role, name
    `;
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Error fetching staff records',
                error: err.message
            });
        }
        
        console.log(`Found ${results.length} staff records`);
        res.json({
            success: true,
            staff: results
        });
    });
});

// Update staff member
app.put('/api/staff/:id', (req, res) => {
    const { id } = req.params;
    const { name, email, tele_no, no, street, city } = req.body;
    
    // Input validation
    if (!name || !email || !tele_no || !no || !street || !city) {
        return res.status(400).json({
            success: false,
            message: 'All fields are required'
        });
    }
    
    // Role-specific table mapping
    const roleTableMap = {
        'Managing Director': { table: 'Managing_Director', idField: 'md_id' },
        'General Manager': { table: 'General_Manager', idField: 'gm_id' },
        'HR Manager': { table: 'HR_Manager', idField: 'hrm_id' },
        'HR Clerk': { table: 'HR_Clerk', idField: 'hrc_id' },
        'Finance Manager': { table: 'Finance_Manager', idField: 'fm_id' },
        'Finance Accountant': { table: 'Finance_Accountant', idField: 'fa_id' },
        'Warehouse Manager': { table: 'Warehouse_Manager', idField: 'wm_id' },
        'Warehouse Assistant': { table: 'Warehouse_Assistant', idField: 'wa_id' },
        'Warehouse Driver': { table: 'Warehouse_Driver', idField: 'wd_id' },
        'IT Manager': { table: 'IT_Manager', idField: 'itm_id' }
    };
    
    // Start transaction
    db.beginTransaction(err => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Error starting database transaction'
            });
        }
        
        // First get the staff member's role
        db.query('SELECT role FROM Staff WHERE staff_id = ?', [id], (err, results) => {
            if (err || results.length === 0) {
                return db.rollback(() => {
                    res.status(404).json({
                        success: false,
                        message: 'Staff member not found'
                    });
                });
            }
            
            const role = results[0].role;
            const roleInfo = roleTableMap[role];
            
            if (!roleInfo) {
                return db.rollback(() => {
                    res.status(400).json({
                        success: false,
                        message: 'Invalid role'
                    });
                });
            }
            
            // Update Staff table
            const staffUpdateSql = `
                UPDATE Staff 
                SET name = ?, email = ?, tele_no = ?, no = ?, street = ?, city = ?
                WHERE staff_id = ?
            `;
            
            db.query(staffUpdateSql, [name, email, tele_no, no, street, city, id], (err) => {
                if (err) {
                    return db.rollback(() => {
                        res.status(500).json({
                            success: false,
                            message: 'Error updating Staff table'
                        });
                    });
                }
                
                // Update role-specific table for ONLY that specific role
                const roleTableSql = `
                    UPDATE ${roleInfo.table}
                    SET Name = ?, Email = ?, Tele_no = ?, No = ?, Street = ?, City = ?
                    WHERE ${roleInfo.idField} = ?
                `;
                
                db.query(roleTableSql, [name, email, tele_no, no, street, city, id], (err) => {
                    if (err) {
                        return db.rollback(() => {
                            res.status(500).json({
                                success: false,
                                message: `Error updating ${roleInfo.table} table`
                            });
                        });
                    }
                    
                    // Commit the transaction
                    db.commit(err => {
                        if (err) {
                            return db.rollback(() => {
                                res.status(500).json({
                                    success: false,
                                    message: 'Error committing transaction'
                                });
                            });
                        }
                        
                        res.json({
                            success: true,
                            message: 'Staff member updated successfully',
                            staffId: id
                        });
                    });
                });
            });
        });
    });
});

// Add Corporate Login Endpoint
app.post('/api/corporate/login', (req, res) => {
    const { username, password, role, subRole } = req.body;
    console.log('Received login request:', { username, password, role, subRole });

    const sql = 'SELECT * FROM co_login WHERE username = ? AND role = ? AND (subrole = ? OR subrole IS NULL)';
    db.query(sql, [username, role, subRole || null], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send({ message: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(400).send({ message: 'User not found' });
        }

        const user = results[0];
        console.log('Stored password:', user.password);

        // Compare plaintext passwords
        if (password !== user.password) {
            return res.status(400).send({ message: 'Invalid password' });
        }

        // Generate a JWT token
        const token = jwt.sign(
            { userId: user.user_id, username: user.username, role: user.role, subRole: user.subrole },
            'your_secret_key', // Replace with a strong secret key
            { expiresIn: '1h' }
        );

        // Send the token and user details in the response
        res.send({
            token,
            user: {
                userId: user.user_id,
                username: user.username,
                role: user.role,
                subRole: user.subrole
            }
        });
    });
});

app.post('/api/corporate/register', (req, res) => {
    const { username, password, role, subrole } = req.body;

    const sql = 'INSERT INTO co_login (user_id, username, password, role, subrole, role_type) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(sql, [generateUserId(), username, password, role, subrole, role.toUpperCase()], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send({ message: 'Database error' });
        }
        if (password !== user.password) {
            return res.status(400).send({ message: 'Invalid password' });
        }

        res.status(201).send({ message: 'User registered successfully' });
    });
});

// Add Token Verification Endpoint
app.post('/api/corporate/verify-token', (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ valid: false, message: 'No token provided' });
    }

    jwt.verify(token, 'your_secret_key', (err, decoded) => {
        if (err) {
            return res.status(401).json({ valid: false, message: 'Invalid token' });
        }

        res.json({ valid: true, user: decoded });
    });
});

// Start the server
const PORT = 5002;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});