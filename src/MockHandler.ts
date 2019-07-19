import {MockedCall} from "./MockedCall";
import {isSymbol} from "util";

export class MockHandler implements ProxyHandler<{}> {
    mapMethodToMockCalls = new Map<string | undefined, Array<MockedCall<any>>>();

    add(mockCall: MockedCall<any>) {
        const mockCalls = this.mapMethodToMockCalls.get(mockCall.methodName);
        if (!mockCalls) {
            this.mapMethodToMockCalls.set(mockCall.methodName, [mockCall]);
        } else {
            mockCalls.push(mockCall);
        }
    }

    get(target, propKey: string, receiver): any { // actually a "(...) => any" for methods and functions
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
            throw new Error(`Unable to call ${propKey}(${actualArguments.join(",")}) as it does not match`);
        }

        if (mockCalls) {
            return returnedFn;
        }
        throw new Error(`Unable to handle call to ${propKey}()`);
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
        throw new Error(`Unable to call (${actualArguments.join(",")}), as it does not match`);
    }

    verify() {
        // todo Check that expectations of all MockedCalls were met - providing details of what didn't happen, etc
    }

    describeMocks() {
        const result: Array<any> = [];
        this.mapMethodToMockCalls.forEach(mockCalls =>
            mockCalls.forEach(m => result.push(m.describe()))
        );
        return result;
    }

    static applyKey = "";

}