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
            { 
                userId: user.user_id, 
                username: user.username, 
                role: user.role, // "IT"
                subRole: user.subrole, // null
                role_type: user.role_type // "ITM"
            },
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
                subRole: user.subrole,
                role_type: user.role_type
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


app.get('/api/it/get-users', (req, res) => {
    db.query("SELECT user_id, username FROM co_login", (err, results) => {
        if (err) {
            console.error("Error fetching users:", err);
            return res.status(500).json({ success: false, message: "Database error" });
        }
        res.json(results);
    });
});






// Password update endpoints
app.put('/api/it/change-password', (req, res) => {
    const { user_id, newPassword } = req.body;

    if (!user_id || !newPassword) {
        return res.status(400).json({ success: false, message: "User ID and new password are required" });
    }

    const updateQuery = "UPDATE co_login SET password = ? WHERE user_id = ?";

    db.query(updateQuery, [newPassword, user_id], (err, result) => {
        if (err) {
            console.error("Error updating password:", err);
            return res.status(500).json({ success: false, message: "Database error" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "User ID not found" });
        }

        res.json({ success: true, message: "Password updated successfully" });
    });
});

// GM view sup_stock
app.get('/api/gm/supplier-stock', (req, res) => {
    const sql = 'SELECT sp_id, s_product_name, s_quantity, sp_unitprice FROM sup_stock ORDER BY sp_id';
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Error fetching stock data'
            });
        }
        
        res.json({
            success: true,
            stock: results
        });
    });
});

//GM place Order
// Function to generate order ID
function generateOrderId() {
    return 'GMO' + Math.random().toString(36).substr(2, 7).toUpperCase();
}

// Get products for dropdown
app.get('/api/gm/products', (req, res) => {
    const sql = 'SELECT sp_id, s_product_name, s_quantity, sp_unitprice FROM sup_stock ORDER BY sp_id';
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Error fetching products'
            });
        }
        
        res.json({
            success: true,
            products: results
        });
    });
});

// Place order endpoint
app.post('/api/gm/place-order', (req, res) => {
    const { sp_id, req_quantity } = req.body;
    
    // First check if product exists and has enough quantity
    const checkSql = 'SELECT s_quantity FROM sup_stock WHERE sp_id = ?';
    db.query(checkSql, [sp_id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Error checking product availability'
            });
        }
        
        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        const availableQuantity = results[0].s_quantity;
        if (req_quantity > availableQuantity) {
            return res.status(400).json({
                success: false,
                message: `Insufficient stock. Available: ${availableQuantity}`
            });
        }
        
        // Generate order ID and insert order
        const gmo_id = generateOrderId();
        const insertSql = 'INSERT INTO gm_order (gmo_id, sp_id, req_quantity, gmo_status) VALUES (?, ?, ?, "Pending")';
        
        db.query(insertSql, [gmo_id, sp_id, req_quantity], (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error placing order'
                });
            }
            
            res.json({
                success: true,
                message: 'Order placed successfully',
                orderId: gmo_id
            });
        });
    });
});

// Get pending orders for supplier
app.get('/api/supplier/pending-orders', (req, res) => {
    const sql = `
        SELECT 
            o.gmo_id,
            o.sp_id,
            s.s_product_name,
            o.req_quantity,
            o.gmo_status
        FROM gm_order o
        JOIN sup_stock s ON o.sp_id = s.sp_id
        WHERE o.gmo_status = 'Pending'
        ORDER BY o.gmo_id`;
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Error fetching pending orders'
            });
        }
        
        res.json({
            success: true,
            orders: results
        });
    });
});

// Update order status (Accept/Reject)
app.put('/api/supplier/update-order/:orderId', (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;
    
    if (!['Accepted', 'Rejected'].includes(status)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid status. Must be Accepted or Rejected'
        });
    }
    
    if (status === 'Accepted') {
        db.beginTransaction(err => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Error starting transaction'
                });
            }
            
            const getOrderSql = 'SELECT sp_id, req_quantity FROM gm_order WHERE gmo_id = ?';
            db.query(getOrderSql, [orderId], (err, orders) => {
                if (err || orders.length === 0) {
                    return db.rollback(() => {
                        res.status(404).json({
                            success: false,
                            message: 'Order not found'
                        });
                    });
                }
                
                const order = orders[0];
                const updateStockSql = 'UPDATE sup_stock SET s_quantity = s_quantity - ? WHERE sp_id = ?';
                
                db.query(updateStockSql, [order.req_quantity, order.sp_id], (err) => {
                    if (err) {
                        return db.rollback(() => {
                            res.status(500).json({
                                success: false,
                                message: 'Error updating stock quantity'
                            });
                        });
                    }
                    
                    const updateOrderSql = 'UPDATE gm_order SET gmo_status = ? WHERE gmo_id = ?';
                    db.query(updateOrderSql, [status, orderId], (err) => {
                        if (err) {
                            return db.rollback(() => {
                                res.status(500).json({
                                    success: false,
                                    message: 'Error updating order status'
                                });
                            });
                        }
                        
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
                                message: 'Order accepted and stock updated successfully'
                            });
                        });
                    });
                });
            });
        });
    } else {
        const sql = 'UPDATE gm_order SET gmo_status = ? WHERE gmo_id = ?';
        db.query(sql, [status, orderId], (err) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error updating order status'
                });
            }
            
            res.json({
                success: true,
                message: 'Order rejected successfully'
            });
        });
    }
});

// Get all orders for GM dashboard
app.get('/api/gm/all-orders', (req, res) => {
    const sql = `
        SELECT 
            o.gmo_id,
            o.sp_id,
            s.s_product_name,
            o.req_quantity,
            o.gmo_status
        FROM gm_order o
        JOIN sup_stock s ON o.sp_id = s.sp_id
        ORDER BY o.gmo_id DESC`;
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Error fetching orders'
            });
        }
        
        res.json({
            success: true,
            orders: results
        });
    });
});

// Get all barcode scanners
app.get('/api/scanners', (req, res) => {
    console.log('Fetching scanners...');
    const sql = 'SELECT * FROM barcode_scanner ORDER BY bs_id';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Error fetching scanners'
            });
        }
        
        console.log('Scanners found:', results); // Add this to see the results
        res.json({
            success: true,
            scanners: results
        });
    });
});

// Create new scanner service record
app.post('/api/scanner-service', (req, res) => {
    const { bs_id } = req.body;
    
    if (!bs_id) {
        return res.status(400).json({
            success: false,
            message: 'Scanner ID is required'
        });
    }
    
    // First check if scanner exists
    db.query('SELECT * FROM barcode_scanner WHERE bs_id = ?', [bs_id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Error checking scanner existence'
            });
        }
        
        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Scanner not found'
            });
        }
        
        // Insert service record
        const sql = 'INSERT INTO scanner_service (bs_id) VALUES (?)';
        db.query(sql, [bs_id], (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error creating service record'
                });
            }
            
            res.json({
                success: true,
                message: 'Service record created successfully',
                serviceId: result.insertId
            });
        });
    });
});




// Get all service records with formatted date
app.get('/api/scanner-services', (req, res) => {
    const sql = `
        SELECT 
            ss.s_service_id,
            ss.bs_id,
            bs.section,
            DATE_FORMAT(ss.date, '%Y-%m-%d %H:%i:%s') as date
        FROM scanner_service ss
        JOIN barcode_scanner bs ON ss.bs_id = bs.bs_id
        ORDER BY ss.date DESC`;
        
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Error fetching service records'
            });
        }
        
        res.json({
            success: true,
            services: results
        });
    });
});

//supplier update price
app.put('/api/update-price', (req, res) => {
    const { sp_id, new_price } = req.body;
    
    if (!sp_id || !new_price) {
        return res.status(400).json({
            success: false,
            message: 'Product ID and new price are required'
        });
    }

    const sql = 'UPDATE sup_stock SET sp_unitprice = ? WHERE sp_id = ?';
    
    db.query(sql, [new_price, sp_id], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Error updating price'
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            message: 'Price updated successfully'
        });
    });
});

//Supplier update stock
app.put('/api/update-stock', (req, res) => {
    const { sp_id, additional_stock, current_stock } = req.body;
    
    if (!sp_id || !additional_stock) {
        return res.status(400).json({
            success: false,
            message: 'Product ID and additional stock quantity are required'
        });
    }

    // Calculate new quantity
    const new_quantity = current_stock + additional_stock;

    const sql = 'UPDATE sup_stock SET s_quantity = ? WHERE sp_id = ?';
    
    db.query(sql, [new_quantity, sp_id], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Error updating stock'
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            message: 'Stock updated successfully',
            new_quantity: new_quantity
        });
    });
});



// Start the server
const PORT = 5002;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});