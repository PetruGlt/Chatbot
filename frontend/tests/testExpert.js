class ExpertLogin {
    constructor(id, password) {
        this.id = id;
        this.password = password;
    }

    validateCredentials() {
        let errnr = 0;
        if (this.id !== "" && this.password == "") errnr = 1;
        if (this.id == "" && this.password !== "") errnr = 2;
        if (this.id == "" && this.password == "") errnr = 3;
        return errnr;
    }

    login() {
        const result = this.validateCredentials();
        if (result == 0) {
            window.location.href = "MainPage.html";
        } else if (result == 1) {
            alert("E nevoie să introduceți o parolă!");
        } else if (result == 2) {
            alert("E nevoie să introduceți un ID!");
        } else {
            alert("E nevoie să introduceți un ID si o parolă!");
        }
    }
}


if (typeof module !== 'undefined') {
    module.exports = {ExpertLogin};
}