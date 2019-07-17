// Attached to a Handler - one for each possible call:
export class MockedCall<U> {
    expectedTimes = 1;
    actualTimes = 0;
    returnFn: () => {};

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

    didRun(actualArgs: Array<any>): boolean {
        if (this.actualTimes >= this.expectedTimes || actualArgs.length != this.expectedArgs.length) {
            return false;
        }
        for (let i = 0; i < actualArgs.length; i++) {
            if (actualArgs[i] !== this.expectedArgs[i]) { // todo use DiffMatcher's here instead
                return false;
            }
        }
        this.actualTimes += 1;
        return true;
    }
}

class SuccessfulCall {
    constructor(public methodName: string | undefined, public actualArgs: Array<any>, public returnValue: any) {
    }
}

class Option {
    constructor(public isSome: boolean, public some?: any) {
    }

    static none() {
        return new Option(false);
    }

    static some(value: any) {
        return new Option(true, value);
    }
}