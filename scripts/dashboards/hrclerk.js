function showHRClerkDashboard() {
    hideAllDashboards();
    document.getElementById('hrClerkDashboard').style.display = 'block';
    document.getElementById('hrcLastLogin').textContent = new Date().toLocaleString();
}

function handleLeaveRequest() {
    showModal("Leave Request Handler", `
        <form id="leaveRequestForm" onsubmit="submitLeaveRequest(event)">
            <div class="form-group">
                <select id="employeeSelect" name="employee_id" required>
                    <option value="">Select Employee</option>
                    <option value="emp1">Employee 1</option>
                    <option value="emp2">Employee 2</option>
                </select>
            </div>
            <div class="form-group">
                <select id="leaveType" name="leave_type" required>
                    <option value="">Select Leave Type</option>
                    <option value="annual">Annual Leave</option>
                    <option value="sick">Sick Leave</option>
                    <option value="personal">Personal Leave</option>
                </select>
            </div>
            <div class="form-group">
                <input type="date" name="start_date" required>
            </div>
            <div class="form-group">
                <input type="date" name="end_date" required>
            </div>
            <div class="form-group">
                <textarea name="comments" placeholder="Comments" required></textarea>
            </div>
            <div class="form-group">
                <button type="submit" class="submit-btn">Submit Leave Request</button>
            </div>
        </form>
    `);
}


async function submitLeaveRequest(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = {
        employee_id: form.employee_id.value,
        leave_type: form.leave_type.value,
        start_date: form.start_date.value,
        end_date: form.end_date.value,
        comments: form.comments.value
    };

    try {
        const response = await fetch('http://localhost:5002/api/leaves', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.success) {
            alert('Leave request submitted successfully!');
            // Clear the form fields after successful submission
            form.reset();
            // Optionally, close the modal after submission
            closeModal();  // Close modal after submission
        } else {
            alert('Error submitting leave request: ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error submitting leave request. Please try again.');
    }
}

function closeModal() {
    const modal = document.querySelector('.modal-container'); // Ensure it's the correct modal class
    if (modal) {
        modal.remove();  // Remove the modal element from the DOM
    }
}




function leaveRequestFeedback() {
    // Fetch leave requests from the backend
    fetch('http://localhost:5002/api/staffleaves')
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                alert('Error fetching leave requests: ' + data.message);
                return;
            }

            // Generate HTML to display the leave requests
            const leaveRequests = data.leaves.map(leave => {
                // Determine the class for the container based on the status
                let containerClass = '';
                if (leave.status === 'Rejected') {
                    containerClass = 'leave-rejected';
                } else if (leave.status === 'Approved') {
                    containerClass = 'leave-approved';
                }

                return `
                    <div class="leave-request ${containerClass}">
                        <p><strong>Leave ID:</strong> ${leave.leave_id}</p>
                        <p><strong>Employee ID:</strong> ${leave.employee_id}</p>
                        <p><strong>Leave Type:</strong> ${leave.leave_type}</p>
                        <p><strong>Start Date:</strong> ${leave.start_date}</p>
                        <p><strong>End Date:</strong> ${leave.end_date}</p>
                        <p><strong>Comments:</strong> ${leave.comments || 'N/A'}</p>
                        <p><strong>Status:</strong> ${leave.status}</p>
                        <p><strong>Created At:</strong> ${leave.created_at}</p>
                        <p><strong>Updated At:</strong> ${leave.updated_at}</p>
                        <hr>
                    </div>
                `;
            }).join('');

            // Show the modal with the leave requests
            showModal("Leave Request Feedback", `
                <h2>Leave Requests</h2>
                <div class="scrollable-modal-content">
                    ${leaveRequests}
                </div>
            `);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error fetching leave requests. Please try again.');
        });
}




function manageLeaves() {
    showModal("Leave Management", `
        <h3>Leave Requests</h3>
        <div class="no-data-message">
            <p>No leave requests found. Database integration pending.</p>
        </div>
    `);
}

