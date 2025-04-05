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

// this is needed to test the class in another file
if (typeof module !== 'undefined') {
    module.exports = {ClientLogin};
}