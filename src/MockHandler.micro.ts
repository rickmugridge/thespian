import {MockHandler} from "./MockHandler";
import {assertThat} from "mismatched/dist/src/assertThat";
import {match} from "mismatched/dist/src/match";
import {MockHandlerFixture} from "./MockHandlerFixture";
import {Thespian} from "./Thespian";
import {createPseudoCall} from "./SuccessfulCall";

const methodName = "method";
const fnName = "";

describe('MockHandler()', () => {
    it("Call on an unknown method", () => {
        const handler = new MockHandler("thespian", []);
        assertThat(() =>
            handler.get(undefined, methodName, undefined)(12)).throwsError(`{
  problem: "Unable to handle call or access property, as it has not been mocked", 
  mockCall: thespian.method()
}`);
    });

    describe('method:', () => {
        it("Call known method with a single MockedCall, with undefined result", () => {
            const fixture = new MockHandlerFixture();
            fixture.makeMock(methodName, [match.any()])
                .returns(a => a);
            const fn = fixture.getMock(methodName);
            assertThat(fn(5)).is(5);
            assertThat(fixture.successes()).is([{
                call: createPseudoCall("thespian.method", [5]),
                returnValue: 5, expectedTimes: 1
            } as any]);
        });

        it("Call known method with a single MockedCall, with specified result", () => {
            const fixture = new MockHandlerFixture();
            fixture.makeMock(methodName, [1])
                .returns(() => 456);
            const fn = fixture.getMock(methodName);
            assertThat(fn(1)).is(456);
            assertThat(fixture.successes()).is([{
                call: createPseudoCall("thespian.method", [1]),
                returnValue: 456, expectedTimes: 1
            } as any]);
        });

        it("Call known method with a single MockedCall, but doesn't match", () => {
            const fixture = new MockHandlerFixture();
            fixture.makeMock(methodName, [1])
                .returns(() => 456);
            const fn = fixture.getMock(methodName);
            assertThat(() => fn(2)).throws(match.any());
            assertThat(fixture.successes()).is([]);
        });

        it("Call known method with a 2 MockedCall2, with one matching", () => {
            const fixture = new MockHandlerFixture();
            fixture.makeMock(methodName, [1, 2])
                .returns(() => 456);
            fixture.makeMock(methodName, [2, 3])
                .returns(() => 789);
            const fn = fixture.getMock(methodName);
            assertThat(fn(1, 2)).is(456);
            assertThat(fn(2, 3)).is(789);
            assertThat(fixture.successes()).is([
                {call: createPseudoCall("thespian.method", [1, 2]), returnValue: 456, expectedTimes: 1} as any,
                {call: createPseudoCall("thespian.method", [2, 3]), returnValue: 789, expectedTimes: 1} as any
            ]);
        });
    });

    describe('function:', () => {
        it("Call known function with no match", () => {
            const fixture = new MockHandlerFixture();
            fixture.makeMock(fnName, [1])
                .returns(() => 5);
            const fn = fixture.getMock(fnName);
            assertThat(() => fn("a")).throws(match.any());
            assertThat(fixture.successes()).is([]);
        });

        it("Call known function with a match", () => {
            const fixture = new MockHandlerFixture();
            fixture.makeMock(fnName, [1])
                .returns(() => 456);
            const fn = fixture.getMock(fnName);
            assertThat(fn(1)).is(456);
            assertThat(fixture.successes()).is([
                {
                    call: createPseudoCall("thespian", [1]),
                    returnValue: 456, expectedTimes: 1
                } as any
            ]);
        });
    });

    it("symbolForMockToString", () => {
        const fixture = new MockHandlerFixture();
        fixture.makeMock(methodName, [1])
            .returns(() => 5);
        const fn = fixture.getMock(Thespian.symbolForMockToString);
        assertThat(fn()).is("thespian");
    });
});

