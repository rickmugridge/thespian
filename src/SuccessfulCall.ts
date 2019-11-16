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

    static ofCall(name: string,
                  args: Array<any>|undefined,
                  returnValue: any,
                  expectedTimes: any) {
        return new SuccessfulCall(createPseudoCall(name, args), returnValue, expectedTimes);
    }

    static ofProperty(name: string,
                      returnValue: any,
                      expectedTimes: any) {
        return new SuccessfulCall(createPseudoCall(name), returnValue, expectedTimes);
    }
}

export function createPseudoCall(name: string, args?: Array<any>) {
    return {[PrettyPrinter.symbolForPseudoCall]: name, args};
}
