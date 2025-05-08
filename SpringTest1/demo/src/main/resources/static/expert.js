class ExpertLogin {
    constructor(id, password) {
        this.id = id;
        this.password = password;
    }

    validateCredentials() {
        var errnr = 0;
        if (this.id !== "" && this.password == "") errnr = 1;
        if (this.id == "" && this.password !== "") errnr = 2;
        if (this.id == "" && this.password == "") errnr = 3;
        return errnr;
    }

    login() {

        if (this.validateCredentials() == 0) {

            const encodedCredentials = btoa(this.id + ':' + this.password);

            fetch('login', {
                method: 'POST',
                headers: {
                    'Authorization': 'Basic ' + encodedCredentials,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
            }).then(response => {
                if (response.redirected) {
                    sessionStorage.setItem("username", this.id);
                    window.location.href = response.url;
                }
            })
                .catch(error => console.error('Error:', error));
        }
        else if (this.validateCredentials() == 1) alert("E nevoie sa introduceti o parola!");
        else if (this.validateCredentials() == 2) alert("E nevoie sa introduceti un ID!");
        else alert("E nevoie sa introduceti un ID si o parola!");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const clientRadio = document.getElementById("client");

    if (loginForm) {
        loginForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const id = document.getElementById("username").value.trim();
            const password = document.getElementById("password").value.trim();

            const expertLogin = new ExpertLogin(id, password);
            expertLogin.login();
        });
    }


    if (clientRadio) {
        clientRadio.addEventListener("change", () => {
            window.location.href = "/client";
        });
    }
});