//import { ip_ad } from "../js/commonvar.js";

//console.log(ip_ad);

async function checkValid() {
//const ip_ad="192.168.0.110";
const ip_ad="192.168.230.122";
console.log('checkValid function called');
                    const username = document.getElementById('loginId').value;
                    const password = document.getElementById('password').value;

                    if (!username || !password) {
                        alert('Please enter both ');
                        return;
                    }

                    try {
                        const response = await fetch(`https://${ip_ad}:5001/login`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ username,password })
                            //console.log(username)
                        });

                        if (response.status == 200) {
                            alert('login successfully');

                            window.location.href = 'js/adminlogin.html';


                        }else if(response.status == 202){
                            alert('login successful');
                            console.log(username)
                            const url = `https://${ip_ad}:5001/employees/username/${username}`;
                            console.log(url)
                            fetch(url)
                              .then(response => {
                                console.log('Response status:', response.status);
                                if (!response.ok) {
                                  throw new Error('Employee not found');
                                }
                                return response.json();
                              })
                              .then(data => {
                                // Handle the employee data here
                                console.log('Employee data:', data);
                                const Id = data;
                                window.location.href = `js/getlocation.html?userId=${Id}`;
                              })
                              .catch(error => {
                                // Handle errors here
                                console.error('Error:', error);
                              });


                        }

                         else {
                            alert('wrong username or password ,try again');

                        }

                    } catch (error) {
                        console.error('Error logging in', error);
                    }
                }