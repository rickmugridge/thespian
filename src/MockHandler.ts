import {MockedCall, SuccessfulCall} from "./MockedCall";
import {isSymbol} from "util";
import {PrettyPrinter} from "mismatched";

const printer = PrettyPrinter.make();

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
            throw new Error(`Unable to call ${self.mockName}.${propKey as string}(${printer.render(actualArguments)}) as it does not match`);
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
            console.log(printer.render(this.successfulCalls));
        }
    }

    // Called by apply() and call().
    apply(target, thisArg, actualArguments: Array<any>) {
        // console.debug("apply", {argumentsList: actualArguments}); // todo Remove
        const mockCalls = this.mapMethodToMockCalls.get(MockHandler.applyKey);
        for (let call of mockCalls!) {
            const did = call.didRun(actualArguments); // todo keep the best match in case succeed
            if (did.isSome) {
                return did.some;
            }
        }
        console.log(printer.render(this.describeMocks()));
        throw new Error(`Unable to call (${printer.render(actualArguments)}), as it does not match`);
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