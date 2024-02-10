import {assertThat, MatchResult, PrettyPrinter} from "mismatched";
import {createPseudoCall, SuccessfulCall} from "./SuccessfulCall";
import {MockedCall} from "./MockedCall";

describe("MockedCall()", () => {
    const unsuccessfulAccess = (args: any[], expectedTimes: any, actualTimes: any) =>
        ({
            call: createPseudoCall("thespian.m", args),
            expectedTimes, actualTimes
        })

    describe("setup:", () => {
        it("initially", () => {
            const mockedCall = new MockedCall("thespian.m", "m", [1], []);
            assertThat(mockedCall.describe()).is(unsuccessfulAccess([1], 1, 0));
        });

        it("After returns()", () => {
            const mockedCall = new MockedCall("thespian.m", "m", [1], [])
                .returns(f);
            assertThat(mockedCall.describe()).is(unsuccessfulAccess([1], 1, 0));
        });

        it("After times()", () => {
            const mockedCall = new MockedCall("thespian.m", "m", [1], [])
                .times(5);
            assertThat(mockedCall.describe()).is(unsuccessfulAccess([1], 5, 0));
        });

        it("After timesAtMost()", () => {
            const mockedCall = new MockedCall("thespian.m", "m", [1], [])
                .timesAtMost(5);
            assertThat(mockedCall.describe()).is(unsuccessfulAccess([1],{"number.lessEqual": 5}, 0));
        });

        it("Multiple arguments with timesAtLeast(2)", () => {
            const args = [1, "a", true];
            const mockedCall = new MockedCall("thespian.m", "m", args, [])
                .timesAtLeast(2);
            assertThat(mockedCall.describe()).is(unsuccessfulAccess(args, {"number.greaterEqual": 2}, 0));
        });
    });

    describe("matchToRunResult()", () => {
        const successfulAccess = (returnValue: any, expectedTimes: any = 1) =>
            SuccessfulCall.ofCall("thespian.m", [7], returnValue, expectedTimes)

        it("Succeeds on call", () => {
            const successfulCalls: Array<SuccessfulCall> = [];
            const mockedCall = new MockedCall("thespian.m", "m", [7], successfulCalls)
                .returns(f);
            assertThat(mockedCall.matchToRunResult([7]).failed).is(undefined);
            assertThat(mockedCall.describe()).is({
                call: createPseudoCall("thespian.m", [7]),
                actualTimes: 1, expectedTimes: 1
            });
            assertThat(mockedCall.describe()).is(unsuccessfulAccess([7], 1, 1));
            assertThat(successfulCalls).is([
                successfulAccess(3, 1)
            ]);
        });

        it("Succeeds on first call but not second", () => {
            const successfulCalls: Array<SuccessfulCall> = [];
            const mockedCall = new MockedCall("thespian.m", "m", [7], successfulCalls)
                .returns(f);
            assertThat(mockedCall.matchToRunResult([7]).failed).is(undefined);
            assertThat(mockedCall.matchToRunResult([7]).failed).isNot(undefined); // as only 1 times
            assertThat(mockedCall.describe()).is(unsuccessfulAccess([7], 1, 1));
            assertThat(successfulCalls).is([
                successfulAccess(3, 1)
            ]);
        });

        it("Succeeds on throwing an exception via returns()", () => {
            const successfulCalls: Array<SuccessfulCall> = [];
            let error = new Error("error");
            const mockedCall = new MockedCall("thespian.m", "m", [7], successfulCalls)
                .returns(() => {
                    throw error
                });
            assertThat(() => mockedCall.matchToRunResult([7])).throwsError("error");
            assertThat(mockedCall.describe()).is(unsuccessfulAccess([7], 1, 1));
            assertThat(successfulCalls).is([
                successfulAccess(error, 1)
            ]);
        });

        it("Succeeds on throwing an exception via throws()", () => {
            const successfulCalls: Array<SuccessfulCall> = [];
            let error = new Error("error");
            const mockedCall = new MockedCall("thespian.m", "m", [7], successfulCalls)
                .throws(error);
            assertThat(() => mockedCall.matchToRunResult([7])).throwsError("error");
            assertThat(mockedCall.describe()).is(unsuccessfulAccess([7], 1, 1));
            assertThat(successfulCalls).is([
                successfulAccess(error, 1)
            ]);
        });

        it("Fails as not expected to be called", () => {
            const mockedCall = new MockedCall("thespian.m", "m", [3], [])
                .returns(() => 5)
                .times(0);
            assertThat(mockedCall.matchToRunResult([1]).failed).isNot(undefined);
        });

         it("Fails as args don't match due to length difference", () => {
            const mockedCall = new MockedCall("thespian.m", "m", [5], [])
                .returns(f);
            const result = mockedCall.matchToRunResult([]);
            assertThat(result.failed).isNot(undefined);
            assertThat(PrettyPrinter.make().render(result)).is(`{
  failed: {
    call: thespian.m({${[MatchResult.expected]}: 5}), matchRate: 0.5, expectedTimes: 1, 
    actualTimes: 0
  }
}`);
        });

        it("Fails as args don't match due to smaller length difference", () => {
            const mockedCall = new MockedCall("thespian.m",
                "m", [5, 6, 7, 8], [])
                .returns(f);
            const result = mockedCall.matchToRunResult([5, 6]);
            assertThat(result.failed).isNot(undefined);
            assertThat(PrettyPrinter.make().render(result)).is(`{
  failed: {
    call: thespian.m(5, 6, {${[MatchResult.expected]}: 7}, {${[MatchResult.expected]}: 8}), 
    matchRate: 0.6, expectedTimes: 1, actualTimes: 0
  }
}`);
        });

        it("Fails as args don't match due to args difference", () => {
            const successfulCalls: Array<SuccessfulCall> = [];
            const mockedCall = new MockedCall("thespian.m", "m", [6], successfulCalls)
                .returns(f);
            assertThat(mockedCall.matchToRunResult([2]).failed).isNot(undefined);
            assertThat(successfulCalls).is([]);
        });

    });
});


function f() {
    return 3;
}