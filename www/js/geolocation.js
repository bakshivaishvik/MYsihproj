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
    const distance = getDistanceFromLatLonInKm(latitude, longitude, 17.384384, 78.353006)*1000;
    console.log("Distance:", distance, "m");

    var locationInfo = `
            <p>Latitude: ${latitude}</p>
            <p>Longitude: ${longitude}</p>
            <p>Accuracy: ${accuracy} meters</p>
            <p>Timestamp: ${new Date(timestamp)}</p>
            <p>distance: ${distance} meters</p>
        `;

    document.getElementById('location-info').innerHTML = locationInfo;
}

function onError(error) {
    var errorMessage = `Error (${error.code}): ${error.message}`;
    document.getElementById('location-info').innerHTML = errorMessage;
}

