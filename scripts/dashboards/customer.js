document.addEventListener("DOMContentLoaded", function() {
    // Initial stock data fetch
    fetchStockData();
    
    // Set up event listeners for the buy modal
    setupBuyModalListeners();
});

function fetchStockData() {
    fetch("http://localhost:5002/api/stocks")
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            console.log("Stock data received:", data);
            displayStockData(data);
        })
        .catch((error) => {
            console.error("Error fetching stock data:", error);
            const stockTableBody = document.getElementById("stockTableBody");
            if (stockTableBody) {
                stockTableBody.innerHTML = `
                    <tr>
                        <td colspan="5">
                            Error loading stock data. Please try again later.
                            <button onclick="fetchStockData()">Retry</button>
                        </td>
                    </tr>`;
            }
        });
}

function setupBuyModalListeners() {
    // Add event delegation for buy buttons
    document.getElementById('stockTableBody').addEventListener('click', function(e) {
        if (e.target.classList.contains('buy-btn')) {
            const productId = e.target.getAttribute('data-id');
            const productName = e.target.getAttribute('data-name');
            const maxQuantity = e.target.getAttribute('data-quantity');
            openBuyModal(productId, productName, maxQuantity);
        }
    });

    // Set up buy now button in modal
    document.getElementById('buyNowBtn').addEventListener('click', handleBuyNow);

    // Set up modal close button
    document.querySelector('.close').addEventListener('click', closeBuyModal);
}

function displayStockData(stockData) {
    const stockTableBody = document.getElementById("stockTableBody");
    
    if (!stockTableBody) {
        console.error("stockTableBody element not found!");
        return;
    }
    
    stockTableBody.innerHTML = "";
    
    if (!Array.isArray(stockData) || stockData.length === 0) {
        stockTableBody.innerHTML = "<tr><td colspan='4'>No products available</td></tr>"; // Remove Action column
        return;
    }
    
    stockData.forEach((product) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${product.p_id}</td>
            <td>${product.p_name}</td>
            <td>${product.p_quantity}</td>
            <td>Rs.${product.p_unitprice.toFixed(2)}</td>
        `;
        stockTableBody.appendChild(row);
    });
}

function openBuyModal(productId, productName, maxQuantity) {
    const modal = document.getElementById("buyModal");
    const productIdInput = document.getElementById("productId");
    const productNameInput = document.getElementById("productName");
    const quantityInput = document.getElementById("quantity");
    const maxQuantitySpan = document.getElementById("maxQuantity");

    productIdInput.value = productId;
    productNameInput.value = productName;
    maxQuantitySpan.textContent = maxQuantity;
    quantityInput.value = "1"; // Reset quantity
    quantityInput.max = maxQuantity;

    modal.style.display = "block";

    // Close modal when clicking outside of it
    window.onclick = function(event) {
        if (event.target === modal) {
            closeBuyModal();
        }
    };
}

function closeBuyModal() {
    const modal = document.getElementById("buyModal");
    modal.style.display = "none";
}

function handleBuyNow() {
    const productId = document.getElementById("productId").value;
    const quantity = parseInt(document.getElementById("quantity").value);
    const maxQuantity = parseInt(document.getElementById("maxQuantity").textContent);

    if (isNaN(quantity) || quantity < 1) {
        alert("Please enter a valid quantity (minimum 1).");
        return;
    }

    if (quantity > maxQuantity) {
        alert(`Only ${maxQuantity} items are available. Please select a lower quantity.`);
        return;
    }

    // Add loading state to button
    const buyButton = document.getElementById("buyNowBtn");
    buyButton.disabled = true;
    buyButton.textContent = "Processing...";

    fetch("http://localhost:5002/api/purchase", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem('token')}` // Add token if required
        },
        body: JSON.stringify({
            productId: productId,
            quantity: quantity
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            alert("Purchase successful!");
            fetchStockData(); // Refresh stock data
            closeBuyModal();
        } else {
            alert("Purchase failed: " + data.message);
        }
    })
    .catch(error => {
        console.error("Error during purchase:", error);
        alert("Error processing purchase. Please try again.");
    })
    .finally(() => {
        // Reset button state
        buyButton.disabled = false;
        buyButton.textContent = "Confirm Purchase";
    });
}



function viewProducts() {
    console.log("View Products button clicked"); // Debugging
    fetchStockData();
}


document.addEventListener("DOMContentLoaded", function () {
    fetchStockData();
    populateProductDropdown();
    setupOrderForm();
});

function placeOrder() {
    console.log("Place Order button clicked");

    const token = localStorage.getItem('token');
    const customer = JSON.parse(localStorage.getItem('customer'));

    if (!token || !customer) {
        alert("You must be logged in to place an order.");
        window.location.href = "/index.html";
        return;
    }

    // Fetch available products
    fetch("http://localhost:5002/api/stocks")
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            return response.json();
        })
        .then(stockData => {
            if (!Array.isArray(stockData) || stockData.length === 0) {
                alert("No available products.");
                return;
            }

            // Create order form dynamically
            let formHtml = `
                <div id="orderModal" class="modal">
                    <div class="modal-content">
                        <span class="close" onclick="closeOrderModal()">&times;</span>
                        <h2>Place Order</h2>
                        <label for="productSelect">Select Product:</label>
                        <select id="productSelect">
                            ${stockData.map(product => 
                                `<option value="${product.p_id}" data-price="${product.p_unitprice}" data-quantity="${product.p_quantity}">
                                    ${product.p_name} (Available: ${product.p_quantity})
                                </option>`).join('')}
                        </select>
                        <br><br>
                        <label for="orderQuantity">Quantity:</label>
                        <input type="number" id="orderQuantity" min="1" value="1">
                        <br><br>
                        <p><strong>Price per unit:</strong> Rs.<span id="unitPrice">0.00</span></p>
                        <p><strong>Total:</strong> Rs.<span id="orderTotal">0.00</span></p>
                        <br>
                        <button onclick="submitOrder()">Submit Order</button>
                    </div>
                </div>
            `;

            document.body.insertAdjacentHTML("beforeend", formHtml);
            document.getElementById("orderModal").style.display = "block";

            // Update price & total when selecting a product
            const productSelect = document.getElementById("productSelect");
            const unitPriceSpan = document.getElementById("unitPrice");
            const orderTotalSpan = document.getElementById("orderTotal");
            const orderQuantity = document.getElementById("orderQuantity");

            function updatePriceAndTotal() {
                const selectedProduct = productSelect.options[productSelect.selectedIndex];
                const unitPrice = parseFloat(selectedProduct.getAttribute("data-price"));
                const maxQuantity = parseInt(selectedProduct.getAttribute("data-quantity"));

                unitPriceSpan.textContent = unitPrice.toFixed(2);
                orderTotalSpan.textContent = (unitPrice * orderQuantity.value).toFixed(2);

                orderQuantity.max = maxQuantity; // Prevents exceeding available stock
            }

            productSelect.addEventListener("change", updatePriceAndTotal);
            orderQuantity.addEventListener("input", updatePriceAndTotal);
            updatePriceAndTotal(); // Initial call
        })
        .catch(error => {
            console.error("Error fetching stock data:", error);
            alert("Error loading stock data.");
        });
}

// Close modal
function closeOrderModal() {
    document.getElementById("orderModal").remove();
}

// Submit order
function submitOrder() {
    const customer = JSON.parse(localStorage.getItem('customer'));
    const productSelect = document.getElementById("productSelect");
    const orderQuantity = document.getElementById("orderQuantity");

    const user_id = customer.id;
    const p_id = productSelect.value;
    const co_quantity = parseInt(orderQuantity.value);
    const co_price = parseFloat(productSelect.options[productSelect.selectedIndex].getAttribute("data-price"));
    const total = co_quantity * co_price;

    if (co_quantity < 1) {
        alert("Please enter a valid quantity.");
        return;
    }

    // Send order request
    fetch("http://localhost:5002/api/orders", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ user_id, p_id, co_quantity })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === "Order placed successfully") {
            alert("Order placed successfully!");
            closeOrderModal();
            fetchStockData(); // Refresh stock table
        } else {
            alert("Error placing order: " + data.message);
        }
    })
    .catch(error => {
        console.error("Error placing order:", error);
        alert("Error processing order.");
    });
}


// Ensure the fetchStockData function is called when the page loads
document.addEventListener("DOMContentLoaded", function() {
    fetchStockData(); // Initial stock data fetch
    setupBuyModalListeners(); // Set up event listeners for the buy modal
});