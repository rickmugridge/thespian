import {createPseudoCall} from "./SuccessfulCall";

export class UnsuccessfulAccess {
    private constructor(public property: object,
                        public expectedTimes: any,
                        public actualTimes: number) {
    }

    describe() {
        return this;
    }

    static make(property: string,
                expectedTimes: any,
                actualTimes: number) {
        return new UnsuccessfulAccess(createPseudoCall(property), expectedTimes, actualTimes);
    }
}