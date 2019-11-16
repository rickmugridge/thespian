import {MockedCall} from "./MockedCall";
import {MockHandler} from "./MockHandler";
import {matchMaker} from "mismatched/dist/src/matcher/matchMaker";
import {ofType} from "mismatched/dist/src/ofType";
import {TMocked} from "./TMocked";
import {SuccessfulCall} from "./SuccessfulCall";
import {SetUp, SetUpType} from "./SetUp";

let expectedArgs;

export class Mocked<T> implements TMocked<T> { // One for each mocked object and function
    public object: any; // Access the underlying mock.

    constructor(private mockName: string,
                private successfulCalls: Array<SuccessfulCall>,
                private handler = new MockHandler(mockName, successfulCalls)) {
        // Seems that we need the proxy target to be a function in order to allow for mocked functions!
        this.object = new Proxy(() => 3, this.handler);
    }

    setup<U>(f: (t: T) => U): MockedCall<U> {
        if (!ofType.isFunction(f)) {
            throw new Error("An arrow/function must be provided in setup()");
        }
        const setUpDetails = SetUp.details(f);
        let fieldName = MockHandler.applyKey;
        let fullName = this.mockName;
        if (setUpDetails._type==SetUpType.Method) {
            fieldName = setUpDetails.name!;
            fullName += "." + fieldName;
            const t: T = {
                [fieldName]: spy
            } as any as T;
            f(t);
        } else {
            f(spy as any as T);
        }
        const mockCall = new MockedCall<U>(fullName, fieldName, expectedArgs.map(matchMaker), this.successfulCalls);
        this.handler.add(mockCall);
        return mockCall;
    }
    // setup<U>(f: (t: T) => U): MockedCall<U> {
    //     if (!ofType.isFunction(f)) {
    //         throw new Error("An arrow/function must be provided in setup()");
    //     }
    //     const method = SetUp.methodName(f);
    //     let fieldName = MockHandler.applyKey;
    //     let fullName = this.mockName;
    //     if (method.isSome) {
    //         fieldName = method.some!;
    //         fullName += "." + fieldName;
    //         const t: T = {
    //             [fieldName]: spy
    //         } as any as T;
    //         f(t);
    //     } else {
    //         f(spy as any as T);
    //     }
    //     const mockCall = new MockedCall<U>(fullName, fieldName, expectedArgs.map(matchMaker), this.successfulCalls);
    //     this.handler.add(mockCall);
    //     return mockCall;
    // }

    verify(errors: Array<any>) {
        this.handler.verify(errors);
    }

    describeMocks() {
        return this.handler.describeMocks();
    }
}

function spy() {
    expectedArgs = Array.from(arguments);
}
