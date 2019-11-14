import {PrettyPrinter} from "mismatched";
import {MatchResult} from "mismatched/src/MatchResult";

export class SuccessfulCall {
    private constructor(public call: object, public returnValue: any, public expectedTimes: any) {
    }

    describe() {
        return this;
    }

    passed() {
        return true;
    }

    static make(name: string,
                args: Array<any>,
                returnValue: any,
                expectedTimes: any) {
        return new SuccessfulCall(createPseudoCall(name, args),
            returnValue, expectedTimes);
    }
}

export class UnsuccessfulCall {
    private constructor(public call: object,
                        public matchRate: number,
                        public expectedTimes: any,
                        public actualTimes: number) {
    }

    describe() {
        return {call: this.call, expectedTimes: this.expectedTimes, actualTimes: this.actualTimes};
    }

    tooManyTimes() {
        return this.actualTimes > this.expectedTimes;
    }

    static make(name: string,
                matchRate: number,
                expectedArgs: any,
                expectedTimes: any,
                actualTimes: number) {
        return new UnsuccessfulCall(createPseudoCall(name, expectedArgs),
            matchRate, expectedTimes, actualTimes);
    }

    static makeNearMiss(name: string,
                        matchResult: MatchResult,
                        expectedTimes: any,
                        actualTimes: number) {
        return new UnsuccessfulCall(createPseudoCall(name, matchResult.diff as Array<any>), matchResult.matchRate,
            expectedTimes, actualTimes);
    }
}

export function createPseudoCall(name: string, args: Array<any>) {
    return {[PrettyPrinter.symbolForPseudoCall]: name, args};
}


// TODO Wire in near miss and change what's returned from MockedCall.matchToRunResult()