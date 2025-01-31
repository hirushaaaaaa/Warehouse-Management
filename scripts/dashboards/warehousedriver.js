function showWarehouseDriverDashboard() {
    hideAllDashboards();
    document.getElementById('warehouseDriverDashboard').style.display = 'block';
    document.getElementById('wdLastLogin').textContent = new Date().toLocaleString();
}

// Warehouse Driver Functions
function checkForUpcomingDeliveries() {
    showModal("Upcoming Deliveries", `
        <h3>Delivery Schedule</h3>
        <div class="no-data-message">
            <p>No upcoming deliveries found. Database integration pending.</p>
        </div>
    `);
}

function checkForNewArrivals() {
    showModal("New Arrivals", `
        <h3>Recent Arrivals</h3>
        <div class="no-data-message">
            <p>No new arrivals found. Database integration pending.</p>
        </div>
    `);
}