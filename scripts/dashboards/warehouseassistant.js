function showWarehouseAssistantDashboard() {
    hideAllDashboards();
    document.getElementById('warehouseAssistantDashboard').style.display = 'block';
    document.getElementById('waLastLogin').textContent = new Date().toLocaleString();
}

// Warehouse Assistant Functions
function confirmDelivery() {
    fetch('http://localhost:5002/api/warehouse/tobe-delivered-gmo-ids')
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                throw new Error(data.message);
            }

            if (data.gmoIds.length === 0) {
                showModal("Confirm Delivery", `
                    <h3>Confirm Delivery</h3>
                    <div class="no-data-message">
                        <p>No to-be-delivered stock found.</p>
                    </div>
                `);
                return;
            }

            // Create dropdown options for gmo_id values
            const dropdownOptions = data.gmoIds.map(gmo => `
                <option value="${gmo.gmo_id}">
                    ${gmo.gmo_id} - ${gmo.tbdp__name}
                </option>
            `).join('');

            // Show modal with dropdown and "Delivered" button
            showModal("Confirm Delivery", `
                <h3>Confirm Delivery</h3>
                <div class="delivery-form">
                    <label for="gmoIdDropdown">Select Order ID:</label>
                    <select id="gmoIdDropdown" onchange="fetchStockDetails()">
                        <option value="" disabled selected>Select an order</option>
                        ${dropdownOptions}
                    </select>
                    <div id="stockDetails" class="stock-details-container"></div>
                    <button onclick="markAsDelivered()" class="delivered-btn">
                        Mark as Delivered
                    </button>
                </div>
            `);
        })
        .catch(error => {
            console.error('Error:', error);
            showModal("Error", "Failed to fetch orders. Please try again later.");
        });
}

function fetchStockDetails() {
    const gmoIdDropdown = document.getElementById('gmoIdDropdown');
    const selectedGmoId = gmoIdDropdown.value;

    if (!selectedGmoId) {
        document.getElementById('stockDetails').innerHTML = '';
        return;
    }

    fetch(`http://localhost:5002/api/warehouse/stock-details/${selectedGmoId}`)
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                throw new Error(data.message);
            }

            const stockDetails = data.stockDetails;

            // Display details of the selected order
            const stockDetailsHtml = stockDetails.map(stock => `
                <div class="stock-details">
                    <p><strong>Order ID:</strong> ${stock.gmo_id}</p>
                    <p><strong>Product Name:</strong> ${stock.tbdp__name}</p>
                    <p><strong>Quantity:</strong> ${stock.tbdp_quantity}</p>
                    <p><strong>Status:</strong> ${stock.tbdp_status}</p>
                </div>
            `).join('');

            document.getElementById('stockDetails').innerHTML = stockDetailsHtml;
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('stockDetails').innerHTML = 
                '<p class="error-message">Failed to fetch stock details. Please try again later.</p>';
        });
}

function markAsDelivered() {
    const gmoIdDropdown = document.getElementById('gmoIdDropdown');
    const selectedGmoId = gmoIdDropdown.value;

    if (!selectedGmoId) {
        showError("Please select an order first.");
        return;
    }

    // Show confirmation dialog
    if (!confirm('Are you sure you want to mark this order as delivered? This will move the stock to raw stock inventory.')) {
        return;
    }

    fetch(`http://localhost:5002/api/warehouse/confirm-delivery/${selectedGmoId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (!data.success) {
            throw new Error(data.message);
        }
        showSuccess("Stock successfully moved to raw inventory!");
        confirmDelivery(); // Refresh the list
    })
    .catch(error => {
        console.error('Error:', error);
        showError("Failed to process delivery. Please try again.");
    });
}

// Helper functions for notifications
function showError(message) {
    alert(message); 
}

function showSuccess(message) {
    alert(message); 
}


function recordNewStock() {
    showModal("Record New Stock", `
        <h3>New Stock Entry</h3>
        <form id="newStockForm">
            <label for="gmoId">Select GMO ID:</label>
            <select id="gmoId" required>
                <option value="" disabled selected>Select GMO ID</option>
            </select>

            <label for="barcodeScanner">Select Barcode Scanner:</label>
            <select id="barcodeScanner" required>
                <option value="" disabled selected>Select Barcode Scanner</option>
            </select>

            <label for="quantity">Quantity (Auto-filled):</label>
            <input type="number" id="quantity" placeholder="Quantity" readonly required>

            <label for="stock">Stock (Good):</label>
            <input type="number" id="stock" placeholder="Stock" required>

            <label for="damaged">Damaged:</label>
            <input type="number" id="damaged" placeholder="Damaged" required>

            <button type="submit">Add Stock</button>
            <p class="note">Note: Stock records will not be saved until database integration.</p>
        </form>
    `);

    fetchAvailableGMOIds();
    fetchBarcodeScanners();

    document.getElementById('gmoId').addEventListener('change', fetchGmoDetails);
    document.getElementById('newStockForm').addEventListener('submit', processShipment);
}

function fetchAvailableGMOIds(excludeGmoId = null) {
    fetch('http://localhost:5002/api/stock/gmo-ids')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const gmoSelect = document.getElementById('gmoId');
                gmoSelect.innerHTML = '<option value="" disabled selected>Select GMO ID</option>';
                
                data.gmoIds.forEach(gmo => {
                    // Exclude the GMO ID that has been added to the stock
                    if (gmo.gmo_id !== excludeGmoId) {
                        const option = document.createElement('option');
                        option.value = gmo.gmo_id;
                        option.textContent = gmo.gmo_id;
                        gmoSelect.appendChild(option);
                    }
                });
            } else {
                alert("Error fetching GMO IDs.");
            }
        })
        .catch(error => console.error("Error fetching GMO IDs:", error));
}



function fetchBarcodeScanners() {
    fetch('http://localhost:5002/api/barcode-scanner/arrival')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const scannerSelect = document.getElementById('barcodeScanner');
                scannerSelect.innerHTML = '<option value="" disabled selected>Select Barcode Scanner</option>';
                data.barcodeScanners.forEach(scanner => {
                    const option = document.createElement('option');
                    option.value = scanner.bs_id;
                    option.textContent = scanner.bs_id;
                    scannerSelect.appendChild(option);
                });
            } else {
                alert("Error fetching Barcode Scanners.");
            }
        })
        .catch(error => console.error("Error fetching Barcode Scanners:", error));
}

function fetchGmoDetails(event) {
    const gmoId = event.target.value;
    fetch(`http://localhost:5002/api/stock/details/${gmoId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('quantity').value = data.rsp_quantity;
            } else {
                alert("Error fetching raw stock details.");
            }
        })
        .catch(error => console.error("Error fetching raw stock details:", error));
}

function processShipment(event) {
    event.preventDefault();

    // Get form data
    const stock = parseInt(document.getElementById('stock').value);
    const damaged = parseInt(document.getElementById('damaged').value);
    const gmoId = document.getElementById('gmoId').value;
    const bsId = document.getElementById('barcodeScanner').value;
    const spId = document.getElementById('gmoId').dataset.spId; // Retrieve sp_id from dataset
    const quantity = parseInt(document.getElementById('quantity').value); // Auto-filled quantity

    // Validate the sum of stock and damaged
    if (stock + damaged !== quantity) {
        alert("The sum of Stock and Damaged must exactly match the Quantity.");
        return;
    }

    // Proceed with updating stock and damaged records
    updateStockAndDamaged(gmoId, bsId, spId, stock, damaged);

    // Re-fetch available GMO IDs to ensure the added GMO is removed
    fetchAvailableGMOIds(gmoId);  // Pass the current GMO ID to exclude it
    // Reset the form
    resetForm();
}



function addStockArrival(req, res) {
    const { gmoId, bsId, goodQuantity, damagedQuantity } = req.body;

    // Step 1: Fetch sp_id from gm_order
    const querySpId = 'SELECT sp_id FROM gm_order WHERE gmo_id = ?';

    db.query(querySpId, [gmoId], function (err, result) {
        if (err) {
            console.error("Error fetching sp_id:", err);
            return res.status(500).json({ success: false, message: "Database error" });
        }

        if (result.length === 0 || !result[0].sp_id) {
            console.error("SP ID Not Found for GMO ID:", gmoId);
            return res.status(400).json({ success: false, message: "Invalid gmo_id or missing sp_id" });
        }

        const spId = result[0].sp_id;  // Extract sp_id from gm_order
        console.log("Retrieved sp_id:", spId);

        // Step 2: Insert into good_stock_arrival
        const insertGoodStockQuery = `
            INSERT INTO good_stock_arrival (bs_id, sp_id, gmo_id, gsa_quantity) 
            VALUES (?, ?, ?, ?)
        `;

        db.query(insertGoodStockQuery, [bsId, spId, gmoId, goodQuantity], function (err) {
            if (err) {
                console.error("Error inserting into good_stock_arrival:", err);
                return res.status(500).json({ success: false, message: "Error inserting good stock" });
            }

            // Step 3: Insert into damaged_stock_arrival
            const insertDamagedStockQuery = `
                INSERT INTO damaged_stock_arrival (bs_id, sp_id, gmo_id, dsa_quantity) 
                VALUES (?, ?, ?, ?)
            `;

            db.query(insertDamagedStockQuery, [bsId, spId, gmoId, damagedQuantity], function (err) {
                if (err) {
                    console.error("Error inserting into damaged_stock_arrival:", err);
                    return res.status(500).json({ success: false, message: "Error inserting damaged stock" });
                }

                res.json({ success: true, message: "Stock and Damaged records updated successfully" });
            });
        });
    });
}



function updateStockAndDamaged(gmoId, bsId, spId, stock, damaged) {
    fetch('http://localhost:5002/api/warehouse/add-stock-arrival', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            gmoId: gmoId,
            bsId: bsId,
            spId: spId,
            goodQuantity: stock,
            damagedQuantity: damaged
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Stock and Damaged records updated successfully.");
        } else {
            alert("Error updating stock records.");
        }
    })
    .catch(error => console.error("Error updating stock records:", error));
}

function resetForm() {
    // Reset all form fields
    document.getElementById('gmoId').value = '';  // Clear the GMO ID selection
    document.getElementById('barcodeScanner').value = '';  // Clear the scanner selection
    document.getElementById('stock').value = '';  // Clear stock input
    document.getElementById('damaged').value = '';  // Clear damaged input
    document.getElementById('quantity').value = '';  // Clear quantity input
}







function sendOffStock() {
    showModal("Send Off Stock", `
        <h3>Stock Dispatch</h3>
        <form id="dispatchForm">
            <input type="text" placeholder="Product ID" required>
            <input type="number" placeholder="Quantity" required>
            <input type="text" placeholder="Destination" required>
            <button type="submit">Dispatch Stock</button>
            <p class="note">Note: Dispatch records will not be saved until database integration.</p>
        </form>
    `);
}