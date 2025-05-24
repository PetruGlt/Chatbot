
class ClientLogin {
    constructor(username, password) {
        this.username = username;
        this.password = password;
    }

    validateCredentials() {
        var errnr = 0;
        if (this.username !== "" && this.password == "") errnr = 1;
        if (this.username == "" && this.password !== "") errnr = 2;
        if (this.username == "" && this.password == "") errnr = 3;
        return errnr;
    }

    login() {
        if (this.validateCredentials() == 0){
            //Trimiterea credentialelor catre server
            const encodedCredentials = btoa(this.username + ':' + this.password);

            fetch('login', {
                method: 'POST',
                headers: {
                    'Authorization': 'Basic ' + encodedCredentials,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
            }).then(response => {
                if (response.redirected) {
                    sessionStorage.setItem("username", this.username);
                    await this.initializeConversationId();
                    window.location.href = response.url;
                }
            })
                .catch(error => console.error('Error:', error));
        }
        else if (this.validateCredentials() == 1) alert("E nevoie sa introduceti o parola!");
        else if (this.validateCredentials() == 2) alert("E nevoie să introduceti un username!");
        else alert("E nevoie sa introduceti un username si o parola!");


    }
}


document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const expertRadio = document.getElementById("expert");

    if (loginForm) {
        loginForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const username = document.getElementById("username").value.trim();
            const password = document.getElementById("password").value.trim();

            const clientLogin = new ClientLogin(username, password);
            clientLogin.login();
        });
    }

    if (expertRadio) {
        expertRadio.addEventListener("change", () => {
            window.location.href = "/expert";
        });
    }
});


    document.addEventListener("DOMContentLoaded", () => {
        const loginForm = document.getElementById("loginForm");
        const expertRadio = document.getElementById("expert");
        const toggleRegisterButton = document.getElementById("toggleRegister");
        const registerFormContainer = document.getElementById("registerFormContainer");
        const registerForm = document.getElementById("registerForm");

        // Login form handling
        if (loginForm) {
            loginForm.addEventListener("submit", (event) => {
                event.preventDefault();
                const username = document.getElementById("username").value.trim();
                const password = document.getElementById("password").value.trim();
                new ClientLogin(username, password).login();
            });
        }

        // Expert radio button handling
        if (expertRadio) {
            expertRadio.addEventListener("change", () => {
                window.location.href = "/expert";
            });
        }

        // Registration form toggle
        if (toggleRegisterButton && registerFormContainer) {
            toggleRegisterButton.addEventListener("click", () => {
                const isVisible = registerFormContainer.style.display === "block";
                registerFormContainer.style.display = isVisible ? "none" : "block";
                toggleRegisterButton.textContent = isVisible ? "Register" : "Hide Registration";
            });
        }


        class ClientRegister {
            constructor(username, password) {
                this.username = username;
                this.password = password;
            }

            validateCredentials() {
                var errnr = 0;
                if (this.username !== "" && this.password == "") errnr = 1;
                if (this.username == "" && this.password !== "") errnr = 2;
                if (this.username == "" && this.password == "") errnr = 3;
                return errnr;
            }

            register() {
                if (this.validateCredentials() == 0) {
                    fetch('/register', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            username: this.username,
                            password: this.password
                        }),
                    })
                        .then(response => response.json())
                        .then(data => {
                            if (data.success) {
                                alert("Registration successful! You can now login.");
                                document.getElementById("regUsername").value = "";
                                document.getElementById("regPassword").value = "";
                                window.location.href = "/client";
                            } else {
                                alert(data.message || "Registration failed. Please try again.");
                            }
                        })
                        .catch(error => {
                            console.error('Error:', error);
                            alert("An error occurred during registration.");
                        });
                } else if (this.validateCredentials() == 1) alert("E nevoie sa introduceti o parola!");
                else if (this.validateCredentials() == 2) alert("E nevoie să introduceti un username!");
                else alert("E nevoie sa introduceti un username si o parola!");
            }
        }

        document.getElementById("submitRegister").addEventListener("click", (event) => {
            event.preventDefault();
            const regUsername = document.getElementById("regUsername").value.trim();
            const regPassword = document.getElementById("regPassword").value.trim();

            const clientRegister = new ClientRegister(regUsername, regPassword);
            clientRegister.register();
        });
    });