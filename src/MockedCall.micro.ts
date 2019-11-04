import {MockedCall} from "./MockedCall";
import {assertThat} from "mismatched/dist/src/assertThat";

describe("MockedCall()", () => {
    it("initially", () => {
        const mockedCall = new MockedCall("m", [1]);
        assertThat(mockedCall.expectedTimes).is(1);
        assertThat(mockedCall.actualTimes).is(0);
    });

    it("After returns()", () => {
        const mockedCall = new MockedCall("m", [1]);
        assertThat(mockedCall.returns(f)).is(mockedCall);
        assertThat(mockedCall.returnFn).is(f);
        assertThat(mockedCall.expectedTimes).is(1);
        assertThat(mockedCall.actualTimes).is(0);
    });

    it("After times()", () => {
        const mockedCall = new MockedCall("m", [1]);
        assertThat(mockedCall.times(5)).is(mockedCall);
        assertThat(mockedCall.expectedTimes).is(5);
        assertThat(mockedCall.actualTimes).is(0);
    });

    describe("didRun()", () => {
        it("Fails as actualTimes === expectedTimes", () => {
            const mockedCall = new MockedCall("m", [1]);
            assertThat(mockedCall.times(0)).is(mockedCall);
            assertThat(mockedCall.didRun([1]).isSome).is(false);
        });

        it("Fails as args don't match due to length difference", () => {
            const mockedCall = new MockedCall("m", [1]);
            assertThat(mockedCall.didRun([]).isSome).is(false);
        });

        it("Fails as args don't match due to args difference", () => {
            const mockedCall = new MockedCall("m", [1]);
            assertThat(mockedCall.didRun([2]).isSome).is(false);
        });

        it("Suceeds on first call but not second", () => {
            const mockedCall = new MockedCall("m", [1]);
            mockedCall.returns(f);
            assertThat(mockedCall.didRun([1]).isSome).is(true);
            assertThat(mockedCall.didRun([1]).isSome).is(false); // as only 1 times
            console.debug({successfulCalls: JSON.stringify(mockedCall.successfulCalls)}); // todo Turn into a test with DiffMatch
        });
    });
});


function f() {
    return 3;
}