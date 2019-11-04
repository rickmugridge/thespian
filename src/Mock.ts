import {MockedCall} from "./MockedCall";
import {MockHandler} from "./MockHandler";
import {Optional} from "./Optional";
import {matchMaker} from "mismatched/dist/src/matcher/matchMaker";

let expectedArgs;

export class Mock<T> { // One for each mocked object and function
    handler = new MockHandler();
    // Seems that we need the proxy target to be a function in order to allow for mocked functions!
    object = new Proxy(() => 3, this.handler);

    constructor(public name: string | undefined) {
    }

    setup<U>(f: (t: T) => U): MockedCall<U> {
        const method = methodName(f);
        let fieldName = MockHandler.applyKey;
        if (method.isSome) {
            fieldName = method.some!;
            const t: T = {
                [fieldName]: spy
            } as any as T;
            f(t);
            // console.debug("setup", {name: this.name, fieldName, args: JSON.stringify(args)}); // todo Remove
        } else {
            f(spy as any as T);
            // console.debug("setup", {name: this.name, args: JSON.stringify(args)}); // todo Remove
        }
        const mockCall = new MockedCall<U>(fieldName, expectedArgs.map(matchMaker));
        // console.debug("setup", {mockCall}); // todo Remove
        this.handler.add(mockCall);
        return mockCall;
    }

    verify() {
        this.handler.verify();
    }

    describeMocks() {
        return this.handler.describeMocks();
    }
}


function spy() {
    expectedArgs = Array.from(arguments);
}

// Return a string if it's a method call, or undefined if it's a function call
// todo Allow for 'f => f.property'
function methodName<T, U>(f: (t: T) => U): Optional<string> {
    const fn = f.toString(); // 'f => f.foooo(2, "aaa")'
    const split = fn.split(" => "); // ['f', 'f.foooo(2, "aaa")'
    const call = split[1]; // 'f.foooo(2, "aaa")'
    const dot = call.indexOf(".");
    if (dot < 0) {
        return Optional.none; // a function
    }
    const openBracket = call.indexOf("("); /// todo may not exist, with a property
    const fnName = call.slice(dot + 1, openBracket);
    return Optional.some(fnName);
}

