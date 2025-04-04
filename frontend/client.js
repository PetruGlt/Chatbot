
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
        if (this.validateCredentials() == 0) window.location.href = "MainPage.html";
        else if (this.validateCredentials() == 1) alert("E nevoie să introduceți o parolă!");
        else if (this.validateCredentials() == 2) alert("E nevoie să introduceți un username!");
        else alert("E nevoie să introduceți un username si o parolă!");
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
            window.location.href = "expert.html";
        });
    }

});
