function showHRClerkDashboard() {
    hideAllDashboards();
    document.getElementById('hrClerkDashboard').style.display = 'block';
    document.getElementById('hrcLastLogin').textContent = new Date().toLocaleString();
}

function handleLeaveRequest() {
    showModal("Leave Request Handler", `
        <h3>Process Leave Requests</h3>
        <div class="modal-content">
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
        </div>
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
            // Close the modal or refresh the page as needed
        } else {
            alert('Error submitting leave request: ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error submitting leave request. Please try again.');
    }
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