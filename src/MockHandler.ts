import {MockedCall, SuccessfulCall} from "./MockedCall";
import {isSymbol} from "util";
import {Thespian} from "./Thespian";

export class MockHandler implements ProxyHandler<{}> {
    mapMethodToMockCalls = new Map<string | number | symbol | undefined, Array<MockedCall<any>>>();

    constructor(private mockName: string, private successfulCalls: Array<SuccessfulCall>) {
    }

    add(mockCall: MockedCall<any>) {
        const mockCalls = this.mapMethodToMockCalls.get(mockCall.methodName);
        if (!mockCalls) {
            this.mapMethodToMockCalls.set(mockCall.methodName, [mockCall]);
        } else {
            mockCalls.push(mockCall);
        }
    }

    get(target, propKey: string | number | symbol, receiver): any { // actually a "(...) => any" for methods and functions
        const self = this;
        if (propKey === Thespian.symbolForMockToString) {
            return () => `Mock(${self.mockName})`;
        }
        if (isSymbol(propKey) || propKey === "inspect" || propKey === "name") {
            return undefined;
        }
        const mockCalls = this.mapMethodToMockCalls.get(propKey);

        function returnedFn() {
            const actualArguments = Array.from(arguments);
            for (let call of mockCalls!) {
                const did = call.didRun(actualArguments); // todo keep the best match in case succeed
                if (did.isSome) {
                    return did.some;
                }
            }
            self.displaySuccessfulCalls();
            const theCall = `${self.mockName}.${propKey as string}(${Thespian.printer.render(actualArguments)})`;
            throw new Error(`Unable to call ${theCall} as it does not match any mock setup calls`);
        }

        if (mockCalls) {
            return returnedFn;
        }
        self.displaySuccessfulCalls();
        throw new Error(`Unable to handle call to ${self.mockName}.${propKey}()`);
    }

    set(target, propKey: string, value: any): boolean {
        throw new Error(`Unable to set ${propKey} to ${value}`)
    }

    displaySuccessfulCalls() {
        if (this.successfulCalls.length > 0) {
            Thespian.printer.logToConsole(this.successfulCalls);
        }
    }

    // Called by apply() and call().
    apply(target, thisArg, actualArguments: Array<any>) {
        const mockCalls = this.mapMethodToMockCalls.get(MockHandler.applyKey);
        for (let call of mockCalls!) {
            const did = call.didRun(actualArguments); // todo keep the best match in case we fail and show diff for that if reasonable
            if (did.isSome) {
                return did.some;
            }
        }
        Thespian.printer.logToConsole(this.describeMocks());
        throw new Error(`Unable to call (${Thespian.printer.render(actualArguments)}), as it does not match any mock setup calls`);
    }

    has(target, propKey: string): boolean {
        const mockCalls = this.mapMethodToMockCalls.get(propKey);
        return !!mockCalls;
    }

    deleteProperty(target, propKey: string): boolean {
        throw new Error(`Unable to delete property ${propKey}`)
    }

    getOwnPropertyDescriptor(target, prop: string | number | symbol): PropertyDescriptor | undefined {
        try {// todo check results here
            return {configurable: true, enumerable: true, value: this.get(target, prop, undefined)};
        } catch (e) {
            return undefined;
        }
    }

    verify(errors: Array<any>) {
        this.mapMethodToMockCalls.forEach(mockCalls =>
            mockCalls.filter(m => !m.hasPassed()).forEach(m => errors.push(m.describe()))
        );
    }

    describeMocks(): Array<any> {
        const result: Array<any> = [];
        this.mapMethodToMockCalls.forEach(mockCalls =>
            mockCalls.filter(m => m.hasRun()).forEach(m => result.push(m.describe()))
        );
        return result;
    }

    static applyKey = "";
}