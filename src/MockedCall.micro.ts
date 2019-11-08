import {MockedCall, SuccessfulCall} from "./MockedCall";
import {assertThat} from "mismatched";

describe("MockedCall()", () => {
    describe("setup:", () => {
        it("initially", () => {
            const mockedCall = new MockedCall("thespian.m", "m", [1], []);
            assertThat(mockedCall.describe()).is({
                name: "thespian.m()", expectedArgs: [1],
                expectedTimes: 1, actualTimes: 0
            });
        });

        it("After returns()", () => {
            const mockedCall = new MockedCall("thespian.m", "m", [1], [])
                .returns(f);
            assertThat(mockedCall.describe()).is({
                name: "thespian.m()", expectedArgs: [1],
                expectedTimes: 1, actualTimes: 0
            });
        });

        it("After times()", () => {
            const mockedCall = new MockedCall("thespian.m", "m", [1], [])
                .times(5);
            assertThat(mockedCall.describe()).is({
                name: "thespian.m()", expectedArgs: [1],
                expectedTimes: 5, actualTimes: 0
            });
        });

        it("After timesAtMost()", () => {
            const mockedCall = new MockedCall("thespian.m", "m", ["a"], [])
                .timesAtMost(5);
            assertThat(mockedCall.describe()).is({
                name: 'thespian.m()', expectedArgs: ["a"],
                expectedTimes: {"number.lessEqual": 5}, actualTimes: 0
            });
        });

        it("Multiple arguments with timesAtLeast(2)", () => {
            const mockedCall = new MockedCall("thespian.m", "m", [1, "a", true], [])
                .timesAtLeast(2);
            assertThat(mockedCall.describe()).is({
                name: 'thespian.m()', expectedArgs: [1, "a", true],
                expectedTimes: {"number.greaterEqual": 2}, actualTimes: 0
            });
        });
    });

    describe("didRun()", () => {
        it("Fails as no returns()", () => {
            const mockedCall = new MockedCall("thespian.m", "m", [3], [])
                .returns(() => 5)
                .times(0);
            assertThat(mockedCall.didRun([1]).isSome).is(false);
        });

        it("Fails as actualTimes === expectedTimes", () => {
            const mockedCall = new MockedCall("thespian.m", "m", [4], [])
                .times(0)
                .returns(f);
            assertThat(mockedCall.didRun([1]).isSome).is(false);
        });

        it("Fails as args don't match due to length difference", () => {
            const mockedCall = new MockedCall("thespian.m", "m", [5], [])
                .returns(f);
            assertThat(mockedCall.didRun([]).isSome).is(false);
        });

        it("Fails as args don't match due to args difference", () => {
            const successfulCalls: Array<SuccessfulCall> = [];
            const mockedCall = new MockedCall("thespian.m", "m", [6], successfulCalls)
                .returns(f);
            assertThat(mockedCall.didRun([2]).isSome).is(false);
            assertThat(successfulCalls).is([]);
        });

        it("Suceeds on first call but not second", () => {
            const successfulCalls: Array<SuccessfulCall> = [];
            const mockedCall = new MockedCall("thespian.m", "m", [7], successfulCalls)
                .returns(f);
            assertThat(mockedCall.didRun([7]).isSome).is(true);
            assertThat(mockedCall.didRun([7]).isSome).is(false); // as only 1 times
            assertThat(mockedCall.describe()).is({
                name: "thespian.m()", expectedArgs: [7], actualTimes: 1
            });
            assertThat(successfulCalls).is([
                {name: "thespian.m()", actualArgs: [7], returnValue: 3, expectedTimes: 1}
            ]);
        });
    });
});


function f() {
    return 3;
}