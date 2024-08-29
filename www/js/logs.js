//const ip_ad="192.168.0.110"
const ip_ad="192.168.230.122";
document.getElementById('employeeForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent the form from submitting normally

    const employeeId = document.getElementById('employeeId').value;

    try {
        const response = await fetch(`https://${ip_ad}:5001/LogInOut/allemp/${employeeId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const logs = await response.json();
            displayLogs(logs);
        } else {
            console.error('Error fetching logs:', response.statusText);
            alert('Failed to fetch logs');
        }
    } catch (error) {
        console.error('Network error:', error);
        alert('Network error: ' + error.message);
    }
});

function displayLogs(logs) {
    const tableBody = document.querySelector('#logsTable tbody');
    tableBody.innerHTML = ''; // Clear existing content

    logs.forEach(log => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${log.sno}</td>
            <td>${log.id}</td>
            <td>${log.dist}</td>
            <td>${new Date(log.time).toLocaleString()}</td>
            <td>${log.status ? 'In' : 'Out'}</td>
        `;
        tableBody.appendChild(row);
    });
}