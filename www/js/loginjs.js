async function checkValid() {
                    const username = document.getElementById('loginId').value;
                    const password = document.getElementById('password').value;

                    if (!username || !password) {
                        alert('Please enter both ');
                        return;
                    }

                    try {
                        const response = await fetch('https://192.168.0.110:5001/login', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ username,password })
                        });

                        if (response.status == 200) {
                            alert('login successfully');

                            window.location.href = 'js/login.html';


                        }else if(response.status == 202){
                            alert('login successful');
                            window.location.href = 'js/getlocation.html';
                        }

                         else {
                            alert('wrong username or password ,try again');

                        }

                    } catch (error) {
                        console.error('Error logging in', error);
                    }
                }