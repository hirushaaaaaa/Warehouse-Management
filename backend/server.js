const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');

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

// Serve static files from multiple directories
app.use(express.static(path.join(__dirname, '..'))); // Serve from the root folder
app.use('/scripts', express.static(path.join(__dirname, '../scripts'))); // Serve from the scripts folder
app.use('/styles', express.static(path.join(__dirname, '../styles'))); // Serve from the styles folder

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

// Routes for pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/customer-dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'customer-dashboard.html'));
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
    
    // Input validation
    if (!email || !password) {
        console.log('Missing credentials:', { email: !!email, password: !!password });
        return res.status(400).json({ message: 'Email and password are required' });
    }
    
    console.log('Login attempt for email:', email);
    
    try {
        // Fetch customer from the database
        const sql = 'SELECT * FROM customers WHERE email = ?';
        db.query(sql, [email], async (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ message: 'Database error', error: err.message });
            }
            
            console.log('Database query results:', results.length > 0 ? 'Customer found' : 'No customer found');
            
            if (results.length === 0) {
                return res.status(400).json({ message: 'Customer not found' });
            }
            
            const customer = results[0];
            
            try {
                // Compare passwords
                const validPassword = await bcrypt.compare(password, customer.password);
                console.log('Password validation:', validPassword ? 'success' : 'failed');
                
                if (!validPassword) {
                    return res.status(400).json({ message: 'Invalid password' });
                }
                
                // Generate JWT token
                const token = jwt.sign(
                    { id: customer.id, email: customer.email },
                    'your_secret_key',
                    { expiresIn: '1h' }
                );
                
                console.log('Login successful, token generated');
                
                // Send response
                res.json({
                    token,
                    customer: {
                        id: customer.id,
                        name: customer.name,
                        email: customer.email
                    }
                });
            } catch (bcryptError) {
                console.error('Bcrypt error:', bcryptError);
                res.status(500).json({ message: 'Error validating password' });
            }
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
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
    const checkSql = 'SELECT s_quantity, sp_unitprice FROM sup_stock WHERE sp_id = ?';
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
        const unitPrice = results[0].sp_unitprice;
        
        // Check if requested quantity is available
        if (req_quantity > availableQuantity) {
            return res.status(400).json({
                success: false,
                message: `Insufficient stock. Available: ${availableQuantity}`
            });
        }
        
        // Calculate the total price
        const gmo_total = req_quantity * unitPrice;

        // Generate order ID and insert order with total price
        const gmo_id = generateOrderId();
        const insertSql = 'INSERT INTO gm_order (gmo_id, sp_id, req_quantity, gmo_total, gmo_status) VALUES (?, ?, ?, ?, "Pending")';
        
        db.query(insertSql, [gmo_id, sp_id, req_quantity, gmo_total], (err, result) => {
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
            o.gmo_status,
            o.gmo_total
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

// get accepted order details to fm
app.get('/api/supplier/accepted-orders', (req, res) => {
    const sql = `
        SELECT 
            o.gmo_id,
            o.sp_id,
            s.s_product_name,
            o.req_quantity,
            o.gmo_status,
            o.gmo_total
        FROM gm_order o
        JOIN sup_stock s ON o.sp_id = s.sp_id
        WHERE o.gmo_status = 'Accepted' 
        AND o.gmo_id NOT IN (SELECT gmo_id FROM gmo_accounts)
        ORDER BY o.gmo_id`;
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Error fetching accepted orders'
            });
        }
        
        res.json({
            success: true,
            orders: results
        });
    });
});

// add to gm accounts
app.post('/api/supplier/add-to-accounts', (req, res) => {
    const { gmo_id, gmo_total } = req.body;
    
    // Generate a unique gm_acc_id (you might want to modify this based on your needs)
    const gm_acc_id = 'ACC' + Date.now();
    
    const sql = `
        INSERT INTO gmo_accounts (gm_acc_id, gmo_id, gm_total)
        VALUES (?, ?, ?)
    `;
    
    db.query(sql, [gm_acc_id, gmo_id, gmo_total], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Error adding to accounts'
            });
        }
        
        res.json({
            success: true,
            message: 'Successfully added to accounts',
            gm_acc_id
        });
    });
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

// Endpoint to fetch staff IDs
app.get('/api/costaff', (req, res) => {
    const sql = 'SELECT staff_id FROM Staff';
    db.query(sql, (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Error fetching staff IDs'
            });
        }

        res.status(200).json({
            success: true,
            staff: result
        });
    });
});

//Display leaves in hrclerk
app.get('/api/staffleaves', (req, res) => {
    const sql = 'SELECT * FROM leaves ORDER BY created_at DESC'; // Order by created_at in descending order
    db.query(sql, (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Error fetching leave requests'
            });
        }

        res.status(200).json({
            success: true,
            leaves: result
        });
    });
});

// Endpoint to fetch all orders sorted from latest to oldest
app.get('/api/gm/all-orders', (req, res) => {
    const query = `
        SELECT gmo_id, sp_id, s_product_name, req_quantity, gmo_status, 
               created_at AS created_timestamp
        FROM gm_orders
        ORDER BY created_at DESC
    `; // Sorting by created_at in descending order to get latest first

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching orders:', err);
            return res.status(500).json({ success: false, message: "Failed to fetch orders." });
        }

        // Convert timestamp from seconds to readable format before sending response
        const formattedResults = results.map(order => ({
            ...order,
            created_timestamp: new Date(order.created_timestamp * 1000).toLocaleString() // Converts UNIX timestamp to human-readable format
        }));

        res.json({ success: true, orders: formattedResults });
    });
});



app.put('/api/gm/update-order-status/:gmoId', (req, res) => {
    const gmoId = req.params.gmoId;
    const { status } = req.body;

    const query = `
        UPDATE gm_orders 
        SET gmo_status = ? 
        WHERE gmo_id = ?
    `;

    db.query(query, [status, gmoId], (err, result) => {
        if (err) {
            console.error('Error updating order status:', err);
            return res.status(500).json({
                success: false,
                message: "Failed to update order status"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        res.json({
            success: true,
            message: "Order status updated successfully"
        });
    });
});

// Endpoint to send an order (update status to "Sent" and insert into upcoming_sup_stock)
app.post('/api/supplier/send-order/:orderId', (req, res) => {
    const orderId = req.params.orderId;

    // Fetch the order from the database
    const orderQuery = `
        SELECT gmo.gmo_id, gmo.sp_id, gmo.req_quantity, gmo.gmo_status, ss.s_product_name
        FROM gm_order gmo
        JOIN sup_stock ss ON gmo.sp_id = ss.sp_id
        WHERE gmo.gmo_id = ?
    `;
    db.query(orderQuery, [orderId], (err, orderResults) => {
        if (err) {
            console.error('Error fetching order:', err);
            return res.status(500).json({ success: false, message: "Failed to fetch order." });
        }

        if (orderResults.length === 0) {
            return res.status(404).json({ success: false, message: "Order not found." });
        }

        const order = orderResults[0];

        if (order.gmo_status !== "Accepted") {
            return res.status(400).json({ success: false, message: "Order is not in 'Accepted' status." });
        }

        // Insert into upcoming_sup_stock table with gmo_id as a foreign key
        const insertUpcomingStockQuery = `
            INSERT INTO upcoming_sup_stock (gmo_id, up_product_name, up_quantity)
            VALUES (?, ?, ?)
        `;
        db.query(insertUpcomingStockQuery, [order.gmo_id, order.s_product_name, order.req_quantity], (err) => {
            if (err) {
                console.error('Error inserting into upcoming_sup_stock:', err);
                return res.status(500).json({ success: false, message: "Failed to update upcoming stock." });
            }

            // Update the order status to "Sent"
            const updateOrderQuery = 'UPDATE gm_order SET gmo_status = ? WHERE gmo_id = ?';
            db.query(updateOrderQuery, ["Sent", order.gmo_id], (err) => {
                if (err) {
                    console.error('Error updating order status:', err);
                    return res.status(500).json({ success: false, message: "Failed to update order status." });
                }

                res.json({ success: true, message: "Order sent and upcoming stock updated successfully." });
            });
        });
    });
});



// Endpoint to fetch upcoming deliveries
app.get('/api/driver/upcoming-deliveries', (req, res) => {
    const query = 'SELECT * FROM upcoming_sup_stock'; // Fetch all upcoming deliveries
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching upcoming deliveries:', err);
            return res.status(500).json({ success: false, message: "Failed to fetch upcoming deliveries." });
        }
        res.json({ success: true, deliveries: results });
    });
});

// Endpoint to fetch all upcoming stock entries
app.get('/api/driver/upcoming-stock', (req, res) => {
    const query = 'SELECT * FROM upcoming_sup_stock'; // Fetch all upcoming stock entries
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching upcoming stock:', err);
            return res.status(500).json({ success: false, message: "Failed to fetch upcoming stock." });
        }
        res.json({ success: true, stock: results });
    });
});

// Endpoint to move an entry from upcoming_sup_stock to tobe_delivered_stock
app.post('/api/driver/receive-stock/:upId', (req, res) => {
    const upId = req.params.upId;

    // Fetch the entry from upcoming_sup_stock
    const fetchQuery = 'SELECT * FROM upcoming_sup_stock WHERE up_id = ?';
    db.query(fetchQuery, [upId], (err, results) => {
        if (err) {
            console.error('Error fetching stock entry:', err);
            return res.status(500).json({ success: false, message: "Failed to fetch stock entry." });
        }

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: "Stock entry not found." });
        }

        const stockEntry = results[0];

        // Insert into tobe_delivered_stock
        const insertQuery = `
            INSERT INTO tobe_delivered_stock (gmo_id, tbdp__name, tbdp_quantity, tbdp_status)
            VALUES (?, ?, ?, 'Pending')
        `;
        db.query(insertQuery, [stockEntry.gmo_id, stockEntry.up_product_name, stockEntry.up_quantity], (err) => {
            if (err) {
                console.error('Error inserting into tobe_delivered_stock:', err);
                return res.status(500).json({ success: false, message: "Failed to move stock entry." });
            }

            // Remove from upcoming_sup_stock
            const deleteQuery = 'DELETE FROM upcoming_sup_stock WHERE up_id = ?';
            db.query(deleteQuery, [upId], (err) => {
                if (err) {
                    console.error('Error deleting from upcoming_sup_stock:', err);
                    return res.status(500).json({ success: false, message: "Failed to delete stock entry." });
                }

                res.json({ success: true, message: "Stock entry moved successfully." });
            });
        });
    });
});

// Endpoint to update tbdp_status to "Delivered"
app.post('/api/driver/complete-delivery/:tbdpId', (req, res) => {
    const tbdpId = req.params.tbdpId;

    const updateQuery = 'UPDATE tobe_delivered_stock SET tbdp_status = ? WHERE tbdp_id = ?';
    db.query(updateQuery, ["Delivered", tbdpId], (err) => {
        if (err) {
            console.error('Error updating delivery status:', err);
            return res.status(500).json({ success: false, message: "Failed to update delivery status." });
        }

        res.json({ success: true, message: "Delivery status updated successfully." });
    });
});

// Endpoint to fetch all to-be-delivered stock entries (excluding tbdp_status)
app.get('/api/assistant/tobe-delivered-stock', (req, res) => {
    const query = 'SELECT tbdp_id, gmo_id, tbdp__name, tbdp_quantity FROM tobe_delivered_stock'; // Fetch all to-be-delivered stock entries
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching to-be-delivered stock:', err);
            return res.status(500).json({ success: false, message: "Failed to fetch to-be-delivered stock." });
        }
        res.json({ success: true, stock: results });
    });
});

// Endpoint to update tbdp_status to "Delivered"
app.post('/api/assistant/complete-delivery/:tbdpId', (req, res) => {
    const tbdpId = req.params.tbdpId;

    const updateQuery = 'UPDATE tobe_delivered_stock SET tbdp_status = ? WHERE tbdp_id = ?';
    db.query(updateQuery, ["Delivered", tbdpId], (err) => {
        if (err) {
            console.error('Error updating delivery status:', err);
            return res.status(500).json({ success: false, message: "Failed to update delivery status." });
        }

        res.json({ success: true, message: "Delivery status updated successfully." });
    });
});

// Endpoint to fetch all gmo_id values from tobe_delivered_stock
app.get('/api/assistant/tobe-delivered-gmo-ids', (req, res) => {
    const query = 'SELECT DISTINCT gmo_id FROM tobe_delivered_stock'; // Fetch unique gmo_id values
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching gmo_ids:', err);
            return res.status(500).json({ success: false, message: "Failed to fetch gmo_ids." });
        }
        res.json({ success: true, gmoIds: results });
    });
});

// Endpoint to update tbdp_status to "Delivered" and move data to raw_stock
app.post('/api/assistant/confirm-delivery/:gmoId', (req, res) => {
    const gmoId = req.params.gmoId;

    // Fetch the data from tobe_delivered_stock
    const fetchQuery = 'SELECT * FROM tobe_delivered_stock WHERE gmo_id = ?';
    db.query(fetchQuery, [gmoId], (err, results) => {
        if (err) {
            console.error('Error fetching to-be-delivered stock:', err);
            return res.status(500).json({ success: false, message: "Failed to fetch to-be-delivered stock." });
        }

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: "No stock found for the selected gmo_id." });
        }

        const stockEntry = results[0];

        // Insert into raw_stock
        const insertQuery = `
            INSERT INTO raw_stock (gmo_id, rsp__name, rsp_quantity, rs_status)
            VALUES (?, ?, ?, 'Pending')
        `;
        db.query(insertQuery, [stockEntry.gmo_id, stockEntry.tbdp__name, stockEntry.tbdp_quantity], (err) => {
            if (err) {
                console.error('Error inserting into raw_stock:', err);
                return res.status(500).json({ success: false, message: "Failed to move stock to raw_stock." });
            }

            // Update tbdp_status to "Delivered" in tobe_delivered_stock
            const updateQuery = 'UPDATE tobe_delivered_stock SET tbdp_status = ? WHERE gmo_id = ?';
            db.query(updateQuery, ["Delivered", gmoId], (err) => {
                if (err) {
                    console.error('Error updating tbdp_status:', err);
                    return res.status(500).json({ success: false, message: "Failed to update tbdp_status." });
                }

                res.json({ success: true, message: "Stock confirmed as delivered and moved to raw_stock successfully." });
            });
        });
    });
});

// Endpoint to fetch details for a specific gmo_id
app.get('/api/assistant/tobe-delivered-details/:gmoId', (req, res) => {
    const gmoId = req.params.gmoId;

    const query = 'SELECT * FROM tobe_delivered_stock WHERE gmo_id = ?'; // Fetch details for the selected gmo_id
    db.query(query, [gmoId], (err, results) => {
        if (err) {
            console.error('Error fetching stock details:', err);
            return res.status(500).json({ success: false, message: "Failed to fetch stock details." });
        }

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: "No stock details found for the selected gmo_id." });
        }

        res.json({ success: true, stockDetails: results });
    });
});

// Endpoint to fetch all delivered stock entries
app.get('/api/driver/delivered-stock', (req, res) => {
    const query = 'SELECT * FROM tobe_delivered_stock WHERE tbdp_status = "Delivered"'; // Fetch all delivered stock entries
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching delivered stock:', err);
            return res.status(500).json({ success: false, message: "Failed to fetch delivered stock." });
        }

        // Calculate the total number of deliveries
        const totalDeliveries = results.length;

        res.json({ success: true, deliveredStock: results, totalDeliveries });
    });
});

// Endpoint to fetch all upcoming stock entries
app.get('/api/driver/upcoming-stock', (req, res) => {
    const query = 'SELECT * FROM upcoming_sup_stock'; // Fetch all upcoming stock entries
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching upcoming stock:', err);
            return res.status(500).json({ success: false, message: "Failed to fetch upcoming stock." });
        }
        res.json({ success: true, stock: results });
    });
});

// Endpoint to move an entry from upcoming_sup_stock to tobe_delivered_stock
app.post('/api/driver/receive-stock/:upId', (req, res) => {
    const upId = req.params.upId;

    // Fetch the entry from upcoming_sup_stock
    const fetchQuery = 'SELECT * FROM upcoming_sup_stock WHERE up_id = ?';
    db.query(fetchQuery, [upId], (err, results) => {
        if (err) {
            console.error('Error fetching stock entry:', err);
            return res.status(500).json({ success: false, message: "Failed to fetch stock entry." });
        }

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: "Stock entry not found." });
        }

        const stockEntry = results[0];

        // Insert into tobe_delivered_stock
        const insertQuery = `
            INSERT INTO tobe_delivered_stock (gmo_id, tbdp__name, tbdp_quantity, tbdp_status)
            VALUES (?, ?, ?, 'Pending')
        `;
        db.query(insertQuery, [stockEntry.gmo_id, stockEntry.up_product_name, stockEntry.up_quantity], (err) => {
            if (err) {
                console.error('Error inserting into tobe_delivered_stock:', err);
                return res.status(500).json({ success: false, message: "Failed to move stock entry." });
            }

            // Remove from upcoming_sup_stock
            const deleteQuery = 'DELETE FROM upcoming_sup_stock WHERE up_id = ?';
            db.query(deleteQuery, [upId], (err) => {
                if (err) {
                    console.error('Error deleting from upcoming_sup_stock:', err);
                    return res.status(500).json({ success: false, message: "Failed to delete stock entry." });
                }

                res.json({ success: true, message: "Stock entry moved successfully." });
            });
        });
    });
});

// Endpoint to fetch all upcoming stock entries
app.get('/api/driver/upcoming-stock', (req, res) => {
    const query = 'SELECT * FROM upcoming_sup_stock'; // Fetch all upcoming stock entries
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching upcoming stock:', err);
            return res.status(500).json({ success: false, message: "Failed to fetch upcoming stock." });
        }
        res.json({ success: true, stock: results });
    });
});

// Endpoint to move an entry from upcoming_sup_stock to tobe_delivered_stock
app.post('/api/driver/receive-stock/:upId', (req, res) => {
    const upId = req.params.upId;

    // Fetch the entry from upcoming_sup_stock
    const fetchQuery = 'SELECT * FROM upcoming_sup_stock WHERE up_id = ?';
    db.query(fetchQuery, [upId], (err, results) => {
        if (err) {
            console.error('Error fetching stock entry:', err);
            return res.status(500).json({ success: false, message: "Failed to fetch stock entry." });
        }

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: "Stock entry not found." });
        }

        const stockEntry = results[0];

        // Insert into tobe_delivered_stock
        const insertQuery = `
            INSERT INTO tobe_delivered_stock (gmo_id, sp_id, tbdp__name, tbdp_quantity, tbdp_status)
            VALUES (?, ?, ?, ?, 'Pending')
        `;
        db.query(insertQuery, [stockEntry.gmo_id, stockEntry.sp_id, stockEntry.up_product_name, stockEntry.up_quantity], (err) => {
            if (err) {
                console.error('Error inserting into tobe_delivered_stock:', err);
                return res.status(500).json({ success: false, message: "Failed to move stock entry." });
            }

            // Remove from upcoming_sup_stock
            const deleteQuery = 'DELETE FROM upcoming_sup_stock WHERE up_id = ?';
            db.query(deleteQuery, [upId], (err) => {
                if (err) {
                    console.error('Error deleting from upcoming_sup_stock:', err);
                    return res.status(500).json({ success: false, message: "Failed to delete stock entry." });
                }

                res.json({ success: true, message: "Stock entry moved successfully." });
            });
        });
    });
});

// Endpoint to fetch all GMO IDs with pending deliveries
app.get('/api/warehouse/tobe-delivered-gmo-ids', (req, res) => {
    const query = `
        SELECT DISTINCT t.gmo_id, t.tbdp__name 
        FROM tobe_delivered_stock t 
        WHERE t.tbdp_status = 'Pending'
        ORDER BY t.gmo_id DESC
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching GMO IDs:', err);
            return res.status(500).json({ 
                success: false, 
                message: "Failed to fetch orders" 
            });
        }
        res.json({ 
            success: true, 
            gmoIds: results 
        });
    });
});

// Endpoint to fetch stock details for a specific GMO ID
app.get('/api/warehouse/stock-details/:gmoId', (req, res) => {
    const gmoId = req.params.gmoId;
    
    const query = `
        SELECT * 
        FROM tobe_delivered_stock 
        WHERE gmo_id = ? AND tbdp_status = 'Pending'
    `;
    
    db.query(query, [gmoId], (err, results) => {
        if (err) {
            console.error('Error fetching stock details:', err);
            return res.status(500).json({ 
                success: false, 
                message: "Failed to fetch stock details" 
            });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "No pending stock found for this order" 
            });
        }
        
        res.json({ 
            success: true, 
            stockDetails: results 
        });
    });
});

// Endpoint to confirm delivery and move stock to raw_stock
app.post('/api/warehouse/confirm-delivery/:gmoId', (req, res) => {
    const gmoId = req.params.gmoId;
    
    // Start transaction
    db.beginTransaction(err => {
        if (err) {
            console.error('Error starting transaction:', err);
            return res.status(500).json({ 
                success: false, 
                message: "Database error" 
            });
        }

        // First, fetch the pending items for this GMO ID
        const selectQuery = `
            SELECT * 
            FROM tobe_delivered_stock 
            WHERE gmo_id = ? AND tbdp_status = 'Pending'
        `;
        
        db.query(selectQuery, [gmoId], (err, items) => {
            if (err) {
                return db.rollback(() => {
                    console.error('Error selecting items:', err);
                    res.status(500).json({ 
                        success: false, 
                        message: "Failed to process delivery" 
                    });
                });
            }

            if (items.length === 0) {
                return db.rollback(() => {
                    res.status(404).json({ 
                        success: false, 
                        message: "No pending items found" 
                    });
                });
            }

            // Insert into raw_stock
            const insertQuery = `
                INSERT INTO raw_stock (gmo_id, rsp__name, rsp_quantity, rs_status)
                VALUES (?, ?, ?, 'Received')
            `;
            
            db.query(insertQuery, [
                items[0].gmo_id,
                items[0].tbdp__name,
                items[0].tbdp_quantity
            ], (err) => {
                if (err) {
                    return db.rollback(() => {
                        console.error('Error inserting into raw_stock:', err);
                        res.status(500).json({ 
                            success: false, 
                            message: "Failed to move stock to raw_stock" 
                        });
                    });
                }

                // Delete from tobe_delivered_stock
                const deleteQuery = `
                    DELETE FROM tobe_delivered_stock 
                    WHERE gmo_id = ? AND tbdp_status = 'Pending'
                `;
                
                db.query(deleteQuery, [gmoId], (err) => {
                    if (err) {
                        return db.rollback(() => {
                            console.error('Error deleting from tobe_delivered_stock:', err);
                            res.status(500).json({ 
                                success: false, 
                                message: "Failed to complete delivery process" 
                            });
                        });
                    }

                    // Commit the transaction
                    db.commit(err => {
                        if (err) {
                            return db.rollback(() => {
                                console.error('Error committing transaction:', err);
                                res.status(500).json({ 
                                    success: false, 
                                    message: "Failed to complete delivery process" 
                                });
                            });
                        }

                        res.json({ 
                            success: true, 
                            message: "Stock successfully moved to raw_stock" 
                        });
                    });
                });
            });
        });
    });
});

// Endpoint to fetch the total number of deliveries from raw_stock
app.get('/api/warehouse/total-deliveries', (req, res) => {
    const query = `SELECT COUNT(rs_id) AS totalDeliveries FROM raw_stock`;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching raw stock count:', err);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch delivery count"
            });
        }

        // Extract total deliveries from the result
        const totalDeliveries = results[0].totalDeliveries;

        res.json({
            success: true,
            totalDeliveries: totalDeliveries
        });
    });
});


// Fetch available GMO IDs
app.get('/api/stock/gmo-ids', (req, res) => {
    const query = `
        SELECT DISTINCT rs.gmo_id, rs.rsp_quantity
        FROM raw_stock rs
        INNER JOIN gm_order gmo ON rs.gmo_id = gmo.gmo_id
        WHERE rs.rs_status = 'Received'
        AND NOT EXISTS (
            SELECT 1 FROM good_stock_arrival gsa
            WHERE gsa.gmo_id = rs.gmo_id
        )
        AND NOT EXISTS (
            SELECT 1 FROM damaged_stock_arrival dsa
            WHERE dsa.gmo_id = rs.gmo_id
        )
        ORDER BY rs.gmo_id
    `;

    db.query(query, (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: "Error fetching GMO IDs",
                error: err.message
            });
        }

        console.log('GMO IDs query result:', result);
        res.json({
            success: true,
            gmoIds: result
        });
    });
});

// Fetch arrival barcode scanners
app.get('/api/barcode-scanner/arrival', (req, res) => {
    const query = "SELECT bs_id FROM barcode_scanner WHERE section = 'Arrival'";

    db.query(query, (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: "Error fetching barcode scanners",
                error: err.message
            });
        }

        console.log('Barcode scanners query result:', result);
        res.json({
            success: true,
            barcodeScanners: result
        });
    });
});

// Fetch GMO details
app.get('/api/stock/details/:gmoId', (req, res) => {
    const gmoId = req.params.gmoId;
    const query = `
        SELECT rs.rsp_quantity
        FROM raw_stock rs
        WHERE rs.gmo_id = ? AND rs.rs_status = 'Received'
    `;

    db.query(query, [gmoId], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: "Error fetching GMO details",
                error: err.message
            });
        }

        if (result.length === 0) {
            return res.status(404).json({
                success: false,
                message: "GMO ID not found"
            });
        }

        console.log('GMO details query result:', result);
        res.json({
            success: true,
            rsp_quantity: result[0].rsp_quantity
        });
    });
});

// Fetch available GMO IDs
app.get('/api/stock/gmo-ids', (req, res) => {
    const query = `
        SELECT DISTINCT rs.gmo_id, rs.rsp_quantity
        FROM raw_stock rs
        INNER JOIN gm_order gmo ON rs.gmo_id = gmo.gmo_id
        WHERE rs.rs_status = 'Received'
        AND rs.gmo_id NOT IN (
            SELECT gmo_id FROM good_stock_arrival
            UNION
            SELECT gmo_id FROM damaged_stock_arrival
        )
        ORDER BY rs.gmo_id
    `;

    db.query(query, (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: "Error fetching GMO IDs",
                error: err.message
            });
        }

        console.log('Filtered GMO IDs query result:', result);
        res.json({
            success: true,
            gmoIds: result
        });
    });
});


// Add stock arrival
app.post('/api/warehouse/add-stock-arrival', (req, res) => {
    const { gmoId, bsId, goodQuantity, damagedQuantity } = req.body;

    // Fetch sp_id from gm_order
    const fetchSpIdQuery = `SELECT sp_id FROM gm_order WHERE gmo_id = ?`;

    db.query(fetchSpIdQuery, [gmoId], (err, result) => {
        if (err) {
            console.error("Error fetching sp_id:", err);
            return res.status(500).json({ success: false, message: "Error fetching sp_id" });
        }

        if (result.length === 0 || !result[0].sp_id) {
            console.error("SP ID Not Found for GMO ID:", gmoId);
            return res.status(400).json({ success: false, message: "Invalid gmo_id or missing sp_id" });
        }

        const spId = result[0].sp_id;
        console.log("Retrieved sp_id:", spId);

        // Insert into good_stock_arrival
        const insertGoodStockQuery = `
            INSERT INTO good_stock_arrival (bs_id, sp_id, gmo_id, gsa_quantity)
            VALUES (?, ?, ?, ?);
        `;

        db.query(insertGoodStockQuery, [bsId, spId, gmoId, goodQuantity], (err, result) => {
            if (err) {
                console.error("Error inserting into good_stock_arrival:", err);
                return res.status(500).json({ success: false, message: "Error inserting into good_stock_arrival" });
            }

            // Update p_quantity in stocks table by adding gsa_quantity to it
            const updateStockQuantityQuery = `
                UPDATE stocks
                SET p_quantity = p_quantity + ?
                WHERE sp_id = ?
            `;

            db.query(updateStockQuantityQuery, [goodQuantity, spId], (err, result) => {
                if (err) {
                    console.error("Error updating stock quantity:", err);
                    return res.status(500).json({ success: false, message: "Error updating stock quantity" });
                }

                console.log("Stock quantity updated successfully");

                // Insert into damaged_stock_arrival
                const insertDamagedStockQuery = `
                    INSERT INTO damaged_stock_arrival (bs_id, sp_id, gmo_id, dsa_quantity)
                    VALUES (?, ?, ?, ?);
                `;

                db.query(insertDamagedStockQuery, [bsId, spId, gmoId, damagedQuantity], (err, result) => {
                    if (err) {
                        console.error("Error inserting into damaged_stock_arrival:", err);
                        return res.status(500).json({ success: false, message: "Error inserting into damaged_stock_arrival" });
                    }

                    res.json({ success: true, message: "Stock and Damaged records updated successfully" });
                });
            });
        });
    });
});


// GET endpoint to fetch all damaged stock for wm
app.get('/api/damaged-stock', (req, res) => {
    const query = `
        SELECT 
            dsa_id,
            bs_id,
            sp_id,
            dsa_quantity,
            gmo_id
        FROM damaged_stock_arrival
        ORDER BY dsa_id DESC
    `;

    db.query(query, (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: "Error fetching damaged stock",
                error: err.message
            });
        }

        res.json({
            success: true,
            damagedStock: result
        });
    });
});

// API Routes
app.get('/api/stocks', (req, res) => {
    console.log('Fetching stocks...');
    const sql = 'SELECT * FROM stocks';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching stock data:', err);
            return res.status(500).json({ message: 'Failed to fetch stock data' });
        }
        console.log('Stock data fetched:', results);
        res.status(200).json(results);
    });
});

// Handle Purchase Endpoint
app.post('/api/purchase', (req, res) => {
    const { productId, quantity } = req.body;

    // Step 1: Check if the product exists and has sufficient quantity
    const checkStockSql = 'SELECT p_quantity FROM stocks WHERE p_id = ?';
    db.query(checkStockSql, [productId], (err, results) => {
        if (err) {
            console.error('Error fetching product:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        const availableQuantity = results[0].p_quantity;

        if (quantity > availableQuantity) {
            return res.status(400).json({ success: false, message: 'Quantity exceeds available stock' });
        }

        // Step 2: Update the stock quantity
        const updateStockSql = 'UPDATE stocks SET p_quantity = p_quantity - ? WHERE p_id = ?';
        db.query(updateStockSql, [quantity, productId], (err) => {
            if (err) {
                console.error('Error updating stock:', err);
                return res.status(500).json({ success: false, message: 'Database error' });
            }

            res.status(200).json({ success: true, message: 'Purchase successful' });
        });
    });
});

app.get('/api/stockss', (req, res) => {
    const sql = 'SELECT * FROM stocks WHERE p_quantity > 0';

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Database error' });
        }
        res.json(results);
    });
});

app.post('/api/orders', async (req, res) => {
    const { user_id, p_id, co_quantity } = req.body;

    if (!user_id || !p_id || !co_quantity) {
        return res.status(400).json({ 
            success: false, 
            message: 'All fields are required' 
        });
    }

    // Fetch stock details
    const stockQuery = 'SELECT p_quantity, p_unitprice FROM stocks WHERE p_id = ?';
    db.query(stockQuery, [p_id], (err, stockResults) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Database error' 
            });
        }

        if (stockResults.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Product not found' 
            });
        }

        const stock = stockResults[0];

        if (co_quantity > stock.p_quantity) {
            return res.status(400).json({ 
                success: false, 
                message: `Only ${stock.p_quantity} items available` 
            });
        }

        const co_price = stock.p_unitprice;
        const total = co_quantity * co_price;

        // Insert order into cus_order table
        const orderQuery = `
            INSERT INTO cus_order (user_id, p_id, co_quantity, co_price, total) 
            VALUES (?, ?, ?, ?, ?)`;

        db.query(orderQuery, [user_id, p_id, co_quantity, co_price, total], (err, orderResults) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Error placing order' 
                });
            }

            const co_id = orderResults.insertId; // Get the auto-generated co_id

            // Insert into sales table
            const salesQuery = `
                INSERT INTO sales (co_id, p_id, total) 
                VALUES (?, ?, ?)`;

            db.query(salesQuery, [co_id, p_id, total], (err) => {
                if (err) {
                    console.error('Sales insert error:', err);
                    return res.status(500).json({ 
                        success: false, 
                        message: 'Error adding to sales' 
                    });
                }

                // Update stock quantity
                const updateStockQuery = 'UPDATE stocks SET p_quantity = p_quantity - ? WHERE p_id = ?';
                db.query(updateStockQuery, [co_quantity, p_id], (err) => {
                    if (err) {
                        console.error('Stock update error:', err);
                        return res.status(500).json({ 
                            success: false, 
                            message: 'Error updating stock' 
                        });
                    }

                    res.json({ 
                        success: true, 
                        message: 'Order placed successfully and added to sales', 
                        orderId: co_id 
                    });
                });
            });
        });
    });
});

// get total arrivals wm
app.get('/api/total-arrivals', (req, res) => {
    // Query for good stock total
    const goodStockSql = 'SELECT COUNT(gsa_id) as total FROM good_stock_arrival';
    
    db.query(goodStockSql, (err, goodStockResult) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Error fetching good stock total'
            });
        }

        // Query for damaged stock total
        const damagedStockSql = 'SELECT COUNT(dsa_id) as total FROM damaged_stock_arrival';
        
        db.query(damagedStockSql, (err, damagedStockResult) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error fetching damaged stock total'
                });
            }

            const goodStockTotal = goodStockResult[0].total;
            const damagedStockTotal = damagedStockResult[0].total;
            const totalStock = goodStockTotal + damagedStockTotal;

            res.json({
                success: true,
                goodStockTotal: goodStockTotal,
                damagedStockTotal: damagedStockTotal,
                totalStock: totalStock
            });
        });
    });
});

// API to fetch customer orders
app.get('/api/customer-orders', (req, res) => {
    const query = `
        SELECT 
            co_id AS 'Customer Order Id', 
            user_id AS 'User Id', 
            p_id AS 'Product Id', 
            co_quantity AS 'Quantity', 
            total AS 'Total'
        FROM cus_order;
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching customer orders:', err);
            return res.status(500).json({ error: 'Failed to fetch customer orders' });
        }

        // Send the results back to the frontend
        res.status(200).json(results);
    });
});

// API to fetch pending orders
app.get('/api/co-pending-orders', (req, res) => {
    const query = `
        SELECT co_id, user_id, p_id, co_quantity AS quantity, total
        FROM cus_order
        WHERE co_status = 'pending';
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching pending orders:', err);
            return res.status(500).json({ error: 'Failed to fetch pending orders' });
        }

        res.status(200).json(results);
    });
});

// API to send stock
app.post('/api/send-co-stock', (req, res) => {
    const { co_id, user_id, p_id, quantity, total } = req.body;

    // Step 1: Update p_quantity in stocks table
    const updateStockQuery = `
        UPDATE stocks
        SET p_quantity = p_quantity - ?
        WHERE p_id = ?;
    `;

    db.query(updateStockQuery, [quantity, p_id], (err, results) => {
        if (err) {
            console.error('Error updating stock quantity:', err);
            return res.status(500).json({ error: 'Failed to update stock quantity' });
        }

        // Step 2: Insert into stocksent table
        const insertQuery = `
            INSERT INTO stocksent (co_id, user_id, p_id, quantity, total)
            VALUES (?, ?, ?, ?, ?);
        `;

        db.query(insertQuery, [co_id, user_id, p_id, quantity, total], (err, results) => {
            if (err) {
                console.error('Error inserting into stocksent:', err);
                return res.status(500).json({ error: 'Failed to send stock' });
            }

            // Step 3: Update co_status in cus_order table
            const updateStatusQuery = `
                UPDATE cus_order
                SET co_status = 'completed'
                WHERE co_id = ?;
            `;

            db.query(updateStatusQuery, [co_id], (err, results) => {
                if (err) {
                    console.error('Error updating cus_order:', err);
                    return res.status(500).json({ error: 'Failed to update order status' });
                }

                res.status(200).json({ message: 'Stock sent successfully' });
            });
        });
    });
});

//total send off stock
app.get('/api/total-co-departures', (req, res) => {
    const query = 'SELECT COUNT(send_stock_id) as total FROM stocksent';

    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Error fetching total departures'
            });
        }

        const totalDepartures = results[0].total;

        res.json({
            success: true,
            totalDepartures: totalDepartures
        });
    });
});

app.get('/api/stock/report', (req, res) => {
    const queries = {
        totalArrivals: `
            SELECT 
                (SELECT COUNT(gsa_id) FROM good_stock_arrival) AS good_stock,
                (SELECT COUNT(dsa_id) FROM damaged_stock_arrival) AS damaged_stock,
                (SELECT COUNT(rs_id) FROM raw_stock) AS raw_stock;
        `,
        totalDepartures: `
            SELECT COUNT(send_stock_id) AS total_departures FROM stocksent;
        `,
        pendingOrders: `
            SELECT COUNT(co_id) AS pending_orders FROM cus_order WHERE co_status = 'pending';
        `,
        completedOrders: `
            SELECT COUNT(co_id) AS completed_orders FROM cus_order WHERE co_status = 'completed';
        `,
        stockLevels: `
            SELECT p_id, p_name, p_quantity FROM stocks;
        `
    };

    // Execute all queries
    db.query(queries.totalArrivals, (err, totalArrivals) => {
        if (err) return res.status(500).json({ error: 'Error fetching total arrivals' });

        db.query(queries.totalDepartures, (err, totalDepartures) => {
            if (err) return res.status(500).json({ error: 'Error fetching total departures' });

            db.query(queries.pendingOrders, (err, pendingOrders) => {
                if (err) return res.status(500).json({ error: 'Error fetching pending orders' });

                db.query(queries.completedOrders, (err, completedOrders) => {
                    if (err) return res.status(500).json({ error: 'Error fetching completed orders' });

                    db.query(queries.stockLevels, (err, stockLevels) => {
                        if (err) return res.status(500).json({ error: 'Error fetching stock levels' });

                        // Send the report data
                        res.json({
                            success: true,
                            totalArrivals: totalArrivals[0],
                            totalDepartures: totalDepartures[0],
                            pendingOrders: pendingOrders[0],
                            completedOrders: completedOrders[0],
                            stockLevels: stockLevels
                        });
                    });
                });
            });
        });
    });
});

app.get('/api/most-purchased-products', (req, res) => {
    const query = `
        SELECT 
            s.s_product_name AS product_name,
            SUM(g.req_quantity) AS total_quantity_purchased,
            SUM(g.gmo_total) AS total_amount_spent
        FROM 
            gm_order g
        JOIN 
            sup_stock s ON g.sp_id = s.sp_id
        WHERE 
            g.gmo_status IN ('Accepted', 'Sent')
        GROUP BY 
            s.s_product_name
        ORDER BY 
            total_quantity_purchased DESC;
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Error fetching most purchased products'
            });
        }

        res.json({
            success: true,
            data: results
        });
    });
});

app.get('/api/stock-levels', (req, res) => {
    const query = `
        SELECT 
            s.p_id,
            s.sp_id,
            s.p_name,
            s.p_quantity,
            s.p_unitprice
        FROM 
            stocks s
        WHERE 
            s.p_quantity < 100
        ORDER BY 
            s.p_quantity ASC;
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Error fetching stock levels'
            });
        }

        res.json({
            success: true,
            stocks: results
        });
    });
});

// Optional: Add an endpoint to get full stock history
app.get('/api/stock-history', (req, res) => {
    const query = `
        SELECT 
            s.p_id,
            s.sp_id,
            s.p_name,
            s.p_quantity,
            s.p_unitprice,
            CASE 
                WHEN s.p_quantity <= 80 THEN 'CRITICAL'
                WHEN s.p_quantity < 100 THEN 'LOW'
                ELSE 'NORMAL'
            END AS stock_status
        FROM 
            stocks s
        ORDER BY 
            s.p_quantity ASC;
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Error fetching stock history'
            });
        }

        res.json({
            success: true,
            stocks: results
        });
    });
});

// GET /api/payroll
app.get('/api/payroll', (req, res) => {
    const query = `
        SELECT 
            user_id,
            username,
            role_type,
            amount
        FROM 
            payroll
        ORDER BY 
            user_id ASC;
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Error fetching payroll data'
            });
        }

        res.json({
            success: true,
            payroll: results
        });
    });
});

// PUT /api/payroll/:user_id
app.put('/api/payroll/:user_id', (req, res) => {
    const { user_id } = req.params;
    const { amount } = req.body;

    const query = `
        UPDATE payroll
        SET amount = ?
        WHERE user_id = ?;
    `;

    db.query(query, [amount, user_id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Error updating payroll data'
            });
        }

        res.json({
            success: true,
            message: 'Payroll data updated successfully'
        });
    });
});

app.post('/api/sales', (req, res) => {
    const { co_id, p_id, total } = req.body;

    const query = `
        INSERT INTO sales (co_id, p_id, total)
        VALUES (?, ?, ?);
    `;

    db.query(query, [co_id, p_id, total], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Error adding to sales'
            });
        }

        res.json({
            success: true,
            message: 'Sales data added successfully'
        });
    });
});

// GET /api/sales
app.get('/api/sales', (req, res) => {
    const query = `
        SELECT 
            s.sale_id,
            s.co_id,
            s.p_id,
            s.total,
            c.co_quantity,
            c.co_price,
            c.user_id,
            c.co_status
        FROM 
            sales s
        INNER JOIN 
            cus_order c ON s.co_id = c.co_id
        ORDER BY 
            s.sale_id ASC;
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Error fetching sales data' 
            });
        }

        res.json({ 
            success: true, 
            sales: results 
        });
    });
});

// GET /api/sales-report
app.get('/api/sales-report', (req, res) => {
    const query = `
        SELECT 
            s.sale_id,
            s.co_id,
            s.p_id,
            s.total AS sale_total,
            c.co_quantity,
            c.co_price,
            c.user_id,
            c.co_status,
            st.p_name AS product_name,
            st.p_unitprice AS product_unit_price,
            cu.name AS customer_name
        FROM 
            sales s
        INNER JOIN 
            cus_order c ON s.co_id = c.co_id
        INNER JOIN 
            stocks st ON s.p_id = st.p_id
        INNER JOIN 
            customers cu ON c.user_id = cu.id
        ORDER BY 
            s.sale_id ASC;
    `;

    console.log('Executing query:', query); // Log the query

    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err); // Log the error
            return res.status(500).json({ 
                success: false, 
                message: 'Error generating sales report' 
            });
        }

        console.log('Query results:', results); // Log the results

        // Calculate totals for the report
        const totalSales = results.reduce((sum, sale) => sum + parseFloat(sale.sale_total), 0);
        const totalItemsSold = results.reduce((sum, sale) => sum + sale.co_quantity, 0);

        console.log('Total Sales:', totalSales); // Log total sales
        console.log('Total Items Sold:', totalItemsSold); // Log total items sold

        res.json({ 
            success: true, 
            report: {
                totalSales,
                totalItemsSold,
                sales: results
            }
        });
    });
});

// API to fetch salary data
app.get('/api/salary-data', (req, res) => {
    const query = `
        SELECT 
            user_id AS 'User Id', 
            username AS 'Username', 
            role_type AS 'Role Type', 
            amount AS 'Amount'
        FROM payroll;
    `;

    // Execute the query
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching salary data:', err);
            return res.status(500).json({ error: 'Failed to fetch salary data' });
        }

        // Send the results back to the frontend
        res.status(200).json(results);
    });
});

app.get('/api/check-payment', (req, res) => {
    const { user_id, month, year } = req.query;

    const query = `
        SELECT COUNT(*) AS payment_count
        FROM salary_payments
        WHERE user_id = ? AND payment_month = ? AND payment_year = ?;
    `;

    db.query(query, [user_id, month, year], (err, results) => {
        if (err) {
            console.error('Error checking payment:', err);
            return res.status(500).json({ error: 'Failed to check payment' });
        }

        const exists = results[0].payment_count > 0;
        res.status(200).json({ exists });
    });
});

// API to process salary payments
app.post('/api/process-salary', (req, res) => {
    const { user_id, username, role_type, amount, payment_month, payment_year, payment_date } = req.body;

    // Validate required fields
    if (!user_id || !username || !role_type || !amount || !payment_month || !payment_year || !payment_date) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const query = `
        INSERT INTO salary_payments 
            (user_id, username, role_type, amount, payment_month, payment_year, payment_date) 
        VALUES 
            (?, ?, ?, ?, ?, ?, ?);
    `;

    db.query(query, [user_id, username, role_type, amount, payment_month, payment_year, payment_date], (err, results) => {
        if (err) {
            console.error('Error processing salary payment:', err);
            return res.status(500).json({ error: 'Failed to process salary payment' });
        }

        res.status(200).json({ message: 'Salary payment processed successfully' });
    });
});

app.get('/api/salary-report', (req, res) => {
    const { year, month } = req.query;

    const query = `
        SELECT 
            user_id, 
            username, 
            role_type, 
            amount, 
            payment_date
        FROM salary_payments
        WHERE payment_year = ? AND payment_month = ?;
    `;

    db.query(query, [year, month], (err, results) => {
        if (err) {
            console.error('Error fetching salary report:', err);
            return res.status(500).json({ error: 'Failed to fetch salary report' });
        }

        res.status(200).json(results);
    });
});

// Fetch all products
app.get('/api/productsss', (req, res) => {
    db.query('SELECT * FROM stocks', (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch products' });
        }
        res.json(results);
    });
});

// Update product price
app.put('/api/productsss/:p_id', (req, res) => {
    const { p_id } = req.params;
    const { p_unitprice } = req.body;

    db.query(
        'UPDATE stocks SET p_unitprice = ? WHERE p_id = ?',
        [p_unitprice, p_id],
        (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to update product price' });
            }
            res.json({ success: true, message: 'Price updated successfully' });
        }
    );
});

// API endpoint to submit feedback
app.post('/api/feedback', (req, res) => {
    const { customer_id, feedback } = req.body;

    // Validate input
    if (!customer_id || !feedback) {
        return res.status(400).json({ success: false, message: 'Customer ID and feedback are required.' });
    }

    // Insert feedback into the database
    const query = 'INSERT INTO customer_feedback (customer_id, feedback) VALUES (?, ?)';
    db.query(query, [customer_id, feedback], (err, results) => {
        if (err) {
            console.error('Error inserting feedback:', err);
            return res.status(500).json({ success: false, message: 'Failed to submit feedback.' });
        }
        res.json({ success: true, message: 'Feedback submitted successfully!' });
    });
});

// Endpoint to fetch feedback
app.get('/api/feedback', (req, res) => {
    const query = `
        SELECT cf.feedback_id, cf.feedback, cf.created_at, c.name AS customer_name
        FROM customer_feedback cf
        JOIN customers c ON cf.customer_id = c.id
        ORDER BY cf.created_at DESC
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching feedback:', err);
            return res.status(500).json({ success: false, message: 'Failed to fetch feedback.' });
        }
        res.json({ success: true, feedback: results });
    });
});

// Endpoint to fetch customer data
app.get('/api/customers/:id', (req, res) => {
    const customerId = req.params.id;

    if (!customerId) {
        return res.status(400).json({ success: false, message: 'Customer ID is required.' });
    }

    const query = 'SELECT id, name, email, address FROM customers WHERE id = ?';
    db.query(query, [customerId], (err, results) => {
        if (err) {
            console.error('Error fetching customer data:', err);
            return res.status(500).json({ success: false, message: 'Failed to fetch customer data.' });
        }
        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'Customer not found.' });
        }
        res.json({ success: true, customer: results[0] }); // Return JSON response
    });
});

// Endpoint to update shipping address
app.put('/api/customers/address', (req, res) => {
    const { customer_id, address } = req.body;

    if (!customer_id) {
        return res.status(400).json({ success: false, message: 'Customer ID is required.' });
    }

    const query = 'UPDATE customers SET address = ? WHERE id = ?';
    db.query(query, [address, customer_id], (err, results) => {
        if (err) {
            console.error('Error updating address:', err);
            return res.status(500).json({ success: false, message: 'Failed to update address.' });
        }
        res.json({ success: true, message: 'Address updated successfully!' });
    });
});

app.get('/api/ccustomers/:id', (req, res) => {
    const customerId = req.params.id;

    if (!customerId) {
        return res.status(400).json({ success: false, message: 'Customer ID is required.' });
    }

    const query = 'SELECT id, name, email, address FROM customers WHERE id = ?';
    db.query(query, [customerId], (err, results) => {
        if (err) {
            console.error('Error fetching customer data:', err);
            return res.status(500).json({ success: false, message: 'Failed to fetch customer data.' });
        }
        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'Customer not found.' });
        }
        res.json({ success: true, customer: results[0] }); // Return JSON response with address
    });
});

app.get('/api/ccustomerss', (req, res) => {
    const query = 'SELECT id, name, address FROM customers'; // Fetch all customers
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching customer details:', err);
            return res.status(500).json({ success: false, message: 'Failed to fetch customer details.' });
        }
        res.json({ success: true, customers: results }); // Return JSON response
    });
});
// Start the server
const PORT = 5002;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});