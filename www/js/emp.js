async function fetchEmployees() {
            try {
                const response = await fetch('https://192.168.0.209:5000/employees');
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
            const uId = document.getElementById('uid').value;
            const pass = document.getElementById('pass').value;
            if (!name || !position) {
                alert('Please enter both name and position');
                return;
            }

            try {
                const response = await fetch('https://192.168.0.209:5000/employees', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ Id,name, position ,uId,pass})
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
                const response = await fetch(`https://192.168.0.209/employees/${employeeId}`, {
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

        window.onload = fetchEmployees; // Fetch employees when the page loads

