import {MockHandler} from "./MockHandler";
import {assertThat} from "mismatched/dist/src/assertThat";
import {match} from "mismatched/dist/src/match";
import {MockHandlerFixture} from "./MockHandlerFixture";
import {Thespian} from "./Thespian";

const methodName = "method";
const fnName = "";

describe('MockHandler()', () => {
    it("Call on an unknown method", () => {
        const handler = new MockHandler("thespian", []);
        assertThat(() =>
            handler.get(undefined, methodName, undefined)).throws(match.any());
    });

    describe('method:', () => {
        it22("Call known method with a single MockedCall, with undefined result", fixture => {
            fixture.makeMock(methodName, [match.any()])
                .returns(a => a);
            const fn = fixture.getMock(methodName);
            assertThat(fn(5)).is(5);
            assertThat(fixture.successes()).is([{
                name: "thespian.method()", actualArgs: [5], returnValue: 5,
                expectedTimes: 1
            }]);
        });

        it22("Call known method with a single MockedCall, with specified result", fixture => {
            fixture.makeMock(methodName, [1])
                .returns(() => 456);
            const fn = fixture.getMock(methodName);
            assertThat(fn(1)).is(456);
            assertThat(fixture.successes()).is([{
                name: "thespian.method()", actualArgs: [1], returnValue: 456,
                expectedTimes: 1
            }]);
        });

        it22("Call known method with a single MockedCall, but doesn't match", fixture => {
            fixture.makeMock(methodName, [1])
                .returns(() => 456);
            const fn = fixture.getMock(methodName);
            assertThat(() => fn(2)).throws(match.any());
            assertThat(fixture.successes()).is([]);
        });

        it22("Call known method with a 2 MockedCall2, with one matching", fixture => {
            fixture.makeMock(methodName, [1, 2])
                .returns(() => 456);
            fixture.makeMock(methodName, [2, 3])
                .returns(() => 789);
            const fn = fixture.getMock(methodName);
            assertThat(fn(1, 2)).is(456);
            assertThat(fn(2, 3)).is(789);
            assertThat(fixture.successes()).is([
                {name: "thespian.method()", actualArgs: [1, 2], returnValue: 456, expectedTimes: 1},
                {name: "thespian.method()", actualArgs: [2, 3], returnValue: 789, expectedTimes: 1}
            ]);
        });
    });

    describe('function:', () => {
        it22("Call known function with no match", fixture => {
            fixture.makeMock(fnName, [1])
                .returns(() => 5);
            const fn = fixture.getMock(fnName);
            assertThat(() => fn("a")).throws(match.any());
            assertThat(fixture.successes()).is([]);
        });

        it22("Call known function with a match", fixture => {
            const mockedCall = fixture.makeMock(fnName, [1])
                .returns(() => 456);
            const fn = fixture.getMock(fnName);
            assertThat(fn(1)).is(456);
            assertThat(fixture.successes()).is([
                {name: "thespian()", actualArgs: [1], returnValue: 456, expectedTimes: 1}
            ]);
        });
    });

    it22("symbolForMockToString", fixture => {
        fixture.makeMock(methodName, [1])
            .returns(() => 5);
        const fn = fixture.getMock(Thespian.symbolForMockToString);
        assertThat(fn()).is("Mock(thespian)");
    });
});

function it22(name: string, fn: (fixture: MockHandlerFixture) => any) {
    const fixture = new MockHandlerFixture();
    it(name, () => fn(fixture));
}