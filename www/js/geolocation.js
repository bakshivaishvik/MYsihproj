const ip_ad = sessionStorage.getItem('ip_ad');

document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    console.log("Device is ready");

    // Enable background mode
    cordova.plugins.backgroundMode.enable();

    // Listen for background mode activation
    cordova.plugins.backgroundMode.onactivate = function() {
        console.log("Background mode activated");
        runAppInBackground();
    };

    // Handle background mode deactivation
    cordova.plugins.backgroundMode.ondeactivate = function() {
        console.log("Background mode deactivated");
    };

    // Run the app's code initially
    runAppInBackground();

    // Run the app code every 2 minutes (120,000 ms)
    setInterval(runAppInBackground, 120000);
}

function runAppInBackground() {
    getLocation();
}

var latitude, longitude, accuracy, timestamp, dist, time, Id;

function getLocation() {
    var options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(onSuccess, onError, options);
}

function onSuccess(position) {
    latitude = position.coords.latitude;
    longitude = position.coords.longitude;
    accuracy = position.coords.accuracy;
    timestamp = position.timestamp;
    time = timestamp;

    function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radius of Earth in kilometers
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        return d;
    }

    function deg2rad(deg) {
        return deg * (Math.PI / 180);
    }

    async function fetchLocations() {
        const id = decodeURIComponent(urlParams.get('userId'));
        Id = id;

        try {
            const response = await fetch(`https://${ip_ad}/employees/id/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Error fetching employee: ${response.statusText}`);
            }

            const employee = await response.json();
            console.log('Employee data:', accuracy);

            const loc_name = employee.location;
            displayEmployeeDetails(employee);

            const locationResponse = await fetch(`https://${ip_ad}/Location/${loc_name}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!locationResponse.ok) {
                throw new Error(`Error fetching location: ${locationResponse.statusText}`);
            }

            const latlon = await locationResponse.json();
            const latitu = latlon.latitude;
            const longitu = latlon.longitude;
            dist = getDistanceFromLatLonInKm(latitude, longitude, latitu, longitu) * 1000;

            console.log(accuracy, timestamp);
            let status = dist <= 250 ? 'True' : 'False';
            console.log(dist);

            if (accuracy < 30) {
                pushdata(id, dist, timestamp, status, latitude, longitude);
                return dist;
            } else {
                console.log("Not accurate enough");
                // If accuracy is greater than 30, reload the page after 10 seconds
                setTimeout(function() {
                                    document.getElementById('getloc').click();
                                }, 3000); // 10,000 ms = 10 seconds
                return 0;
            }

        } catch (error) {
            console.error('Error occurred:', error);
            alert(`An error occurred: ${error.message}`);
        }
    }

    function displayEmployeeDetails(employee) {
        console.log('Displaying employee details...');
        document.getElementById('id').textContent = employee.id;
        document.getElementById('name').textContent = employee.name;
        document.getElementById('position').textContent = employee.position;
        document.getElementById('location').textContent = employee.location;
        document.getElementById('hrswork').textContent = employee.hrs_worked;
    }

    async function pushdata(Id, dist, time, status, latitude, longitude) {
        try {
            const response = await fetch(`https://${ip_ad}/LogInOut`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ Id, dist, time, status, latitude, longitude }),
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const result = await response.json();
            console.log('Data successfully pushed:', result);

        } catch (error) {
            console.error('Error pushing data to server:', error);
            throw error;
        }
    }

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    fetchLocations();
}

function onError(error) {
    var errorMessage = `Error (${error.code}): ${error.message}`;
    document.getElementById('location').innerHTML = errorMessage;
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('logoutButton').addEventListener('click', async function() {
        try {
            window.location.href = 'logout.html';
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred during logout. Please try again.');
        }
    });
});
