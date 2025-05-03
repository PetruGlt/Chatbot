
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

    if (registerToggleButton) {
        registerToggleButton.addEventListener("click", () => {
            if (registerFormContainer) {
                registerFormContainer.style.display =
                    registerFormContainer.style.display === "none" || !registerFormContainer.style.display
                        ? "block"
                        : "none";
            }
        });
    }

    if (submitRegisterButton) {
        submitRegisterButton.addEventListener("click", () => {
            const username = document.getElementById("regUsername").value.trim();
            const password = document.getElementById("regPassword").value.trim();
            const accountType = document.querySelector('input[name="accountType"]:checked').value;

            if (!username || !password) {
                alert("Please fill in all fields.");
                return;
            }

            fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password, accountType })
            }).then(response => {
                if (response.ok) {
                    alert("Registration successful! You can now log in.");
                    registerFormContainer.style.display = "none";
                } else {
                    response.text().then(text => alert("Registration failed: " + text));
                }
            }).catch(error => console.error('Error:', error));
        });
    }

});

document.getElementById("registerUser").addEventListener("click", () => {
    const registerForm = document.getElementById("registerFormContainer");
    registerForm.style.display = registerForm.style.display === "none" ? "block" : "none";
});

document.getElementById("submitRegister").addEventListener("click", () => {
    const username = document.getElementById("regUsername").value.trim();
    const password = document.getElementById("regPassword").value.trim();
    const accountType = document.querySelector('input[name="accountType"]:checked').value;

    if (!username || !password) {
        alert("Please fill in all fields.");
        return;
    }

    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password, accountType })
    }).then(response => {
        if (response.ok) {
            alert("Registration successful! You can now log in.");
            document.getElementById("registerFormContainer").style.display = "none";
        } else {
            response.text().then(text => alert("Registration failed: " + text));
        }
    }).catch(error => console.error('Error:', error));
});

