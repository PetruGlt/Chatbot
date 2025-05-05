
describe("Register functionality testing", () => {

    test("Verificarea existentei username-ului si a parolei", () => {
        const register = new ClientRegister("user", "pass");
        expect(register.validateCredentials()).toBe(0);
    });

    test("Fail daca parola este empty", () => {
        const register = new ClientRegister("user", "");
        expect(register.validateCredentials()).toBe(1);
    });

    test("Fail daca username-ul este empty", () => {
        const register = new ClientRegister("", "pass");
        expect(register.validateCredentials()).toBe(2);
    });

    test("Fail daca ambele sunt empty", () => {
        const register = new ClientRegister("", "");
        expect(register.validateCredentials()).toBe(3);
    });

})