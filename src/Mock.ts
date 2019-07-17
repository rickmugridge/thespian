import {MockedCall} from "./MockedCall";

let args;

export class Mock<T> { // One for each mocked object and function
    handler = new Handler();
    object = new Proxy({f: (() => 3)}, this.handler);

    constructor(public name: string | undefined) {
    }

    setup(name: string, result: any) {
        this.handler.setup(name, result);
    }

    setup2<U>(f: (t: T) => U): MockedCall<U> {
        const method = methodName(f);
        if (method) {
            const t: T = {
                [method]: spy
            } as any as T;
            f(t);
            console.debug("setup2", {name: this.name, method, args: JSON.stringify(args)}); // todo Remove
        } else {
            f(spy as any as T);
            console.debug("setup2", {name: this.name, args: JSON.stringify(args)}); // todo Remove
        }
        const mockCall = new MockedCall<U>(method, args);
        this.handler.add(mockCall);
        return mockCall;
    }

    verify() {
        // todo Check that all expectation were met - providing details of what didn't happen, etc
    }
}

class Handler implements ProxyHandler<{}> {
    map = new Map<string, any>();
    mapMethodToMockCalls = new Map<string | undefined, Array<MockedCall<any>>>();

    add(mockCall: MockedCall<any>) {
        const mockCalls = this.mapMethodToMockCalls.get(mockCall.methodName);
        if (!mockCalls) {
            this.mapMethodToMockCalls.set(mockCall.methodName, [mockCall]);
        } else {
            mockCalls.push(mockCall);
        }
    }

    get(target, propKey: string, receiver) {
        console.debug("get", {propKey}); // todo Remove
        const result = this.map.get(propKey);
        if (result) {
            return result;
        }
        if (propKey === "foo") {
            return 556;
        }
        if (propKey === "f") {
            return i => i + 333;
        }
        return 22;
    }

    // Called by apply() and call().
    apply(target, thisArg, argumentsList) {
        console.debug("apply", {thisArg, argumentsList}); // todo Remove

        return 234; //target(argumentsList[0], argumentsList[1]) * 10;
    }

    setup(name: string, result: any) {
        this.map.set(name, result);
    }
}

function spy() {
    args = Array.from(arguments);
}

// Return a string if it's a method call, or undefined if it's a function call
// todo Allow for 'f => f.property'
function methodName<T, U>(f: (t: T) => U): string | undefined {
    const fn = f.toString(); // 'f => f.foooo(2, "aaa")'
    const split = fn.split(" => "); // ['f', 'f.foooo(2, "aaa")'
    const call = split[1]; // 'f.foooo(2, "aaa")'
    const dot = call.indexOf(".");
    if (dot < 0) {
        return undefined; // a function
    }
    const openBracket = call.indexOf("("); /// todo may not exist
    const fnName = call.slice(dot + 1, openBracket);
    return fnName;
}

