import {DiffMatcher} from "mismatched/dist/src/matcher/DiffMatcher";
import {match, MatchResult} from "mismatched";
import {Thespian} from "./Thespian";
import {SuccessfulCall} from "./SuccessfulCall";
import {UnsuccessfulCall} from "./UnsuccessfulCall";
import {matchMaker} from "mismatched/dist/src/matchMaker/matchMaker";
import {minimumMatchRateForNearMiss} from "./MockHandler";

// Attached to a Handler - one for each possible call:
export class MockedCall<U> { // where U is the return type
    private expectedTimesInProgress = match.isEquals(1) as DiffMatcher<any>;
    private expectedTimes = match.isEquals(1) as DiffMatcher<any>;
    private actualTimes = 0;

    constructor(public fullName: string,
                public methodName: string,
                expectedArguments: Array<any>,
                private successfulCalls: Array<SuccessfulCall>,
                private expectedArgs = match.array.match(expectedArguments)) {
    }

    returns(fn: (...args: Array<any>) => U): this {
        this.returnFn = fn;
        return this;
    }

    returnsVoid(): this {
        return this;
    }

    times(count: number): this {
        this.expectedTimes = matchMaker(count);
        this.expectedTimesInProgress = match.number.lessEqual(count);
        return this;
    }

    timesAtLeast(count: number): this {
        this.expectedTimes = match.number.greaterEqual(count);
        this.expectedTimesInProgress = match.number.greaterEqual(1);
        return this;
    }

    timesAtMost(count: number): this {
        this.expectedTimes = match.number.lessEqual(count);
        this.expectedTimesInProgress = match.number.lessEqual(count);
        return this;
    }

    matchToRunResult(actualArgs: Array<any>): RunResult {
        const matchResult: MatchResult = this.expectedArgs.matches(actualArgs);
        const timesIncorrect = !this.expectedTimesInProgress.matches(this.actualTimes + 1).passed();
        const times = (timesIncorrect) ? this.actualTimes + 1 : this.actualTimes;
        if (!matchResult.passed()) {
            return this.makeNearMiss(matchResult, times);
        }
        if (timesIncorrect) {
            const failed = UnsuccessfulCall.make(this.fullName, minimumMatchRateForNearMiss, actualArgs,
                this.expectedTimes.describe(), this.actualTimes + 1);
            return {failed};
        }
        try {
            const result = this.returnFn.apply(undefined, actualArgs);
            this.actualTimes += 1;
            this.successfulCalls.push(SuccessfulCall.ofCall(this.fullName,
                actualArgs, result, this.expectedTimes.describe()));
            return {result};
        } catch (e) {
            Thespian.printer.logToConsole({
                mockedReturn: this.fullName + '.' + this.methodName,
                failed: e.message || e,
            });
            throw e;
        }
    }

    makeNearMiss(matchResult, actualTimes: number) {
        return {
            failed: UnsuccessfulCall.makeNearMiss(this.fullName,
                matchResult, this.expectedTimes.describe(), actualTimes)
        };
    }

    hasRun(): boolean {
        return this.actualTimes > 0;
    }

    hasPassed(): boolean {
        return this.expectedTimes.matches(this.actualTimes).passed();
    }

    describe() {
        return UnsuccessfulCall.make(this.fullName, 0,
            this.expectedArgs.describe(), this.expectedTimes.describe(), this.actualTimes).describe();
    }

    private returnFn: (...args: Array<any>) => U = () => undefined as any as U;
}

export interface RunResult {
    result?: any;
    failed?: UnsuccessfulCall;
}