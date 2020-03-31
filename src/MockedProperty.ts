import {DiffMatcher, match} from "mismatched";
import {SuccessfulCall} from "./SuccessfulCall";
import {UnsuccessfulAccess} from "./UnsuccessfulAccess";
import {matchMaker} from "mismatched/dist/src/matchMaker/matchMaker";

export class MockedProperty<U> { // where U is the property type
    private expectedTimesInProgress = match.isEquals(1) as DiffMatcher<any>;
    private expectedTimes = match.isEquals(1) as DiffMatcher<any>;
    private actualTimes = 0;
    private returnFn: () => U;

    constructor(public fullName: string,
                public propertyName: string,
                private successfulCalls: Array<SuccessfulCall>) {
    }

    returns(fn: (...args: Array<any>) => U): this {
        this.returnFn = fn;
        return this;
    }

    returnsVoid(): this {
        throw new Error("An object property needs to return some value");
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

    access(): AccessResult {
        const timesCorrect = this.expectedTimesInProgress.matches(this.actualTimes + 1).passed();
        if (timesCorrect) {
            const result = this.returnFn();
            this.actualTimes += 1;
            this.successfulCalls.push(SuccessfulCall.ofProperty(this.fullName, result,
                this.expectedTimes.describe()));
            return {result};
        }
        const failed = UnsuccessfulAccess.make(this.fullName, this.expectedTimes.describe(),
            this.actualTimes + 1);
        return {failed};
    }

    hasRun(): boolean {
        return this.actualTimes > 0;
    }

    hasPassed(): boolean {
        return this.expectedTimes.matches(this.actualTimes).passed();
    }

    describe() {
        return UnsuccessfulAccess.make(this.fullName, 0, this.actualTimes).describe();
    }
}

export interface AccessResult {
    result?: any;
    failed?: UnsuccessfulAccess;
}