import {MockedCall} from "./MockedCall";
import {isSymbol} from "util";
import {PrettyPrinter} from "mismatched";

const printer = PrettyPrinter.make();

export class MockHandler implements ProxyHandler<{}> {
    mapMethodToMockCalls = new Map<string | number | symbol | undefined, Array<MockedCall<any>>>();

    add(mockCall: MockedCall<any>) {
        const mockCalls = this.mapMethodToMockCalls.get(mockCall.methodName);
        if (!mockCalls) {
            this.mapMethodToMockCalls.set(mockCall.methodName, [mockCall]);
        } else {
            mockCalls.push(mockCall);
        }
    }

    get(target, propKey: string | number | symbol, receiver): any { // actually a "(...) => any" for methods and functions
        if (isSymbol(propKey) || propKey === "inspect" || propKey === "name") {
            return undefined;
        }
        const mockCalls = this.mapMethodToMockCalls.get(propKey);

        // console.debug("get", {propKey, mockCalls}); // todo Remove

        function returnedFn() {
            const actualArguments = Array.from(arguments);
            for (let call of mockCalls!) {
                const did = call.didRun(actualArguments); // todo keep the best match in case succeed
                if (did.isSome) {
                    return did.some;
                }
            }
            throw new Error(`Unable to call ${propKey as string}(${printer.render(actualArguments)}) as it does not match`);
        }

        if (mockCalls) {
            return returnedFn;
        }
        throw new Error(`Unable to handle call to ${propKey}()`);
    }

    set(target, propKey: string, value: any): boolean {
        throw new Error(`Unable to set ${propKey} to ${value}`)
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

    verify() {
        // todo Check that expectations of all MockedCalls were met - providing details of what didn't happen, etc
    }

    describeMocks() {
        const result: Array<any> = [];
        this.mapMethodToMockCalls.forEach(mockCalls =>
            mockCalls.filter(m => m.hasRun()).forEach(m => result.push(m.describe()))
        );
        return result;
    }

    static applyKey = "";
}