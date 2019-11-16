import {MatchResult} from "mismatched/src/MatchResult";
import {createPseudoCall} from "./SuccessfulCall";

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