sessionStorage.setItem('ip_ad', '192.168.150.122:5000');
//cordova.plugins.backgroundMode.enable();

    async function checkValid() {
        const ip_ad = sessionStorage.getItem('ip_ad');

        //const ip_ad = "65.2.40.201";
        //const ip_ad="192.168.137.213";
        console.log('checkValid function called');
        const username = document.getElementById('loginId').value;
        const password = document.getElementById('password').value;

        if (!username || !password) {
            alert('Please enter both username and password.');
            return;
        }

        try {
            const response = await fetch(`https://${ip_ad}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            console.log('Login response status:', response.status);

            // Uncomment this if you want to use fingerprint authentication
            /*
            const isAuthenticated = await authenticateWithFingerprint();
            if (!isAuthenticated) {
                alert('Fingerprint authentication failed.');
                return;
            }
            */

            if (response.status === 200) {
                alert('Login successful');
                const userId = 1; // Change this to dynamically get the actual user ID if needed
                //window.location.href = `js/finger.html?userId=${encodeURIComponent(userId)}&status=${encodeURIComponent(response.status)}`;
                window.location.href = 'js/adminlogin.html';
            } else if (response.status === 202) {
                alert('Login successful');
                console.log(username);
                const url = `https://${ip_ad}/employees/username/${username}`;
                console.log('Fetching employee data from:', url);

                fetch(url)
                    .then(response => {
                        console.log('Response status:', response.status);
                        if (!response.ok) {
                            throw new Error('Employee not found');
                        }
                        return response.json();
                    })
                    .then(data => {
                        console.log('Employee data:', data);
                        const Id = data; // Ensure 'data' contains 'id'
                        //window.location.href = `js/finger.html?userId=${encodeURIComponent(Id)}&status=${encodeURIComponent(response.status)}`;
                        window.location.href = `js/userlogin.html?userId=${encodeURIComponent(Id)}`;
                    })
                    .catch(error => {
                        console.error('Error fetching employee data:', error);
                    });

            } else {
                alert('Wrong username or password.');
            }

        } catch (error) {
            console.error('Error logging in:', error);
            alert('An error occurred during login. Please try again.');
        }
    }

    // Uncomment this if you want to use fingerprint authentication
    /*
    async function authenticateWithFingerprint() {
        return new Promise((resolve, reject) => {
            Fingerprint.isAvailable(function(result) {
                console.log("Fingerprint available: " + result);

                Fingerprint.show({
                    description: "Please authenticate"
                }, function() {
                    console.log("Fingerprint authentication successful");
                    resolve(true);
                }, function(error) {
                    console.error("Fingerprint authentication failed:", error.message);
                    resolve(false);
                });
            }, function(error) {
                console.error("Fingerprint not available:", error.message);
                resolve(false);
            });
        });
    }
    */



