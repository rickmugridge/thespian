import {MockedCall} from "./MockedCall";
import {assertThat} from "mismatched";

describe("MockedCall()", () => {
    it("initially", () => {
        const mockedCall = new MockedCall("thespian","m", [1]);
        assertThat(mockedCall.describe()).is({
            methodName: "thespian.m", expectedArgs: [1],
            expectedTimes: 1,
            timesCovered: false,
            successfulCalls: []
        });
    });

    it("After returns()", () => {
        const mockedCall = new MockedCall("thespian","m", [1])
            .returns(f);
        assertThat(mockedCall.describe()).is({
            methodName: "thespian.m", expectedArgs: [1],
            expectedTimes: 1, timesCovered: false, successfulCalls: []
        });
    });

    it("After times()", () => {
        const mockedCall = new MockedCall("thespian","m", [1])
            .times(5);
        assertThat(mockedCall.describe()).is({
            methodName: "thespian.m", expectedArgs: [1],
            expectedTimes: 5, timesCovered: false, successfulCalls: []
        });
    });

    it("After timesAtMost()", () => {
        const mockedCall = new MockedCall("thespian","m", ["a"])
            .timesAtMost(5);
        assertThat(mockedCall.describe()).is({
            methodName: "thespian.m", expectedArgs: ["a"],
            expectedTimes: {"number.lessEqual": 5}, timesCovered: true, successfulCalls: []
        });
    });

    it("Multiple arguments with timesAtLeast(2)", () => {
        const mockedCall = new MockedCall("thespian","m", [1, "a", true])
            .timesAtLeast(2);
        assertThat(mockedCall.describe()).is({
            methodName: "thespian.m",
            expectedArgs: [1, "a", true],
            expectedTimes: {"number.greaterEqual": 2}, timesCovered: false, successfulCalls: []
        });
    });

    describe("didRun()", () => {
        it("Fails as no returns()", () => {
            const mockedCall = new MockedCall("thespian","m", [3])
                .returns(() => 5)
                .times(0);
            assertThat(mockedCall.didRun([1]).isSome).is(false);
        });

        it("Fails as actualTimes === expectedTimes", () => {
            const mockedCall = new MockedCall("thespian","m", [4])
                .times(0)
                .returns(f);
            assertThat(mockedCall.didRun([1]).isSome).is(false);
        });

        it("Fails as args don't match due to length difference", () => {
            const mockedCall = new MockedCall("thespian","m", [5])
                .returns(f);
            assertThat(mockedCall.didRun([]).isSome).is(false);
        });

        it("Fails as args don't match due to args difference", () => {
            const mockedCall = new MockedCall("thespian","m", [6])
                .returns(f);
            assertThat(mockedCall.didRun([2]).isSome).is(false);
        });

        it("Suceeds on first call but not second", () => {
            const mockedCall = new MockedCall("thespian","m", [7])
                .returns(f);
            assertThat(mockedCall.didRun([7]).isSome).is(true);
            assertThat(mockedCall.didRun([7]).isSome).is(false); // as only 1 times
            assertThat(mockedCall.describe()).is({
                methodName: "thespian.m", expectedArgs: [7],
                expectedTimes: 1,
                timesCovered: true,
                successfulCalls: [{actualArgs: [7], returnValue: 3}]
            });
        });
    });
});


function f() {
    return 3;
}