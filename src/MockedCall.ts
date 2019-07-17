// Attached to a Handler - one for each possible call:
import {Optional} from "./Optional";

export class MockedCall<U> {
    expectedTimes = 1;
    actualTimes = 0;
    returnFn: () => U;
    successfulCalls: Array<SuccessfulCall> = [];

    // todo Need to also record the specifics of each matched call to a MockedCall, where times > 1

    constructor(public methodName: string | undefined, private expectedArgs: Array<any>) {
    }

    returns(f: () => U): MockedCall<U> {
        this.returnFn = f;
        return this;
    }

    times(count: number): MockedCall<U> {
        this.expectedTimes = count; // Later allow for a DiffMatcher
        return this;
    }

    didRun(actualArgs: Array<any>): Optional<any> {
        if (this.actualTimes >= this.expectedTimes || actualArgs.length != this.expectedArgs.length) {
            return Optional.none;
        }
        for (let i = 0; i < actualArgs.length; i++) {
            if (actualArgs[i] !== this.expectedArgs[i]) { // todo use DiffMatcher's here instead
                return Optional.none;
            }
        }
        try {
            const result = this.returnFn ? this.returnFn() : undefined; // todo Consider whether this is the best approach
            this.successfulCalls.push(new SuccessfulCall(this.methodName, actualArgs, result));
            this.actualTimes += 1;
            return Optional.some(result);
        } catch (e) {
            console.debug("Problem", {e}); // todo Improve message
        }
        return Optional.none;
    }
}

class SuccessfulCall {
    constructor(public methodName: string | undefined, public actualArgs: Array<any>, public returnValue: any) {
    }
}
