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
        if (this.validateCredentials() == 0) window.open("", "_blank");
        else if (this.validateCredentials() == 1) alert("E nevoie să introduceți o parolă!");
        else if (this.validateCredentials() == 2) alert("E nevoie să introduceți un ID!");
        else alert("E nevoie să introduceți un ID si o parolă!");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const loginBtn = document.getElementById("loginBtn");

    loginBtn.addEventListener("click", () => {
        const accountType = document.querySelector('input[name="accountType"]:checked').value;

        if (accountType === "expert") {
            const id = document.getElementById("id").value.trim();
            const password = document.getElementById("password").value.trim();
            const expertLogin = new ExpertLogin(id, password);
            expertLogin.login();
        }
    });
});