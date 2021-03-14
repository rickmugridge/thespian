import {MockedCall} from "./MockedCall";
import {Thespian} from "./Thespian";
import {PrettyPrinter} from "mismatched";
import {SuccessfulCall} from "./SuccessfulCall";
import {UnsuccessfulCall} from "./UnsuccessfulCall";
import {MockedProperty} from "./MockedProperty";
import {UnsuccessfulAccess} from "./UnsuccessfulAccess";
import {ofType} from "mismatched/dist/src/ofType";

export const minimumMatchRateForNearMiss = 0.2

export class MockHandler implements ProxyHandler<{}> {
    static applyKey = "";
    mapMethodToMockCalls = new Map<PropertyKey, Array<MockedCall<any>>>();
    mapPropertyToFunctions = new Map<PropertyKey, Array<MockedProperty<any>>>();

    constructor(private mockName: string, private successfulCalls: Array<SuccessfulCall>) {
    }

    addCall(mockCall: MockedCall<any>) {
        const mockCalls = this.mapMethodToMockCalls.get(mockCall.methodName);
        if (!mockCalls) {
            this.mapMethodToMockCalls.set(mockCall.methodName, [mockCall]);
        } else {
            mockCalls.push(mockCall);
        }
    }

    addProperty(mockedProperty: MockedProperty<any>) {
        const mockCalls = this.mapPropertyToFunctions.get(mockedProperty.propertyName);
        if (!mockCalls) {
            this.mapPropertyToFunctions.set(mockedProperty.propertyName, [mockedProperty]);
        } else {
            mockCalls.push(mockedProperty);
        }
    }

    get(target, propKey: string | number | symbol, receiver): any { // actually a "(...) => any" for methods and functions
        const self = this;
        if (propKey === Thespian.symbolForMockToString) {
            return () => self.mockName;
        }
        if (ofType.isSymbol(propKey) || propKey === "inspect" || propKey === "name") {
            return undefined;
        }
        const fullMockName = `${self.mockName}.${propKey.toString()}`;

        function returnedFn() { // Has to be a function to access arguments
            return self.runRightCall(propKey, fullMockName, Array.from(arguments));
        }

        function mismatchedFn() { // Has to be a function to access arguments
            self.failedToMatch("Unable to handle call or access property, as it has not been mocked",
                fullMockName, Array.from(arguments), []);
        }

        const propertyAccesses = this.mapPropertyToFunctions.get(propKey);
        if (propertyAccesses) {
            return this.accessProperty(propertyAccesses, fullMockName);
        }

        if (this.mapMethodToMockCalls.has(propKey)) {
            return returnedFn;
        }
        // Unfortunately, we can't return the function to get the real args because it may be a property access:
        return mismatchedFn();
    }

    // Called by apply() and call().
    apply(target, thisArg, actualArguments: Array<any>) {
        return this.runRightCall(MockHandler.applyKey, this.mockName, actualArguments);
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
        try {
            return {configurable: true, enumerable: true, value: this.get(target, prop, undefined)};
        } catch (e) {
            return undefined;
        }
    }

    verify(errors: Array<any>) {
        this.mapMethodToMockCalls.forEach(mockCalls =>
            mockCalls.filter(m => !m.hasPassed()).forEach(m => errors.push(m.describe()))
        );
        this.mapPropertyToFunctions.forEach(mockCalls =>
            mockCalls.filter(m => !m.hasPassed()).forEach(m => errors.push(m.describe()))
        );
    }

    describeMocks(): Array<any> {
        const result: Array<any> = [];
        this.mapMethodToMockCalls.forEach(mockCalls =>
            mockCalls.filter(m => m.hasRun()).forEach(m => result.push(m.describe()))
        );
        this.mapPropertyToFunctions.forEach(mockAccesses =>
            mockAccesses.filter(m => m.hasRun()).forEach(m => result.push(m.describe()))
        );
        return result;
    }

    private accessProperty(propertyAccesses: Array<MockedProperty<any>>, mockName: string) {
        const nearMisses: Array<UnsuccessfulAccess> = [];
        for (let access of propertyAccesses) {
            const result = access.access();
            if (result.failed) {
                nearMisses.push(result.failed);
            } else {
                return result.result;
            }
        }
        const msg: any = {
            problem: "Unable to access",
            property: {[PrettyPrinter.symbolForPseudoCall]: mockName}
        };
        if (nearMisses.length > 0) {
            msg.tooOften = nearMisses;
        }
        this.error(msg);
    }

    private runRightCall(key: string | number | symbol, mockName: string, actualArguments: Array<any>): any {
        const nearMisses: Array<UnsuccessfulCall> = [];
        const mockCalls = this.mapMethodToMockCalls.get(key);
        if (mockCalls) {
            for (let call of mockCalls) {
                const did = call.matchToRunResult(actualArguments);
                if (!did.failed) {
                    return did.result;
                }
                if (did.failed.matchRate >= minimumMatchRateForNearMiss) {
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
}