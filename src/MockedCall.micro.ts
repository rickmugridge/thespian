import {MockedCall} from "./MockedCall";
import {assertThat} from "./assertThat";

describe("MockedCall()", () => {
    it("initially", () => {
        const mockedCall = new MockedCall("m", [1]);
        assertThat(mockedCall.expectedTimes, 1);
        assertThat(mockedCall.actualTimes, 0);
    });

    it("After returns()", () => {
        const mockedCall = new MockedCall("m", [1]);
        assertThat(mockedCall.returns(f), mockedCall);
        assertThat(mockedCall.returnFn, f);
        assertThat(mockedCall.expectedTimes, 1);
        assertThat(mockedCall.actualTimes, 0);
    });

    it("After times()", () => {
        const mockedCall = new MockedCall("m", [1]);
        assertThat(mockedCall.times(5), mockedCall);
        assertThat(mockedCall.expectedTimes, 5);
        assertThat(mockedCall.actualTimes, 0);
    });

    describe("didRun()", () => {
        it("Fails as actualTimes === expectedTimes", () => {
            const mockedCall = new MockedCall("m", [1]);
            assertThat(mockedCall.times(0), mockedCall);
            assertThat(mockedCall.didRun([1]).isSome, false);
        });

        it("Fails as args don't match due to length difference", () => {
            const mockedCall = new MockedCall("m", [1]);
            assertThat(mockedCall.didRun([]).isSome, false);
        });

        it("Fails as args don't match due to args difference", () => {
            const mockedCall = new MockedCall("m", [1]);
            assertThat(mockedCall.didRun([2]).isSome, false);
        });

        it("Suceeds on first call but not second", () => {
            const mockedCall = new MockedCall("m", [1]);
            mockedCall.returns(f);
            assertThat(mockedCall.didRun([1]).isSome, true);
            assertThat(mockedCall.didRun([1]).isSome, false); // as only 1 times
            console.debug({successfulCalls: JSON.stringify(mockedCall.successfulCalls)}); // todo Turn into a test with DiffMatch
        });
    });
});


function f() {
    return 3;
}