function showHRManagerDashboard() {
    hideAllDashboards();
    document.getElementById('hrManagerDashboard').style.display = 'block';
    document.getElementById('hrmLastLogin').textContent = new Date().toLocaleString();
}



// HR Manager Functions (continued)
function requestLetterApproval() {
    const modalContent = `
        <h3>Letter Approval Request</h3>
        <form id="letterApprovalForm">
            <select id="letterType" required class="form-control mb-3">
                <option value="">Select Letter Type</option>
                <option value="offer">Offer Letter</option>
                <option value="warning">Warning Letter</option>
                <option value="termination">Termination Letter</option>
            </select>
            <textarea id="letterContent" placeholder="Enter letter content" required class="form-control mb-3" rows="5"></textarea>
            <button type="submit" class="btn btn-primary">Request Approval</button>
        </form>
        <div id="submitStatus" class="mt-3"></div>
    `;
    
    showModal("Letter Approval", modalContent);
    
    document.getElementById('letterApprovalForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const letterType = document.getElementById('letterType').value;
        const letterContent = document.getElementById('letterContent').value;
        
        // Show loading state
        document.getElementById('submitStatus').innerHTML = `
            <div class="text-info">Submitting letter...</div>
        `;
        
        try {
            console.log('Submitting data:', { letterType, letterContent }); // Add this log
            
            const response = await fetch('http://localhost:5002/api/hr/letter', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    letterType,
                    letterContent
                })
            });
            
            console.log('Response status:', response.status); // Add this log
            
            const data = await response.json();
            console.log('Response data:', data); // Add this log
            
            if (data.success) {
                document.getElementById('submitStatus').innerHTML = `
                    <div class="text-success">
                        Letter submitted successfully for approval!
                    </div>
                `;
                
                document.getElementById('letterApprovalForm').reset();
                
                setTimeout(() => {
                    closeModal();
                }, 2000);
            } else {
                document.getElementById('submitStatus').innerHTML = `
                    <div class="text-danger">
                        Error: ${data.message || 'Unknown error occurred'}
                    </div>
                `;
            }
        } catch (error) {
            console.error('Detailed error:', error); // Add this log
            document.getElementById('submitStatus').innerHTML = `
                <div class="text-danger">
                    Error submitting letter: ${error.message}
                    <br>
                    Please check if the server is running at http://localhost:5002
                </div>
            `;
        }
    });
}

function leaveRequests() {
    // Fetch leave requests from the server
    fetch('http://localhost:5002/api/leaves')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                const leaveRequests = data.leaves;
                let modalContent = `
                    <h3>Pending Leave Requests</h3>
                    <div class="leaves-container">`;

                if (leaveRequests.length === 0) {
                    modalContent += `
                        <div class="no-data-message">
                            <p>No leave requests found.</p>
                        </div>`;
                } else {
                    modalContent += `
                        <table class="leaves-table">
                            <thead>
                                <tr>
                                    <th>Employee ID</th>
                                    <th>Leave Type</th>
                                    <th>Start Date</th>
                                    <th>End Date</th>
                                    <th>Comments</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>`;

                    leaveRequests.forEach(leave => {
                        modalContent += `
                            <tr>
                                <td>${leave.employee_id}</td>
                                <td>${leave.leave_type}</td>
                                <td>${new Date(leave.start_date).toLocaleDateString()}</td>
                                <td>${new Date(leave.end_date).toLocaleDateString()}</td>
                                <td>${leave.comments || 'N/A'}</td>
                                <td>${leave.status}</td>
                                <td>
                                    ${leave.status === 'PENDING' ? `
                                        <button onclick="approveLeave(${leave.leave_id})" class="btn btn-success btn-sm">Approve</button>
                                        <button onclick="rejectLeave(${leave.leave_id})" class="btn btn-danger btn-sm">Reject</button>
                                    ` : 'No actions available'}
                                </td>
                            </tr>`;
                    });

                    modalContent += `
                            </tbody>
                        </table>`;
                }

                modalContent += `</div>`;
                showModal("Manage Leaves", modalContent);
            } else {
                showModal("Error", `
                    <div class="error-message">
                        <p>Error: ${data.message}</p>
                    </div>
                `);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showModal("Error", `
                <div class="error-message">
                    <p>Failed to fetch leave requests. Please try again later.</p>
                </div>
            `);
        });
}



// Approve Leave Request
function approveLeave(leaveId) {
    updateLeaveStatus(leaveId, 'APPROVED');
}

// Reject Leave Request
function rejectLeave(leaveId) {
    updateLeaveStatus(leaveId, 'REJECTED');
}


// Update Leave Status
function updateLeaveStatus(leaveId, status) {
    fetch(`http://localhost:5002/api/leaves/${leaveId}/status`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            alert('Leave status updated successfully!');
            closeModal(); // Close the current modal
            leaveRequests(); // Refresh the leave requests list
        } else {
            alert('Error updating leave status: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to update leave status. Please try again.');
    });
}

