import {MockedCall} from "./MockedCall";
import {MockHandler} from "./MockHandler";

let args;

export class Mock<T> { // One for each mocked object and function
    handler = new MockHandler();
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
        this.handler.verify();
    }
}


function spy() {
    args = Array.from(arguments);
}

// Return a string if it's a method call, or undefined if it's a function call
// todo Allow for 'f => f.property'
function methodName<T, U>(f: (t: T) => U): string | undefined { // todo Use Optional here
    const fn = f.toString(); // 'f => f.foooo(2, "aaa")'
    const split = fn.split(" => "); // ['f', 'f.foooo(2, "aaa")'
    const call = split[1]; // 'f.foooo(2, "aaa")'
    const dot = call.indexOf(".");
    if (dot < 0) {
        return undefined; // a function
    }
    const openBracket = call.indexOf("("); /// todo may not exist, with a property
    const fnName = call.slice(dot + 1, openBracket);
    return fnName;
}

