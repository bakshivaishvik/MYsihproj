const ip_ad = sessionStorage.getItem('ip_ad');

document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    console.log("Device is ready");

    // Enable background mode
    cordova.plugins.backgroundMode.enable();

    // Listen for background mode activation
    cordova.plugins.backgroundMode.onactivate = function() {
        console.log("Background mode activated");
        // Execute your entire code here to ensure it runs in the background
        runAppInBackground();
    };

    // Optional: Handle background mode deactivation if needed
    cordova.plugins.backgroundMode.ondeactivate = function() {
        console.log("Background mode deactivated");
        // Any code that should only run when the app is in the foreground can go here
    };

    // Run your app's code initially (in case the app is already in the foreground)
    runAppInBackground();
}

function runAppInBackground() {
    getLocation();
    // Any other functions or code you want to execute in the background
}

function getLocation() {
    var options = {
        enableHighAccuracy: true,
        timeout: 2000,
        maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(onSuccess, onError, options);
}

function onSuccess(position) {
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;
    var accuracy = position.coords.accuracy;
    var timestamp = position.timestamp;

    function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c;
        return d;
    }

    function deg2rad(deg) {
        return deg * (Math.PI / 180);
    }

    async function fetchLocations(id) {
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
            const dist = getDistanceFromLatLonInKm(latitude, longitude, latitu, longitu) * 1000;

            console.log(accuracy, timestamp);
            let status = dist <= 250 ? 'True' : 'False';
            console.log(dist);
            if(accuracy<30){
            pushdata(id, dist, timestamp, status, latitude, longitude);
            return dist;
            }
            else{
            console.log("not accurate enough");
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
    const Id = decodeURIComponent(urlParams.get('userId'));
    console.log(Id);
    fetchLocations(Id);
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
