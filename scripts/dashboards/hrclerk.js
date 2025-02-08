function showHRClerkDashboard() {
    hideAllDashboards();
    document.getElementById('hrClerkDashboard').style.display = 'block';
    document.getElementById('hrcLastLogin').textContent = new Date().toLocaleString();
}

function leaveRequestFeedback() {
    fetch('http://localhost:5002/api/staffleaves')
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                alert('Error fetching leave requests: ' + data.message);
                return;
            }

            const leaveRequests = data.leaves.map(leave => {
                return `
                    <div class="leave-request">
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

            console.log(leaveRequests); // Debug: Check the generated HTML
            showModal("Leave Request Feedback", `
                <h2>Leave Requests</h2>
                ${leaveRequests}
            `);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error fetching leave requests. Please try again.');
        });
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
        const response = await fetch('http://localhost:5002/api/staffleaves', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.success) {
            alert('Leave request submitted successfully!');
            // Close the modal or refresh the page as needed
        } else {
            alert('Error submitting leave request: ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error submitting leave request. Please try again.');
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
                ${leaveRequests}
            `);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error fetching leave requests. Please try again.');
        });
}

function manageMeetings() {
    showModal("Meeting Management", `
        <h3>Schedule/Manage Meetings</h3>
        <form id="meetingForm">
            <input type="text" placeholder="Meeting Title" required>
            <input type="datetime-local" required>
            <input type="text" placeholder="Location/Meeting Room" required>
            <textarea placeholder="Meeting Agenda" required></textarea>
            <select multiple id="attendees" required>
                <option value="dept1">Department 1</option>
                <option value="dept2">Department 2</option>
                <option value="dept3">Department 3</option>
            </select>
            <button type="submit">Schedule Meeting</button>
            <p class="note">Note: Meeting schedules will not be saved until database integration.</p>
        </form>
    `);
}

function uploadHRReports() {
    showModal("HR Reports Upload", `
        <h3>Upload HR Reports</h3>
        <form id="hrReportUploadForm">
            <select id="reportType" required>
                <option value="">Select Report Type</option>
                <option value="attendance">Attendance Report</option>
                <option value="performance">Performance Report</option>
                <option value="leave">Leave Status Report</option>
                <option value="recruitment">Recruitment Report</option>
            </select>
            <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx" required>
            <textarea placeholder="Report Description" required></textarea>
            <button type="submit">Upload Report</button>
            <p class="note">Note: Reports will not be saved until database integration.</p>
        </form>
    `);
}

function manageLeaves() {
    showModal("Leave Management", `
        <h3>Leave Requests</h3>
        <div class="no-data-message">
            <p>No leave requests found. Database integration pending.</p>
        </div>
    `);
}

function reviewHRReports() {
    showModal("HR Reports", `
        <h3>HR Reports Overview</h3>
        <div class="no-data-message">
            <p>No HR reports found. Database integration pending.</p>
        </div>
    `);
}