import {MockedCall} from "./MockedCall";
import {matchMaker} from "mismatched/dist/src/matcher/matchMaker";
import {assertThat, match} from "mismatched";

describe("MockedCall()", () => {
    const one = matchMaker(1);

    it("initially", () => {
        const mockedCall = new MockedCall("m", [one]);
        assertThat(mockedCall.expectedTimes).is(1);
        assertThat(mockedCall.actualTimes).is(0);
    });

    it("After returns()", () => {
        const mockedCall = new MockedCall("m", [one]);
        assertThat(mockedCall.returns(f)).itIs(mockedCall);
        assertThat(mockedCall.returnFn).is(f);
        assertThat(mockedCall.expectedTimes).is(one);
        assertThat(mockedCall.actualTimes).is(0);
    });

    it("After times()", () => {
        const mockedCall = new MockedCall("m", [one]);
        assertThat(mockedCall.times(5)).itIs(mockedCall);
        assertThat(mockedCall.expectedTimes).is(5);
        assertThat(mockedCall.actualTimes).is(0);
    });

    describe("didRun()", () => {
        it("Fails as actualTimes === expectedTimes", () => {
            const mockedCall = new MockedCall("m", [one]);
            assertThat(mockedCall.times(0)).itIs(mockedCall);
            assertThat(mockedCall.didRun([1]).isSome).is(false);
        });

        it("Fails as args don't match due to length difference", () => {
            const mockedCall = new MockedCall("m", [one]);
            assertThat(mockedCall.didRun([]).isSome).is(false);
        });

        it("Fails as args don't match due to args difference", () => {
            const mockedCall = new MockedCall("m", [one]);
            assertThat(mockedCall.didRun([2]).isSome).is(false);
        });

        it("Suceeds on first call but not second", () => {
            const mockedCall = new MockedCall("m", [one]);
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