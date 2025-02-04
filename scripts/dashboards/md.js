function showMDDashboard() {
    hideAllDashboards();
    document.getElementById('mdDashboard').style.display = 'block';
    document.getElementById('mdLastLogin').textContent = new Date().toLocaleString();
}

// Managing Director Functions
function checkSalesReports() {
    showModal("Sales Reports", `
        <h3>Sales Overview</h3>
        <div class="no-data-message">
            <p>No sales reports found. Database integration pending.</p>
        </div>
    `);
}

function approveLetters() {
    // Fetch pending letters from the database
    fetch('http://localhost:5002/api/hr/letters')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const letters = data.letters;
                let modalContent = `
                    <h3>Pending Letters for Approval</h3>
                    <div class="letters-container">`;
                
                if (letters.length === 0) {
                    modalContent += `
                        <div class="no-data-message">
                            <p>No pending letters found.</p>
                        </div>`;
                } else {
                    modalContent += `
                        <table class="letters-table">
                            <thead>
                                <tr>
                                    <th>Letter No.</th>
                                    <th>Type</th>
                                    <th>Content</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>`;
                    
                    letters.forEach(letter => {
                        modalContent += `
                            <tr>
                                <td>${letter.hrl_no}</td>
                                <td>${letter.letter_type}</td>
                                <td class="letter-content">${letter.letter_content}</td>
                                <td>${letter.approval_status}</td>
                                <td>
                                    ${letter.approval_status === 'Pending' ? `
                                        <button onclick="updateLetterStatus(${letter.hrl_no}, 'Approved')" class="approve-btn">
                                            Approve
                                        </button>
                                        <button onclick="updateLetterStatus(${letter.hrl_no}, 'Rejected')" class="reject-btn">
                                            Reject
                                        </button>
                                    ` : '-'}
                                </td>
                            </tr>`;
                    });
                    
                    modalContent += `
                            </tbody>
                        </table>`;
                }
                
                modalContent += `</div>`;
                showModal("Letter Approvals", modalContent);
            }
        })
        .catch(error => {
            console.error('Error fetching letters:', error);
            showModal("Error", `
                <div class="error-message">
                    <p>Error loading letters. Please try again later.</p>
                </div>
            `);
        });
}

function updateLetterStatus(letterId, status) {
    fetch(`http://localhost:5002/api/hr/letter/${letterId}/status`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Refresh the letters list
            approveLetters();
        } else {
            console.error('Error updating letter status:', data.message);
        }
    })
    .catch(error => {
        console.error('Error updating letter status:', error);
    });
}

function issueTerminationLetters() {
    showModal("Termination Letters", `
        <h3>Issue Termination Letter</h3>
        <form id="terminationForm">
            <input type="text" placeholder="Employee ID" required>
            <input type="text" placeholder="Employee Name" required>
            <textarea placeholder="Reason for termination" required></textarea>
            <button type="submit">Issue Letter</button>
            <p class="note">Note: Letters will not be saved until database integration.</p>
        </form>
    `);
}

function manageJobApplications() {
    showModal("Job Applications", `
        <h3>Pending Applications</h3>
        <div class="no-data-message">
            <p>No job applications found. Database integration pending.</p>
        </div>
    `);
}