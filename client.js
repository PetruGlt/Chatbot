class ClientLogin {
    constructor(username, password) {
        this.username = username;
        this.password = password;
    }

    validateCredentials() {
        return this.username !== "" && this.password !== "";
    }

    login() {
        if (this.validateCredentials()) {
            window.open("", "_blank");
        } else {
            alert("E nevoie să introduceți un username și o parolă!");
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const loginBtn = document.getElementById("loginBtn");

    loginBtn.addEventListener("click", () => {
        const accountType = document.querySelector('input[name="accountType"]:checked').value;

        if (accountType === "client") {
            const username = document.getElementById("username").value.trim();
            const password = document.getElementById("password").value.trim();
            const clientLogin = new ClientLogin(username, password);
            clientLogin.login();
        }
    });
});
