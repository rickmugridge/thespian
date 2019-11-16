import {PrettyPrinter} from "mismatched";

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
        return new SuccessfulCall(createPseudoCall(name, args), returnValue, expectedTimes);
    }
}

export function createPseudoCall(name: string, args: Array<any>) {
    return {[PrettyPrinter.symbolForPseudoCall]: name, args};
}
