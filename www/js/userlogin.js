const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const Id = decodeURIComponent(urlParams.get('userId'));
const ip_ad = sessionStorage.getItem('ip_ad');
document.getElementById('geolocation_based_login').addEventListener('click', function() {
    console.log("geolog");
        window.location.href = `getlocation.html?userId=${encodeURIComponent(Id)}`;
    });

    document.getElementById('manual_login').addEventListener('click', function() {
    console.log("manlog");
        window.location.href = `user_manual_login.html?userId=${encodeURIComponent(Id)}`;
    });

    document.getElementById('check_logs').addEventListener('click', function(){
    console.log("checklog");
        window.location.href = `logs_user.html?userId=${encodeURIComponent(Id)}`;
    });

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
document.addEventListener('DOMContentLoaded', async function() {
        await displayEmployeeDetails();
      });




async function displayEmployeeDetails(){
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const Id = decodeURIComponent(urlParams.get('userId'));

    try {
            const response = await fetch(`https://${ip_ad}/employees/id/${Id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Error fetching employee: ${response.statusText}`);
            }

            const employee = await response.json();
        console.log('Displaying employee details...');
        document.getElementById('id').textContent = employee.id;
        document.getElementById('name').textContent = employee.name;
        document.getElementById('position').textContent = employee.position;
        document.getElementById('location').textContent = employee.location;
        document.getElementById('hrswork').textContent = employee.hrs_worked;

    } catch (error) {
            console.error('Error occurred:', error);
            alert(`An error occurred: ${error.message}`);
        }
}

