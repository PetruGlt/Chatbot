const {ClientLogin} = require('./testClient');

describe("Testing ClientLogin class", () => {

    test("should pass when both username and password are filled", () => {
        const login = new ClientLogin("user", "pass");
        expect(login.validateCredentials()).toBe(0);
    });

    test("should fail when password is empty", () => {
        const login = new ClientLogin("user", "");
        expect(login.validateCredentials()).toBe(1);
    });

    test("should fail when username is empty", () => {
        const login = new ClientLogin("", "pass");
        expect(login.validateCredentials()).toBe(2);
    });

    test("should fail when both fields are empty", () => {
        const login = new ClientLogin("", "");
        expect(login.validateCredentials()).toBe(3);
    });

});