import {Optional} from "./Optional";
import {DiffMatcher} from "mismatched/dist/src/matcher/DiffMatcher";
import {match} from "mismatched";
import {matchMaker} from "mismatched/dist/src/matcher/matchMaker";

// Attached to a Handler - one for each possible call:
export class MockedCall<U> {// where U is the return type
    private expectedArgs: DiffMatcher<any>;
    private expectedTimesInProgress = match.isEquals(1) as DiffMatcher<any>;
    private expectedTimes = match.isEquals(1) as DiffMatcher<any>;
    private actualTimes = 0;
    private returnFn: (...args: Array<any>) => U;
    private successfulCalls: Array<SuccessfulCall> = [];

    // todo Need to also record the specifics of each matched call to a MockedCall, where times > 1

    constructor(public methodName: string | undefined, expectedArguments: Array<any>) {
        this.expectedArgs = match.array.match(expectedArguments);
    }

    returns(f: (...args: Array<any>) => U): this {
        this.returnFn = f;
        return this;
    }

    times(count: number): this {
        this.expectedTimes = matchMaker(count);
        this.expectedTimesInProgress = match.number.lessEqual(count);
        return this;
    }

    timesAtLeast(count: number): this {
        this.expectedTimes = match.number.greaterEqual(count);
        this.expectedTimesInProgress = match.number.greaterEqual(count);
        return this;
    }

    timesAtMost(count: number): this {
        this.expectedTimes = match.number.lessEqual(count);
        this.expectedTimesInProgress = match.number.lessEqual(count);
        return this;
    }

    didRun(actualArgs: Array<any>): Optional<any> {
        if (!this.returnFn) {
            throw new Error(`A returns() function is needed for mock for "${this.methodName}()"`);
        }
        const timesIncorrect = !this.expectedTimesInProgress.matches(this.actualTimes + 1).passed();
        if (timesIncorrect) {
            return Optional.none;
        }
        if (!this.expectedArgs.matches(actualArgs).passed()) {
            return Optional.none;
        }
        try {
            const result = this.returnFn.apply(undefined, actualArgs);
            this.successfulCalls.push(new SuccessfulCall(this.methodName, actualArgs, result));
            this.actualTimes += 1;
            return Optional.some(result);
        } catch (e) {
            console.debug("Problem", {e}); // todo Improve message
        }
        return Optional.none;
    }

    hasRun(): boolean {
        return this.actualTimes > 0;
    }

    describe() {
        return {
            methodName: this.methodName,
            expectedArgs: this.expectedArgs.describe(),
            expectedTimes: this.expectedTimes.describe(),
            timesCovered: this.expectedTimes.matches(this.actualTimes).passed(),
            successfulCalls: this.successfulCalls.map(c => c.describe())
        };
    }
}

class SuccessfulCall {
    constructor(public methodName: string | undefined, public actualArgs: Array<any>, public returnValue: any) {
    }

    describe() {
        return {
            actualArgs: this.actualArgs,
            returnValue: this.returnValue
        };
    }
}
