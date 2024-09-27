const ip_ad = sessionStorage.getItem('ip_ad');

var latitude, longitude, accuracy, timestamp, dist, time, Id;

function getLocation() {
    var options = {
        enableHighAccuracy: true,
        timeout: 2000,
        maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(onSuccess, onError, options);
}
function capturePhoto() {
          navigator.camera.getPicture(onSuccess2, onError2, {
            quality: 50,
            destinationType: Camera.DestinationType.DATA_URL
          });
        }
let imageData = '';
function onSuccess2(data) {
    // Store imageData globally for further processing
    imageData = data;
    console.log("Captured Image Data:", imageData);
    document.getElementById('photo').style.display = 'block';
    document.getElementById('photo').src = "data:image/jpeg;base64," + imageData;
    sessionStorage.setItem('capturedPhoto', imageData);
          // After capturing the photo, get the current location

        }
function onError2(message) {
          alert('Failed because: ' + message);
        }

function onSuccess(position) {
    latitude = position.coords.latitude;
    longitude = position.coords.longitude;
    accuracy = position.coords.accuracy;
    timestamp = position.timestamp;
    time = timestamp;

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

            console.log(accuracy);
            let status = dist <= 250 ? 'True' : 'False';
            console.log(dist);
            if (accuracy > 0) {
                await handleRequestAndPhoto();
            } else {
                console.log("Not accurate enough");
                setTimeout(function() {
                    document.getElementById('requestManualLogin').click();
                }, 5000);
            }
        } catch (error) {
            console.error('Error occurred:', error);
            alert('An error occurred: photos do not match');
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

async function handleRequestAndPhoto() {
    try {
        const formData = new FormData();
        formData.append('Id', Id || '');
        formData.append('dist', dist || '');
        formData.append('time', time || '');
        formData.append('longitude', longitude || '');
        formData.append('latitude', latitude || '');
        formData.append('stat', 'Pending');

        // Check if imageData is properly captured
        //console.log("Image Data Before Conversion:", imageData);

        // Remove the prefix if it exists and convert to Blob
        const base64Image = imageData.includes(',') ? imageData.split(',')[1] : imageData;
        //console.log("Base64 Image after split:", base64Image);

        const mimeType = "image/jpeg";
        const photoBlob = base64ToBlob(base64Image, mimeType);

        // Verify if photoBlob is correctly created
        if (!photoBlob) {
            console.error("Failed to convert base64 image to Blob");
            return;
        }

        // Append the photo blob to formData as a JPEG file
        formData.append('photo', photoBlob, 'captured_photo.jpg');
        //console.log("Photo Blob:", photoBlob);

        const response = await fetch(`https://${ip_ad}/submit_request`, {
            method: 'POST',
            body: formData
        });

        if (response.status === 401) {
            alert('Unauthorized access');
            return;
        }

        const result = await response.json();
        console.log('Data successfully pushed:', result);
        alert("Request and photo sent successfully!");

    } catch (error) {
        console.error('An error occurred while sending the request:', error);
    }
}

function base64ToBlob(base64, mime) {
    try {
        console.log("Converting base64 to Blob:", base64);

        // Convert base64 string to byte array
        const byteString = atob(base64);
        const ab = new Uint8Array(byteString.length);
        for (let i = 0; i < byteString.length; i++) {
            ab[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], { type: mime });
    } catch (error) {
        console.error("Error in base64ToBlob: Invalid base64 string.", error);
        return null;
    }
}

