import {MockedCall} from "./MockedCall";
import {isSymbol} from "util";
import {Thespian} from "./Thespian";
import {PrettyPrinter} from "mismatched";
import {SuccessfulCall} from "./SuccessfulCall";
import {UnsuccessfulCall} from "./UnsuccessfulCall";

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
        const fullMockName = `${self.mockName}.${propKey.toString()}`;

        function returnedFn() { // Has to be a function to access arguments
            return self.runRightCall(propKey, fullMockName, Array.from(arguments));
        }

        function mismatchedFn() {
            self.failedToMatch("Unable to handle call, as none defined",
                fullMockName, Array.from(arguments), []);
        }

        if (this.mapMethodToMockCalls.has(propKey)) {
            return returnedFn;
        }
        return mismatchedFn;
    }


    // Called by apply() and call().
    apply(target, thisArg, actualArguments: Array<any>) {
        return this.runRightCall(MockHandler.applyKey, this.mockName, actualArguments);
    }

    runRightCall(key: string | number | symbol, mockName: string, actualArguments: Array<any>): any {
        const nearMisses: Array<UnsuccessfulCall> = [];
        const mockCalls = this.mapMethodToMockCalls.get(key);
        if (mockCalls) {
            for (let call of mockCalls) {
                const did = call.matchToRunResult(actualArguments);
                if (!did.failed) {
                    return did.result;
                }
                if (did.failed.matchRate >= 0.2) {
                    nearMisses.push(did.failed);
                }
            }
        }
        const hasTooManyTimes = nearMisses.some(miss => miss.actualTimes > miss.expectedTimes);
        if (nearMisses.length == 1 && hasTooManyTimes) {
            this.failedToMatch("Unable to handle call, as it's called too many times",
                mockName, actualArguments, []);
        } else {
            const problem = "Unable to handle call, as none match";
            this.failedToMatch(hasTooManyTimes ? problem + " or it's called too many times" : problem,
                mockName, actualArguments, nearMisses);
        }
    }

    private failedToMatch(problem: string, mockName: string, actualArguments: Array<any>,
                          nearMisses: Array<UnsuccessfulCall>) {
        const msg: any = {
            problem,
            mockCall: {
                [PrettyPrinter.symbolForPseudoCall]: mockName,
                args: actualArguments
            }
        };
        if (nearMisses.length > 0) {
            msg.nearMisses = nearMisses.map(s => s.describe());
        }
        if (this.successfulCalls.length > 0) {
            msg.previousSuccessfulCalls = this.successfulCalls.map(s => s.describe());
        }
        this.error(msg);
    }

    error(msg: any) {
        throw new Error(Thespian.printer.render(msg));
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