async function checkValid() {
                    const username = document.getElementById('loginId').value;
                    const password = document.getElementById('password').value;

                    if (!username || !password) {
                        alert('Please enter both ');
                        return;
                    }

                    try {
                        const response = await fetch('https://192.168.0.209:5000/login', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ username,password })
                        });

                        if (response.ok) {
                            alert('login successfully');
                            loadTemplate('')
                            function loadTemplate(templateUrl) {
                                    fetch(templateUrl)
                                        .then(response => response.text())
                                        .then(html => {
                                            document.getElementById('content').innerHTML = html;
                                        })
                                        .catch(error => {
                                            console.error('Error loading template:', error);
                                        });
                                }

                        } else {
                            alert('Error loggingin');
                        }

                    } catch (error) {
                        console.error('Error logging in', error);
                    }
                }