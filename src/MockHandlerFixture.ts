import {MockedCall, SuccessfulCall} from "./MockedCall";
import {MockHandler} from "./MockHandler";

const thespian = "thespian";

export class MockHandlerFixture {
    successfulCalls: Array<SuccessfulCall> = [];
    private handler = new MockHandler(thespian, this.successfulCalls);

    makeMock(methodName: string, expectedArguments: Array<any>) {
        const fullName = methodName === "" ? thespian : thespian + "." + methodName;
        const mockedCall = new MockedCall<any>(fullName, methodName,
            expectedArguments, this.successfulCalls);
        this.handler.add(mockedCall);
        return mockedCall;
    }

    getMock(methodName: string | number | symbol) {
        return this.handler.get(undefined, methodName, undefined);
    }

    successes() {
        return this.successfulCalls;
    }
}