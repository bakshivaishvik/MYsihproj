//import {ip_ad} from "./commonvar.js";
const ip_ad="192.168.0.110";
//const ip_ad="192.168.230.122";


async function updateAllEmployeesHours() {
    try {
        const response = await fetch(`https://${ip_ad}:5001/employee/working_hours`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Update successful:', data.message);
        } else {
            const error = await response.json();
            console.error('Update failed:', error);
        }
    } catch (error) {
        console.error('Network error:', error);
    }
}

async function fetchEmployees() {
    try {
        const response = await fetch(`https://${ip_ad}:5001/employees`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const employees = await response.json();
        await displayEmployees(employees); // Ensure display completes before moving on
    } catch (error) {
        console.error('Failed to fetch employees:', error);
    }
}

async function fetchEmployee(emp) {
    try {
        const response2 = await fetch(`https://${ip_ad}:5001/LogInOut/${emp.id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response2.ok) {
            throw new Error(`Error: ${response2.status}`);
        }

        return await response2.json();
    } catch (error) {
        console.error('Failed to fetch employee logs:', error);
    }
}

async function displayEmployees(employees) {
    const tableBody = document.getElementById('employee-table-body');
    tableBody.innerHTML = ''; // Clear existing table rows

    for (const employee of employees) {
        try {
            const emp_inout = await fetchEmployee(employee);
            console.log(employee);
            const row = document.createElement('tr');

            // Create and append ID cell
            const idCell = document.createElement('td');
            idCell.textContent = employee.id;
            row.appendChild(idCell);

            // Create and append Name cell
            const nameCell = document.createElement('td');
            nameCell.textContent = employee.name;
            row.appendChild(nameCell);

            // Create and append Position cell
            const positionCell = document.createElement('td');
            positionCell.textContent = employee.position;
            row.appendChild(positionCell);

            // Create and append Distance cell
            const distancell = document.createElement('td');
            distancell.textContent = emp_inout.dist;
            row.appendChild(distancell);

            // Create and append Time cell
            const timecell = document.createElement('td');
            timecell.textContent = emp_inout.time;
            row.appendChild(timecell);

            // Create and append Status cell
            const statuscell = document.createElement('td');
            statuscell.textContent = emp_inout.status;
            row.appendChild(statuscell);

            const hourcell = document.createElement('td');
            hourcell.textContent = employee.hrs_worked;
            row.appendChild(hourcell);

            // Append the row to the table body
            tableBody.appendChild(row);
        } catch (error) {
            console.error('Error fetching employee data:', error);
        }
    }
}

// Fetch and display employees when the page loads
(async () => {
    await updateAllEmployeesHours(); // Wait for the update to complete
    await fetchEmployees(); // Then fetch and display employees
})();
// Function to fetch total working hours from the server


// Example usage
//const employeeId = 1; // Replace with the actual employee ID you want to query



document.addEventListener('DOMContentLoaded', function() {
document.getElementById('logoutButton').addEventListener('click', async function() {
            try {
                // Make a request to the logout route on the server



                    // Redirect to the login page after successful logout
                    window.location.href = 'logout.html';



            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred during logout. Please try again.');
            }
        });
         });
