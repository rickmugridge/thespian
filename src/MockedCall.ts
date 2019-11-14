import {Optional} from "./Optional";
import {DiffMatcher} from "mismatched/dist/src/matcher/DiffMatcher";
import {match, PrettyPrinter} from "mismatched";
import {matchMaker} from "mismatched/dist/src/matcher/matchMaker";
import {Thespian} from "./Thespian";

// Attached to a Handler - one for each possible call:
export class MockedCall<U> {// where U is the return type
    private expectedTimesInProgress = match.isEquals(1) as DiffMatcher<any>;
    private expectedTimes = match.isEquals(1) as DiffMatcher<any>;
    private actualTimes = 0;
    private returnFn: (...args: Array<any>) => U;

    // todo Need to also record the specifics of each matched call to a MockedCall, where times > 1

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
        this.returnFn = (...args: Array<any>) => undefined as any as U;
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
            throw new Error(`A returns() function is needed for mock for "${this.fullName}()"`);
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
            this.actualTimes += 1;
            this.successfulCalls.push(new SuccessfulCall(this.fullName + "()",
                actualArgs, result, this.expectedTimes.describe()));
            return Optional.some(result);
        } catch (e) {
            Thespian.printer.logToConsole({exception: "In MockedCall.didRun()", e}); // todo Improve message
        }
        return Optional.none;
    }

    hasRun(): boolean {
        return this.actualTimes > 0;
    }

    hasPassed(): boolean {
        return this.expectedTimes.matches(this.actualTimes).passed();
    }

    describe(): UnsuccessfulCall {
        return new UnsuccessfulCall(this.fullName + "()",
            this.expectedArgs.describe(), this.expectedTimes.describe(), this.actualTimes);
    }
}

export class SuccessfulCall {
    constructor(public name: string,
                public actualArgs: Array<any>,
                public returnValue: any,
                public expectedTimes: any) {
    }

    describe() {
        return {
            call: {[PrettyPrinter.symbolForPseudoCall]: this.name, args: this.actualArgs},
            returned: this.returnValue,
            expectedTimes: this.expectedTimes
        };
    }
}

export class UnsuccessfulCall {
    constructor(public name: string,
                public expectedArgs: any,
                public expectedTimes: any,
                public actualTimes: number) {
    }

    describe() {
        return this;
    }
}
