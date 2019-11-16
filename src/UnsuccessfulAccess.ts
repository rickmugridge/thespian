import {MatchResult} from "mismatched/src/MatchResult";
import {createPseudoCall} from "./SuccessfulCall";

export class UnsuccessfulAccess {
    private constructor(public access: object,
                        public expectedTimes: any,
                        public actualTimes: number) {
    }

    describe() {
        return this;
    }

    static make(access: string,
                expectedTimes: any,
                actualTimes: number) {
        return new UnsuccessfulAccess(createPseudoCall(access, []), expectedTimes, actualTimes);
    }
}