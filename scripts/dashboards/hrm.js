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