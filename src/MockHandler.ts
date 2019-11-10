import {MockedCall, SuccessfulCall} from "./MockedCall";
import {isSymbol} from "util";
import {Thespian} from "./Thespian";

export class MockHandler implements ProxyHandler<{}> {
    mapMethodToMockCalls = new Map<PropertyKey, Array<MockedCall<any>>>();

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
            return () => self.mockName;
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
            const theCall = `${self.mockName}.${propKey as string}(${Thespian.printer.render(actualArguments)})`;
            throw new Error(`Unable to call ${theCall} as it does not match any mock setup calls` +
                self.displaySuccessfulCalls());
        }

        if (mockCalls) {
            return returnedFn;
        }
        throw new Error(`Unable to handle call to ${self.mockName}.${propKey}()` +
            self.displaySuccessfulCalls());
    }

    displaySuccessfulCalls(): string {
        if (this.successfulCalls.length > 0) {
            return "\nPrevious suceeding calls:\n" +
                Thespian.printer.render(this.successfulCalls);
        }
        return "";
    }

    // Called by apply() and call().
    apply(target, thisArg, actualArguments: Array<any>) {
        const mockCalls = this.mapMethodToMockCalls.get(MockHandler.applyKey);
        if (mockCalls) {
            for (let call of mockCalls) {
                const did = call.didRun(actualArguments); // todo keep the best match in case we fail and show diff for that if reasonable
                if (did.isSome) {
                    return did.some;
                }
            }
        }
        Thespian.printer.logToConsole(this.describeMocks());
        throw new Error(`Unable to call (${Thespian.printer.render(actualArguments)}), as it does not match any mock setup calls\n` +
            Thespian.printer.render(this.describeMocks()));
    }

    has(target, propKey: string): boolean {
        const mockCalls = this.mapMethodToMockCalls.get(propKey);
        return !!mockCalls;
    }

    set(target, propKey: string, value: any): boolean {
        throw new Error(`Not yet implemented: Unable to set ${propKey} to ${value}`)
    }

    deleteProperty(target, propKey: string): boolean {
        throw new Error(`Not yet implemented: Unable to delete property ${propKey}`)
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