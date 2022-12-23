import {assertThat, MatchResult, PrettyPrinter} from "mismatched";
import {createPseudoCall, SuccessfulCall} from "./SuccessfulCall";
import {MockedCall} from "./MockedCall";

describe("MockedCall()", () => {
    describe("setup:", () => {
        it("initially", () => {
            const mockedCall = new MockedCall("thespian.m", "m", [1], []);
            assertThat(mockedCall.describe()).is({
                call: createPseudoCall("thespian.m", [1]),
                expectedTimes: 1, actualTimes: 0
            });
        });

        it("After returns()", () => {
            const mockedCall = new MockedCall("thespian.m", "m", [1], [])
                .returns(f);
            assertThat(mockedCall.describe()).is({
                call: createPseudoCall("thespian.m", [1]),
                expectedTimes: 1, actualTimes: 0
            });
        });

        it("After times()", () => {
            const mockedCall = new MockedCall("thespian.m", "m", [1], [])
                .times(5);
            assertThat(mockedCall.describe()).is({
                call: createPseudoCall("thespian.m", [1]),
                expectedTimes: 5, actualTimes: 0
            });
        });

        it("After timesAtMost()", () => {
            const mockedCall = new MockedCall("thespian.m", "m", ["a"], [])
                .timesAtMost(5);
            assertThat(mockedCall.describe()).is({
                call: createPseudoCall("thespian.m", ["a"]),
                expectedTimes: {"number.lessEqual": 5}, actualTimes: 0
            });
        });

        it("Multiple arguments with timesAtLeast(2)", () => {
            const mockedCall = new MockedCall("thespian.m", "m", [1, "a", true], [])
                .timesAtLeast(2);
            assertThat(mockedCall.describe()).is({
                call: createPseudoCall("thespian.m", [1, "a", true]),
                expectedTimes: {"number.greaterEqual": 2}, actualTimes: 0
            });
        });
    });

    describe("matchToRunResult()", () => {
        it("Fails as no returns()", () => {
            const mockedCall = new MockedCall("thespian.m", "m", [3], [])
                .returns(() => 5)
                .times(0);
            assertThat(mockedCall.matchToRunResult([1]).failed).isNot(undefined);
        });

        it("Fails as actualTimes === expectedTimes", () => {
            const mockedCall = new MockedCall("thespian.m", "m", [4], [])
                .times(0)
                .returns(f);
            assertThat(mockedCall.matchToRunResult([1]).failed).isNot(undefined);
        });

        it("Fails as args don't match due to length difference", () => {
            const mockedCall = new MockedCall("thespian.m", "m", [5], [])
                .returns(f);
            const result = mockedCall.matchToRunResult([]);
            assertThat(result.failed).isNot(undefined);
            assertThat(PrettyPrinter.make().render(result)).is(`{
  failed: {
    call: thespian.m({${[MatchResult.expected]}: 5}), matchRate: 0, expectedTimes: 1, 
    actualTimes: 0
  }
}`);
        });

        it("Fails as args don't match due to smaller length difference", () => {
            const mockedCall = new MockedCall("thespian.m", "m", [5, 6, 7, 8], [])
                .returns(f);
            const result = mockedCall.matchToRunResult([5, 6]);
            assertThat(result.failed).isNot(undefined);
            assertThat(PrettyPrinter.make().render(result)).is(`{
  failed: {
    call: thespian.m(5, 6, {${[MatchResult.expected]}: 7}, {${[MatchResult.expected]}: 8}), 
    matchRate: 0.5, expectedTimes: 1, actualTimes: 0
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

        it("Succeeds on first call but not second", () => {
            const successfulCalls: Array<SuccessfulCall> = [];
            const mockedCall = new MockedCall("thespian.m", "m", [7], successfulCalls)
                .returns(f);
            assertThat(mockedCall.matchToRunResult([7]).failed).is(undefined);
            assertThat(mockedCall.matchToRunResult([7]).failed).isNot(undefined); // as only 1 times
            assertThat(mockedCall.describe()).is({
                call: createPseudoCall("thespian.m", [7]),
                actualTimes: 1, expectedTimes: 1
            });
            assertThat(successfulCalls).is([
                {
                    call: createPseudoCall("thespian.m", [7]),
                    returnValue: 3, expectedTimes: 1
                } as any
            ]);
        });
    });
});


function f() {
    return 3;
}