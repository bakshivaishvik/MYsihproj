//import {ip_ad} from "./commonvar.js";
const ip_ad="192.168.0.110";
console.log(ip_ad)
document.getElementById('locationForm').addEventListener('submit', async function(event) {
            event.preventDefault(); // Prevent the default form submission

            // Create an object with the form data
            const formData = {
                name: document.getElementById('name').value,
                latitude: parseFloat(document.getElementById('latitude').value),
                longitude: parseFloat(document.getElementById('longitude').value),
                description: document.getElementById('description').value
            };

            try {
                // Send the form data using fetch
                const response = await fetch(`https://${ip_ad}:5001/Location`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });

                // Parse the JSON response
                const result = await response.json();

                // Handle the response
                if (response.ok) {
                    alert(result.message);
                } else {
                    alert('Failed to add location');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred while adding the location');
            }
        }



        );

 async function deleteLocation() {
            // Get the location ID from the input field
            const locationId = document.getElementById('name1').value;

            // Check if the location ID is provided
            if (!locationId) {
                alert('Please enter a valid location ID.');
                return;
            }

            // Send a DELETE request to the Flask API
            try {
                const response = await fetch(`https://${ip_ad}:5001/Location/${locationId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                // Parse the JSON response
                const result = await response.json();

                // Handle the response
                if (response.ok) {
                    alert(result.message);
                } else {
                    alert(`Error: ${result.error}`);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred while trying to delete the location.');
            }
        }
        async function fetchLocations() {
                    try {
                        // Send a GET request to the Flask API to retrieve location data
                        const response = await fetch(`https://${ip_ad}:5001/Location`,{
                                  method: 'GET',
                                      headers: {
                                              'Content-Type': 'application/json'
                                        }
                                  });
                        const locations = await response.json();

                        // Get the location list element
                        const locationList = document.getElementById('locationList');

                        // Clear the list (in case it was populated before)
                        locationList.innerHTML = '';

                        // Loop through the locations and create list items
                        locations.forEach(location => {
                            const listItem = document.createElement('li');
                            listItem.textContent = `Name: ${location.name},  Description: ${location.description}`;
                            locationList.appendChild(listItem);
                        });
                    } catch (error) {
                        console.error('Error fetching locations:', error);
                        alert('An error occurred while retrieving locations.');
                    }
                }

                // Fetch locations when the page loads


        // Attach the deleteLocation function to the button click event
        document.getElementById('deleteButton').addEventListener('click', deleteLocation);
        //document.addEventListener('DOMContentLoaded', function() {
        document.getElementById('logout-btn').addEventListener('click', async function() {
                    try {
                        // Make a request to the logout route on the server



                            // Redirect to the login page after successful logout
                            window.location.href = 'logout.html';



                    } catch (error) {
                        console.error('Error:', error);
                        alert('An error occurred during logout. Please try again.');
                    }
                });
          //       });
        window.onload = fetchLocations;