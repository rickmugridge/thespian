import {MockedCall} from "./MockedCall";
import {MockHandler} from "./MockHandler";
import {ofType} from "mismatched/dist/src/ofType";
import {TMocked} from "./TMocked";
import {SuccessfulCall} from "./SuccessfulCall";
import {DefinedSetUp, SetUpDetails, SetUpType} from "./DefinedSetUp";
import {MockedProperty} from "./MockedProperty";
import {matchMaker} from "mismatched/dist/src/matchMaker/matchMaker";

let expectedArgs;

export class Mocked<T> implements TMocked<T> { // One for each mocked object and function
    public object: any; // Access the underlying mock.

    constructor(private mockName: string,
                private successfulCalls: Array<SuccessfulCall>,
                private handler = new MockHandler(mockName, successfulCalls)) {
        // Seems that we need the proxy target to be a function in order to allow for mocked functions!
        this.object = new Proxy(() => 3, this.handler);
    }

    setup<U>(f: (t: T) => U): MockedCall<U> | MockedProperty<U> {
        if (!ofType.isFunction(f)) {
            throw new Error("An arrow/function must be provided in setup()");
        }
        const setUpDetails = DefinedSetUp.details(f);
        switch (setUpDetails._type) {
            case SetUpType.Property:
                return this.setUpPropertyAccess<U>(f, setUpDetails);
            case SetUpType.Method:
                return this.setUpMethodCall<U>(f, setUpDetails);
            case SetUpType.Function:
                return this.setUpFunctionCall(f, this.mockName);
        }
    }

    private setUpPropertyAccess<U>(f: (t: T) => U, setUpDetails: SetUpDetails): MockedProperty<U> {
        const fieldName = setUpDetails.name!;
        const fullName = this.mockName + "." + fieldName;
        const mockedProperty = new MockedProperty<U>(fullName, fieldName, this.successfulCalls);
        this.handler.addProperty(mockedProperty);
        return mockedProperty;
    }

    private setUpMethodCall<U>(f: (t: T) => U, setUpDetails: SetUpDetails): MockedCall<U> {
        const fieldName = setUpDetails.name!;
        const fullName = this.mockName + "." + fieldName;
        const t: T = {
            [fieldName]: spyToGrabArguments
        } as any as T;
        f(t);
        return this.addMockedCall(fullName, fieldName);
    }

    private setUpFunctionCall<U>(f: (t: T) => U, fullName: string): MockedCall<U> {
        f(spyToGrabArguments as any as T);
        const fieldName = MockHandler.applyKey;
        return this.addMockedCall(fullName, fieldName);
    }

    private addMockedCall<U>(fullName: string, fieldName: string): MockedCall<U> {
        const mockCall = new MockedCall<U>(fullName, fieldName, expectedArgs.map(matchMaker), this.successfulCalls);
        this.handler.addCall(mockCall);
        return mockCall;
    }

    verify(errors: Array<any>) {
        this.handler.verify(errors);
    }

    describeMocks() {
        return this.handler.describeMocks();
    }
}

function spyToGrabArguments() {
    expectedArgs = Array.from(arguments);
}
