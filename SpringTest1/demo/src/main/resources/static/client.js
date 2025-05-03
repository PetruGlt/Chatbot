
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


    // TODO:
    const toggleRegisterButton = document.getElementById("toggleRegister");
    const registerFormContainer = document.getElementById("registerFormContainer");

    if (toggleRegisterButton && registerFormContainer) {
        toggleRegisterButton.addEventListener("click", () => {
            const currentDisplay = window.getComputedStyle(registerFormContainer).display;
            if (currentDisplay === "none") {
                registerFormContainer.style.display = "block";
                toggleRegisterButton.textContent = "Hide Registration Form";
            } else {
                registerFormContainer.style.display = "none";
                toggleRegisterButton.textContent = "Register";
            }
        });
    }


    const submitRegisterButton = document.getElementById("submitRegister");

    // TODO: submitButton

});
