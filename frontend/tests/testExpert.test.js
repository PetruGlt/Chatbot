const {ExpertLogin} = require('./testExpert');

describe("Testing ExpertLogin class", () => {

    test("should pass when both ID and password are filled", () => {
        const login = new ExpertLogin("user", "pass");
        expect(login.validateCredentials()).toBe(0);
    });

    test("should fail when password is empty", () => {
        const login = new ExpertLogin("user", "");
        expect(login.validateCredentials()).toBe(1);
    });

    test("should fail when ID is empty", () => {
        const login = new ExpertLogin("", "pass");
        expect(login.validateCredentials()).toBe(2);
    });

    test("should fail when both fields are empty", () => {
        const login = new ExpertLogin("", "");
        expect(login.validateCredentials()).toBe(3);
    });

});