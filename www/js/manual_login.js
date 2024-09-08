const ip_ad = sessionStorage.getItem('ip_ad');
    //const apiBaseUrl = `https://${ip_ad}`; // Replace with your API base URL

    async function fetchRequests() {
        try {
            const response = await fetch(`https://${ip_ad}/requests`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Error fetching requests: ${response.statusText}`);
        }


            const requests = await response.json();
            console.log("successfully fetched");
            populateTable(requests);

        } catch (error) {
            console.error('Error:', error);
            alert(`An error occurred: ${error.message}`);
        }
    }

    function populateTable(requests) {
        const tableBody = document.getElementById('requestsTableBody');
        tableBody.innerHTML = '';

        requests.forEach(request => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${request.id}</td>
                <td>${request.name}</td>
                <td>${new Date(request.requestTime).toLocaleString()}</td>
                <td>${request.status}</td>
                <td>
                    <div class="button-container">
                        <button class="approve-button" onclick="approveRequest(${request.id})">Approve</button>
                        <button class="disapprove-button" onclick="disapproveRequest(${request.id})">Disapprove</button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    async function updateRequestStatus(id, status) {
        try {
            const response = await fetch(`https://${ip_ad}/requests/${id}/${status}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id })
            });

            if (!response.ok) {
                throw new Error(`Error updating request: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('Request updated:', result);
            fetchRequests(); // Refresh the table
        } catch (error) {
            console.error('Error:', error);
            alert(`An error occurred: ${error.message}`);
        }
    }

    function approveRequest(id) {
        updateRequestStatus(id, 'approve');
    }

    function disapproveRequest(id) {
        updateRequestStatus(id, 'disapprove');
    }

    document.addEventListener('DOMContentLoaded', fetchRequests);