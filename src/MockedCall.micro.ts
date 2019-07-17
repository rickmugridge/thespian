import {MockedCall} from "./MockedCall";
import {expect} from "./Mockery.micro";

describe("MockedCall()", () => {
    it("initially", () => {
        const mockedCall = new MockedCall("m", [1]);
        expect(mockedCall.expectedTimes, 1);
        expect(mockedCall.actualTimes, 0);
    });

    it("After returns()", () => {
        const mockedCall = new MockedCall("m", [1]);
        expect(mockedCall.returns(f), mockedCall);
        expect(mockedCall.returnFn, f);
        expect(mockedCall.expectedTimes, 1);
        expect(mockedCall.actualTimes, 0);
    });

    it("After times()", () => {
        const mockedCall = new MockedCall("m", [1]);
        expect(mockedCall.times(5), mockedCall);
        expect(mockedCall.expectedTimes, 5);
        expect(mockedCall.actualTimes, 0);
    });

    describe("didRun()",()=>{
        it("Fails as actualTimes === expectedTimes", () => {
            const mockedCall = new MockedCall("m", [1]);
            expect(mockedCall.times(0), mockedCall);
            expect(mockedCall.didRun([1]), false);
        });
        it("Fails as args don't match due to length difference", () => {
            const mockedCall = new MockedCall("m", [1]);
            expect(mockedCall.didRun([]), false);
        });
        it("Fails as args don't match due to args difference", () => {
            const mockedCall = new MockedCall("m", [1]);
            expect(mockedCall.didRun([2]), false);
        });
        it("Fails as args don't match due to args difference", () => {
            const mockedCall = new MockedCall("m", [1]);
            expect(mockedCall.didRun([1]), true);
            expect(mockedCall.didRun([1]), false); // as only 1 times
        });
    });
});


function f() {
    return 3;
}