import {MockedCall} from "./MockedCall";

export class MockHandler implements ProxyHandler<{}> {
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

    verify() {
        // todo Check that expectations of all MockedCalls were met - providing details of what didn't happen, etc
    }
}