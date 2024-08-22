document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    console.log("Device is ready");
}

function getLocation() {
    var options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    };

    // Request the current position
    navigator.geolocation.getCurrentPosition(onSuccess, onError, options);
}

function onSuccess(position) {
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;
    var accuracy = position.coords.accuracy;
    var timestamp = position.timestamp;

    // Update the HTML to display the location information

    function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radius of the Earth in kilometers
        const dLat = deg2rad(lat2 - lat1);  // Convert degrees to radians
        const dLon = deg2rad(lon2 - lon1);  // Convert degrees to radians
        const a =
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2)
            ;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const d = R * c; // Distance in kilometers
        return d;
    }

    function deg2rad(deg) {
        return deg * (Math.PI/180);
    }


    // Example usage:
    const dist = getDistanceFromLatLonInKm(latitude, longitude, 17.384384, 78.353006)*1000;

    console.log("Distance:", dist, "m");
    async function pushdata(Id,dist,time){
    try {
                    const response = await fetch('https://192.168.0.110:5001/LogInOut', {
                        method: 'POST', // Use POST method to send data
                        headers: {
                            'Content-Type': 'application/json', // Set the content type to JSON
                        },
                        body: JSON.stringify({ Id,dist, time }), // Convert the data to a JSON string
                    });

                    if (!response.ok) {
                        throw new Error(`Server error: ${response.status}`);
                    }

                    const result = await response.json(); // Parse the JSON response
                    console.log('Data successfully pushed:', result);
                    return result;
                } catch (error) {
                    console.error('Error pushing data to server:', error);
                    throw error; // Re-throw the error after logging it
                }
        }
        function getQueryParam(param) {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get(param);
        }
        const Id = getQueryParam('userId');
        console.log(Id)

    pushdata(Id,dist,timestamp);


    var locationInfo = `
            <p>Latitude: ${latitude}</p>
            <p>Longitude: ${longitude}</p>
            <p>Accuracy: ${accuracy} meters</p>
            <p>Timestamp: ${new Date(timestamp)}</p>
            <p>distance: ${dist} meters</p>
        `;

    document.getElementById('location-info').innerHTML = locationInfo;
}

function onError(error) {
    var errorMessage = `Error (${error.code}): ${error.message}`;
    document.getElementById('location-info').innerHTML = errorMessage;
}
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
