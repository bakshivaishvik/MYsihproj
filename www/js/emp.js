//import {ip_ad} from "./commonvar.js";
const ip_ad="192.168.0.110";
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

async function fetchEmployees() {
            try {
                const response = await fetch(`https://${ip_ad}:5001/employees`);
                const employees = await response.json();
                const employeeList = document.getElementById('employeeList');
                employeeList.innerHTML = ''; // Clear the list

                employees.forEach(employee => {
                    const listItem = document.createElement('li');
                    listItem.textContent = `Name: ${employee.name}, Position: ${employee.position}, `;
                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'Delete';
                    deleteButton.onclick = () => deleteEmployee(employee.id);
                    listItem.appendChild(deleteButton);
                    employeeList.appendChild(listItem);
                });
            } catch (error) {
                console.error('Error fetching employees:', error);
            }
        }

        async function addEmployee() {
            const name = document.getElementById('name').value;
            const position = document.getElementById('position').value;
            const Id = document.getElementById('Id').value;
            const loc = document.getElementById('loc').value;
            const uId = document.getElementById('uid').value;
            const pass = document.getElementById('pass').value;
            if (!name || !position) {
                alert('Please enter both name and position');
                return;
            }

            try {
                const response = await fetch(`https://${ip_ad}:5001/employees`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ Id,name, position ,uId,pass,loc})
                });

                if (response.ok) {
                    alert('Employee added successfully');
                    fetchEmployees(); // Refresh the list
                } else {
                    alert('Error adding employee');
                }
            } catch (error) {
                console.error('Error adding employee:', error);
            }
        }

        async function deleteEmployee(employeeId) {
            try {
                const response = await fetch(`https://${ip_ad}:5001/employees/${employeeId}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    alert('Employee deleted successfully');
                    fetchEmployees(); // Refresh the list
                } else {
                    alert('Error deleting employee');
                }
            } catch (error) {
                console.error('Error deleting employee:', error);
            }
        }


         // Fetch employees when the page loads

        window.onload = fetchEmployees;




