import {MatchResult} from "mismatched/src/MatchResult";
import {createPseudoCall} from "./SuccessfulCall";

export class UnsuccessfulAccess {
    private constructor(public call: object,
                        public expectedTimes: any,
                        public actualTimes: number) {
    }

    describe() {
        return this;
    }

    static make(name: string,
                expectedTimes: any,
                actualTimes: number) {
        return new UnsuccessfulAccess(createPseudoCall(name, []), expectedTimes, actualTimes);
    }
}