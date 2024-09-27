//import {ip_ad} from "./commonvar.js";
//const ip_ad="192.168.0.110";
//const ip_ad="192.168.230.122";
//const ip_ad="192.168.137.213";
const ip_ad = sessionStorage.getItem('ip_ad');
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
                const response = await fetch(`https://${ip_ad}/employees`);
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


           if (!name || !position || !Id || !loc || !uId || !pass) {
               alert('Please enter all required employee details');
               return;
           }

           // Create a FormData object to hold the data and file
           const formData = new FormData();
           formData.append('Id', Id);
           formData.append('name', name);
           formData.append('position', position);
           formData.append('loc', loc);
           formData.append('uId', uId);
           formData.append('pass', pass);
           const base64Image = imageData.includes(',') ? imageData.split(',')[1] : imageData;
           const mimeType = "image/jpeg";
           const photoBlob = base64ToBlob(base64Image, mimeType);
           formData.append('photo', photoBlob, 'captured_photo.jpg');
           try {
               // Send the form data in a single POST request
               const response = await fetch(`https://${ip_ad}/employees`, {
                   method: 'POST',
                   body: formData
               });

               const data = await response.json();

               if (response.ok) {
                   alert('Employee added and photo uploaded successfully!');
                   fetchEmployees(); // Refresh the list
               } else {
                   alert('Error: ' + (data.error || 'Failed to add employee and upload photo.'));
               }

           } catch (error) {
               console.error('Error:', error);
               alert('Error adding employee or uploading photo.');
           }
       }

       // Attach the function to a button click
       document.getElementById('uploadPhotoButton').addEventListener('click', addEmployeeAndUploadPhoto);


        async function deleteEmployee(employeeId) {
            try {
                const response = await fetch(`https://${ip_ad}/employees/${employeeId}`, {
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
        document.getElementById('update').addEventListener('click', updateEmployeeLocation);
        async function updateEmployeeLocation() {
                    try {
                        //updateEmployeeLocation(employeeId, newLocName);
                        const employeeId=document.getElementById('id_user').value;
                        const newLocName=document.getElementById('loca_user').value;
                        const response = await fetch(`https://${ip_ad}/employees/${employeeId}/update_pass`, {
                            method: 'PATCH',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ loc_name: newLocName })
                        });

                        if (!response.ok) {
                            throw new Error(`Failed to update pass: ${response.statusText}`);
                        }

                        const result = await response.json();
                        console.log(result.message);
                        alert(result.message);

                    } catch (error) {
                        console.error('Error updating employee location:', error);
                        alert(`Error: ${error.message}`);
                    }
                }
/*
                document.getElementById('uploadPhotoButton').addEventListener('click', function() {
                    var fileInput = document.getElementById('photoInput');
                    var file = fileInput.files[0];
                    const employeeId=document.getElementById('id_user').value;

                    if (file && employeeId) {
                        var formData = new FormData();
                        formData.append('photo', file);

                        fetch(`https://${ip_ad}/upload_photo/${employeeId}`, {
                            method: 'POST',
                            body: formData,
                        })
                        .then(response => response.json())
                        .then(data => {
                            if (data.message) {
                                alert('Photo uploaded successfully!');
                            } else if (data.error) {
                                alert('Failed to upload photo: ' + data.error);
                            }
                        })
                        .catch(error => {
                            console.error('Error:', error);
                            alert('Error uploading photo.');
                        });
                    } else {
                        alert('Please select a photo to upload and ensure employee ID is present.');
                    }
                });


         // Fetch employees when the page loads
*/
        window.onload = fetchEmployees;
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




