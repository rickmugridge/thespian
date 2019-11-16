import {MockedCall} from "./MockedCall";
import {MockHandler} from "./MockHandler";
import {Thespian} from "./Thespian";
import {SuccessfulCall} from "./SuccessfulCall";

const thespian = "thespian";

export class MockHandlerFixture {
    successfulCalls: Array<SuccessfulCall> = [];
    private handler = new MockHandler(thespian, this.successfulCalls);

    makeMock(methodName: string, expectedArguments: Array<any>) {
        const fullName = methodName === "" ? thespian : thespian + "." + methodName;
        const mockedCall = new MockedCall<any>(fullName, methodName,
            expectedArguments, this.successfulCalls);
        this.handler.addCall(mockedCall);
        return mockedCall;
    }

    getMock(methodName: string | number | symbol) {
        return this.handler.get(undefined, methodName, undefined);
    }

    successes() {
        return this.successfulCalls;
    }

    // This doesn't work with promises, as Mocha.it() does not return a Promise
    static it(name: string, fn: (fixture: Thespian) => any) {
        const thespian = new Thespian();
        it(name, () => fn(thespian));
        thespian.verify();
    }
}